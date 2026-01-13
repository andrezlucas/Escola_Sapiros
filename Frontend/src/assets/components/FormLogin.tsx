import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import ValidarCpf from "../utils/ValidarCpf";
import ValidarEmail from "../utils/ValidarEmail";
import { Checkbox } from "./Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { MaskCPF } from "../utils/MaskCPF";

type LoginFormData = {
  identificador: string;
  senha: string;
};

function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>();

  const navigate = useNavigate();

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState<string[]>(Array(6).fill(""));
  const [identificadorGlobal, setIdentificadorGlobal] = useState("");
  const [senhaGlobal, setSenhaGlobal] = useState("");

  const validarIdentificador = (valor: string) => {
    const valorSemMascara = valor.replace(/\D/g, "");

    if (ValidarEmail(valor)) return true;
    if (ValidarCpf(valorSemMascara)) return true;
    if (/^(25|2025)\d{2,}$/.test(valorSemMascara)) return true;

    return "Digite um CPF, e-mail ou matrícula válida";
  };

  async function loginRequest(payload: any) {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Erro ao fazer login");
    }

    return result;
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    let identificadorFinal = data.identificador;
    if (!identificadorFinal.includes("@")) {
      identificadorFinal = identificadorFinal.replace(/\D/g, "");
    }

    try {
      const result = await loginRequest({
        identificador: identificadorFinal,
        senha: data.senha,
      });

      if (result.requires2FA) {
        setRequires2FA(true);
        setIdentificadorGlobal(identificadorFinal);
        setSenhaGlobal(data.senha);
        toast.info(result.message);
        return;
      }

      finalizarLogin(result);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit2FA = async () => {
    const codigo = codigo2FA.join("");

    if (codigo.length !== 6) {
      toast.error("Digite os 6 dígitos do código");
      return;
    }

    setLoading(true);

    try {
      const result = await loginRequest({
        identificador: identificadorGlobal,
        senha: senhaGlobal,
        codigo2fa: codigo,
      });

      console.log("RESPOSTA FINAL DO LOGIN:", result);

      finalizarLogin(result);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  function finalizarLogin(result: any) {
    if (!result.usuario) {
      toast.error("Erro ao finalizar login");
      return;
    }

    localStorage.setItem("token", result.accessToken);
    localStorage.setItem("role", result.usuario.role);
    localStorage.setItem("nome", result.usuario.nome);

    if (result.usuario.role === "aluno" && result.usuario.turmaId) {
      localStorage.setItem("turmaId", result.usuario.turmaId);
    }

    navigate(`/dashboard/${result.usuario.role.toLowerCase()}`);
  }

  const handleCodigoChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const novoCodigo = [...codigo2FA];
    novoCodigo[index] = value;
    setCodigo2FA(novoCodigo);

    if (value && index < 5) {
      const next = document.getElementById(`codigo-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!requires2FA && (
        <>
          <Input
            label="CPF/E-mail/Matrícula"
            placeholder="Digite seu CPF, e-mail ou matrícula"
            icon={<FaUser />}
            {...register("identificador", {
              required: "CPF, e-mail ou matrícula é obrigatório",
              validate: { validarIdentificador },
              onChange: (e) => {
                let value = e.target.value;

                if (/[a-zA-Z@]/.test(value)) {
                  setValue("identificador", value);
                  return;
                }

                const somenteNumeros = value.replace(/\D/g, "");

                if (/^(25|2025)/.test(somenteNumeros)) {
                  setValue("identificador", somenteNumeros);
                  return;
                }

                setValue("identificador", MaskCPF(value));
              },
            })}
            error={errors?.identificador?.message}
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              icon={<FaLock />}
              {...register("senha", {
                required: "Senha é obrigatória",
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
              })}
              error={errors?.senha?.message}
            />

            <button
              type="button"
              className="absolute right-3 bottom-4 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Checkbox
              label="Lembrar"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <Link
              to="/redefinir-senha"
              className="text-[#1D5D7F] hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </>
      )}

      {requires2FA && (
        <div className="space-y-6">
          <p className="text-center font-medium">
            Digite o código do autenticador
          </p>

          <div className="flex justify-center gap-2">
            {codigo2FA.map((digito, index) => (
              <input
                key={index}
                id={`codigo-${index}`}
                type="text"
                maxLength={1}
                value={digito}
                onChange={(e) => handleCodigoChange(index, e.target.value)}
                className="w-12 h-14 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
              />
            ))}
          </div>

          <Button onClick={onSubmit2FA} disabled={loading}>
            {loading ? "Verificando..." : "Confirmar código"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setRequires2FA(false);
              setCodigo2FA(Array(6).fill(""));
            }}
          >
            Voltar
          </Button>
        </div>
      )}
    </form>
  );
}

export default FormLogin;

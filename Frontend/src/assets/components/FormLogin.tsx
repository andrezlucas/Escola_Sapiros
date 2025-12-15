import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import ValidarCpf from "../utils/ValidarCpf";
import ValidarEmail from "../utils/ValidarEmail";
import { Checkbox } from "./Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { ToastContainer, toast } from "react-toastify";
import { MaskCPF } from "../utils/MaskCPF";

function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validarIdentificador = (valor: string) => {
    const valorSemMascara = valor.replace(/\D/g, "");

    if (ValidarEmail(valor)) return true;

    if (ValidarCpf(valorSemMascara)) return true;

    if (/^(25|2025)\d{2,}$/.test(valorSemMascara)) return true;

    return "Digite um CPF, e-mail ou matrícula válida";
  };

  const onSubmit = async (data: any) => {
    setLoading(true);

    let identificadorFinal = data.identificador;

    if (!identificadorFinal.includes("@")) {
      identificadorFinal = identificadorFinal.replace(/\D/g, "");
    }

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identificador: identificadorFinal,
          senha: data.senha,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const msg = result.message;

        if (msg?.includes("Senha temporária")) {
          toast.info("Enviamos um e-mail para redefinir sua senha.");
          navigate("/senha-bloqueada");
          return;
        }

        if (msg?.toLowerCase().includes("senha expirou")) {
          toast.info("Sua senha expirou. Redefina para continuar.");
          navigate("/senha-bloqueada");
          return;
        }

        if (msg === "Usuário não encontrado") {
          toast.error("Usuário não encontrado");
        }
        if (msg === "Senha incorreta") {
          toast.error("Senha incorreta");
        } else {
          toast.error(msg || "Erro ao fazer login");
        }
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.usuario.role);
      localStorage.setItem("nome", result.usuario.nome);

      const token = localStorage.getItem("token")
      console.log(token);
      const role = result.usuario.role?.toLowerCase().trim();
      switch (role) {
        case "coordenacao":
          navigate("dashboard/coordenacao");
          break;
        case "aluno":
          navigate("dashboard/aluno");
          break;
        case "professor":
          navigate("");
          break;
        default:
          toast.error("Role desconhecido");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast.error(
        "Não foi possível conectar ao servidor. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            const mask = MaskCPF(value);
            setValue("identificador", mask);
          },
        })}
        error={errors?.identificador?.message as string}
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
          error={errors?.senha?.message as string}
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
          to={"/redefinir-senha"}
          className="text-[#1D5D7F] text-base font-normal hover:underline"
        >
          Esqueceu a senha?
        </Link>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
    </form>
  );
}

export default FormLogin;

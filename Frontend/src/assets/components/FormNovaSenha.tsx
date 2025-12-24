import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button } from "./Button";
import { ToastContainer, toast } from "react-toastify/unstyled";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function FormNovaSenha() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const token = searchParams.get("token");

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error("Token inválido ou ausente!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/nova-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          senha: data.senha,
          confirmarSenha: data.confirmarSenha,
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        toast.error(erro.message || "Erro ao redefinir senha");
        return;
      }

      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error("Erro de conexão com o servidor");
    }
  };

  const watchSenha = watch("senha");

  const hasErros = !!errors.senha;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div className="relative">
        <Input
          label="Nova senha"
          type={showPassword ? "text" : "password"}
          placeholder="Nova senha"
          icon={<FaLock />}
          {...register("senha", {
            required: "Senha é obrigatória",
            minLength: { value: 8, message: "Mínimo 8 caracteres" },
          })}
          error={errors?.senha?.message as string}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 bottom-4 text-gray-600"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirmar senha"
          type={showConfirmarSenha ? "text" : "password"}
          placeholder="Confirmar senha"
          icon={<FaLock />}
          {...register("confirmarSenha", {
            required: "Confirmação obrigatória",
            validate: (value) =>
              value === watchSenha || "As senhas não coincidem",
          })}
          error={errors?.confirmarSenha?.message as string}
        />

        <button
          type="button"
          onClick={() => setShowConfirmarSenha((prev) => !prev)}
          className="absolute right-3 bottom-4 text-gray-600"
        >
          {showConfirmarSenha ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>

      <Button type="submit" disabled={hasErros}>
        <p>Redefinir senha</p>
      </Button>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </form>
  );
}

export default FormNovaSenha;

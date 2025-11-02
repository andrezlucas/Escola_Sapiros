import { useForm } from "react-hook-form";
import ValidarCpf from "../utils/ValidarCpf";
import LogoSapiros from "../imagens/logo.sapiros.png";
import LogoIlustracao from "../imagens/logo.ilustracao.login.png";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

import { useState } from "react";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      console.log("Dados enviados: ", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-l from-indigo-800 to-green-500 items-center justify-center p-4 relative">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-5xl w-full flex flex-col lg:flex-row overflow-hidden">
        <div className="hidden lg:flex flex-col items-center justify-center p-6 lg:w-[48%]">
          <img
            className="w-full max-w-sm mb-4 h-auto"
            src={LogoIlustracao}
            alt="Ilustração de Login"
          />
          <div className="w-40 h-1 bg-green-500 rounded-full"></div>
        </div>

        <div className="hidden lg:flex lg:w-[4%] items-center justify-center">
          <div className="w-1 h-full bg-blue-900 rounded-full"></div>
        </div>

        <div className="flex flex-col justify-center p-0 lg:p-6 lg:w-[48%]">
          <div className="flex justify-center mb-8">
            <img
              className="w-28 md:w-32 lg:w-40 h-auto"
              src={LogoSapiros}
              alt="Logo Sapiros"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold text-blue-900 mb-2">
            Login
          </h2>
          <div className="w-12 h-1 bg-green-500 rounded-full mb-8 sm:mb-10"></div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="CPF/Matrícula"
              placeholder="Digite seu CPF"
              icon={<FaUser />}
              {...register("cpf", {
                required: "CPF é obrigatório",
                validate: (value) =>
                  ValidarCpf(value) === true || "CPF inválido",
              })}
              error={errors?.cpf?.message as string}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              icon={<FaLock />}
              {...register("password", {
                required: "Senha é obrigatória",
                minLength: { value: 8, message: "Mínimo 8 caracteres" },
              })}
              error={errors?.password?.message as string}
            />

            <div className="flex justify-between items-center pt-2">
              <Checkbox
                label="Lembrar"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />

              <Link
                to={"/redefinir-senha"}
                className="text-green-600 text-base font-normal hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" disabled={loading || hasErrors}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

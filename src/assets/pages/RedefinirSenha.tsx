import { useForm } from "react-hook-form";
import LogoSapiros from "../imagens/logo.sapiros.png";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

function RedefinirSenha() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log("Email enviado:", data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-l from-indigo-800 to-green-500 items-center justify-center p-4 relative">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-5xl w-full flex flex-col items-center">
        <div className="flex flex-col justify-center w-full">
          <div className="flex justify-center mb-8">
            <img
              className="w-28 md:w-32 lg:w-40 h-auto"
              src={LogoSapiros}
              alt="Logo Sapiros"
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <Input
              label={"Email"}
              placeholder="seuemail@gmail.com"
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "digite um email válido",
                },
              })}
              error={errors?.email?.message as string}
            />
            <Button type="submit">
              <p>Enviar link de redefinição</p>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;

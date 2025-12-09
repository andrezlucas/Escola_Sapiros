import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { GradienteLayout } from "../layouts/GradienteLayout";
import LogoCentralizada from "../layouts/LogoCentralizada";

function SenhaBloqueada() {
  return (
    <GradienteLayout>
      <Card>
        <div className="flex flex-col justify-center w-full">
          <LogoCentralizada />
          <h1 className="text-center">
            Enviamos um e-mail para redefinir sua senha.
          </h1>
          <Link
            to="/"
            className="text-sm text-[#37ADED] hover:underline text-center mt-4"
          >
            Voltar para o login
          </Link>
        </div>
      </Card>
    </GradienteLayout>
  );
}

export default SenhaBloqueada;

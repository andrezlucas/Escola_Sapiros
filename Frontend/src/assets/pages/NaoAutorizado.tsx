import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { GradienteLayout } from "../layouts/GradienteLayout";
import LogoCentralizada from "../layouts/LogoCentralizada";

function NaoAutorizado() {
  return (
    <GradienteLayout>
      <Card>
        <div className="flex flex-col justify-center items-center w-full gap-4">
          <LogoCentralizada />

          <h1 className="text-xl font-semibold text-center text-[#1D5D7F]">
            Acesso não autorizado
          </h1>

          <p className="text-center text-gray-600 text-sm max-w-sm">
            Você não tem permissão para acessar esta página.
          </p>

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

export default NaoAutorizado;

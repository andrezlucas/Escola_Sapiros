import type { ResumoSimulados } from "../pages/DashboardAluno";

type Props = {
  resumo: ResumoSimulados;
};

function CardPreparacaoVestibular({ resumo }: Props) {
  return (
    <div className="bg-white rounded-xl  p-5 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-lg text-[#1D5D7F]">
          Preparação Vestibular
        </h2>
        <p className="text-sm text-gray-500">Média dos simulados</p>

        <p className="text-3xl font-bold mt-2 text-gray-800">
          {resumo.mediaGeral} <span className="text-base">pts</span>
        </p>
      </div>

      <div className="bg-[#EEF6FB] rounded-xl px-6 py-4 text-center">
        <p className="text-sm text-gray-500">Último Simulado</p>
        <p className="text-2xl font-bold text-[#1D5D7F]">
          {resumo.ultimoSimulado}
        </p>
        <p className="text-xs text-gray-500">
          {resumo.simuladosRealizados} realizado(s)
        </p>
      </div>
    </div>
  );
}

export default CardPreparacaoVestibular;

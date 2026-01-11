import type { NotaDashboard } from "../pages/DashboardAluno";

type Props = {
  notas: NotaDashboard[];
};

export function CardDesempenhoAcademico({ notas }: Props) {
  const TOTAL_AULAS = 100;

  const calcularFrequenciaPercentual = (faltas: number) => {
    return ((TOTAL_AULAS - faltas) / TOTAL_AULAS) * 100;
  };

  const getStatusColor = (media: number, frequencia: number) => {
    if (media >= 7 && frequencia >= 75) return "bg-green-500";
    if (media >= 6 && frequencia >= 60) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl  p-5">
      <h2 className="font-bold text-lg text-[#1D5D7F] mb-4">
        Desempenho Acadêmico
      </h2>

      <div className="grid grid-cols-4 text-sm text-gray-500 mb-2">
        <span>Disciplina</span>
        <span className="text-center">Média</span>
        <span className="text-center">Frequência</span>
        <span className="text-center">Status</span>
      </div>

      <div className="space-y-3">
        {notas.map((n) => {
          const frequenciaPercentual = calcularFrequenciaPercentual(n.faltas);
          const statusColor = getStatusColor(
            n.mediaFinal,
            frequenciaPercentual
          );

          return (
            <div
              key={n.disciplina}
              className="grid grid-cols-4 items-center text-sm"
            >
              <span className="font-medium text-gray-800">{n.disciplina}</span>

              <span
                className={`text-center font-semibold ${
                  n.mediaFinal < 6 ? "text-red-500" : "text-gray-800"
                }`}
              >
                {n.mediaFinal.toFixed(1)}
              </span>

              <span
                className={`text-center ${
                  frequenciaPercentual < 75 ? "text-red-500" : "text-gray-800"
                }`}
              >
                {frequenciaPercentual.toFixed(0)}%
              </span>

              <div className="flex justify-center">
                <span
                  className={`w-3 h-3 rounded-full ${statusColor}`}
                  title={`Média: ${
                    n.mediaFinal
                  } | Frequência: ${frequenciaPercentual.toFixed(0)}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

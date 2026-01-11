import type { Habilidade } from "../pages/DashboardAluno";

type Props = {
  habilidades: Habilidade[];
  onVerTodas: () => void;
};

function CardHabilidade({ habilidades, onVerTodas }: Props) {
  const getBarColorClass = (percentual: number) => {
    if (percentual >= 80) return "bg-green-500";
    if (percentual >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl  p-5">
      <h2 className="font-bold text-lg text-[#1D5D7F] mb-4">
        Minhas Habilidades
      </h2>

      <div className="space-y-4">
        {habilidades.map((h) => (
          <div key={h.habilidade}>
            <div className="flex justify-between text-sm mb-1">
              <span>{h.habilidade}</span>
              <span>{h.percentual}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className={`${getBarColorClass(
                  h.percentual
                )} h-full rounded-full`}
                style={{ width: `${h.percentual}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onVerTodas}
          className="text-sm text-[#1D5D7F] font-semibold hover:underline"
        >
          Ver todas →
        </button>
      </div>
    </div>
  );
}

export default CardHabilidade;

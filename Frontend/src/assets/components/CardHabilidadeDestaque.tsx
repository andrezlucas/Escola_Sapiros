import { useState, useEffect } from "react";

interface HabilidadeDestaque {
  habilidade: string;
  media: number;
  status: "CRITICO" | "ATENCAO" | string;
}

interface CardHabilidadeDestaqueProps {
  onVerRelatorio?: () => void;
}

const CardHabilidadeDestaque = ({
  onVerRelatorio,
}: CardHabilidadeDestaqueProps) => {
  const [habilidades, setHabilidades] = useState<HabilidadeDestaque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHabilidades = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:3000/turmas/dashboard/professor/habilidades-destaque",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data: HabilidadeDestaque[] = await response.json();
        setHabilidades(data);
      } catch (error) {
        console.error("Falha ao carregar habilidades em destaque:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabilidades();
  }, []);

  const getCorBarra = (status: string) => {
    switch (status.toUpperCase()) {
      case "CRITICO":
        return "bg-red-600";
      case "ATENCAO":
        return "bg-orange-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getCorTexto = (status: string) => {
    switch (status.toUpperCase()) {
      case "CRITICO":
        return "text-red-700 font-bold";
      case "ATENCAO":
        return "text-orange-700 font-bold";
      default:
        return "text-green-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-6 flex flex-col gap-5 ">
      <h3 className="text-xl font-bold text-[#1D5D7F]">
        Habilidades em Destaque
      </h3>
      <p className="text-sm text-gray-600">
        Pontos de Atenção - Habilidades com menor desempenho
      </p>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Carregando...
        </div>
      ) : habilidades.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Nenhuma habilidade em destaque no momento
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {habilidades.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">
                  {item.habilidade}
                </span>
                <span className={`text-sm ${getCorTexto(item.status)}`}>
                  {item.media}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${getCorBarra(
                    item.status
                  )}`}
                  style={{ width: `${item.media}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="mt-4 w-full py-3 bg-[#1D5D7F] text-white font-medium rounded-lg hover:bg-[#164c68] transition-colors"
        onClick={onVerRelatorio}
      >
        Ver Relatório Completo
      </button>
    </div>
  );
};

export default CardHabilidadeDestaque;

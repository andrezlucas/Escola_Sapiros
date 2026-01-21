import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Habilidade {
  habilidade: string;
  media: number;
  status: "BOM" | "ATENCAO" | "CRITICO";
}

interface Props {
  turmaId?: string;
}

export function CardDesempenhoHabilidade({ turmaId }: Props) {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!turmaId) return;

    const fetchCompetencias = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const response = await fetch(
          `http://localhost:3000/turmas/${turmaId}/dashboard/competencias`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();
        setHabilidades(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar competências");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencias();
  }, [turmaId]);

  const sorted = [...habilidades].sort((a, b) => b.media - a.media);

  const chartData = {
    labels: sorted.map((h) => h.habilidade),
    datasets: [
      {
        label: "Média (%)",
        data: sorted.map((h) => h.media),
        backgroundColor: sorted.map((h) => {
          if (h.status === "BOM") return "#1D5D7F";
          if (h.status === "ATENCAO") return "#fbbf24";
          return "#1D5D7F";
        }),
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-6 flex flex-col gap-5 h-[360px] responsive-card-habilidade">
      <style>{`
        @media (max-width: 768px) {
          .responsive-card-habilidade {
            height: auto !important;
            min-height: 400px !important;
            padding: 1rem !important;
          }
          .responsive-card-habilidade h3 {
            font-size: 1.125rem !important;
            text-align: center !important;
          }
          .chart-container-mobile {
            height: 300px !important;
          }
        }
      `}</style>

      <h3 className="text-xl font-bold text-[#1D5D7F]">
        Desempenho por Habilidade da Turma
      </h3>

      <div className="flex-1 chart-container-mobile">
        {!turmaId && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecione uma turma para visualizar
          </div>
        )}

        {loading && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Carregando competências...
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && turmaId && habilidades.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Nenhuma competência encontrada
          </div>
        )}

        {!loading && habilidades.length > 0 && (
          <div className="h-full">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}

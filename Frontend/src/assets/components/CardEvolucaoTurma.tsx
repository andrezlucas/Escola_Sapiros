import type { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";

interface EvolucaoItem {
  semana: string;
  media: number;
}

interface EvolucaoData extends Array<EvolucaoItem> {}

export default function CardEvolucaoTurma({ turmaId }: { turmaId: string }) {
  const [dados, setDados] = useState<EvolucaoData>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvolucao = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) throw new Error("Token não encontrado");

        const response = await fetch(
          `http://localhost:3000/turmas/${turmaId}/dashboard/evolucao?periodo=semanal`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const data: EvolucaoData = await response.json();
        setDados(data);
      } catch (err: any) {
        setError(err.message || "Falha ao carregar evolução");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (turmaId) fetchEvolucao();
  }, [turmaId]);

  const chartOptions: ApexOptions = {
    chart: {
      id: "evolucao-turma",
      type: "line",
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: ["#1D5D7F"],
    xaxis: {
      categories: dados.map((item) => item.semana),
      labels: {
        rotate: -45,
        style: { fontSize: "12px", colors: "#1D5D7F" },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { fontSize: "12px", colors: "#1D5D7F" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: "11px", colors: ["#fff"] },
      background: {
        enabled: true,
        foreColor: "#1D5D7F",
        padding: 4,
        borderRadius: 4,
        borderWidth: 0,
        opacity: 0.9,
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val}%` },
    },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
    },
    markers: {
      size: 4,
      hover: { size: 6 },
    },
  };

  const series = [
    {
      name: "Média da Turma",
      data: dados.map((item) => item.media),
    },
  ];

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-4 sm:p-6 flex flex-col gap-4 h-auto sm:h-[360px]">
        <h3 className="text-lg sm:text-xl font-bold text-[#1D5D7F]">
          Evolução Semanal da Turma
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm sm:text-base">
          Carregando evolução...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-xl shadow-md border border-red-300 p-4 sm:p-6 text-red-600">
        Erro: {error}
      </div>
    );

  if (dados.length === 0)
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
        Sem dados para mostrar
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-4 sm:p-6 flex flex-col gap-4 h-auto sm:h-[360px] responsive-card-evolucao">
      <style>{`
        @media (max-width: 768px) {
          .responsive-card-evolucao {
            height: auto !important;
            padding: 1rem !important;
          }
          .responsive-card-evolucao h3 {
            font-size: 1.125rem !important;
            text-align: center !important;
          }
          .stats-grid-mobile {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          .chart-wrapper-mobile {
            min-height: 250px !important;
          }
        }
      `}</style>

      <h3 className="text-lg sm:text-xl font-bold text-[#1D5D7F]">
        Evolução Semanal da Turma
      </h3>

      <div className="w-full overflow-x-auto chart-wrapper-mobile">
        <div className="min-w-[300px]">
          <ApexCharts
            options={chartOptions}
            series={series}
            type="line"
            height={260}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 stats-grid-mobile">
        {dados.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-xs sm:text-sm text-[#1D5D7F]">
              {item.semana}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#1D5D7F]">
              {item.media}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

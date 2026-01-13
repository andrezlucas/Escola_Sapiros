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
          }
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
    colors: ["#1D5D7F", "#1D5D7F"],
    xaxis: {
      categories: dados.map((item) => item.semana),
      labels: {
        style: { fontSize: "13px", colors: "#1D5D7F" },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => `${val}%`,
        style: { fontSize: "13px", colors: "#1D5D7F" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      style: { fontSize: "13px", colors: ["#fff"] },
      background: {
        enabled: true,
        foreColor: "#1D5D7F",
        padding: 5,
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
      size: 5,
      hover: { size: 7 },
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
  
      <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-6 flex flex-col gap-5 h-[360px]">
        <h3 className="text-xl font-bold text-[#1D5D7F]">
        Evolução do Semanal da Turma
      </h3>
        <div className="h-full flex items-center justify-center text-gray-500">
          Carregando evolução...
        </div>
      </div>
    );
  if (error) return <div className="card p-6 text-red-600">Erro: {error}</div>;
  if (dados.length === 0)
    return <div className="card p-6">Sem dados para mostrar</div>;

  return (
    <div
      className="bg-white card rounded-xl shadow-md border border-[#1D5D7F]/20 p-6 flex flex-col gap-5
    h-[360px]"
    >
      <h3 className="text-xl font-bold text-[#1D5D7F]">
        Evolução do Semanal da Turma
      </h3>
      

      <div className="apex-chart-container">
        <ApexCharts
          options={chartOptions}
          series={series}
          type="line"
          height={300}
        />
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 -700">
        {dados.map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-[#1D5D7F] ">{item.semana}</div>
            <div className="text-2xl font-bold text-[#1D5D7F]">
              {item.media}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

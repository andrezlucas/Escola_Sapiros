import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

interface EvolucaoData {
  semana: string;
  media: number;
}

interface DesempenhoChartProps {
  turmaId: string | null;
}

const GraficoTurmaEvolucao: React.FC<DesempenhoChartProps> = ({ turmaId }) => {
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"semestral" | "trimestral">(
    "semestral"
  );

  useEffect(() => {
    const fetchEvolucao = async () => {
      if (!turmaId) {
        setLoading(false);
        setSeriesData([]);
        setCategories([]);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const url = `http://localhost:3000/turmas/${turmaId}/dashboard/evolucao?periodo=${periodo}`;

        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Erro ao carregar evolução: ${response.status}`);
        }

        const data: EvolucaoData[] = await response.json();

        const semanas = data.map((item) => item.semana);
        const medias = data.map((item) => item.media);

        setCategories(semanas);
        setSeriesData(medias);
      } catch (error) {
        console.error("Falha ao buscar dados de evolução:", error);
        setSeriesData([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvolucao();
  }, [turmaId, periodo]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: "evolucao-desempenho",
      height: 380,
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#1D5D7F"],
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 10,
        bottom: 20,
        left: 10,
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Semana",
        offsetY: 95,
        style: {
          color: "#4B5563",
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
        rotate: -45,
        rotateAlways: categories.length > 10,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 12,
      tickAmount: 6,
      labels: {
        formatter: (val: number) => val.toFixed(0),
        style: {
          colors: "#6B7280",
          fontSize: "13px",
        },
      },
    },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(1)}`,
      },
      x: {
        formatter: (val: string) => `Semana: ${val}`,
      },
    },
  };

  const series = [
    {
      name: "Média da Turma",
      data: seriesData,
    },
  ];

  return (
    <div className="w-full">
      {loading ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          Carregando evolução...
        </div>
      ) : seriesData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          Nenhum dado disponível para este período
        </div>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={380}
        />
      )}

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setPeriodo("semestral")}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
            periodo === "semestral"
              ? "bg-[#1D5D7F] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Semestral
        </button>
        <button
          onClick={() => setPeriodo("trimestral")}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
            periodo === "trimestral"
              ? "bg-[#1D5D7F] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Trimestral
        </button>
      </div>
    </div>
  );
};

export default GraficoTurmaEvolucao;

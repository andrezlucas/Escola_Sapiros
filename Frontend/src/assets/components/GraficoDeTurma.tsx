import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface TurmaGrafico {
  nomeTurma: string;
  totalAlunos: number;
  capacidadeMaxima: number;
}

interface Props {
  data: TurmaGrafico[];
}

export default function GraficoDesempenho({ data }: Props) {
  const series = [
    {
      name: "Alunos",
      data: data.map((t) => Number(t.totalAlunos)),
    },
    {
      name: "Capacidade",
      data: data.map((t) => Number(t.capacidadeMaxima)),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    xaxis: {
      categories: data.map((t) => t.nomeTurma),
      labels: {
        rotate: -45,
      },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const turma = data[dataPointIndex];
        const ocupacao = Math.round(
          (turma.totalAlunos / turma.capacidadeMaxima) * 100
        );

        return `
          <div style="padding:8px">
            <strong>${turma.nomeTurma}</strong><br/>
            Alunos: ${turma.totalAlunos} / ${turma.capacidadeMaxima}<br/>
            Ocupação: ${ocupacao}%
          </div>
        `;
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 6,
      },
    },
    colors: ["#3D7E8F", "#1D5D7F"],
  };

  return (
    <div className="w-full h-[260px] sm:h-full">
      <Chart options={options} series={series} type="bar" height="100%" />
    </div>
  );
}

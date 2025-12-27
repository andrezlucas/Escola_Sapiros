import ReactApexChart from "react-apexcharts";

interface IndicadorCircularProps {
  value: number;
  max?: number; 
  label: string;
}

export default function IndicadorCircular({
  value,
  max = 100,
  label,
}: IndicadorCircularProps) {
  const series = [value, Math.max(max - value, 0)];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    colors: ["#1D5D7F", "#E6E6E6"],
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
  };

  return (
    <div className="flex items-center space-x-4 p-2 ">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={80}
        width={80}
      />

      <div>
        <p className="text-xl font-semibold text-[#1D5D7F]">
          {value}
          {max === 100 ? "%" : ""}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

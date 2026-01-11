import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Tabela, { type Coluna } from "./Tabela";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Habilidade = {
  habilidade: string;
  percentual: number;
};

type NotaDisciplina = {
  disciplina: string;
  avaliacao1: number | null;
  avaliacao2: number | null;
  media: number;
  mediaAtividades?: number;
  mediaFinal?: number;
  bimestre?: number;
  faltas: number;
};

type DesempenhoDisciplina = {
  disciplina: string;
  media: number;
};

type HabilidadeDesenvolver = {
  habilidade: string;
  disciplina: string;
};

type ResumoGeral = {
  mediaGeral: number;
  frequencia: number;
};

function DesempenhoAluno() {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [notasDetalhadas, setNotasDetalhadas] = useState<NotaDisciplina[]>([]);
  const [desempenhoPorDisciplina, setDesempenhoPorDisciplina] = useState<
    DesempenhoDisciplina[]
  >([]);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [frequencia, setFrequencia] = useState(0);
  const [habilidadesADesenvolver, setHabilidadesADesenvolver] = useState<
    HabilidadeDesenvolver[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bimestreSelecionado, setBimestreSelecionado] = useState<
    number | undefined
  >(undefined);

  const carregarDados = async (bimestre?: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const baseUrl = "http://localhost:3000/alunos/dashboard";

      const query = bimestre ? `?bimestre=${bimestre}` : "";

      const [
        resResumo,
        resHabilidades,
        resDesenvolver,
        resNotas,
        resDisciplinas,
      ] = await Promise.all([
        fetch(`${baseUrl}/resumo${query}`, { headers }),
        fetch(`${baseUrl}/habilidades${query}`, { headers }),
        fetch(`${baseUrl}/habilidades-desenvolver${query}`, { headers }),
        fetch(`${baseUrl}/notas${query}`, { headers }),
        fetch(`${baseUrl}/disciplinas${query}`, { headers }),
      ]);

      if (
        !resResumo.ok ||
        !resHabilidades.ok ||
        !resDesenvolver.ok ||
        !resNotas.ok ||
        !resDisciplinas.ok
      ) {
        throw new Error("Falha ao carregar dados do servidor");
      }

      const resumoData: ResumoGeral = await resResumo.json();
      const habilidadesData: Habilidade[] = await resHabilidades.json();
      const desenvolverData: HabilidadeDesenvolver[] =
        await resDesenvolver.json();
      const notasData: NotaDisciplina[] = (await resNotas.json()) ?? []; // ← se null/undefined vira []
      setNotasDetalhadas(notasData);
      const disciplinasData: DesempenhoDisciplina[] =
        await resDisciplinas.json();

      setMediaGeral(resumoData.mediaGeral);
      setFrequencia(resumoData.frequencia);
      setHabilidades(habilidadesData);
      setHabilidadesADesenvolver(desenvolverData);
      setNotasDetalhadas(notasData);
      setDesempenhoPorDisciplina(disciplinasData);
    } catch (err: any) {
      console.error("Erro ao carregar desempenho:", err);
      setError(
        err.message || "Erro ao carregar os dados. Verifique sua conexão."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleBimestreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    const novoBimestre = valor === "todos" ? undefined : Number(valor);
    setBimestreSelecionado(novoBimestre);
    carregarDados(novoBimestre);
  };

  const chartData = {
    labels: desempenhoPorDisciplina.map((d) => d.disciplina),
    datasets: [
      {
        data: desempenhoPorDisciplina.map((d) => d.media),
        backgroundColor: "#22c1dc",
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 10 },
      x: { grid: { display: false } },
    },
  };

  const colunasNotas: Coluna<NotaDisciplina>[] = [
    { titulo: "Disciplina", render: (i) => i.disciplina },
    {
      titulo: "Avaliação 1",
      render: (i) => (i.avaliacao1 ? i.avaliacao1.toFixed(1) : "-"),
    },
    {
      titulo: "Avaliação 2",
      render: (i) => (i.avaliacao2 ? i.avaliacao2.toFixed(1) : "-"),
    },
    {
      titulo: "Média",
      render: (i) => (
        <span className="font-semibold text-cyan-600">
          {i?.mediaFinal != null
            ? i.mediaFinal.toFixed(2)
            : i?.media != null
            ? i.media.toFixed(2)
            : "-"}
        </span>
      ),
    },
    { titulo: "Faltas", render: (i) => i.faltas },
  ];

  const getBarColorClass = (percentual: number) => {
    if (percentual >= 80) return "bg-green-500";
    if (percentual >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando desempenho...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-normal text-[#1D5D7F]">Desempenho</h1>

          <div className="flex items-center gap-3">
            <label className="text-[#1D5D7F] font-medium">
              Filtrar por bimestre:
            </label>
            <select
              value={bimestreSelecionado ?? "todos"}
              onChange={handleBimestreChange}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-[#1D5D7F] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="todos">Todos os bimestres</option>
              <option value="1">1º Bimestre</option>
              <option value="2">2º Bimestre</option>
              <option value="3">3º Bimestre</option>
              <option value="4">4º Bimestre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <div
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: "rgba(51,51,51,0.5)" }}
            >
              <h2 className="font-poppins font-bold text-lg text-[#1D5D7F]  mb-4">
                Desempenho por Habilidade
              </h2>
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {habilidades.map((h) => (
                  <div key={h.habilidade}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-poppins font-medium">
                        {h.habilidade}
                      </span>
                      <span
                        className={`font-poppins font-semibold ${
                          h.percentual < 70 ? "text-red-500" : ""
                        }`}
                      >
                        {h.percentual}%
                      </span>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full">
                      <div
                        className={`h-full ${getBarColorClass(
                          h.percentual
                        )} transition-all duration-500`}
                        style={{ width: `${h.percentual}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: "rgba(51,51,51,0.5)" }}
            >
              <h2 className="text-lg font-bold font-poppins text-[#1D5D7F] mb-3">
                Notas detalhadas
              </h2>
              <p className="font-poppins font-normal text-[#1D5D7F]">
                Visualize suas notas por avaliação em cada disciplina
              </p>
              <div className="max-h-[350px] overflow-y-auto">
                <Tabela dados={notasDetalhadas} colunas={colunasNotas} />
              </div>
            </div>

            <div
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: "rgba(51,51,51,0.5)" }}
            >
              <h2 className="text-lg font-bold mb-4 font-poppins  text-[#1D5D7F]">
                Desempenho por Disciplina
              </h2>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: "rgba(51,51,51,0.5)" }}
            >
              <h3 className="text-lg font-bold mb-4 font-poppins text-[#1D5D7F]">
                Resumo Geral
              </h3>
              <div className="flex justify-between mb-4">
                <span className="font-poppins font-medium text-[#1D5D7F]">
                  Média Geral
                </span>
                <span className="text-cyan-600  font-poppins font-medium">
                  {mediaGeral}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-poppins font-medium text-[#1D5D7F]">
                  Frequência
                </span>
                <span
                  className={`font-poppins font-medium ${
                    frequencia < 75 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {frequencia}%
                </span>
              </div>
            </div>

            <div
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: "rgba(51,51,51,0.5)" }}
            >
              <h3 className="text-lg font-semibold mb-3">
                Habilidades a desenvolver
              </h3>
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {habilidadesADesenvolver.map((h) => (
                  <div
                    key={h.habilidade}
                    className="bg-orange-50 border border-orange-100 rounded-lg p-3"
                  >
                    <p className="font-semibold text-orange-700">
                      {h.habilidade}
                    </p>
                    <p className="text-sm text-orange-600">
                      Disciplina: {h.disciplina}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesempenhoAluno;

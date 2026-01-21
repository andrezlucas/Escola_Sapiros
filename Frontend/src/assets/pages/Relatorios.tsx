import type { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:3000";

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface HabilidadeRelatorio {
  habilidadeId: string;
  habilidade: string;
  descricao: string;
  percentual: number;
  cor: string;
}

interface ComparativoTurma {
  turma: string;
  percentual: number;
}

export default function Relatorios() {
  const [periodoLetivo, setPeriodoLetivo] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [turmaId, setTurmaId] = useState<string>(""); // "" = todas as turmas

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingListas, setLoadingListas] = useState(true);

  const [habilidades, setHabilidades] = useState<HabilidadeRelatorio[]>([]);
  const [comparativo, setComparativo] = useState<ComparativoTurma[]>([]);
  const [habilidadeSelecionadaId, setHabilidadeSelecionadaId] =
    useState<string>("");
  const [habilidadeNomeSelecionada, setHabilidadeNomeSelecionada] =
    useState<string>("");

  const [loadingHabilidades, setLoadingHabilidades] = useState(false);
  const [loadingComparativo, setLoadingComparativo] = useState(false);

  const bimestres = [
    "1º Bimestre",
    "2º Bimestre",
    "3º Bimestre",
    "4º Bimestre",
  ];

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar logado");
      return null;
    }
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  useEffect(() => {
    const fetchListas = async () => {
      setLoadingListas(true);
      try {
        const [resDisciplinas, resTurmas] = await Promise.all([
          authFetch(`${API_BASE}/disciplinas`),
          authFetch(`${API_BASE}/turmas`),
        ]);

        if (!resDisciplinas?.ok || !resTurmas?.ok) {
          throw new Error("Erro ao carregar listas");
        }

        const dataDisciplinas = await resDisciplinas.json();
        const dataTurmas = await resTurmas.json();

        setDisciplinas(dataDisciplinas);
        setTurmas([{ id: "", nome_turma: "Todas as turmas" }, ...dataTurmas]);
      } catch (err) {
        toast.error("Erro ao carregar disciplinas ou turmas");
      } finally {
        setLoadingListas(false);
      }
    };

    fetchListas();
  }, []);

  const aplicarFiltro = async () => {
    if (!disciplinaId) {
      toast.error("Selecione uma matéria");
      return;
    }
    if (!periodoLetivo) {
      toast.error("Selecione o bimestre");
      return;
    }

    setLoadingHabilidades(true);
    try {
      const params = new URLSearchParams({
        disciplinaId,
        bimestre: periodoLetivo,
        ...(turmaId && { turmaId }),
      });

      const res = await authFetch(
        `${API_BASE}/relatorios/performance/habilidades?${params}`,
      );

      if (!res?.ok) {
        const error = await res?.text();
        throw new Error(error || "Erro ao carregar relatório");
      }

      const data: HabilidadeRelatorio[] = await res.json();
      setHabilidades(data);

      if (data.length > 0) {
        const pior = data[0];
        setHabilidadeSelecionadaId(pior.habilidadeId);
        setHabilidadeNomeSelecionada(pior.habilidade);
      } else {
        setHabilidadeSelecionadaId("");
        setHabilidadeNomeSelecionada("");
        setComparativo([]);
      }

      toast.success("Relatório carregado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar relatório");
      setHabilidades([]);
    } finally {
      setLoadingHabilidades(false);
    }
  };

  useEffect(() => {
    if (!habilidadeSelecionadaId || !disciplinaId || !periodoLetivo) {
      setComparativo([]);
      return;
    }

    const carregarComparativo = async () => {
      setLoadingComparativo(true);
      try {
        const params = new URLSearchParams({
          disciplinaId,
          habilidadeId: habilidadeSelecionadaId,
          bimestre: periodoLetivo,
        });

        const res = await authFetch(
          `${API_BASE}/relatorios/performance/comparativo-turmas?${params}`,
        );

        if (!res?.ok) throw new Error("Erro ao carregar comparativo");

        const data: ComparativoTurma[] = await res.json();
        setComparativo(data);
      } catch (err: any) {
        toast.error("Erro ao carregar comparativo por turma");
        setComparativo([]);
      } finally {
        setLoadingComparativo(false);
      }
    };

    carregarComparativo();
  }, [habilidadeSelecionadaId, disciplinaId, periodoLetivo]);

  const series = [
    {
      name: habilidadeNomeSelecionada || "Desempenho",
      data: comparativo.map((c) => c.percentual),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 420,
      toolbar: { show: false },
      animations: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
      style: { fontSize: "14px", colors: ["#fff"] },
      background: { enabled: true, foreColor: "#000", borderRadius: 4 },
    },
    xaxis: {
      categories: comparativo.map((c) => c.turma),
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: { formatter: (val: any) => `${val}%` },
    },
    colors: ["#1D5D7F"],
    title: {
      text: `Desempenho em "${habilidadeNomeSelecionada}" por Turma`,
      align: "center",
      style: { fontSize: "18px", fontWeight: "bold", color: "#333" },
    },
    tooltip: { y: { formatter: (val: any) => `${val}%` } },
  };

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl text-[#1D5D7F]  md:font-normal">
          Relatórios de Desempenho por Habilidades
        </h1>
        <p className="text-[#333333] mt-2 text-sm md:text-base">
          Análise de performance acadêmica da escola.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-5">
          Filtro de Análise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período letivo
            </label>
            <select
              value={periodoLetivo}
              onChange={(e) => setPeriodoLetivo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white text-sm"
            >
              <option value="">Selecione</option>
              {bimestres.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disciplina
            </label>
            <select
              value={disciplinaId}
              onChange={(e) => setDisciplinaId(e.target.value)}
              disabled={loadingListas}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white text-sm"
            >
              <option value="">Selecione</option>
              {disciplinas.map((d) => (
                <option key={d.id_disciplina} value={d.id_disciplina}>
                  {d.nome_disciplina}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano/Série/Turma
            </label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              disabled={loadingListas}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white text-sm"
            >
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome_turma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={aplicarFiltro}
              className="w-full px-6 py-3 bg-[#1D5D7F] text-white font-medium rounded-md hover:bg-[#164a66] transition shadow-sm active:scale-95"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>
      </div>

      {loadingHabilidades ? (
        <div className="text-center py-16 text-gray-500 text-lg">
          Carregando relatório...
        </div>
      ) : habilidades.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-lg">
          Nenhum dado encontrado. Ajuste os filtros e tente novamente.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
              Desempenho por Habilidade
            </h2>
            <div className="space-y-5">
              {habilidades.map((hab) => (
                <div
                  key={hab.habilidadeId}
                  onClick={() => {
                    setHabilidadeSelecionadaId(hab.habilidadeId);
                    setHabilidadeNomeSelecionada(hab.habilidade);
                  }}
                  className={`cursor-pointer p-4 md:p-5 rounded-xl transition-all duration-300 border-2 ${
                    hab.habilidadeId === habilidadeSelecionadaId
                      ? "border-[#1D5D7F] bg-blue-50 shadow-lg"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg">
                      {hab.habilidade}
                    </h3>
                    <span className="text-xl md:text-2xl font-bold text-gray-700">
                      {hab.percentual}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 md:h-8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${hab.percentual}%`,
                        backgroundColor: hab.cor,
                      }}
                    />
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-4">
                    {hab.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
              Desempenho Comparativo por Turma
            </h2>
            {loadingComparativo ? (
              <div className="text-center py-16 text-gray-500">
                Carregando comparativo...
              </div>
            ) : comparativo.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Não há dados suficientes para comparar turmas nesta habilidade.
              </div>
            ) : (
              <div className="w-full h-[300px] md:h-[420px] overflow-x-auto">
                <div className="min-w-[300px] h-full">
                  <Chart
                    options={options}
                    series={series}
                    type="bar"
                    height="100%"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ResponderSimulado from "./ResponderSimulado";
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

type SimuladoDisponivel = {
  id: string;
  titulo: string;
  bimestre: string;
  dataInicio: string;
  dataFim: string;
  tempoDuracao: number;
  valorTotal: number;
  disciplina?: { nome_disciplina: string };
};

type HistoricoSimulado = {
  data: string;
  disciplina: string;
  nota: number;
};

export default function DesempenhoSimuladosAluno() {
  const [ultimaSimulado, setUltimaSimuladp] = useState(0);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [simuladosRealizados, setSimuladosRealizados] = useState(0);
  const [simuladoAberto, setSimuladoAberto] = useState<string | null>(null);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const [historicoCompleto, setHistoricoCompleto] = useState<
    HistoricoSimulado[]
  >([]);
  const [pagina, setPagina] = useState(1);

  const LIMITE_POR_PAGINA = 5;

  const [simuladosDisponiveis, setSimuladosDisponiveis] = useState<
    SimuladoDisponivel[]
  >([]);
  const [loadingDisponiveis, setLoadingDisponiveis] = useState(false);
  const [modalDisponiveisAberto, setModalDisponiveisAberto] = useState(false);

  const turmaId = localStorage.getItem("turmaId");

  const carregarSimuladosDisponiveis = async () => {
    if (!turmaId) {
      toast.error("Turma do aluno não encontrada");
      return;
    }

    setLoadingDisponiveis(true);
    try {
      const res = await fetch(
        `http://localhost:3000/simulados/turma/${turmaId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao carregar simulados");
      }

      const data = await res.json();

      const agora = new Date();

      const disponiveis = data.filter((sim: any) => {
        const inicio = new Date(sim.dataInicio);
        const fim = new Date(sim.dataFim);

        const noPrazo = agora >= inicio && agora <= fim;

        const ativo = sim.ativo === true;

        const naoRespondido = true;

        return noPrazo && ativo && naoRespondido;
      });

      setSimuladosDisponiveis(disponiveis);
    } catch (err: any) {
      console.error(err);
      toast.error("Não foi possível carregar os simulados disponíveis");
    } finally {
      setLoadingDisponiveis(false);
    }
  };

  const abrirModalDisponiveis = () => {
    carregarSimuladosDisponiveis();
    setModalDisponiveisAberto(true);
  };
  const [desempenhoVestibular, setDesempenhoVestibular] = useState<
    { disciplina: string; media: number }[]
  >([]);
  const dataGraficoVestibular = {
    labels: desempenhoVestibular.map((item) => item.disciplina),
    datasets: [
      {
        label: "Média por Disciplina",
        data: desempenhoVestibular.map((item) => item.media),
        backgroundColor: "#1D5D7F",
        borderRadius: 8,
        maxBarThickness: 50,
      },
    ],
  };

  const opcoesGraficoVestibular = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Nota: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1000,
        ticks: {
          stepSize: 100,
        },
      },
    },
  };

  const carregarDesempenhoVestibular = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/alunos/dashboard/simulados/desempenho",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao carregar desempenho do vestibular");
      }

      const data = await res.json();

      setDesempenhoVestibular(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar gráfico do vestibular");
    }
  };
  const carregarDesempenhoAluno = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/alunos/dashboard/simulados/resumo",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao carregar desempenho");
      }

      const data = await res.json();

      setUltimaSimuladp(data.ultimoSimulado ?? 0);
      setMediaGeral(data.mediaGeral ?? 0);
      setSimuladosRealizados(data.simuladosRealizados ?? 0);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar desempenho do aluno");
    }
  };

  const carregarHistoricoSimulados = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/alunos/dashboard/simulados/historico",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setHistoricoCompleto(data);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  useEffect(() => {
    carregarDesempenhoAluno();
    carregarDesempenhoVestibular();
    carregarHistoricoSimulados();
  }, []);

  const inicio = (pagina - 1) * LIMITE_POR_PAGINA;
  const fim = inicio + LIMITE_POR_PAGINA;

  const historicoPaginado = historicoCompleto.slice(inicio, fim);

  const totalPaginas = Math.ceil(historicoCompleto.length / LIMITE_POR_PAGINA);

  return (
    <div className="min-h-screen bg-gray-50 p-6 rounded-xl">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Preparação para Vestibular
        </h1>
        <p className="text-gray-600 mb-8">
          Acompanhe seu progresso e prepare-se para o sucesso.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Último Simulado
            </h3>
            <p className="text-4xl font-bold text-[#1D5D7F]">
              {ultimaSimulado.toFixed(1)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Média Geral
            </h3>
            <p className="text-4xl font-bold text-[#1D5D7F]">
              {mediaGeral.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Simulados Realizados
            </h3>
            <p className="text-4xl font-bold text-[#1D5D7F]">
              {simuladosRealizados}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Desempenho por Disciplina (Vestibular)
          </h2>

          <div className="h-64">
            {desempenhoVestibular.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
            ) : (
              <Bar
                data={dataGraficoVestibular}
                options={opcoesGraficoVestibular}
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Histórico de Simulados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nota Geral
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Disciplina
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historicoPaginado.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      Nenhum simulado encontrado
                    </td>
                  </tr>
                ) : (
                  historicoPaginado.map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        {new Date(item.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">{item.nota}</td>
                      <td className="px-6 py-4">{item.disciplina}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex justify-between items-center px-6 py-4">
              <button
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {pagina} de {totalPaginas || 1}
              </span>

              <button
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <button
            onClick={abrirModalDisponiveis}
            className="px-6 py-3 border border-[#1D5D7F] text-[#1D5D7F] rounded-lg hover:bg-[#1D5D7F] hover:text-white transition"
          >
            Disponível
          </button>
        </div>
      </div>

      {modalDisponiveisAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Simulados Disponíveis
              </h2>
              <button
                onClick={() => setModalDisponiveisAberto(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingDisponiveis ? (
              <p className="text-center text-gray-600">
                Carregando simulados...
              </p>
            ) : simuladosDisponiveis.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum simulado disponível no momento.
              </p>
            ) : (
              <div className="space-y-4">
                {simuladosDisponiveis.map((sim) => (
                  <div
                    key={sim.id}
                    className="border rounded-lg p-5 hover:border-[#1D5D7F] transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{sim.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {sim.disciplina?.nome_disciplina || "Disciplina"} •{" "}
                          {sim.bimestre}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#1D5D7F]">
                          {sim.valorTotal} pontos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {sim.tempoDuracao} min
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        Período:{" "}
                        {new Date(sim.dataInicio).toLocaleDateString("pt-BR")}{" "}
                        até {new Date(sim.dataFim).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => setSimuladoAberto(sim.id)}
                          className="px-5 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66] transition"
                        >
                          Iniciar Simulado
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalDisponiveisAberto(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {simuladoAberto && (
        <ResponderSimulado
          simuladoId={simuladoAberto}
          onClose={() => setSimuladoAberto(null)}
          onSimuladoFinalizado={() => {
            toast.success("Simulado finalizado!");
            setSimuladoAberto(null);
          }}
        />
      )}
    </div>
  );
}

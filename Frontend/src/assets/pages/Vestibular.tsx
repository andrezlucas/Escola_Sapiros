import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ResponderSimulado from "./ResponderSimulado";

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

export default function DesempenhoSimuladosAluno() {
  const [ultimaRedacao, setUltimaRedacao] = useState(0);
  const [mediaGeral, setMediaGeral] = useState(0);
  const [simuladosRealizados, setSimuladosRealizados] = useState(0);
  const [simuladoAberto, setSimuladoAberto] = useState<string | null>(null);

  const [historico] = useState([
    { data: "11 de Junho, 2024", notaGeral: 680.9 },
    { data: "24 de Agosto, 2024", notaGeral: 780.5 },
    { data: "4 de Outubro, 2024", notaGeral: 840.8 },
  ]);

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

  const desempenhoSemanal = [
    { dia: "Sun", valor: 45 },
    { dia: "Mon", valor: 85 },
    { dia: "Tue", valor: 65 },
    { dia: "Wed", valor: 120 },
    { dia: "Thu", valor: 70 },
    { dia: "Fri", valor: 95 },
    { dia: "Sat", valor: 50 },
  ];

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
              Última Redação
            </h3>
            <p className="text-4xl font-bold text-[#1D5D7F]"></p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Média Geral
            </h3>
            <p className="text-4xl font-bold text-[#1D5D7F]">
              {mediaGeral.toFixed(1)}
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
            Desempenho Geral
          </h2>
          <div className="flex justify-between items-end h-64">
            {desempenhoSemanal.map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className="w-10 bg-[#1D5D7F] rounded-t-md"
                  style={{ height: `${item.valor}%` }}
                />
                <span className="text-xs text-gray-600 mt-2">{item.dia}</span>
              </div>
            ))}
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
                    Nota Redação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historico.map((item, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.data}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.notaGeral.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#1D5D7F] hover:underline">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

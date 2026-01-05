import { useState, useEffect } from "react";
import Tabela, { type Coluna } from "./Tabela";
import { toast } from "react-toastify";

type Turma = { id: string; nome_turma: string };
type Disciplina = { id_disciplina: string; nome_disciplina: string };

type Aluno = {
  id: string;
  matriculaAluno: string;
  nome: string;
};

type FrequenciaBackend = {
  id: string;
  data: string;
  status: "presente" | "falta" | "falta_justificada";
  justificativa?: string | null;
  faltasNoPeriodo: number;
  aluno: { id: string; matriculaAluno: string; nome: string };
};

type LinhaTabela = {
  alunoId: string;
  matriculaAluno: string;
  nome: string;
  frequenciaId?: string;
  status: "presente" | "falta" | "falta_justificada";
  justificativa?: string | null;
  faltasNoPeriodo: number;
  presente: boolean;
};

const API_BASE = "http://localhost:3000";

export default function FrequenciaList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmaId, setTurmaId] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [dataSelecionada, setDataSelecionada] = useState<string>("");

  const [dadosTabela, setDadosTabela] = useState<LinhaTabela[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalJustificativaAberto, setModalJustificativaAberto] =
    useState(false);
  const [alunoParaJustificativa, setAlunoParaJustificativa] =
    useState<LinhaTabela | null>(null);
  const [justificativaTexto, setJustificativaTexto] = useState("");

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Usuário não autenticado. Faça login novamente.");
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
    const fetchInicial = async () => {
      try {
        const [resTurmas, resDisciplinas] = await Promise.all([
          authFetch(`${API_BASE}/professores/turmas`),
          authFetch(`${API_BASE}/professores/disciplinas`),
        ]);

        if (!resTurmas?.ok || !resDisciplinas?.ok)
          throw new Error("Erro ao carregar dados");

        const turmasData = await resTurmas.json();
        const disciplinasData = await resDisciplinas.json();

        setTurmas(turmasData);
        setDisciplinas(disciplinasData);
      } catch (err) {
        setError("Falha ao carregar turmas ou disciplinas.");
      }
    };

    fetchInicial();
  }, []);

  useEffect(() => {
    if (!turmaId || !disciplinaId || !dataSelecionada) {
      setDadosTabela([]);
      return;
    }

    const fetchDados = async () => {
      setLoading(true);
      setError(null);

      try {
        const resTurma = await authFetch(`${API_BASE}/turmas/${turmaId}`);
        if (!resTurma?.ok) throw new Error("Erro ao carregar turma");
        const turmaData = await resTurma.json();

        const alunosExtraidos: Aluno[] = (turmaData.alunos || []).map(
          (alunoObj: any) => ({
            id: alunoObj.id,
            matriculaAluno: alunoObj.matriculaAluno,
            nome: alunoObj.usuario?.nome || "Nome não disponível",
          })
        );

        const params = new URLSearchParams({
          turmaId,
          disciplinaId,
          dataInicio: dataSelecionada,
          dataFim: dataSelecionada,
        });

        const resFreq = await authFetch(`${API_BASE}/frequencias?${params}`);
        const frequenciasData: FrequenciaBackend[] = resFreq?.ok
          ? await resFreq.json()
          : [];

        const mapaFrequencias = new Map<string, FrequenciaBackend>();
        frequenciasData.forEach((f) =>
          mapaFrequencias.set(f.aluno.matriculaAluno, f)
        );

        const tabela: LinhaTabela[] = alunosExtraidos.map((aluno) => {
          const freq = mapaFrequencias.get(aluno.matriculaAluno);

          return {
            alunoId: aluno.id,
            matriculaAluno: aluno.matriculaAluno,
            nome: aluno.nome,
            frequenciaId: freq?.id,
            status: freq?.status || "presente",
            justificativa: freq?.justificativa || null,
            faltasNoPeriodo: freq?.faltasNoPeriodo || 0,
            presente: freq?.status === "presente",
          };
        });

        setDadosTabela(tabela);
      } catch (err: any) {
        setError("Erro ao carregar frequência.");
        setDadosTabela([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [turmaId, disciplinaId, dataSelecionada]);

  const alternarPresenca = (matricula: string) => {
    const item = dadosTabela.find((i) => i.matriculaAluno === matricula);
    if (!item) return;

    const novoPresente = !item.presente;

    if (!novoPresente) {
      setAlunoParaJustificativa(item);
      setJustificativaTexto(item.justificativa || "");
      setModalJustificativaAberto(true);
    } else {
      atualizarStatus(matricula, "presente", null);
    }
  };

  const salvarJustificativaEFalta = () => {
    if (!alunoParaJustificativa) return;

    atualizarStatus(
      alunoParaJustificativa.matriculaAluno,
      justificativaTexto.trim() ? "falta_justificada" : "falta",
      justificativaTexto.trim() || null
    );

    setModalJustificativaAberto(false);
    setAlunoParaJustificativa(null);
    setJustificativaTexto("");
  };

  const atualizarStatus = async (
    matricula: string,
    status: "presente" | "falta" | "falta_justificada",
    justificativa?: string | null
  ) => {
    const item = dadosTabela.find((i) => i.matriculaAluno === matricula);
    if (!item) return;

    const payload = {
      data: dataSelecionada,
      alunoId: item.alunoId,
      disciplinaId,
      turmaId,
      status,
      justificativa: justificativa || undefined,
    };

    try {
      let res;
      if (item.frequenciaId) {
        res = await authFetch(`${API_BASE}/frequencias/${item.frequenciaId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`${API_BASE}/frequencias`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!res?.ok) throw new Error("Erro ao salvar");

      setDadosTabela((prev) =>
        prev.map((i) =>
          i.matriculaAluno === matricula
            ? {
                ...i,
                status,
                justificativa: justificativa || null,
                presente: status === "presente",
              }
            : i
        )
      );
    } catch (err) {
      toast.error("Erro ao salvar frequência.");
    }
  };

  const turmaSelecionada = turmas.find((t) => t.id === turmaId);
  const disciplinaSelecionada = disciplinas.find(
    (d) => d.id_disciplina === disciplinaId
  );

  const colunas: Coluna<LinhaTabela>[] = [
    {
      titulo: "Matrícula",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.matriculaAluno}</span>
      ),
    },
    {
      titulo: "Aluno",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.nome}</span>
      ),
    },
    {
      titulo: "Faltas no Período",
      render: (item) => (
        <div className="text-center font-medium text-gray-700">
          {item.faltasNoPeriodo}
        </div>
      ),
    },
    {
      titulo: "Presença",
      render: (item) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={item.presente}
            onChange={() => alternarPresenca(item.matriculaAluno)}
            className="w-6 h-6 text-[#1D5D7F] rounded focus:ring-[#1D5D7F]"
          />
        </div>
      ),
    },
    {
      titulo: "Status",
      render: (item) => (
        <span
          className={`inline-flex px-4 py-1.5 rounded-full text-xs font-medium ${
            item.status === "presente"
              ? "bg-green-100 text-green-800"
              : item.status === "falta_justificada"
              ? "bg-orange-100 text-orange-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status === "presente"
            ? "Presente"
            : item.status === "falta_justificada"
            ? "Falta Justificada"
            : "Falta"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-[#1D5D7F] mb-4">
        Registro de Frequência
      </h1>

      <p className="text-gray-600 mb-8">
        Selecione a turma, disciplina e data para registrar a presença dos
        alunos.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Turma
          </label>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
          >
            <option value="">Selecione uma turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome_turma}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione a Disciplina
          </label>
          <select
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            disabled={!turmaId}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
          >
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map((d) => (
              <option key={d.id_disciplina} value={d.id_disciplina}>
                {d.nome_disciplina}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <div className="relative">
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Carregando...</p>
      ) : dadosTabela.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Selecione turma, disciplina e data para registrar frequência.
        </p>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-[#1D5D7F] mb-4">
            Lista de Alunos - {turmaSelecionada?.nome_turma} (
            {disciplinaSelecionada?.nome_disciplina})
          </h2>

          <Tabela dados={dadosTabela} colunas={colunas} />
        </>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() =>
            toast.success("Frequências salvas automaticamente ao marcar!")
          }
          disabled={loading || dadosTabela.length === 0}
          className="px-8 py-3 bg-[#1D5D7F] text-white font-medium rounded-md hover:bg-[#164a66] disabled:opacity-50 transition"
        >
          Salvar Todas as Faltas
        </button>
      </div>

      {modalJustificativaAberto && alunoParaJustificativa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Justificativa de Falta - {alunoParaJustificativa.nome}
            </h2>

            <textarea
              value={justificativaTexto}
              onChange={(e) => setJustificativaTexto(e.target.value)}
              placeholder="Opcional: escreva a justificativa da falta..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] resize-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalJustificativaAberto(false);
                  setAlunoParaJustificativa(null);
                  setJustificativaTexto("");
                  setDadosTabela((prev) =>
                    prev.map((i) =>
                      i.matriculaAluno === alunoParaJustificativa.matriculaAluno
                        ? { ...i, presente: true }
                        : i
                    )
                  );
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={salvarJustificativaEFalta}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirmar Falta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

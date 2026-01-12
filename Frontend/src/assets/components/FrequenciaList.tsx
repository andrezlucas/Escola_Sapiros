import { useState, useEffect } from "react";
import Tabela, { type Coluna } from "./Tabela";
import { toast } from "react-toastify";
import { Input } from "./Input";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type Turma = { id: string; nome_turma: string };
type Disciplina = { id_disciplina: string; nome_disciplina: string };

type Aluno = {
  id: string;
  matriculaAluno: string;
  usuario: { nome: string };
};

type FrequenciaBackend = {
  id: string;
  data: string;
  status: "presente" | "falta" | "falta_justificada";
  justificativa?: string | null;
  faltasNoPeriodo: number;
  aluno: {
    id: string;
    matriculaAluno: string;
    usuario: { nome: string };
  };
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
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(
    null
  );

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Você precisa estar logado.");
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

        if (!resTurmas?.ok || !resDisciplinas?.ok) throw new Error();

        const turmasData = await resTurmas.json();
        const disciplinasData = await resDisciplinas.json();

        setTurmas(turmasData);
        setDisciplinas(disciplinasData);
      } catch {
        toast.error("Erro ao carregar turmas ou disciplinas.");
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
        if (!resTurma?.ok) throw new Error("Turma não encontrada");
        const turmaData = await resTurma.json();

        const alunos: Aluno[] = (turmaData.alunos || []).map((a: any) => ({
          id: a.id,
          matriculaAluno: a.matriculaAluno,
          usuario: { nome: a.usuario?.nome || "Sem nome" },
        }));

        const params = new URLSearchParams({
          turmaId,
          disciplinaId,
          dataInicio: dataSelecionada,
          dataFim: dataSelecionada,
        });

        const resFreq = await authFetch(`${API_BASE}/frequencias?${params}`);
        const frequencias: FrequenciaBackend[] = resFreq?.ok
          ? await resFreq.json()
          : [];

        const mapaFreq = new Map<string, FrequenciaBackend>();
        frequencias.forEach((f) => mapaFreq.set(f.aluno.matriculaAluno, f));

        const tabela: LinhaTabela[] = alunos.map((aluno) => {
          const freq = mapaFreq.get(aluno.matriculaAluno);

          return {
            alunoId: aluno.id,
            matriculaAluno: aluno.matriculaAluno,
            nome: aluno.usuario.nome,
            frequenciaId: freq?.id,
            status: freq?.status || "presente",
            justificativa: freq?.justificativa || null,
            faltasNoPeriodo: freq?.faltasNoPeriodo || 0,
            presente: freq?.status === "presente",
          };
        });

        setDadosTabela(tabela);
      } catch {
        toast.error("Erro ao carregar dados da frequência.");
        setDadosTabela([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [turmaId, disciplinaId, dataSelecionada]);

  const alternarPresenca = (linha: LinhaTabela) => {
    if (linha.presente) {
      setAlunoParaJustificativa(linha);
      setJustificativaTexto(linha.justificativa || "");
      setArquivoSelecionado(null);
      setModalJustificativaAberto(true);
    } else {
      salvarFrequencia(linha, "presente", null);
    }
  };

  const salvarFrequencia = async (
    linha: LinhaTabela,
    status: "presente" | "falta" | "falta_justificada",
    justificativa: string | null
  ) => {
    const payload = {
      data: dataSelecionada,
      alunoId: linha.matriculaAluno,
      disciplinaId,
      turmaId,
      status,
      justificativa: justificativa || undefined,
    };

    try {
      let res;
      if (linha.frequenciaId) {
        res = await authFetch(`${API_BASE}/frequencias/${linha.frequenciaId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`${API_BASE}/frequencias`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (!res?.ok) {
        const err = await res?.json().catch(() => ({}));
        throw new Error(err.message || "Erro ao salvar");
      }

      const novaFreq = await res.json();

      setDadosTabela((prev) =>
        prev.map((item) =>
          item.matriculaAluno === linha.matriculaAluno
            ? {
                ...item,
                frequenciaId: novaFreq.id,
                status,
                justificativa: justificativa || null,
                presente: status === "presente",
                faltasNoPeriodo:
                  novaFreq.faltasNoPeriodo || item.faltasNoPeriodo,
              }
            : item
        )
      );

      toast.success("Frequência salva com sucesso!");
    } catch {
      toast.error("Erro ao salvar frequência.");
    }
  };

  const confirmarFaltaComJustificativa = () => {
    if (!alunoParaJustificativa) return;

    let justificativaFinal = justificativaTexto.trim();

    if (arquivoSelecionado) {
      justificativaFinal += justificativaFinal ? " | " : "";
      justificativaFinal += `Documento anexado: ${arquivoSelecionado.name}`;
    }

    const novoStatus = justificativaFinal ? "falta_justificada" : "falta";

    salvarFrequencia(
      alunoParaJustificativa,
      novoStatus,
      justificativaFinal || null
    );

    setModalJustificativaAberto(false);
    setAlunoParaJustificativa(null);
    setJustificativaTexto("");
    setArquivoSelecionado(null);
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
        <div className="flex justify-center gap-3">
          <button
            onClick={() => salvarFrequencia(item, "presente", null)}
            className={`p-2 rounded-full transition-all ${
              item.status === "presente"
                ? "bg-[#1D5D7F] text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Marcar como Presente"
          >
            <CheckCircle2/>
          </button>

          <button
            onClick={() => {
              setAlunoParaJustificativa(item);
              setJustificativaTexto(item.justificativa || "");
              setArquivoSelecionado(null);
              setModalJustificativaAberto(true);
            }}
            className={`p-2 rounded-full transition-all ${
              item.status === "falta"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Marcar como Falta"
          >
            <XCircle />
          </button>

          <button
            onClick={() => {
              setAlunoParaJustificativa(item);
              setJustificativaTexto(item.justificativa || "");
              setArquivoSelecionado(null);
              setModalJustificativaAberto(true);
            }}
            className={`p-2 rounded-full transition-all ${
              item.status === "falta_justificada"
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title="Marcar como Falta Justificada"
          >
            <AlertCircle />
          </button>
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
      <h1 className="text-3xl font-medium text-[#1D5D7F] mb-4">
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
            {disciplinaSelecionada?.nome_disciplina}) - {dataSelecionada}
          </h2>

          <Tabela dados={dadosTabela} colunas={colunas} />
        </>
      )}

      {modalJustificativaAberto && alunoParaJustificativa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Justificativa de Falta - {alunoParaJustificativa.nome}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da justificativa (opcional)
                </label>
                <textarea
                  value={justificativaTexto}
                  onChange={(e) => setJustificativaTexto(e.target.value)}
                  placeholder="Ex: Atestado médico, viagem familiar..."
                  className="w-full h-28 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anexar documento comprovante (opcional)
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setArquivoSelecionado(e.target.files[0]);
                    }
                  }}
                  className="w-full"
                  label={""}
                />
                {arquivoSelecionado && (
                  <p className="text-sm text-green-600 mt-2">
                    Arquivo: {arquivoSelecionado.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalJustificativaAberto(false);
                  setAlunoParaJustificativa(null);
                  setJustificativaTexto("");
                  setArquivoSelecionado(null);
                  setDadosTabela((prev) =>
                    prev.map((i) =>
                      i.matriculaAluno === alunoParaJustificativa.matriculaAluno
                        ? { ...i, presente: true }
                        : i
                    )
                  );
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarFaltaComJustificativa}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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

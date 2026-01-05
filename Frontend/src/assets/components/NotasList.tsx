import { useState, useEffect } from "react";
import { Input } from "./Input";
import Tabela, { type Coluna } from "./Tabela";
import { toast } from "react-toastify";

type Turma = { id: string; nome_turma: string };
type Disciplina = { id_disciplina: string; nome_disciplina: string };
type Habilidade = { id: string; nome: string };

type Aluno = { id: string; matriculaAluno: string; nome: string };
type Nota = {
  id: string;
  valor: number | null;
  avaliacaoNome: string;
  status: "SALVO" | "PENDENTE";
  aluno: { matriculaAluno: string; nome?: string };
};

type LinhaTabela = {
  alunoId: string;
  matriculaAluno: string;
  nome: string;
  nota1Id: string | null;
  nota1: number | null;
  nota1Original: number | null;
  nota2Id: string | null;
  nota2: number | null;
  nota2Original: number | null;
  status: "salvo" | "pendente";
  habilidadesSelecionadas: Habilidade[];
};

const API_BASE = "http://localhost:3000";

export default function NotaList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [turmaId, setTurmaId] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [avaliacaoNome, setAvaliacaoNome] = useState<string>("");

  const [dadosTabela, setDadosTabela] = useState<LinhaTabela[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHabilidades, setLoadingHabilidades] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal de feedback
  const [modalFeedbackAberto, setModalFeedbackAberto] = useState(false);
  const [alunoSelecionadoParaFeedback, setAlunoSelecionadoParaFeedback] =
    useState<LinhaTabela | null>(null);
  const [feedbackTexto, setFeedbackTexto] = useState("");

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
          throw new Error("Erro ao carregar dados iniciais");

        const turmasData = await resTurmas.json();
        const disciplinasData = await resDisciplinas.json();

        setTurmas(turmasData);
        setDisciplinas(disciplinasData);
      } catch (err: any) {
        setError("Falha ao carregar turmas ou disciplinas.");
      }
    };

    fetchInicial();
  }, []);

  useEffect(() => {
    if (!disciplinaId) {
      setHabilidades([]);
      return;
    }

    const fetchHabilidades = async () => {
      setLoadingHabilidades(true);
      try {
        const res = await authFetch(
          `${API_BASE}/disciplinas/${disciplinaId}/habilidades`
        );
        if (!res?.ok) throw new Error("Erro ao carregar habilidades");
        const data = await res.json();
        setHabilidades(data);
      } catch (err) {
        console.error(err);
        setHabilidades([]);
      } finally {
        setLoadingHabilidades(false);
      }
    };

    fetchHabilidades();
  }, [disciplinaId]);

  const disciplinaSelecionada = disciplinas.find(
    (d) => d.id_disciplina === disciplinaId
  );
  const opcoesAvaliacao = disciplinaSelecionada
    ? [
        `1º Bimestre - ${disciplinaSelecionada.nome_disciplina}`,
        `2º Bimestre - ${disciplinaSelecionada.nome_disciplina}`,
        `3º Bimestre - ${disciplinaSelecionada.nome_disciplina}`,
        `4º Bimestre - ${disciplinaSelecionada.nome_disciplina}`,
      ]
    : [];

  useEffect(() => {
    if (!turmaId || !disciplinaId || !avaliacaoNome) {
      setDadosTabela([]);
      return;
    }

    const fetchDados = async () => {
      setLoading(true);
      setError(null);

      try {
        const [resTurma, resNotas] = await Promise.all([
          authFetch(`${API_BASE}/turmas/${turmaId}`),
          authFetch(
            `${API_BASE}/notas?disciplinaId=${encodeURIComponent(
              disciplinaId
            )}&avaliacaoNome=${encodeURIComponent(avaliacaoNome)}`
          ),
        ]);

        if (!resTurma?.ok) throw new Error("Erro ao carregar turma");

        const turmaData = await resTurma.json();
        const notasData: Nota[] = resNotas?.ok ? await resNotas.json() : [];

        const alunosExtraidos: Aluno[] = (turmaData.alunos || []).map(
          (alunoObj: any) => ({
            id: alunoObj.id,
            matriculaAluno: alunoObj.matriculaAluno,
            nome: alunoObj.usuario?.nome || "Nome não disponível",
          })
        );

        const tabela: LinhaTabela[] = alunosExtraidos.map((aluno) => {
          const notaExistente = notasData.find(
            (n) => n.aluno.matriculaAluno === aluno.matriculaAluno
          );

          return {
            alunoId: aluno.id,
            matriculaAluno: aluno.matriculaAluno,
            nome: aluno.nome,
            nota1Id: notaExistente?.id || null,
            nota1: notaExistente?.valor ?? null,
            nota1Original: notaExistente?.valor ?? null,
            nota2Id: null,
            nota2: null,
            nota2Original: null,
            status:
              notaExistente?.status === "SALVO" && notaExistente?.valor !== null
                ? "salvo"
                : "pendente",
            habilidadesSelecionadas: [],
          };
        });

        setDadosTabela(tabela);
      } catch (err: any) {
        setError("Erro ao carregar alunos ou notas.");
        setDadosTabela([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [turmaId, disciplinaId, avaliacaoNome]);

  const atualizarNota1 = (matricula: string, valor: string) => {
    const num = valor === "" ? null : parseFloat(valor);
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.matriculaAluno === matricula
          ? {
              ...item,
              nota1: num,
              status:
                num === item.nota1Original
                  ? num !== null
                    ? "salvo"
                    : "pendente"
                  : "pendente",
            }
          : item
      )
    );
  };

  const atualizarNota2 = (matricula: string, valor: string) => {
    const num = valor === "" ? null : parseFloat(valor);
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.matriculaAluno === matricula
          ? { ...item, nota2: num, status: "pendente" }
          : item
      )
    );
  };

  const atualizarHabilidades = (
    matricula: string,
    novasHabilidades: Habilidade[]
  ) => {
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.matriculaAluno === matricula
          ? { ...item, habilidadesSelecionadas: novasHabilidades }
          : item
      )
    );
  };

  const abrirModalFeedback = (item: LinhaTabela) => {
    setAlunoSelecionadoParaFeedback(item);
    setFeedbackTexto("");
    setModalFeedbackAberto(true);
  };

  const salvarFeedback = () => {
    if (!alunoSelecionadoParaFeedback) return;

    toast.success(
      `Feedback salvo para ${alunoSelecionadoParaFeedback.nome}:\n${feedbackTexto}`
    );

    setModalFeedbackAberto(false);
    setAlunoSelecionadoParaFeedback(null);
    setFeedbackTexto("");
  };

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
      titulo: "Nota 1",
      render: (item) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={item.nota1 ?? ""}
          onChange={(e) => atualizarNota1(item.matriculaAluno, e.target.value)}
          className="w-24 px-3 py-2 text-center border rounded-md focus:ring-2 focus:ring-[#1D5D7F]"
          placeholder="0.0"
          label={""}
        />
      ),
    },
    {
      titulo: "Nota 2",
      render: (item) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={item.nota2 ?? ""}
          onChange={(e) => atualizarNota2(item.matriculaAluno, e.target.value)}
          className="w-24 px-3 py-2 text-center border rounded-md focus:ring-2 focus:ring-[#1D5D7F]"
          placeholder="0.0"
          label={""}
        />
      ),
    },
    {
      titulo: "Feedback",
      render: (item) => (
        <button
          onClick={() => abrirModalFeedback(item)}
          className="px-4 py-2 text-sm text-[#1D5D7F] bg-[#e6f0f8] rounded-md hover:bg-[#d0e4f0] transition"
        >
          Adicionar Feedback...
        </button>
      ),
    },
    {
      titulo: "Habilidades",
      render: (item) => {
        const adicionarHabilidade = (habilidadeId: string) => {
          if (!habilidadeId) return;
          const hab = habilidades.find((h) => h.id === habilidadeId);
          if (!hab || item.habilidadesSelecionadas.some((h) => h.id === hab.id))
            return;

          atualizarHabilidades(item.matriculaAluno, [
            ...item.habilidadesSelecionadas,
            hab,
          ]);
        };

        const removerHabilidade = (habilidadeId: string) => {
          atualizarHabilidades(
            item.matriculaAluno,
            item.habilidadesSelecionadas.filter((h) => h.id !== habilidadeId)
          );
        };

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {item.habilidadesSelecionadas.map((h) => (
                <span
                  key={h.id}
                  onClick={() => removerHabilidade(h.id)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer flex items-center gap-1"
                >
                  {h.nome}
                  <span className="text-red-500 font-bold">✕</span>
                </span>
              ))}
            </div>

            <select
              value=""
              onChange={(e) => {
                adicionarHabilidade(e.target.value);
                e.target.value = "";
              }}
              disabled={loadingHabilidades || habilidades.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white text-sm"
            >
              <option value="" disabled>
                Selecionar habilidade
              </option>
              {habilidades.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nome}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      titulo: "Status",
      render: (item) => (
        <span
          className={`inline-flex px-4 py-1.5 rounded-full text-xs font-medium ${
            item.status === "salvo"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {item.status === "salvo" ? "Salvo" : "Pendente"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-medium text-[#1D5D7F] mb-4">
        Lançamento de Notas e Desempenho
      </h1>

      <p className="text-gray-600 mb-8">
        Selecione a turma e a avaliação para inserir as notas e feedback dos
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
            Avaliação
          </label>
          <select
            value={avaliacaoNome}
            onChange={(e) => setAvaliacaoNome(e.target.value)}
            disabled={!disciplinaId}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
          >
            <option value="">Selecione o bimestre</option>
            {opcoesAvaliacao.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500 py-8">
          Carregando alunos e notas...
        </p>
      ) : dadosTabela.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          Selecione turma, disciplina e avaliação para começar.
        </p>
      ) : (
        <Tabela dados={dadosTabela} colunas={colunas} />
      )}

      <div className="mt-8 flex justify-end">
        <button
          disabled={loading || dadosTabela.length === 0}
          className="px-8 py-3 bg-[#1D5D7F] text-white font-medium rounded-md hover:bg-[#164a66] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Salvar Todas as Notas
        </button>
      </div>

      {modalFeedbackAberto && alunoSelecionadoParaFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Feedback para {alunoSelecionadoParaFeedback.nome}
            </h2>

            <textarea
              value={feedbackTexto}
              onChange={(e) => setFeedbackTexto(e.target.value)}
              placeholder="Escreva aqui o feedback para o aluno..."
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] resize-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalFeedbackAberto(false);
                  setAlunoSelecionadoParaFeedback(null);
                  setFeedbackTexto("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFeedback}
                className="px-6 py-2 bg-[#1D5D7F] text-white rounded-md hover:bg-[#164a66] transition"
              >
                Salvar Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

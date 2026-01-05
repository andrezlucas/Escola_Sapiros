import { useState, useEffect } from "react";
import { Input } from "./Input";
import Tabela, { type Coluna } from "./Tabela";
import { toast } from "react-toastify";

type Turma = { id: string; nome_turma: string };
type Disciplina = { id_disciplina: string; nome_disciplina: string };
type Habilidade = { id: string; nome: string };

type LinhaTabela = {
  alunoId: string;
  matriculaAluno: string;
  nome: string;
  nota1: number | null;
  nota1Original: number | null;
  nota2: number | null;
  nota2Original: number | null;
  feedback: string;
  habilidadesSelecionadas: Habilidade[];
  habilidadesOriginais: string[];
  status: "salvo" | "pendente";
};

const API_BASE = "http://localhost:3000";

export default function NotaList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [turmaId, setTurmaId] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [bimestre, setBimestre] = useState<string>("");

  const [dadosTabela, setDadosTabela] = useState<LinhaTabela[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHabilidades, setLoadingHabilidades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalFeedbackAberto, setModalFeedbackAberto] = useState(false);
  const [alunoSelecionadoParaFeedback, setAlunoSelecionadoParaFeedback] =
    useState<LinhaTabela | null>(null);
  const [feedbackTexto, setFeedbackTexto] = useState("");
  const [savingIndividual, setSavingIndividual] = useState<string | null>(null);

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
    const fetchTurmas = async () => {
      const res = await authFetch(`${API_BASE}/notas/turmas-professor`);
      if (!res?.ok) {
        setError("Erro ao carregar turmas");
        return;
      }
      const data = await res.json();
      setTurmas(data);
    };
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (!turmaId) {
      setDisciplinas([]);
      setDisciplinaId("");
      return;
    }

    const fetchDisciplinas = async () => {
      const res = await authFetch(
        `${API_BASE}/notas/disciplinas-professor?turmaId=${turmaId}`
      );
      if (!res?.ok) {
        setError("Erro ao carregar disciplinas");
        return;
      }
      const data = await res.json();
      setDisciplinas(data);
    };
    fetchDisciplinas();
  }, [turmaId]);

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
        if (!res?.ok) throw new Error();
        const data = await res.json();
        setHabilidades(data);
      } catch {
        setHabilidades([]);
      } finally {
        setLoadingHabilidades(false);
      }
    };

    fetchHabilidades();
  }, [disciplinaId]);

  const opcoesBimestre = [
    "1º Bimestre",
    "2º Bimestre",
    "3º Bimestre",
    "4º Bimestre",
  ];

  const nomeDisciplina = disciplinas.find(
    (d) => d.id_disciplina === disciplinaId
  )?.nome_disciplina;

  useEffect(() => {
    if (!turmaId || !disciplinaId || !bimestre) {
      setDadosTabela([]);
      return;
    }

    const fetchDados = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await authFetch(
          `${API_BASE}/notas/lista-lancamento?turmaId=${turmaId}&disciplinaId=${disciplinaId}&bimestre=${encodeURIComponent(
            bimestre
          )}`
        );

        if (!res?.ok) throw new Error("Erro ao carregar dados");

        const data = await res.json();

        const tabela: LinhaTabela[] = data.map((item: any) => ({
          alunoId: item.alunoId,
          matriculaAluno: item.matriculaAluno || "N/I",
          nome: item.nome || "Sem nome",
          nota1: item.nota1 || null,
          nota1Original: item.nota1 || null,
          nota2: item.nota2 || null,
          nota2Original: item.nota2 || null,
          feedback: item.feedback || "",
          habilidadesSelecionadas: [],
          habilidadesOriginais: item.habilidades || [],
          status: item.status === "SALVO" ? "salvo" : "pendente",
        }));

        const tabelaComHabilidades = tabela.map((linha) => {
          const habsSelecionadas = linha.habilidadesOriginais
            .map((id: string) => habilidades.find((h) => h.id === id))
            .filter(Boolean) as Habilidade[];

          return {
            ...linha,
            habilidadesSelecionadas: habsSelecionadas,
          };
        });

        setDadosTabela(tabelaComHabilidades);
      } catch (err) {
        setError("Erro ao carregar notas dos alunos");
        setDadosTabela([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [turmaId, disciplinaId, bimestre, habilidades]);

  const atualizarNota1 = (alunoId: string, valor: string) => {
    const num = valor === "" ? null : parseFloat(valor);
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.alunoId === alunoId
          ? {
              ...item,
              nota1: num,
              status: num === item.nota1Original ? "salvo" : "pendente",
            }
          : item
      )
    );
  };

  const atualizarNota2 = (alunoId: string, valor: string) => {
    const num = valor === "" ? null : parseFloat(valor);
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.alunoId === alunoId
          ? { ...item, nota2: num, status: "pendente" }
          : item
      )
    );
  };

  const atualizarHabilidades = (alunoId: string, novas: Habilidade[]) => {
    setDadosTabela((prev) =>
      prev.map((item) =>
        item.alunoId === alunoId
          ? { ...item, habilidadesSelecionadas: novas, status: "pendente" }
          : item
      )
    );
  };

  const abrirModalFeedback = (item: LinhaTabela) => {
    setAlunoSelecionadoParaFeedback(item);
    setFeedbackTexto(item.feedback);
    setModalFeedbackAberto(true);
  };

  const salvarFeedbackLocal = () => {
    if (!alunoSelecionadoParaFeedback) return;

    setDadosTabela((prev) =>
      prev.map((item) =>
        item.alunoId === alunoSelecionadoParaFeedback.alunoId
          ? { ...item, feedback: feedbackTexto, status: "pendente" }
          : item
      )
    );

    toast.success(
      `Feedback atualizado para ${alunoSelecionadoParaFeedback.nome}`
    );
    setModalFeedbackAberto(false);
  };

  const salvarTodasAsNotas = async () => {
    setSaving(true);
    try {
      const notasParaSalvar = dadosTabela.map((item) => ({
        alunoId: item.alunoId,
        disciplinaId,
        bimestre: bimestre as any,
        nota1: item.nota1 ?? undefined,
        nota2: item.nota2 ?? undefined,
        feedback: item.feedback || undefined,
        habilidades: item.habilidadesSelecionadas.map((h) => h.id),
        status: "SALVO",
      }));

      const res = await authFetch(`${API_BASE}/notas/bulk`, {
        method: "POST",
        body: JSON.stringify(notasParaSalvar),
      });

      if (!res?.ok) throw new Error("Erro ao salvar");

      toast.success("Todas as notas e feedbacks foram salvos com sucesso!");

      setDadosTabela((prev) =>
        prev.map((item) => ({
          ...item,
          nota1Original: item.nota1,
          nota2Original: item.nota2,
          habilidadesOriginais: item.habilidadesSelecionadas.map((h) => h.id),
          status: "salvo",
        }))
      );
    } catch (err) {
      toast.error("Erro ao salvar as notas");
    } finally {
      setSaving(false);
    }
  };

  const salvarIndividual = async (linha: LinhaTabela) => {
    setSavingIndividual(linha.alunoId);

    try {
      const payload = {
        alunoId: linha.alunoId,
        disciplinaId,
        bimestre: bimestre as any,
        nota1: linha.nota1 ?? undefined,
        nota2: linha.nota2 ?? undefined,
        feedback: linha.feedback || undefined,
        habilidades: linha.habilidadesSelecionadas.map((h) => h.id),
        status: "SALVO" as const,
      };

      const res = await authFetch(`${API_BASE}/notas/bulk`, {
        method: "POST",
        body: JSON.stringify([payload]),
      });

      if (!res?.ok) {
        const errorText = await res?.text();
        throw new Error(errorText || "Erro ao salvar");
      }

      toast.success(`Nota de ${linha.nome} salva com sucesso!`);

      setDadosTabela((prev) =>
        prev.map((item) =>
          item.alunoId === linha.alunoId
            ? {
                ...item,
                nota1Original: item.nota1,
                nota2Original: item.nota2,
                habilidadesOriginais: item.habilidadesSelecionadas.map(
                  (h) => h.id
                ),
                feedback: item.feedback,
                status: "salvo",
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar nota individual");
    } finally {
      setSavingIndividual(null);
    }
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
          onChange={(e) => atualizarNota1(item.alunoId, e.target.value)}
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
          onChange={(e) => atualizarNota2(item.alunoId, e.target.value)}
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
          {item.feedback ? "Editar Feedback..." : "Adicionar Feedback..."}
        </button>
      ),
    },
    {
      titulo: "Habilidades",
      render: (item) => {
        const adicionar = (habId: string) => {
          const hab = habilidades.find((h) => h.id === habId);
          if (!hab || item.habilidadesSelecionadas.some((h) => h.id === hab.id))
            return;
          atualizarHabilidades(item.alunoId, [
            ...item.habilidadesSelecionadas,
            hab,
          ]);
        };

        const remover = (habId: string) => {
          atualizarHabilidades(
            item.alunoId,
            item.habilidadesSelecionadas.filter((h) => h.id !== habId)
          );
        };

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {item.habilidadesSelecionadas.map((h) => (
                <span
                  key={h.id}
                  onClick={() => remover(h.id)}
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
                adicionar(e.target.value);
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
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex px-4 py-1.5 rounded-full text-xs font-medium ${
              item.status === "salvo"
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {item.status === "salvo" ? "Salvo" : "Pendente"}
          </span>

          {item.status === "pendente" && (
            <button
              onClick={() => salvarIndividual(item)}
              disabled={savingIndividual === item.alunoId}
              className="ml-4 px-5 py-2 bg-[#1D5D7F] text-white text-sm font-medium rounded-md hover:bg-[#164a66] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {savingIndividual === item.alunoId ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-medium text-[#1D5D7F] mb-4">
        Lançamento de Notas e Desempenho
      </h1>

      <p className="text-gray-600 mb-8">
        Selecione a turma, disciplina e bimestre para lançar notas, feedback e
        habilidades.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Turma
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
            Disciplina
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
            Bimestre
          </label>
          <select
            value={bimestre}
            onChange={(e) => setBimestre(e.target.value)}
            disabled={!disciplinaId}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
          >
            <option value="">Selecione o bimestre</option>
            {opcoesBimestre.map((op) => (
              <option key={op} value={op}>
                {op} - {nomeDisciplina || ""}
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
          Selecione turma, disciplina e bimestre para começar.
        </p>
      ) : (
        <Tabela dados={dadosTabela} colunas={colunas} />
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={salvarTodasAsNotas}
          disabled={saving || loading || dadosTabela.length === 0}
          className="px-8 py-3 bg-[#1D5D7F] text-white font-medium rounded-md hover:bg-[#164a66] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {saving ? "Salvando..." : "Salvar Todas as Notas"}
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
                onClick={() => setModalFeedbackAberto(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFeedbackLocal}
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

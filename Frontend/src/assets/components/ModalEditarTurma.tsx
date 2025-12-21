import { useEffect, useState } from "react";
import FormTurma, {
  type TurmaFormData,
  type Professor,
  type Aluno,
  type Disciplina,
} from "./FormTurma";
import { toast } from "react-toastify";
import { useForm, FormProvider } from "react-hook-form";
import { normalizeProfessor, normalizeAluno } from "../utils/dataNormalizer";

interface ProfessorMin {
  id: string;
  nome: string;
  usuario: { nome: string };
}

interface AlunoMin {
  id: string;
  usuario: { nome: string };
}

interface DisciplinaMin {
  id_disciplina: string;
  nome: string;
}

interface Turma {
  id: string;
  nome_turma: string;
  ano_letivo: string;
  turno: string;
  ativa: boolean;
  capacidade_maxima: number;
  professor?: ProfessorMin;
  alunos: AlunoMin[];
  disciplinas: DisciplinaMin[];
}

interface ModalEditarTurmaProps {
  turma: Turma;
  aberto: boolean;
  onClose: () => void;
  onAtualizarLista: () => Promise<void> | void;
}

export default function ModalEditarTurma({
  turma,
  aberto,
  onClose,
  onAtualizarLista,
}: ModalEditarTurmaProps) {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [ativa, setAtiva] = useState<boolean>(turma.ativa); // ✅ ESTADO LOCAL

  const [loading, setLoading] = useState({
    professores: false,
    alunos: false,
    disciplinas: false,
  });

  const token = localStorage.getItem("token");

  const methods = useForm<TurmaFormData>({
    defaultValues: {
      nome_turma: "",
      anoLetivo: "",
      turno: "MANHÃ",
      capacidade_maxima: 30,
      professorId: undefined,
      alunosIds: [],
      disciplinasIds: [],
    },
  });

  useEffect(() => {
    if (turma && aberto) {
      setAtiva(turma.ativa); // ✅ sincroniza status

      methods.reset({
        nome_turma: turma.nome_turma ?? "",
        anoLetivo: turma.ano_letivo ?? "",
        turno: turma.turno as any,
        capacidade_maxima: turma.capacidade_maxima,
        professorId: turma.professor?.id ?? undefined,
        alunosIds: turma.alunos?.map((a) => a.id) ?? [],
        disciplinasIds: turma.disciplinas?.map((d) => d.id_disciplina) ?? [],
      });
    }
  }, [turma, aberto]);

  useEffect(() => {
    if (!aberto) return;

    async function fetchData() {
      try {
        setLoading({ professores: true, alunos: true, disciplinas: true });

        const [profRes, alunoRes, discRes] = await Promise.all([
          fetch("http://localhost:3000/professores", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/alunos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/disciplinas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const professoresData = await profRes.json();
        const alunosData = await alunoRes.json();
        const disciplinasData = await discRes.json();

        setProfessores(
          Array.isArray(professoresData)
            ? professoresData.map(normalizeProfessor)
            : professoresData.data?.map(normalizeProfessor) ?? []
        );

        setAlunos(
          Array.isArray(alunosData)
            ? alunosData.map(normalizeAluno)
            : alunosData.data?.map(normalizeAluno) ?? []
        );

        setDisciplinas(
          Array.isArray(disciplinasData)
            ? disciplinasData
            : disciplinasData.data ?? []
        );
      } catch (e) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading({ professores: false, alunos: false, disciplinas: false });
      }
    }

    fetchData();
  }, [aberto]);

  async function handleAtualizarTurma(data: TurmaFormData) {
    try {
      const payload = {
        nome_turma: data.nome_turma,
        anoLetivo: data.anoLetivo,
        turno: data.turno,
        capacidade_maxima: Number(data.capacidade_maxima),
        professorId: data.professorId ?? null,
        alunosIds: data.alunosIds ?? [],
        disciplinasIds: data.disciplinasIds ?? [],
      };

      const res = await fetch(`http://localhost:3000/turmas/${turma.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar turma");

      toast.success("Turma atualizada com sucesso!");
      await onAtualizarLista();
      onClose();
    } catch (err) {
      toast.error("Erro ao atualizar turma");
    }
  }

  async function handleToggleAtiva(novaAtiva: boolean) {
    try {
      await fetch(`http://localhost:3000/turmas/${turma.id}/ativa`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ativa: novaAtiva }),
      });

      setAtiva(novaAtiva); // ✅ atualiza UI
      toast.success(novaAtiva ? "Turma ativada" : "Turma desativada");
      await onAtualizarLista();
    } catch {
      toast.error("Erro ao alterar status");
    }
  }

  async function handleExcluirTurma() {
    if (!window.confirm("Deseja realmente excluir esta turma?")) return;

    try {
      await fetch(`http://localhost:3000/turmas/${turma.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Turma excluída");
      await onAtualizarLista();
      onClose();
    } catch {
      toast.error("Erro ao excluir turma");
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl max-h-[600px] rounded-xl p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-4">Editar Turma</h2>

        {loading.professores || loading.alunos ? (
          <p className="text-center">Carregando...</p>
        ) : (
          <>
            <FormProvider {...methods}>
              <FormTurma
                onSubmit={handleAtualizarTurma}
                professores={professores}
                alunos={alunos}
                disciplinas={disciplinas}
              />
            </FormProvider>

            <div className="mt-4 flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ativa}
                  onChange={(e) => handleToggleAtiva(e.target.checked)}
                />
                Turma ativa
              </label>

              <button
                onClick={handleExcluirTurma}
                className="px-3 py-2 bg-red-600 text-white rounded-lg"
              >
                Excluir
              </button>

              <button onClick={onClose} className="px-4 py-2 border rounded-lg">
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

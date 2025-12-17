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
  data_inicio?: string;
  data_fim?: string;
  professor?: ProfessorMin;
  alunos: AlunoMin[];
  disciplinas: DisciplinaMin[];
}

interface ModalEditarTurmaProps {
  turma: Turma;
  aberto: boolean;
  onClose: () => void;
  onAtualizarLista: () => void;
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
      ativa: true,
      professorId: undefined,
      alunosIds: [],
      disciplinasIds: [],
      dataInicio: "",
      dataFim: "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (turma && aberto) {
      console.log("Turma recebida para edição:", turma);

      const formatDate = (dateString: string | null | undefined) => {
        if(!dateString) return "";
        return dateString.split("T")[0];
      };

      methods.reset({
        nome_turma: turma.nome_turma ?? "",
        anoLetivo: turma.ano_letivo ?? "",
        turno: (turma.turno as "MANHÃ" | "TARDE" | "NOITE") ?? "MANHÃ",
        capacidade_maxima: turma.capacidade_maxima ,
        ativa: turma.ativa ?? true,
        professorId: turma.professor?.id ?? undefined,
        alunosIds: turma.alunos?.map((a) => a.id) ?? [],
        disciplinasIds: turma.disciplinas?.map((d) => d.id_disciplina) ?? [],
        dataInicio: formatDate(turma.data_inicio),
        dataFim: formatDate(turma.data_fim),
      });
    }
  }, [turma, aberto]);

  useEffect(() => {
    if (!aberto) return;

    async function fetchData() {
      try {
        setLoading({ professores: true, alunos: true, disciplinas: true });

        const [professoresRes, alunosRes, disciplinasRes] = await Promise.all([
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

        const professoresData = await professoresRes.json();
        const alunosData = await alunosRes.json();
        const disciplinasData = await disciplinasRes.json();

        console.log("Professores para edição:", professoresData);
        console.log("Alunos para edição:", alunosData);

        let professoresNormalized: Professor[] = [];
        if (Array.isArray(professoresData)) {
          professoresNormalized = professoresData.map(normalizeProfessor);
        } else if (
          professoresData.data &&
          Array.isArray(professoresData.data)
        ) {
          professoresNormalized = professoresData.data.map(normalizeProfessor);
        }

        let alunosNormalized: Aluno[] = [];
        if (Array.isArray(alunosData)) {
          alunosNormalized = alunosData.map(normalizeAluno);
        } else if (alunosData.data && Array.isArray(alunosData.data)) {
          alunosNormalized = alunosData.data.map(normalizeAluno);
        }

        let disciplinasNormalized: Disciplina[] = [];
        if (Array.isArray(disciplinasData)) {
          disciplinasNormalized = disciplinasData;
        } else if (
          disciplinasData.data &&
          Array.isArray(disciplinasData.data)
        ) {
          disciplinasNormalized = disciplinasData.data;
        }

        setProfessores(professoresNormalized);
        setAlunos(alunosNormalized);
        setDisciplinas(disciplinasNormalized);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar listas de professores e alunos");
      } finally {
        setLoading({ professores: false, alunos: false, disciplinas: false });
      }
    }

    fetchData();
  }, [aberto, token]);

  async function handleAtualizarTurma(data: TurmaFormData) {
    try {
      const payload = {
        nome_turma: data.nome_turma,
        anoLetivo: data.anoLetivo,
        turno: data.turno,
        capacidade_maxima: Number(data.capacidade_maxima),
        ativa: data.ativa ?? true,
        professorId: data.professorId === undefined ? null : data.professorId,
        alunosIds: data.alunosIds || [],
        disciplinasIds: data.disciplinasIds || [],
        dataInicio: data.dataInicio || null,
        dataFim: data.dataFim || null,
      };

      console.log("Payload PATCH:", payload);

      const res = await fetch(`http://localhost:3000/turmas/${turma.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          Array.isArray(err.message) ? err.message.join(", ") : err.message
        );
      }

      toast.success("Turma atualizada com sucesso!");

      setTimeout(() => {
        onAtualizarLista();
        onClose();
      }, 500);
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao atualizar turma: ${err.message}`);
    }
  }

  async function handleExcluirTurma() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta turma?\nEsta ação não pode ser desfeita."
      )
    )
      return;

    try {
      const res = await fetch(`http://localhost:3000/turmas/${turma.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir turma");
      }

      toast.success("Turma excluída com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao excluir turma: ${err.message}`);
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl max-h-[600px] rounded-xl p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-4">Editar Turma</h2>

        {loading.professores || loading.alunos ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1D5D7F] mb-2"></div>
            <p className="text-gray-500">
              Carregando lista de professores e alunos...
            </p>
          </div>
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

            <div className="mt-4 flex justify-between">
              <button
                onClick={handleExcluirTurma}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir Turma
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={methods.handleSubmit(handleAtualizarTurma)}
                  className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
                >
                  Salvar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

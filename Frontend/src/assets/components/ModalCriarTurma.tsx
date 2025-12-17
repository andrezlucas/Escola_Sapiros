import { useEffect, useState } from "react";
import FormTurma, {
  type TurmaFormData,
  type Professor,
  type Aluno,
  type Disciplina,
} from "./FormTurma";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { normalizeProfessor, normalizeAluno } from "../utils/dataNormalizer";

interface ModalCriarTurmaProps {
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalCriarTurma({
  onClose,
  onAtualizarLista,
}: ModalCriarTurmaProps) {
  const methods = useForm<TurmaFormData>();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState({
    professores: false,
    alunos: false,
    disciplinas: false,
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfessores();
    fetchAlunos();
    fetchDisciplinas();
  }, []);

  async function fetchProfessores() {
    try {
      setLoading((prev) => ({ ...prev, professores: true }));
      const res = await fetch("http://localhost:3000/professores", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Dados brutos professores:", data);

      let professoresData: Professor[] = [];

      if (Array.isArray(data)) {
        professoresData = data.map(normalizeProfessor);
      } else if (data.data && Array.isArray(data.data)) {
        professoresData = data.data.map(normalizeProfessor);
      }

      console.log("Professores normalizados:", professoresData);
      setProfessores(professoresData);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast.error("Erro ao carregar lista de professores");
      setProfessores([]);
    } finally {
      setLoading((prev) => ({ ...prev, professores: false }));
    }
  }

  async function fetchAlunos() {
    try {
      setLoading((prev) => ({ ...prev, alunos: true }));
      const res = await fetch("http://localhost:3000/alunos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Dados brutos alunos:", data);

      let alunosData: Aluno[] = [];

      if (Array.isArray(data)) {
        alunosData = data.map(normalizeAluno);
      } else if (data.data && Array.isArray(data.data)) {
        alunosData = data.data.map(normalizeAluno);
      }

      console.log("Alunos normalizados:", alunosData);
      setAlunos(alunosData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao carregar lista de alunos");
      setAlunos([]);
    } finally {
      setLoading((prev) => ({ ...prev, alunos: false }));
    }
  }

  async function fetchDisciplinas() {
    try {
      setLoading((prev) => ({ ...prev, disciplinas: true }));
      const res = await fetch("http://localhost:3000/disciplinas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Dados brutos disciplinas:", data);

      let disciplinasData: Disciplina[] = [];

      if (Array.isArray(data)) {
        disciplinasData = data;
      } else if (data.data && Array.isArray(data.data)) {
        disciplinasData = data.data;
      }

      setDisciplinas(disciplinasData);
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      setDisciplinas([]);
    } finally {
      setLoading((prev) => ({ ...prev, disciplinas: false }));
    }
  }

  async function handleCriarTurma(data: TurmaFormData) {
    try {
      const payload = {
        nome_turma: data.nome_turma,
        anoLetivo: String(data.anoLetivo).trim(),
        turno: data.turno,
        capacidade_maxima: Number(data.capacidade_maxima),
        ativa: !!data.ativa,
        professorId: data.professorId || undefined,
        alunosIds: data.alunosIds || [],
        disciplinasIds: data.disciplinasIds || [],
        dataInicio: data.dataInicio || undefined,
        data_fim: data.dataFim || undefined,
      };

      console.log("Payload enviado:", payload);

      const res = await fetch("http://localhost:3000/turmas", {
        method: "POST",
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

      toast.success("Turma criada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      toast.error(`Erro ao criar turma: ${err.message}`);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl max-h-[600px] rounded-xl p-4 overflow-auto">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">Criar Turma</h2>

        {loading.professores || loading.alunos ? (
          <div className="text-center py-4">
            <p className="text-gray-500">
              Carregando lista de professores e alunos...
            </p>
          </div>
        ) : (
          <>
            <FormProvider {...methods}>
              <FormTurma
                onSubmit={handleCriarTurma}
                professores={professores}
                alunos={alunos}
                disciplinas={disciplinas}
              />
            </FormProvider>
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

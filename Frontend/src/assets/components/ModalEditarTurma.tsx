import { useEffect, useState } from "react";
import FormTurma, { type TurmaFormData } from "./FormTurma";
import { toast } from "react-toastify";
import { useForm, FormProvider } from "react-hook-form";
import {
  FaCheckCircle,
  FaBan,
  FaTrash,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";

interface Professor {
  id: string;
  usuario: {
    nome: string;
  };
}

interface Aluno {
  id: string;
  usuario: {
    nome: string;
  };
  turma?: {
    id: string;
  };
}

interface Turma {
  id: string;
  nome_turma: string;
  ano_letivo: string;
  turno: "MANHÃ" | "TARDE" | "NOITE";
  capacidade_maxima: number;
  ativa: boolean;
  alunos?: Aluno[];
  professor?: Professor;
  disciplinas?: any[];
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
  const token = localStorage.getItem("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [alunosNaTurma, setAlunosNaTurma] = useState<Aluno[]>([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<TurmaFormData>({
    defaultValues: {
      nome_turma: "",
      anoLetivo: "",
      turno: "MANHÃ",
      capacidade_maxima: 20,
      ativa: true,
    },
  });

  const { reset } = methods;

  useEffect(() => {
    const fetchDados = async () => {
      if (!aberto || !turma) return;

      setIsLoading(true);
      try {
        const professoresRes = await fetch(
          "http://localhost:3000/professores",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (professoresRes.ok) {
          const professoresData = await professoresRes.json();
          setProfessores(professoresData);
        }

        const alunosRes = await fetch("http://localhost:3000/alunos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (alunosRes.ok) {
          const todosAlunos = await alunosRes.json();

          const alunosNaTurmaAtual = todosAlunos.filter(
            (aluno: Aluno) => aluno.turma?.id === turma.id
          );

          const alunosDisponiveisAtual = todosAlunos.filter(
            (aluno: Aluno) => !aluno.turma || aluno.turma.id === turma.id
          );

          console.log("Total alunos:", todosAlunos.length);
          console.log("Alunos na turma:", alunosNaTurmaAtual.length);
          console.log("Alunos disponíveis:", alunosDisponiveisAtual.length);

          setAlunosNaTurma(alunosNaTurmaAtual);
          setAlunosDisponiveis(alunosDisponiveisAtual);
        } else {
          console.error("Erro ao buscar alunos:", alunosRes.status);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    if (aberto) {
      fetchDados();
    }
  }, [aberto, turma, token]);

  useEffect(() => {
    if (turma && aberto) {
      setSelectedProfessor(turma.professor?.id || "");

      reset({
        nome_turma: turma.nome_turma || "",
        anoLetivo: turma.ano_letivo || "",
        turno: turma.turno || "MANHÃ",
        capacidade_maxima: turma.capacidade_maxima || 20,
        ativa: turma.ativa ?? true,
      });
    }
  }, [turma, aberto, reset]);

  const buscarTurmaAtualizada = async () => {
    try {
      const res = await fetch(`http://localhost:3000/turmas/${turma.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Erro ao buscar turma atualizada:", error);
    }
    return null;
  };

  const buscarTodosAlunos = async () => {
    try {
      const res = await fetch("http://localhost:3000/alunos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
    return [];
  };

  const atualizarListas = async () => {
    try {
      const turmaAtualizada = await buscarTurmaAtualizada();

      const todosAlunos = await buscarTodosAlunos();

      if (turmaAtualizada && todosAlunos) {
        const alunosNaTurmaAtual = todosAlunos.filter(
          (aluno: Aluno) => aluno.turma?.id === turma.id
        );

        const alunosDisponiveisAtual = todosAlunos.filter(
          (aluno: Aluno) => !aluno.turma
        );

        console.log("Atualizando listas:");
        console.log("- Alunos na turma:", alunosNaTurmaAtual.length);
        console.log("- Alunos disponíveis:", alunosDisponiveisAtual.length);

        setAlunosNaTurma(alunosNaTurmaAtual);
        setAlunosDisponiveis(alunosDisponiveisAtual);
      }
    } catch (error) {
      console.error("Erro ao atualizar listas:", error);
    }
  };

  const adicionarAluno = async (alunoId: string) => {
    try {
      console.log(`Adicionando aluno ${alunoId} à turma ${turma.id}`);

      const res = await fetch(
        `http://localhost:3000/turmas/${turma.id}/alunos/${alunoId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao adicionar aluno");
      }

      toast.success("Aluno adicionado com sucesso!");

      await atualizarListas();

      onAtualizarLista();
    } catch (err: any) {
      console.error("Erro:", err);
      toast.error(`Erro ao adicionar aluno: ${err.message}`);
    }
  };

  const removerAluno = async (alunoId: string) => {
    try {
      console.log(`Removendo aluno ${alunoId} da turma ${turma.id}`);

      const res = await fetch(
        `http://localhost:3000/turmas/${turma.id}/alunos/${alunoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao remover aluno");
      }

      toast.success("Aluno removido com sucesso!");

      await atualizarListas();

      onAtualizarLista();
    } catch (err: any) {
      console.error("Erro:", err);
      toast.error(`Erro ao remover aluno: ${err.message}`);
    }
  };

  const definirProfessor = async () => {
    try {
      let res;

      if (!selectedProfessor) {
        res = await fetch(
          `http://localhost:3000/turmas/${turma.id}/professor`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        res = await fetch(
          `http://localhost:3000/turmas/${turma.id}/professor/${selectedProfessor}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao atualizar professor");
      }

      toast.success("Professor atualizado com sucesso!");
      onAtualizarLista();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  async function handleAtualizarTurma(data: TurmaFormData) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        nome_turma: data.nome_turma,
        anoLetivo: data.anoLetivo,
        turno: data.turno,
        capacidade_maxima: parseInt(data.capacidade_maxima.toString()),
        ativa: data.ativa,
      };

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
        throw new Error(err.message || "Erro ao atualizar turma");
      }

      toast.success("Dados da turma atualizados com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      toast.error(`Erro ao atualizar turma: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAtiva() {
    if (!turma) return;

    const novoStatus = !turma.ativa;
    if (
      !window.confirm(
        `Tem certeza que deseja ${
          novoStatus ? "ativar" : "desativar"
        } esta turma?`
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/turmas/${turma.id}/ativa`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ativa: novoStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao atualizar status da turma");
      }

      toast.success(
        `Turma ${novoStatus ? "ativada" : "desativada"} com sucesso!`
      );
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
  }

  async function handleExcluirTurma() {
    if (alunosNaTurma.length > 0) {
      toast.warning(
        "Não é possível excluir uma turma com alunos matriculados."
      );
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esta turma?")) return;

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
      toast.error(`Erro ao excluir turma: ${err.message}`);
    }
  }

  if (!aberto) return null;

  const alunosParaAdicionar = alunosDisponiveis.filter(
    (aluno) => !alunosNaTurma.some((a) => a.id === aluno.id) && !aluno.turma
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Turma: {turma.nome_turma}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D5D7F]"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div
                className={`p-3 rounded-lg mb-3 ${
                  turma.ativa
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        turma.ativa
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {turma.ativa ? "ATIVA" : "INATIVA"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {turma.ativa ? "Turma ativa" : "Turma inativa"}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleAtiva}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                      turma.ativa
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {turma.ativa ? (
                      <>
                        <FaBan className="w-3 h-3" /> Desativar
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="w-3 h-3" /> Ativar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <FormProvider {...methods}>
              <FormTurma onSubmit={handleAtualizarTurma} />
            </FormProvider>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#1D5D7F] mb-3">
                Professor Responsável
              </h3>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <select
                    value={selectedProfessor}
                    onChange={(e) => setSelectedProfessor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1D5D7F] focus:border-[#1D5D7F]"
                  >
                    <option value="">Nenhum professor</option>
                    {professores.map((professor) => (
                      <option key={`prof-${professor.id}`} value={professor.id}>
                        {professor.usuario?.nome ||
                          `Professor ${professor.id.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={definirProfessor}
                  className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66] flex items-center gap-2 whitespace-nowrap"
                >
                  {selectedProfessor
                    ? "Atualizar Professor"
                    : "Remover Professor"}
                </button>
              </div>

              {turma.professor && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    Professor atual:{" "}
                    <span className="font-semibold">
                      {turma.professor.usuario.nome}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#1D5D7F] mb-3">
                Alunos ({alunosNaTurma.length}/{turma.capacidade_maxima})
              </h3>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Alunos Matriculados:
                </h4>
                {alunosNaTurma.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Nenhum aluno matriculado
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {alunosNaTurma.map((aluno) => (
                      <div
                        key={`na-turma-${aluno.id}`}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <span className="text-sm">
                          {aluno.usuario?.nome ||
                            `Aluno ${aluno.id.substring(0, 8)}`}
                        </span>
                        <button
                          onClick={() => removerAluno(aluno.id)}
                          className="p-1 text-red-600 hover:text-red-800 flex items-center gap-1"
                          title="Remover aluno"
                        >
                          <FaUserMinus className="w-4 h-4" />
                          <span className="text-xs">Remover</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar novos alunos */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Adicionar Alunos:
                </h4>
                {alunosParaAdicionar.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Todos os alunos disponíveis já estão na turma
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {alunosParaAdicionar.map((aluno) => (
                      <div
                        key={`disponivel-${aluno.id}`}
                        className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200"
                      >
                        <span className="text-sm">
                          {aluno.usuario?.nome ||
                            `Aluno ${aluno.id.substring(0, 8)}`}
                        </span>
                        <button
                          onClick={() => adicionarAluno(aluno.id)}
                          className="p-1 text-green-600 hover:text-green-800 flex items-center gap-1"
                          title="Adicionar aluno"
                        >
                          <FaUserPlus className="w-4 h-4" />
                          <span className="text-xs">Adicionar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={handleExcluirTurma}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={alunosNaTurma.length > 0}
                  title={
                    alunosNaTurma.length > 0
                      ? `Remova todos os ${alunosNaTurma.length} aluno(s) primeiro`
                      : "Excluir turma"
                  }
                >
                  <FaTrash className="w-3 h-3" /> Excluir Turma
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={methods.handleSubmit(handleAtualizarTurma)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Dados da Turma"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

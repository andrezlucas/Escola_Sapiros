import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaBook } from "react-icons/fa";

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: { nome: string };
}

interface Habilidade {
  id: string;
  nome: string;
  descricao?: string;
}

interface Disciplina {
  id_disciplina: string;
  codigo_disciplina: string;
  nome_disciplina: string;
  cargaHoraria: number;
  turmas?: Turma[];
  professores?: Professor[];
  habilidades?: Habilidade[];
}

interface DisciplinaFormData {
  codigo_disciplina: string;
  nome_disciplina: string;
  cargaHoraria: number;
  turmasIds?: string[];
  professoresIds?: string[];
  habilidades?: { nome: string; descricao?: string }[];
}

interface ModalEditarDisciplinaProps {
  disciplina: Disciplina;
  aberto: boolean;
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalEditarDisciplina({
  disciplina,
  aberto,
  onClose,
  onAtualizarLista,
}: ModalEditarDisciplinaProps) {
  const methods = useForm<DisciplinaFormData>({
    defaultValues: {
      codigo_disciplina: "",
      nome_disciplina: "",
      cargaHoraria: 40,
      turmasIds: [],
      professoresIds: [],
      habilidades: [],
    },
  });

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState({
    turmas: false,
    professores: false,
  });

  const token = localStorage.getItem("token");

  const { reset, register, handleSubmit, watch, setValue } = methods;

  useEffect(() => {
    if (disciplina && aberto) {
      console.log("Disciplina recebida para edição:", disciplina);

      const turmasIds = disciplina.turmas?.map((t) => t.id) || [];
      const professoresIds = disciplina.professores?.map((p) => p.id) || [];
      const habilidades =
        disciplina.habilidades?.map((h) => ({
          nome: h.nome,
          descricao: h.descricao,
        })) || [];

      reset({
        codigo_disciplina: disciplina.codigo_disciplina || "",
        nome_disciplina: disciplina.nome_disciplina || "",
        cargaHoraria: disciplina.cargaHoraria || 40,
        turmasIds,
        professoresIds,
        habilidades,
      });
    }
  }, [disciplina, aberto, reset]);

  useEffect(() => {
    if (!aberto) return;

    async function fetchData() {
      try {
        setLoading({ turmas: true, professores: true });

        const [turmasRes, professoresRes] = await Promise.all([
          fetch("http://localhost:3000/turmas", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/professores", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const turmasData = await turmasRes.json();
        const professoresData = await professoresRes.json();

        setTurmas(turmasData);
        setProfessores(professoresData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar listas de turmas e professores");
      } finally {
        setLoading({ turmas: false, professores: false });
      }
    }

    fetchData();
  }, [aberto, token]);

  async function handleAtualizarDisciplina(data: DisciplinaFormData) {
    try {
      const payload = {
        codigo_disciplina: data.codigo_disciplina.trim(),
        nome_disciplina: data.nome_disciplina.trim(),
        cargaHoraria: Number(data.cargaHoraria),
        turmasIds: data.turmasIds || [],
        professoresIds: data.professoresIds || [],
        habilidades: data.habilidades?.filter((h) => h.nome.trim()) || [],
      };

      console.log("Payload PATCH para disciplina:", payload);

      const res = await fetch(
        `http://localhost:3000/disciplinas/${disciplina.id_disciplina}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          Array.isArray(err.message) ? err.message.join(", ") : err.message
        );
      }

      const disciplinaAtualizada = await res.json();
      console.log("Disciplina atualizada:", disciplinaAtualizada);

      toast.success("Disciplina atualizada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error("Erro ao atualizar disciplina:", err);
      toast.error(`Erro ao atualizar disciplina: ${err.message}`);
    }
  }

  async function handleExcluirDisciplina() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta disciplina?\nEsta ação não pode ser desfeita."
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/disciplinas/${disciplina.id_disciplina}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir disciplina");
      }

      toast.success("Disciplina excluída com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao excluir disciplina: ${err.message}`);
    }
  }

  const habilidades = watch("habilidades") || [];

  const adicionarHabilidade = () => {
    setValue("habilidades", [...habilidades, { nome: "", descricao: "" }]);
  };

  const removerHabilidade = (index: number) => {
    const novasHabilidades = habilidades.filter((_, i) => i !== index);
    setValue("habilidades", novasHabilidades);
  };

  const atualizarHabilidade = (
    index: number,
    campo: "nome" | "descricao",
    valor: string
  ) => {
    const novasHabilidades = [...habilidades];
    novasHabilidades[index] = { ...novasHabilidades[index], [campo]: valor };
    setValue("habilidades", novasHabilidades);
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Editar Disciplina
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <FaBook className="w-4 h-4 text-[#1D5D7F]" />
              <span className="text-sm text-gray-600">
                {disciplina.codigo_disciplina}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleAtualizarDisciplina)}
            className="space-y-4"
          >
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código da Disciplina *
                </label>
                <input
                  type="text"
                  {...register("codigo_disciplina", {
                    required: "Código é obrigatório",
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Disciplina *
                </label>
                <input
                  type="text"
                  {...register("nome_disciplina", {
                    required: "Nome é obrigatório",
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carga Horária (horas) *
              </label>
              <input
                type="number"
                {...register("cargaHoraria", {
                  required: "Carga horária é obrigatória",
                  min: { value: 1, message: "Mínimo 1 hora" },
                  max: { value: 200, message: "Máximo 200 horas" },
                })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turmas
              </label>
              <select
                {...register("turmasIds")}
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg h-32"
              >
                {loading.turmas ? (
                  <option>Carregando turmas...</option>
                ) : (
                  turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome_turma}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Segure Ctrl para selecionar múltiplas turmas
              </p>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professores
              </label>
              <select
                {...register("professoresIds")}
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg h-32"
              >
                {loading.professores ? (
                  <option>Carregando professores...</option>
                ) : (
                  professores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.usuario.nome}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Segure Ctrl para selecionar múltiplos professores
              </p>
            </div>

            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Habilidades
                </label>
                <button
                  type="button"
                  onClick={adicionarHabilidade}
                  className="flex items-center gap-1 px-2 py-1 bg-[#1D5D7F] text-white text-sm rounded hover:bg-[#164a66]"
                >
                  <FaPlus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {habilidades.map((habilidade, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start p-2 border border-gray-200 rounded"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={habilidade.nome}
                        onChange={(e) =>
                          atualizarHabilidade(index, "nome", e.target.value)
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="Nome da habilidade"
                      />
                      <input
                        type="text"
                        value={habilidade.descricao || ""}
                        onChange={(e) =>
                          atualizarHabilidade(
                            index,
                            "descricao",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border border-gray-300 rounded text-sm"
                        placeholder="Descrição (opcional)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removerHabilidade(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={handleExcluirDisciplina}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir Disciplina
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

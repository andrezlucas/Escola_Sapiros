import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: { nome: string };
}

interface DisciplinaFormData {
  codigo_disciplina: string;
  nome_disciplina: string;
  cargaHoraria: number;
  turmasIds?: string[];
  professoresIds?: string[];
  habilidades?: { nome: string; descricao?: string }[];
}

interface ModalCriarDisciplinaProps {
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalCriarDisciplina({
  onClose,
  onAtualizarLista,
}: ModalCriarDisciplinaProps) {
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

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
  }, []);

  async function fetchTurmas() {
    try {
      setLoading((prev) => ({ ...prev, turmas: true }));
      const res = await fetch("http://localhost:3000/turmas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar turmas");
      const data = await res.json();
      setTurmas(data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      toast.error("Erro ao carregar lista de turmas");
      setTurmas([]);
    } finally {
      setLoading((prev) => ({ ...prev, turmas: false }));
    }
  }

  async function fetchProfessores() {
    try {
      setLoading((prev) => ({ ...prev, professores: true }));
      const res = await fetch("http://localhost:3000/professores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar professores");
      const data = await res.json();
      setProfessores(data);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
      toast.error("Erro ao carregar lista de professores");
      setProfessores([]);
    } finally {
      setLoading((prev) => ({ ...prev, professores: false }));
    }
  }

  async function handleCriarDisciplina(data: DisciplinaFormData) {
    try {
      const payload = {
        codigo_disciplina: data.codigo_disciplina.trim(),
        nome_disciplina: data.nome_disciplina.trim(),
        cargaHoraria: Number(data.cargaHoraria),
        turmasIds: data.turmasIds || [],
        professoresIds: data.professoresIds || [],
        habilidades: data.habilidades?.filter((h) => h.nome.trim()) || [],
      };

      console.log("Payload POST para criar disciplina:", payload);

      const res = await fetch("http://localhost:3000/disciplinas", {
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

      const novaDisciplina = await res.json();
      console.log("Nova disciplina criada:", novaDisciplina);

      toast.success("Disciplina criada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar disciplina:", err);
      toast.error(`Erro ao criar disciplina: ${err.message}`);
    }
  }

  const { register, handleSubmit, watch, setValue } = methods;
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1D5D7F]">Criar Disciplina</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleCriarDisciplina)}
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
                  placeholder="Ex: MAT101"
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
                  placeholder="Ex: Matemática Básica"
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
                placeholder="Ex: 40"
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

            <div className="flex justify-end gap-2 pt-4 border-t">
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
                Salvar Disciplina
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

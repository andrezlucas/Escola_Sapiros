import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";

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

  const { register, handleSubmit, watch, setValue } = methods;

  const habilidades = watch("habilidades") || [];

  const [novaHabilidade, setNovaHabilidade] = useState("");
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
      if (!res.ok) throw new Error();
      setTurmas(await res.json());
    } catch {
      toast.error("Erro ao carregar lista de turmas");
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
      if (!res.ok) throw new Error();
      setProfessores(await res.json());
    } catch {
      toast.error("Erro ao carregar lista de professores");
    } finally {
      setLoading((prev) => ({ ...prev, professores: false }));
    }
  }

  const adicionarHabilidade = () => {
    const nome = novaHabilidade.trim();
    if (!nome) return;

    if (habilidades.some((h) => h.nome.toLowerCase() === nome.toLowerCase())) {
      toast.warn("Habilidade já adicionada");
      return;
    }

    setValue("habilidades", [...habilidades, { nome }], { shouldDirty: true });

    setNovaHabilidade("");
  };

  const removerHabilidade = (index: number) => {
    setValue(
      "habilidades",
      habilidades.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  async function handleCriarDisciplina(data: DisciplinaFormData) {
    try {
      const payload: any = {
        codigo_disciplina: data.codigo_disciplina.trim(),
        nome_disciplina: data.nome_disciplina.trim(),
        cargaHoraria: Number(data.cargaHoraria),
      };

      if (data.turmasIds?.length) payload.turmasIds = data.turmasIds;
      if (data.professoresIds?.length)
        payload.professoresIds = data.professoresIds;

      if (data.habilidades?.length) {
        payload.habilidades = data.habilidades.map((h) => ({
          nome: h.nome.trim(),
          descricao: h.descricao?.trim() || undefined,
        }));
      }

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
        throw new Error(err.message || "Erro ao criar disciplina");
      }

      toast.success("Disciplina criada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro inesperado");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1D5D7F]">
            Adicionar Nova Disciplina
          </h2>
          <button onClick={onClose} className="text-xl text-gray-500">
            ✕
          </button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleCriarDisciplina)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm mb-1">Código da disciplina</label>
              <input
                {...register("codigo_disciplina", { required: true })}
                className="w-full p-2 border rounded"
                placeholder="Ex: MAT001"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Nome da disciplina</label>
              <input
                {...register("nome_disciplina", { required: true })}
                className="w-full p-2 border rounded"
                placeholder="Ex: História"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Carga horária</label>
              <input
                type="number"
                {...register("cargaHoraria", { required: true })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Habilidades</label>

              <div className="flex flex-wrap gap-2 mb-2">
                {habilidades.map((habilidade, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 border rounded-full text-sm"
                  >
                    {habilidade.nome}
                    <button
                      type="button"
                      onClick={() => removerHabilidade(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={novaHabilidade}
                  onChange={(e) => setNovaHabilidade(e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder="Nova habilidade"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarHabilidade();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={adicionarHabilidade}
                  className="px-4 bg-[#1D5D7F] text-white rounded"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1D5D7F] text-white rounded"
              >
                Salvar
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

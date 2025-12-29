import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Input } from "./Input";

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: { nome: string };
}

interface Habilidade {
  id?: string;
  nome: string;
  descricao?: string;
}

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
  cargaHoraria: number;
  turmas?: Turma[];
  professores?: Professor[];
  habilidades?: Habilidade[];
}

interface DisciplinaFormData {
  nome_disciplina: string;
  cargaHoraria: number;
  turmasIds?: string[];
  professoresIds?: string[];
  habilidades?: Habilidade[];
}

interface Props {
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
}: Props) {
  const methods = useForm<DisciplinaFormData>();
  const { reset, register, handleSubmit, watch, setValue } = methods;

  const token = localStorage.getItem("token");
  const habilidades = watch("habilidades") || [];

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState({ turmas: false, professores: false });

  useEffect(() => {
    if (!aberto) return;

    reset({
      nome_disciplina: disciplina.nome_disciplina,
      cargaHoraria: disciplina.cargaHoraria,
      turmasIds: disciplina.turmas?.map((t) => t.id) || [],
      professoresIds: disciplina.professores?.map((p) => p.id) || [],
      habilidades:
        disciplina.habilidades?.map((h) => ({
          id: h.id,
          nome: h.nome,
          descricao: h.descricao,
        })) || [],
    });

    fetchTurmas();
    fetchProfessores();
  }, [aberto, disciplina, reset]);

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

  function adicionarHabilidade() {
    setValue("habilidades", [...habilidades, { nome: "", descricao: "" }]);
  }

  async function removerHabilidade(index: number) {
    const habilidade = habilidades[index];

    if (!habilidade.id) {
      setValue(
        "habilidades",
        habilidades.filter((_, i) => i !== index)
      );
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/disciplinas/habilidades/${habilidade.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir habilidade");
      }

      setValue(
        "habilidades",
        habilidades.filter((_, i) => i !== index)
      );

      toast.success("Habilidade excluída com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function criarNovasHabilidades(
    disciplinaId: string,
    habilidades: { nome: string; descricao?: string }[]
  ) {
    const novas = habilidades.filter((h) => h.nome && h.nome.trim().length > 0);

    for (const h of novas) {
      const res = await fetch(
        `http://localhost:3000/disciplinas/${disciplinaId}/habilidades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: h.nome.trim(),
            descricao: h.descricao?.trim() || "",
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao criar habilidade");
      }
    }
  }

  async function handleAtualizarDisciplina(data: DisciplinaFormData) {
    try {
      const habilidadesNovas = data.habilidades?.filter((h) => !h.id) || [];

      const res = await fetch(
        `http://localhost:3000/disciplinas/${disciplina.id_disciplina}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome_disciplina: data.nome_disciplina.trim(),
            cargaHoraria: Number(data.cargaHoraria),
            turmasIds: data.turmasIds || [],
            professoresIds: data.professoresIds || [],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      await criarNovasHabilidades(disciplina.id_disciplina, habilidadesNovas);

      toast.success("Disciplina atualizada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function excluirDisciplina() {
    if (!window.confirm("Tem certeza que deseja excluir esta disciplina?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/disciplinas/${disciplina.id_disciplina}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
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
      toast.error(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-auto">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Editar Disciplina</h2>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleAtualizarDisciplina)}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label={""}
                {...register("nome_disciplina", { required: true })}
                placeholder="Nome"
              />

              <Input
                label={""}
                type="number"
                {...register("cargaHoraria", { required: true })}
              />
            </div>

            <div>
              <span className="block text-sm mb-1 font-medium">Turmas</span>
              {turmas.map((t) => {
                const checked = watch("turmasIds")?.includes(t.id) || false;
                return (
                  <label key={t.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={t.id}
                      checked={checked}
                      onChange={(e) => {
                        const current = watch("turmasIds") || [];
                        if (e.target.checked) {
                          setValue("turmasIds", [...current, t.id]);
                        } else {
                          setValue(
                            "turmasIds",
                            current.filter((id) => id !== t.id)
                          );
                        }
                      }}
                    />
                    {t.nome_turma}
                  </label>
                );
              })}
            </div>

            <div>
              <span className="block text-sm mb-1 font-medium">
                Professores
              </span>
              {professores.map((p) => {
                const checked =
                  watch("professoresIds")?.includes(p.id) || false;
                return (
                  <label key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={p.id}
                      checked={checked}
                      onChange={(e) => {
                        const current = watch("professoresIds") || [];
                        if (e.target.checked) {
                          setValue("professoresIds", [...current, p.id]);
                        } else {
                          setValue(
                            "professoresIds",
                            current.filter((id) => id !== p.id)
                          );
                        }
                      }}
                    />
                    {p.usuario.nome}
                  </label>
                );
              })}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Habilidades</span>
                <button
                  type="button"
                  onClick={adicionarHabilidade}
                  className="flex items-center gap-1 text-sm bg-[#1D5D7F] text-white px-2 py-1 rounded"
                >
                  <FaPlus /> Adicionar
                </button>
              </div>

              {habilidades.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={h.nome}
                    onChange={(e) => {
                      const list = [...habilidades];
                      list[i].nome = e.target.value;
                      setValue("habilidades", list);
                    }}
                    placeholder="Nome da habilidade *"
                    label={""}
                  />
                  <Input
                    value={h.descricao || ""}
                    onChange={(e) => {
                      const list = [...habilidades];
                      list[i].descricao = e.target.value;
                      setValue("habilidades", list);
                    }}
                    placeholder="Descrição"
                    label={""}
                  />
                  <button
                    type="button"
                    onClick={() => removerHabilidade(i)}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={excluirDisciplina}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Excluir Disciplina
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="border px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1D5D7F] text-white px-4 py-2 rounded"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

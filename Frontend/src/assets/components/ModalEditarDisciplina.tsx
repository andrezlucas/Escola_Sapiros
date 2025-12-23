import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaBook } from "react-icons/fa";
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

  useEffect(() => {
    if (!aberto) return;

    reset({
      codigo_disciplina: disciplina.codigo_disciplina,
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
  }, [aberto, disciplina, reset]);

  function adicionarHabilidade() {
    setValue("habilidades", [...habilidades, { nome: "", descricao: "" }]);
  }

  async function removerHabilidade(index: number) {
    const habilidade = habilidades[index];

    // 👉 se ainda não foi salva, só remove do estado
    if (!habilidade.id) {
      setValue(
        "habilidades",
        habilidades.filter((_, i) => i !== index)
      );
      return;
    }

    // 👉 se já existe no banco, chama DELETE
    try {
      const res = await fetch(
        `http://localhost:3000/disciplinas/habilidades/${habilidade.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
            codigo_disciplina: data.codigo_disciplina.trim(),
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
      toast.error(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-auto">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Editar Disciplina</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaBook /> {disciplina.codigo_disciplina}
            </div>
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
                {...register("codigo_disciplina", { required: true })}
                placeholder="Código"
              />
              <Input
                label={""}
                {...register("nome_disciplina", { required: true })}
                placeholder="Nome"
              />
            </div>

            <Input
              label={""}
              type="number"
              {...register("cargaHoraria", { required: true })}
            />

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

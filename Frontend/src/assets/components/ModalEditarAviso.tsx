import { useEffect, useState, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormAviso from "./FormAviso";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";

interface AvisoEditar {
  id: string;
  nome: string;
  descricao: string;
  tipo: "GERAL" | "TURMA" | "INDIVIDUAL" | "PROFESSOR";
  categoria: string;
  dataInicio?: string;
  dataFinal?: string;
  turma?: {
    id: string;
    nome_turma: string;
  } | null;
  destinatarioAlunoId?: string | null;
}

interface Props {
  aviso: AvisoEditar;
  onClose: () => void;
  onSalvar: () => void;
}

const converterDataParaInput = (dataISO?: string): string => {
  if (!dataISO) return "";
  return dataISO.split("T")[0];
};

export default function ModalEditarAviso({ aviso, onClose, onSalvar }: Props) {
  const methods = useForm({
    defaultValues: {
      nome: aviso.nome,
      descricao: aviso.descricao,
      tipo: aviso.tipo,
      categoria: aviso.categoria || "ACADEMICO",
      dataInicio: converterDataParaInput(aviso.dataInicio),
      dataFinal: converterDataParaInput(aviso.dataFinal),
      turmaId: aviso.turma?.id || "",
      destinatarioAlunoId: aviso.destinatarioAlunoId || "",
    },
  });

  const { watch, register, handleSubmit, setValue } = methods;
  const tipo = watch("tipo");

  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const primeiraRender = useRef(true);

  useEffect(() => {
    if (primeiraRender.current) {
      primeiraRender.current = false;
      return;
    }

    if (tipo === "GERAL") {
      setValue("turmaId", "");
      setValue("destinatarioAlunoId", "");
    }

    if (tipo === "TURMA") {
      setValue("destinatarioAlunoId", "");
    }

    if (tipo === "INDIVIDUAL") {
      setValue("turmaId", "");
    }
  }, [tipo, setValue]);

  useEffect(() => {
    if (tipo === "TURMA") {
      fetch("http://localhost:3000/turmas", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setTurmas);
    }

    if (tipo === "INDIVIDUAL") {
      fetch("http://localhost:3000/alunos", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setAlunos);
    }
  }, [tipo, token]);

  async function handleSalvar(data: any) {
    if (data.tipo === "TURMA" && !data.turmaId) {
      toast.error("Selecione uma turma");
      return;
    }

    if (data.tipo === "INDIVIDUAL" && !data.destinatarioAlunoId) {
      toast.error("Selecione um aluno");
      return;
    }

    const payload: any = {
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      categoria: data.categoria,
      dataInicio: data.dataInicio,
      dataFinal: data.dataFinal || null,
    };

    if (data.tipo === "TURMA") payload.turmaId = data.turmaId;
    if (data.tipo === "INDIVIDUAL")
      payload.destinatarioAlunoId = data.destinatarioAlunoId;

    try {
      const response = await fetch(`http://localhost:3000/avisos/${aviso.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar aviso");
      }

      toast.success("Aviso atualizado com sucesso");
      onSalvar();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar aviso");
    }
  }

  async function ExcluirAviso() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este aviso?\nEsta ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/avisos/${aviso.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir aviso");
      }

      toast.success("Aviso excluído com sucesso");
      onSalvar();
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir aviso");
      console.error(error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">Editar Aviso</h2>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSalvar)} className="space-y-6">
            <FormAviso />

            {tipo === "TURMA" && (
              <select
                {...register("turmaId")}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1D5D7F]"
              >
                <option value="">Selecione a turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome_turma}
                  </option>
                ))}
              </select>
            )}

            {tipo === "INDIVIDUAL" && (
              <select
                {...register("destinatarioAlunoId")}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1D5D7F]"
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.usuario?.nome || a.nome}
                  </option>
                ))}
              </select>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:order-1 sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:order-2 sm:w-auto px-4 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#164863] transition-colors"
              >
                Salvar
              </button>

              <button
                type="button"
                onClick={ExcluirAviso}
                className="w-full sm:order-3 sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
              >
                <FaTrash className="w-3 h-3" />
                Excluir
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

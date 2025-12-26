import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormAviso from "./FormAviso";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { useRef } from "react";

interface AvisoEditar {
  id: string;
  nome: string;
  descricao: string;
  tipo: "GERAL" | "TURMA" | "INDIVIDUAL";
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

export default function ModalEditarAviso({ aviso, onClose, onSalvar }: Props) {
  const converterDataParaInput = (dataISO?: string): string => {
    if (!dataISO) return "";

    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "";

    const horasUTC = data.getUTCHours();
    const minutosUTC = data.getUTCMinutes();

    if (horasUTC === 0 && minutosUTC === 0) {
      const ano = data.getUTCFullYear();
      const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(data.getUTCDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  };

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

    const criarDataUTC = (dataString: string, isEndOfDay = false) => {
      const [year, month, day] = dataString.split("-");

      if (isEndOfDay) {
        return new Date(
          Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            23,
            59,
            59,
            999
          )
        );
      } else {
        return new Date(
          Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            0,
            0,
            0,
            0
          )
        );
      }
    };

    const isEndOfDayForFinal =
      data.categoria === "FERIADO" || data.tipo === "GERAL";

    const payload: any = {
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      categoria: data.categoria,
      dataInicio: criarDataUTC(data.dataInicio, false).toISOString(),
    };

    if (data.dataFinal && data.dataFinal.trim() !== "") {
      try {
        const dataFinalUTC = criarDataUTC(data.dataFinal, isEndOfDayForFinal);
        payload.dataFinal = dataFinalUTC.toISOString();
      } catch (error) {
        console.error("Erro ao converter data final:", error);
      }
    } else {
      payload.dataFinal = null;
    }

    console.log("📅 Editando aviso:", {
      dataInicioInput: data.dataInicio,
      dataFinalInput: data.dataFinal,
      dataInicioISO: payload.dataInicio,
      dataFinalISO: payload.dataFinal,
      isEndOfDayForFinal,
    });

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

      toast.success("Aviso atualizado");
      onSalvar();
      onClose();
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error(error.message || "Erro ao atualizar aviso");
    }
  }

  async function ExcluirAviso() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este aviso?\nEsta ação não pode ser desfeita."
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">Editar Aviso</h2>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Informação:</strong> Datas salvas:
            {aviso.dataInicio && (
              <span> Início: {formatarDataUTC(aviso.dataInicio)}</span>
            )}
            {aviso.dataFinal && (
              <span> - Final: {formatarDataUTC(aviso.dataFinal)}</span>
            )}
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSalvar)} className="space-y-6">
            <FormAviso />

            {tipo === "TURMA" && (
              <select
                {...register("turmaId")}
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Selecione o aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.usuario?.nome || a.nome}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg"
              >
                Salvar
              </button>

              <button
                onClick={ExcluirAviso}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FaTrash className="w-3 h-3" /> Excluir Aviso
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

function formatarDataUTC(dataString: string): string {
  if (!dataString) return "";
  const date = new Date(dataString);
  if (isNaN(date.getTime())) return "";

  const dia = date.getUTCDate().toString().padStart(2, "0");
  const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const ano = date.getUTCFullYear();

  return `${dia}/${mes}/${ano}`;
}

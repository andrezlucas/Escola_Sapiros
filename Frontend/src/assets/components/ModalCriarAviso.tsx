import { useForm, FormProvider } from "react-hook-form";
import FormAviso from "./FormAviso";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  onClose: () => void;
  onSalvar: () => void;
}

export interface Aviso {
  confirmado: unknown;
  aluno: any;
  id: string;
  nome: string;
  descricao: string;
  tipo: "GERAL" | "TURMA" | "INDIVIDUAL" | "PROFESSOR";
  categoria:
    | "ACADEMICO"
    | "SECRETARIA"
    | "EVENTO"
    | "URGENTE"
    | "FERIADO"
    | "TECNOLOGIA";
  turma?: {
    id: string;
    nome_turma: string;
  } | null;
  destinatarioAlunoId?: string;
  destinatarioProfessorId: string;
}

export default function ModalCriarAviso({ onClose, onSalvar }: Props) {
  const methods = useForm({
    defaultValues: {
      tipo: "GERAL",
      turmaId: "",
      destinatarioAlunoId: undefined,
      destinatarioProfessorId: undefined,
      categoria: "ACADEMICO",
    },
  });

  const { watch, register, handleSubmit, setValue } = methods;
  const tipo = watch("tipo");

  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [professor, setProfessor] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (tipo === "GERAL") {
      setValue("turmaId", "");
      setValue("destinatarioAlunoId", undefined);
      setValue("destinatarioProfessorId", undefined);
    }

    if (tipo === "TURMA") {
      setValue("destinatarioAlunoId", undefined);
      setValue("destinatarioProfessorId", undefined);
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
        .then((res) => res.json())
        .then(setTurmas);
    }

    if (tipo === "INDIVIDUAL") {
      fetch("http://localhost:3000/alunos", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((res) => {
          setAlunos(Array.isArray(res) ? res : res.data ?? []);
        });
    }
    if (tipo === "INDIVIDUAL") {
      fetch("http://localhost:3000/professores", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((res) => {
          setProfessor(Array.isArray(res) ? res : res.data ?? []);
        });
    }
  }, [tipo, token]);

  async function handleSalvar(data: any) {
    if (data.tipo === "TURMA" && !data.turmaId) {
      toast.error("Selecione uma turma");
      return;
    }

    if (
      data.tipo === "INDIVIDUAL" &&
      !data.destinatarioAlunoId &&
      !data.destinatarioProfessorId
    ) {
      toast.error("Selecione um aluno ou um Professor");
      return;
    }

    const payload: any = {
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      categoria: data.categoria,
      dataInicio: data.dataInicio,
    };
    if (data.dataFinal) {
      payload.dataFinal = data.dataFinal;
    }

    if (data.tipo === "TURMA") {
      payload.turmaId = data.turmaId;
    }

    if (data.tipo === "INDIVIDUAL") {
      payload.destinatarioAlunoId =
        data.destinatarioAlunoId?.trim() || undefined;

      payload.destinatarioProfessorId =
        data.destinatarioProfessorId?.trim() || undefined;
    }
    if (payload.destinatarioAlunoId === "") {
      delete payload.destinatarioAlunoId;
    }

    if (payload.destinatarioProfessorId === "") {
      delete payload.destinatarioProfessorId;
    }

    try {
      const response = await fetch("http://localhost:3000/avisos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar aviso");
      }

      toast.success("Aviso criado com sucesso");
      onSalvar();
      onClose();
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error(error.message || "Erro ao criar aviso");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">Criar Aviso</h2>

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
              <>
                <select
                  {...register("destinatarioAlunoId")}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Selecione o aluno (opcional)</option>
                  {alunos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.usuario?.nome || a.nome}
                    </option>
                  ))}
                </select>

                <select
                  {...register("destinatarioProfessorId")}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Selecione o professor (opcional)</option>
                  {professor.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.usuario?.nome || p.nome}
                    </option>
                  ))}
                </select>
              </>
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
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

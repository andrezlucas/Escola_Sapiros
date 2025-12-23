import { useState } from "react";
import FormTurma, { type TurmaFormData } from "./FormTurma";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ModalCriarTurmaProps {
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalCriarTurma({
  onClose,
  onAtualizarLista,
}: ModalCriarTurmaProps) {
  const methods = useForm<TurmaFormData>({
    defaultValues: {
      nome_turma: "",
      anoLetivo: new Date().getFullYear().toString(),
      turno: "MANHÃ",
      capacidade_maxima: 0,
      ativa: true,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  async function handleCriarTurma(data: TurmaFormData) {
    setIsSubmitting(true);
    try {
      const payload = {
        nome_turma: data.nome_turma,
        anoLetivo: data.anoLetivo,
        turno: data.turno,
        capacidade_maxima: parseInt(data.capacidade_maxima.toString()),
        ativa: data.ativa ?? true,
      };

      const res = await fetch("http://localhost:3000/turmas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(responseData.message) 
            ? responseData.message.join(", ") 
            : responseData.message || "Erro ao criar turma"
        );
      }

      toast.success("Turma criada com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error("Erro:", err);
      toast.error(`Erro ao criar turma: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1D5D7F]">
            Criar Nova Turma
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <FormProvider {...methods}>
          <FormTurma onSubmit={handleCriarTurma} />
        </FormProvider>
        
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={methods.handleSubmit(handleCriarTurma)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
          >
            {isSubmitting ? "Criando..." : "Criar Turma"}
          </button>
        </div>
      </div>
    </div>
  );
}
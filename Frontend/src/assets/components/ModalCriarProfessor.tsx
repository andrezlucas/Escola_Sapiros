import { useEffect, useState } from "react";
import FormProfessor, { type ProfessorFormData } from "./FormProfessor";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ModalCriarProfessorProps {
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalCriarProfessor({
  onClose,
  onAtualizarLista,
}: ModalCriarProfessorProps) {
  const methods = useForm<ProfessorFormData>({
    defaultValues: {
      sexo: "MASCULINO",
      role: "professor"
    },
  });
  const token = localStorage.getItem("token");

  async function handleCriarProfessor(data: ProfessorFormData) {
    try {
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return undefined;
        return new Date(dateString).toISOString();
      };

      const payload = {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ""),
        telefone: data.telefone.replace(/\D/g, ""),
        sexo: data.sexo,
        role: "professor",
        data_nascimento: formatDateForBackend(data.dataNascimento),
        enderecoLogradouro: data.enderecoLogradouro || undefined,
        enderecoNumero: data.enderecoNumero || undefined,
        enderecoCep: data.enderecoCep.replace(/\D/g, "") || undefined,
        enderecoComplemento: data.enderecoComplemento || undefined,
        enderecoBairro: data.enderecoBairro || undefined,
        enderecoEstado: data.enderecoEstado || undefined,
        enderecoCidade: data.enderecoCidade || undefined,
        cursoGraduacao: data.cursoGraduacao,
        instituicao: data.instituicao,
        dataInicioGraduacao: formatDateForBackend(data.dataInicioGraduacao),
        dataConclusaoGraduacao: data.dataConclusaoGraduacao
          ? formatDateForBackend(data.dataConclusaoGraduacao)
          : undefined,
      };

      console.log("Payload enviado:", payload); // Para debug

      const res = await fetch("http://localhost:3000/professores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao criar professor");
      }

      toast.success("Professor criado com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      toast.error(`Erro ao criar professor: ${err.message}`);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl max-h-[600px] rounded-xl p-4 overflow-auto">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">
          Criar Professor
        </h2>
        <FormProvider {...methods}>
          <FormProfessor onSubmit={handleCriarProfessor} />
        </FormProvider>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={methods.handleSubmit(handleCriarProfessor)}
            className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

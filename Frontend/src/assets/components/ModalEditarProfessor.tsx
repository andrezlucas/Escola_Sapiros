import { useEffect } from "react";
import FormProfessor, { type ProfessorFormData } from "./FormProfessor";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, FormProvider } from "react-hook-form";
import { FaCheckCircle, FaBan, FaTrash } from "react-icons/fa";
import ValidarCpf from "../utils/ValidarCpf";

interface Disciplina {
  id: string;
  nome: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    sexo: string;
    dataNascimento: string;
    isBlocked?: boolean;
    enderecoLogradouro?: string;
    enderecoNumero?: string;
    enderecoCep?: string;
    enderecoComplemento?: string;
    enderecoBairro?: string;
    enderecoEstado?: string;
    enderecoCidade?: string;
  };
  graduacao: string;
  instituicao: string;
  dataInicioGraduacao: string;
  dataConclusaoGraduacao?: string;
  turmas?: Turma[];
  disciplinas?: Disciplina[];
}

interface ModalEditarProfessorProps {
  professor: Professor;
  aberto: boolean;
  onClose: () => void;
  onAtualizarLista: () => void;
}

export default function ModalEditarProfessor({
  professor,
  aberto,
  onClose,
  onAtualizarLista,
}: ModalEditarProfessorProps) {
  const token = localStorage.getItem("token");

  const methods = useForm<ProfessorFormData>({
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      sexo: "MASCULINO",
      role: "professor",
      dataNascimento: "",
      enderecoLogradouro: "",
      enderecoNumero: "",
      enderecoCep: "",
      enderecoComplemento: "",
      enderecoBairro: "",
      enderecoEstado: "",
      enderecoCidade: "",
      cursoGraduacao: "",
      instituicao: "",
      dataInicioGraduacao: "",
      dataConclusaoGraduacao: "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (professor && aberto) {
      const usuario = professor.usuario;

      const sexoFormatado =
        usuario.sexo === "MASCULINO" ||
        usuario.sexo === "FEMININO" ||
        usuario.sexo === "OUTRO" ||
        usuario.sexo === "NAO_INFORMADO"
          ? (usuario.sexo as
              | "MASCULINO"
              | "FEMININO"
              | "OUTRO"
              | "NAO_INFORMADO")
          : "MASCULINO";

      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "";
        return dateString.split("T")[0];
      };

      reset({
        nome: usuario.nome ?? "",
        email: usuario.email ?? "",
        cpf: usuario.cpf ?? "",
        telefone: usuario.telefone ?? "",
        sexo: sexoFormatado,
        role: "professor",
        dataNascimento: formatDate(usuario.dataNascimento),
        enderecoLogradouro: usuario.enderecoLogradouro ?? "",
        enderecoNumero: usuario.enderecoNumero ?? "",
        enderecoCep: usuario.enderecoCep ?? "",
        enderecoComplemento: usuario.enderecoComplemento ?? "",
        enderecoBairro: usuario.enderecoBairro ?? "",
        enderecoEstado: usuario.enderecoEstado ?? "",
        enderecoCidade: usuario.enderecoCidade ?? "",
        cursoGraduacao: professor.graduacao ?? "",
        instituicao: professor.instituicao ?? "",
        dataInicioGraduacao: formatDate(professor.dataInicioGraduacao),
        dataConclusaoGraduacao: formatDate(professor.dataConclusaoGraduacao),
      });
    }
  }, [professor, aberto, reset]);

  async function handleAtualizarProfessor(data: ProfessorFormData) {
    try {
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return undefined;
        return `${dateString}T00:00:00.000Z`;
      };

      const payload = {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ""),
        telefone: data.telefone.replace(/\D/g, ""),
        sexo: data.sexo,
        role: "professor",
        cursoGraduacao: data.cursoGraduacao,
        instituicao: data.instituicao,
        dataInicioGraduacao: formatDateForBackend(data.dataInicioGraduacao),
        dataConclusaoGraduacao: data.dataConclusaoGraduacao
          ? formatDateForBackend(data.dataConclusaoGraduacao)
          : undefined,
      };

      const res = await fetch(
        `http://localhost:3000/professores/${professor.id}`,
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

      const professorAtualizado = await res.json();
      console.log("Professor atualizado retornado:", professorAtualizado);

      toast.success("Professor atualizado com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao atualizar professor: ${err.message}`);
    }
  }

  async function handleToggleBlock() {
    if (!professor) return;

    const novoStatus = !professor.usuario.isBlocked;
    const confirmMessage = novoStatus
      ? "Tem certeza que deseja bloquear este professor?\nEle não poderá acessar o sistema."
      : "Tem certeza que deseja desbloquear este professor?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(
        `http://localhost:3000/usuarios/${professor.id}/block`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isBlocked: novoStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao atualizar status do professor");
      }

      const usuarioAtualizado = await res.json();
      console.log("Professor bloqueio atualizado:", usuarioAtualizado);

      toast.success(
        `Professor ${novoStatus ? "bloqueado" : "desbloqueado"} com sucesso!`
      );

      onAtualizarLista();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error("Erro ao alternar bloqueio:", err);
      toast.error(`Erro: ${err.message}`);
    }
  }

  async function handleExcluirProfessor() {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este professor?\nEsta ação não pode ser desfeita."
      )
    )
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/professores/${professor.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir professor");
      }

      toast.success("Professor excluído com sucesso!");
      onAtualizarLista();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Erro ao excluir professor: ${err.message}`);
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl max-h-[600px] rounded-xl p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Editar Professor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div
            className={`p-3 rounded-lg mb-3 ${
              professor.usuario.isBlocked
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    professor.usuario.isBlocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {professor.usuario.isBlocked ? "BLOQUEADO" : "ATIVO"}
                </span>
                <span className="text-sm text-gray-600">
                  {professor.usuario.isBlocked
                    ? "Este professor não pode acessar o sistema."
                    : "Este professor pode acessar o sistema normalmente."}
                </span>
              </div>
              <button
                onClick={handleToggleBlock}
                className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                  professor.usuario.isBlocked
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {professor.usuario.isBlocked ? (
                  <>
                    <FaCheckCircle className="w-3 h-3" /> Desbloquear
                  </>
                ) : (
                  <>
                    <FaBan className="w-3 h-3" /> Bloquear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <FormProfessor onSubmit={handleAtualizarProfessor} />
        </FormProvider>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={handleExcluirProfessor}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrash className="w-3 h-3" /> Excluir Professor
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={methods.handleSubmit(handleAtualizarProfessor)}
                className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66]"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { toast } from "react-toastify";
import FormAtividade from "./FormAtividade";

type ModalEditarAtividadeProps = {
  atividade: any;
  onClose: () => void;
  onAtualizar: React.Dispatch<React.SetStateAction<any>>;
};

export default function ModalEditarAtividade({
  atividade,
  onClose,
  onAtualizar,
}: ModalEditarAtividadeProps) {
  async function excluirAtividade() {
    if (!confirm("Tem certeza que deseja excluir esta atividade?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/atividades/${atividade.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao excluir atividade");

      toast.success("Atividade excluída com sucesso!");
      onAtualizar(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir atividade");
    }
  }

  async function excluirQuestao(questaoId: string) {
    if (!confirm("Deseja realmente excluir esta questão?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/atividades/${atividade.id}/questoes/${questaoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao excluir questão");

      toast.success("Questão excluída com sucesso!");

      onAtualizar((prev: any) => ({
        ...prev,
        questoes: prev.questoes.filter((q: any) => q.id !== questaoId),
      }));
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir questão");
    }
  }
  return (
    <div className="">
      <div className="">
        <div className="flex justify-between items-center mb-4"></div>

        <FormAtividade
          key={atividade.id}
          atividadeId={atividade.id}
          onExcluirQuestao={excluirQuestao}
          onSubmitCallback={(atividadeAtualizada) => {
            onAtualizar(atividadeAtualizada);
            onClose();
          }}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={excluirAtividade}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Excluir
          </button>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

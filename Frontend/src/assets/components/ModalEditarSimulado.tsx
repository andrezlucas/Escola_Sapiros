import { toast } from "react-toastify";
import FormSimulado from "./FormSimulado"; 
import { useEffect, useState } from "react";

type ModalEditarSimuladoProps = {
  simulado: any;
  onClose: () => void;
  onAtualizar: (simuladoAtualizado: any | null) => void;
};

export default function ModalEditarSimulado({
  simulado,
  onClose,
  onAtualizar,
}: ModalEditarSimuladoProps) {
  const [simuladoCompleto, setSimuladoCompleto] = useState<any>(null);

  async function excluirSimulado() {
    if (
      !confirm(
        "Tem certeza que deseja excluir este simulado? Isso removerá todas as questões associadas."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/simulados/${simulado.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir simulado");
      }

      toast.success("Simulado excluído com sucesso!");
      onAtualizar(null);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir simulado");
    }
  }

  async function excluirQuestao(questaoId: string) {
    if (!confirm("Deseja realmente excluir esta questão?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:3000/simulados/${simulado.id}/questoes/${questaoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir questão");
      }

      toast.success("Questão excluída com sucesso!");

      onAtualizar((prev: any) => ({
        ...prev,
        questoes: prev.questoes.filter((q: any) => q.id !== questaoId),
      }));
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir questão");
    }
  }

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/simulados/${simulado.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error();

        const detalhes = await res.json();
        setSimuladoCompleto(detalhes);
      } catch {
        toast.error("Erro ao carregar simulado");
        onClose();
      }
    }

    carregarDetalhes();
  }, [simulado.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl p-6 my-8 mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Editar Simulado: {simulado.titulo}
          </h2>
        </div>

        <FormSimulado
          key={simulado.id}
          simuladoId={simulado.id}
          simuladoInicial={simuladoCompleto}
          onExcluirQuestao={excluirQuestao}
          onSubmitCallback={(simuladoAtualizado) => {
            onAtualizar(simuladoAtualizado);
            onClose();
          }}
        />

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={excluirSimulado}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
          >
            Excluir Simulado
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

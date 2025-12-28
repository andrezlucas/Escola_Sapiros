import { useEffect, useState } from "react";
import CardAviso from "./CardAviso";
import ModalVisualizarAviso from "./ModalVisualizarAviso";
import type { Aviso } from "./ModalCriarAviso";

interface Props {
  reload: boolean;
}

export default function MuralLista({ reload }: Props) {
  const [filter, setFilter] = useState<
    "todos" | "confirmados" | "nao-confirmados"
  >("todos");

  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avisoVisualizar, setAvisoVisualizar] = useState<Aviso | null>(null);

  async function carregarAvisos() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/avisos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar avisos");
      }

      const data = await response.json();

      const filtrados = data.filter(
        (aviso: Aviso) =>
          aviso.tipo === "GERAL" ||
          aviso.tipo === "TURMA" ||
          aviso.tipo === "INDIVIDUAL"
      );

      setAvisos(filtrados);
    } catch (error) {
      console.error("Erro ao carregar avisos:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmarAviso = async (avisoId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch(
        `http://localhost:3000/avisos/${avisoId}/confirmar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao confirmar aviso");
      }

      setAvisos((prev) =>
        prev.map((aviso) =>
          aviso.id === avisoId
            ? {
                ...aviso,
                confirmado: true,
                confirmadoEm: new Date().toISOString(),
              }
            : aviso
        )
      );
    } catch (error) {
      console.error("Erro ao confirmar aviso:", error);
      throw error;
    }
  };

  useEffect(() => {
    carregarAvisos();
  }, [reload]);

  const avisosFiltrados = avisos.filter((aviso) => {
    if (filter === "confirmados") return aviso.confirmado;
    if (filter === "nao-confirmados") return !aviso.confirmado;
    return true;
  });

  if (loading) {
    return <p className="text-gray-500">Carregando avisos...</p>;
  }

  if (!avisos.length) {
    return <p className="text-gray-500">Nenhum aviso disponível.</p>;
  }

  return (
    <>
      <div className="flex flex-row gap-4 mb-6">
        {[
          { key: "todos", label: "Todos" },
          { key: "confirmados", label: "Confirmados" },
          { key: "nao-confirmados", label: "Não confirmados" },
        ].map((item) => (
          <button
            key={item.key}
            className={`w-40 h-9 px-4 py-2 rounded-lg shadow flex justify-center items-center ${
              filter === item.key
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setFilter(item.key as any)}
          >
            <span className="text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {avisosFiltrados.map((aviso) => (
          <CardAviso
            key={aviso.id}
            aviso={aviso}
            onAtualizar={carregarAvisos}
            onVisualizar={(aviso) => setAvisoVisualizar(aviso)}
            onConfirmar={handleConfirmarAviso}
          />
        ))}
      </div>

      {avisoVisualizar && (
        <ModalVisualizarAviso
          aviso={avisoVisualizar}
          onClose={() => setAvisoVisualizar(null)}
        />
      )}
    </>
  );
}

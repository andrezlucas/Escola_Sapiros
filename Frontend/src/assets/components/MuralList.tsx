import { useEffect, useState } from "react";
import CardAviso from "./CardAviso";
import ModalVisualizarAviso from "./ModalVisualizarAviso";
import type { Aviso } from "./ModalCriarAviso";

interface Props {
  reload: boolean;
}

export default function MuralLista({ reload }: Props) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
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
          aviso.tipo === "TURMA" ||
          aviso.tipo === "INDIVIDUAL" ||
          aviso.tipo === "GERAL"
      );

      setAvisos(filtrados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmarAviso = async (avisoId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

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
        throw new Error(
          errorData.message || `Erro ao confirmar aviso: ${response.status}`
        );
      }

      setAvisos((prevAvisos) =>
        prevAvisos.map((aviso) =>
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

  if (loading) {
    return <p className="text-gray-500">Carregando avisos...</p>;
  }

  if (!avisos.length) {
    return <p className="text-gray-500">Nenhum aviso cadastrado.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {avisos.map((aviso) => (
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

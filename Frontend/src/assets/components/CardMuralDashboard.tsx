import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface AvisoDashboard {
  id: string;
  nome: string;
  descricao: string;
  categoria?: string;
}

interface CardMuralDashboardProps {
  onVerMural: () => void;
}

export default function CardMuralDashboard({
  onVerMural,
}: CardMuralDashboardProps) {
  const [avisos, setAvisos] = useState<AvisoDashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarAvisos() {
      try {
        const response = await fetch("http://localhost:3000/avisos", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        setAvisos(data.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar avisos", error);
      } finally {
        setLoading(false);
      }
    }

    carregarAvisos();
  }, []);

  return (
    <div className="w-full h-full p-6 rounded-xl bg-white shadow-md">
      <h2 className="text-xl font-bold text-[#1D5D7F] text-center pb-10">
        Mural de Avisos
      </h2>

      {loading && (
        <p className="text-center text-gray-400">Carregando avisos...</p>
      )}

      <div className="space-y-3">
        {!loading &&
          avisos.map((aviso) => (
            <ItemAviso key={aviso.id} aviso={aviso} onVerMural={onVerMural} />
          ))}
      </div>
    </div>
  );
}

function ItemAviso({
  aviso,
  onVerMural,
}: {
  aviso: AvisoDashboard;
  onVerMural: () => void;
}) {
  const cor = corPorCategoria(aviso.categoria);

  const truncarTexto = (texto: string, limite: number) => {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
  };

  return (
    <div className="flex items-center justify-between h-[64px] bg-[#EEF4FB] rounded-xl overflow-hidden">
      <div className="px-3 py-2 flex flex-col justify-center">
        <span className="font-semibold text-[13px] text-gray-900 leading-tight">
          {aviso.nome}
        </span>
        <span className="text-xs text-gray-500 line-clamp-1">
          {truncarTexto(aviso.descricao, 60)}
        </span>
      </div>

      <button
        className="h-full w-14 flex items-center justify-center"
        style={{ backgroundColor: cor }}
        aria-label="Ver mural"
        onClick={onVerMural}
      >
        <FaChevronRight className="text-black text-lg" />
      </button>
    </div>
  );
}

const cores: Record<string, string> = {
  ACADEMICO: "#3D7E8F",
  SECRETARIA: "#4CAF50",
  EVENTO: "#FF9800",
  URGENTE: "#F44336",
  FERIADO: "#9C27B0",
  TECNOLOGIA: "#2196F3",
};

const corPorCategoria = (categoria?: string) =>
  cores[categoria ?? ""] || "#3D7E8F";

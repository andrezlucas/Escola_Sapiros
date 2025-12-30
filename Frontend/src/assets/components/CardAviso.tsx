import { useEffect, useState } from "react";
import ModalEditarAviso from "./ModalEditarAviso";
import type { Aviso } from "./ModalCriarAviso";
import { toast } from "react-toastify";

interface Props {
  aviso: Aviso & {
    categoria?: string;
    confirmado?: boolean;
    confirmadoEm?: string;
  };
  onAtualizar: () => void;
  onVisualizar?: (aviso: Aviso) => void;
  onConfirmar?: (id: string) => Promise<void>;
}

const cores: Record<string, string> = {
  ACADEMICO: "#3D7E8F",
  SECRETARIA: "#4CAF50",
  EVENTO: "#FF9800",
  URGENTE: "#F44336",
  FERIADO: "#9C27B0",
  TECNOLOGIA: "#2196F3",
};

const categoriaConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  ACADEMICO: {
    label: "Avisos Acadêmicos",
    color: cores.ACADEMICO,
    bgColor: `${hexToRgba(cores.ACADEMICO, 0.1)}`,
  },
  SECRETARIA: {
    label: "Secretaria/Administrativo",
    color: cores.SECRETARIA,
    bgColor: `${hexToRgba(cores.SECRETARIA, 0.1)}`,
  },
  EVENTO: {
    label: "Eventos/Comunicados gerais",
    color: cores.EVENTO,
    bgColor: `${hexToRgba(cores.EVENTO, 0.1)}`,
  },
  URGENTE: {
    label: "Avisos Urgentes",
    color: cores.URGENTE,
    bgColor: `${hexToRgba(cores.URGENTE, 0.1)}`,
  },
  FERIADO: {
    label: "Feriados e Recessos",
    color: cores.FERIADO,
    bgColor: `${hexToRgba(cores.FERIADO, 0.1)}`,
  },
  TECNOLOGIA: {
    label: "Tecnologia/Portal Acadêmico",
    color: cores.TECNOLOGIA,
    bgColor: `${hexToRgba(cores.TECNOLOGIA, 0.1)}`,
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatarData(data: string | Date) {
  const date = new Date(data);
  return date.toLocaleDateString("pt-BR");
}

function formatarDataHora(data: string | Date) {
  const date = new Date(data);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const getCategoriaConfig = (categoriaKey?: string) => {
  if (!categoriaKey || !categoriaConfig[categoriaKey]) {
    return {
      label: "Geral",
      color: "#6B7280",
      bgColor: "rgba(107, 114, 128, 0.1)",
    };
  }
  return categoriaConfig[categoriaKey];
};

export default function CardAviso({
  aviso,
  onAtualizar,
  onVisualizar,
  onConfirmar,
}: Props) {
  const [editarAberto, setEditarAberto] = useState(false);
  const [avisoSelecionado, setAvisoSelecionado] = useState<Aviso | null>(null);
  const [nomeAluno, setNomeAluno] = useState<string | null>(null);
  const [estaConfirmando, setEstaConfirmando] = useState(false);
  const [estaConfirmado, setEstaConfirmado] = useState(
    aviso.confirmado || false
  );

  const role = localStorage.getItem("role");
  const categoria = getCategoriaConfig(aviso.categoria);

  useEffect(() => {
    if (aviso.tipo === "INDIVIDUAL" && aviso.destinatarioAlunoId) {
      fetch(`http://localhost:3000/alunos/${aviso.destinatarioAlunoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setNomeAluno(data.usuario?.nome ?? "Aluno não informado");
        })
        .catch(() => setNomeAluno("Aluno não informado"));
    }
  }, [aviso]);

  const handleConfirmar = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (role === "coordenacao") {
      setEditarAberto(true);
      return;
    }

    if (estaConfirmado) return;

    try {
      setEstaConfirmando(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/avisos/${aviso.id}/confirmar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Erro ao confirmar aviso");
      }

      setEstaConfirmado(true);
      onAtualizar();
    } catch (error) {
      console.error("Erro ao confirmar aviso:", error);
      toast.error("Erro ao confirmar aviso. Tente novamente.");
    } finally {
      setEstaConfirmando(false);
    }
  };

  return (
    <>
      <div
        className={`border-l-4 rounded-r-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 bg-white ${
          estaConfirmado ? "opacity-80" : ""
        }`}
        style={{
          borderLeftColor: categoria.color,
          backgroundColor: "white",
        }}
        onClick={() => {
          setAvisoSelecionado(aviso);
          onVisualizar?.(aviso);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-1 rounded"
              style={{
                backgroundColor: categoria.bgColor,
                color: categoria.color,
              }}
            >
              {categoria.label}
            </span>
          </div>

          <div className="text-right">
            {estaConfirmado && aviso.confirmadoEm && (
              <span className="text-xs text-green-600 block mt-1">
                Confirmado em: {formatarDataHora(aviso.confirmadoEm)}
              </span>
            )}
          </div>
        </div>

        <h4 className="font-bold text-lg mt-2 text-gray-900">{aviso.nome}</h4>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {aviso.descricao}
        </p>

        {role === "coordenacao" &&
          aviso.tipo === "TURMA" &&
          aviso.turma?.nome_turma && (
            <p className="text-xs text-gray-700 mt-2">
              <span className="font-semibold">Turma:</span>{" "}
              {aviso.turma.nome_turma}
            </p>
          )}

        {role === "coordenacao" && aviso.tipo === "INDIVIDUAL" && (
          <p className="text-xs text-gray-700 mt-2">
            <span className="font-semibold">Aluno:</span>{" "}
            {nomeAluno || "Carregando..."}
          </p>
        )}

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500"></span>

          <div className="flex gap-2">
            <button
              className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setAvisoSelecionado(aviso);
                onVisualizar?.(aviso);
              }}
            >
              Visualizar Detalhes
            </button>

            <button
              className={`text-xs px-3 py-1.5 text-white rounded transition-colors ${
                estaConfirmando ? "opacity-70 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor:
                  role === "coordenacao"
                    ? categoria.color
                    : estaConfirmado
                    ? "#4CAF50"
                    : categoria.color,
              }}
              onClick={handleConfirmar}
              disabled={estaConfirmando}
            >
              {estaConfirmando
                ? "Confirmando..."
                : role === "coordenacao"
                ? "Editar"
                : estaConfirmado
                ? "Confirmado ✓"
                : "Confirmar"}
            </button>
          </div>
        </div>
      </div>

      {editarAberto && (
        <ModalEditarAviso
          aviso={aviso}
          onClose={() => setEditarAberto(false)}
          onSalvar={onAtualizar}
        />
      )}
    </>
  );
}

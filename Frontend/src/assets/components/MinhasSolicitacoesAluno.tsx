import { useEffect, useState } from "react";
import {
  Loader2,
  FileText,
  Search,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

interface Solicitacao {
  id: string;
  protocolo: string;
  tipoDocumento: string;
  formaEntrega: string;
  status: string;
  motivo?: string;
  criadoEm: string; // ← alterei para o nome real do backend
  atualizadoEm?: string;
}

const TIPOS_DOCUMENTO_LABEL: Record<string, string> = {
  atestado_matricula: "Atestado de Matrícula",
  historico_escolar: "Histórico Escolar",
  declaracao_vinculo_servidor: "Declaração de Vínculo de Servidor",
  atestado_vaga: "Atestado de Vaga",
  declaracao_matricula: "Declaração de Matrícula",
  declaracao_frequencia: "Declaração de Frequência",
  declaracao_conclusao: "Declaração de Conclusão",
  boletim: "Boletim Escolar",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; cor: string; icone: any }
> = {
  pendente: { label: "Pendente", cor: "yellow-600", icone: Clock },
  em_andamento: { label: "Em Andamento", cor: "blue-600", icone: Clock },
  aprovado: { label: "Aprovado", cor: "purple-600", icone: CheckCircle },
  rejeitado: { label: "Rejeitado", cor: "red-600", icone: XCircle },
  concluido: { label: "Concluído", cor: "green-600", icone: CheckCircle },
};

type FiltroStatus =
  | "Todos"
  | "pendente"
  | "em_andamento"
  | "aprovado"
  | "rejeitado"
  | "concluido";

function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export default function MinhasSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("Todos");

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        "http://localhost:3000/documentos/solicitacoes/minhas"
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSolicitacoes(data);
    } catch {
      toast.error("Erro ao carregar suas solicitações");
    } finally {
      setLoading(false);
    }
  };

  async function abrirPdf(id: string) {
    try {
      const res = await authFetch(
        `http://localhost:3000/documentos/solicitacoes/${id}/pdf`,
        { headers: { Accept: "application/pdf" } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Documento não disponível");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Não foi possível abrir o documento");
    }
  }

  const solicitacoesFiltradas = solicitacoes
    .sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    )
    .filter((s) => filtroStatus === "Todos" || s.status === filtroStatus)
    .filter(
      (s) =>
        TIPOS_DOCUMENTO_LABEL[s.tipoDocumento]
          ?.toLowerCase()
          .includes(busca.toLowerCase()) ||
        s.tipoDocumento.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <div>
      <p className="text-gray-600 mb-8">
        Acompanhe o status das suas solicitações de documentos.
      </p>

      <div className="mb-8">
        <label className="flex items-center gap-3 px-4 py-3 bg-[#e6eef880] rounded-2xl border-2 border-[#1D5D7F] w-full max-w-md">
          <Search className="w-5 h-5 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar por tipo de documento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F]"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        {[
          "Todos",
          "pendente",
          "em_andamento",
          "aprovado",
          "rejeitado",
          "concluido",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status as FiltroStatus)}
            className={`min-w-32 px-6 py-3 rounded-lg shadow font-bold text-sm transition-all ${
              filtroStatus === status
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
          >
            {status === "Todos"
              ? "Todos"
              : STATUS_CONFIG[status]?.label || status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#1D5D7F]" size={50} />
        </div>
      ) : solicitacoesFiltradas.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-xl">
          Nenhuma solicitação encontrada.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solicitacoesFiltradas.map((sol) => {
            const statusInfo = STATUS_CONFIG[sol.status] || {
              label: sol.status,
              cor: "gray-600",
              icone: Clock,
            };
            const Icon = statusInfo.icone;

            return (
              <div
                key={sol.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-[#1D5D7F]" />
                  <h3 className="font-bold text-lg">
                    {TIPOS_DOCUMENTO_LABEL[sol.tipoDocumento] ||
                      sol.tipoDocumento.replace(/_/g, " ")}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-2">
                  Entrega:{" "}
                  <span className="font-medium">{sol.formaEntrega}</span>
                </p>

                {sol.motivo && (
                  <p className="text-gray-500 text-sm mb-3 italic">
                    Motivo: {sol.motivo}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm mb-4">
                  <Icon className={`text-${statusInfo.cor}`} size={18} />
                  <span className={`text-${statusInfo.cor} font-medium`}>
                    {statusInfo.label}
                  </span>
                </div>

                <button
                  onClick={() => abrirPdf(sol.id)}
                  disabled={sol.status !== "concluido"}
                  className={`
                    w-full mt-2 py-3 rounded-lg font-bold transition
                    ${
                      sol.status === "concluido"
                        ? "bg-[#1D5D7F] text-white hover:opacity-90"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  Visualizar PDF
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

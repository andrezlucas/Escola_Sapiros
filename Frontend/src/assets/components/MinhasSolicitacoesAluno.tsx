import { useEffect, useState } from "react";
import { Loader2, FileText, Search, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

interface Solicitacao {
  id: string;
  tipoDocumento: string;
  formaEntrega: string;
  status: "pendente" | "em_andamento" | "concluido";
  createdAt: string;
}

type FiltroStatus = "Todos" | "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";

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

const TIPOS_DOCUMENTO_LABEL: Record<string, string> = {
  DECLARACAO_MATRICULA: "Declaração de Matrícula",
  DECLARACAO_FREQUENCIA: "Declaração de Frequência",
  DECLARACAO_CONCLUSAO: "Declaração de Conclusão",
  HISTORICO_ESCOLAR: "Histórico Escolar",
  BOLETIM: "Boletim",
};

export default function MinhasSolicitacoes() {
  const API_URL = "http://localhost:3000";

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
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  async function abrirPdf(id: string) {
    try {
      const res = await authFetch(
        `http://localhost:3000/documentos/solicitacoes/${id}/pdf`
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch {
      toast.error("Erro ao abrir o documento");
    }
  }

  const solicitacoesFiltradas = solicitacoes
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .filter((s) => {
      if (filtroStatus === "Todos") return true;
      return s.status === filtroStatus.toLowerCase();
    })
    .filter((s) => s.tipoDocumento.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <p className="text-gray-600 mb-8">
        Acompanhe o status dos documentos solicitados.
      </p>

      <div className="mb-8">
        <label className="flex items-center gap-3 px-4 py-3 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full max-w-md">
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
        {(
          ["Todos", "PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"] as FiltroStatus[]
        ).map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`min-w-32 px-6 py-3 rounded-lg shadow font-bold text-sm transition-all ${
              filtroStatus === status
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
          >
            {status === "Todos"
              ? "Todos"
              : status === "PENDENTE"
              ? "Pendentes"
              : status === "EM_ANDAMENTO"
              ? "Em andamento"
              : "Concluídos"}
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
          {solicitacoesFiltradas.map((sol) => (
            <div
              key={sol.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-[#1D5D7F]" />
                <h3 className="font-bold text-lg">
                  {TIPOS_DOCUMENTO_LABEL[sol.tipoDocumento] ??
                    sol.tipoDocumento.replaceAll("_", " ")}
                </h3>
              </div>

              <p className="text-gray-600 text-sm mb-2">
                Forma de entrega:{" "}
                <span className="font-medium">{sol.formaEntrega}</span>
              </p>

              <div className="flex items-center gap-2 text-sm mb-4">
                {sol.status === "pendente" && (
                  <>
                    <Clock className="text-yellow-500" size={18} />
                    <span className="text-yellow-600 font-medium">
                      Pendente
                    </span>
                  </>
                )}

                {sol.status === "em_andamento" && (
                  <>
                    <Clock className="text-blue-500" size={18} />
                    <span className="text-blue-600 font-medium">
                      Em andamento
                    </span>
                  </>
                )}

                {sol.status === "concluido" && (
                  <>
                    <CheckCircle className="text-green-600" size={18} />
                    <span className="text-green-600 font-medium">
                      Concluído
                    </span>
                  </>
                )}
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
                Abrir Documento (PDF)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

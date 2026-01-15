import { useEffect, useState } from "react";
import { FaFilePdf, FaPlay, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import Tabela, { type Coluna } from "../components/Tabela";

type Status = "pendente" | "em_andamento" | "concluido";

type Documento = {
  id: string;
  protocolo: string;
  aluno: { nome: string };
  tipoDocumento: string;
  createdAt: string;
  status: Status;
};

type ResumoDashboard = {
  pendentes: number;
  emAndamento: number;
  concluidos: number;
};

const API_URL = "http://localhost:3000";

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

function StatusBadge({ status }: { status: Status }) {
  const estilos = {
    pendente: "bg-orange-100 text-orange-600",
    em_andamento: "bg-blue-100 text-blue-600",
    concluido: "bg-green-100 text-green-600",
  };

  const label = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluido: "Concluído",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${estilos[status]}`}
    >
      {label[status]}
    </span>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="border border-[#1D5D7F] rounded-xl p-5">
      <span className="text-3xl font-bold text-[#1D5D7F]">{valor}</span>
      <p className="text-sm text-gray-600">{titulo}</p>
    </div>
  );
}

export default function DocumentoCoordenacao() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [resumo, setResumo] = useState<ResumoDashboard>({
    pendentes: 0,
    emAndamento: 0,
    concluidos: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([fetchSolicitacoes(), fetchResumo()]);
  }

  async function fetchSolicitacoes() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/documentos/solicitacoes`);
      if (!res.ok) throw new Error();

      const data: Documento[] = await res.json();
      setDocumentos(data);
    } catch {
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  }

  async function fetchResumo() {
    try {
      const res = await authFetch(
        `${API_URL}/documentos/solicitacoes/dashboard`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setResumo(data);
    } catch {
      toast.error("Erro ao carregar resumo");
    }
  }

  async function atualizarStatus(
    id: string,
    status: "em_andamento" | "concluido"
  ) {
    try {
      const res = await authFetch(
        `${API_URL}/documentos/solicitacoes/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Status atualizado");
      carregarTudo();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  function abrirPdf(id: string) {
    window.open(`${API_URL}/documentos/solicitacoes/${id}/pdf`, "_blank");
  }

  const colunas: Coluna<Documento>[] = [
    { titulo: "Protocolo", render: (item) => item.protocolo },
    { titulo: "Aluno", render: (item) => item.aluno.nome },
    {
      titulo: "Documento",
      render: (item) => item.tipoDocumento.replaceAll("_", " "),
    },
    {
      titulo: "Data",
      render: (item) => new Date(item.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      titulo: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md flex flex-col gap-6">
      <h1 className="text-4xl text-[#1D5D7F]">Documentos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Resumo titulo="Solicitações Pendentes" valor={resumo.pendentes} />
        <Resumo titulo="Em Andamento" valor={resumo.emAndamento} />
        <Resumo titulo="Solicitações Concluídas" valor={resumo.concluidos} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="text-[#1D5D7F] text-lg font-semibold">
            Carregando solicitações...
          </span>
        </div>
      ) : (
        <Tabela
          dados={documentos}
          colunas={colunas}
          renderExtra={(item) => (
            <div className="flex gap-3 text-[#1D5D7F]">
              {item.status === "pendente" && (
                <button
                  title="Iniciar"
                  onClick={() => atualizarStatus(item.id, "em_andamento")}
                >
                  <FaPlay />
                </button>
              )}

              {item.status === "em_andamento" && (
                <button
                  title="Concluir"
                  onClick={() => atualizarStatus(item.id, "concluido")}
                >
                  <FaCheck />
                </button>
              )}

              {item.status === "concluido" && (
                <button
                  title="Visualizar PDF"
                  onClick={() => abrirPdf(item.id)}
                >
                  <FaFilePdf />
                </button>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}

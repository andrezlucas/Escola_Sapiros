import { useEffect, useState } from "react";
import { FaFilePdf, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import Tabela, { type Coluna } from "../components/Tabela";

type Status =
  | "pendente"
  | "em_andamento"
  | "aprovado"
  | "rejeitado"
  | "concluido";

type Documento = {
  id: string;
  protocolo: string;
  aluno: { usuario: { nome: string } };
  tipoDocumento: string;
  criadoEm: string;
  status: Status;
  formaEntrega?: string;
  atendidoPor?: { nome: string };
};

type ResumoDashboard = {
  pendentes: number;
  emAndamento: number;
  concluidos: number;
};

const API_URL = "http://localhost:3000";

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
    pendente: "bg-orange-100 text-orange-800",
    em_andamento: "bg-blue-100 text-blue-800",
    aprovado: "bg-purple-100 text-purple-800",
    rejeitado: "bg-red-100 text-red-800",
    concluido: "bg-green-100 text-green-800",
  };

  const label = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    concluido: "Concluído",
  };

  return (
    <span
      className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap ${estilos[status]}`}
    >
      {label[status]}
    </span>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="border border-[#1D5D7F] rounded-xl p-3 md:p-5 text-center flex flex-col justify-center">
      <span className="text-2xl md:text-3xl font-bold text-[#1D5D7F]">
        {valor}
      </span>
      <p className="text-[10px] md:text-sm text-gray-600 mt-1 uppercase md:normal-case tracking-wider md:tracking-normal">
        {titulo}
      </p>
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
    setLoading(true);
    await Promise.all([fetchSolicitacoes(), fetchResumo()]);
    setLoading(false);
  }

  async function fetchSolicitacoes() {
    try {
      const res = await authFetch(`${API_URL}/documentos/solicitacoes`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocumentos(data);
    } catch {
      toast.error("Erro ao carregar solicitações");
    }
  }

  async function fetchResumo() {
    try {
      const res = await authFetch(
        `${API_URL}/documentos/solicitacoes/dashboard`,
      );
      if (!res.ok) throw new Error();
      setResumo(await res.json());
    } catch {
      toast.error("Erro ao carregar dashboard");
    }
  }

  async function gerarEEnviar(id: string) {
    try {
      const res = await authFetch(`${API_URL}/documentos/${id}/enviar`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Falha ao processar");
      }

      toast.success("Documento gerado e enviado com sucesso!");
      carregarTudo();
    } catch (err: any) {
      toast.error(
        "Erro: " + (err.message || "Não foi possível enviar o documento"),
      );
    }
  }

  function abrirPdf(id: string) {
    window.open(`${API_URL}/documentos/solicitacoes/${id}/pdf`, "_blank");
  }

  const colunas: Coluna<Documento>[] = [
    {
      titulo: "Protocolo",
      render: (item) => (
        <span className="text-[11px] md:text-sm">{item.protocolo}</span>
      ),
    },
    {
      titulo: "Aluno",
      render: (item) => (
        <span className="text-[11px] md:text-sm truncate max-w-[80px] md:max-w-none block">
          {item.aluno?.usuario?.nome || "—"}
        </span>
      ),
    },
    {
      titulo: "Documento",
      render: (item) => (
        <span className="text-[11px] md:text-sm truncate max-w-[100px] md:max-w-none block">
          {TIPOS_DOCUMENTO_LABEL[item.tipoDocumento] ||
            item.tipoDocumento.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      titulo: "Data",
      render: (item) => (
        <span className="text-[11px] md:text-sm">
          {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
    {
      titulo: "Status",
      render: (item) => <StatusBadge status={item.status as Status} />,
    },
  ];

  return (
    <div className="w-full bg-white rounded-xl p-4 md:p-6 shadow-md flex flex-col gap-4 md:gap-6">
      <h1 className="text-2xl md:text-4xl text-[#1D5D7F]  md:font-normal">
        Gerenciamento de Documentos
      </h1>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-2 md:mb-6">
        <Resumo titulo="Pendentes" valor={resumo.pendentes} />
        <Resumo titulo="Em Andamento" valor={resumo.emAndamento} />
        <Resumo titulo="Concluídos" valor={resumo.concluidos} />
      </div>

      {loading ? (
        <div className="flex justify-center py-10 md:py-20">
          <span className="text-[#1D5D7F] text-base md:text-lg font-semibold">
            Carregando...
          </span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Tabela
            dados={documentos}
            colunas={colunas}
            renderExtra={(item) => (
              <div className="flex gap-3 md:gap-4 text-[#1D5D7F] text-lg md:text-xl">
                {item.status !== "concluido" && (
                  <button
                    title="Gerar e Enviar Documento"
                    onClick={() => gerarEEnviar(item.id)}
                    className="hover:text-green-600 transition"
                  >
                    <FaPaperPlane />
                  </button>
                )}

                {item.status === "concluido" && (
                  <button
                    title="Visualizar PDF"
                    onClick={() => abrirPdf(item.id)}
                    className="hover:text-blue-600 transition"
                  >
                    <FaFilePdf />
                  </button>
                )}
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

import { FaFilePdf, FaPaperPlane, FaPrint } from "react-icons/fa";
import Tabela, { type Coluna } from "../components/Tabela";

type Documento = {
  protocolo: string;
  aluno: string;
  documento: string;
  data: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
};

const documentosMock: Documento[] = [
  {
    protocolo: "20250001",
    aluno: "Luana Moraes",
    documento: "Comprovante de matrícula",
    data: "14/11/2025",
    status: "PENDENTE",
  },
  {
    protocolo: "20250002",
    aluno: "Paulo Ricardo",
    documento: "Ficha 19",
    data: "10/11/2025",
    status: "EM_ANDAMENTO",
  },
  {
    protocolo: "20250003",
    aluno: "Mariana Kottas",
    documento: "Declaração de conclusão",
    data: "08/11/2025",
    status: "CONCLUIDO",
  },
];

function StatusBadge({ status }: { status: Documento["status"] }) {
  const estilos = {
    PENDENTE: "bg-orange-100 text-orange-600",
    EM_ANDAMENTO: "bg-blue-100 text-blue-600",
    CONCLUIDO: "bg-green-100 text-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${estilos[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

const colunas: Coluna<Documento>[] = [
  { titulo: "Protocolo", render: (item) => item.protocolo },
  { titulo: "Aluno", render: (item) => item.aluno },
  { titulo: "Documento", render: (item) => item.documento },
  { titulo: "Data", render: (item) => item.data },
  {
    titulo: "Status",
    render: (item) => <StatusBadge status={item.status} />,
  },
];

function DocumentoCoordenacao() {
  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md flex flex-col gap-6">
      <h1 className="text-4xl text-[#1D5D7F]">Documentos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Resumo titulo="Solicitações Pendentes" valor={15} />
        <Resumo titulo="Em Andamento" valor={8} />
        <Resumo titulo="Solicitações Concluídas" valor={25} />
      </div>

      <Tabela
        dados={documentosMock}
        colunas={colunas}
        renderExtra={(item) => (
          <div className="flex gap-3 text-[#1D5D7F]">
            <button title="Gerar PDF">
              <FaFilePdf />
            </button>
            <button title="Enviar ao aluno">
              <FaPaperPlane />
            </button>
            <button title="Imprimir">
              <FaPrint />
            </button>
          </div>
        )}
      />
    </div>
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

export default DocumentoCoordenacao;

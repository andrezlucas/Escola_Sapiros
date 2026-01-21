import { useEffect, useState } from "react";
import Tabela, { type Coluna } from "./Tabela";

type AuditLog = {
  id: string;
  usuario_nome?: string;
  usuario_role?: string;
  acao: string;
  entidade?: string;
  descricao?: string;
  criado_em: string;
};

type Meta = {
  total: number;
  page: number;
  lastPage: number;
};

function FormLogSistema() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    lastPage: 1,
  });

  const [page, setPage] = useState(1);
  const [acao, setAcao] = useState("");
  const [entidade, setEntidade] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscarLogs(pagina = page) {
    setLoading(true);

    const params = Object.fromEntries(
      Object.entries({
        page: pagina,
        limit: 10,
        acao,
        entidade,
      }).filter(([_, value]) => value !== undefined && value !== ""),
    );

    try {
      const response = await fetch(
        `http://localhost:3000/admin/audit?${new URLSearchParams(
          params as Record<string, string>,
        ).toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const json = await response.json();

      setLogs(json.data ?? []);
      setMeta(json.meta ?? { total: 0, page: 1, lastPage: 1 });
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarLogs(page);
  }, [page]);

  const colunas: Coluna<AuditLog>[] = [
    {
      titulo: "Usuário",
      render: (log) => log.usuario_nome ?? "-",
    },
    {
      titulo: "Perfil",
      render: (log) => log.usuario_role ?? "-",
    },
    {
      titulo: "Ação",
      render: (log) => (
        <span className="font-semibold text-[#1D5D7F]">{log.acao}</span>
      ),
    },
    {
      titulo: "Entidade",
      render: (log) => log.entidade ?? "-",
    },
    {
      titulo: "Data",
      render: (log) => new Date(log.criado_em).toLocaleString("pt-BR"),
    },
  ];

  return (
    <div className="flex-1 bg-white rounded-xl p-4 sm:p-6 shadow-md min-h-[687px]">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D5D7F] mb-6">
        Logs do Sistema
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <select
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          className="w-full sm:w-auto border rounded-md p-2 outline-none focus:ring-2 focus:ring-[#1D5D7F]/20"
        >
          <option value="">Todas ações</option>
          <option value="Acessou recurso do sistema">
            Acessou recurso do sistema
          </option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
        </select>

        <input
          type="text"
          placeholder="Entidade"
          value={entidade}
          onChange={(e) => setEntidade(e.target.value)}
          className="w-full sm:w-auto border rounded-md p-2 outline-none focus:ring-2 focus:ring-[#1D5D7F]/20"
        />

        <button
          onClick={() => {
            setPage(1);
            buscarLogs(1);
          }}
          className="w-full sm:w-auto bg-[#1D5D7F] text-white px-6 py-2 rounded-md hover:bg-[#164863] transition-colors"
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Carregando logs...</p>
      ) : (
        <Tabela dados={logs} colunas={colunas} />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-600 font-medium">
          Total: {meta.total}
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
          >
            Anterior
          </button>

          <span className="px-3 py-1 text-sm font-semibold bg-gray-100 rounded-md">
            {meta.page} / {meta.lastPage}
          </span>

          <button
            disabled={page >= meta.lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1.5 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormLogSistema;

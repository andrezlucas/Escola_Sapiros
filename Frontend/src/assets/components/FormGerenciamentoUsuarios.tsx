import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { authFetch } from "../utils/authFetch";
import { Button } from "./Button";

interface UsuarioGestao {
  id: string;
  nome: string;
  email: string;
  role: string;
  status: "Ativo" | "Inativo";
  ultimoAcesso: string | null;
  matricula?: string;
}

interface Meta {
  total: number;
  page: number;
  lastPage: number;
}

const FormGerenciamentoUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioGestao[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await authFetch(
        `http://localhost:3000/configuracoes/gestao-usuarios?${params.toString()}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao carregar usuários");
      }

      const data = await res.json();
      setUsuarios(data.data);
      setMeta(data.meta);
    } catch (err: any) {
      toast.error(err.message || "Falha ao carregar lista de usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [page, search, roleFilter, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (
      !confirm(
        `Deseja ${
          currentStatus === "Ativo" ? "bloquear" : "desbloquear"
        } este usuário?`
      )
    )
      return;

    try {
      const res = await authFetch(
        `http://localhost:3000/configuracoes/gestao-usuarios/${id}/status`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Erro ao alterar status");

      const data = await res.json();
      toast.success(data.message);

      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.message || "Falha ao alterar status do usuário");
    }
  };

  return (
    <div className="flex-1 bg-white rounded-xl p-6 shadow-md min-h-[687px]">
      <h2 className="text-2xl font-bold text-[#1D5D7F] mb-6">
        Gestão de Usuários
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] text-sm"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] text-sm"
        >
          <option value="">Todos os papéis</option>
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
          <option value="coordenacao">Coordenação</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setRoleFilter("");
            setStatusFilter("");
            setPage(1);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition"
        >
          Limpar filtros
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-600">
          Carregando usuários...
        </p>
      ) : usuarios.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          Nenhum usuário encontrado com os filtros aplicados
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Papel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Último Acesso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Matrícula
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {user.nome}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 capitalize">
                    {user.role}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {user.ultimoAcesso
                      ? new Date(user.ultimoAcesso).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "Nunca"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {user.matricula || "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        user.status === "Ativo"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.status === "Ativo" ? "Bloquear" : "Desbloquear"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <p className="text-sm text-gray-700 text-center sm:text-left">
            Mostrando página <strong>{meta.page}</strong> de{" "}
            <strong>{meta.lastPage}</strong> (<strong>{meta.total}</strong>{" "}
            usuários no total)
          </p>
          <div className="flex gap-3">
            <Button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
              className="px-4 py-2 text-sm"
            >
              Anterior
            </Button>
            <Button
              disabled={page === meta.lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormGerenciamentoUsuarios;

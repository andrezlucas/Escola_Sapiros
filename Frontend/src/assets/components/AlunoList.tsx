import { useEffect, useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import { useForm, FormProvider } from "react-hook-form";
import FormEditarDocumento, {
  type FormDocumentoData,
} from "../components/FormEditarDocumento";
import Tabela from "../components/Tabela";
import { toast } from "react-toastify";

interface Aluno {
  id: string;
  usuario: {
    nome: string;
    email: string;
    role: string;
    isBlocked?: boolean;
  } | null;
  status?: "Ativo" | "Inativo";
  documentacaoId?: string;
}

function AlunoList() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentacaoId, setSelectedDocumentacaoId] = useState<
    string | null
  >(null);
  const methods = useForm<FormDocumentoData>();

  const token = localStorage.getItem("token");

  async function fetchAlunos() {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/alunos?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        console.error("Erro ao obter alunos:", res.status);
        return;
      }
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.data;

      const normalizados: Aluno[] = lista.map((a: any) => ({
        ...a,

        status: a.usuario
          ? a.usuario.isBlocked
            ? "Inativo"
            : "Ativo"
          : undefined,
        documentacaoId: a.documentacao?.id,
      }));

      setAlunos(normalizados);
      if (!Array.isArray(data) && data.pages) setTotalPaginas(data.pages);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlunos();
  }, [page]);

  const atualizarAluno = async (documentacaoId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/documentacao/${documentacaoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Erro ao buscar documentação atualizada");

      const docAtualizada = await res.json();
      const alunoAtualizado: Aluno = docAtualizada.aluno;

      setAlunos((prev) => {
        const existe = prev.some((a) => a.id === alunoAtualizado.id);
        if (existe) {
          return prev.map((a) =>
            a.id === alunoAtualizado.id
              ? {
                  ...a,
                  usuario: alunoAtualizado.usuario,
                  status: alunoAtualizado.usuario
                    ? alunoAtualizado.usuario.isBlocked
                      ? "Inativo"
                      : "Ativo"
                    : undefined,
                  documentacaoId: docAtualizada.id,
                }
              : a
          );
        }
        return [
          ...prev,
          {
            ...alunoAtualizado,
            status: alunoAtualizado.usuario
              ? alunoAtualizado.usuario.isBlocked
                ? "Inativo"
                : "Ativo"
              : undefined,
            documentacaoId: docAtualizada.id,
          },
        ];
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar aluno.");
    }
  };

  const handleEnviarDocumentos = async (data: FormDocumentoData) => {
    if (!selectedDocumentacaoId) return;
    try {
      for (const [key, value] of Object.entries(data)) {
        if (value && value.length > 0) {
          const formData = new FormData();
          formData.append("arquivo", value[0]);
          formData.append("tipo", key);

          const res = await fetch(
            `http://localhost:3000/documentacao/${selectedDocumentacaoId}/upload`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          if (!res.ok) throw new Error(`Erro ao enviar arquivo: ${key}`);
        }
      }

      toast.success("Documentos enviados com sucesso!");
      setIsModalOpen(false);

      await atualizarAluno(selectedDocumentacaoId);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar documentos.");
    }
  };

  const alunosFiltrados = alunos
    .filter((a) => a.usuario)
    .filter((a) =>
      filter === "ativos"
        ? a.status === "Ativo"
        : filter === "inativos"
        ? a.status === "Inativo"
        : true
    )
    .filter((a) =>
      (a.usuario?.nome ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const abrirModal = (documentacaoId: string) => {
    setSelectedDocumentacaoId(documentacaoId);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] max-w-130">
          <FaSearch className="w-4 h-2 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar por aluno"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
          />
        </label>
      </div>

      <div className="flex flex-row gap-4 mb-4">
        {["todos", "ativos", "inativos"].map((tipo) => (
          <button
            key={tipo}
            className={`w-32 h-9 px-4 py-2 rounded-lg shadow flex justify-center items-center ${
              filter === tipo
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setFilter(tipo)}
          >
            <span className="text-sm font-bold">
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <Tabela
          dados={alunosFiltrados}
          colunas={[
            { titulo: "Aluno", render: (a) => a.usuario?.nome ?? "-" },
            { titulo: "Email", render: (a) => a.usuario?.email ?? "-" },
            { titulo: "Tipo", render: (a) => a.usuario?.role ?? "-" },
            { titulo: "Status", render: (a) => a.status ?? "-" },
          ]}
          renderExtra={(aluno) =>
            aluno.documentacaoId ? (
              <button
                className="flex items-center gap-1 px-3 py-1 border border-[#1D5D7F] rounded-lg text-sm font-semibold hover:bg-[#1D5D7F] hover:text-white transition"
                onClick={() => abrirModal(aluno.documentacaoId!)}
              >
                <FaEdit /> Editar
              </button>
            ) : null
          }
        />
      )}

      <div className="flex justify-center gap-3 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          {"<"}
        </button>
        <span>Página {page}</span>
        <button
          disabled={page === totalPaginas}
          onClick={() => setPage((p) => p + 1)}
          className="px-1 py-1 border rounded-xs disabled:opacity-40"
        >
          {">"}
        </button>
      </div>

      {isModalOpen && selectedDocumentacaoId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[90%] max-w-3xl">
            <FormProvider {...methods}>
              <FormEditarDocumento
                onSubmit={handleEnviarDocumentos}
                onBack={() => setIsModalOpen(false)}
                onAlunoUpdated={() =>
                  selectedDocumentacaoId &&
                  atualizarAluno(selectedDocumentacaoId)
                }
              />
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlunoList;

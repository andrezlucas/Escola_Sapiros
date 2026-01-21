import { useEffect, useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import { useForm, FormProvider } from "react-hook-form";
import FormEditarDocumento, {
  type FormDocumentoData,
} from "../components/FormEditarDocumento";
import Tabela from "../components/Tabela";
import { toast } from "react-toastify";

interface Documento {
  id: string;
  tipo: string;
  nomeArquivo: string;
}

interface Aluno {
  id: string;
  usuario: {
    nome: string;
    email: string;
    role: string;
    isBlocked?: boolean;
  };
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
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const methods = useForm<FormDocumentoData>();
  const token = localStorage.getItem("token");

  async function fetchAlunos() {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/alunos?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) return;

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
      if (!Array.isArray(data) && data.pages) {
        setTotalPaginas(data.pages);
      }
    } catch (err) {
      console.error(err);
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
        },
      );

      if (!res.ok) throw new Error();

      const docAtualizada = await res.json();
      const alunoAtualizado: Aluno = docAtualizada.aluno;

      setAlunos((prev) =>
        prev.map((a) =>
          a.id === alunoAtualizado.id
            ? {
                ...a,
                usuario: alunoAtualizado.usuario,
                status: alunoAtualizado.usuario?.isBlocked
                  ? "Inativo"
                  : "Ativo",
                documentacaoId: docAtualizada.id,
              }
            : a,
        ),
      );
    } catch {
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
            },
          );

          if (!res.ok) throw new Error();
        }
      }

      toast.success("Documentos enviados com sucesso!");
      setIsModalOpen(false);
      await atualizarAluno(selectedDocumentacaoId);
    } catch {
      toast.error("Erro ao enviar documentos.");
    }
  };

  const abrirModal = async (documentacaoId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/documentacao/${documentacaoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error();

      const doc = await res.json();

      setSelectedDocumentacaoId(doc.id);
      setDocumentos(doc.documentos ?? []);
      setIsModalOpen(true);
    } catch {
      toast.error("Erro ao carregar documentos.");
    }
  };

  const alunosFiltrados = alunos
    .filter((a) => a.usuario)
    .filter((a) =>
      filter === "ativos"
        ? a.status === "Ativo"
        : filter === "inativos"
          ? a.status === "Inativo"
          : true,
    )
    .filter((a) =>
      (a.usuario?.nome ?? "").toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full md:max-w-md">
          <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar por aluno"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-4">
        {["todos", "ativos", "inativos"].map((tipo) => (
          <button
            key={tipo}
            className={`flex-1 md:flex-none md:w-32 h-9 px-4 py-2 rounded-lg shadow flex justify-center items-center transition-all duration-200 ${
              filter === tipo || (tipo === "todos" && filter === "")
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setFilter(tipo === "todos" ? "" : tipo)}
          >
            <span className="text-xs md:text-sm font-bold">
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Carregando...</p>
      ) : (
        <Tabela
          dados={alunosFiltrados}
          colunas={[
            { titulo: "Aluno", render: (a) => a.usuario?.nome ?? "-" },
            { titulo: "Email", render: (a) => a.usuario?.email ?? "-" },
            { titulo: "Tipo", render: (a) => a.usuario?.role ?? "-" },
            {
              titulo: "Status",
              render: (p) =>
                p.usuario.isBlocked ? (
                  <span className="text-red-600 font-semibold">Inativo</span>
                ) : (
                  <span className="text-green-600 font-semibold">Ativo</span>
                ),
            },
          ]}
          renderExtra={(aluno) =>
            aluno.documentacaoId ? (
              <button
                className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border-2 border-[#1D5D7F] rounded-lg text-[#1D5D7F] font-bold text-xs hover:bg-[#1D5D7F] hover:text-white transition-all"
                onClick={() => abrirModal(aluno.documentacaoId!)}
              >
                <FaEdit /> Editar
              </button>
            ) : null
          }
        />
      )}

      {isModalOpen && selectedDocumentacaoId && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-4 md:p-8 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <FormProvider {...methods}>
              <FormEditarDocumento
                documentacaoId={selectedDocumentacaoId}
                documentos={documentos}
                onSubmit={handleEnviarDocumentos}
                onBack={() => setIsModalOpen(false)}
                onAlunoUpdated={() => atualizarAluno(selectedDocumentacaoId)}
              />
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlunoList;

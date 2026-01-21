import { useEffect, useState } from "react";
import { FaSearch, FaEdit } from "react-icons/fa";
import Tabela from "./Tabela";
import ModalCriarProfessor from "../components/ModalCriarProfessor";
import ModalEditarProfessor from "../components/ModalEditarProfessor";

interface Disciplina {
  id: string;
  nome: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    sexo: string;
    dataNascimento: string;
    isBlocked?: boolean;
  };
  graduacao: string;
  instituicao: string;
  dataInicioGraduacao: string;
  dataConclusaoGraduacao?: string;
  turmas?: Turma[];
  disciplinas?: Disciplina[];
}

export default function ProfessorList() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] =
    useState<Professor | null>(null);

  const token = localStorage.getItem("token");

  async function fetchProfessores() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/professores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar professores");
      const data = await res.json();
      setProfessores(data);
    } catch (err) {
      console.error("Erro ao buscar professores", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfessores();
  }, []);

  const professoresFiltrados = professores.filter((professor) =>
    professor.usuario.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full sm:max-w-130">
          <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar professor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm"
          />
        </label>

        <button
          onClick={() => setModalCriarAberto(true)}
          className="bg-[#1D5D7F] text-white px-4 py-2 rounded-lg"
        >
          + Adicionar Professor
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : (
        <Tabela
          dados={professoresFiltrados}
          colunas={[
            { titulo: "Nome", render: (p) => p.usuario.nome },
            { titulo: "CPF", render: (p) => p.usuario.cpf },
            { titulo: "Telefone", render: (p) => p.usuario.telefone },
            {
              titulo: "Status",
              render: (p) =>
                p.usuario.isBlocked ? (
                  <span className="text-red-600 font-semibold">Inativo</span>
                ) : (
                  <span className="text-green-600 font-semibold">Ativo</span>
                ),
            },
            {
              titulo: "Turmas",
              render: (p) => `${p.turmas?.length || 0}`,
            },
          ]}
          renderExtra={(p) => (
            <button
              onClick={() => {
                setProfessorSelecionado(p);
                setModalEditarAberto(true);
              }}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border-2 border-[#1D5D7F] rounded-lg text-[#1D5D7F] font-bold text-xs hover:bg-[#1D5D7F] hover:text-white transition-all"
            >
              <FaEdit /> Editar
            </button>
          )}
        />
      )}

      {modalCriarAberto && (
        <ModalCriarProfessor
          onClose={() => setModalCriarAberto(false)}
          onAtualizarLista={fetchProfessores}
        />
      )}

      {modalEditarAberto && professorSelecionado && (
        <ModalEditarProfessor
          aberto={modalEditarAberto}
          professor={professorSelecionado}
          onClose={() => setModalEditarAberto(false)}
          onAtualizarLista={fetchProfessores}
        />
      )}
    </div>
  );
}

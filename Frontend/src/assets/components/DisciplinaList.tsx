import { useEffect, useState } from "react";
import { FaSearch, FaEdit, FaBook } from "react-icons/fa";
import Tabela from "./Tabela";
import ModalCriarDisciplina from "../components/ModalCriarDisciplina";
import ModalEditarDisciplina from "../components/ModalEditarDisciplina";
import { toast } from "react-toastify";

interface Turma {
  id: string;
  nome_turma: string;
}

interface Professor {
  id: string;
  usuario: { nome: string };
}

interface Habilidade {
  id: string;
  nome: string;
  descricao?: string;
}

interface Disciplina {
  id_disciplina: string;
  codigo_disciplina: string;
  nome_disciplina: string;
  cargaHoraria: number;
  turmas?: Turma[];
  professores?: Professor[];
  habilidades?: Habilidade[];
}

export default function DisciplinaList() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<Disciplina | null>(null);

  const token = localStorage.getItem("token");

  async function fetchDisciplinas() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/disciplinas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar disciplinas");
      const data = await res.json();
      setDisciplinas(data);
    } catch (err) {
      console.error("Erro ao buscar disciplinas", err);
      toast.error("Erro ao carregar disciplinas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  const disciplinasFiltradas = disciplinas.filter(
    (disciplina) =>
      disciplina.nome_disciplina.toLowerCase().includes(search.toLowerCase()) ||
      disciplina.codigo_disciplina.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full md:max-w-md">
          <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar disciplina"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
          />
        </label>

        <button
          onClick={() => setModalCriarAberto(true)}
          className="bg-[#1D5D7F] text-white h-11 md:h-10 px-6 rounded-lg font-semibold hover:bg-[#164a66] transition-colors shadow-md active:scale-95"
        >
          + Adicionar Disciplina
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D5D7F]"></div>
          <p className="mt-3 text-gray-500 font-medium">
            Carregando disciplinas...
          </p>
        </div>
      ) : (
        <Tabela
          dados={disciplinasFiltradas}
          colunas={[
            {
              titulo: "Disciplina",
              render: (d) => (
                <div className="flex flex-col">
                  <span className="font-bold text-[#1D5D7F] md:text-gray-900">
                    {d.nome_disciplina}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <FaBook className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {d.codigo_disciplina}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              titulo: "Habilidades",
              render: (d) => (
                <div className="max-h-24 overflow-y-auto">
                  {d.habilidades && d.habilidades.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {d.habilidades.map((hab) => (
                        <span
                          key={hab.id}
                          title={hab.descricao}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] md:text-xs rounded-full font-medium"
                        >
                          {hab.nome}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs md:text-sm">
                      Nenhuma habilidade
                    </span>
                  )}
                </div>
              ),
            },
          ]}
          renderExtra={(d) => (
            <button
              onClick={() => {
                setDisciplinaSelecionada(d);
                setModalEditarAberto(true);
              }}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 border-2 border-[#1D5D7F] rounded-lg text-[#1D5D7F] font-bold text-xs hover:bg-[#1D5D7F] hover:text-white transition-all"
            >
              <FaEdit className="w-3 h-3" /> Editar
            </button>
          )}
        />
      )}

      {modalCriarAberto && (
        <ModalCriarDisciplina
          onClose={() => setModalCriarAberto(false)}
          onAtualizarLista={fetchDisciplinas}
        />
      )}

      {modalEditarAberto && disciplinaSelecionada && (
        <ModalEditarDisciplina
          aberto={modalEditarAberto}
          disciplina={disciplinaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            setDisciplinaSelecionada(null);
          }}
          onAtualizarLista={fetchDisciplinas}
        />
      )}
    </div>
  );
}

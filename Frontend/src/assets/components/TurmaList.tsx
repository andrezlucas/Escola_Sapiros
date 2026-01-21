import { useEffect, useState } from "react";
import { FaSearch, FaEdit, FaUsers, FaUserGraduate } from "react-icons/fa";
import Tabela from "./Tabela";
import ModalCriarTurma from "../components/ModalCriarTurma";
import ModalEditarTurma from "../components/ModalEditarTurma";
import { toast } from "react-toastify";

interface Professor {
  id: string;
  nome: string;
  usuario: { nome: string };
}

interface Aluno {
  id: string;
  usuario: { nome: string };
}

interface Disciplina {
  id_disciplina: string;
  nome: string;
}

interface Turma {
  id: string;
  nome_turma: string;
  ano_letivo: string;
  capacidade_maxima: number;
  turno: "MANHÃ" | "TARDE" | "NOITE";
  ativa: boolean;
  professor?: Professor;
  alunos: Aluno[];
  disciplinas: Disciplina[];
}

export default function TurmaList() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);

  const token = localStorage.getItem("token");

  async function fetchTurmas() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/turmas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar turmas");
      const data = await res.json();

      const turmasFormatadas: Turma[] = data.map((turma: any) => ({
        ...turma,

        turno: (turma.turno?.toUpperCase() === "TARDE"
          ? "TARDE"
          : turma.turno?.toUpperCase() === "NOITE"
            ? "NOITE"
            : "MANHÃ") as "MANHÃ" | "TARDE" | "NOITE",
      }));

      setTurmas(turmasFormatadas);
    } catch (err) {
      console.error("Erro ao buscar turmas", err);
      toast.error("Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTurmas();
  }, []);

  const turmasFiltradas = turmas
    .filter((t) =>
      filter === "ativas" ? t.ativa : filter === "inativas" ? !t.ativa : true,
    )
    .filter((t) =>
      (t.nome_turma ?? "").toLowerCase().includes(search.toLowerCase()),
    );

  const getNomeProfessor = (professor?: Professor) => {
    if (!professor) return "—";
    return professor.usuario?.nome || professor.nome || "—";
  };

  function formatarTurno(turno?: "MANHÃ" | "TARDE" | "NOITE") {
    if (!turno) return "—";
    return turno.charAt(0) + turno.slice(1).toLowerCase();
  }

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full md:max-w-md">
          <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar turma"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
          />
        </label>

        <button
          onClick={() => setModalCriarAberto(true)}
          className="bg-[#1D5D7F] text-white h-11 md:h-10 px-6 rounded-lg font-semibold hover:bg-[#164a66] transition-colors shadow-md active:scale-95"
        >
          + Adicionar Turma
        </button>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
        {["todos", "ativas", "inativas"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFilter(tipo)}
            className={`flex-1 md:flex-none md:w-32 h-10 rounded-lg font-bold transition-all duration-200 ${
              filter === tipo
                ? "bg-[#1D5D7F] text-white shadow-md"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }`}
          >
            <span className="text-xs md:text-sm">
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1D5D7F]"></div>
          <p className="mt-3 text-gray-500 font-medium">Carregando turmas...</p>
        </div>
      ) : (
        <Tabela
          dados={turmasFiltradas}
          colunas={[
            {
              titulo: "Turma",
              render: (t) => (
                <div className="flex flex-col">
                  <span className="font-bold text-[#1D5D7F] md:text-gray-900">
                    {t.nome_turma ?? "—"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatarTurno(t.turno)} • {t.ano_letivo}
                  </span>
                </div>
              ),
            },
            {
              titulo: "Professor",
              render: (t) => (
                <div className="flex items-center gap-2">
                  <FaUserGraduate className="text-gray-400 hidden md:block" />
                  <span className="text-sm">
                    {getNomeProfessor(t.professor)}
                  </span>
                </div>
              ),
            },
            {
              titulo: "Alunos",
              render: (t) => (
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-400" />
                  <span className="font-semibold text-sm">
                    {t.alunos?.length ?? 0}/{t.capacidade_maxima ?? 0}
                  </span>
                </div>
              ),
            },
            {
              titulo: "Status",
              render: (t) => (
                <span
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                    t.ativa
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {t.ativa ? "Ativa" : "Inativa"}
                </span>
              ),
            },
          ]}
          renderExtra={(t) => (
            <button
              onClick={() => {
                setTurmaSelecionada(t);
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
        <ModalCriarTurma
          onClose={() => setModalCriarAberto(false)}
          onAtualizarLista={fetchTurmas}
        />
      )}

      {modalEditarAberto && turmaSelecionada && (
        <ModalEditarTurma
          aberto={modalEditarAberto}
          turma={turmaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            setTurmaSelecionada(null);
          }}
          onAtualizarLista={fetchTurmas}
        />
      )}
    </div>
  );
}

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
  turno: string;
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
      console.log("Turmas atualizadas:", data);
      setTurmas(data);
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
      filter === "ativas" ? t.ativa : filter === "inativas" ? !t.ativa : true
    )
    .filter((t) =>
      (t.nome_turma ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const getNomeProfessor = (professor?: Professor) => {
    if (!professor) return "—";
    return professor.usuario?.nome || professor.nome || "—";
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full sm:max-w-130">
          <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar turma"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm"
          />
        </label>

        <button
          onClick={() => setModalCriarAberto(true)}
          className="bg-[#1D5D7F] text-white px-4 py-2 rounded-lg hover:bg-[#164a66]"
        >
          + Adicionar Turma
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        {["todos", "ativas", "inativas"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFilter(tipo)}
            className={`w-32 h-9 rounded-lg font-bold ${
              filter === tipo
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D5D7F]"></div>
          <p className="mt-2 text-gray-500">Carregando turmas...</p>
        </div>
      ) : (
        <Tabela
          dados={turmasFiltradas}
          colunas={[
            {
              titulo: "Turma",
              render: (t) => (
                <div>
                  <div className="font-medium">{t.nome_turma ?? "—"}</div>
                  <div className="text-sm text-gray-500">{t.ano_letivo}</div>
                </div>
              ),
            },
            {
              titulo: "Professor",
              render: (t) => (
                <div className="flex items-center gap-2">
                  <FaUserGraduate className="text-gray-400" />
                  <span>{getNomeProfessor(t.professor)}</span>
                </div>
              ),
            },
            {
              titulo: "Alunos",
              render: (t) => (
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-400" />
                  <span className="font-medium">
                    {t.alunos?.length ?? 0}/{t.capacidade_maxima ?? 0}
                  </span>
                </div>
              ),
            },
            {
              titulo: "Status",
              render: (t) => (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    t.ativa
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
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
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
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

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaCube,
  FaCalculator,
  FaBook,
  FaGlobeAmericas,
  FaLandmark,
  FaFlask,
  FaDna,
  FaAtom,
  FaLanguage,
  FaPalette,
  FaMusic,
  FaRunning,
  FaLaptopCode,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

type TurmaProfessor = {
  id: string;
  nome_turma: string;
};

export function getIconByDisciplina(disciplina?: string) {
  if (!disciplina) return FaBook;

  const nome = disciplina.toLowerCase();

  if (nome.includes("matem")) return FaCalculator;
  if (nome.includes("portugu")) return FaBook;
  if (nome.includes("hist")) return FaLandmark;
  if (nome.includes("geogr")) return FaGlobeAmericas;
  if (nome.includes("quim")) return FaFlask;
  if (nome.includes("biolog")) return FaDna;
  if (nome.includes("fisic")) return FaAtom;
  if (nome.includes("inform") || nome.includes("tec")) return FaLaptopCode;
  if (nome.includes("arte")) return FaPalette;
  if (nome.includes("music")) return FaMusic;
  if (nome.includes("educa") || nome.includes("fisica")) return FaRunning;

  return FaBook;
}

//const IconeDisciplina = getIconByDisciplina(turma.disciplina);

//<IconeDisciplina className="w-10 h-10 text-[#1D5D7F]" />

function Turmas() {
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState<TurmaProfessor[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarTurmas() {
      try {
        const response = await fetch(
          "http://localhost:3000/professores/turmas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar turmas do professor");
        }

        const data = await response.json();
        setTurmas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarTurmas();
  }, []);

  const turmasFiltradas = turmas.filter((t) =>
    t.nome_turma.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Seleção de Turmas
      </h1>

      <p className="text-gray-600">
        Selecione uma turma para acessar o acompanhamento.
      </p>

      <div className="p-4">
        <div className="mb-4">
          <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-[#1D5D7F] w-full sm:max-w-130">
            <FaSearch className="w-4 h-4 text-[#1D5D7F]" />
            <input
              type="search"
              placeholder="Buscar por turma"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
            />
          </label>
        </div>

        {loading && (
          <p className="text-gray-500 text-sm">Carregando turmas...</p>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {turmasFiltradas.map((turma) => (
              <div
                key={turma.id}
                className="border border-gray-300 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <FaCube className="w-10 h-10 text-[#1D5D7F]" />

                  <div>
                    <h3 className="font-bold text-[#1D5D7F] text-lg">
                      {turma.nome_turma}
                    </h3>
                    <p className="text-gray-700">
                      Turma vinculada ao professor
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-gray-500 text-sm">
                  <p>Informações detalhadas em atualização</p>
                </div>

                <button
                  onClick={() => navigate(`/dashboard/professor?view=turma&id=${turma.id}`)}
                  className="mt-5 w-full bg-[#1D5D7F] text-white py-2.5 rounded-lg hover:bg-[#164c68] transition-colors"
                >
                  Visualizar Turma
                </button>
              </div>
            ))}

            {turmasFiltradas.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">Nenhuma turma encontrada.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Turmas;

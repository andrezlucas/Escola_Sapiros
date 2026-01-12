import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { FaChalkboardTeacher } from "react-icons/fa";

interface Turma {
  id?: string | number;
  nome_turma: string;
  disciplinas: Disciplina[];
  turno: string;
}

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface CardMinhasTurmasDashboardProps {
  onVerDetalhes: () => void;
  onVerMaterial: () => void;
}

function CardMinhasTurmas({
  onVerDetalhes,
  onVerMaterial,
}: CardMinhasTurmasDashboardProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token não encontrado. Faça login novamente.");
        }

        const response = await fetch(
          "http://localhost:3000/professores/turmas",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            throw new Error("Sessão expirada. Faça login novamente.");
          }
          throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        setTurmas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchTurmas();
  }, []);

  const turmasVisiveis = turmas.slice(0, 2);

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#1D5D7F]/20 p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#1D5D7F]">Minhas Turmas</h3>

        {turmas.length > 2 && (
          <button className="text-[#1D5D7F] hover:text-[#1D5D7F]/80 text-sm font-medium">
            Ver todas ({turmas.length})
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500">
          Carregando suas turmas...
        </div>
      )}

      {error && <div className="text-center py-10 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {turmasVisiveis.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              Nenhuma turma encontrada no momento
            </div>
          ) : (
            turmasVisiveis.map((turma, index) => (
              <div
                key={turma.id || index}
                className="bg-[#F5F9FC] rounded-lg p-5 border border-[#1D5D7F]/10 hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#1D5D7F] text-lg">
                      {turma.disciplinas.length > 0
                        ? turma.disciplinas[0].nome_disciplina
                        : "Sem disciplina"}
                    </h4>
                    <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                      <FaChalkboardTeacher size={16} />
                      {turma.nome_turma}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Turno: {turma.turno}
                    </p>
                  </div>
                  <button className="text-gray-500 hover:text-[#1D5D7F]">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={onVerDetalhes}
                    className="flex-1 bg-[#1D5D7F] text-white py-2.5 rounded-lg font-medium hover:bg-[#1D5D7F]/90"
                  >
                    Ver Detalhe
                  </button>
                  <button
                    onClick={onVerMaterial}
                    className="flex-1 border border-[#1D5D7F] text-[#1D5D7F] py-2.5 rounded-lg font-medium hover:bg-[#1D5D7F]/10"
                  >
                    Enviar Atividade
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CardMinhasTurmas;

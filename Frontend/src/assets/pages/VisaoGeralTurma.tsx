import { useState, useEffect } from "react";
import {
  FaSearch,
  FaChevronRight,
  FaTrophy,
  FaPuzzlePiece,
  FaExclamationTriangle,
} from "react-icons/fa";
import GraficoTurmaEvolucao from "../components/GraficoTurmaEvolucao";

interface VisaoGeralTurmaProps {
  turmaId: string | null;
  onVerAluno: (alunoId: string) => void;
}

interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  media: number;
  status: "Atenção" | "Regular" | "Bom";
  corStatus: "bg-red-500" | "bg-yellow-500" | "bg-green-500";
}

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface TurmaInfo {
  id: string;
  nome_turma: string;
  turno: string;
  disciplinas?: Disciplina[];
}

interface TurmaData {
  serie: string;
  disciplina: string;
  turno: string;
  mediaGeral: number;
  variacao: string;
  melhorCompetencia: string;
  percentualAcimaMedia: number;
  alunosEmRisco: number;
  desempenhoSemanal: number[];
  alunos: Aluno[];
}

function VisaoGeralTurma({ turmaId, onVerAluno }: VisaoGeralTurmaProps) {
  const [dados, setDados] = useState<TurmaData | null>(null);
  const [buscaAluno, setBuscaAluno] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  useEffect(() => {
    if (!turmaId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    async function carregarDados() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const turmasRes = await fetch(
          `http://localhost:3000/professores/turmas`,
          { headers }
        );

        const turmas: TurmaInfo[] = await turmasRes.json();

        const turma = turmas.find((t) => t.id === turmaId);

        if (!turma) {
          throw new Error("Turma não encontrada para o professor");
        }

        const resumoRes = await fetch(
          `http://localhost:3000/turmas/${turmaId}/dashboard/resumo`,
          { headers }
        );
        const resumo = await resumoRes.json();

        const evolucaoRes = await fetch(
          `http://localhost:3000/turmas/${turmaId}/dashboard/evolucao?periodo=semestral`,
          { headers }
        );
        const evolucao = await evolucaoRes.json();

        const alunosRes = await fetch(
          `http://localhost:3000/turmas/${turmaId}/dashboard/alunos`,
          { headers }
        );
        const alunos = await alunosRes.json();

        setDados({
          serie: turma.nome_turma,

          disciplina:
            turma.disciplinas && turma.disciplinas.length > 0
              ? turma.disciplinas[0].nome_disciplina
              : "Sem disciplina",

          turno: turma.turno,

          mediaGeral: resumo.mediaGeral,
          variacao: resumo.tendencia === "up" ? "↑" : "↓",

          melhorCompetencia: resumo.melhorCompetencia.nome,
          percentualAcimaMedia: resumo.melhorCompetencia.percentual,

          alunosEmRisco: resumo.alunosEmRisco,

          desempenhoSemanal: evolucao.map((item: any) => item.media),

          alunos: alunos.map((aluno: any) => {
            const media = Number(aluno.desempenhoGeral);

            return {
              id: aluno.id,
              nome: aluno.nome,
              matricula: aluno.matricula,
              media,
              status: media < 6 ? "Atenção" : media < 7 ? "Regular" : "Bom",
              corStatus:
                media < 6
                  ? "bg-red-500"
                  : media < 7
                  ? "bg-yellow-500"
                  : "bg-green-500",
            };
          }),
        });
      } catch (error) {
        console.error("Erro ao carregar visão geral da turma", error);
      }
    }

    carregarDados();
  }, [turmaId]);

  if (!dados) {
    return (
      <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
        <div className="text-center py-12 text-gray-500">
          Carregando dados da turma...
        </div>
      </div>
    );
  }

  const alunosFiltrados = dados.alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(buscaAluno.toLowerCase()) ||
      aluno.matricula.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const alunosPaginaAtual = alunosFiltrados.slice(indiceInicio, indiceFim);

  const totalPaginas = Math.ceil(alunosFiltrados.length / itensPorPagina);

  const irParaPagina = (numero: number) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaAtual(numero);
    }
  };

  const irParaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  const irParaProxima = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F] font-bold">
          Visão Geral - Turma {dados.serie}
        </h1>
        <p className="mt-1 text-gray-600 text-lg">
          {dados.disciplina} - {dados.turno}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Média Geral da Turma
              </p>
              <p className="text-4xl font-bold text-[#1D5D7F] mt-1">
                {dados.mediaGeral.toFixed(1)}
                <span className="text-xl ml-2">{dados.variacao}</span>
              </p>
            </div>
            <FaTrophy className="text-4xl text-[#1D5D7F]/70" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Média em relação ao bimestre anterior
          </p>
        </div>

        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Melhor Competência
              </p>
              <p className="text-2xl font-bold text-[#1D5D7F] mt-2">
                {dados.melhorCompetencia}
              </p>
            </div>
            <FaPuzzlePiece className="text-4xl text-[#1D5D7F]/70" />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {dados.percentualAcimaMedia}% dos alunos acima da média
          </p>
        </div>

        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Alunos em Risco
              </p>
              <p className="text-4xl font-bold text-[#1D5D7F] mt-1">
                {dados.alunosEmRisco}
              </p>
            </div>
            <FaExclamationTriangle className="text-4xl text-[#1D5D7F]/70" />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Alunos com média abaixo de 6,0
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-2">
          Desempenho em {dados.disciplina}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Evolução da média da turma nas semanas do período selecionado
        </p>
        <div className="bg-gray-50 border rounded-xl p-6 min-h-[380px]">
          {turmaId ? (
            <GraficoTurmaEvolucao turmaId={turmaId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Selecione uma turma para visualizar o gráfico
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-[#1D5D7F]">Lista de Alunos</h2>

          <label className="flex items-center gap-2 px-4 py-2 bg-[#e6eef880] rounded-2xl border-2 border-[#1D5D7F] w-full sm:w-80">
            <FaSearch className="text-[#1D5D7F]" />
            <input
              type="search"
              placeholder="Buscar por aluno"
              value={buscaAluno}
              onChange={(e) => setBuscaAluno(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[#1D5D7F] placeholder:text-[#1D5D7F]/60"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4">Desempenho Geral</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {alunosPaginaAtual.map((aluno, index) => (
                <tr
                  key={aluno.matricula || index}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                        {aluno.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{aluno.nome}</p>
                        <p className="text-sm text-gray-500">{aluno.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{aluno.matricula}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {aluno.media.toFixed(1)}
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[120px]">
                        <div
                          className={`h-full rounded-full ${
                            aluno.media >= 7
                              ? "bg-green-500"
                              : aluno.media >= 5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${(aluno.media / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm ${aluno.corStatus}`}
                    >
                      ● {aluno.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => onVerAluno(aluno.id)}
                      className="text-[#1D5D7F] hover:text-[#134c66] flex items-center gap-1"
                    >
                      Ver detalhes <FaChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4">
          <p>
            Mostrando {alunosPaginaAtual.length} de {alunosFiltrados.length}{" "}
            resultados (Página {paginaAtual} de {totalPaginas})
          </p>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <button
              onClick={irParaAnterior}
              disabled={paginaAtual === 1}
              className={`px-3 py-1 border rounded ${
                paginaAtual === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Anterior
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .slice(
                Math.max(0, paginaAtual - 3),
                Math.min(totalPaginas, paginaAtual + 2)
              )
              .map((num) => (
                <button
                  key={num}
                  onClick={() => irParaPagina(num)}
                  className={`px-4 py-1 rounded ${
                    num === paginaAtual
                      ? "bg-[#1D5D7F] text-white"
                      : "border hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}

            <button
              onClick={irParaProxima}
              disabled={paginaAtual === totalPaginas}
              className={`px-3 py-1 border rounded ${
                paginaAtual === totalPaginas
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisaoGeralTurma;

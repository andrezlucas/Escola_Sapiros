import { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaUserCheck,
  FaClipboardCheck,
} from "react-icons/fa";

interface AlunoData {
  header: {
    nome: string;
    matricula: string;
    status: string;
    foto?: string;
  };
  kpis: {
    mediaGeral: number;
    frequencia: number;
    tarefasEntregues: number;
    tarefasTotal: number;
  };
  competencias: {
    nome: string;
    percentual: number;
  }[];
  insights: {
    fortes: string[];
    atencao: string[];
  };
}

interface VisaoAlunoProps {
  alunoId: string;
}

function VisaoAluno({ alunoId }: VisaoAlunoProps) {
  const [dados, setDados] = useState<AlunoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!alunoId) return;

    const carregarDados = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const response = await fetch(
          `http://localhost:3000/alunos/${alunoId}/dashboard-view`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data: AlunoData = await response.json();
        setDados(data);
      } catch (error) {
        console.error("Erro ao carregar visão do aluno:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [alunoId]);

  if (loading) {
    return (
      <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">Carregando dados do aluno...</p>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md">
        <p className="text-center text-red-600 text-lg">
          Não foi possível carregar os dados do aluno.
        </p>
      </div>
    );
  }

  const { header, kpis, competencias, insights } = dados;

  const statusColor =
    header.status.toLowerCase() === "crítico"
      ? "bg-red-500"
      : header.status.toLowerCase() === "atenção"
      ? "bg-orange-500"
      : header.status.toLowerCase() === "regular"
      ? "bg-yellow-500"
      : "bg-green-500";

  const getCorBarra = (percentual: number) => {
    if (percentual >= 70) return "bg-green-500";
    if (percentual >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const fotoUrl = header.foto
    ? `http://localhost:3000/${header.foto.replace(/\\/g, "/")}`
    : null;

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-200">
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-[#1D5D7F]/30">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={header.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-24 h-24 text-[#1D5D7F]" />
          )}
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1D5D7F]">
            {header.nome}
          </h1>
          <p className="text-lg text-gray-700 mt-2">
            Matrícula: <strong>{header.matricula}</strong>
          </p>
          <div className="mt-3 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gray-100 shadow-sm">
            <span className={`w-4 h-4 rounded-full ${statusColor}`}></span>
            <span className="font-semibold text-gray-800">{header.status}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-6 text-center shadow-sm">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-[#1D5D7F]/10 rounded-full flex items-center justify-center text-3xl">
              <FaChartLine />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[#1D5D7F]">Média Geral</h3>
          <p className="text-5xl font-bold text-[#1D5D7F] mt-3">
            {kpis.mediaGeral.toFixed(1)}
          </p>
        </div>

        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-6 text-center shadow-sm">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-[#1D5D7F]/10 rounded-full flex items-center justify-center text-3xl">
              <FaUserCheck />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[#1D5D7F]">Frequência</h3>
          <p className="text-5xl font-bold text-[#1D5D7F] mt-3">
            {kpis.frequencia}%
          </p>
        </div>

        <div className="bg-[#f0f7fa] border border-[#1D5D7F]/20 rounded-xl p-6 text-center shadow-sm">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-[#1D5D7F]/10 rounded-full flex items-center justify-center text-3xl">
              <FaClipboardCheck />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[#1D5D7F]">
            Tarefas Entregues
          </h3>
          <p className="text-5xl font-bold text-[#1D5D7F] mt-3">
            {kpis.tarefasEntregues}/{kpis.tarefasTotal}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#1D5D7F] mb-6">
          Competências por Áreas
        </h2>

        <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {competencias.map((comp, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">
                  {comp.nome}
                </span>
                <span className="text-lg font-bold text-gray-700">
                  {comp.percentual}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out ${getCorBarra(
                    comp.percentual
                  )}`}
                  style={{ width: `${comp.percentual}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <FaCheckCircle className="text-green-600 text-3xl" />
            <h3 className="text-2xl font-bold text-green-800">Pontos Fortes</h3>
          </div>
          <ul className="space-y-4">
            {insights.fortes.map((ponto, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-gray-800 text-lg"
              >
                <span className="text-green-600 text-xl mt-1">✔</span>
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <FaExclamationTriangle className="text-red-600 text-3xl" />
            <h3 className="text-2xl font-bold text-red-800">
              Pontos de Atenção
            </h3>
          </div>
          <ul className="space-y-4">
            {insights.atencao.map((ponto, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-gray-800 text-lg"
              >
                <span className="text-red-600 text-xl mt-1">!</span>
                <span>{ponto}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VisaoAluno;

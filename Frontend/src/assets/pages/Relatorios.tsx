import { useState } from "react";
import { toast } from "react-toastify";

export default function Relatorios() {
  const [periodoLetivo, setPeriodoLetivo] = useState("1º Bimestre");
  const [materia, setMateria] = useState("Matemática");
  const [turma, setTurma] = useState("2º Ano A");

  const aplicarFiltro = () => {
    toast.success(`Filtro aplicado: ${periodoLetivo} | ${materia} | ${turma}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
          Relatórios de Desempenho por Habilidades
        </h1>
        <p className="text-[#333333] mt-2">
          Análise de performance acadêmica da escola.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          Filtro de Análise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período letivo
            </label>
            <select
              value={periodoLetivo}
              onChange={(e) => setPeriodoLetivo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white"
            >
              <option>1º Bimestre</option>
              <option>2º Bimestre</option>
              <option>3º Bimestre</option>
              <option>4º Bimestre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matéria
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white"
            >
              <option>Matemática</option>
              <option>Português</option>
              <option>Ciências</option>
              <option>História</option>
              <option>Geografia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano/Série/Turma
            </label>
            <select
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-white"
            >
              <option>2º Ano A</option>
              <option>2º Ano B</option>
              <option>2º Ano C</option>
              <option>2º Ano D</option>
              <option>2º Ano E</option>
              <option>3º Ano A</option>
            </select>
          </div>

          <div>
            <button
              onClick={aplicarFiltro}
              className="w-full px-6 py-3 bg-[#1D5D7F] text-white font-medium rounded-md hover:bg-[#164a66] transition shadow-sm"
            >
              Aplicar Filtro
            </button>
          </div>
        </div>
      </div>

      {/*
        <div className="text-center text-gray-500 py-12">
        <p className="text-lg">
        Selecione os filtros e clique em "Aplicar Filtro" para visualizar o
        relatório.
        </p>
        <p className="text-sm mt-4">aqui vai vim os dados</p>
        </div>
*/}
    </div>
  );
}

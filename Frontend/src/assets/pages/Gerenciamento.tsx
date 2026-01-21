import { useState } from "react";
import AlunoList from "../components/AlunoList";
import TurmaList from "../components/TurmaList";
import ProfessorList from "../components/ProfessorList";
import DisciplinaList from "../components/DisciplinaList";

function Gerenciamento() {
  const [etapa, setEtapa] = useState<string>("aluno");

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4 md:gap-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]  md:font-normal">
        Gerenciamento Acadêmico
      </h1>

      <div className="grid grid-cols-2 md:flex md:flex-row gap-2 sm:gap-4">
        <button
          className={`h-10 md:h-9 px-3 md:px-5 py-2 md:py-3 rounded-lg shadow flex justify-center items-center transition-all duration-200 ${
            etapa === "disciplina"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("disciplina")}
        >
          <span className="text-xs md:text-sm font-bold">Disciplina</span>
        </button>
        <button
          className={`h-10 md:h-9 px-3 md:px-5 py-2 md:py-3 rounded-lg shadow flex justify-center items-center transition-all duration-200 ${
            etapa === "professor"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("professor")}
        >
          <span className="text-xs md:text-sm font-bold">Professor</span>
        </button>
        <button
          className={`h-10 md:h-9 px-3 md:px-5 py-2 md:py-3 rounded-lg shadow flex justify-center items-center transition-all duration-200 ${
            etapa === "turma"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("turma")}
        >
          <span className="text-xs md:text-sm font-bold">Turma</span>
        </button>
        <button
          className={`h-10 md:h-9 px-3 md:px-5 py-2 md:py-3 rounded-lg shadow flex justify-center items-center transition-all duration-200 ${
            etapa === "aluno"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("aluno")}
        >
          <span className="text-xs md:text-sm font-bold">Aluno</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2 md:mt-0">
        {etapa === "aluno" && <AlunoList />}
        {etapa === "turma" && <TurmaList />}
        {etapa === "professor" && <ProfessorList />}
        {etapa === "disciplina" && <DisciplinaList />}
      </div>
    </div>
  );
}

export default Gerenciamento;

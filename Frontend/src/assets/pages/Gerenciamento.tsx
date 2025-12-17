import { useState } from "react";
import AlunoList from "../components/AlunoList";
import TurmaList from "../components/TurmaList";
import ProfessorList from "../components/ProfessorList";
import DisciplinaList from "../components/DisciplinaList";

function Gerenciamento() {
  const [etapa, setEtapa] = useState<String>("aluno");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Gerenciamento Acadêmico
      </h1>

      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "disciplina"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("disciplina")}
        >
          <span className="text-sm font-bold">Disciplina</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "professor"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("professor")}
        >
          <span className="text-sm font-bold">Professor</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "turma"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("turma")}
        >
          <span className="text-sm font-bold">Turma</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "aluno"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("aluno")}
        >
          <span className="text-sm font-bold">Aluno</span>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {etapa === "aluno" && <AlunoList />}
        {etapa === "turma" && <TurmaList />}
        {etapa === "professor" && <ProfessorList />}
        {etapa === "disciplina" && <DisciplinaList />}
      </div>
    </div>
  );
}

export default Gerenciamento;

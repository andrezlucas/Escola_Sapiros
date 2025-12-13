import { useState } from "react";
import AlunoList from "../components/AlunoList";


function Gerenciamento() {
  const [etapa, setEtapa] = useState<String>("");
  return (
    <div className="w-full h-auto p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-4xl text-[#1D5D7F]">Gerenciamento Acadêmico</h1>
      <div className="flex flex-row gap-4">
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
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
        {etapa === "aluno" && (
            <AlunoList/>
        )}
      </div>
    </div>
  );
}

export default Gerenciamento;

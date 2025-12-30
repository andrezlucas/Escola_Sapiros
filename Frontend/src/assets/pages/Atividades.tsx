import { useState } from "react";
import FormAtividade from "../components/FormAtividade";
import FormAnexar from "../components/FormAnexar";

function Atividades() {
  const [etapa, setEtapa] = useState<String>("atividade");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Atividades
      </h1>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "atividade"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("atividade")}
        >
          <span className="text-sm font-bold">Criar Atividade</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "simulado"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("simulado")}
        >
          <span className="text-sm font-bold">Criar Simulado</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "material"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("material")}
        >
          <span className="text-sm font-bold">Anexar Material</span>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {etapa === "atividade" && <FormAtividade />}
        {etapa === "material" && <FormAnexar/>}
      </div>
    </div>
  );
}
export default Atividades;

import { useState } from "react";
import FormAtividade from "../components/FormAtividade";
import FormAnexar from "../components/FormAnexar";
import FormSimulado from "../components/FormSimulado";

function Atividades() {
  const [etapa, setEtapa] = useState<String>("atividade");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-6">
      <h1 className="text-2xl md:text-4xl text-[#1D5D7F]  md:font-normal">
        Atividades
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-colors ${
            etapa === "atividade"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("atividade")}
        >
          <span className="text-sm font-bold">Criar Atividade</span>
        </button>

        <button
          className={`w-full sm:w-42 h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-colors ${
            etapa === "simulado"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("simulado")}
        >
          <span className="text-sm font-bold">Criar Simulado</span>
        </button>

        <button
          className={`w-full sm:w-42 h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-colors ${
            etapa === "material"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("material")}
        >
          <span className="text-sm font-bold">Anexar Material</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {etapa === "atividade" && <FormAtividade />}
        {etapa === "material" && <FormAnexar />}
        {etapa === "simulado" && <FormSimulado />}
      </div>
    </div>
  );
}

export default Atividades;

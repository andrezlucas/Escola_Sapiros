import { useState } from "react";
import NotaList from "../components/NotasList";
import FrequenciaList from "../components/FrequenciaList";

function Registro() {
  const [etapa, setEtapa] = useState<String>("registrarnotas");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Registros
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-11 sm:h-9 px-6 rounded-lg shadow flex justify-center items-center transition-all ${
            etapa === "registrarnotas"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("registrarnotas")}
        >
          <span className="text-sm font-bold whitespace-nowrap">
            Registrar Notas
          </span>
        </button>

        <button
          className={`w-full sm:w-auto h-11 sm:h-9 px-6 rounded-lg shadow flex justify-center items-center transition-all ${
            etapa === "registrarfrequencia"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("registrarfrequencia")}
        >
          <span className="text-sm font-bold whitespace-nowrap">
            Registrar Frequência
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {etapa === "registrarnotas" && <NotaList />}
        {etapa === "registrarfrequencia" && <FrequenciaList />}
      </div>
    </div>
  );
}

export default Registro;

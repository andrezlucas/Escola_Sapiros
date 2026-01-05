import { useState } from "react";
import NotaList from "../components/NotasList";
import FrequenciaList from "../components/FrequenciaList";

function Registro() {
  const [etapa, setEtapa] = useState<String>("registrarnotas");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Registros
      </h1>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "registrarnotas"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("registrarnotas")}
        >
          <span className="text-sm font-bold">Registrar Notas</span>
        </button>
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "registrarfrequencia"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("registrarfrequencia")}
        >
          <span className="text-sm font-bold">Registrar Frequência</span>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {etapa === "registrarnotas" && <NotaList />}
        {etapa === "registrarfrequencia" && <FrequenciaList/>}
      </div>
    </div>
  );
}

export default Registro;

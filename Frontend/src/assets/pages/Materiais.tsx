import { useState } from "react";
import ListAtividades from "../components/ListAtividades";
import ListaMateriais from "../components/ListMateriais";
import ListSimulado from "../components/ListSimulado";

function Materiais() {
  const [etapa, setEtapa] = useState<String>("minhasatividades");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-6">
      <h1 className="text-2xl md:text-4xl text-[#1D5D7F] md:font-normal">
        Materiais
      </h1>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-all ${
            etapa === "minhasatividades"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("minhasatividades")}
        >
          <span className="text-sm font-bold whitespace-nowrap">
            Minhas Atividades
          </span>
        </button>
        <button
          className={`w-full sm:w-42 h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-all ${
            etapa === "meusmateriais"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("meusmateriais")}
        >
          <span className="text-sm font-bold whitespace-nowrap">
            Meus Materiais
          </span>
        </button>

        <button
          className={`w-full sm:w-auto h-11 sm:h-9 px-5 rounded-lg shadow flex justify-center items-center transition-all ${
            etapa === "meussimulados"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("meussimulados")}
        >
          <span className="text-sm font-bold whitespace-nowrap">
            Meus Simulados
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {etapa === "minhasatividades" && <ListAtividades />}
        {etapa === "meusmateriais" && <ListaMateriais isProfessor={true} />}
        {etapa === "meussimulados" && <ListSimulado />}
      </div>
    </div>
  );
}

export default Materiais;

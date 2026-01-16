import { useState } from "react";
import ListAtividades from "../components/ListAtividades";
import ListaMateriais from "../components/ListMateriais";
import ListSimulado from "../components/ListSimulado";

function Materiais() {
  const [etapa, setEtapa] = useState<String>("minhasatividades");
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Materiais
      </h1>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "minhasatividades"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("minhasatividades")}
        >
          <span className="text-sm font-bold ">Minhas Atividades</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "meusmateriais"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("meusmateriais")}
        >
          <span className="text-sm font-bold">Meus Materiais</span>
        </button>
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "meussimulados"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("meussimulados")}
        >
          <span className="text-sm font-bold">Meus Simulados</span>
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {etapa === "minhasatividades" && <ListAtividades />}
        {etapa === "meusmateriais" && <ListaMateriais isProfessor={true} />}
        {etapa === "meussimulados" && <ListSimulado/>}
      </div>
    </div>
  );
}
export default Materiais;

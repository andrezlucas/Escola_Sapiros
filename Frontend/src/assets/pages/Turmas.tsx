import { useState } from "react";
import { FaSearch } from "react-icons/fa";

function Turmas() {
  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Seleção de Turmas
      </h1>
      <p></p>
      <div className="flex flex-col gap-4">
        Selecione uma turma para acessar o acompanhamento.
      </div>
      <div className="p-4">
        <div className="mb-4">
          <label className="flex items-center gap-2 px-3 py-2 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full sm:max-w-130">
            <FaSearch className="w-4 h-2 text-[#1D5D7F]" />
            <input
              type="search"
              placeholder="Buscar por turma"
              className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-sm placeholder:text-[#1D5D7F] placeholder:opacity-50"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
export default Turmas;

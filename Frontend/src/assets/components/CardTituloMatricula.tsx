import type { ReactNode } from "react";

function CardTituloMatricula({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-[3.5rem] md:h-14 bg-[#1D5D7F] rounded-lg flex justify-center items-center px-4 py-2">
      <span className="w-full text-white text-xl md:text-4xl font-normal text-center md:text-left">
        {children}
      </span>
    </div>
  );
}
export default CardTituloMatricula;

import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";

function HeaderBar() {
  const nome = localStorage.getItem("nome");
  const role = localStorage.getItem("role");

  const LetraMaiuscula = (texto?: string | null) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const formatarNome = (texto?: string | null) => {
    if (!texto) return "";
    const partes = texto.split(" ");
    return partes
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };
  return (
    <header className="flex items-center justify-end p-4 bg-[#1D5D7F]">
      <button
        className="p-2 rounded-full hover:bg-[#ffffff33] transition-colors"
        aria-label="Notificações"
      >
        <LuBellRing className="w-6 h-6 text-[#e6eef8]" />
      </button>
      <button
        className="p-2 rounded-full hover:bg-[#ffffff33] transition-colors"
        aria-label="Notificações"
      >
        <FaRegUserCircle className="w-7 h-7 text-[#e6eef8]" />
      </button>
      <div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-[#E8E4DC] font-bold">
            {formatarNome(nome) || "Usuário"}
          </span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-[#E8E4DC] font-semibold">
            {LetraMaiuscula(role) || "Usuário"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;

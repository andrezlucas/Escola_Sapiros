import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";

function HeaderBar() {
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
    </header>
  );
}

export default HeaderBar;

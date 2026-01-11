import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useEffect, useState } from "react";

type PerfilAluno = {
  nome: string;
  turma: string;
};

function HeaderBar() {
  const role = localStorage.getItem("role");
  const nomeStorage = localStorage.getItem("nome");

  const [perfilAluno, setPerfilAluno] = useState<PerfilAluno | null>(null);

  const formatarNome = (texto?: string | null) => {
    if (!texto) return "";
    const partes = texto.split(" ");
    return partes
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  };

  const LetraMaiuscula = (texto?: string | null) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  useEffect(() => {
    if (role !== "aluno") return;

    const carregarPerfilAluno = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/alunos/dashboard/perfil",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        setPerfilAluno(data);
      } catch (error) {
        console.error("Erro ao carregar perfil do aluno", error);
      }
    };

    carregarPerfilAluno();
  }, [role]);

  const nomeExibido =
    role === "aluno"
      ? formatarNome(perfilAluno?.nome)
      : formatarNome(nomeStorage);

  const subtitulo =
    role === "aluno" ? perfilAluno?.turma : LetraMaiuscula(role);

  return (
    <header className="flex items-center justify-end gap-2 p-4 bg-[#1D5D7F]">
      <button
        className="p-2 rounded-full hover:bg-[#ffffff33] transition-colors"
        aria-label="Notificações"
      >
        <LuBellRing className="w-6 h-6 text-[#e6eef8]" />
      </button>

      <button
        className="p-2 rounded-full hover:bg-[#ffffff33] transition-colors"
        aria-label="Usuário"
      >
        <FaRegUserCircle className="w-7 h-7 text-[#e6eef8]" />
      </button>

      <div className="flex flex-col leading-tight">
        <span className="text-sm text-[#E8E4DC] font-bold">
          {nomeExibido || "Usuário"}
        </span>
        <span className="text-xs text-[#E8E4DC] font-semibold">
          {subtitulo || ""}
        </span>
      </div>
    </header>
  );
}

export default HeaderBar;

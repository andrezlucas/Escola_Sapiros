import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";

type PerfilAluno = {
  nome: string;
  turma: string;
};

function HeaderBar() {
  const role = localStorage.getItem("role");
  const nomeStorage = localStorage.getItem("nome");
  const token = localStorage.getItem("token");

  const [perfilAluno, setPerfilAluno] = useState<PerfilAluno | null>(null);

  // 🔍 Pesquisa IA
  const [query, setQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<string>("");

  const modalRef = useRef<HTMLDivElement>(null);
  const podePesquisar = role === "professor" || role === "coordenacao";

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

  // Carrega perfil do aluno se for aluno
  useEffect(() => {
    if (role !== "aluno") return;

    const carregarPerfilAluno = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/alunos/dashboard/perfil",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setPerfilAluno(data);
      } catch (error) {
        console.error("Erro ao carregar perfil do aluno", error);
      }
    };

    carregarPerfilAluno();
  }, [role, token]);

  // Fecha modal clicando fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpenModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nomeExibido =
    role === "aluno"
      ? formatarNome(perfilAluno?.nome)
      : formatarNome(nomeStorage);
  const subtitulo =
    role === "aluno" ? perfilAluno?.turma : LetraMaiuscula(role);

  // 🚀 Função para fazer pergunta à IA
  const fazerPergunta = async () => {
    if (!query.trim()) return;

    setOpenModal(true);
    setLoading(true);
    setResposta("");

    try {
      const res = await fetch("http://localhost:3000/ia/perguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pergunta: query }),
      });

      if (!res.ok) throw new Error("Erro ao consultar IA");

      const data = await res.json();

      if (data.resultado) {
        if (typeof data.resultado.media === "number") {
          setResposta(`A nota geral do aluno é ${data.resultado.media}.`);
        } else if (data.resultado.disciplina) {
          setResposta(
            `Disciplina: ${data.resultado.disciplina}, média: ${Number(
              data.resultado.media
            ).toFixed(2)}.`
          );
        } else if (data.resultado.quantidade !== undefined) {
          setResposta(
            `O aluno já fez ${data.resultado.quantidade} simulado(s).`
          );
        } else if (Array.isArray(data.resultado)) {
          setResposta(
            data.resultado
              .map((a: any) => `• ${a.titulo} (${a.descricao})`)
              .join("\n") || "Sem atividades pendentes."
          );
        } else {
          setResposta(JSON.stringify(data.resultado, null, 2));
        }
      } else {
        setResposta("Sem resposta no momento.");
      }
    } catch (error) {
      console.error(error);
      setResposta("Erro ao buscar resposta da IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fazerPergunta();
  };

  return (
    <header className="relative flex items-center justify-between md:justify-end gap-3 px-4 py-3 bg-[#1D5D7F]">
      <div className="flex items-center gap-2">
        {/* Input de pesquisa IA */}
        {podePesquisar && (
          <input
            type="text"
            placeholder="Pergunte algo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="hidden md:block px-3 py-1.5 rounded-md text-sm outline-none w-56"
          />
        )}

        <button className="p-2 rounded-full hover:bg-[#ffffff33]">
          <LuBellRing className="w-5 h-5 text-[#e6eef8]" />
        </button>

        <button className="p-2 rounded-full hover:bg-[#ffffff33]">
          <FaRegUserCircle className="w-6 h-6 text-[#e6eef8]" />
        </button>

        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-sm text-[#E8E4DC] font-bold truncate max-w-[140px]">
            {nomeExibido || "Usuário"}
          </span>
          <span className="text-xs text-[#E8E4DC] font-semibold truncate">
            {subtitulo || ""}
          </span>
        </div>
      </div>

      {/* Modal IA */}
      {openModal && (
        <div
          ref={modalRef}
          className="absolute top-16 right-6 w-96 bg-white rounded-xl shadow-xl p-4 z-50"
        >
          <h3 className="text-sm font-semibold text-[#1D5D7F] mb-2">
            Assistente IA
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Pergunta: <span className="font-medium">{query}</span>
          </p>
          {loading ? (
            <p className="text-sm text-gray-400">Pensando...</p>
          ) : (
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {resposta}
            </pre>
          )}
        </div>
      )}
    </header>
  );
}

export default HeaderBar;

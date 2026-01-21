import { FaRegUserCircle } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

type PerfilAluno = {
  nome: string;
  turma: string;
};

function HeaderBar() {
  const role = localStorage.getItem("role");
  const nomeStorage = localStorage.getItem("nome");
  const token = localStorage.getItem("token");

  const [perfilAluno, setPerfilAluno] = useState<PerfilAluno | null>(null);

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

  useEffect(() => {
    if (role !== "aluno") return;

    const carregarPerfilAluno = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/alunos/dashboard/perfil",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setPerfilAluno(data);
      } catch (error) {
        console.error("Erro ao carregar perfil do aluno", error);
      }
    };

    carregarPerfilAluno();
  }, [role, token]);

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
              data.resultado.media,
            ).toFixed(2)}.`,
          );
        } else if (data.resultado.quantidade !== undefined) {
          setResposta(
            `O aluno já fez ${data.resultado.quantidade} simulado(s).`,
          );
        } else if (Array.isArray(data.resultado)) {
          setResposta(
            data.resultado
              .map((a: any) => `• ${a.titulo} (${a.descricao})`)
              .join("\n") || "Sem atividades pendentes.",
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
    <header className="relative flex items-center justify-between md:justify-end gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-[#1D5D7F]">
      <div className="flex items-center gap-1.5 md:gap-2 justify-end ml-auto w-full md:w-auto">
        {podePesquisar && (
          <div className="relative flex-1 md:flex-none min-w-[120px] max-w-[200px] sm:max-w-[260px] md:max-w-none">
            <div className="absolute inset-y-0 left-2.5 md:left-3 flex items-center pointer-events-none">
              <FiSearch className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#a0c4e0]" />
            </div>

            <input
              type="text"
              placeholder="Pergunte algo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`
                w-full md:w-64 pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 
                bg-[#2a7aa3] text-white placeholder:text-[#a0c4e0]/80
                text-[11px] md:text-sm rounded-lg 
                border border-[#3a8bb5]/60
                outline-none 
                transition-all duration-200
                focus:bg-[#358cc2] focus:border-[#60a5fa] focus:ring-2 focus:ring-[#60a5fa]/40
                hover:bg-[#358cc2] hover:border-[#4a9bca]
              `}
            />
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button className="p-1.5 md:p-2 rounded-full hover:bg-[#ffffff33] transition-colors">
            <LuBellRing className="w-4 h-4 md:w-5 md:h-5 text-[#e6eef8]" />
          </button>

          <button className="p-1.5 md:p-2 rounded-full hover:bg-[#ffffff33] transition-colors">
            <FaRegUserCircle className="w-5 h-5 md:w-6 md:h-6 text-[#e6eef8]" />
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
      </div>

      {openModal && (
        <div
          ref={modalRef}
          className={`
      absolute top-14 md:top-16 right-2 md:right-4 lg:right-8 
      w-[calc(100vw-1rem)] sm:w-[min(90vw,420px)] 
      bg-gradient-to-b from-white to-gray-50/95 
      rounded-2xl 
      shadow-2xl shadow-black/20 
      border border-gray-200/70 
      overflow-hidden 
      z-50
      animate-in fade-in zoom-in-95 duration-200
    `}
        >
          <div className="bg-gradient-to-r from-[#1D5D7F] to-[#2a7aa3] px-4 md:px-5 py-3 md:py-3.5">
            <h3 className="text-sm md:text-base font-semibold text-white tracking-tight">
              Assistente IA
            </h3>
          </div>

          <div className="p-4 md:p-5 space-y-3 md:space-y-4">
            <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-3 md:px-4 py-2.5 md:py-3">
              <p className="text-[10px] md:text-xs text-blue-800 font-medium uppercase tracking-wide mb-1">
                Sua pergunta
              </p>
              <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
                {query}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6 md:py-8 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-[#1D5D7F] mr-2 md:mr-3"></div>
                <span className="text-xs md:text-sm">Pensando...</span>
              </div>
            ) : (
              <div className="min-h-[60px] md:min-h-[80px] max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
                <pre
                  className={`
              text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap
              font-sans break-words
              ${resposta.includes("•") ? "pl-1" : ""}
            `}
                >
                  {resposta || "Nenhuma resposta recebida."}
                </pre>
              </div>
            )}
          </div>

          <div className="px-4 md:px-5 py-2.5 md:py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={() => setOpenModal(false)}
              className="
          px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium 
          text-gray-700 hover:text-gray-900 
          hover:bg-gray-200/70 
          rounded-lg transition-colors
        "
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default HeaderBar;

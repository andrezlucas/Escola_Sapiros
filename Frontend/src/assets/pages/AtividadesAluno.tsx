import { useEffect, useState } from "react";
import ResponderAtividade from "./ResponderAtividade";
import { toast } from "react-toastify";

interface AtividadeAluno {
  id: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  status: "PENDENTE" | "ENTREGUE" | "EXPIRADO";
  nota: number | null;
  disciplina: string;
}

function MinhasAtividades() {
  const [atividades, setAtividades] = useState<AtividadeAluno[]>([]);
  const [atividadeAberta, setAtividadeAberta] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "Todos" | "PENDENTE" | "ENTREGUE" | "EXPIRADO"
  >("Todos");

  const turmaId = localStorage.getItem("turmaId");
  const token = localStorage.getItem("token");

  const atividadesFiltradas = atividades.filter((a) => {
    if (filter === "Todos") return true;
    return a.status === filter;
  });

  useEffect(() => {
    if (!turmaId) return;

    fetch(`http://localhost:3000/atividades/meu-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar atividades");
        return res.json();
      })
      .then((data) => {
        setAtividades(data);
      })
      .catch(() => {
        toast.error("Erro ao carregar atividades");
      });
  }, [turmaId, token]);

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1D5D7F]">Minhas Atividades</h1>
        <p className="text-gray-600">
          Veja e gerencie todas as suas atividades pendentes, entregues ou
          expiradas.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          {(["Todos", "PENDENTE", "ENTREGUE", "EXPIRADO"] as const).map(
            (tipo) => (
              <button
                key={tipo}
                onClick={() => setFilter(tipo)}
                className={`px-6 h-9 rounded-lg font-bold transition-all ${
                  filter === tipo
                    ? "bg-[#1D5D7F] text-white shadow-lg"
                    : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-blue-50"
                }`}
              >
                {tipo === "PENDENTE"
                  ? "Pendentes"
                  : tipo === "ENTREGUE"
                  ? "Entregues"
                  : tipo === "EXPIRADO"
                  ? "Expiradas"
                  : "Todas"}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {atividadesFiltradas.map((a) => (
            <div
              key={a.id}
              className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    {a.titulo}
                  </h2>
                  <p className="text-sm font-medium text-[#1D5D7F]">
                    {a.disciplina}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    a.status === "ENTREGUE"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : a.status === "EXPIRADO"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-orange-100 text-orange-700 border border-orange-200"
                  }`}
                >
                  {a.status === "EXPIRADO"
                    ? "Expirado"
                    : a.status.toLowerCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                {a.descricao}
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 pt-4 border-t border-gray-100 gap-3">
                <div className="text-sm">
                  <span className="text-gray-500">Data Limite:</span>{" "}
                  <strong className="text-gray-700">
                    {new Date(a.dataEntrega).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </strong>
                </div>

                {a.nota !== null && (
                  <div className="text-sm">
                    <span className="text-gray-500">Sua Nota:</span>{" "}
                    <strong className="text-green-600 text-lg">{a.nota}</strong>
                  </div>
                )}
              </div>

              <button
                disabled={a.status !== "PENDENTE"}
                onClick={() => setAtividadeAberta(a.id)}
                className={`mt-4 w-full py-2.5 rounded-lg font-bold transition-colors ${
                  a.status === "ENTREGUE"
                    ? "bg-green-50 text-green-600 cursor-default border border-green-200"
                    : a.status === "EXPIRADO"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#1D5D7F] text-white hover:bg-[#164a66]"
                }`}
              >
                {a.status === "ENTREGUE"
                  ? "Atividade Enviada ✓"
                  : a.status === "EXPIRADO"
                  ? "Prazo Encerrado"
                  : "Entregar Atividade"}
              </button>
            </div>
          ))}

          {atividadesFiltradas.length === 0 && (
            <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-xl border-2 border-dashed">
              Nenhuma atividade encontrada para este filtro.
            </div>
          )}
        </div>
      </div>

      {atividadeAberta && (
        <ResponderAtividade
          atividadeId={atividadeAberta}
          onClose={() => setAtividadeAberta(null)}
          onRespostaEnviada={() => {
            setAtividades((prev) =>
              prev.map((a) =>
                a.id === atividadeAberta ? { ...a, status: "ENTREGUE" } : a
              )
            );
          }}
        />
      )}
    </div>
  );
}

export default MinhasAtividades;

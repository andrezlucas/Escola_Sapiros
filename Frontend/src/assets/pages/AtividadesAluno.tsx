import { useEffect, useState } from "react";
import ResponderAtividade from "./ResponderAtividade";
import { toast } from "react-toastify";

interface AtividadeAluno {
  id: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  status: "PENDENTE" | "ENTREGUE" | "EXPIRADA";
  disciplina?: {
    nome_disciplina: string;
  };
}

function MinhasAtividades() {
  const [atividades, setAtividades] = useState<AtividadeAluno[]>([]);
  const [atividadeAberta, setAtividadeAberta] = useState<string | null>(null);
  const turmaId = localStorage.getItem("turmaId");

  const [filter, setFilter] = useState<
    "Todos" | "Pendente" | "Entregue" | "Expirada"
  >("Todos");

  const atividadesFiltradas = atividades.filter((a) => {
    if (filter === "Pendente") return a.status === "PENDENTE";
    if (filter === "Entregue") return a.status === "ENTREGUE";
    if (filter === "Expirada") return a.status === "EXPIRADA";
    return true;
  });

  useEffect(() => {
    if (!turmaId) return;

    fetch(`http://localhost:3000/atividades/turma/${turmaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar atividades");
        return res.json();
      })
      .then((data) => {
        const normalizado: AtividadeAluno[] = data.map((a: any) => {
          let status: "PENDENTE" | "ENTREGUE" | "EXPIRADA" = "PENDENTE";

          if (a.status === "Entregue") status = "ENTREGUE";
          if (a.status === "Pendente") status = "PENDENTE";
          if (a.status === "Expirada") status = "EXPIRADA";

          return {
            ...a,
            status,
          };
        });

        setAtividades(normalizado);
      })
      .catch(() => {
        toast.error("Erro ao carregar atividades");
      });
  }, [turmaId]);

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Minhas Atividades</h1>
        <p className="text-gray-600">
          Veja e gerencie todas as suas atividades pendentes e entregues.
        </p>

        <div className="flex gap-4 mb-4">
          {["Todos", "Pendente", "Entregue", "Expirada"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilter(tipo as any)}
              className={`w-32 h-9 rounded-lg font-bold ${
                filter === tipo
                  ? "bg-[#1D5D7F] text-white"
                  : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>

        {atividadesFiltradas.map((a) => (
          <div key={a.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{a.titulo}</h2>
                <p className="text-sm text-gray-600">
                  {a.disciplina?.nome_disciplina}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  a.status === "ENTREGUE"
                    ? "bg-green-100 text-green-700"
                    : a.status === "EXPIRADA"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {a.status === "ENTREGUE"
                  ? "Entregue"
                  : a.status === "EXPIRADA"
                  ? "Expirada"
                  : "Pendente"}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-3">{a.descricao}</p>

            <p className="text-sm mt-2">
              <strong>Entrega:</strong>{" "}
              {new Date(a.dataEntrega).toLocaleDateString()}
            </p>

            <button
              disabled={a.status !== "PENDENTE"}
              onClick={() => {
                if (a.status !== "PENDENTE") return;
                setAtividadeAberta(a.id);
              }}
              className={`mt-4 w-full py-2 rounded-lg font-medium ${
                a.status !== "PENDENTE"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#1D5D7F] text-white hover:bg-[#164a66]"
              }`}
            >
              {a.status === "ENTREGUE"
                ? "Entrega Realizada"
                : a.status === "EXPIRADA"
                ? "Prazo Expirado"
                : "Entregar Atividade"}
            </button>
          </div>
        ))}

        {atividadesFiltradas.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Nenhuma atividade encontrada.
          </div>
        )}
      </div>

      {atividadeAberta && (
        <ResponderAtividade
          atividadeId={atividadeAberta}
          onClose={() => setAtividadeAberta(null)}
        />
      )}
    </div>
  );
}

export default MinhasAtividades;

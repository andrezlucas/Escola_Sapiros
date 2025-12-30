import { useEffect, useState } from "react";
import ResponderAtividade from "./ResponderAtividade";

interface AtividadeAluno {
  id: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  status?: "PENDENTE" | "ENTREGUE";
  disciplina?: {
    nome_disciplina: string;
  };
}

function MinhasAtividades() {
  const [atividades, setAtividades] = useState<AtividadeAluno[]>([]);
  const [atividadeAberta, setAtividadeAberta] = useState<string | null>(null);
  const turmaId = localStorage.getItem("turmaId");

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
        const normalizado = data.map((a: any) => ({
          ...a,
          status: a.status ?? "PENDENTE",
        }));

        setAtividades(normalizado);
      })
      .catch(() => {
        alert("Erro ao carregar atividades");
      });
  }, [turmaId]);

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Minhas Atividades</h1>
        <p className="text-gray-600">
          Veja e gerencie todas as suas atividades pendentes e entregues.
        </p>

        {atividades.map((a) => (
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
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {a.status === "ENTREGUE" ? "Entregue" : "Pendente"}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-3">{a.descricao}</p>

            <p className="text-sm mt-2">
              <strong>Entrega:</strong>{" "}
              {new Date(a.dataEntrega).toLocaleDateString()}
            </p>

            <button
              disabled={a.status === "ENTREGUE"}
              onClick={() => setAtividadeAberta(a.id)}
              className={`mt-4 w-full py-2 rounded-lg font-medium ${
                a.status === "ENTREGUE"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#1D5D7F] text-white hover:bg-[#164a66]"
              }`}
            >
              {a.status === "ENTREGUE"
                ? "Entrega Realizada"
                : "Entregar Atividade"}
            </button>
          </div>
        ))}

        {atividades.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Nenhuma atividade disponível no momento.
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

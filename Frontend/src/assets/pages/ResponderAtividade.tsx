import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Props {
  atividadeId: string;
  onClose: () => void;
}

interface Alternativa {
  id: string;
  texto: string;
}

interface Questao {
  id: string;
  enunciado: string;
  tipo: "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO";
  alternativas: Alternativa[];
}

interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  questoes: Questao[];
}

interface RespostaAluno {
  questaoId: string;
  alternativaId?: string;
  textoResposta?: string;
}

export default function ResponderAtividade({ atividadeId, onClose }: Props) {
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [respostas, setRespostas] = useState<RespostaAluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAtividade() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/atividades/${atividadeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setAtividade(data);
      } catch {
        toast.error("Não foi possível carregar a atividade");
      } finally {
        setLoading(false);
      }
    }

    fetchAtividade();
  }, [atividadeId]);

  function salvarResposta(resposta: RespostaAluno) {
    setRespostas((prev) => {
      const outras = prev.filter((r) => r.questaoId !== resposta.questaoId);
      return [...outras, resposta];
    });
  }

  async function enviarAtividade() {
    if (!atividade) return;

    if (respostas.length !== atividade.questoes.length) {
      toast.error("Responda todas as questões antes de enviar");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        atividadeId: atividade.id,
        respostas,
      };

      const res = await fetch("http://localhost:3000/atividades/responder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success("Atividade enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar atividade");
    }
  }

  if (loading) return <p className="text-center py-10">Carregando...</p>;
  if (!atividade)
    return <p className="text-center py-10">Atividade não encontrada</p>;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b pb-4 space-y-2">
          <h1 className="text-xl font-semibold text-gray-800">
            {atividade.titulo}
          </h1>

          <p className="text-sm text-gray-600">
            Responda todas as questões abaixo para completar a atividade.
          </p>

          <p className="text-sm">
            <strong>Data de entrega:</strong>{" "}
            {new Date(atividade.dataEntrega).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-5">
          {atividade.questoes.map((q, index) => (
            <div key={q.id} className="border rounded-lg p-5 space-y-4">
              <h3 className="font-medium text-gray-800">
                {index + 1}. {q.enunciado}
              </h3>

              {(q.tipo === "MULTIPLA_ESCOLHA" ||
                q.tipo === "VERDADEIRO_FALSO") && (
                <div className="space-y-2">
                  {q.alternativas.map((alt) => (
                    <label
                      key={alt.id}
                      className="flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        onChange={() =>
                          salvarResposta({
                            questaoId: q.id,
                            alternativaId: alt.id,
                          })
                        }
                      />
                      <span>{alt.texto}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.tipo === "DISSERTATIVA" && (
                <textarea
                  className="w-full border rounded-md p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
                  placeholder="Digite sua resposta..."
                  onChange={(e) =>
                    salvarResposta({
                      questaoId: q.id,
                      textoResposta: e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={enviarAtividade}
            className="px-8 py-2 bg-[#1D5D7F] text-white rounded-md font-medium hover:bg-[#164a66]"
          >
            Enviar Respostas
          </button>
        </div>
      </div>
    </div>
  );
}

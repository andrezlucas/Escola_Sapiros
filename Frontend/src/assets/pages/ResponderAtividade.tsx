import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  atividadeId: string;
  onClose: () => void;
  onRespostaEnviada?: (entrega: any) => void;
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

export default function ResponderAtividade({
  atividadeId,
  onClose,
  onRespostaEnviada,
}: Props) {
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
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Erro ao carregar atividade");

        const data = await res.json();

        const agora = new Date();
        const dataLimite = new Date(data.dataEntrega);
        if (agora > dataLimite) {
          toast.error("Esta atividade expirou e não aceita mais respostas.");
          onClose();
          return;
        }

        setAtividade(data);
      } catch (err) {
        toast.error("Não foi possível carregar a atividade");
        onClose();
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
      const payload = { atividadeId: atividade.id, respostas };

      const res = await fetch("http://localhost:3000/atividades/responder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 403) {
        toast.error("O prazo para entrega desta atividade expirou.");
        onClose();
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao enviar atividade");
      }

      const entrega = await res.json();
      toast.success("Atividade enviada com sucesso!");

      if (onRespostaEnviada) onRespostaEnviada(entrega);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar atividade");
    }
  }

  if (loading)
    return <p className="text-center py-10">Carregando questões...</p>;
  if (!atividade) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-xl p-5 sm:p-8 h-[95vh] sm:h-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b pb-4 mb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {atividade.titulo}
            </h1>
            <button
              onClick={onClose}
              className="sm:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2 sm:line-clamp-none">
            {atividade.descricao}
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm font-semibold text-[#1D5D7F] bg-blue-50 w-fit px-3 py-1 rounded-full">
            <span>Prazo:</span>
            <span>
              {new Date(atividade.dataEntrega).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </span>
          </div>
        </div>

        <div className="space-y-8 flex-1">
          {atividade.questoes.map((q, index) => (
            <div
              key={q.id}
              className="space-y-4 animate-in slide-in-from-bottom-4 duration-500"
            >
              <h3 className="font-bold text-gray-800 leading-tight text-sm sm:text-base">
                {index + 1}. {q.enunciado}
              </h3>

              {(q.tipo === "MULTIPLA_ESCOLHA" ||
                q.tipo === "VERDADEIRO_FALSO") && (
                <div className="grid gap-3">
                  {q.alternativas.map((alt) => (
                    <label
                      key={alt.id}
                      className="flex items-center gap-3 p-3.5 sm:p-3 border rounded-xl cursor-pointer transition-all hover:bg-blue-50 active:bg-blue-100 border-gray-200"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="w-5 h-5 sm:w-4 sm:h-4 text-[#1D5D7F] focus:ring-[#1D5D7F]"
                        onChange={() =>
                          salvarResposta({
                            questaoId: q.id,
                            alternativaId: alt.id,
                          })
                        }
                      />
                      <span className="text-sm sm:text-base text-gray-700">
                        {alt.texto}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {q.tipo === "DISSERTATIVA" && (
                <textarea
                  className="w-full border border-gray-300 rounded-xl p-4 h-32 sm:h-40 resize-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-transparent focus:outline-none text-sm sm:text-base text-gray-700 placeholder:text-gray-400 shadow-sm"
                  placeholder="Escreva sua resposta aqui..."
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

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-8 border-t bg-white">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-6 py-3 sm:py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={enviarAtividade}
            className="order-1 sm:order-2 px-8 py-3.5 sm:py-2.5 bg-[#1D5D7F] text-white rounded-xl font-bold hover:bg-[#164a66] shadow-md transition-all active:scale-95 text-sm sm:text-base"
          >
            Finalizar e Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

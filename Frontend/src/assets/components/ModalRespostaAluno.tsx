import { useState } from "react";
import { toast } from "react-toastify";

type ModalProps = {
  atividade: any;
  onClose: () => void;
  onRespostaEnviada?: (entrega: any) => void;
};

export default function ModalRespostasAluno({
  atividade,
  onClose,
}: ModalProps) {
  const [abertos, setAbertos] = useState<string[]>([]);

  const corrigirResposta = async (
    entregaId: string,
    respostaId: string,
    nota: number
  ) => {
    try {
      const res = await fetch(
        `http://localhost:3000/atividades/entrega/${entregaId}/resposta/${respostaId}/corrigir`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ nota }),
        }
      );
      if (!res.ok) throw new Error("Erro ao corrigir resposta");
      toast.success("Nota corrigida com sucesso!");

      const entregaIndex = atividade.entregas.findIndex(
        (e: any) => e.id === entregaId
      );
      if (entregaIndex >= 0) {
        const respostaIndex = atividade.entregas[
          entregaIndex
        ].respostas.findIndex((r: any) => r.id === respostaId);
        if (respostaIndex >= 0) {
          atividade.entregas[entregaIndex].respostas[
            respostaIndex
          ].notaAtribuida = nota;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao corrigir resposta");
    }
  };

  const toggleCard = (entregaId: string) => {
    setAbertos((prev) =>
      prev.includes(entregaId)
        ? prev.filter((id) => id !== entregaId)
        : [...prev, entregaId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Respostas da Atividade</h2>

        <p className="mb-2">Título: {atividade.titulo}</p>
        <p className="mb-4">
          Total de entregas: {atividade.entregas?.length || 0}
        </p>

        {atividade.entregas?.map((entrega: any) => (
          <div key={entrega.id} className="border rounded-lg mb-4">
            <div
              className="cursor-pointer p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
              onClick={() => toggleCard(entrega.id)}
            >
              <div>
                <p className="font-bold">{entrega.aluno.usuario.nome}</p>
                <p className="text-sm text-gray-600">
                  Entregou em: {new Date(entrega.dataEntrega).toLocaleString()}
                </p>
              </div>
              <p>{abertos.includes(entrega.id) ? "▲" : "▼"}</p>
            </div>

            {abertos.includes(entrega.id) && (
              <div className="p-4 space-y-4">
                {entrega.respostas.map((resposta: any) => {
                  const {
                    questao,
                    alternativaEscolhida,
                    textoResposta,
                    notaAtribuida,
                    id: respostaId,
                  } = resposta;
                  const acertou =
                    questao.tipo !== "DISSERTATIVA"
                      ? alternativaEscolhida?.id ===
                        questao.alternativas.find((a: any) => a.correta)?.id
                      : undefined;

                  return (
                    <div
                      key={respostaId}
                      className="border rounded-md p-2 bg-gray-50"
                    >
                      <p className="font-semibold">
                        Questão: {questao.enunciado}
                      </p>

                      {questao.tipo === "DISSERTATIVA" ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={textoResposta || ""}
                            readOnly
                            className="w-full border rounded-md p-2 resize-none bg-white"
                          />
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              defaultValue={notaAtribuida ?? 0}
                              className="border rounded p-1 w-20"
                              id={`nota-${respostaId}`}
                            />
                            <button
                              className="px-2 py-1 bg-[#1D5D7F] text-white rounded"
                              onClick={() => {
                                const input = document.getElementById(
                                  `nota-${respostaId}`
                                ) as HTMLInputElement;
                                const nota = Number(input.value);
                                corrigirResposta(entrega.id, respostaId, nota);
                              }}
                            >
                              Corrigir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside">
                          {questao.alternativas.map((alt: any) => (
                            <li
                              key={alt.id}
                              className={`${
                                alt.correta
                                  ? "text-green-600 font-bold"
                                  : alternativaEscolhida?.id === alt.id
                                  ? "text-red-600 font-bold"
                                  : ""
                              }`}
                            >
                              {alt.letra}. {alt.texto}
                              {alt.correta && " (Resposta correta)"}
                              {alternativaEscolhida?.id === alt.id &&
                                !alt.correta &&
                                " (Marcada pelo aluno)"}
                            </li>
                          ))}
                          <p>
                            <strong>Nota:</strong> {notaAtribuida ?? "-"}
                          </p>
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button onClick={onClose} className="px-4 py-2 border rounded-lg mt-4">
          Fechar
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { toast } from "react-toastify";

type ModalProps = {
  simulado: any;
  onClose: () => void;
};

export default function ModalTentativasAluno({
  simulado,
  onClose,
}: ModalProps) {
  const [abertos, setAbertos] = useState<string[]>([]);

  const toggleCard = (tentativaId: string) => {
    setAbertos((prev) =>
      prev.includes(tentativaId)
        ? prev.filter((id) => id !== tentativaId)
        : [...prev, tentativaId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Tentativas do Simulado</h2>

        <p className="mb-2">Título: {simulado.titulo}</p>
        <p className="mb-4">
          Total de tentativas: {simulado.tentativas?.length || 0}
        </p>

        {simulado.tentativas?.length === 0 ? (
          <p className="text-gray-500">Ainda não há tentativas registradas.</p>
        ) : (
          simulado.tentativas.map((tentativa: any) => (
            <div key={tentativa.id} className="border rounded-lg mb-4">
              <div
                className="cursor-pointer p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
                onClick={() => toggleCard(tentativa.id)}
              >
                <div>
                  <p className="font-bold">
                    {tentativa.aluno?.usuario?.nome || "Aluno"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Iniciou em: {new Date(tentativa.inicioEm).toLocaleString()}
                  </p>
                  {tentativa.entregueEm && (
                    <p className="text-sm text-gray-600">
                      Finalizado em:{" "}
                      {new Date(tentativa.entregueEm).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-lg">
                    Nota: <strong>{tentativa.notaFinal ?? "—"}</strong> /{" "}
                    {simulado.valorTotal}
                  </p>
                  <p>{abertos.includes(tentativa.id) ? "▲" : "▼"}</p>
                </div>
              </div>

              {abertos.includes(tentativa.id) && (
                <div className="p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 italic">
                    {tentativa.entregueEm
                      ? "Simulado finalizado pelo aluno."
                      : "Tentativa ainda em andamento."}
                  </p>

                  {/* Como é só múltipla escolha e correção automática, não mostramos detalhes */}
                  <p className="mt-2 text-sm">
                    O simulado contém apenas questões de múltipla escolha com
                    correção automática. A nota final já foi calculada pelo
                    sistema.
                  </p>
                </div>
              )}
            </div>
          ))
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

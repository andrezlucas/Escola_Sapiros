import { useState, useEffect } from "react";
import { toast } from "react-toastify";

type Alternativa = {
  id: string;
  letra: string;
  texto: string;
};

type Questao = {
  id: string;
  enunciado: string;
  tipo: "MULTIPLA_ESCOLHA";
  valor: number;
  alternativas: Alternativa[];
};

type Simulado = {
  id: string;
  titulo: string;
  tempoDuracao: number;
  valorTotal: number;
  questoes: Questao[];
};

interface ResponderSimuladoProps {
  simuladoId: string;
  onClose: () => void;
  onSimuladoFinalizado?: () => void;
}

export default function ResponderSimulado({
  simuladoId,
  onClose,
  onSimuladoFinalizado,
}: ResponderSimuladoProps) {
  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [tentativaIniciada, setTentativaIniciada] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [tempoRestante, setTempoRestante] = useState<number | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const iniciarTentativa = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/simulados/${simuladoId}/iniciar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao iniciar tentativa");
      }

      const tentativa = await res.json();
      setTentativaIniciada(true);

      const fimPrevisto = new Date(tentativa.fimPrevisto).getTime();
      const agora = new Date().getTime();
      const segundos = Math.max(0, Math.floor((fimPrevisto - agora) / 1000));
      setTempoRestante(segundos);

      if (segundos === 0) {
        toast.warn("Tempo do simulado já esgotado!");
      }
    } catch (err: any) {
      console.error(err);
      setErro(err.message || "Não foi possível iniciar o simulado");
      toast.error(err.message || "Erro ao iniciar tentativa");
    }
  };

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro(null);

        const resSimulado = await fetch(
          `http://localhost:3000/simulados/${simuladoId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!resSimulado.ok) throw new Error("Erro ao carregar simulado");

        const data = await resSimulado.json();
        setSimulado(data);

        await iniciarTentativa();
      } catch (err: any) {
        setErro(err.message || "Não foi possível carregar o simulado");
      } finally {
        setLoading(false);
      }
    }

    if (simuladoId) carregarDados();
  }, [simuladoId]);

  useEffect(() => {
    if (
      tempoRestante === null ||
      tempoRestante <= 0 ||
      finalizado ||
      !tentativaIniciada
    )
      return;

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoRestante, finalizado, tentativaIniciada]);

  const formatarTempo = () => {
    if (tempoRestante === null) return "00:00";

    const horas = Math.floor(tempoRestante / 3600);
    const minutos = Math.floor((tempoRestante % 3600) / 60);
    const segundos = tempoRestante % 60;

    if (horas > 0) {
      return `${horas}h ${minutos.toString().padStart(2, "0")}min`;
    }
    return `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}min`;
  };

  const selecionarAlternativa = (questaoId: string, alternativaId: string) => {
    if (finalizado || tempoRestante === 0 || !tentativaIniciada) return;
    setRespostas((prev) => ({ ...prev, [questaoId]: alternativaId }));
  };

  const questoesRespondidas = Object.keys(respostas).length;
  const totalQuestoes = simulado?.questoes?.length || 0;

  const finalizarSimulado = async () => {
    if (!tentativaIniciada) {
      toast.error("Nenhuma tentativa iniciada. Tente novamente.");
      return;
    }

    if (tempoRestante === 0) {
      toast.warn("Tempo esgotado! Finalizando automaticamente.");
    }

    setFinalizado(true);

    try {
      const payload = {
        respostas: Object.entries(respostas).map(
          ([questaoId, alternativaId]) => ({
            questaoId,
            alternativaId,
          }),
        ),
      };

      const res = await fetch(
        `http://localhost:3000/simulados/${simuladoId}/finalizar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao finalizar");
      }

      const resultado = await res.json();
      toast.success(
        `Simulado finalizado! Sua nota: ${resultado.notaFinal || "—"}`,
      );

      if (onSimuladoFinalizado) onSimuladoFinalizado();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar respostas");
      setFinalizado(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <p className="text-xl text-white animate-pulse">
          Carregando simulado...
        </p>
      </div>
    );
  }

  if (erro || !simulado || !tentativaIniciada) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 sm:p-10 text-center max-w-sm w-full">
          <p className="text-lg sm:text-xl text-red-600 mb-6">
            {erro || "Não foi possível iniciar o simulado."}
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-t-2xl sm:rounded-xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-4 sm:p-6 bg-white z-20">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 line-clamp-1">
              {simulado.titulo}
            </h1>
            <button onClick={onClose} className="sm:hidden text-gray-400 p-1">
              ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div
              className={`text-lg sm:text-xl font-bold transition-colors ${tempoRestante && tempoRestante < 300 ? "text-red-600 animate-pulse" : "text-[#1D5D7F]"}`}
            >
              Tempo: {formatarTempo()}
            </div>
            <div className="text-sm sm:text-lg text-gray-600 font-medium">
              Progresso:{" "}
              <span className="text-[#1D5D7F]">{questoesRespondidas}</span> /{" "}
              {totalQuestoes}
            </div>
          </div>

          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#1D5D7F] h-full transition-all duration-300"
              style={{
                width: `${(questoesRespondidas / totalQuestoes) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-10">
          {simulado.questoes.map((q, index) => (
            <div key={q.id} className="space-y-4">
              <h3 className="font-bold text-gray-800 leading-tight text-base sm:text-lg">
                {index + 1}. {q.enunciado}
              </h3>

              <div className="grid gap-3">
                {q.alternativas.map((alt) => {
                  const isSelected = respostas[q.id] === alt.id;
                  const isDisabled = finalizado || tempoRestante === 0;

                  return (
                    <label
                      key={alt.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                        isSelected
                          ? "bg-blue-50 border-[#1D5D7F] shadow-sm"
                          : "border-gray-100 hover:border-gray-200"
                      } ${isDisabled ? "opacity-60 cursor-not-allowed active:scale-100" : ""}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        className="w-5 h-5 text-[#1D5D7F] focus:ring-[#1D5D7F]"
                        checked={isSelected}
                        onChange={() => selecionarAlternativa(q.id, alt.id)}
                        disabled={isDisabled}
                      />
                      <div className="flex gap-2 text-sm sm:text-base">
                        <span className="font-bold text-[#1D5D7F]">
                          {alt.letra})
                        </span>
                        <span className="text-gray-700">{alt.texto}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-6 py-3 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors text-sm sm:text-base"
            disabled={finalizado}
          >
            Cancelar
          </button>
          <button
            onClick={finalizarSimulado}
            disabled={finalizado || tempoRestante === 0}
            className="order-1 sm:order-2 px-8 py-3.5 bg-[#1D5D7F] text-white rounded-xl font-bold hover:bg-[#164a66] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-sm sm:text-base"
          >
            {finalizado
              ? "Enviando..."
              : tempoRestante === 0
                ? "Tempo esgotado"
                : "Finalizar Simulado"}
          </button>
        </div>
      </div>
    </div>
  );
}

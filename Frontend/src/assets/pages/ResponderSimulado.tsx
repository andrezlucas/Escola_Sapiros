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

  // Função para iniciar tentativa (chamada uma vez só)
  const iniciarTentativa = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/simulados/${simuladoId}/iniciar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
          }
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

  // Timer regressivo
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
    return `${minutos.toString().padStart(2, "0")}min`;
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
          })
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
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao finalizar");
      }

      const resultado = await res.json();
      toast.success(
        `Simulado finalizado! Sua nota: ${resultado.notaFinal || "—"}`
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
        <p className="text-xl text-white">Carregando simulado...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-xl text-red-600 mb-4">{erro}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (!simulado || !tentativaIniciada) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-xl text-red-600 mb-4">
            Não foi possível iniciar o simulado.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b pb-4 mb-6 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            {simulado.titulo}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 gap-4">
            <div className="text-xl font-bold text-[#1D5D7F]">
              Tempo restante: {formatarTempo()}
            </div>
            <div className="text-lg text-gray-700">
              Questões respondidas: {questoesRespondidas} / {totalQuestoes}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {simulado.questoes.map((q, index) => (
            <div key={q.id} className="space-y-4">
              <h3 className="font-bold text-gray-800 leading-tight">
                {index + 1}. {q.enunciado}
              </h3>

              <div className="grid gap-2">
                {q.alternativas.map((alt) => (
                  <label
                    key={alt.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-blue-50 ${
                      respostas[q.id] === alt.id
                        ? "bg-blue-100 border-[#1D5D7F]"
                        : ""
                    } ${
                      finalizado || tempoRestante === 0
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="w-4 h-4 text-[#1D5D7F]"
                      checked={respostas[q.id] === alt.id}
                      onChange={() => selecionarAlternativa(q.id, alt.id)}
                      disabled={finalizado || tempoRestante === 0}
                    />
                    <span className="text-gray-700">{alt.texto}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
            disabled={finalizado}
          >
            Cancelar
          </button>
          <button
            onClick={finalizarSimulado}
            disabled={finalizado || tempoRestante === 0}
            className="px-8 py-2.5 bg-[#1D5D7F] text-white rounded-lg font-bold hover:bg-[#164a66] shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {finalizado
              ? "Finalizado!"
              : tempoRestante === 0
              ? "Tempo esgotado"
              : "Finalizar e Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

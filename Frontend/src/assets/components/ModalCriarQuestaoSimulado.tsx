import { useState } from "react";
import { toast } from "react-toastify";

interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

interface Questao {
  id: string;
  enunciado: string;
  tipo: "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO";
  valor: number;
  alternativas: Alternativa[];
}

interface Props {
  onClose: () => void;
  onAdicionarQuestao: (questao: Questao) => void;
}

export default function ModalCriarQuestaoSimulado({
  onClose,
  onAdicionarQuestao,
}: Props) {
  const [enunciado, setEnunciado] = useState("");
  const [tipoQuestao, setTipoQuestao] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");

  const [valor, setValor] = useState(1);
  const [alternativas, setAlternativas] = useState<Alternativa[]>([
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
  ]);

  const [temaIA, setTemaIA] = useState("");
  const [quantidadeIA, setQuantidadeIA] = useState(1);
  const [loadingIA, setLoadingIA] = useState(false);

  function atualizarAlternativa(id: string, campo: string, valor: any) {
    setAlternativas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  }

  function adicionarQuestao() {
    if (!enunciado.trim()) return toast.error("Digite o enunciado da questão");

    if (tipoQuestao !== "DISSERTATIVA") {
      if (!alternativas.some((a) => a.correta))
        return toast.error("Marque uma alternativa correta");
    }

    onAdicionarQuestao({
      id: crypto.randomUUID(),
      enunciado,
      tipo: tipoQuestao,
      valor,
      alternativas: tipoQuestao === "DISSERTATIVA" ? [] : alternativas,
    });
  }

  async function gerarQuestoesIA() {
    if (!temaIA.trim()) return toast.error("Informe um tema para a IA");

    setLoadingIA(true);

    setTimeout(() => {
      for (let i = 0; i < quantidadeIA; i++) {
        onAdicionarQuestao({
          id: crypto.randomUUID(),
          enunciado: `Questão gerada por IA sobre ${temaIA}`,
          tipo: "MULTIPLA_ESCOLHA",
          valor: 1,
          alternativas: [
            { id: crypto.randomUUID(), texto: "Alternativa A", correta: true },
            { id: crypto.randomUUID(), texto: "Alternativa B", correta: false },
          ],
        });
      }

      toast.success("Questões geradas por IA!");
      setLoadingIA(false);
      onClose();
    }, 1000);
  }

  return (
    <div className="bg-white w-full max-w-2xl rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Adicionar Questão</h2>

      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Gerar por IA</h3>

        <input
          className="input w-full mb-2"
          placeholder="Tema da questão"
          value={temaIA}
          onChange={(e) => setTemaIA(e.target.value)}
        />

        <input
          type="number"
          className="input w-24 mb-2"
          value={quantidadeIA}
          onChange={(e) => setQuantidadeIA(Number(e.target.value))}
        />

        <button
          onClick={gerarQuestoesIA}
          disabled={loadingIA}
          className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg"
        >
          {loadingIA ? "Gerando..." : "Gerar com IA"}
        </button>
      </div>

      <div className="space-y-3">
        <select
          className="input w-full"
          value={tipoQuestao}
          onChange={(e) => setTipoQuestao(e.target.value as any)}
        >
          <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
          <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
          <option value="DISSERTATIVA">Dissertativa</option>
        </select>

        <textarea
          className="input w-full h-24"
          placeholder="Enunciado"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
        />

        {tipoQuestao !== "DISSERTATIVA" &&
          alternativas.map((alt, i) => (
            <div key={alt.id} className="flex gap-2">
              <input
                type="radio"
                checked={alt.correta}
                onChange={() => atualizarAlternativa(alt.id, "correta", true)}
              />
              <input
                className="input flex-1"
                placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                value={alt.texto}
                onChange={(e) =>
                  atualizarAlternativa(alt.id, "texto", e.target.value)
                }
              />
            </div>
          ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg">
          Cancelar
        </button>
        <button
          onClick={adicionarQuestao}
          className="px-4 py-2 bg-[#1D5D7F] text-white rounded-lg"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

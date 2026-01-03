import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Habilidade = {
  id: string;
  nome: string;
};

type Alternativa = {
  id: string;
  texto: string;
  correta: boolean;
};

type ModalEditarQuestaoProps = {
  atividadeId: string;
  disciplinaId: string;
  questao: any;
  onClose: () => void;
  onAtualizarQuestao: (questaoAtualizada: any) => void;
};

export default function ModalEditarQuestao({
  atividadeId,
  questao,
  onClose,
  onAtualizarQuestao,
  disciplinaId,
}: ModalEditarQuestaoProps) {
  const [enunciado, setEnunciado] = useState("");
  const [valor, setValor] = useState<number>(1);
  const [tipo, setTipo] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");

  const [alternativas, setAlternativas] = useState<Alternativa[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<
    Habilidade[]
  >([]);

  useEffect(() => {
    setEnunciado(questao.enunciado);
    setValor(Number(questao.valor));
    setTipo(questao.tipo);
    setHabilidadesSelecionadas(questao.habilidades ?? []);

    if (questao.tipo === "DISSERTATIVA") {
      setAlternativas([]);
    }

    if (questao.tipo === "VERDADEIRO_FALSO") {
      setAlternativas(
        questao.alternativas?.length
          ? questao.alternativas
          : [
              { id: crypto.randomUUID(), texto: "Verdadeiro", correta: false },
              { id: crypto.randomUUID(), texto: "Falso", correta: false },
            ]
      );
    }

    if (questao.tipo === "MULTIPLA_ESCOLHA") {
      setAlternativas(questao.alternativas ?? []);
    }
  }, [questao]);

  useEffect(() => {
    async function fetchHabilidades() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/disciplinas/${disciplinaId}/habilidades`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setHabilidades(data);
      } catch {
        toast.error("Erro ao carregar habilidades");
      }
    }

    if (disciplinaId) {
      fetchHabilidades();
    }
  }, [disciplinaId]);

  function atualizarAlternativa(
    id: string,
    campo: keyof Alternativa,
    valor: any
  ) {
    setAlternativas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  }

  function adicionarHabilidade(habilidadeId: string) {
    const habilidade = habilidades.find((h) => h.id === habilidadeId);
    if (!habilidade) return;

    if (habilidadesSelecionadas.some((h) => h.id === habilidade.id)) return;

    setHabilidadesSelecionadas((prev) => [...prev, habilidade]);
  }

  function removerHabilidade(h: Habilidade) {
    setHabilidadesSelecionadas((prev) => prev.filter((x) => x.id !== h.id));
  }

  async function salvarEdicao() {
    if (!enunciado.trim()) {
      return toast.error("Enunciado obrigatório");
    }

    if (tipo !== "DISSERTATIVA") {
      if (!alternativas.some((a) => a.correta)) {
        return toast.error("Selecione uma alternativa correta");
      }
    }

    try {
      const token = localStorage.getItem("token");

      const payload: any = {
        enunciado,
        valor: Number(valor),
        habilidadesIds: habilidadesSelecionadas.map((h) => h.id),
      };

      if (tipo !== "DISSERTATIVA") {
        payload.alternativas = alternativas.map((a) => ({
          id: a.id,
          texto: a.texto,
          correta: a.correta,
        }));
      }

      const res = await fetch(
        `http://localhost:3000/atividades/${atividadeId}/questoes/${questao.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Erro ao editar questão");

      const questaoAtualizada = await res.json();

      toast.success("Questão atualizada!");
      onAtualizarQuestao(questaoAtualizada);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Editar Questão</h2>

      <label className="block font-medium mb-1">Enunciado</label>
      <textarea
        className="input w-full h-24 mb-4"
        value={enunciado}
        onChange={(e) => setEnunciado(e.target.value)}
      />

      <label className="block font-medium mb-1">Valor</label>
      <input
        type="number"
        className="input w-32 mb-4"
        min={0.5}
        step={0.5}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
      />

      {tipo !== "DISSERTATIVA" && (
        <>
          <label className="block font-medium mb-2">Alternativas</label>

          {alternativas.map((alt) => (
            <div key={alt.id} className="flex gap-2 mb-2 items-center">
              <input
                type="radio"
                name="correta"
                checked={alt.correta}
                onChange={() =>
                  setAlternativas((prev) =>
                    prev.map((a) => ({
                      ...a,
                      correta: a.id === alt.id,
                    }))
                  )
                }
              />

              <input
                type="text"
                className="input flex-1"
                value={alt.texto}
                disabled={tipo === "VERDADEIRO_FALSO"}
                onChange={(e) =>
                  atualizarAlternativa(alt.id, "texto", e.target.value)
                }
              />
            </div>
          ))}
        </>
      )}

      <div className="mt-6">
        <label className="block font-medium mb-2">Habilidades</label>

        <div className="flex flex-wrap gap-2 mb-2">
          {habilidadesSelecionadas.map((h) => (
            <span
              key={h.id}
              onClick={() => removerHabilidade(h)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer"
            >
              {h.nome} ✕
            </span>
          ))}
        </div>

        <select
          className="input w-full"
          onChange={(e) => {
            adicionarHabilidade(e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Selecionar habilidade</option>
          {habilidades.map((h) => (
            <option key={h.id} value={h.id}>
              {h.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancelar
        </button>
        <button
          onClick={salvarEdicao}
          className="px-4 py-2 bg-[#1D5D7F] text-white rounded"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

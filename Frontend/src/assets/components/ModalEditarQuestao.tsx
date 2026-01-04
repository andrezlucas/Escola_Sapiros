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
    <div className="w-full max-w-2xl bg-white rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Editar Questão</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Enunciado da questão
        </label>
        <textarea
          className="input h-24 w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base"
          placeholder="Digite o enunciado da questão"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Valor da questão
        </label>
        <input
          type="number"
          min={0.5}
          step={0.5}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          className="input w-32 border border-gray-200 rounded-lg bg-blue-50"
        />
      </div>

      {tipo !== "DISSERTATIVA" && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Alternativas
          </label>

          <div className="space-y-3">
            {alternativas.map((alt, index) => (
              <div key={alt.id} className="flex items-center gap-3">
                <div className="flex items-center">
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
                    className="mr-2"
                  />
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}.
                  </span>
                </div>

                <input
                  type="text"
                  className="input flex-1"
                  disabled={tipo === "VERDADEIRO_FALSO"}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                  value={alt.texto}
                  onChange={(e) =>
                    atualizarAlternativa(alt.id, "texto", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Habilidades / Competências
        </label>

        <div className="flex flex-wrap gap-2 mb-2">
          {habilidadesSelecionadas.map((h) => (
            <span
              key={h.id}
              onClick={() => removerHabilidade(h)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer flex items-center gap-1"
            >
              {h.nome} <span className="text-red-500">✕</span>
            </span>
          ))}
        </div>

        <select
          className="input w-full border border-gray-200 rounded-lg bg-blue-50"
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={salvarEdicao}
          className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66] transition font-medium"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

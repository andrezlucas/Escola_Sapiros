import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type TipoQuestao = "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO";

interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

interface Habilidade {
  id: string;
  nome: string;
}

interface Props {
  disciplinaId: string;
  onClose: () => void;
  onAdicionarQuestao: (questao: {
    enunciado: string;
    tipo: TipoQuestao;
    valor: number;
    alternativas?: { texto: string; correta: boolean }[];
    habilidadesIds?: string[];
  }) => void;
}

export default function ModalCriarQuestaoSimulado({
  disciplinaId,
  onClose,
  onAdicionarQuestao,
}: Props) {
  const [abaAtiva, setAbaAtiva] = useState<"manual" | "ia">("manual");

  const [enunciado, setEnunciado] = useState("");
  const [tipo, setTipo] = useState<TipoQuestao>("MULTIPLA_ESCOLHA");
  const [valor, setValor] = useState(1);
  const [alternativas, setAlternativas] = useState<Alternativa[]>([]);

  const [temaIA, setTemaIA] = useState("");
  const [quantidadeIA, setQuantidadeIA] = useState(1);
  const [tipoIA, setTipoIA] = useState<TipoQuestao>("MULTIPLA_ESCOLHA");
  const [loadingIA, setLoadingIA] = useState(false);

  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (abaAtiva === "manual") {
      if (tipo === "MULTIPLA_ESCOLHA") {
        if (alternativas.length < 4) {
          setAlternativas([
            { id: crypto.randomUUID(), texto: "", correta: false },
            { id: crypto.randomUUID(), texto: "", correta: false },
            { id: crypto.randomUUID(), texto: "", correta: false },
            { id: crypto.randomUUID(), texto: "", correta: false },
          ]);
        }
      } else if (tipo === "VERDADEIRO_FALSO") {
        setAlternativas([
          { id: crypto.randomUUID(), texto: "Verdadeiro", correta: false },
          { id: crypto.randomUUID(), texto: "Falso", correta: false },
        ]);
      } else if (tipo === "DISSERTATIVA") {
        setAlternativas([]);
      }
    }
  }, [tipo, abaAtiva]);

  useEffect(() => {
    async function fetchHabilidades() {
      if (!disciplinaId) return;
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
        setHabilidades(data.map((h: any) => ({ id: h.id, nome: h.nome })));
      } catch {
        toast.error("Erro ao carregar habilidades");
      }
    }
    fetchHabilidades();
  }, [disciplinaId]);

  const toggleHabilidade = (id: string) => {
    setHabilidadesSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const atualizarAlternativa = (
    id: string,
    campo: "texto" | "correta",
    valor: any
  ) => {
    setAlternativas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a))
    );
  };

  const salvarManual = () => {
    if (!enunciado.trim()) return toast.error("Digite o enunciado");

    if (tipo !== "DISSERTATIVA") {
      if (alternativas.some((a) => !a.texto.trim()))
        return toast.error("Preencha todas as alternativas");
      if (!alternativas.some((a) => a.correta))
        return toast.error("Marque uma alternativa correta");
    }

    onAdicionarQuestao({
      enunciado,
      tipo,
      valor,
      alternativas:
        tipo === "DISSERTATIVA"
          ? undefined
          : alternativas.map((a) => ({ texto: a.texto, correta: a.correta })),
      habilidadesIds: habilidadesSelecionadas.length
        ? habilidadesSelecionadas
        : undefined,
    });

    toast.success("Questão adicionada ao simulado!");
    onClose();
  };

  const gerarComIA = async () => {
    if (!temaIA.trim()) return toast.error("Digite um tema");

    setLoadingIA(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3000/atividades/gerar-questoes-ia",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            disciplinaId,
            tema: temaIA,
            quantidade: quantidadeIA,
            tipos: [tipoIA],
            habilidadesIds: habilidadesSelecionadas.length
              ? habilidadesSelecionadas
              : undefined,
          }),
        }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();

      data.questoes.forEach((q: any) => {
        onAdicionarQuestao({
          enunciado: q.enunciado,
          tipo: q.tipo || tipoIA,
          valor: q.valor || 1,
          alternativas: q.alternativas
            ? q.alternativas.map((a: any) => ({
                texto: a.texto,
                correta: a.correta,
              }))
            : undefined,
          habilidadesIds: q.habilidadesIds || habilidadesSelecionadas,
        });
      });

      toast.success(`${data.questoes.length} questão(ões) gerada(s) com IA!`);
      onClose();
    } catch (err) {
      toast.error("Erro ao gerar questões com IA");
    } finally {
      setLoadingIA(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 my-8 mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">
          Adicionar Questão ao Simulado
        </h2>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setAbaAtiva("manual")}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              abaAtiva === "manual"
                ? "border-[#1D5D7F] text-[#1D5D7F]"
                : "border-transparent text-gray-600"
            }`}
          >
            Criar Manualmente
          </button>
          <button
            onClick={() => setAbaAtiva("ia")}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              abaAtiva === "ia"
                ? "border-[#1D5D7F] text-[#1D5D7F]"
                : "border-transparent text-gray-600"
            }`}
          >
            Gerar com IA
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Habilidades (opcional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {habilidadesSelecionadas.map((id) => {
              const hab = habilidades.find((h) => h.id === id);
              return hab ? (
                <span
                  key={id}
                  onClick={() => toggleHabilidade(id)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer flex items-center gap-1"
                >
                  {hab.nome} <span className="text-red-600">✕</span>
                </span>
              ) : null;
            })}
          </div>
          <select
            className="w-full p-2 border rounded-lg"
            onChange={(e) => {
              if (e.target.value) {
                toggleHabilidade(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="">Selecionar habilidade...</option>
            {habilidades.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nome}
              </option>
            ))}
          </select>
        </div>

        {abaAtiva === "manual" ? (
          <div className="space-y-4">
            <select
              className="w-full p-2 border rounded-lg"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoQuestao)}
            >
              <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
              <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
              <option value="DISSERTATIVA">Dissertativa</option>
            </select>

            <textarea
              className="w-full p-3 border rounded-lg resize-none h-32"
              placeholder="Enunciado da questão"
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
            />

            <input
              type="number"
              min={0.5}
              step={0.5}
              className="w-32 p-2 border rounded-lg"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              placeholder="Valor"
            />

            {tipo !== "DISSERTATIVA" && (
              <div className="space-y-3">
                <label className="font-medium">Alternativas</label>
                {alternativas.map((alt, i) => (
                  <div key={alt.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correta"
                      checked={alt.correta}
                      onChange={() =>
                        setAlternativas((prev) =>
                          prev.map((a) =>
                            a.id === alt.id
                              ? { ...a, correta: true }
                              : { ...a, correta: false }
                          )
                        )
                      }
                    />
                    <span className="w-8 font-medium">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-lg"
                      placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
                      value={alt.texto}
                      onChange={(e) =>
                        atualizarAlternativa(alt.id, "texto", e.target.value)
                      }
                      disabled={tipo === "VERDADEIRO_FALSO"}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={onClose} className="px-5 py-2 border rounded-lg">
                Cancelar
              </button>
              <button
                onClick={salvarManual}
                className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium"
              >
                Adicionar Questão
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Tema para gerar questões (ex: Revolução Industrial)"
              value={temaIA}
              onChange={(e) => setTemaIA(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full p-2 border rounded-lg"
                  value={quantidadeIA}
                  onChange={(e) => setQuantidadeIA(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={tipoIA}
                  onChange={(e) => setTipoIA(e.target.value as TipoQuestao)}
                >
                  <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  <option value="DISSERTATIVA">Dissertativa</option>
                  <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-5 py-2 border rounded-lg mr-3"
              >
                Cancelar
              </button>
              <button
                onClick={gerarComIA}
                disabled={loadingIA}
                className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium disabled:opacity-70"
              >
                {loadingIA ? "Gerando..." : "Gerar com IA"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

type ModalCriarQuestaoProps = {
  atividadeId: string;
  disciplinaId: string;
  onClose: () => void;
  onCriarQuestao: (novaQuestao: any) => void;
};

export default function ModalCriarQuestao({
  atividadeId,
  disciplinaId,
  onClose,
  onCriarQuestao,
}: ModalCriarQuestaoProps) {
  // Aba ativa: "manual" ou "ia"
  const [abaAtiva, setAbaAtiva] = useState<"manual" | "ia">("manual");

  // === Estados para criação manual ===
  const [enunciado, setEnunciado] = useState("");
  const [valor, setValor] = useState<number>(1);
  const [tipo, setTipo] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");

  const [alternativas, setAlternativas] = useState<Alternativa[]>([
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
  ]);

  const [temaIA, setTemaIA] = useState("");
  const [quantidadeIA, setQuantidadeIA] = useState(1);
  const [tipoQuestaoIA, setTipoQuestaoIA] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");
  const [loadingIA, setLoadingIA] = useState(false);

  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<
    Habilidade[]
  >([]);

  useEffect(() => {
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
  }, [tipo]);

  useEffect(() => {
    async function fetchHabilidades() {
      if (!disciplinaId) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/disciplinas/${disciplinaId}/habilidades`,
          { headers: { Authorization: `Bearer ${token}` } },
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

  function adicionarHabilidade(habilidadeId: string) {
    const habilidade = habilidades.find((h) => h.id === habilidadeId);
    if (
      !habilidade ||
      habilidadesSelecionadas.some((h) => h.id === habilidade.id)
    )
      return;
    setHabilidadesSelecionadas((prev) => [...prev, habilidade]);
  }

  function removerHabilidade(h: Habilidade) {
    setHabilidadesSelecionadas((prev) => prev.filter((x) => x.id !== h.id));
  }

  function atualizarAlternativa(
    id: string,
    campo: "texto" | "correta",
    valor: string | boolean,
  ) {
    setAlternativas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)),
    );
  }

  function adicionarAlternativa() {
    setAlternativas((prev) => [
      ...prev,
      { id: crypto.randomUUID(), texto: "", correta: false },
    ]);
  }

  function removerAlternativa(id: string) {
    if (alternativas.length <= 2) return;
    setAlternativas((prev) => prev.filter((a) => a.id !== id));
  }

  async function salvarManual() {
    if (!enunciado.trim()) return toast.error("Digite o enunciado");
    if (!valor || valor <= 0)
      return toast.error("Valor deve ser maior que zero");
    if (tipo !== "DISSERTATIVA") {
      if (alternativas.some((a) => !a.texto.trim()))
        return toast.error("Preencha todas as alternativas");
      if (!alternativas.some((a) => a.correta))
        return toast.error("Selecione uma alternativa correta");
    }

    try {
      const token = localStorage.getItem("token");
      const payload: any = {
        enunciado,
        tipo,
        valor,
        habilidadesIds: habilidadesSelecionadas.map((h) => h.id),
      };
      if (tipo !== "DISSERTATIVA") {
        payload.alternativas = alternativas.map((a) => ({
          texto: a.texto,
          correta: a.correta,
        }));
      }

      const res = await fetch(
        `http://localhost:3000/atividades/${atividadeId}/questoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error();
      const questaoCriada = await res.json();
      toast.success("Questão adicionada!");
      onCriarQuestao(questaoCriada);
      onClose();
    } catch {
      toast.error("Erro ao salvar questão");
    }
  }

  /* ==============================
     GERAR COM IA
  ============================== */
  async function gerarQuestoesComIA() {
    if (!temaIA.trim()) return toast.error("Digite um tema");

    setLoadingIA(true);
    try {
      const token = localStorage.getItem("token");

      const resIA = await fetch(
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
            habilidadesIds: habilidadesSelecionadas.map((h) => h.id),
            tipos: [tipoQuestaoIA],
          }),
        },
      );

      if (!resIA.ok) throw new Error();
      const dataIA = await resIA.json();

      for (const q of dataIA.questoes) {
        const payload: any = {
          enunciado: q.enunciado,
          tipo: q.tipo || tipoQuestaoIA,
          valor: q.valor || 1,
          habilidadesIds: (q.habilidades || []).map((h: any) => h.id),
        };
        if (q.tipo !== "DISSERTATIVA" && q.alternativas) {
          payload.alternativas = q.alternativas;
        }

        const resSave = await fetch(
          `http://localhost:3000/atividades/${atividadeId}/questoes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!resSave.ok) throw new Error();
        const questaoSalva = await resSave.json();
        onCriarQuestao(questaoSalva);
      }

      toast.success(
        `${dataIA.questoes.length} questão(ões) adicionada(s) com IA!`,
      );
      onClose();
    } catch {
      toast.error("Erro ao gerar questões com IA");
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-xl p-6 my-8 mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Adicionar Nova Questão</h2>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setAbaAtiva("manual")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              abaAtiva === "manual"
                ? "border-[#1D5D7F] text-[#1D5D7F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Criar Manualmente
          </button>
          <button
            onClick={() => setAbaAtiva("ia")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              abaAtiva === "ia"
                ? "border-[#1D5D7F] text-[#1D5D7F]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Gerar com IA
          </button>
        </div>

        {abaAtiva === "manual" ? (
          <>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tipo
                </label>
                <select
                  className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                >
                  <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
                  <option value="DISSERTATIVA">Dissertativa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Enunciado
                </label>
                <textarea
                  className="input h-28 w-full border border-gray-200 rounded-lg bg-blue-50 resize-none"
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                  placeholder="Ex: Qual foi a principal causa da Revolução Francesa?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Valor
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
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Alternativas
                  </label>
                  {alternativas.map((alt, i) => (
                    <div key={alt.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correta"
                        checked={alt.correta}
                        onChange={(e) =>
                          atualizarAlternativa(
                            alt.id,
                            "correta",
                            e.target.checked,
                          )
                        }
                        className="mr-2"
                      />
                      <span className="font-medium w-6">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder={`Alternativa ${String.fromCharCode(
                          65 + i,
                        )}`}
                        value={alt.texto}
                        onChange={(e) =>
                          atualizarAlternativa(alt.id, "texto", e.target.value)
                        }
                        disabled={tipo === "VERDADEIRO_FALSO"}
                      />
                      {tipo === "MULTIPLA_ESCOLHA" &&
                        alternativas.length > 2 && (
                          <button
                            onClick={() => removerAlternativa(alt.id)}
                            className="text-red-500 text-xl"
                          >
                            ✕
                          </button>
                        )}
                    </div>
                  ))}
                  {tipo === "MULTIPLA_ESCOLHA" && (
                    <button
                      onClick={adicionarAlternativa}
                      className="text-[#1D5D7F] text-sm hover:underline"
                    >
                      + Adicionar alternativa
                    </button>
                  )}
                </div>
              )}

              {/* Habilidades compartilhadas */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Habilidades
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

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={salvarManual}
                  className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#164a66]"
                >
                  Adicionar Questão
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Aba IA */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tema
                </label>
                <input
                  type="text"
                  placeholder="Ex: Segunda Guerra Mundial"
                  value={temaIA}
                  onChange={(e) => setTemaIA(e.target.value)}
                  className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantidadeIA}
                    onChange={(e) => setQuantidadeIA(Number(e.target.value))}
                    className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Tipo
                  </label>
                  <select
                    className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                    value={tipoQuestaoIA}
                    onChange={(e) => setTipoQuestaoIA(e.target.value as any)}
                  >
                    <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                    <option value="DISSERTATIVA">Dissertativa</option>
                    <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
                  </select>
                </div>
              </div>

              {/* Habilidades (compartilhadas) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Habilidades (opcional)
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

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={gerarQuestoesComIA}
                  disabled={loadingIA}
                  className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#164a66] disabled:opacity-70"
                >
                  {loadingIA ? "Gerando..." : "Gerar com IA"}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

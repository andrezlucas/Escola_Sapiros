import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { toast } from "react-toastify";

interface Turma {
  id: string;
  nome_turma: string;
}
interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}
interface Habilidade {
  id: string;
  nome: string;
}
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
  habilidades: Habilidade[];
}

interface FormData {
  titulo: string;
  descricao: string;
  turmaId: string;
  disciplinaId: string;
  dataEntrega: string;
}

interface FormAtividadeProps {
  atividadeId?: string;
  onSubmitCallback?: (atividadeAtualizada: any) => void;
}

function FormAtividade({ atividadeId, onSubmitCallback }: FormAtividadeProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loadingListas, setLoadingListas] = useState(true);

  const [enunciado, setEnunciado] = useState("");
  const [alternativas, setAlternativas] = useState<Alternativa[]>([
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
    { id: crypto.randomUUID(), texto: "", correta: false },
  ]);
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<
    Habilidade[]
  >([]);
  const [tipoQuestao, setTipoQuestao] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");
  const [valorQuestao, setValorQuestao] = useState<number>(1);

  const [temaIA, setTemaIA] = useState("");
  const [quantidadeIA, setQuantidadeIA] = useState(1);
  const [loadingIA, setLoadingIA] = useState(false);
  const [tipoQuestaoIA, setTipoQuestaoIA] = useState<
    "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO"
  >("MULTIPLA_ESCOLHA");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: { titulo: "", descricao: "", turmaId: "", disciplinaId: "" },
  });

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  const carregouRef = useRef(false);

  useEffect(() => {
    if (!atividadeId || carregouRef.current) return;
    carregouRef.current = true;

    const fetchAtividade = async () => {
      try {
        reset({
          titulo: "",
          descricao: "",
          turmaId: "",
          disciplinaId: "",
          dataEntrega: "",
        });
        setQuestoes([]);
        setEnunciado("");
        setTipoQuestao("MULTIPLA_ESCOLHA");
        setValorQuestao(1);
        setAlternativas([
          { id: crypto.randomUUID(), texto: "", correta: false },
          { id: crypto.randomUUID(), texto: "", correta: false },
          { id: crypto.randomUUID(), texto: "", correta: false },
          { id: crypto.randomUUID(), texto: "", correta: false },
        ]);
        setHabilidadesSelecionadas([]);

        const res = await authFetch(
          `http://localhost:3000/atividades/${atividadeId}`
        );
        const data = await res.json();

        reset({
          titulo: data.titulo,
          descricao: data.descricao,
          disciplinaId: data.disciplina.id_disciplina,
          turmaId: data.turmas[0]?.id,
          dataEntrega: data.dataEntrega?.slice(0, 10),
        });

        setQuestoes(
          data.questoes.map((q: any) => ({
            id: q.id,
            enunciado: q.enunciado,
            tipo: q.tipo,
            valor: Number(q.valor),
            alternativas: q.alternativas ?? [],
            habilidades: q.habilidades ?? [],
          }))
        );
      } catch {
        toast.error("Erro ao carregar atividade");
      }
    };
    fetchAtividade();
  }, [atividadeId]);

  useEffect(() => {
    const fetchListas = async () => {
      setLoadingListas(true);
      try {
        const [turmasRes, disciplinasRes] = await Promise.all([
          authFetch("http://localhost:3000/professores/turmas"),
          authFetch("http://localhost:3000/professores/disciplinas"),
        ]);
        setTurmas(await turmasRes.json());
        setDisciplinas(await disciplinasRes.json());
      } catch {
        toast.error("Erro ao carregar turmas e disciplinas");
      } finally {
        setLoadingListas(false);
      }
    };
    fetchListas();
  }, []);

  useEffect(() => {
    const disciplinaId = watch("disciplinaId");
    if (!disciplinaId) return setHabilidades([]);

    const fetchHabilidades = async () => {
      try {
        const res = await authFetch(
          `http://localhost:3000/disciplinas/${disciplinaId}/habilidades`
        );
        const data = await res.json();
        setHabilidades(data.map((h: any) => ({ id: h.id, nome: h.nome })));
      } catch {
        toast.error("Erro ao carregar habilidades");
      }
    };
    fetchHabilidades();
  }, [watch("disciplinaId")]);

  useEffect(() => {
    if (tipoQuestao === "VERDADEIRO_FALSO") {
      setAlternativas([
        { id: crypto.randomUUID(), texto: "Verdadeiro", correta: false },
        { id: crypto.randomUUID(), texto: "Falso", correta: false },
      ]);
    }
    if (tipoQuestao === "DISSERTATIVA") setAlternativas([]);
  }, [tipoQuestao]);

  function atualizarAlternativa(
    id: string,
    campo: string,
    valor: string | boolean
  ) {
    setAlternativas((prev) =>
      prev.map((alt) => (alt.id === id ? { ...alt, [campo]: valor } : alt))
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
    setAlternativas((prev) => prev.filter((alt) => alt.id !== id));
  }

  function adicionarHabilidadePorSelect(
    habilidadeId: string,
    questaoId?: string
  ) {
    const habilidade = habilidades.find((h) => h.id === habilidadeId);
    if (!habilidade) return;

    if (questaoId) {
      setQuestoes((prev) =>
        prev.map((q) =>
          q.id === questaoId &&
          !q.habilidades.some((h) => h.id === habilidade.id)
            ? { ...q, habilidades: [...q.habilidades, habilidade] }
            : q
        )
      );
    } else {
      if (habilidadesSelecionadas.some((h) => h.id === habilidade.id)) return;
      setHabilidadesSelecionadas((prev) => [...prev, habilidade]);
    }
  }

  function removerHabilidade(h: Habilidade, questaoId?: string) {
    if (questaoId) {
      setQuestoes((prev) =>
        prev.map((q) =>
          q.id === questaoId
            ? { ...q, habilidades: q.habilidades.filter((x) => x.id !== h.id) }
            : q
        )
      );
    } else {
      setHabilidadesSelecionadas((prev) => prev.filter((x) => x.id !== h.id));
    }
  }

  function adicionarQuestao() {
    if (tipoQuestao !== "DISSERTATIVA") {
      const alternativasInvalidas = alternativas.some(
        (alt) => !alt.texto.trim()
      );
      if (alternativasInvalidas)
        return toast.error("Preencha todas as alternativas");
      if (!alternativas.some((alt) => alt.correta))
        return toast.error("Selecione pelo menos uma alternativa correta");
    }
    if (!enunciado.trim()) return toast.error("Digite o enunciado da questão");
    if (!valorQuestao || valorQuestao <= 0) {
      return toast.error("O valor da questão deve ser maior que zero");
    }
    setQuestoes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        enunciado,
        tipo: tipoQuestao,
        valor: valorQuestao,
        alternativas: tipoQuestao !== "DISSERTATIVA" ? [...alternativas] : [],
        habilidades: [...habilidadesSelecionadas],
      },
    ]);

    setTipoQuestao("MULTIPLA_ESCOLHA");
    setValorQuestao(1);
    setEnunciado("");
    setAlternativas([
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
    ]);
    setHabilidadesSelecionadas([]);
  }

  async function gerarQuestoesIA() {
    const disciplinaId = watch("disciplinaId");
    if (!disciplinaId)
      return toast.error("Selecione a disciplina antes de gerar questões");
    if (!temaIA.trim())
      return toast.error("Digite um tema para a geração de questões");

    setLoadingIA(true);
    try {
      const res = await authFetch(
        "http://localhost:3000/atividades/gerar-questoes-ia",
        {
          method: "POST",
          body: JSON.stringify({
            disciplinaId,
            tema: temaIA,
            quantidade: quantidadeIA,
            habilidadesIds: habilidadesSelecionadas.map((h) => h.id),
            tipos: [tipoQuestaoIA],
          }),
        }
      );

      if (!res.ok) throw new Error("Erro ao gerar questões com IA");
      const data = await res.json();

      const novasQuestoes: Questao[] = data.questoes.map((q: any) => ({
        id: crypto.randomUUID(),
        enunciado: q.enunciado,
        tipo: q.tipo || tipoQuestaoIA,
        valor: q.valor,
        alternativas: q.alternativas ?? [],
        habilidades: q.habilidades ?? [],
      }));

      setQuestoes((prev) => [...prev, ...novasQuestoes]);

      setEnunciado("");
      setAlternativas([
        { id: crypto.randomUUID(), texto: "", correta: false },
        { id: crypto.randomUUID(), texto: "", correta: false },
        { id: crypto.randomUUID(), texto: "", correta: false },
        { id: crypto.randomUUID(), texto: "", correta: false },
      ]);
      setHabilidadesSelecionadas([]);
      toast.success("Questões geradas com IA adicionadas com sucesso!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingIA(false);
    }
  }

  async function onSubmit(data: FormData) {
    if (questoes.length === 0)
      return toast.error("Adicione pelo menos uma questão");

    const payload = {
      titulo: data.titulo,
      descricao: data.descricao,
      dataEntrega: data.dataEntrega + "T00:00",
      disciplinaId: data.disciplinaId,
      turmaIds: [data.turmaId],
      questoes: questoes.map((q) => ({
        ...(atividadeId && { id: q.id }),
        enunciado: q.enunciado,
        tipo: q.tipo,
        valor: q.valor,
        habilidadesIds: q.habilidades.map((h) => h.id),
        alternativas:
          q.tipo !== "DISSERTATIVA"
            ? q.alternativas.map((a) => ({
                ...(atividadeId && { id: a.id }),
                texto: a.texto,
                correta: a.correta,
              }))
            : undefined,
      })),
    };

    try {
      const url = atividadeId
        ? `http://localhost:3000/atividades/${atividadeId}`
        : "http://localhost:3000/atividades";
      const method = atividadeId ? "PATCH" : "POST";
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao salvar atividade");

      const dataAtualizada = await res.json();
      if (onSubmitCallback) onSubmitCallback(dataAtualizada);
      toast.success(
        atividadeId ? "Atividade atualizada!" : "Atividade criada!"
      );
      handleCancelar();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function handleCancelar() {
    reset();
    setQuestoes([]);
    setEnunciado("");
    setAlternativas([
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
      { id: crypto.randomUUID(), texto: "", correta: false },
    ]);
    setHabilidadesSelecionadas([]);
  }

  return (
    <div className=" w-full h-full  mx-auto">
      <div className="border rounded-xl p-6 flex flex-col gap-6 mb-12">
        <h1 className="text-2xl font-bold mb-2">
          {atividadeId ? "Editar Atividade" : "Criar Nova Atividade"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <section>
            <h2 className="font-semibold mb-2">Detalhe da Atividade</h2>

            <div className="flex flex-col gap-3">
              <Input
                placeholder="Ex: Atividade de História - Período Colonial"
                label="Título da atividade"
                type="text"
                {...register("titulo", {
                  required: "Título é obrigatório",
                  minLength: {
                    value: 5,
                    message: "O título deve ter pelo menos 5 caracteres",
                  },
                })}
                error={errors?.titulo?.message}
              />

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Descrição
                </label>
                <textarea
                  className="input h-35 w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base placeholder-gray-500"
                  placeholder="  Instruções para os alunos completarem a atividade..."
                  {...register("descricao", {
                    required: "Descrição é obrigatória",
                    minLength: {
                      value: 10,
                      message: "A descrição deve ter pelo menos 10 caracteres",
                    },
                  })}
                />
                {errors.descricao && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.descricao.message}
                  </span>
                )}
              </div>

              <div>
                <Input
                  label={""}
                  type="date"
                  {...register("dataEntrega", {
                    required: "A Data de entrega é obrigatória",
                  })}
                ></Input>
                {errors.dataEntrega?.message}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Disciplina
                  </label>
                  <select
                    className="input w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base placeholder-gray-500"
                    {...register("disciplinaId", {
                      required: "Selecione uma disciplina",
                    })}
                    disabled={loadingListas}
                  >
                    <option value="">Selecione a disciplina</option>
                    {disciplinas.map((d) => (
                      <option key={d.id_disciplina} value={d.id_disciplina}>
                        {d.nome_disciplina}
                      </option>
                    ))}
                  </select>
                  {errors.disciplinaId && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.disciplinaId.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Turma
                  </label>
                  <select
                    className="input w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base placeholder-gray-500"
                    {...register("turmaId", {
                      required: "Selecione uma turma",
                    })}
                    disabled={loadingListas}
                  >
                    <option value="">Selecione a turma</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome_turma}
                      </option>
                    ))}
                  </select>
                  {errors.turmaId && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.turmaId.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="mt-8">
            <h2 className="font-semibold mb-2">Gerar Questões com IA</h2>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Digite o tema das questões"
                label="Tema"
                type="text"
                value={temaIA}
                onChange={(e) => setTemaIA(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Quantidade de questões
                </label>
                <input
                  type="number"
                  value={quantidadeIA}
                  onChange={(e) => setQuantidadeIA(Number(e.target.value))}
                  className="input w-20 border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Habilidades
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {habilidadesSelecionadas.map((h) => (
                    <span
                      key={h.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer flex items-center gap-1"
                      onClick={() => removerHabilidade(h)}
                    >
                      {h.nome} <span className="text-red-500">✕</span>
                    </span>
                  ))}
                </div>

                <select
                  className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                  onChange={(e) => {
                    adicionarHabilidadePorSelect(e.target.value);
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

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tipo da Questão
                </label>
                <select
                  className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                  value={tipoQuestaoIA}
                  onChange={(e) =>
                    setTipoQuestaoIA(
                      e.target.value as
                        | "MULTIPLA_ESCOLHA"
                        | "DISSERTATIVA"
                        | "VERDADEIRO_FALSO"
                    )
                  }
                >
                  <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                  <option value="DISSERTATIVA">Dissertativa</option>
                  <option value="VERDADEIRO_FALSO">Verdadeiro/Falso</option>
                </select>
              </div>

              <button
                type="button"
                onClick={gerarQuestoesIA}
                className={`mt-2 px-4 py-2 rounded-lg text-white bg-[#1D5D7F] ${
                  loadingIA ? "bg-[#1D5D7F]" : "bg-[#1D5D7F]-600"
                }`}
                disabled={loadingIA}
              >
                {loadingIA ? "Gerando..." : "Gerar Questões com IA"}
              </button>
            </div>
          </section>
          <section>
            <h2 className="font-semibold mb-2">
              Adicionar Questão ({tipoQuestao.replace("_", " ")})
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Tipo da Questão
              </label>
              <select
                className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                value={tipoQuestao}
                onChange={(e) =>
                  setTipoQuestao(
                    e.target.value as
                      | "MULTIPLA_ESCOLHA"
                      | "DISSERTATIVA"
                      | "VERDADEIRO_FALSO"
                  )
                }
              >
                <option value="MULTIPLA_ESCOLHA">Múltipla Escolha</option>
                <option value="VERDADEIRO_FALSO">Verdadeiro / Falso</option>
                <option value="DISSERTATIVA">Dissertativa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Enunciado da questão
              </label>
              <textarea
                className="input h-24 w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base placeholder-gray-500"
                placeholder="Ex: Qual evento marcou o início da colonização portuguesa no Brasil?"
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Valor da questão
              </label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={valorQuestao}
                onChange={(e) => setValorQuestao(Number(e.target.value))}
                className="input w-32 border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base"
              />
            </div>

            <label className="block text-sm font-medium mt-4 mb-2">
              Alternativas
            </label>
            <div className="space-y-3">
              {tipoQuestao !== "DISSERTATIVA" &&
                alternativas.map((alt, index) => (
                  <div key={alt.id} className="flex items-center gap-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correta"
                        checked={alt.correta}
                        onChange={(e) =>
                          atualizarAlternativa(
                            alt.id,
                            "correta",
                            e.target.checked
                          )
                        }
                        className="mr-2 "
                      />
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                    </div>
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder={`Alternativa ${String.fromCharCode(
                        65 + index
                      )}`}
                      value={alt.texto}
                      onChange={(e) =>
                        atualizarAlternativa(alt.id, "texto", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removerAlternativa(alt.id)}
                      className="text-red-500 hover:text-red-700 px-2 py-1"
                      disabled={alternativas.length <= 2}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            {tipoQuestao !== "DISSERTATIVA" && (
              <button
                type="button"
                onClick={adicionarAlternativa}
                className="mt-3 px-4 py-2 border border-[#1D5D7F] text-[#1D5D7F] rounded-lg hover:bg-[#1D5D7F] hover:text-white transition"
              >
                + Adicionar Alternativa
              </button>
            )}

            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium mb-2">
                Habilidades/Competências
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {habilidadesSelecionadas.map((h) => (
                  <span
                    key={h.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer flex items-center gap-1"
                    onClick={() => removerHabilidade(h)}
                  >
                    {h.nome} <span className="text-red-500">✕</span>
                  </span>
                ))}
              </div>

              <select
                className="input w-full border border-gray-200 rounded-lg bg-blue-50"
                onChange={(e) => {
                  adicionarHabilidadePorSelect(e.target.value);
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
            <button
              type="button"
              className="w-full px-4 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium"
              onClick={adicionarQuestao}
            >
              Adicionar Questão à Atividade
            </button>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">
                Questões Adicionadas ({questoes.length})
              </h3>
              <div className="space-y-4">
                {questoes.map((q, index) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-lg">
                          {index + 1}. {q.enunciado}
                        </strong>
                        <div className="text-sm text-gray-500">
                          Valor: {q.valor} ponto(s)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestoes((prev) =>
                            prev.filter((item) => item.id !== q.id)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      {q.alternativas.map((alt, idx) => (
                        <div key={alt.id} className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded ${
                              alt.correta
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {alt.texto}{" "}
                            {alt.correta && <span className="ml-2">✓</span>}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {q.habilidades.map((h) => (
                        <span
                          key={h.id}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {h.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {questoes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma questão adicionada ainda. Adicione sua primeira
                    questão acima.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164a66] transition font-medium"
            >
              {atividadeId ? "Salvar Alterações" : "Criar Atividade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormAtividade;

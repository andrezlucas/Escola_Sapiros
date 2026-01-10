import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { toast } from "react-toastify";
import ModalCriarQuestaoSimulado from "./ModalCriarQuestaoSimulado";

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface QuestaoLocal {
  id: string;
  enunciado: string;
  tipo: "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO";
  valor: number;
  alternativas?: { texto: string; correta: boolean }[];
  habilidadesIds?: string[];
  area?: string;
}

interface FormSimuladoData {
  titulo: string;
  tempoDuracao: number;
  bimestre: string;
  dataInicio: string;
  dataFim: string;
}

interface FormSimuladoProps {
  simuladoId?: string; // Se existir → edição
  simuladoInicial?: any; // Dados pré-carregados (para edição)
  onExcluirQuestao?: (questaoId: string) => void;
  onSubmitCallback?: (simuladoAtualizado: any) => void;
}

function FormSimulado({
  simuladoId,
  simuladoInicial,
  onExcluirQuestao,
  onSubmitCallback,
}: FormSimuladoProps) {
  const isEdicao = !!simuladoId;

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [questoes, setQuestoes] = useState<QuestaoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const [disciplinaSelecionada, setDisciplinaSelecionada] =
    useState<string>("");
  const [turmasSelecionadas, setTurmasSelecionadas] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormSimuladoData>();

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [discRes, turmaRes] = await Promise.all([
          authFetch("http://localhost:3000/professores/disciplinas"),
          authFetch("http://localhost:3000/professores/turmas"),
        ]);

        const discs = await discRes.json();
        const turms = await turmaRes.json();

        setDisciplinas(discs);
        setTurmas(turms);

        // Sempre limpa estados antes de aplicar novos valores (evita sujeira antiga)
        setQuestoes([]);
        setDisciplinaSelecionada("");
        setTurmasSelecionadas([]);

        if (isEdicao && simuladoInicial) {
          console.log("Carregando simulado para edição:", simuladoInicial); // Debug importante!

          // Preenche campos do react-hook-form
          setValue("titulo", simuladoInicial.titulo || "");
          setValue("tempoDuracao", simuladoInicial.tempoDuracao || 60);
          setValue("bimestre", simuladoInicial.bimestre || "");

          // Datas: formatação segura e local
          if (simuladoInicial.dataInicio) {
            const dt = new Date(simuladoInicial.dataInicio);
            const formatted = dt
              .toLocaleString("sv-SE", {
                // Formato YYYY-MM-DDTHH:mm
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(" ", "T")
              .slice(0, 16);
            setValue("dataInicio", formatted);
          }

          if (simuladoInicial.dataFim) {
            const dt = new Date(simuladoInicial.dataFim);
            const formatted = dt
              .toLocaleString("sv-SE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(" ", "T")
              .slice(0, 16);
            setValue("dataFim", formatted);
          }

          // Disciplina e turmas (sempre reaplicar!)
          const discId = simuladoInicial.disciplina?.id_disciplina || "";
          setDisciplinaSelecionada(discId);

          const turmasIds = simuladoInicial.turmas?.map((t: any) => t.id) || [];
          setTurmasSelecionadas(turmasIds);

          // Questões: sempre recarregar do simuladoInicial
          const questoesFormatadas =
            simuladoInicial.questoes?.map((q: any) => ({
              id: q.id,
              enunciado: q.enunciado,
              tipo: q.tipo,
              valor: q.valor,
              alternativas:
                q.alternativas?.map((a: any) => ({
                  texto: a.texto,
                  correta: a.correta,
                })) || [],
              habilidadesIds: q.habilidades?.map((h: any) => h.id) || [],
              area: simuladoInicial.disciplina?.nome_disciplina || "Disciplina",
            })) || [];

          setQuestoes(questoesFormatadas);
          console.log("Questões carregadas:", questoesFormatadas); // Debug
        } else {
          // Modo criação: reset total
          setValue("titulo", "");
          setValue("tempoDuracao", 60);
          setValue("bimestre", "");
          setValue("dataInicio", "");
          setValue("dataFim", "");
          setDisciplinaSelecionada("");
          setTurmasSelecionadas([]);
          setQuestoes([]);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
        toast.error("Erro ao carregar dados do simulado");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [isEdicao, simuladoInicial, setValue]); // Dependências corretas

  const valorTotalPreview = questoes.reduce(
    (acc, q) => acc + (q.valor || 0),
    0
  );

  const handleCriarQuestao = async (novaQuestao: any) => {
    const questaoFormatada: QuestaoLocal = {
      id: crypto.randomUUID(),
      enunciado: novaQuestao.enunciado,
      tipo: novaQuestao.tipo,
      valor: novaQuestao.valor || 1,
      alternativas: novaQuestao.alternativas,
      habilidadesIds: novaQuestao.habilidadesIds,
      area:
        disciplinas.find((d) => d.id_disciplina === disciplinaSelecionada)
          ?.nome_disciplina || "Disciplina",
    };

    if (isEdicao) {
      try {
        const payload = {
          enunciado: novaQuestao.enunciado,
          tipo: novaQuestao.tipo,
          valor: novaQuestao.valor || 1,
          habilidadesIds: novaQuestao.habilidadesIds || [],
          alternativas:
            novaQuestao.alternativas?.map((a: any) => ({
              texto: a.texto,
              correta: a.correta,
            })) || [],
        };

        const res = await authFetch(
          `http://localhost:3000/simulados/${simuladoId}/questoes`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Erro ao adicionar questão");

        const questaoSalva = await res.json();
        questaoFormatada.id = questaoSalva.id;
        toast.success("Questão adicionada ao simulado!");
      } catch (err) {
        toast.error("Falha ao salvar questão no servidor");
        return;
      }
    }

    setQuestoes((prev) => [...prev, questaoFormatada]);
  };

  const handleRemoverQuestao = async (id: string) => {
    if (isEdicao && onExcluirQuestao) {
      onExcluirQuestao(id);
    }
    setQuestoes((prev) => prev.filter((q) => q.id !== id));
  };

  async function onSubmit(data: FormSimuladoData) {
    if (!isEdicao && questoes.length < 20) {
      return toast.error("O simulado precisa de pelo menos 20 questões!");
    }

    if (!disciplinaSelecionada) {
      return toast.error("Selecione uma disciplina");
    }

    if (turmasSelecionadas.length === 0) {
      return toast.error("Selecione pelo menos uma turma");
    }

    const payload: any = {
      titulo: data.titulo,
      bimestre: data.bimestre,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      tempoDuracao: Number(data.tempoDuracao),
    };

    if (!isEdicao) {
      payload.disciplinaId = disciplinaSelecionada;
      payload.turmaIds = turmasSelecionadas;
      payload.questoes = questoes.map((q) => ({
        enunciado: q.enunciado,
        tipo: q.tipo,
        valor: q.valor,
        habilidadesIds: q.habilidadesIds || [],
        alternativas:
          q.alternativas?.map((a) => ({
            texto: a.texto,
            correta: a.correta,
          })) || [],
      }));
    }

    try {
      const url = isEdicao
        ? `http://localhost:3000/simulados/${simuladoId}`
        : "http://localhost:3000/simulados";

      const res = await authFetch(url, {
        method: isEdicao ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro no servidor");
      }

      const resultado = await res.json();

      toast.success(
        isEdicao ? "Simulado atualizado!" : "Simulado criado com sucesso!"
      );

      if (onSubmitCallback) {
        onSubmitCallback(resultado);
      }

      if (!isEdicao) {
        setQuestoes([]);
        setDisciplinaSelecionada("");
        setTurmasSelecionadas([]);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar simulado");
      console.error(err);
    }
  }

  return (
    <div className="w-full mx-auto">
      <div className="border rounded-xl p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">
          {isEdicao ? "Editar Simulado" : "Criar Simulado"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Informações Básicas</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Título do Simulado"
                  placeholder="Ex: Simulado Trimestral"
                  {...register("titulo", { required: "Título obrigatório" })}
                  error={errors.titulo?.message}
                />

                <Input
                  label="Tempo de Prova (minutos)"
                  type="number"
                  placeholder="Ex: 180"
                  {...register("tempoDuracao", {
                    required: "Informe o tempo",
                    min: { value: 1, message: "Mínimo 1 minuto" },
                  })}
                  error={errors.tempoDuracao?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bimestre
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    {...register("bimestre", {
                      required: "Selecione o bimestre",
                    })}
                  >
                    <option value="">Selecione</option>
                    <option value="PRIMEIRO">1º Bimestre</option>
                    <option value="SEGUNDO">2º Bimestre</option>
                    <option value="TERCEIRO">3º Bimestre</option>
                    <option value="QUARTO">4º Bimestre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data/Hora Início
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg"
                    {...register("dataInicio", { required: "Obrigatório" })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data/Hora Fim
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-lg"
                    {...register("dataFim", { required: "Obrigatório" })}
                  />
                </div>
              </div>
            </section>

            <section className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Questões do Simulado</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!disciplinaSelecionada) {
                      toast.error("Selecione uma disciplina primeiro");
                      return;
                    }
                    setModalAberto(true);
                  }}
                  className="text-sm text-[#1D5D9F] hover:underline"
                >
                  + Adicionar Questão
                </button>
              </div>

              <div className="space-y-3">
                {questoes.map((q, index) => (
                  <div
                    key={q.id}
                    className="border rounded-lg p-3 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <strong>
                        Questão {index + 1}: {q.area || "Disciplina"} •{" "}
                        {q.valor} pts
                      </strong>
                      <p className="text-sm text-gray-600 mt-1">
                        {q.enunciado.substring(0, 120)}
                        {q.enunciado.length > 120 ? "..." : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-red-500 ml-4"
                      onClick={() => handleRemoverQuestao(q.id)}
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {questoes.length > 0 && (
                  <div className="text-right text-sm font-medium mt-2">
                    Valor total estimado: {valorTotalPreview.toFixed(2)} pontos
                  </div>
                )}

                {!isEdicao && questoes.length < 20 && questoes.length > 0 && (
                  <p className="text-red-600 text-sm mt-2">
                    Faltam {20 - questoes.length} questões (mínimo 20
                    obrigatório)
                  </p>
                )}
              </div>
            </section>

            <button
              type="submit"
              disabled={!isEdicao && questoes.length < 20}
              className="self-start px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isEdicao ? "Salvar Alterações" : "Criar Simulado"}
            </button>
          </div>

          <div className="w-80 flex flex-col gap-6">
            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Disciplina</h2>
              <select
                value={disciplinaSelecionada}
                onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map((d) => (
                  <option key={d.id_disciplina} value={d.id_disciplina}>
                    {d.nome_disciplina}
                  </option>
                ))}
              </select>
            </section>

            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Atribuir à turma</h2>
              {turmas.map((t) => (
                <label key={t.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={turmasSelecionadas.includes(t.id)}
                    onChange={(e) => {
                      setTurmasSelecionadas((prev) =>
                        e.target.checked
                          ? [...prev, t.id]
                          : prev.filter((id) => id !== t.id)
                      );
                    }}
                  />
                  <span className="text-sm">{t.nome_turma}</span>
                </label>
              ))}
            </section>
          </div>
        </form>

        {modalAberto && disciplinaSelecionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ModalCriarQuestaoSimulado
              disciplinaId={disciplinaSelecionada}
              onClose={() => setModalAberto(false)}
              onAdicionarQuestao={handleCriarQuestao}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FormSimulado;

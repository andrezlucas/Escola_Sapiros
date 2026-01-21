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
  simuladoId?: string;
  simuladoInicial?: any;
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
    let ativo = true;

    async function carregarDados() {
      try {
        const [discRes, turmaRes] = await Promise.all([
          authFetch("http://localhost:3000/professores/disciplinas"),
          authFetch("http://localhost:3000/professores/turmas"),
        ]);

        const discs = await discRes.json();
        const turms = await turmaRes.json();

        if (!ativo) return;

        setDisciplinas(Array.isArray(discs) ? discs : []);
        setTurmas(Array.isArray(turms) ? turms : []);

        setQuestoes([]);
        setDisciplinaSelecionada("");
        setTurmasSelecionadas([]);

        if (isEdicao && simuladoInicial) {
          setValue("titulo", simuladoInicial.titulo ?? "");
          setValue("tempoDuracao", simuladoInicial.tempoDuracao ?? 60);
          setValue("bimestre", simuladoInicial.bimestre ?? "");

          if (simuladoInicial.dataInicio) {
            const d = new Date(simuladoInicial.dataInicio);
            if (!isNaN(d.getTime())) {
              const local = d.toLocaleString("sv-SE").slice(0, 16);
              setValue("dataInicio", local);
            }
          }

          if (simuladoInicial.dataFim) {
            const d = new Date(simuladoInicial.dataFim);
            if (!isNaN(d.getTime())) {
              const local = d.toLocaleString("sv-SE").slice(0, 16);
              setValue("dataFim", local);
            }
          }

          const discId = simuladoInicial.disciplina?.id_disciplina ?? "";
          setDisciplinaSelecionada(discId);

          const turmasIds = Array.isArray(simuladoInicial.turmas)
            ? simuladoInicial.turmas.map((t: any) => t.id)
            : [];
          setTurmasSelecionadas(turmasIds);

          const questoesFormatadas: QuestaoLocal[] = Array.isArray(
            simuladoInicial.questoes,
          )
            ? simuladoInicial.questoes.map((q: any) => ({
                id: q.id,
                enunciado: q.enunciado ?? "",
                tipo: q.tipo,
                valor: Number(q.valor) || 0,
                alternativas: Array.isArray(q.alternativas)
                  ? q.alternativas.map((a: any) => ({
                      texto: a.texto,
                      correta: !!a.correta,
                    }))
                  : [],
                habilidadesIds: Array.isArray(q.habilidades)
                  ? q.habilidades.map((h: any) => h.id)
                  : [],
                area:
                  simuladoInicial.disciplina?.nome_disciplina ?? "Disciplina",
              }))
            : [];

          setQuestoes(questoesFormatadas);
        } else {
          setValue("titulo", "");
          setValue("tempoDuracao", 60);
          setValue("bimestre", "");
          setValue("dataInicio", "");
          setValue("dataFim", "");
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do simulado");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, [isEdicao, simuladoInicial, setValue]);

  const valorTotalPreview = questoes.reduce(
    (acc, q) => acc + (q.valor || 0),
    0,
  );

  const handleCriarQuestao = async (novaQuestao: any) => {
    const questaoLocal: QuestaoLocal = {
      id: crypto.randomUUID(),
      enunciado: novaQuestao.enunciado,
      tipo: novaQuestao.tipo,
      valor: novaQuestao.valor || 1,
      alternativas: novaQuestao.alternativas || [],
      habilidadesIds: novaQuestao.habilidadesIds || [],
      area:
        disciplinas.find((d) => d.id_disciplina === disciplinaSelecionada)
          ?.nome_disciplina || "Disciplina",
    };

    if (isEdicao) {
      try {
        const res = await authFetch(
          `http://localhost:3000/simulados/${simuladoId}/questoes`,
          {
            method: "POST",
            body: JSON.stringify({
              enunciado: novaQuestao.enunciado,
              tipo: novaQuestao.tipo,
              valor: novaQuestao.valor || 1,
              habilidadesIds: novaQuestao.habilidadesIds || [],
              alternativas: novaQuestao.alternativas || [],
            }),
          },
        );

        if (!res.ok) throw new Error();
        const salva = await res.json();
        questaoLocal.id = salva.id;
      } catch {
        toast.error("Erro ao salvar questão");
        return;
      }
    }

    setQuestoes((prev) => [...prev, questaoLocal]);
  };

  const handleRemoverQuestao = (id: string) => {
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

    const dataInicioISO = new Date(data.dataInicio).toISOString();
    const dataFimISO = new Date(data.dataFim).toISOString();

    if (new Date(dataFimISO) <= new Date(dataInicioISO)) {
      return toast.error("A data final deve ser maior que a data inicial");
    }

    const payload: any = {
      titulo: data.titulo,
      bimestre: data.bimestre,
      dataInicio: dataInicioISO,
      dataFim: dataFimISO,
      tempoDuracao: Number(data.tempoDuracao),
    };

    if (!isEdicao) {
      payload.disciplinaId = disciplinaSelecionada;
      payload.turmaIds = turmasSelecionadas;
      payload.questoes = questoes;
    }

    try {
      const res = await authFetch(
        isEdicao
          ? `http://localhost:3000/simulados/${simuladoId}`
          : "http://localhost:3000/simulados",
        {
          method: isEdicao ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error();

      const result = await res.json();
      toast.success(isEdicao ? "Simulado atualizado!" : "Simulado criado!");
      onSubmitCallback?.(result);
    } catch {
      toast.error("Erro ao salvar simulado");
    }
  }

  return (
    <div className="w-full mx-auto">
      <div className="border rounded-xl p-4 sm:p-6 flex flex-col gap-6">
        <h1 className="text-xl font-bold mb-4 text-[#1D5D7F]">
          {isEdicao ? "Editar Simulado" : "Criar Simulado"}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-6"
        >
          <div className="flex-1 flex flex-col gap-6 order-2 lg:order-1">
            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Informações Básicas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bimestre
                  </label>
                  <select
                    className="w-full p-2 border rounded-lg bg-white"
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

                <div className="md:col-span-1">
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
                  className="text-sm text-[#1D5D9F] hover:underline font-medium"
                >
                  + Adicionar Questão
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {questoes.map((q, index) => (
                  <div
                    key={q.id}
                    className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <strong className="block text-sm">
                        Questão {index + 1}: {q.area || "Disciplina"} •{" "}
                        {q.valor} pts
                      </strong>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {q.enunciado}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-red-500 text-sm font-medium hover:text-red-700 self-end sm:self-start"
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
                  <p className="text-red-600 text-sm mt-2 font-medium">
                    Faltam {20 - questoes.length} questões (mínimo 20
                    obrigatório)
                  </p>
                )}
              </div>
            </section>
            <button
              type="submit"
              disabled={!isEdicao && questoes.length < 20}
              className="w-full lg:w-auto px-6 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#164863] transition-colors"
            >
              {isEdicao ? "Salvar Alterações" : "Criar Simulado"}
            </button>
          </div>
          <div className="w-full lg:w-80 flex flex-col gap-6 order-1 lg:order-2">
            <section className="border rounded-lg p-4 bg-gray-50/50">
              <h2 className="font-semibold mb-3">Disciplina</h2>
              <select
                value={disciplinaSelecionada}
                onChange={(e) => setDisciplinaSelecionada(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map((d) => (
                  <option key={d.id_disciplina} value={d.id_disciplina}>
                    {d.nome_disciplina}
                  </option>
                ))}
              </select>
            </section>

            <section className="border rounded-lg p-4 bg-gray-50/50">
              <h2 className="font-semibold mb-3">Atribuir à turma</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {turmas.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 p-2 hover:bg-white rounded-md transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#1D5D7F]"
                      checked={turmasSelecionadas.includes(t.id)}
                      onChange={(e) => {
                        setTurmasSelecionadas((prev) =>
                          e.target.checked
                            ? [...prev, t.id]
                            : prev.filter((id) => id !== t.id),
                        );
                      }}
                    />
                    <span className="text-sm">{t.nome_turma}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </form>

        {modalAberto && disciplinaSelecionada && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl">
              <ModalCriarQuestaoSimulado
                disciplinaId={disciplinaSelecionada}
                onClose={() => setModalAberto(false)}
                onAdicionarQuestao={handleCriarQuestao}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormSimulado;

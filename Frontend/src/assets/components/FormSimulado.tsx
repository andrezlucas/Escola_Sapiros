import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import { toast } from "react-toastify";

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface QuestaoSimulado {
  id: string;
  enunciado: string;
  area: string;
}

interface FormSimuladoData {
  titulo: string;
  tempoProva: number;
}

function FormSimulado() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [questoes, setQuestoes] = useState<QuestaoSimulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCriarQuestao, setModalCriarQuestao] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
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
    async function fetchDados() {
      try {
        const [discRes, turmaRes] = await Promise.all([
          authFetch("http://localhost:3000/professores/disciplinas"),
          authFetch("http://localhost:3000/professores/turmas"),
        ]);

        setDisciplinas(await discRes.json());
        setTurmas(await turmaRes.json());

        setQuestoes([
          {
            id: "1",
            enunciado:
              "Qual figura de linguagem está presente na frase 'Chovia uma tristeza de resignação'?",
            area: "Linguagens, Códigos e suas Tecnologias",
          },
        ]);
      } catch {
        toast.error("Erro ao carregar dados do simulado");
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, []);

  function onSubmit(data: FormSimuladoData) {
    const payload = {
      ...data,
      questoesIds: questoes.map((q) => q.id),
    };

    console.log("SIMULADO PAYLOAD:", payload);
    toast.success("Simulado pronto para integração com o backend 🚀");
  }

  return (
    <div className="w-full mx-auto">
      <div className="border rounded-xl p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Criar Simulado</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
          <div className="flex-1 flex flex-col gap-6">
            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-4">Informações Básicas</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Título do Simulado"
                  placeholder="Ex: Simulado Trimestral"
                  {...register("titulo", {
                    required: "Título obrigatório",
                  })}
                  error={errors.titulo?.message}
                />

                <Input
                  label="Tempo de Prova (minutos)"
                  type="number"
                  placeholder="Ex: 60"
                  {...register("tempoProva", {
                    required: "Informe o tempo",
                    min: 1,
                  })}
                  error={errors.tempoProva?.message}
                />
              </div>
            </section>

            <section className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">Questões do Simulado</h2>
                <button
                  type="button"
                  className="text-sm text-[#1D5D7F]-600 hover:underline"
                >
                  + Adicionar Questão
                </button>
              </div>

              <div className="space-y-3">
                {questoes.map((q, index) => (
                  <div
                    key={q.id}
                    className="border rounded-lg p-3 flex justify-between"
                  >
                    <div>
                      <strong>
                        Questão {index + 1}: {q.area}
                      </strong>
                      <p className="text-sm text-gray-600 mt-1">
                        {q.enunciado}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button className="text-blue-600">Editar</button>
                      <button className="text-red-500">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              className="self-start px-6 py-2 bg-[#1D5D7F] text-white rounded-lg font-medium"
            >
              Salvar Simulado
            </button>
          </div>

          <div className="w-80 flex flex-col gap-6">
            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Áreas de Conhecimento</h2>

              {disciplinas.map((d) => (
                <label
                  key={d.id_disciplina}
                  className="flex items-center gap-2"
                >
                  <input type="checkbox" />
                  <span className="text-sm">{d.nome_disciplina}</span>
                </label>
              ))}
            </section>

            <section className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Atribuir à turma</h2>

              {turmas.map((t) => (
                <label key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">{t.nome_turma}</span>
                </label>
              ))}
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormSimulado;

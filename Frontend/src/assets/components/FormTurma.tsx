import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "./Input";
import FormSelect from "./FormSelect";

export interface Professor {
  nome: string;
  id: string;
  usuario: {
    nome: string;
  };
}

export interface Aluno {
  nome: string;
  id: string;
  usuario: { nome: string };
}

export interface Disciplina {
  id_disciplina: string;
  nome: string;
}

export type TurmaFormData = {
  nome_turma: string;
  anoLetivo: string;
  turno: "MANHÃ" | "TARDE" | "NOITE";
  data_inicio?: string;
  data_fim?: string;
  professorId?: string;
  alunosIds?: string[];
  disciplinasIds?: string[];
  descricao?: string;
  ativa?: boolean;
  capacidade_maxima?: number;
};

interface FormTurmaProps {
  onSubmit: (data: TurmaFormData) => void | Promise<void>;
  professores: Professor[];
  alunos: Aluno[];
  disciplinas?: Disciplina[];
  valoresIniciais?: Partial<TurmaFormData>;
}

export default function FormTurma({
  onSubmit,
  professores,
  alunos,
  disciplinas = [],
  valoresIniciais,
}: FormTurmaProps) {
  const { register, handleSubmit, reset, watch } = useForm<TurmaFormData>({
    defaultValues: {
      nome_turma: "",
      anoLetivo: "",
      turno: "MANHÃ",
      data_inicio: "",
      data_fim: "",
      professorId: "",
      alunosIds: [],
      disciplinasIds: [],
      ativa: true,
      capacidade_maxima: 30,
    },
  });

  const [buscaAluno, setBuscaAluno] = useState("");
  const [buscaDisciplina, setBuscaDisciplina] = useState("");

  useEffect(() => {
    if (valoresIniciais) {
      reset({
        ...valoresIniciais,
        anoLetivo: String(valoresIniciais.anoLetivo ?? ""),
        turno: valoresIniciais.turno ?? "MANHÃ",
        capacidade_maxima: valoresIniciais.capacidade_maxima ?? 30,
        ativa: valoresIniciais.ativa ?? true,
        alunosIds: valoresIniciais.alunosIds ?? [],
        disciplinasIds: valoresIniciais.disciplinasIds ?? [],
      });
    }
  }, [valoresIniciais, reset]);

  const alunosFiltrados = useMemo(
    () =>
      alunos.filter((a) =>
        a.usuario.nome.toLowerCase().includes(buscaAluno.toLowerCase())
      ),
    [buscaAluno, alunos]
  );

  const disciplinasFiltradas = useMemo(
    () =>
      disciplinas.filter((d) =>
        d.nome.toLowerCase().includes(buscaDisciplina.toLowerCase())
      ),
    [buscaDisciplina, disciplinas]
  );

  const handleFormSubmit = (data: TurmaFormData) => {
    onSubmit({
      ...data,
      anoLetivo: String(data.anoLetivo).trim(),
      turno: data.turno ?? "MANHÃ",
      capacidade_maxima: Number(data.capacidade_maxima),
      ativa: !!data.ativa,
      alunosIds: data.alunosIds || [],
      disciplinasIds: data.disciplinasIds || [],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label={""}
        {...register("nome_turma", { required: true })}
        placeholder="Nome da turma"
      />

      <Input
        label={""}
        {...register("anoLetivo", {
          required: true,
          pattern: { value: /^\d{4}$/, message: "Ano letivo inválido" },
        })}
        placeholder="Ano letivo (YYYY)"
      />

      <FormSelect
        name="turno"
        label="Período"
        options={[
          { value: "MANHÃ", label: "Manhã" },
          { value: "TARDE", label: "Tarde" },
          { value: "NOITE", label: "Noite" },
        ]}
        rules={{ required: true }}
      />

      <div className="flex gap-2">
        <Input label="Data Início" type="date" {...register("data_inicio")} />
        <Input label="Data Fim" type="date" {...register("data_fim")} />
      </div>

      <Input
        label="Capacidade máxima"
        type="number"
        {...register("capacidade_maxima", { min: 1, max: 30 })}
      />

      <select
        {...register("professorId")}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Sem professor</option>
        {professores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.usuario?.nome ?? p.nome ?? "Sem nome"}
          </option>
        ))}
      </select>

      <div>
        <input
          type="text"
          placeholder="Buscar aluno"
          value={buscaAluno}
          onChange={(e) => setBuscaAluno(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-2"
        />
        <select
          {...register("alunosIds")}
          multiple
          className="w-full border rounded px-3 py-2 h-40"
        >
          {alunosFiltrados.map((a) => (
            <option key={a.id} value={a.id}>
              {a.usuario?.nome ?? a.nome ?? "Sem nome"}
            </option>
          ))}
        </select>
      </div>

      {disciplinas.length > 0 && (
        <div>
          <input
            type="text"
            placeholder="Buscar disciplina"
            value={buscaDisciplina}
            onChange={(e) => setBuscaDisciplina(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <select
            {...register("disciplinasIds")}
            multiple
            className="w-full border rounded px-3 py-2 h-40"
          >
            {disciplinasFiltradas.map((d) => (
              <option key={d.id_disciplina} value={d.id_disciplina}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      <textarea
        {...register("descricao")}
        placeholder="Descrição"
        className="w-full border rounded px-3 py-2"
      />

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register("ativa")} />
        Turma ativa
      </label>

      <button
        type="submit"
        className="w-full bg-[#1D5D7F] text-white py-2 rounded-lg"
      >
        Salvar
      </button>
    </form>
  );
}

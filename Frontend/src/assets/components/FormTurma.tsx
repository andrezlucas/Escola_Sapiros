import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "./Input";
import FormSelect from "./FormSelect";

export interface Professor {
  id: string;
  nome?: string;
  usuario?: { nome: string };
}

export interface Aluno {
  id: string;
  nome?: string;
  usuario?: { nome: string };
}

export interface Disciplina {
  id_disciplina: string;
  nome: string;
}

export type TurmaFormData = {
  nome_turma: string;
  anoLetivo: string;
  turno: "MANHÃ" | "TARDE" | "NOITE";
  professorId?: string | null;
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
}

export default function FormTurma({
  onSubmit,
  professores,
  alunos,
  disciplinas = [],
}: FormTurmaProps) {
  const { register, handleSubmit, setValue, watch } =
    useFormContext<TurmaFormData>();

  const [buscaAluno, setBuscaAluno] = useState("");
  const [buscaDisciplina, setBuscaDisciplina] = useState("");

  const alunosIds = watch("alunosIds") ?? [];
  const professorId = watch("professorId");

  const alunosFiltrados = useMemo(
    () =>
      alunos.filter((a) =>
        (a.usuario?.nome ?? a.nome ?? "")
          .toLowerCase()
          .includes(buscaAluno.toLowerCase())
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

  function handleFormSubmit(data: TurmaFormData) {
    onSubmit({
      ...data,
      capacidade_maxima: Number(data.capacidade_maxima),
      professorId: data.professorId,
      alunosIds: data.alunosIds ?? [],
      disciplinasIds: data.disciplinasIds ?? [],
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label={""}
        placeholder="Nome da turma"
        {...register("nome_turma", { required: true })}
      />

      <Input
        label={""}
        placeholder="Ano letivo (YYYY)"
        {...register("anoLetivo", {
          required: true,
          pattern: /^\d{4}$/,
        })}
      />

      <FormSelect
        name="turno"
        label="Período"
        options={[
          { value: "MANHÃ", label: "Manhã" },
          { value: "TARDE", label: "Tarde" },
          { value: "NOITE", label: "Noite" },
        ]}
      />

      <Input
        label={""}
        type="number"
        placeholder="Capacidade máxima"
        {...register("capacidade_maxima", {
          valueAsNumber: true,
          min: 1,
        })}
      />

      <select
        value={professorId ?? ""}
        onChange={(e) =>
          setValue("professorId", e.target.value || undefined, {
            shouldDirty: true,
          })
        }
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Sem professor</option>
        {professores.map((p) => (
          <option key={p.id} value={p.id}>
            {p.usuario?.nome ?? p.nome ?? "Sem nome"}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Buscar aluno"
        value={buscaAluno}
        onChange={(e) => setBuscaAluno(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />

      <select
        multiple
        value={alunosIds}
        onChange={(e) =>
          setValue(
            "alunosIds",
            Array.from(e.target.selectedOptions).map((o) => o.value),
            { shouldDirty: true }
          )
        }
        className="w-full border rounded px-3 py-2 h-40"
      >
        {alunosFiltrados.map((a) => (
          <option key={a.id} value={a.id}>
            {a.usuario?.nome ?? a.nome ?? "Sem nome"}
          </option>
        ))}
      </select>

      {disciplinas.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Buscar disciplina"
            value={buscaDisciplina}
            onChange={(e) => setBuscaDisciplina(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <select
            multiple
            {...register("disciplinasIds")}
            className="w-full border rounded px-3 py-2 h-40"
          >
            {disciplinasFiltradas.map((d) => (
              <option key={d.id_disciplina} value={d.id_disciplina}>
                {d.nome}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-[#1D5D7F] text-white py-2 rounded-lg"
      >
        Salvar
      </button>
    </form>
  );
}

import { useFormContext } from "react-hook-form";
import { Input } from "./Input";
import FormSelect from "./FormSelect";
import { useEffect, useState } from "react";

type TurnoType = "MANHÃ" | "TARDE" | "NOITE" ;

export interface TurmaFormData {
  nome_turma: string;
  anoLetivo: string;
  turno: TurnoType;
  capacidade_maxima: number;
  ativa?: boolean;
  professorId?: string;
  alunosIds?: string[];
}

interface Professor {
  id: string;
  nome: string;
  usuario: {
    nome: string;
  };
}

interface Aluno {
  id: string;
  usuario: {
    nome: string;
  };
}

interface FormTurmaProps {
  onSubmit: (data: TurmaFormData) => void;
  professores?: Professor[];
  alunos?: Aluno[];
  isEditMode?: boolean;
}

export default function FormTurma({
  onSubmit,
  professores = [],
  alunos = [],
  isEditMode = false,
}: FormTurmaProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<TurmaFormData>();

  const alunosSelecionados = watch("alunosIds") || [];
  const capacidadeMaxima = watch("capacidade_maxima") || 0;

  const formatAnoLetivo = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label={"Nome da Turma:"}
            type="text"
            {...register("nome_turma", {
              required: "Nome da turma é obrigatório",
              minLength: {
                value: 3,
                message: "Nome deve ter pelo menos 3 caracteres",
              },
            })}
            error={errors?.nome_turma?.message}
          />
        </div>

        <div>
          <Input
            label={"Ano Letivo:"}
            type="text"
            {...register("anoLetivo", {
              required: "Ano letivo é obrigatório",
              pattern: {
                value: /^\d{4}$/,
                message: "Ano letivo deve estar no formato YYYY",
              },
              validate: (value) => {
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                return (
                  (year >= 2000 && year <= currentYear + 5) ||
                  `Ano deve estar entre 2000 e ${currentYear + 5}`
                );
              },
              onChange: (e) => {
                e.target.value = formatAnoLetivo(e.target.value);
              },
            })}
            maxLength={4}
            error={errors?.anoLetivo?.message}
          />
        </div>

        <div>
          <FormSelect
            label="Turno:"
            name="turno"
            options={[
              { value: "MANHÃ", label: "Manhã" },
              { value: "TARDE", label: "Tarde" },
              { value: "NOITE", label: "Noite" },
            ]}
            rules={{ required: "Turno é obrigatório" }}
          />
        </div>

        <div>
          <Input
            label={"Capacidade Máxima:"}
            type="number"
            {...register("capacidade_maxima", {
              required: "Capacidade máxima é obrigatória",
              min: {
                value: 1,
                message: "Capacidade mínima é 1",
              },
              max: {
                value: 30,
                message: "Capacidade máxima é 30",
              },
              valueAsNumber: true,
              onChange: (e) => {
                const value = parseInt(e.target.value);
                if (value > 30) e.target.value = "30";
                if (value < 1) e.target.value = "1";

                const currentAlunos = alunosSelecionados.length;
                if (currentAlunos > value) {
                  const novosAlunos = alunosSelecionados.slice(0, value);
                  setValue("alunosIds", novosAlunos);
                }
              },
            })}
            error={errors?.capacidade_maxima?.message}
          />
        </div>

        {isEditMode && professores.length > 0 && (
          <div className="md:col-span-2">
            <FormSelect
              label="Professor Responsável:"
              name="professorId"
              options={[
                { value: "", label: "Nenhum professor" },
                ...professores.map((prof) => ({
                  value: prof.id,
                  label:
                    prof.usuario?.nome ||
                    prof.nome ||
                    `Professor ${prof.id.substring(0, 8)}`,
                })),
              ]}
            />
          </div>
        )}

        {isEditMode && alunos.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alunos Matriculados ({alunosSelecionados.length}/
              {capacidadeMaxima})
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {alunos.map((aluno) => {
                const isSelected = alunosSelecionados.includes(aluno.id);
                const isDisabled =
                  !isSelected && alunosSelecionados.length >= capacidadeMaxima;

                return (
                  <div key={aluno.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`aluno-${aluno.id}`}
                      value={aluno.id}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const currentIds = [...alunosSelecionados];
                        if (e.target.checked) {
                          if (currentIds.length < capacidadeMaxima) {
                            currentIds.push(aluno.id);
                          }
                        } else {
                          const index = currentIds.indexOf(aluno.id);
                          if (index > -1) {
                            currentIds.splice(index, 1);
                          }
                        }
                        setValue("alunosIds", currentIds, {
                          shouldValidate: true,
                        });
                      }}
                      className="h-4 w-4 text-[#1D5D7F] border-gray-300 rounded focus:ring-[#1D5D7F]"
                    />
                    <label
                      htmlFor={`aluno-${aluno.id}`}
                      className={`ml-2 text-sm ${
                        isDisabled ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {aluno.usuario?.nome ||
                        `Aluno ${aluno.id.substring(0, 8)}`}
                      {isDisabled &&
                        !isSelected &&
                        " (capacidade máxima atingida)"}
                    </label>
                  </div>
                );
              })}
            </div>
            {errors?.alunosIds && (
              <span className="text-red-500 text-sm mt-1">
                {errors.alunosIds.message}
              </span>
            )}
          </div>
        )}

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativa"
              {...register("ativa")}
              className="h-4 w-4 text-[#1D5D7F] border-gray-300 rounded focus:ring-[#1D5D7F]"
              defaultChecked={true}
            />
            <label htmlFor="ativa" className="ml-2 text-sm text-gray-700">
              Turma Ativa
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

import { useFormContext } from "react-hook-form";
import ValidarCpf from "../utils/ValidarCpf";
import ValidarEmail from "../utils/ValidarEmail";
import { Input } from "./Input";
import FormSelect from "./FormSelect";
import EstadoSelect from "./EstadosSelect";
import CidadeSelect from "./CidadeSelect";
import { BuscarCep } from "../utils/BuscarCep";
import { maskCep } from "../utils/MaskCep";
import { useState } from "react";

type SexoType = "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO";
type RoleType = "aluno" | "professor" | "coordenacao";

export interface ProfessorFormData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  sexo: SexoType;
  dataNascimento: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoCep: string;
  enderecoComplemento: string;
  enderecoBairro: string;
  enderecoEstado: string;
  enderecoCidade: string;
  formacoes: {
    curso: string;
    instituicao: string;
    dataInicio: string;
    dataConclusao?: string;
    nivel: string;
  }[];
  role?: RoleType;
}

interface FormProfessorProps {
  onSubmit: (data: ProfessorFormData) => void;
}

export default function FormProfessor({ onSubmit }: FormProfessorProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useFormContext<ProfessorFormData>();

  const [segundaFormacao, setSegundaFormacao] = useState(false);

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");

  const formatTelefone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome completo:"
          {...register("nome", { required: "Nome é obrigatório" })}
          error={errors?.nome?.message}
        />

        <Input
          label="CPF:"
          {...register("cpf", {
            required: "CPF é obrigatório",
            validate: ValidarCpf,
            onChange: (e) => (e.target.value = formatCPF(e.target.value)),
          })}
          maxLength={14}
        />

        <Input
          label="Email:"
          type="email"
          {...register("email", {
            required: "Email é obrigatório",
            validate: ValidarEmail,
          })}
        />

        <Input
          label="Telefone:"
          {...register("telefone", {
            required: "Telefone é obrigatório",
            validate: (v) =>
              v.replace(/\D/g, "").length === 11 ||
              "Telefone deve conter DDD + número",
            onChange: (e) => (e.target.value = formatTelefone(e.target.value)),
          })}
          maxLength={15}
        />

        <FormSelect
          label="Sexo:"
          name="sexo"
          options={[
            { value: "MASCULINO", label: "Masculino" },
            { value: "FEMININO", label: "Feminino" },
          ]}
        />

        <Input
          label="Data de Nascimento:"
          type="date"
          {...register("dataNascimento", {
            required: "Data de nascimento é obrigatória",
          })}
        />

        <div className="md:col-span-2 text-[#1D5D7F]">
          <h3 className="text-lg font-semibold mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={"Logadouro:"}
                type="text"
                {...register("enderecoLogradouro", {
                  required: "Logadouro obrigatório",
                })}
                error={errors?.enderecoLogradouro?.message}
              />
            </div>

            <div>
              <Input
                label={"Número"}
                type="text"
                {...register("enderecoNumero", {
                  required: "Número obrigatório",
                })}
                error={errors?.enderecoNumero?.message}
              />
            </div>

            <div>
              <Input
                label={"CEP:"}
                type="text"
                {...register("enderecoCep", {
                  required: "CEP obrigatório",
                  onChange: async (e) => {
                    const value = maskCep(e.target.value);
                    e.target.value = value;

                    if (value.replace(/\D/g, "").length === 8) {
                      const d = await BuscarCep(value);
                      if (d) {
                        setValue("enderecoLogradouro", d.logradouro || "");
                        setValue("enderecoBairro", d.bairro || "");
                        setValue("enderecoCidade", d.cidade || "");
                        setValue("enderecoEstado", d.estado || "");
                      }
                    }
                  },
                })}
                error={errors?.enderecoCep?.message}
              />
            </div>

            <div>
              <Input
                label={"Complemento:"}
                type="text"
                {...register("enderecoComplemento", {
                  required: "Complemento obrigatório",
                })}
                error={errors?.enderecoComplemento?.message}
              />
            </div>

            <div>
              <Input
                label={"Bairro:"}
                type="text"
                {...register("enderecoBairro", {
                  required: "Bairro obrigatório",
                })}
                error={errors?.enderecoBairro?.message}
              />
            </div>

            <div>
              <CidadeSelect />
            </div>

            <div>
              <EstadoSelect control={control} />
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-[#1D5D7F]">
            Formação Acadêmica
          </h3>

          <Input
            label="Curso:"
            {...register("formacoes.0.curso", {
              required: "Curso obrigatório",
            })}
          />

          <Input
            label="Instituição:"
            {...register("formacoes.0.instituicao", {
              required: "Instituição obrigatória",
            })}
          />

          <Input
            label="Data de Início:"
            type="date"
            {...register("formacoes.0.dataInicio", {
              required: "Data obrigatória",
            })}
          />

          <Input
            label="Data de Conclusão:"
            type="date"
            {...register("formacoes.0.dataConclusao", {
              setValueAs: (v: string) => (v === "" ? undefined : v),
              validate: (v) => {
                if (!v) return true;
                return (
                  new Date(v) >= new Date(watch("formacoes.0.dataInicio")) ||
                  "Data inválida"
                );
              },
            })}
          />

          <FormSelect
            label="Nível:"
            name="formacoes.0.nivel"
            options={[
              { value: "GRADUACAO", label: "Graduação" },
              { value: "POS_GRADUACAO", label: "Pós-graduação" },
              { value: "MESTRADO", label: "Mestrado" },
              { value: "DOUTORADO", label: "Doutorado" },
            ]}
          />

          <button
            type="button"
            onClick={() => setSegundaFormacao(true)}
            className="text-sm text-blue-600 underline"
          >
            + Adicionar outra titularidade
          </button>

          {segundaFormacao && (
            <>
              <h4 className="text-lg font-semibold text-[#1D5D7F] mt-4">
                Segunda Titularidade
              </h4>

              <Input label="Curso:" {...register("formacoes.1.curso")} />
              <Input
                label="Instituição:"
                {...register("formacoes.1.instituicao")}
              />

              <Input
                label="Data de Início:"
                type="date"
                {...register("formacoes.1.dataInicio")}
              />

              <Input
                label="Data de Conclusão:"
                type="date"
                {...register("formacoes.1.dataConclusao", {
                  setValueAs: (v: string) => (v === "" ? undefined : v),
                })}
              />

              <FormSelect
                label="Nível:"
                name="formacoes.1.nivel"
                options={[
                  { value: "GRADUACAO", label: "Graduação" },
                  { value: "POS_GRADUACAO", label: "Pós-graduação" },
                  { value: "MESTRADO", label: "Mestrado" },
                  { value: "DOUTORADO", label: "Doutorado" },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </form>
  );
}

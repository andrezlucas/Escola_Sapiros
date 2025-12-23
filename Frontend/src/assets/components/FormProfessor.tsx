import { useFormContext } from "react-hook-form";
import ValidarCpf from "../utils/ValidarCpf";
import ValidarEmail from "../utils/ValidarEmail";
import { Input } from "./Input";
import FormSelect from "./FormSelect";
import EstadoSelect from "./EstadosSelect";
import CidadeSelect from "./CidadeSelect";
import { BuscarCep } from "../utils/BuscarCep";
import { maskCep } from "../utils/MaskCep";

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
  cursoGraduacao: string;
  instituicao: string;
  dataInicioGraduacao: string;
  dataConclusaoGraduacao?: string;
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

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label={"Nome completo:"}
            type="text"
            {...register("nome", { required: "Nome é obrigatório" })}
          />
          {errors.nome && (
            <span className="text-red-500 text-sm">{errors.nome.message}</span>
          )}
        </div>

        <div>
          <Input
            label={"CPF:"}
            type="text"
            {...register("cpf", {
              required: "CPF é obrigatório",
              validate: ValidarCpf,
              onChange: (e) => {
                e.target.value = formatCPF(e.target.value);
              },
            })}
            maxLength={14}
          />
          {errors.cpf && (
            <span className="text-red-500 text-sm">{errors.cpf.message}</span>
          )}
        </div>

        <div>
          <Input
            label={"Email:"}
            type="email"
            {...register("email", {
              required: "Email é obrigatório",
              validate: ValidarEmail,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email inválido",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div>
          <Input
            label={"Telefone:"}
            type="text"
            {...register("telefone", {
              required: "Telefone é obrigatório",
              validate: (value) =>
                value.replace(/\D/g, "").length === 11 ||
                "Telefone deve conter DDD + número",
              onChange: (e) => {
                e.target.value = formatTelefone(e.target.value);
              },
            })}
            maxLength={15}
          />
          {errors.telefone && (
            <span className="text-red-500 text-sm">
              {errors.telefone.message}
            </span>
          )}
        </div>

        <div>
          <FormSelect
            label="Sexo:"
            name="sexo"
            options={[
              { value: "MASCULINO", label: "Masculino" },
              { value: "FEMININO", label: "Feminino" },
            ]}
          />
        </div>

        <div>
          <Input
            label="Data de Nascimento:"
            type="date"
            {...register("dataNascimento", {
              required: "Data de nascimento é obrigatória",
              validate: (value) => {
                if (!value) return "Data de nascimento é obrigatória";

                const nascimento = new Date(value + "T12:00:00");
                const hoje = new Date();

                let idade = hoje.getFullYear() - nascimento.getFullYear();
                const m = hoje.getMonth() - nascimento.getMonth();

                if (
                  m < 0 ||
                  (m === 0 && hoje.getDate() < nascimento.getDate())
                ) {
                  idade--;
                }

                return idade >= 18 || "Professor deve ter no mínimo 18 anos";
              },
            })}
          />
          {errors.dataNascimento && (
            <span className="text-red-500 text-sm">
              {errors.dataNascimento.message}
            </span>
          )}
        </div>

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
          <h3 className="text-lg font-semibold mb-2  text-[#1D5D7F]">
            Formação Acadêmica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={"Curso de Graduação:"}
                type="text"
                {...register("cursoGraduacao", {
                  required: "Curso de graduação é obrigatório",
                })}
              />
              {errors.cursoGraduacao && (
                <span className="text-red-500 text-sm">
                  {errors.cursoGraduacao.message}
                </span>
              )}
            </div>

            <div>
              <Input
                label={"Instituição:"}
                type="text"
                {...register("instituicao", {
                  required: "Instituição é obrigatória",
                })}
              />
              {errors.instituicao && (
                <span className="text-red-500 text-sm">
                  {errors.instituicao.message}
                </span>
              )}
            </div>

            <div>
              <Input
                label={"Data de Início da Graduação:"}
                type="date"
                {...register("dataInicioGraduacao", {
                  required: "Data de início é obrigatória",
                })}
              />
              {errors.dataInicioGraduacao && (
                <span className="text-red-500 text-sm">
                  {errors.dataInicioGraduacao.message}
                </span>
              )}
            </div>

            <div>
              <Input
                label={"Data de Conclusão da Graduação:"}
                type="date"
                {...register("dataConclusaoGraduacao", {
                  validate: (value) =>
                    !value ||
                    new Date(value) >= new Date(watch("dataInicioGraduacao")) ||
                    "Data de conclusão não pode ser anterior ao início",
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

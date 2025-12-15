import { useFormContext } from "react-hook-form";

// Valores conforme o backend espera
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
  role?: RoleType; // Adicione se necessário
}

interface FormProfessorProps {
  onSubmit: (data: ProfessorFormData) => void;
}

export default function FormProfessor({ onSubmit }: FormProfessorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dados Pessoais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            {...register("nome", { required: "Nome é obrigatório" })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.nome && (
            <span className="text-red-500 text-sm">{errors.nome.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            type="text"
            {...register("cpf", {
              required: "CPF é obrigatório",
              onChange: (e) => {
                e.target.value = formatCPF(e.target.value);
              },
            })}
            className="w-full p-2 border rounded-lg"
            maxLength={14}
          />
          {errors.cpf && (
            <span className="text-red-500 text-sm">{errors.cpf.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email é obrigatório",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email inválido",
              },
            })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <input
            type="text"
            {...register("telefone", {
              required: "Telefone é obrigatório",
              onChange: (e) => {
                e.target.value = formatTelefone(e.target.value);
              },
            })}
            className="w-full p-2 border rounded-lg"
            maxLength={15}
          />
          {errors.telefone && (
            <span className="text-red-500 text-sm">
              {errors.telefone.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo *
          </label>
          <select
            {...register("sexo", { required: "Sexo é obrigatório" })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Selecione</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="OUTRO">Outro</option>
            <option value="NAO_INFORMADO">Não Informado</option>
          </select>
          {errors.sexo && (
            <span className="text-red-500 text-sm">{errors.sexo.message}</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento *
          </label>
          <input
            type="date"
            {...register("dataNascimento", {
              required: "Data de nascimento é obrigatória",
            })}
            className="w-full p-2 border rounded-lg"
          />
          {errors.dataNascimento && (
            <span className="text-red-500 text-sm">
              {errors.dataNascimento.message}
            </span>
          )}
        </div>

        {/* Endereço */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logradouro
              </label>
              <input
                type="text"
                {...register("enderecoLogradouro")}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <input
                type="text"
                {...register("enderecoNumero")}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                {...register("enderecoCep", {
                  onChange: (e) => {
                    e.target.value = formatCEP(e.target.value);
                  },
                })}
                className="w-full p-2 border rounded-lg"
                maxLength={9}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                {...register("enderecoComplemento")}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro
              </label>
              <input
                type="text"
                {...register("enderecoBairro")}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                {...register("enderecoCidade")}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                {...register("enderecoEstado")}
                className="w-full p-2 border rounded-lg"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        {/* Formação Acadêmica */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Formação Acadêmica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso de Graduação *
              </label>
              <input
                type="text"
                {...register("cursoGraduacao", {
                  required: "Curso de graduação é obrigatório",
                })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.cursoGraduacao && (
                <span className="text-red-500 text-sm">
                  {errors.cursoGraduacao.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instituição *
              </label>
              <input
                type="text"
                {...register("instituicao", {
                  required: "Instituição é obrigatória",
                })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.instituicao && (
                <span className="text-red-500 text-sm">
                  {errors.instituicao.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Início da Graduação *
              </label>
              <input
                type="date"
                {...register("dataInicioGraduacao", {
                  required: "Data de início é obrigatória",
                })}
                className="w-full p-2 border rounded-lg"
              />
              {errors.dataInicioGraduacao && (
                <span className="text-red-500 text-sm">
                  {errors.dataInicioGraduacao.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Conclusão da Graduação
              </label>
              <input
                type="date"
                {...register("dataConclusaoGraduacao")}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

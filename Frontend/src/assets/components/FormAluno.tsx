import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import FormTextoMatricula from "./FormTextoMatricula";
import { Input } from "./Input";
import CardTituloMatricula from "./CardTituloMatricula";
import { FormRowMatricula } from "./FormRowMatricula";
import { MaskRG } from "../utils/MaskRg";
import ValidarCpf from "../utils/ValidarCpf";
import { MaskCPF } from "../utils/MaskCPF";
import { ValidarTelefone } from "../utils/ValidarTelefone";
import { MaskTelefone } from "../utils/MaskTelefone";
import ValidarEmail from "../utils/ValidarEmail";
import { BuscarCep } from "../utils/BuscarCep";
import { maskCep } from "../utils/MaskCep";
import NaturalidadeSelect from "./NaturalidadeSelect";
import EstadoSelect from "./EstadosSelect";
import CidadeSelect from "./CidadeSelect";
import NacionalidadeSelect from "./NacionalidadeSelect";
import FormSelect from "./FormSelect";

type DadosAluno = {
  nome: string;
  data_nascimento: string;
  sexo: string;
  rg: string;
  data_emissao: string;
  orgao_emissor: string;
  cpf: string;
  celular: string;
  email: string;
  logradouro: string;
  numero: string;
  cep: string;
  complemento?: string;
  bairro: string;
  estado: string;
  cidade: string;
  nacionalidade: string;
  naturalidade: string;
  serie: string;
  turno: string;
  escola_origem?: string;
  necessidades_especiais?: string;
  tem_alergia?: string;
  quais_alergias?: string;
  saida_sozinho?: string;
  uso_imagem?: string;
};

export default function FormAluno({
  onNext,
  defaultValues,
}: {
  onNext: (data: DadosAluno) => void;
  defaultValues?: Partial<DadosAluno>;
}) {
  const methods = useForm<DadosAluno>({
    defaultValues: {
      nome: "",
      data_nascimento: "",
      sexo: "",
      rg: "",
      data_emissao: "",
      orgao_emissor: "",
      cpf: "",
      celular: "",
      email: "",
      logradouro: "",
      numero: "",
      cep: "",
      complemento: "",
      bairro: "",
      estado: "",
      cidade: "",
      nacionalidade: "",
      naturalidade: "",
      serie: "",
      turno: "",
      escola_origem: "",
      necessidades_especiais: "",
      tem_alergia: "",
      quais_alergias: "",
      saida_sozinho: "",
      uso_imagem: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = methods;

  const onSubmit = (data: DadosAluno) => {
    onNext(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <CardTituloMatricula>Dados pessoais do(a) aluno(a)</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Nome completo:" className="w-full">
            <Input
              placeholder=""
              label=""
              type="text"
              {...register("nome", {
                required: "Nome completo é obrigatório",
                minLength: {
                  value: 3,
                  message: "O nome deve ter pelo menos 3 caracteres",
                },
                pattern: {
                  value: /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/,
                  message: "O nome não pode conter números",
                },
              })}
              error={errors?.nome?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Data de nascimento:" className="w-1/2">
            <Input
              label=""
              type="date"
              {...register("data_nascimento", {
                required: "A data de nascimento é obrigatória",
                validate: {
                  formato: (v) =>
                    !v || isNaN(new Date(String(v)).getTime())
                      ? "Data inválida"
                      : true,
                },
              })}
              error={errors?.data_nascimento?.message}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Sexo:" className="w-1/2">
            <FormSelect
              name="sexo"
              options={[
                { value: "MASCULINO", label: "Masculino" },
                { value: "FEMININO", label: "Feminino" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="RG:" className="w-1/2">
            <Input
              label=""
              type="text"
              {...register("rg", {
                required: "O RG é obrigatório",
                onChange: (e) => setValue("rg", MaskRG(e.target.value)),
              })}
              error={errors?.rg?.message}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Data de emissão:" className="w-1/3">
            <Input
              label=""
              type="date"
              {...register("data_emissao", {
                required: "A data de emissão é obrigatória",
                validate: (v) =>
                  !v || isNaN(new Date(String(v)).getTime())
                    ? "Data inválida"
                    : true,
              })}
              error={errors?.data_emissao?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Órgão emissor:" className="w-1/3">
            <Input
              label=""
              {...register("orgao_emissor", {
                required: "Órgão emissor é obrigatório",
              })}
              error={errors?.orgao_emissor?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="CPF:" className="w-1/3">
            <Input
              label=""
              {...register("cpf", {
                required: "CPF é obrigatório",
                validate: (v) => ValidarCpf(v) || "CPF inválido",
                onChange: (e) => (e.target.value = MaskCPF(e.target.value)),
              })}
              error={errors?.cpf?.message}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Celular:" className="w-1/2">
            <Input
              label=""
              {...register("celular", {
                required: "Celular é obrigatório",
                onChange: (e) =>
                  (e.target.value = MaskTelefone(e.target.value)),
              })}
              error={errors?.celular?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="E-mail:" className="w-full">
            <Input
              label=""
              {...register("email", {
                required: "E-mail é obrigatório",
                validate: (v) => ValidarEmail(v) || "Email inválido",
              })}
              error={errors?.email?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Nacionalidade:" className="w-1/2">
            <NacionalidadeSelect />
          </FormTextoMatricula>

          <FormTextoMatricula title="Naturalidade:" className="w-1/2">
            <NaturalidadeSelect />
          </FormTextoMatricula>
        </FormRowMatricula>

        <CardTituloMatricula>Endereço do(a) aluno(a)</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Logradouro:" className="w-1/2">
            <Input label="" {...register("logradouro")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Número:" className="w-1/2">
            <Input label="" {...register("numero")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="CEP:" className="w-1/2">
            <Controller
              name="cep"
              control={control}
              rules={{ required: "CEP obrigatório" }}
              render={({ field }) => (
                <Input
                label={""} {...field}
                onChange={async (e) => {
                  const value = maskCep(e.target.value);
                  field.onChange(value);

                  if (value.replace(/\D/g, "").length === 8) {
                    const d = await BuscarCep(value);
                    if (d) {
                      setValue("logradouro", d.logradouro ?? "");
                      setValue("bairro", d.bairro ?? "");
                      setValue("cidade", d.cidade ?? "");
                      setValue("estado", d.estado ?? "");
                    }
                  }
                } }
                error={errors?.cep?.message}                />
              )}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Complemento:" className="w-1/2">
            <Input label="" {...register("complemento")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Bairro:" className="w-1/2">
            <Input label="" {...register("bairro")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Estado:" className="w-1/2">
            <EstadoSelect control={control} />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Cidade:" className="w-1/1">
            <CidadeSelect />
          </FormTextoMatricula>
        </FormRowMatricula>

        <CardTituloMatricula>Informações acadêmicas</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Série/Ano:" className="w-1/2">
            <FormSelect
              name="serie"
              options={[
                { value: "1ano", label: "1º ano" },
                { value: "2ano", label: "2º ano" },
                { value: "3ano", label: "3º ano" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Turno:" className="w-1/2">
            <FormSelect
              name="turno"
              options={[
                { value: "manha", label: "Manhã" },
                { value: "tarde", label: "Tarde" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Escola de Origem:" className="w-1/2">
            <Input label="" {...register("escola_origem")} />
          </FormTextoMatricula>
        </FormRowMatricula>

        <CardTituloMatricula>Informações complementares</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Necessidades especiais:" className="w-1/2">
            <Input label="" {...register("necessidades_especiais")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Possui alergias?" className="w-1/2">
            <FormSelect
              name="tem_alergia"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Quais alergias?" className="w-1/2">
            <Input label="" {...register("quais_alergias")} />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Saída sozinho:" className="w-1/2">
            <FormSelect
              name="saida_sozinho"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Uso de imagem:" className="w-1/2">
            <FormSelect
              name="uso_imagem"
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <div className="w-full flex justify-center mt-10">
          <div className="w-40">
            <button
              type="submit"
              className="w-full bg-[#1D5D7F] h-12 sm:h-14 text-white text-lg sm:text-xl font-normal rounded-lg transition duration-200 focus:outline-none focus:ring-4"
            >
              Avançar
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

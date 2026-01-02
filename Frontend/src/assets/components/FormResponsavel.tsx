import React from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import EstadoSelect from "./EstadosSelect";
import CidadeSelect from "./CidadeSelect";
import FormSelect from "./FormSelect";
import NaturalidadeSelect from "./NaturalidadeSelect";
import NacionalidadeSelect from "./NacionalidadeSelect";

type DadosResponsavel = {
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
};

export default function FormResponsavel({
  onNext,
  onBack,
  defaultValues,
}: {
  onNext: (data: DadosResponsavel) => void;
  onBack: (data: DadosResponsavel) => void;
  defaultValues?: Partial<DadosResponsavel>;
}) {
  const methods = useForm<DadosResponsavel>({
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
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = (data: DadosResponsavel) => onNext(data);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <CardTituloMatricula>Dados pessoais do responsável</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Nome completo:" className="w-full">
            <Input
              label=""
              type="text"
              {...register("nome", {
                required: "Nome completo é obrigatório",
                minLength: {
                  value: 3,
                  message: "Digite pelo menos 3 caracteres",
                },
                pattern: {
                  value: /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/,
                  message: "O nome deve conter apenas letras",
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
                required: "Data obrigatória",
                validate: {
                  formato: (v) =>
                    !v || isNaN(new Date(String(v)).getTime())
                      ? "Data inválida"
                      : true,
                  naoFutura: (v) =>
                    new Date(v) <= new Date() ||
                    "A data não pode ser no futuro",
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
                { value: "masculino", label: "Masculino" },
                { value: "feminino", label: "Feminino" },
              ]}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="RG:" className="w-1/2">
            <Input
              label=""
              type="text"
              {...register("rg", {
                required: "RG é obrigatório",
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
                required: "Obrigatório",
                validate: (v) =>
                  !v || isNaN(new Date(String(v)).getTime())
                    ? "Data inválida"
                    : new Date(v) <= new Date() || "Não pode ser futura",
              })}
              error={errors?.data_emissao?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Órgão emissor:" className="w-1/3">
            <Input
              label=""
              {...register("orgao_emissor", {
                required: "Obrigatório",
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
                required: "Celular obrigatório",
                validate: (v) => ValidarTelefone(v) || "Telefone inválido",
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
                required: "E-mail obrigatório",
                validate: (v) => ValidarEmail(v) || "E-mail inválido",
              })}
              error={errors?.email?.message}
            />
          </FormTextoMatricula>
          <FormRowMatricula>
            <FormTextoMatricula title="Nacionalidade" className="w-1/2">
              <NacionalidadeSelect />
            </FormTextoMatricula>

            <FormTextoMatricula title="Naturalidade" className="w-1/2">
              <NaturalidadeSelect />
            </FormTextoMatricula>
          </FormRowMatricula>
        </FormRowMatricula>

        <CardTituloMatricula>Endereço do responsável</CardTituloMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Logradouro:" className="w-1/2">
            <Input
              label=""
              {...register("logradouro", {
                required: "Obrigatório",
              })}
              error={errors?.logradouro?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Número:" className="w-1/2">
            <Input
              label=""
              {...register("numero", {
                required: "Obrigatório",
              })}
              error={errors?.numero?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="CEP:" className="w-1/2">
            <Input
              label=""
              type="text"
              {...register("cep", {
                required: "CEP obrigatório",
                onChange: async (e) => {
                  const masked = maskCep(e.target.value);
                  e.target.value = masked;

                  if (masked.replace(/\D/g, "").length === 8) {
                    const data = await BuscarCep(masked);
                    if (data) {
                      setValue("logradouro", data.logradouro || "");
                      setValue("bairro", data.bairro || "");
                      setValue("cidade", data.cidade || "");
                      setValue("estado", data.estado || "");
                    }
                  }
                },
              })}
              error={errors?.cep?.message}
            />
          </FormTextoMatricula>
        </FormRowMatricula>

        <FormRowMatricula>
          <FormTextoMatricula title="Complemento:" className="w-1/2">
            <Input label="" {...register("complemento")} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Bairro:" className="w-1/2">
            <Input
              label=""
              {...register("bairro", {
                required: "Obrigatório",
              })}
              error={errors?.bairro?.message}
            />
          </FormTextoMatricula>

          <FormTextoMatricula title="Estado:" className="w-1/2">
            <EstadoSelect control={control} />
          </FormTextoMatricula>

          <FormTextoMatricula title="Cidade:" className="w-1/2">
            <CidadeSelect />
          </FormTextoMatricula>
        </FormRowMatricula>

        <div className="w-full flex justify-center gap-6 mt-10">
          <button
            type="button"
            onClick={() => onBack(methods.getValues())}
            className="w-40 h-12 sm:h-14 bg-[#1D5D7F] text-white text-lg sm:text-xl rounded-lg"
          >
            Voltar
          </button>

          <button
            type="submit"
            className="w-40 h-12 sm:h-14 bg-[#1D5D7F] text-white text-lg sm:text-xl rounded-lg"
          >
            Avançar
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

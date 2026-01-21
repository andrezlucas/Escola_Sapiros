import { useFormContext } from "react-hook-form";
import CardTituloMatricula from "./CardTituloMatricula";
import { FormRowMatricula } from "./FormRowMatricula";
import FormTextoMatricula from "./FormTextoMatricula";
import { Input } from "./Input";

export type FormDocumentoData = {
  RG_ALUNO?: FileList;
  CPF_ALUNO?: FileList;
  CERTIDAO_NASCIMENTO?: FileList;
  COMPROVANTE_RESIDENCIA_ALUNO?: FileList;
  FOTO_3X4?: FileList;
  HISTORICO_ESCOLAR?: FileList;
  RG_RESPONSAVEL?: FileList;
  CPF_RESPONSAVEL?: FileList;
  COMPROVANTE_RESIDENCIA_RESP?: FileList;
};
type Props = {
  onNext: (data: FormDocumentoData) => void;
  onBack: (data: FormDocumentoData) => void;
};

function validarArquivo(files?: FileList) {
  if (!files || files.length === 0) {
    return true;
  }

  const file = files[0];

  const tiposPermitidos = ["application/pdf", "image/jpeg", "image/png"];

  if (!tiposPermitidos.includes(file.type)) {
    return "Formato inválido (PDF, JPG ou PNG)";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Arquivo maior que 5MB";
  }

  return true;
}

function FormDocumento({ onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useFormContext<FormDocumentoData>();

  function onSubmit(data: FormDocumentoData) {
    onNext(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 md:gap-6"
    >
      <CardTituloMatricula>Documentos do(a) aluno(a)</CardTituloMatricula>

      <FormRowMatricula>
        <FormTextoMatricula
          title="Registro Geral (RG)"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("RG_ALUNO", { validate: validarArquivo })}
          />
          {errors.RG_ALUNO && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.RG_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="CPF" className="w-full md:w-1/3">
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("CPF_ALUNO", { validate: validarArquivo })}
          />
          {errors.CPF_ALUNO && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.CPF_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula
          title="Certidão de Nascimento"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("CERTIDAO_NASCIMENTO", { validate: validarArquivo })}
          />
          {errors.CERTIDAO_NASCIMENTO && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.CERTIDAO_NASCIMENTO?.message}
            </span>
          )}
        </FormTextoMatricula>
      </FormRowMatricula>

      <FormRowMatricula>
        <FormTextoMatricula
          title="Comprovante de Residência"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("COMPROVANTE_RESIDENCIA_ALUNO", {
              validate: validarArquivo,
            })}
          />
          {errors.COMPROVANTE_RESIDENCIA_ALUNO && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.COMPROVANTE_RESIDENCIA_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="Foto 3x4" className="w-full md:w-1/3">
          <Input
            label={""}
            type="file"
            accept="image/jpeg,image/png"
            {...register("FOTO_3X4", { validate: validarArquivo })}
          />
          {errors.FOTO_3X4 && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.FOTO_3X4.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula
          title="Histórico Escolar"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("HISTORICO_ESCOLAR", {
              validate: validarArquivo,
            })}
          />
          {errors.HISTORICO_ESCOLAR && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.HISTORICO_ESCOLAR.message}
            </span>
          )}
        </FormTextoMatricula>
      </FormRowMatricula>

      <CardTituloMatricula>Documentos do Responsável</CardTituloMatricula>

      <FormRowMatricula>
        <FormTextoMatricula
          title="RG do Responsável"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("RG_RESPONSAVEL", { validate: validarArquivo })}
          />
          {errors.RG_RESPONSAVEL && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.RG_RESPONSAVEL.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula
          title="CPF do Responsável"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("CPF_RESPONSAVEL", { validate: validarArquivo })}
          />
          {errors.CPF_RESPONSAVEL && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.CPF_RESPONSAVEL.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula
          title="Comprovante de Residência"
          className="w-full md:w-1/3"
        >
          <Input
            label={""}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("COMPROVANTE_RESIDENCIA_RESP", {
              validate: validarArquivo,
            })}
          />
          {errors.COMPROVANTE_RESIDENCIA_RESP && (
            <span className="text-xs md:text-sm text-red-500">
              {errors.COMPROVANTE_RESIDENCIA_RESP.message}
            </span>
          )}
        </FormTextoMatricula>
      </FormRowMatricula>

      <div className="w-full flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-6 md:mt-10">
        <button
          type="button"
          onClick={() => onBack(getValues())}
          className="w-full sm:w-40 h-12 md:h-14 bg-gray-400 md:bg-[#1D5D7F] text-white text-lg md:text-xl font-semibold rounded-lg transition duration-200 hover:opacity-90"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="w-full sm:w-40 h-12 md:h-14 bg-[#1D5D7F] text-white text-lg md:text-xl font-semibold rounded-lg transition duration-200 hover:bg-[#2a7aa3] focus:outline-none focus:ring-4 focus:ring-[#1D5D7F]/30"
        >
          Avançar
        </button>
      </div>
    </form>
  );
}

export default FormDocumento;

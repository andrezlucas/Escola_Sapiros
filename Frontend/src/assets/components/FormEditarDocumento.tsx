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
};

type Props = {
  onSubmit: (data: FormDocumentoData) => Promise<void>;
  onBack: (data: FormDocumentoData) => void;
  onAlunoUpdated?: () => void;
};

function validarArquivo(files?: FileList) {
  if (!files || files.length === 0) return true;

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

function FormEditarDocumento({ onSubmit, onBack, onAlunoUpdated }: Props) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useFormContext<FormDocumentoData>();

  const submitForm = async (data: FormDocumentoData) => {
    await onSubmit(data);
    if (onAlunoUpdated) {
      await onAlunoUpdated(); 
    }
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-6">
      <CardTituloMatricula>Documentos do(a) aluno(a)</CardTituloMatricula>

      <FormRowMatricula>
        <FormTextoMatricula title="Registro Geral (RG)">
          <Input
            label={""} type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("RG_ALUNO", { validate: validarArquivo })}          />
          {errors.RG_ALUNO && (
            <span className="text-sm text-red-500">
              {errors.RG_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="CPF">
          <Input
            label={""} type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("CPF_ALUNO", { validate: validarArquivo })}          />
          {errors.CPF_ALUNO && (
            <span className="text-sm text-red-500">
              {errors.CPF_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="Certidão de Nascimento">
          <Input
            label={""} type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("CERTIDAO_NASCIMENTO", { validate: validarArquivo })}          />
          {errors.CERTIDAO_NASCIMENTO && (
            <span className="text-sm text-red-500">
              {errors.CERTIDAO_NASCIMENTO.message}
            </span>
          )}
        </FormTextoMatricula>
      </FormRowMatricula>

      <FormRowMatricula>
        <FormTextoMatricula title="Comprovante de Residência">
          <Input
            label={""} type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("COMPROVANTE_RESIDENCIA_ALUNO", {
              validate: validarArquivo,
            })}          />
          {errors.COMPROVANTE_RESIDENCIA_ALUNO && (
            <span className="text-sm text-red-500">
              {errors.COMPROVANTE_RESIDENCIA_ALUNO.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="Foto 3x4">
          <Input
            label={""} type="file"
            accept="image/jpeg,image/png"
            {...register("FOTO_3X4", { validate: validarArquivo })}          />
          {errors.FOTO_3X4 && (
            <span className="text-sm text-red-500">
              {errors.FOTO_3X4.message}
            </span>
          )}
        </FormTextoMatricula>

        <FormTextoMatricula title="Histórico Escolar">
          <Input
            label={""} type="file"
            accept="application/pdf,image/jpeg,image/png"
            {...register("HISTORICO_ESCOLAR", { validate: validarArquivo })}          />
          {errors.HISTORICO_ESCOLAR && (
            <span className="text-sm text-red-500">
              {errors.HISTORICO_ESCOLAR.message}
            </span>
          )}
        </FormTextoMatricula>
      </FormRowMatricula>

      <div className="w-full flex justify-center gap-6 mt-10">
        <button
          type="button"
          onClick={() => onBack(getValues())}
          className="w-40 h-12 bg-[#1D5D7F] text-white rounded-lg"
        >
          Sair
        </button>
        <button
          type="submit"
          className="w-40 h-12 bg-[#1D5D7F] text-white rounded-lg"
        >
          Salvar documentos
        </button>
      </div>
    </form>
  );
}

export default FormEditarDocumento;

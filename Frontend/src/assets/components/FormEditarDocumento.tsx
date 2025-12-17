import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import CardTituloMatricula from "./CardTituloMatricula";
import { FormRowMatricula } from "./FormRowMatricula";
import FormTextoMatricula from "./FormTextoMatricula";
import { Input } from "./Input";
import { toast } from "react-toastify";

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

export type Documento = {
  id: string;
  tipo: string;
  nomeArquivo: string;
  url?: string;
};

type Props = {
  documentacaoId: string;
  documentos: Documento[];
  onSubmit: (data: FormDocumentoData) => Promise<void>;
  onBack: (data: FormDocumentoData) => void;
  onAlunoUpdated?: () => Promise<void> | void;
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

const Badge = ({ ok }: { ok: boolean }) => (
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {ok ? "Enviado" : "Não enviado"}
  </span>
);

function FormEditarDocumento({
  documentacaoId,
  documentos,
  onSubmit,
  onBack,
  onAlunoUpdated,
}: Props) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useFormContext<FormDocumentoData>();

  const [docs, setDocs] = useState<Documento[]>(documentos);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setDocs(documentos);
  }, [documentos]);

  function existeDocumento(tipo: string) {
    return docs.find((d) => d.tipo === tipo);
  }

  const removerDocumento = async (documentoId: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/documentacao/${documentacaoId}/documentos/${documentoId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Documento removido com sucesso");
      setDocs((prev) => prev.filter((d) => d.id !== documentoId));
      await onAlunoUpdated?.();
    } catch {
      toast.error("Erro ao remover documento");
    }
  };

  const submitForm = async (data: FormDocumentoData) => {
    await onSubmit(data);
    await onAlunoUpdated?.();
  };

  const renderInput = (label: string, tipo: keyof FormDocumentoData) => {
    const doc = existeDocumento(tipo);

    return (
      <FormTextoMatricula title={label}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge ok={!!doc} />
            {doc && (
              <div className="flex gap-3 text-sm">
                <a
                  href={doc.url ?? "#"}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  Visualizar
                </a>
                <button
                  type="button"
                  onClick={() => removerDocumento(doc.id)}
                  className="text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            )}
          </div>

          <Input
            label=""
            type="file"
            disabled={!!doc}
            {...register(tipo, { validate: validarArquivo })}
          />

          {errors[tipo] && (
            <span className="text-sm text-red-500">
              {errors[tipo]?.message as string}
            </span>
          )}
        </div>
      </FormTextoMatricula>
    );
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="flex flex-col gap-6">
      <CardTituloMatricula>Documentos do(a) aluno(a)</CardTituloMatricula>

      <FormRowMatricula>
        {renderInput("Registro Geral (RG)", "RG_ALUNO")}
        {renderInput("CPF", "CPF_ALUNO")}
        {renderInput("Certidão de Nascimento", "CERTIDAO_NASCIMENTO")}
      </FormRowMatricula>

      {renderInput("Comprovante de Residência", "COMPROVANTE_RESIDENCIA_ALUNO")}
      {renderInput("Foto 3x4", "FOTO_3X4")}
      {renderInput("Histórico Escolar", "HISTORICO_ESCOLAR")}

      <CardTituloMatricula>Documentos do Responsável</CardTituloMatricula>

      <FormRowMatricula>
        {renderInput("RG do Responsável", "RG_RESPONSAVEL")}
        {renderInput("CPF do Responsável", "CPF_RESPONSAVEL")}
        {renderInput(
          "Comprovante de Residência",
          "COMPROVANTE_RESIDENCIA_RESP"
        )}
      </FormRowMatricula>

      <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
        <button
          type="button"
          onClick={() => onBack(getValues())}
          className="w-full sm:w-40 h-12 bg-[#1D5D7F] text-white rounded-lg"
        >
          Confirmar alterações 
        </button>
        <button
          type="submit"
          className="w-full sm:w-40 h-12 bg-[#1D5D7F] text-white rounded-lg"
        >
          Salvar documentos
        </button>
      </div>
    </form>
  );
}

export default FormEditarDocumento;

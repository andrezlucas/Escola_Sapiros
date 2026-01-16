import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
  tipoDocumento: string;
  formaEntrega: string;
  motivo: string;
};

export const TIPOS_DOCUMENTO = [
  { value: "atestado_matricula", label: "Atestado de Matrícula" },
  { value: "historico_escolar", label: "Histórico Escolar" },
  {
    value: "declaracao_vinculo_servidor",
    label: "Declaração de Vínculo de Servidor",
  },
  { value: "atestado_vaga", label: "Atestado de Vaga" },
  { value: "declaracao_matricula", label: "Declaração de Matrícula" },
  { value: "declaracao_frequencia", label: "Declaração de Frequência" },
  { value: "declaracao_conclusao", label: "Declaração de Conclusão" },
  { value: "boletim", label: "Boletim Escolar" },
];

const FORMAS_ENTREGA = [
  { value: "presencial", label: "Presencial" },
  { value: "email", label: "Por E-mail" },
];

function FormSolicitarDocumentos() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(
        "http://localhost:3000/documentos/solicitacoes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            tipoDocumento: data.tipoDocumento,
            formaEntrega: data.formaEntrega,
            motivo: data.motivo || undefined,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao enviar solicitação");
      }

      reset();
      toast.success("Solicitação enviada com sucesso! Protocolo gerado.");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Erro ao enviar solicitação. Tente novamente."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Documento
        </label>
        <Controller
          name="tipoDocumento"
          control={control}
          rules={{ required: "Selecione um tipo de documento" }}
          render={({ field }) => (
            <select
              {...field}
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                ${errors.tipoDocumento ? "border-red-500" : ""}
              `}
            >
              <option value="">Selecione o Documento</option>
              {TIPOS_DOCUMENTO.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.tipoDocumento && (
          <p className="text-red-500 text-sm mt-1">
            {errors.tipoDocumento.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Forma de Entrega
        </label>
        <Controller
          name="formaEntrega"
          control={control}
          rules={{ required: "Selecione a forma de entrega" }}
          render={({ field }) => (
            <select
              {...field}
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                ${errors.formaEntrega ? "border-red-500" : ""}
              `}
            >
              <option value="">Selecione a Forma</option>
              {FORMAS_ENTREGA.map((forma) => (
                <option key={forma.value} value={forma.value}>
                  {forma.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.formaEntrega && (
          <p className="text-red-500 text-sm mt-1">
            {errors.formaEntrega.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Motivo da Solicitação (opcional)
        </label>
        <Controller
          name="motivo"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Ex: transferência escolar, solicitação de bolsa, estágio, etc..."
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                resize-none h-32
              `}
            />
          )}
        />
      </div>

      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <span className="text-[#1D5D7F] text-xl font-bold mt-0.5">•</span>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Atenção:</span>
          <br />
          Documentos enviados por e-mail são processados em até 2 dias úteis.
          <br />
          Para retirada presencial, aguarde confirmação por e-mail ou no
          sistema.
        </p>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => reset()}
          className="
            px-6 py-3 bg-gray-100 text-gray-700 font-medium 
            rounded-lg hover:bg-gray-200 transition
          "
        >
          Limpar
        </button>
        <button
          type="submit"
          className="
            px-6 py-3 bg-[#1D5D7F] text-white font-medium 
            rounded-lg hover:bg-[#15475a] transition
          "
        >
          Solicitar Documento
        </button>
      </div>
    </form>
  );
}

export default FormSolicitarDocumentos;

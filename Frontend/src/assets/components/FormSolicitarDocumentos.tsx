import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormData = {
  tipoDocumento: string;
  formaEntrega: string;
  motivo: string;
};

const TIPOS_DOCUMENTO = [
  { value: "DECLARACAO_MATRICULA", label: "Declaração de Matrícula" },
  { value: "DECLARACAO_FREQUENCIA", label: "Declaração de Frequência" },
  { value: "DECLARACAO_CONCLUSAO", label: "Declaração de Conclusão" },
  { value: "HISTORICO_ESCOLAR", label: "Histórico Escolar" },
  { value: "BOLETIM", label: "Boletim" },
];

const FORMAS_ENTREGA = [
  { value: "EMAIL", label: "E-mail" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "CORREIOS", label: "Correios" },
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
        `http://localhost:3000/documentos/solicitacoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            tipoDocumento: data.tipoDocumento,
            formaEntrega: data.formaEntrega,
            motivo: data.motivo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao enviar solicitação");
      }

      reset();
      toast.success("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
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
          Formato de Entrega
        </label>
        <Controller
          name="formaEntrega"
          control={control}
          rules={{ required: "Selecione o formato de entrega" }}
          render={({ field }) => (
            <select
              {...field}
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                ${errors.formaEntrega ? "border-red-500" : ""}
              `}
            >
              <option value="">Selecione o Formato de Entrega</option>
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
          Motivo da Solicitação
        </label>
        <Controller
          name="motivo"
          control={control}
          rules={{
            required: "Informe o motivo da solicitação",
            minLength: { value: 5, message: "Mínimo de 5 caracteres" },
          }}
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Descreva brevemente para que você precisa deste documento (ex: transferência, estágio, etc...)"
              className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                resize-none h-32
                ${errors.motivo ? "border-red-500" : ""}
              `}
            />
          )}
        />
        {errors.motivo && (
          <p className="text-red-500 text-sm mt-1">{errors.motivo.message}</p>
        )}
      </div>

      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <span className="text-[#1D5D7F] text-xl font-bold mt-0.5">•</span>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Informação importante:</span>
          <br />O prazo de processamento para documentos digitais é de até 2
          dias úteis. Para retirada presencial, aguarde o e-mail de confirmação
          antes de se dirigir à secretaria.
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
          Cancelar
        </button>
        <button
          type="submit"
          className="
            px-6 py-3 bg-[#1D5D7F] text-white font-medium 
            rounded-lg hover:bg-[#15475a] transition
          "
        >
          Enviar
        </button>
      </div>
    </form>
  );
}

export default FormSolicitarDocumentos;

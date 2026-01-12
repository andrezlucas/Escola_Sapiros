import { useForm, Controller } from "react-hook-form";

type FormData = {
  tipoDocumento: string;
  formatoEntrega: string;
  motivo: string;
};

function DocumentosAluno() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Dados enviados:", data);
    reset();
  };

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Solicitação de Documento
      </h1>
      <p className="text-gray-600 mb-8">
        Preencha os dados abaixo para solicitar documentos oficiais da
        secretaria.
      </p>

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
            name="formatoEntrega"
            control={control}
            rules={{ required: "Selecione o formato de entrega" }}
            render={({ field }) => (
              <select
                {...field}
                className={`
                  w-full px-4 py-3 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] focus:border-[#1D5D7F]
                  ${errors.formatoEntrega ? "border-red-500" : ""}
                `}
              >
                <option value="">Selecione o Formato de Entrega</option>
                <option value="digital">Digital</option>
                <option value="presencial">Presencial</option>
              </select>
            )}
          />
          {errors.formatoEntrega && (
            <p className="text-red-500 text-sm mt-1">
              {errors.formatoEntrega.message}
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
            dias úteis. Para retirada presencial, aguarde o e-mail de
            confirmação antes de se dirigir à secretaria.
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
    </div>
  );
}

export default DocumentosAluno;

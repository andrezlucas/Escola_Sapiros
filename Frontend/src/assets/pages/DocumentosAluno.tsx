import { useState } from "react";
import FormSolicitarDocumentos from "../components/FormSolicitarDocumentos";
import MinhasSolicitacoes from "../components/MinhasSolicitacoesAluno";

function DocumentosAluno() {
  const [etapa, setEtapa] = useState<"solicitacoes" | "minhassolicitacoes">(
    "solicitacoes"
  );

  return (
    <div className="flex-1 bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md min-h-[calc(100vh-120px)]">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl  text-[#1D5D7F] mb-3 sm:mb-4">
        Solicitação de Documento
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Preencha os dados abaixo para solicitar documentos oficiais da
        secretaria.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => setEtapa("solicitacoes")}
          className={`
            min-w-32 px-6 py-3 rounded-lg shadow font-bold text-sm transition-all
            ${
              etapa === "solicitacoes"
                ? "bg-[#1D5D7F] text-white hover:bg-[#15475a]"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }
          `}
        >
          Solicitar documentos
        </button>

        <button
          onClick={() => setEtapa("minhassolicitacoes")}
          className={`
            min-w-32 px-6 py-3 rounded-lg shadow font-bold text-sm transition-all
            ${
              etapa === "minhassolicitacoes"
                ? "bg-[#1D5D7F] text-white hover:bg-[#15475a]"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }
          `}
        >
          Minhas Solicitações
        </button>
      </div>

      <div className="mt-4 sm:mt-6">
        {etapa === "solicitacoes" && <FormSolicitarDocumentos />}
        {etapa === "minhassolicitacoes" && <MinhasSolicitacoes />}
      </div>
    </div>
  );
}

export default DocumentosAluno;

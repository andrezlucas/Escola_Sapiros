import { useState } from "react";
import FormSolicitarDocumentos from "../components/FormSolicitarDocumentos";
import MinhasSolicitacoes from "../components/MinhasSolicitacoesAluno";

function DocumentosAluno() {
  const [etapa, setEtapa] = useState<"solicitacoes" | "minhassolicitacoes">(
    "solicitacoes",
  );

  return (
    <div className="flex-1 bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md min-h-[calc(100vh-120px)] w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl  text-[#1D5D7F] mb-2 sm:mb-3">
          Solicitação de Documento
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Preencha os dados abaixo para solicitar documentos oficiais da
          secretaria.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
        <button
          onClick={() => setEtapa("solicitacoes")}
          className={`
            w-full sm:min-w-[180px] sm:w-auto px-6 py-3.5 sm:py-3 rounded-lg shadow-sm font-bold text-sm transition-all
            flex items-center justify-center
            ${
              etapa === "solicitacoes"
                ? "bg-[#1D5D7F] text-white hover:bg-[#15475a] shadow-md"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }
          `}
        >
          Solicitar documentos
        </button>

        <button
          onClick={() => setEtapa("minhassolicitacoes")}
          className={`
            w-full sm:min-w-[180px] sm:w-auto px-6 py-3.5 sm:py-3 rounded-lg shadow-sm font-bold text-sm transition-all
            flex items-center justify-center
            ${
              etapa === "minhassolicitacoes"
                ? "bg-[#1D5D7F] text-white hover:bg-[#15475a] shadow-md"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-gray-50"
            }
          `}
        >
          Minhas Solicitações
        </button>
      </div>

      <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-6">
        {etapa === "solicitacoes" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <FormSolicitarDocumentos />
          </div>
        )}
        {etapa === "minhassolicitacoes" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MinhasSolicitacoes />
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosAluno;

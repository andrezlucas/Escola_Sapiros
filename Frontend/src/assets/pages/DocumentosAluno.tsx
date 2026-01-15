import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import FormSolicitarDocumentos from "../components/FormSolicitarDocumentos";
import MinhasSolicitacoes from "../components/MinhasSolicitacoesAluno";

type FormData = {
  tipoDocumento: string;
  formatoEntrega: string;
  motivo: string;
};

function DocumentosAluno() {
  const [etapa, setEtapa] = useState<String>("solicitacoes");

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
        Solicitação de Documento
      </h1>
      <p className="text-gray-600 mb-8">
        Preencha os dados abaixo para solicitar documentos oficiais da
        secretaria.
      </p>

      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
        <button
          className={`w-full sm:w-auto h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "solicitacoes"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("solicitacoes")}
        >
          <span className="text-sm font-bold">Solicitar documentos</span>
        </button>
        <button
          className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
            etapa === "minhassolicitacoes"
              ? "bg-[#1D5D7F] text-white"
              : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
          }`}
          onClick={() => setEtapa("minhassolicitacoes")}
        >
          <span className="text-sm font-bold">Minhas Solicitações</span>
        </button>
      </div>
      {etapa === "solicitacoes" && <FormSolicitarDocumentos />}
      {etapa === "minhassolicitacoes" && <MinhasSolicitacoes />}
    </div>
  );
}

export default DocumentosAluno;

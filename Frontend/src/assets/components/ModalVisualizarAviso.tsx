interface Props {
  aviso: {
    nome: string;
    descricao: string;
    tipo: string;
    categoria: string;
    dataInicio?: string;
    dataFinal?: string;
  };
  onClose: () => void;
}

export default function ModalVisualizarAviso({ aviso, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl p-4 md:p-6 max-h-[90vh] md:max-h-[80vh] overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold text-[#1D5D7F] mb-3 md:mb-4 pr-4">
          {aviso.nome}
        </h2>

        <div className="space-y-3 md:space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] md:max-h-[60vh] pr-2">
          {aviso.categoria && (
            <div className="inline-block px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-medium">
              {aviso.categoria}
            </div>
          )}

          <p className="text-sm md:text-base text-gray-700 break-words whitespace-pre-wrap">
            {aviso.descricao}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs md:text-sm text-gray-500">
            {aviso.dataInicio && (
              <span>Início: {aviso.dataInicio.slice(0, 10)}</span>
            )}

            {aviso.dataFinal && (
              <span>Final: {aviso.dataFinal.slice(0, 10)}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4 md:mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm md:text-base hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

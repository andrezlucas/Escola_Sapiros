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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-hidden">
        <h2 className="text-xl font-bold text-[#1D5D7F] mb-4">{aviso.nome}</h2>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          {aviso.categoria && (
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {aviso.categoria}
            </div>
          )}

          <p className="text-gray-700 break-words whitespace-pre-wrap">
            {aviso.descricao}
          </p>

          <div className="flex gap-4 text-sm text-gray-500">
            {aviso.dataInicio && (
              <span>Início: {aviso.dataInicio.slice(0, 10)}</span>
            )}

            {aviso.dataFinal && (
              <span>Final: {aviso.dataFinal.slice(0, 10)}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

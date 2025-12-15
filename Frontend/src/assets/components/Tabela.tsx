export type Coluna<T> = {
  titulo: string;
  render: (item: T) => React.ReactNode;
  largura?: string;
};

export type TabelaProps<T> = {
  dados: T[];
  colunas: Coluna<T>[];
  renderExtra?: (item: T) => React.ReactNode;
};

export default function Tabela<T>({
  dados,
  colunas,
  renderExtra,
}: TabelaProps<T>) {
  return (
    <div className="overflow-x-auto border border-[#1D5D7F] rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#f0f7fb]">
          <tr>
            {colunas.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2 text-left text-sm font-semibold text-[#1D5D7F]"
              >
                {col.titulo}
              </th>
            ))}
            {renderExtra && (
              <th className="px-4 py-2 text-left text-sm font-semibold text-[#1D5D7F]">
                Editar
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {dados.map((item, rowIdx) => (
            <tr key={rowIdx} className="divide-y divide-gray-200">
              {colunas.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-2">
                  {col.render(item)}
                </td>
              ))}

              {renderExtra && (
                <td className="px-4 py-2">{renderExtra(item)}</td>
              )}
            </tr>
          ))}

          {dados.length === 0 && (
            <tr>
              <td
                colSpan={colunas.length + (renderExtra ? 1 : 0)}
                className="px-4 py-6 text-center text-gray-500"
              >
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import type { ReactNode } from "react";

export type Coluna<T> = {
  titulo: string;
  render: (item: T) => ReactNode;
  largura?: string;
};

export type TabelaProps<T> = {
  dados: T[];
  colunas: Coluna<T>[];
  renderExtra?: (item: T) => ReactNode;
};

export default function Tabela<T>({
  dados,
  colunas,
  renderExtra,
}: TabelaProps<T>) {
  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto border border-[#1D5D7F] rounded-lg">
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
                  Ações
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {dados.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                {colunas.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-2 text-sm text-black">
                    {col.render(item)}
                  </td>
                ))}

                {renderExtra && (
                  <td className="px-4 py-2 text-sm">{renderExtra(item)}</td>
                )}
              </tr>
            ))}

            {dados.length === 0 && (
              <tr>
                <td
                  colSpan={colunas.length + (renderExtra ? 1 : 0)}
                  className="px-4 py-10 text-center text-black"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {dados.map((item, rowIdx) => (
          <div
            key={rowIdx}
            className="bg-white border-2 border-[#1D5D7F] rounded-xl p-4 shadow-sm flex flex-col gap-3 overflow-hidden"
          >
            {colunas.map((col, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col border-b border-gray-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#1D5D7F] opacity-70">
                  {col.titulo}
                </span>
                <div className="text-sm text-gray-800 font-medium mt-0.5 break-words overflow-wrap-anywhere">
                  {col.render(item)}
                </div>
              </div>
            ))}

            {renderExtra && (
              <div className="mt-2 pt-2 border-t-2 border-[#1D5D7F]/10 flex justify-end">
                {renderExtra(item)}
              </div>
            )}
          </div>
        ))}

        {dados.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
            Nenhum registro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

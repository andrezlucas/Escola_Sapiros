import React, { useState, useEffect } from "react";
import { FaClock, FaPlay } from "react-icons/fa";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";

interface AtividadeMural {
  id: string;
  titulo: string;
  disciplina: string;
  descricao: string;
  dataEntrega: string;
  status: string;
  nota: number | null;
}

interface CardMuralAtividadesProps {
  type: "full" | "mini";
  className?: string;
}

const CardMuralAtividades: React.FC<CardMuralAtividadesProps> = ({
  type,
  className,
}) => {
  const [atividades, setAtividades] = useState<AtividadeMural[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchAtividades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/atividades/meu-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar atividades");
      }

      const data = await response.json();
      setAtividades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao buscar atividades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtividades();
  }, []);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const dia = data.getDate().toString().padStart(2, "0");
    const mes = (data.getMonth() + 1).toString().padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const getStatusDaData = (dataEntrega: string) => {
    const hoje = new Date();
    const data = new Date(dataEntrega);

    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    return data < hoje ? "EXPIRADO" : "PENDENTE";
  };

  const handleComecarClick = () => {
    setSearchParams({ view: "atividadesAluno" }, { replace: true });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D5D7F]"></div>
          <p className="mt-2 text-gray-500">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Erro ao carregar: {error}
      </div>
    );
  }

  const isFull = type === "full";

  return (
    <div
      className={`
        w-full ${isFull ? "h-full" : "h-[400px]"}
        p-6 rounded-xl
        bg-white shadow-md
        flex flex-col
        ${className || ""}
      `}
    >
      {!isFull ? (
        <>
          <h3 className=" font-bold  leading-9 text-[#1D5D7F] mb-4 text-center">
            Próximas Atividades
          </h3>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {atividades.length > 0 ? (
              atividades.slice().map((atividade) => {
                const status = atividade.status;
                const dataFormatada = formatarData(atividade.dataEntrega);

                return (
                  <div
                    key={atividade.id}
                    className="p-3 bg-[#EEF4FB] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-black-800 text-sm ">
                        {atividade.titulo}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium
    ${
      status === "ENTREGUE"
        ? "bg-green-100 text-green-800"
        : status === "EXPIRADO"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800"
    }
  `}
                      >
                        {status === "ENTREGUE"
                          ? "Concluída"
                          : status === "EXPIRADO"
                          ? "Expirada"
                          : "Pendente"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-[12px] mb-1 truncate">
                      {atividade.disciplina}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="text-[12px] text-gray-700 flex items-center gap-1">
                        <FaClock className="text-gray-500 text-[10px]" />
                        <span className="font-medium">Entrega:</span>
                        <span
                          className={
                            status === "EXPIRADO"
                              ? "text-red-600"
                              : "text-blue-600"
                          }
                        >
                          {dataFormatada}
                        </span>
                      </div>

                      {status !== "ENTREGUE" ? (
                        <button
                          onClick={handleComecarClick}
                          className="flex items-center gap-1 px-2 py-1 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164A66] transition-colors text-[10px] font-medium"
                        >
                          <FaPlay className="text-[8px]" />
                          <span>Começar</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164A66] transition-colors text-[10px] font-medium">
                          Concluída
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-3xl mb-2">
                  <HiOutlineClipboardDocumentList />
                </span>
                <p className="text-sm">Nenhuma atividade disponível</p>
              </div>
            )}
          </div>

          {atividades.length > 3 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 text-center">
                + {atividades.length - 3} atividades pendentes
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Todas as Atividades
          </h2>

          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {atividades.length > 0 ? (
              atividades.map((atividade) => {
                const status = atividade.status;
                const dataFormatada = formatarData(atividade.dataEntrega);

                return (
                  <div
                    key={atividade.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-9xl text-gray-800 truncate">
                          {atividade.titulo}
                        </h3>
                        <p className="text-gray-600 text-xs mt-0.5 truncate">
                          {atividade.disciplina}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium
                              ${
                                status === "ENTREGUE"
                                  ? "bg-green-100 text-green-800"
                                  : status === "EXPIRADO"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              } `}
                      >
                        {status === "ENTREGUE"
                          ? "Concluída"
                          : status === "EXPIRADO"
                          ? "Expirada"
                          : "Pendente"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-gray-700 text-xs line-clamp-2">
                        {atividade.descricao}
                      </p>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FaClock className="text-gray-500" />
                        <span className="font-medium">Entrega:</span>
                        <span
                          className={`font-medium ${
                            status === "EXPIRADO"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {dataFormatada}
                        </span>
                      </div>
                      {status !== "ENTREGUE" ? (
                        <button
                          onClick={handleComecarClick}
                          className="flex items-center gap-1 px-2 py-1 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164A66] transition-colors text-xs font-medium"
                        >
                          <FaPlay className="text-[10px]" />
                          <span>Começar</span>
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium text-sm">
                          Concluída
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-3xl mb-2">
                  <HiOutlineClipboardDocumentList />
                </span>
                <p className="text-sm">Nenhuma atividade disponível</p>
                <p className="text-xs mt-1">
                  Quando houver atividades, elas aparecerão aqui
                </p>
              </div>
            )}
          </div>

          {atividades.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Total: {atividades.length} atividades encontradas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardMuralAtividades;

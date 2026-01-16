import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, FileText } from "lucide-react";

interface VerificacaoResponse {
  status: string;
  codigo_autenticidade: string;
  data_emissao: string;
  titular: {
    nome: string;
    matricula: string;
    turma: string;
  };
  info: {
    tipo: string;
    protocolo: string;
  };
  notas?: Array<{
    disciplina: string;
    bimestre: string;
    nota1: number;
    nota2: number;
    media: number;
  }>;
}

export default function VerificarDocumento() {
  const { id } = useParams<{ id: string }>();
  const [dados, setDados] = useState<VerificacaoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/documentos/verificar/${id}`
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(
            err.message || "Código inválido ou documento não encontrado"
          );
        }
        const data = await res.json();
        setDados(data);
      } catch (err: any) {
        setError(err.message || "Erro ao verificar autenticidade");
      } finally {
        setLoading(false);
      }
    };

    if (id) verificar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">
            Verificando autenticidade do documento...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dados) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Documento Não Autenticado
          </h1>
          <p className="mt-2 text-gray-600">
            {error || "Código inválido ou documento não encontrado"}
          </p>
          <p className="mt-6 text-sm text-gray-500">
            O QR Code pode estar incorreto, expirado ou o documento não foi
            emitido por nossa instituição.
          </p>
        </div>
      </div>
    );
  }

  const isAutentico = dados.status === "DOCUMENTO AUTÊNTICO";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 ${
            isAutentico ? "border-green-500" : "border-red-500"
          }`}
        >
          <div
            className={`p-6 ${
              isAutentico ? "bg-green-50" : "bg-red-50"
            } text-center`}
          >
            {isAutentico ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h1 className="mt-4 text-3xl font-bold text-green-800">
                  Documento Autêntico
                </h1>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-600 mx-auto" />
                <h1 className="mt-4 text-3xl font-bold text-red-800">
                  Autenticidade Não Confirmada
                </h1>
              </>
            )}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Código de Autenticidade
                </h3>
                <p className="text-xl font-mono bg-gray-100 p-3 rounded-lg text-center">
                  {dados.codigo_autenticidade}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Data de Emissão
                </h3>
                <p className="text-xl">
                  {new Date(dados.data_emissao).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Titular do Documento
              </h3>
              <div className="space-y-3">
                <p>
                  <strong>Nome:</strong> {dados.titular.nome}
                </p>
                <p>
                  <strong>Matrícula:</strong> {dados.titular.matricula || "—"}
                </p>
                <p>
                  <strong>Turma:</strong> {dados.titular.turma || "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações do Documento
              </h3>
              <div className="space-y-3">
                <p>
                  <strong>Tipo:</strong>{" "}
                  {dados.info.tipo.replace(/_/g, " ").toUpperCase()}
                </p>
                <p>
                  <strong>Protocolo:</strong> {dados.info.protocolo}
                </p>
              </div>
            </div>

            {dados.notas && dados.notas.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Notas Registradas
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Disciplina
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Bimestre
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Média
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dados.notas.map((nota, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {nota.disciplina}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-500">
                            {nota.bimestre}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-medium">
                            {nota.media.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 text-center text-sm text-gray-600 border-t">
            <p>Verificação realizada em {new Date().toLocaleString("pt-BR")}</p>
            <p className="mt-2">
              Sistema de Emissão de Documentos - Escola Sapiros
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

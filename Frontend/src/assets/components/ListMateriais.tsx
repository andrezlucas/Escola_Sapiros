import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  Trash2,
  Edit,
  FileText,
  Video,
  Link as LinkIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import FormAnexar from "./FormAnexar";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Material {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: "PDF" | "VIDEO" | "LINK";
  origem: "LOCAL" | "URL";
  fileUrl?: string;
  url?: string;
  turma?: { nome_turma: string };
  disciplina?: { nome_disciplina: string } | null;
  disciplineName: string;
}

type FiltroTipo = "Todos" | "PDF" | "VIDEO" | "LINK";

function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

function DynamicThumbnail({ material }: { material: Material }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  useEffect(() => {
    const generateThumbnail = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        if (material.origem === "URL" && material.url) {
          const youtubeMatch = material.url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
          );
          if (youtubeMatch) {
            setThumbnailUrl(
              `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`,
            );
            return;
          }
        }

        if (
          material.origem === "LOCAL" &&
          material.fileUrl &&
          material.tipo === "PDF"
        ) {
          const loadingTask = pdfjsLib.getDocument(material.fileUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.0 });

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          } as any).promise;

          setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.8));
          return;
        }

        if (
          material.origem === "LOCAL" &&
          material.fileUrl &&
          material.tipo === "VIDEO"
        ) {
          const video = document.createElement("video");
          video.src = material.fileUrl;
          video.muted = true;
          video.playsInline = true;
          video.crossOrigin = "anonymous";

          const captureFrame = () => {
            canvas.width = video.videoWidth || 400;
            canvas.height = video.videoHeight || 225;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.8));
          };

          video.addEventListener("loadeddata", () => {
            video.currentTime = Math.min(2, video.duration || 2);
          });

          video.addEventListener("seeked", captureFrame);
          video.load();
          return;
        }
      } catch (err) {
        console.warn("Erro ao gerar thumbnail:", err);
      }

      setThumbnailUrl(
        `https://via.placeholder.com/400x225/6B7280/FFFFFF?text=${material.tipo}`,
      );
    };

    generateThumbnail();
  }, [material]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div
        className="w-full h-full bg-gray-200 flex items-center justify-center transition-opacity duration-300"
        style={{
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!thumbnailUrl && (
          <Loader2 className="animate-spin text-gray-400" size={40} />
        )}
      </div>
    </>
  );
}

export default function ListaMateriais({
  isProfessor = false,
}: {
  isProfessor?: boolean;
}) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("Todos");
  const [busca, setBusca] = useState("");
  const [materialEditando, setMaterialEditando] = useState<Material | null>(
    null,
  );
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    fetchMateriais();
  }, []);

  const fetchMateriais = async () => {
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:3000/materiais");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMateriais(data);
    } catch {
      toast.error("Erro ao carregar materiais");
    } finally {
      setLoading(false);
    }
  };

  const materiaisFiltrados = materiais
    .filter((m) => (filtroTipo === "Todos" ? true : m.tipo === filtroTipo))
    .filter((m) => m.titulo.toLowerCase().includes(busca.toLowerCase()));

  const grupos = materiaisFiltrados.reduce(
    (acc, mat) => {
      const key = mat.disciplineName || "Geral";
      if (!acc[key]) acc[key] = [];
      acc[key].push(mat);
      return acc;
    },
    {} as Record<string, Material[]>,
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este material?")) return;

    setDeletandoId(id);
    try {
      const res = await authFetch(`http://localhost:3000/materiais/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Material excluído com sucesso");
      setMateriais((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Erro ao excluir material");
    } finally {
      setDeletandoId(null);
    }
  };

  const abrirMaterial = (mat: Material) => {
    if (mat.origem === "LOCAL" && mat.fileUrl) {
      window.open(mat.fileUrl, "_blank");
    } else if (mat.origem === "URL" && mat.url) {
      window.open(mat.url, "_blank");
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl  text-[#1D5D7F] mb-2 sm:mb-3">
        Materiais de Estudo
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Veja os materiais de apoio para seu estudo.
      </p>

      <div className="mb-6">
        <label className="flex items-center gap-3 px-4 py-3 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full max-w-lg">
          <Search className="w-5 h-5 text-[#1D5D7F] shrink-0" />
          <input
            type="search"
            placeholder="Buscar material..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-base placeholder:text-[#1D5D7F] placeholder:opacity-60"
          />
        </label>
      </div>

      <div className="flex flex-nowrap overflow-x-auto pb-4 mb-8 gap-3 sm:flex-wrap no-scrollbar">
        {(["Todos", "PDF", "VIDEO", "LINK"] as FiltroTipo[]).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`flex-none min-w-[100px] sm:min-w-32 px-5 py-2.5 rounded-lg shadow font-bold text-sm transition-all ${
              filtroTipo === tipo
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
          >
            {tipo === "Todos"
              ? "Todos"
              : tipo === "LINK"
                ? "Links"
                : tipo + "s"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#1D5D7F]" size={50} />
        </div>
      ) : materiaisFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 py-10 text-lg">
          Nenhum material encontrado.
        </p>
      ) : (
        <div className="space-y-10">
          {Object.entries(grupos).map(([disciplina, mats]) => (
            <div key={disciplina}>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 border-l-4 border-[#1D5D7F] pl-3">
                {disciplina}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mats.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full"
                    onClick={() => !isProfessor && abrirMaterial(mat)}
                  >
                    <div className="h-44 sm:h-48 relative shrink-0">
                      <DynamicThumbnail material={mat} />
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow flex items-center gap-2">
                        {mat.tipo === "PDF" && (
                          <FileText size={16} className="text-blue-600" />
                        )}
                        {mat.tipo === "VIDEO" && (
                          <Video size={16} className="text-red-600" />
                        )}
                        {mat.tipo === "LINK" && (
                          <LinkIcon size={16} className="text-green-600" />
                        )}
                        <span className="font-bold text-xs uppercase tracking-wider">
                          {mat.tipo === "LINK" ? "Link" : mat.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 line-clamp-1">
                        {mat.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                        {mat.descricao || "Sem descrição disponível."}
                      </p>

                      {isProfessor && (
                        <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMaterialEditando(mat);
                            }}
                            className="p-2 text-[#1D5D7F] hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(mat.id);
                            }}
                            disabled={deletandoId === mat.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                          >
                            {deletandoId === mat.id ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              <Trash2 size={20} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isProfessor && materialEditando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-white sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Editar Material
              </h2>
              <button
                onClick={() => setMaterialEditando(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto flex-1">
              <FormAnexar
                modo="editar"
                materialAtual={materialEditando}
                onSuccess={() => {
                  fetchMateriais();
                  setMaterialEditando(null);
                  toast.success("Material atualizado!");
                }}
                onCancel={() => setMaterialEditando(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

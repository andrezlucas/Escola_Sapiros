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
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
          );
          if (youtubeMatch) {
            setThumbnailUrl(
              `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`
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
        `https://via.placeholder.com/400x225/6B7280/FFFFFF?text=${material.tipo}`
      );
    };

    generateThumbnail();
  }, [material]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div
        className="w-full h-full bg-gray-200 flex items-center justify-center"
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
    null
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

  const grupos = materiaisFiltrados.reduce((acc, mat) => {
    const key = mat.disciplineName || "Geral";
    if (!acc[key]) acc[key] = [];
    acc[key].push(mat);
    return acc;
  }, {} as Record<string, Material[]>);

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
    <div className="">
      <h1 className="text-3xl font-bold text-[#1D5D7F] mb-2">
        Materiais de Estudo
      </h1>
      <p className="text-gray-600 mb-8">
        Veja os materiais de apoio para seu estudo.
      </p>

      <div className="mb-8">
        <label className="flex items-center gap-3 px-4 py-3 bg-[#e6eef880] rounded-2xl border-2 border-solid border-[#1D5D7F] w-full max-w-md">
          <Search className="w-5 h-5 text-[#1D5D7F]" />
          <input
            type="search"
            placeholder="Buscar por título do material..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#1D5D7F] text-base placeholder:text-[#1D5D7F] placeholder:opacity-60"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        {(["Todos", "PDF", "VIDEO", "LINK"] as FiltroTipo[]).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`min-w-32 px-6 py-3 rounded-lg shadow font-bold text-sm transition-all ${
              filtroTipo === tipo
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
          >
            <span>
              {tipo === "Todos"
                ? "Todos"
                : tipo === "LINK"
                ? "Links"
                : tipo + "s"}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#1D5D7F]" size={50} />
        </div>
      ) : materiaisFiltrados.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-xl">
          {busca || filtroTipo !== "Todos"
            ? "Nenhum material encontrado com os filtros aplicados."
            : "Nenhum material disponível no momento."}
        </p>
      ) : (
        <div className="space-y-12">
          {Object.entries(grupos).map(([disciplina, mats]) => (
            <div key={disciplina}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {disciplina}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mats.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => !isProfessor && abrirMaterial(mat)}
                  >
                    <div className="h-48 relative">
                      <DynamicThumbnail material={mat} />
                      <div className="absolute bottom-3 left-3 bg-white px-4 py-2 rounded-lg shadow flex items-center gap-2">
                        {mat.tipo === "PDF" && (
                          <FileText size={18} className="text-blue-600" />
                        )}
                        {mat.tipo === "VIDEO" && (
                          <Video size={18} className="text-red-600" />
                        )}
                        {mat.tipo === "LINK" && (
                          <LinkIcon size={18} className="text-green-600" />
                        )}
                        <span className="font-medium text-sm">
                          {mat.tipo === "LINK" ? "Link" : mat.tipo}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2">{mat.titulo}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {mat.descricao || "Sem descrição disponível."}
                      </p>

                      {isProfessor && (
                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMaterialEditando(mat);
                            }}
                            className="text-[#1D5D7F] transition-colors"
                            title="Editar material"
                          >
                            <Edit size={22} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(mat.id);
                            }}
                            disabled={deletandoId === mat.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                            title="Excluir material"
                          >
                            {deletandoId === mat.id ? (
                              <Loader2 size={22} className="animate-spin" />
                            ) : (
                              <Trash2 size={22} />
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 w-full">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8 border-b">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Editar Material
              </h2>
            </div>
            <div className="p-4 sm:p-6 md:p-8">
              <FormAnexar
                modo="editar"
                materialAtual={materialEditando}
                onSuccess={() => {
                  fetchMateriais();
                  setMaterialEditando(null);
                  toast.success("Material atualizado com sucesso!");
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

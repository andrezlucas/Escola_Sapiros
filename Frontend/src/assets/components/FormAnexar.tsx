import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import FormTextoMatricula from "./FormTextoMatricula";
import { Input } from "./Input";

interface Turma {
  id: string;
  nome_turma: string;
}

interface Disciplina {
  id_disciplina: string;
  nome_disciplina: string;
}

interface MaterialAtual {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: "PDF" | "VIDEO" | "LINK";
  origem: "LOCAL" | "URL";
  url?: string;
  fileUrl?: string;
  turma?: { id?: string; nome_turma?: string } | null;
  disciplina?: { id_disciplina?: string; nome_disciplina?: string } | null;
  disciplineName?: string;
}

type FormData = {
  titulo: string;
  descricao?: string;
  tipo: "PDF" | "VIDEO" | "LINK";
  origem: "LOCAL" | "URL";
  url?: string;
  file?: FileList;
  turmaId?: string;
  disciplinaId?: string;
};

interface FormAnexarProps {
  modo?: "criar" | "editar";
  materialAtual?: MaterialAtual;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function FormAnexar({
  modo = "criar",
  materialAtual,
  onSuccess,
  onCancel,
}: FormAnexarProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingTurmas, setLoadingTurmas] = useState(false);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      origem: materialAtual?.origem === "URL" ? "URL" : "LOCAL",
      tipo: materialAtual?.tipo || "PDF",
      titulo: materialAtual?.titulo || "",
      descricao: materialAtual?.descricao || "",
      turmaId: materialAtual?.turma?.id || "",
      disciplinaId: materialAtual?.disciplina?.id_disciplina || "",
      url: materialAtual?.url || "",
    },
  });

  const origem = watch("origem");
  const file = watch("file");

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

  useEffect(() => {
    const fetchTurmas = async () => {
      setLoadingTurmas(true);
      try {
        const res = await authFetch("http://localhost:3000/professores/turmas");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTurmas(data);
      } catch {
        toast.error("Erro ao carregar turmas");
      } finally {
        setLoadingTurmas(false);
      }
    };
    fetchTurmas();
  }, []);

  useEffect(() => {
    const fetchDisciplinas = async () => {
      setLoadingDisciplinas(true);
      try {
        const res = await authFetch(
          "http://localhost:3000/professores/disciplinas"
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDisciplinas(data);
      } catch {
        toast.error("Erro ao carregar disciplinas");
      } finally {
        setLoadingDisciplinas(false);
      }
    };
    fetchDisciplinas();
  }, []);

  useEffect(() => {
    if (modo === "editar" && materialAtual) {
      reset({
        titulo: materialAtual.titulo,
        descricao: materialAtual.descricao || "",
        tipo: materialAtual.tipo,
        origem: materialAtual.origem === "URL" ? "URL" : "LOCAL",
        url: materialAtual.url || "",
        turmaId: materialAtual.turma?.id || "",
        disciplinaId: materialAtual.disciplina?.id_disciplina || "",
      });
    }
  }, [materialAtual, modo, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("titulo", data.titulo);
      if (data.descricao?.trim())
        formData.append("descricao", data.descricao.trim());
      formData.append("tipo", data.tipo);
      formData.append("origem", data.origem);

      if (data.turmaId) formData.append("turmaId", data.turmaId);
      if (data.disciplinaId) formData.append("disciplinaId", data.disciplinaId);

      if (data.origem === "LOCAL") {
        if (data.file && data.file.length > 0) {
          formData.append("file", data.file[0]);
        } else if (modo === "criar") {
          toast.error("Selecione um arquivo");
          setIsSubmitting(false);
          return;
        }
      } else if (data.origem === "URL") {
        if (!data.url?.trim()) {
          toast.error("Insira uma URL válida");
          setIsSubmitting(false);
          return;
        }
        formData.append("url", data.url.trim());
      }

      const url =
        modo === "editar" && materialAtual
          ? `http://localhost:3000/materiais/${materialAtual.id}`
          : "http://localhost:3000/materiais";

      const method = modo === "editar" ? "PATCH" : "POST";

      const response = await authFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Erro ao salvar material");
      }

      toast.success(
        modo === "editar"
          ? "Material atualizado com sucesso!"
          : "Material enviado com sucesso!"
      );

      onSuccess?.();
      if (modo === "criar") reset();
    } catch (err: any) {
      toast.error(err.message || "Falha ao salvar o material");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="border rounded-xl p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-center">
          {modo === "editar" ? "Editar Material" : "Fazer upload de material"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-center gap-10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="LOCAL"
                {...register("origem")}
                disabled={modo === "editar"}
                className="w-5 h-5 text-[#1D5D7F]"
              />
              <span className="font-medium text-lg">Upload de arquivo</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="URL"
                {...register("origem")}
                disabled={modo === "editar"}
                className="w-5 h-5 text-[#1D5D7F]"
              />
              <span className="font-medium text-lg">Link externo</span>
            </label>
          </div>

          {origem === "LOCAL" ? (
            <FormTextoMatricula title="Arquivo atual ou novo upload">
              <div className="mt-4 space-y-3">
                {modo === "editar" && materialAtual?.fileUrl && (
                  <p className="text-sm text-green-600">
                    Arquivo atual:{" "}
                    <a
                      href={materialAtual.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Abrir arquivo atual
                    </a>
                  </p>
                )}
                <Input
                  label={""}
                  type="file"
                  {...register("file", {
                    required:
                      modo === "criar" && origem === "LOCAL"
                        ? "Selecione um arquivo"
                        : false,
                  })}
                  accept=".pdf,video/*"
                  className="w-full"
                />
                {file && file.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Novo arquivo: {file[0].name} (
                    {(file[0].size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {errors.file && (
                  <span className="text-red-500 text-sm">
                    {errors.file.message}
                  </span>
                )}
              </div>
            </FormTextoMatricula>
          ) : (
            <FormTextoMatricula title="Link externo">
              <div className="mt-4">
                {modo === "editar" && materialAtual?.url && (
                  <p className="text-sm text-green-600 mb-2">
                    Link atual:{" "}
                    <a
                      href={materialAtual.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {materialAtual.url}
                    </a>
                  </p>
                )}
                <Input
                  label={""}
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...register("url", {
                    required:
                      origem === "URL" ? "Insira uma URL válida" : false,
                  })}
                  className="w-full"
                />
                {errors.url && (
                  <span className="text-red-500 text-sm">
                    {errors.url.message}
                  </span>
                )}
              </div>
            </FormTextoMatricula>
          )}

          <hr className="border-gray-300" />

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tipo do material <span className="text-red-500">*</span>
            </label>
            <select
              {...register("tipo", { required: "Selecione o tipo" })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            >
              <option value="PDF">PDF</option>
              <option value="VIDEO">Vídeo</option>
              <option value="LINK">Link geral</option>
            </select>
            {errors.tipo && (
              <span className="text-red-500 text-sm">
                {errors.tipo.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Título <span className="text-red-500">*</span>
            </label>
            <Input
              label={""}
              type="text"
              {...register("titulo", {
                required: "Digite o título",
                maxLength: 200,
              })}
              className="w-full"
            />
            {errors.titulo && (
              <span className="text-red-500 text-sm">
                {errors.titulo.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Turma
            </label>
            <select
              {...register("turmaId")}
              disabled={loadingTurmas}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            >
              <option value="">Selecione a turma</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome_turma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Disciplina
            </label>
            <select
              {...register("disciplinaId")}
              disabled={loadingDisciplinas}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            >
              <option value="">Selecione a Disciplina</option>
              {disciplinas.map((d) => (
                <option key={d.id_disciplina} value={d.id_disciplina}>
                  {d.nome_disciplina}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Descrição (opcional)
            </label>
            <textarea
              {...register("descricao")}
              rows={4}
              placeholder="Descreva o conteúdo..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            />
          </div>

          <div className="flex justify-center gap-6 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-3 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#15435e] disabled:opacity-70 font-medium"
            >
              {isSubmitting
                ? "Salvando..."
                : modo === "editar"
                ? "Salvar Alterações"
                : "Enviar Material"}
            </button>

            <button
              type="button"
              onClick={modo === "editar" ? onCancel : () => reset()}
              className="px-12 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              {modo === "editar" ? "Cancelar" : "Limpar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormAnexar;

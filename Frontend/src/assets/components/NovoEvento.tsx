import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

type Categoria =
  | "evento"
  | "reunião"
  | "prova"
  | "feriado"
  | "simulado"
  | "outro";

type FormEvento = {
  titulo: string;
  descricao?: string;
  inicio: string;
  fim: string;
  cor?: string;
  categoria?: Categoria;
};

type NovoEventoProps = {
  onClose: () => void;
  onSave: (evento: FormEvento & { id: string }) => void;
};

export default function NovoEvento({ onClose, onSave }: NovoEventoProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormEvento>({
    defaultValues: {
      cor: "#3d7e8f",
      categoria: "evento",
    },
  });

  const enviar = (data: FormEvento) => {
    if (new Date(data.fim) < new Date(data.inicio)) {
      setError("fim", {
        type: "manual",
        message: "A data de fim não pode ser antes da data de início!",
      });
      toast.error("A data de fim é anterior ao início!");
      return;
    }

    clearErrors("fim");

    onSave({
      ...data,
      id: crypto.randomUUID(),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[420px] shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl mb-4 font-bold text-[#3d7e8f]">
          Criar Novo Evento
        </h2>

        <form onSubmit={handleSubmit(enviar)}>
          <label className="font-medium text-gray-700">Título *</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-1"
            placeholder="Título do evento"
            {...register("titulo", { required: "O título é obrigatório" })}
          />
          {errors.titulo && (
            <p className="text-red-500 text-sm mb-3">{errors.titulo.message}</p>
          )}

          <label className="font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full p-2 border rounded mb-4"
            placeholder="Descrição (opcional)"
            {...register("descricao")}
          />

          <label className="font-medium text-gray-700">Início *</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded mb-1"
            {...register("inicio", { required: "Data de início obrigatória" })}
          />
          {errors.inicio && (
            <p className="text-red-500 text-sm mb-3">{errors.inicio.message}</p>
          )}

          <label className="font-medium text-gray-700">Fim *</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded mb-1"
            {...register("fim", { required: "Data de fim obrigatória" })}
          />
          {errors.fim && (
            <p className="text-red-500 text-sm mb-3">{errors.fim.message}</p>
          )}

          <label className="font-medium text-gray-700">Cor</label>
          <input
            type="color"
            className="w-16 h-10 p-1 border rounded mb-4"
            {...register("cor")}
          />

          <label className="font-medium text-gray-700">Categoria</label>
          <select
            className="w-full p-2 border rounded mb-4"
            {...register("categoria")}
          >
            <option value="evento">Evento</option>
            <option value="reunião">Reunião</option>
            <option value="prova">Prova</option>
            <option value="feriado">Feriado</option>
            <option value="simulado">Simulado</option>
            <option value="outro">Outro</option>
          </select>

          <button
            type="submit"
            className="bg-[#3d7e8f] text-white px-4 py-2 rounded w-full mt-2 hover:bg-[#356f7e]"
          >
            Criar Evento
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2 rounded text-[#3d7e8f] hover:bg-[#e7f3f6]"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

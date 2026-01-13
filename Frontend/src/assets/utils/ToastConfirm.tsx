import { toast } from "react-toastify";

export const ToastConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const toastId = toast(
    <div className="flex flex-col gap-3 p-2">
      <p className="text-sm font-medium">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => {
            toast.dismiss(toastId);
            onCancel?.();
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Não
        </button>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Sim, gerar
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      closeButton: false,
      draggable: false,
      closeOnClick: false,
      pauseOnHover: true,
      hideProgressBar: true,
    }
  );
};

import { useState } from "react";
import ModalCriarAviso from "../components/ModalCriarAviso";
import ModalEditarAviso from "../components/ModalEditarAviso";
import MuralLista from "../components/MuralList";

function Mural() {
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [reload, setReload] = useState(false);
  const [avisoEmEdicao, setAvisoEmEdicao] = useState<any | null>(null);

  const role = localStorage.getItem("role");

  function recarregarAvisos() {
    setReload((prev) => !prev);
  }

  return (
    <div className="w-full h-auto p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl text-[#1D5D7F]">
          Mural de Avisos
        </h1>
        {role === "coordenacao" && (
          <button
            onClick={() => setModalCriarAberto(true)}
            className="bg-[#1D5D7F] text-white px-4 py-2 rounded-lg"
          >
            + Adicionar Aviso
          </button>
        )}
      </div>

      <MuralLista reload={reload} />

      {modalCriarAberto && (
        <ModalCriarAviso
          onClose={() => setModalCriarAberto(false)}
          onSalvar={recarregarAvisos}
        />
      )}

      {avisoEmEdicao && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6">
            <ModalEditarAviso
              aviso={avisoEmEdicao}
              onClose={() => setAvisoEmEdicao(null)}
              onSalvar={recarregarAvisos}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Mural;

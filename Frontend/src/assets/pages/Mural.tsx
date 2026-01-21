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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-4xl text-[#1D5D7F]  md:font-normal">
          Mural de Avisos
        </h1>

        {role === "coordenacao" && (
          <button
            onClick={() => setModalCriarAberto(true)}
            className="w-full sm:w-auto bg-[#1D5D7F] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#164863] transition-colors"
          >
            + Adicionar Aviso
          </button>
        )}
      </div>

      <div className="w-full">
        <MuralLista reload={reload} />
      </div>

      {modalCriarAberto && (
        <ModalCriarAviso
          onClose={() => setModalCriarAberto(false)}
          onSalvar={recarregarAvisos}
        />
      )}

      {avisoEmEdicao && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-4 sm:p-6 shadow-2xl">
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

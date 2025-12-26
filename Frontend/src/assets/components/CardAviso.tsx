import { useEffect, useState } from "react";
import ModalEditarAviso from "./ModalEditarAviso";
import type { Aviso } from "./ModalCriarAviso";

interface Props {
  aviso: Aviso & {
    categoria?: string;
  };
  onAtualizar: () => void;
  onVisualizar?: (aviso: Aviso) => void;
}

export default function CardAviso({ aviso, onAtualizar, onVisualizar }: Props) {
  const [editarAberto, setEditarAberto] = useState(false);
  const [avisoSelecionado, setAvisoSelecionado] = useState<Aviso | null>(null);
  const [nomeAluno, setNomeAluno] = useState<string | null>(null);
  const role = localStorage.getItem("role");
  console.log("AVISO:", aviso);

  useEffect(() => {
    if (aviso.tipo === "INDIVIDUAL" && aviso.destinatarioAlunoId) {
      fetch(`http://localhost:3000/alunos/${aviso.destinatarioAlunoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setNomeAluno(data.usuario?.nome ?? "Aluno não informado");
        })
        .catch(() => setNomeAluno("Aluno não informado"));
    }
  }, [aviso]);

  return (
    <>
      <div
        className="border-2 border-[#1D5D7F] rounded-lg p-4 shadow-sm flex flex-col gap-2 cursor-pointer hover:bg-gray-50"
        onClick={() => {
          if (role === "coordenacao") {
            setEditarAberto(true);
          } else {
            setAvisoSelecionado(aviso);
            onVisualizar?.(aviso);
          }
        }}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-gray-500">
            {aviso.tipo}
          </span>

          {aviso.categoria && (
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">
              {aviso.categoria}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg">{aviso.nome}</h3>

        <p className="text-sm text-gray-600 line-clamp-3">{aviso.descricao}</p>

        {role === "coordenacao" &&
          aviso.tipo === "TURMA" &&
          aviso.turma?.nome_turma && (
            <p className="text-sm text-[#1D5D7F] font-medium">
              Turma: {aviso.turma.nome_turma}
            </p>
          )}

        {role === "coordenacao" && aviso.tipo === "INDIVIDUAL" && (
          <p className="text-sm text-[#1D5D7F] font-medium">
            Aluno: {nomeAluno}
          </p>
        )}
      </div>

      {editarAberto && (
        <ModalEditarAviso
          aviso={aviso}
          onClose={() => setEditarAberto(false)}
          onSalvar={onAtualizar}
        />
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import Tabela, { type Coluna } from "../components/Tabela";
import ModalEditarAtividade from "./ModalEditarAtividade";
import ModalRespostasAluno from "./ModalRespostaAluno";
import { FaEdit } from "react-icons/fa";
import { MdOutlineQuestionAnswer } from "react-icons/md";

type Alternativa = {
  id: string;
  letra: string;
  texto: string;
  correta: boolean;
};

type Resposta = {
  id: string;
  questao: {
    id: string;
    enunciado: string;
    tipo: "MULTIPLA_ESCOLHA" | "DISSERTATIVA" | "VERDADEIRO_FALSO";
    valor: number;
    alternativas?: Alternativa[];
  };
  alternativaEscolhida?: { id: string; texto: string };
  textoResposta?: string;
  notaAtribuida?: number;
};

type Entrega = {
  id: string;
  aluno: { usuario: { nome: string } };
  dataEntrega: string;
  respostas: Resposta[];
  notaFinal?: number;
};

type Atividade = {
  id: string;
  titulo: string;
  descricao: string;
  dataEntrega: string;
  valor: number | null;
  ativa: boolean;
  disciplina?: { id_disciplina: string; nome_disciplina: string };
  entregas?: Entrega[];
  turmas?: { nome: string }[];
};

export default function ListAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [atividadeSelecionada, setAtividadeSelecionada] =
    useState<Atividade | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalRespostasAberto, setModalRespostasAberto] = useState(false);
  const turmaId = localStorage.getItem("turmaId");

  async function fetchAtividades(): Promise<Atividade[]> {
    if (!turmaId) return [];
    try {
      const res = await fetch(
        `http://localhost:3000/atividades/professor/minhas-atividades`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Erro ao buscar atividades");
      const atividadesData: Atividade[] = await res.json();

      const atividadesComEntregas = await Promise.all(
        atividadesData.map(async (atividade) => {
          const resEntregas = await fetch(
            `http://localhost:3000/atividades/${atividade.id}/entregas`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const entregas = resEntregas.ok ? await resEntregas.json() : [];
          return { ...atividade, entregas };
        })
      );

      return atividadesComEntregas;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  useEffect(() => {
    fetchAtividades().then(setAtividades);
  }, [turmaId]);

  const colunas: Coluna<Atividade>[] = [
    { titulo: "Título", render: (a) => a?.titulo || "-" },
    {
      titulo: "Disciplina / Turma",
      render: (a) =>
        a?.turmas?.map((t) => t.nome).join(", ") ||
        a?.disciplina?.nome_disciplina ||
        "-",
    },
    { titulo: "Total de Respostas", render: (a) => a?.entregas?.length ?? 0 },
    {
      titulo: "Alunos que responderam",
      render: (a) =>
        a?.entregas?.map((e) => e.aluno.usuario.nome).join(", ") || "-",
    },

    {
      titulo: "Data de Entrega Final",
      render: (a) =>
        a?.dataEntrega? new Date(a.dataEntrega).toLocaleDateString("pt-Br"): "-"
    },
  ];

  const handleAbrirRespostas = async (atividade: Atividade) => {
    try {
      const res = await fetch(
        `http://localhost:3000/atividades/${atividade.id}/entregas`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Erro ao buscar entregas");

      const entregas: Entrega[] = await res.json();
      setAtividadeSelecionada({ ...atividade, entregas });
      setModalRespostasAberto(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Atividades Criadas</h1>

      <Tabela
        dados={atividades}
        colunas={colunas}
        renderExtra={(atividade) => (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 border border-[#1D5D7F] rounded-lg text-sm font-semibold hover:bg-[#1D5D7F] hover:text-white transition"
              onClick={() => {
                setAtividadeSelecionada(atividade);
                setModalEditarAberto(true);
              }}
            >
              <FaEdit /> Editar
            </button>

            <button
              className="flex items-center gap-1 px-3 py-1 border border-[#1D5D7F] rounded-lg text-sm font-semibold hover:bg-[#1D5D7F] hover:text-white transition"
              onClick={() => handleAbrirRespostas(atividade)}
            >
              <MdOutlineQuestionAnswer />
              Respostas
            </button>
          </div>
        )}
      />

      {modalEditarAberto && atividadeSelecionada && (
        <ModalEditarAtividade
          atividade={atividadeSelecionada}
          onClose={() => setModalEditarAberto(false)}
          onAtualizar={(atividadeAtualizada) => {
            if (atividadeAtualizada === null) {
              setAtividades((prev) =>
                prev.filter((a) => a.id !== atividadeSelecionada.id)
              );
            } else {
              setAtividades((prev) =>
                prev.map((a) =>
                  a.id === atividadeAtualizada.id ? atividadeAtualizada : a
                )
              );
            }
            setModalEditarAberto(false);
          }}
        />
      )}

      {modalRespostasAberto && atividadeSelecionada && (
        <ModalRespostasAluno
          atividade={atividadeSelecionada}
          onClose={() => setModalRespostasAberto(false)}
          onRespostaEnviada={(entrega) => {
            setAtividades((prev) =>
              prev.map((a) =>
                a.id === atividadeSelecionada.id
                  ? { ...a, entregas: [...(a.entregas || []), entrega] }
                  : a
              )
            );
          }}
        />
      )}

      {atividades.length === 0 && (
        <p className="text-gray-500 mt-4">Nenhuma atividade encontrada.</p>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import Tabela, { type Coluna } from "../components/Tabela";
import ModalEditarSimulado from "./ModalEditarSimulado"; // crie esse modal
import ModalTentativasAluno from "./ModalTentativasAluno"; // crie esse modal
import { FaEdit } from "react-icons/fa";
import { MdOutlineQuestionAnswer } from "react-icons/md";
import { toast } from "react-toastify";

type Disciplina = {
  id_disciplina: string;
  nome_disciplina: string;
};

type Turma = {
  id: string;
  nome_turma: string;
};

type Simulado = {
  id: string;
  titulo: string;
  bimestre: string;
  dataInicio: string;
  dataFim: string;
  tempoDuracao: number;
  valorTotal: string | number;
  ativo: boolean;
  versao: number;
  criadoem: string;
  atualizadoem: string;
  disciplina?: Disciplina;
  turmas?: Turma[];
  questoes?: any[]; // para contar quantidade
  tentativas?: any[]; // placeholder - carregar quando tiver endpoint
};

export default function ListSimulado() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [simuladoSelecionado, setSimuladoSelecionado] =
    useState<Simulado | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalTentativasAberto, setModalTentativasAberto] = useState(false);

  async function fetchSimulados(): Promise<Simulado[]> {
    try {
      const res = await fetch("http://localhost:3000/simulados/professor", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao buscar simulados");
      }

      const simuladosData: Simulado[] = await res.json();

      // Opcional: carregar detalhes completos (incluindo tentativas, se vierem)
      // Por enquanto usamos só a lista básica
      return simuladosData;
    } catch (error: any) {
      console.error("Erro ao carregar simulados:", error);
      toast.error("Não foi possível carregar os simulados");
      return [];
    }
  }

  useEffect(() => {
    fetchSimulados().then(setSimulados);
  }, []);

  const colunas: Coluna<Simulado>[] = [
    { titulo: "Título", render: (s) => s?.titulo || "-" },
    {
      titulo: "Disciplina / Turma(s)",
      render: (s) =>
        s?.turmas?.map((t) => t.nome_turma).join(", ") ||
        s?.disciplina?.nome_disciplina ||
        "-",
    },
    {
      titulo: "Nº de Questões",
      render: (s) => s?.questoes?.length ?? "-",
    },
    {
      titulo: "Valor Total",
      render: (s) => (s?.valorTotal ? `${s.valorTotal} pts` : "-"),
    },
    {
      titulo: "Bimestre",
      render: (s) => s?.bimestre || "-",
    },
    {
      titulo: "Período",
      render: (s) =>
        s?.dataInicio && s?.dataFim
          ? `${new Date(s.dataInicio).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })} até ${new Date(s.dataFim).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}`
          : "-",
    },
    {
      titulo: "Duração",
      render: (s) => (s?.tempoDuracao ? `${s.tempoDuracao} min` : "-"),
    },
    {
      titulo: "Status",
      render: (s) => (s?.ativo ? "Ativo" : "Inativo/Arquivado"),
    },
  ];

  const handleAbrirTentativas = (simulado: Simulado) => {
    setSimuladoSelecionado(simulado);
    setModalTentativasAberto(true);
    // Quando tiver endpoint de tentativas, carregue aqui:
    // fetch(`http://localhost:3000/simulados/${simulado.id}/tentativas`...)
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Simulados Criados</h1>

      <Tabela
        dados={simulados}
        colunas={colunas}
        renderExtra={(simulado) => (
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 border border-[#1D5D7F] rounded-lg text-sm font-semibold hover:bg-[#1D5D7F] hover:text-white transition"
              onClick={() => {
                setSimuladoSelecionado(simulado);
                setModalEditarAberto(true);
              }}
            >
              <FaEdit /> Editar
            </button>

            <button
              className="flex items-center gap-1 px-3 py-1 border border-[#1D5D7F] rounded-lg text-sm font-semibold hover:bg-[#1D5D7F] hover:text-white transition"
              onClick={() => handleAbrirTentativas(simulado)}
            >
              <MdOutlineQuestionAnswer />
              Tentativas
            </button>
          </div>
        )}
      />

      {modalEditarAberto && simuladoSelecionado && (
        <ModalEditarSimulado
          simulado={simuladoSelecionado}
          onClose={() => setModalEditarAberto(false)}
          onAtualizar={(simuladoAtualizado) => {
            if (simuladoAtualizado === null) {
              // Foi excluído
              setSimulados((prev) =>
                prev.filter((s) => s.id !== simuladoSelecionado.id)
              );
            } else {
              setSimulados((prev) =>
                prev.map((s) =>
                  s.id === simuladoAtualizado.id ? simuladoAtualizado : s
                )
              );
            }
            setModalEditarAberto(false);
          }}
        />
      )}

      {modalTentativasAberto && simuladoSelecionado && (
        <ModalTentativasAluno
          simulado={simuladoSelecionado}
          onClose={() => setModalTentativasAberto(false)}
          // Quando tiver endpoint, pode atualizar tentativas aqui
        />
      )}

      {simulados.length === 0 && (
        <p className="text-gray-500 mt-4">Nenhum simulado encontrado.</p>
      )}
    </div>
  );
}

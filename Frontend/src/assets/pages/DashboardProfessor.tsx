import HeaderBar from "../components/HeaderBar";
import SideBarMenu from "../components/SideBarMenu";
import CardMural from "../components/CardMural";
import ImagenPortal from "../imagens/imagenPortal.png";
import Calendario from "./Calendario";
import { SideBarOptions } from "../components/SideBarOptions";
import { useSearchParams } from "react-router-dom";
import CardMuralDashboard from "../components/CardMuralDashboard";
import Mural from "./Mural";
import Atividades from "./Atividades";
import Materiais from "./Materiais";
import Turmas from "./Turmas";
import Registro from "./Registro";
import VisaoGeralTurma from "./VisaoGeralTurma";
import CardHabilidadeDestaque from "../components/CardHabilidadeDestaque";
import VisaoAluno from "./VisaoAluno";
import { CardDesempenhoHabilidade } from "../components/CardDesempenhoHabilidade";
import CardMinhasTurmas from "../components/CardMinhasTurmas";
import CardEvolucaoTurma from "../components/CardEvolucaoTurma";
import { useEffect, useState } from "react";
import Configuracao from "./Configuracao";
import { authFetch } from "../utils/authFetch";

interface TurmaProfessor {
  id: string;
  nome_turma: string;
}

function DashboardProfessor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "home";
  const turmaId = searchParams.get("id");
  const alunoId = searchParams.get("aluno");
  const navigateTo = (view: string) => {
    setSearchParams({ view }, { replace: true });
  };

  const role = "professor";
  const options = SideBarOptions[role];
  const nome = localStorage.getItem("nome") || "Professor";
  const [turmas, setTurmas] = useState<TurmaProfessor[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("");
  const [turmaDesempenho, setTurmaDesempenho] = useState<string>("");
  const [turmaEvolucao, setTurmaEvolucao] = useState<string>("");

  const updateParams = (params: Record<string, string>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(params).forEach(([key, value]) => {
          next.set(key, value);
        });
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await authFetch(
          "http://localhost:3000/professores/turmas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setTurmas(data);

        if (data.length > 0) {
          setTurmaSelecionada(data[0].id);
          setTurmaDesempenho(data[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar turmas", err);
      }
    };

    fetchTurmas();
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case "calendario":
        return <Calendario />;
      case "mural":
        return <Mural />;
      case "atividades":
        return <Atividades />;
      case "materiais":
        return <Materiais />;
      case "minhas turmas":
        return <Turmas />;
      case "turma":
        return (
          <VisaoGeralTurma
            turmaId={turmaId}
            onVerAluno={(alunoId: string) => {
              console.log("Aluno selecionado:", alunoId);

              updateParams({
                view: "aluno",
                aluno: alunoId,
              });
            }}
          />
        );

      case "aluno":
        return alunoId ? (
          <>
            <button
              onClick={() =>
                updateParams({
                  view: "turma",
                })
              }
              className="mb-4 text-[#1D5D7F] font-semibold hover:underline"
            >
              ← Voltar para visão da turma
            </button>

            <VisaoAluno alunoId={alunoId} />
          </>
        ) : null;
      case "registro":
        return <Registro />;
      case "configuracoes":
        return <Configuracao />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <SideBarMenu
        navigateTo={navigateTo}
        menuItems={options.main}
        bottomMenuItems={options.bottom}
        activeView={currentView}
      />

      <div className="flex-1 flex flex-col ml-52 bg-[#1D5D7F] overflow-hidden">
        <div className="h-16">
          <HeaderBar />
        </div>

        <div className="flex-1 bg-[#E8E4DC] relative overflow-y-auto p-15 rounded-tl-[30px]">
          {currentView === "home" ? (
            <div className="grid grid-cols-5 gap-6 h-full">
              <div className="col-span-3 flex flex-col space-y-6">
                <div className="w-full p-6 bg-white rounded-xl shadow-md flex items-center justify-between border-2 border-[#1D5D7F]">
                  <h1 className="text-2xl font-bold text-[#1D5D7F]">
                    Olá, <span className="text-[#1D5D7F]">{nome}!</span>
                  </h1>
                  <p className="text-[#1D5D7F]">
                    Bem-vindo(a) ao seu painel de controle.
                  </p>
                  <img
                    src={ImagenPortal}
                    alt="Ícone do portal"
                    className="w-20 h-20 object-contain"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 pb-8">
                  <div className="h-48">
                    <div className="h-48">
                      <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm font-medium text-[#1D5D7F]">
                          Selecionar turma:
                        </label>

                        <select
                          value={turmaDesempenho}
                          onChange={(e) => setTurmaDesempenho(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
                        >
                          {turmas.map((turma) => (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome_turma}
                            </option>
                          ))}
                        </select>
                      </div>

                      <CardDesempenhoHabilidade turmaId={turmaDesempenho} />
                    </div>
                  </div>

                  <div className="h-96">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="text-sm font-medium text-[#1D5D7F]">
                        Selecionar turma:
                      </label>

                      <select
                        value={turmaSelecionada}
                        onChange={(e) => setTurmaSelecionada(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
                      >
                        {turmas.map((turma) => (
                          <option key={turma.id} value={turma.id}>
                            {turma.nome_turma}
                          </option>
                        ))}
                      </select>
                    </div>
                    <CardEvolucaoTurma turmaId={turmaSelecionada} />
                  </div>
                </div>

                <div className="h-64">
                  <CardMinhasTurmas
                    onVerDetalhes={() => navigateTo("minhas turmas")}
                    onVerMaterial={() => navigateTo("atividades")}
                  />
                </div>
              </div>

              <div className="col-span-2 flex flex-col space-y-6">
                <div className="h-90 ">
                  <CardMuralDashboard onVerMural={() => navigateTo("mural")} />
                </div>

                <div className="h-96">
                  <CardHabilidadeDestaque
                    onVerRelatorio={() => navigateTo("minhas turmas")}
                  />
                </div>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardProfessor;

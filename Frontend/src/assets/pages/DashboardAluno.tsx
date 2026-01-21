import HeaderBar from "../components/HeaderBar";
import SideBarMenu from "../components/SideBarMenu";
import CardMural from "../components/CardMural";
import ImagenPortal from "../imagens/imagenPortal.png";
import { SideBarOptions } from "../components/SideBarOptions";
import { useSearchParams } from "react-router-dom";
import CardMuralDashboard from "../components/CardMuralDashboard";
import Calendario from "./Calendario";
import Mural from "./Mural";
import AtividadesAluno from "./AtividadesAluno";
import CardAtividadesAluno from "../components/CardAtividadesAluno";
import MateriaisAluno from "./MateriaisAluno";
import DesempenhoAluno from "../components/DesempenhoAluno";
import Vestibular from "./Vestibular";
import CardHabilidade from "../components/CardHabilidade";
import { useEffect, useState } from "react";
import CardPreparacaoVestibular from "../components/CardPreparacaoVestibular";
import { CardDesempenhoAcademico } from "../components/CardDesempenhoAcademico";
import Configuracao from "./Configuracao";
import DocumentosAluno from "./DocumentosAluno";
import { authFetch } from "../utils/authFetch";

export type Habilidade = {
  habilidade: string;
  percentual: number;
};

export type ResumoSimulados = {
  ultimoSimulado: number;
  mediaGeral: number;
  simuladosRealizados: number;
};

export type NotaDashboard = {
  disciplina: string;
  mediaFinal: number;
  faltas: number;
};

function DashboardAluno() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "home";
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [loadingHabilidades, setLoadingHabilidades] = useState(true);
  const [resumoSimulados, setResumoSimulados] =
    useState<ResumoSimulados | null>(null);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [notas, setNotas] = useState<NotaDashboard[]>([]);
  const [loadingNotas, setLoadingNotas] = useState(true);

  const navigateTo = (view: string) => {
    setSearchParams({ view }, { replace: true });
  };

  const role = "aluno";
  const options = SideBarOptions[role];
  const nome = localStorage.getItem("nome");

  const renderContent = () => {
    switch (currentView) {
      case "calendario":
        return <Calendario />;
      case "mural":
        return <Mural />;
      case "atividadesAluno":
        return <AtividadesAluno />;
      case "materiais":
        return <MateriaisAluno />;
      case "desempenho":
        return <DesempenhoAluno />;
      case "vestibular":
        return <Vestibular />;
      case "configuracoes":
        return <Configuracao />;
      case "documentos":
        return <DocumentosAluno />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const carregarHabilidades = async () => {
      try {
        const res = await authFetch(
          "http://localhost:3000/alunos/dashboard/habilidades",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        setHabilidades(data);
      } catch (error) {
        console.error("Erro ao carregar habilidades", error);
      } finally {
        setLoadingHabilidades(false);
      }
    };
    carregarHabilidades();
  }, []);

  useEffect(() => {
    const carregarResumoSimulados = async () => {
      try {
        const res = await authFetch(
          "http://localhost:3000/alunos/dashboard/simulados/resumo",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        setResumoSimulados(data);
      } catch (error) {
        console.error("Erro ao carregar resumo dos simulados", error);
      } finally {
        setLoadingResumo(false);
      }
    };
    carregarResumoSimulados();
  }, []);

  useEffect(() => {
    const carregarNotas = async () => {
      try {
        const res = await authFetch(
          "http://localhost:3000/alunos/dashboard/notas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        setNotas(data);
      } catch (error) {
        console.error("Erro ao carregar notas", error);
      } finally {
        setLoadingNotas(false);
      }
    };
    carregarNotas();
  }, []);

  const habilidadesDashboard = habilidades
    .sort((a, b) => a.percentual - b.percentual)
    .slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBarMenu
        navigateTo={navigateTo}
        menuItems={options.main}
        bottomMenuItems={options.bottom}
        activeView={currentView}
      />

      <div className="flex-1 flex flex-col lg:ml-52 bg-[#1D5D7F] overflow-hidden w-full">
        <div className="h-16 shrink-0">
          <HeaderBar />
        </div>

        <div className="flex-1 bg-[#E8E4DC] relative overflow-y-auto p-4 sm:p-8 lg:p-15 rounded-tl-[30px] w-full">
          {currentView === "home" ? (
            <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
              <div className="flex flex-col space-y-6 lg:col-span-3">
                <div className="w-full p-6 bg-white rounded-xl shadow-md flex flex-row items-center justify-between border-2 border-[#1D5D7F] gap-4">
                  <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1D5D7F]">
                      Olá, <span className="text-[#1D5D7F]">{nome}!</span>!
                    </h1>
                    <p className="text-sm sm:text-base text-[#1D5D7F] mt-1">
                      Aqui está um resumo do seu progresso. Continue assim!
                    </p>
                  </div>
                  <img
                    src={ImagenPortal}
                    alt="Ícone do portal"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
                  />
                </div>

                {!loadingHabilidades && (
                  <CardHabilidade
                    habilidades={habilidadesDashboard}
                    onVerTodas={() => navigateTo("desempenho")}
                  />
                )}

                {!loadingResumo && resumoSimulados && (
                  <CardPreparacaoVestibular resumo={resumoSimulados} />
                )}

                {!loadingNotas && <CardDesempenhoAcademico notas={notas} />}
              </div>

              <div className="flex flex-col space-y-6 lg:col-span-2">
                <div className="lg:h-1/2">
                  <CardMuralDashboard onVerMural={() => navigateTo("mural")} />
                </div>
                <div className="lg:h-1/2">
                  <CardAtividadesAluno type={"mini"} />
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

export default DashboardAluno;

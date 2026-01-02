import HeaderBar from "../components/HeaderBar";
import SideBarMenu from "../components/SideBarMenu";
import CardMenuBackground from "../components/CardMenuBackground";
import CardMenu from "../components/CardMenu";
import CardMural from "../components/CardMural";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; 
import ImagenDocumentos from "../imagens/imagendocumento.png";
import ImagenMatricula from "../imagens/imagenmatricula.png";
import ImagenPortal from "../imagens/imagenPortal.png";
import ImagenMural from "../imagens/imagenmural.png";
import ImagenPerfil from "../imagens/imagenperfil.png";
import ImagenConfig from "../imagens/imagenconfig.png";
import CardCalendario from "../components/CardCalendario";
import Matricula from "./Matricula";
import Calendario from "./Calendario";
import { SideBarOptions } from "../components/SideBarOptions";
import Gerenciamento from "./Gerenciamento";
import Mural from "./Mural";
import GraficoDesempenho from "../components/GraficoDeTurma";
import { toast } from "react-toastify";
import IndicadorCircular from "../components/IndicadorCircular";
import CardMuralDashboard from "../components/CardMuralDashboard";

interface TurmaGrafico {
  turmaId: string;
  nomeTurma: string;
  totalAlunos: number;
  capacidadeMaxima: number;
}

interface IndicadoresDashboard {
  taxaOcupacaoGeral: number;
  totalTurmasAtivas: number;
  totalAlunos: number;
}

interface DashboardEstatisticasResponse {
  graficoAlunosPorTurma: TurmaGrafico[];
  indicadores: IndicadoresDashboard;
}

const DocumentosPage = () => (
  <div className="w-full h-full p-8 bg-white rounded-xl shadow-md flex items-center justify-center">
    <h1 className="text-4xl text-[#3d7e8f]">Página de Documentos Teste</h1>
  </div>
);

function DashboardCoordenacao() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "home";

  const navigateTo = (view: string) => {
    setSearchParams({ view }, { replace: true });
  };

  const [estatisticas, setEstatisticas] =
    useState<DashboardEstatisticasResponse | null>(null);

  const [loadingGrafico, setLoadingGrafico] = useState(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Usuário não autenticado");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/turmas/dashboard/estatisticas",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar estatísticas");
        }

        const json: DashboardEstatisticasResponse = await response.json();
        setEstatisticas(json);
      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoadingGrafico(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const role = "coordenacao";
  const options = SideBarOptions[role];

  const renderContent = () => {
    switch (currentView) {
      case "documentos":
        return <DocumentosPage />;
      case "matriculas":
        return <Matricula />;
      case "calendario":
        return <Calendario />;
      case "gerenciamento":
        return <Gerenciamento />;
      case "mural":
        return <Mural />;
      default:
        return null;
    }
  };

  const DocumentosIcon = (
    <img
      src={ImagenDocumentos}
      alt="Documentos"
      className="w-20 h-20 object-contain"
    />
  );
  const MatriculaIcon = (
    <img
      src={ImagenPerfil}
      alt="Matrículas"
      className="w-20 h-20 object-contain"
    />
  );
  const CalendarioIcon = (
    <img
      src={ImagenPortal}
      alt="Calendário"
      className="w-20 h-20 object-contain"
    />
  );
  const MuralIcon = (
    <img src={ImagenMural} alt="Mural" className="w-20 h-20 object-contain" />
  );
  const RelatoriosIcon = (
    <img
      src={ImagenMatricula}
      alt="Relatórios"
      className="w-20 h-20 object-contain"
    />
  );
  const GerenciamentoIcon = (
    <img
      src={ImagenConfig}
      alt="Gerenciamento"
      className="w-20 h-20 object-contain"
    />
  );

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
            <div className="grid grid-cols-5 gap-8 h-full">
              <div className="col-span-3 flex flex-col">
                <CardMenuBackground>
                  <CardMenu
                    title="Mural"
                    icon={MuralIcon}
                    onClick={() => navigateTo("mural")}
                  />
                  <CardMenu
                    title="Calendário"
                    icon={CalendarioIcon}
                    onClick={() => navigateTo("calendario")}
                  />
                  <CardMenu
                    title="Gerenciamento"
                    icon={GerenciamentoIcon}
                    onClick={() => navigateTo("gerenciamento")}
                  />
                  <CardMenu
                    title="Documentos"
                    icon={DocumentosIcon}
                    onClick={() => navigateTo("documentos")}
                  />
                  <CardMenu title="Relatórios" icon={RelatoriosIcon} />
                  <CardMenu
                    title="Matrícula"
                    icon={MatriculaIcon}
                    onClick={() => navigateTo("matriculas")}
                  />
                </CardMenuBackground>

                <h2 className="font-poppins text-[24px] text-[#3D7E8F] mb-4">
                  Gráfico de Turma
                </h2>

                <div className="flex-1 w-full rounded-xl bg-white shadow-md">
                  {loadingGrafico && (
                    <p className="text-center text-gray-400 p-6">
                      Carregando gráfico...
                    </p>
                  )}

                  {!loadingGrafico && estatisticas && (
                    <div className="bg-white rounded-xl p-6 shadow-md h-[380px] flex gap-6">
                      <div className="flex-1">
                        <GraficoDesempenho
                          data={estatisticas.graficoAlunosPorTurma}
                        />
                      </div>

                      <div className="w-[220px] flex flex-col justify-center space-y-4">
                        <IndicadorCircular
                          value={estatisticas.indicadores.taxaOcupacaoGeral}
                          label="Taxa de ocupação"
                        />
                        <IndicadorCircular
                          value={estatisticas.indicadores.totalTurmasAtivas}
                          max={estatisticas.indicadores.totalTurmasAtivas}
                          label="Turmas ativas"
                        />
                        <IndicadorCircular
                          value={estatisticas.indicadores.totalAlunos}
                          max={estatisticas.indicadores.totalAlunos}
                          label="Total de alunos"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 flex flex-col space-y-14 h-full">
                <CardMuralDashboard onVerMural={() => navigateTo("mural")} />
                <div className="-mt-2.5">
                  <CardCalendario />
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

export default DashboardCoordenacao;

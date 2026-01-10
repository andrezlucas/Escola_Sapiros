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

function DashboardAluno() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "home";

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
                  <div>
                    <h1 className="text-2xl font-bold text-[#1D5D7F]">
                      Olá, <span className="text-[#1D5D7F]">{nome}!</span>!
                    </h1>
                    <p className="text-[#1D5D7F]">
                      Aqui está um resumo do seu progresso. Continue assim!
                    </p>
                  </div>
                  <img
                    src={ImagenPortal}
                    alt="Ícone do portal"
                    className="w-20 h-20 object-contain"
                  />
                </div>

                <CardMural type="full" />

                <CardMural type="mini"></CardMural>

                <CardMural type="full"></CardMural>
              </div>

              <div className="col-span-2 flex flex-col space-y-6">
                <div className="h-1/2">
                  <CardMuralDashboard onVerMural={() => navigateTo("mural")} />
                </div>

                <div className="h-1/2">
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

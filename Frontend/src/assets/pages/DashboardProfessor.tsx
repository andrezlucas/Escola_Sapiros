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

function DashboardProfessor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = searchParams.get("view") || "home";

  const navigateTo = (view: string) => {
    setSearchParams({ view }, { replace: true });
  };

  const role = "professor";
  const options = SideBarOptions[role];
  const nome = localStorage.getItem("nome") || "Professor";

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
      case "registro":
        return <Registro />;
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="h-48">
                    <CardMural type="mini" />
                  </div>

                  <div className="h-96">
                    <CardMural type="mini" />
                  </div>
                </div>

                <div className="h-64">
                  <CardMural type="full" />
                </div>
              </div>

              <div className="col-span-2 flex flex-col space-y-6">
                <div className="h-90">
                  <CardMuralDashboard onVerMural={() => navigateTo("mural")} />
                </div>

                <div className="h-96">
                  <CardMural type="mini" />
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

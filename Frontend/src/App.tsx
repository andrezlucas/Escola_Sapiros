import DashboardCoordenacao from "./assets/pages/DashboardCoordenacao";
import Login from "./assets/pages/Login";
import Matricula from "./assets/pages/Matricula";
import NovaSenha from "./assets/pages/NovaSenha";
import RedefinirSenha from "./assets/pages/RedefinirSenha";
import { Routes, Route } from "react-router-dom";
import SenhaBloqueada from "./assets/pages/SenhaBloqueada";
import Calendario from "./assets/pages/Calendario";
import DashboardAluno from "./assets/pages/DashboardAluno";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/nova-senha" element={<NovaSenha />} />
        <Route
          path="/dashboard/coordenacao"
          element={<DashboardCoordenacao />}
        />
        <Route path="/dashboard/aluno" element={<DashboardAluno/>}/>
        <Route path="/matricula" element={<Matricula />} />
        <Route path="/senha-bloqueada" element={<SenhaBloqueada />} />
        <Route path="/calendario" element={<Calendario />} />
      </Routes>
    </>
  );
}

export default App;

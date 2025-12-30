import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./routes/PrivateRoute";
import EditarDocumento from "./assets/pages/EditarDocumento";
import Gerenciamento from "./assets/pages/Gerenciamento";
import Mural from "./assets/pages/Mural";
import { ToastContainer } from "react-toastify";
import Calendario from "./assets/pages/Calendario";
import DashboardAluno from "./assets/pages/DashboardAluno";

import DashboardProfessor from "./assets/pages/DashboardProfessor";
import Login from "./assets/pages/Login";
import NovaSenha from "./assets/pages/NovaSenha";
import RedefinirSenha from "./assets/pages/RedefinirSenha";
import SenhaBloqueada from "./assets/pages/SenhaBloqueada";
import DashboardCoordenacao from "./assets/pages/DashboardCoordenacao";
import NaoAutorizado from "./assets/pages/NaoAutorizado";
import ResponderAtividade from "./assets/pages/ResponderAtividade";

function App() {
  return (
    <>
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/nova-senha" element={<NovaSenha />} />
        <Route path="/senha-bloqueada" element={<SenhaBloqueada />} />
        <Route path="/nao-autorizado" element={<NaoAutorizado />} />

        <Route
          path="/dashboard/coordenacao"
          element={
            <PrivateRoute allowedRoles={["coordenacao"]}>
              <DashboardCoordenacao />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/aluno"
          element={
            <PrivateRoute allowedRoles={["aluno"]}>
              <DashboardAluno />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/professor"
          element={
            <PrivateRoute allowedRoles={["professor"]}>
              <DashboardProfessor />
            </PrivateRoute>
          }
        />

        <Route
          path="/calendario"
          element={
            <PrivateRoute allowedRoles={["coordenacao", "aluno", "professor"]}>
              <Calendario />
            </PrivateRoute>
          }
        />

        <Route
          path="/mural"
          element={
            <PrivateRoute allowedRoles={["coordenacao", "aluno", "professor"]}>
              <Mural />
            </PrivateRoute>
          }
        />

        <Route
          path="/gerenciamento"
          element={
            <PrivateRoute allowedRoles={["coordenacao"]}>
              <Gerenciamento />
            </PrivateRoute>
          }
        />

        <Route
          path="/alunos/:id/documentos/editar"
          element={
            <PrivateRoute allowedRoles={["coordenacao"]}>
              <EditarDocumento />
            </PrivateRoute>
          }
        />

        
      </Routes>
    </>
  );
}
export default App;

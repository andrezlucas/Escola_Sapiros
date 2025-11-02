import Login from "./assets/pages/Login"
import RedefinirSenha from "./assets/pages/RedefinirSenha"
import { Routes, Route } from "react-router-dom";
function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<Login />}/>
      <Route path="/redefinir-senha" element= {<RedefinirSenha/>}/>
    </Routes>
    </>
  )
}

export default App

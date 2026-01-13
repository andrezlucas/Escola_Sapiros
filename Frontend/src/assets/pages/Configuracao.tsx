import { useState } from "react";
import FormEditarPerfil from "../components/FormEditarPerfil";
import FormTermoUso from "../components/FormTermoUso";
import FormPrivacidadeSeguranca from "../components/FormPrivacidadeSeguranca";
import FormGerenciamentoUsuarios from "../components/FormGerenciamentoUsuarios";

type OpcaoMenu =
  | "Editar Perfil"
  | "Gerenciamento de Usuários"
  | "Termo de uso"
  | "Privacidade e Segurança";

function Configuracao() {
  const role = localStorage.getItem("role") as
    | "coordenacao"
    | "aluno"
    | "professor";

  const [active, setActive] = useState<OpcaoMenu>("Editar Perfil");

  const opcoesAlunoProfessor: OpcaoMenu[] = [
    "Editar Perfil",
    "Termo de uso",
    "Privacidade e Segurança",
  ];

  const opcoesCoordenacao: OpcaoMenu[] = [
    "Editar Perfil",
    "Gerenciamento de Usuários",
    "Termo de uso",
    "Privacidade e Segurança",
  ];

  const opcoes =
    role === "coordenacao" ? opcoesCoordenacao : opcoesAlunoProfessor;

  return (
    <div className="flex gap-6">
      <div className="w-[301px] h-[687px] bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#1D5D7F]">
          Configurações
        </h2>

        <div className="flex flex-col gap-3">
          {opcoes.map((opcao) => (
            <button
              key={opcao}
              onClick={() => setActive(opcao)}
              className={`
                w-full text-left px-5 py-3 rounded-lg font-medium transition-all
                ${
                  active === opcao
                    ? "bg-[#1D5D7F] text-white shadow-md"
                    : "text-[#1D5D7F] border-2 border-[#1D5D7F] hover:bg-blue-50"
                }
              `}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      {active === "Editar Perfil" && <FormEditarPerfil />}
      {active === "Gerenciamento de Usuários" && role === "coordenacao" && (
        <FormGerenciamentoUsuarios />
      )}
      {active === "Termo de uso" && <FormTermoUso />}

      {active === "Privacidade e Segurança" && <FormPrivacidadeSeguranca />}
    </div>
  );
}

export default Configuracao;

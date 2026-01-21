import { useState } from "react";
import FormEditarPerfil from "../components/FormEditarPerfil";
import FormTermoUso from "../components/FormTermoUso";
import FormPrivacidadeSeguranca from "../components/FormPrivacidadeSeguranca";
import FormGerenciamentoUsuarios from "../components/FormGerenciamentoUsuarios";
import FormLogSistema from "../components/FormLogSistema";

type OpcaoMenu =
  | "Editar Perfil"
  | "Gerenciamento de Usuários"
  | "Logs do Sistema"
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
    "Logs do Sistema",
    "Termo de uso",
    "Privacidade e Segurança",
  ];

  const opcoes =
    role === "coordenacao" ? opcoesCoordenacao : opcoesAlunoProfessor;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-2 md:p-4">
      <div className="w-full lg:w-[301px] lg:h-[687px] bg-white rounded-xl p-4 md:p-6 shadow-md">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#1D5D7F] mb-4 md:mb-6">
          Configurações
        </h2>

        <div className="flex flex-row lg:flex-col gap-2 md:gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
          {opcoes.map((opcao) => (
            <button
              key={opcao}
              onClick={() => setActive(opcao)}
              className={`
                whitespace-nowrap lg:whitespace-normal w-auto lg:w-full text-left px-4 md:px-5 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base
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

      <div className="flex-1 w-full">
        {active === "Editar Perfil" && <FormEditarPerfil />}
        {active === "Gerenciamento de Usuários" && role === "coordenacao" && (
          <FormGerenciamentoUsuarios />
        )}
        {active === "Logs do Sistema" && role === "coordenacao" && (
          <FormLogSistema />
        )}
        {active === "Termo de uso" && <FormTermoUso />}
        {active === "Privacidade e Segurança" && <FormPrivacidadeSeguranca />}
      </div>
    </div>
  );
}

export default Configuracao;

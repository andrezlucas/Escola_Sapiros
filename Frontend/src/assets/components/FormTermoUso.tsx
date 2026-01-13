import { useState, useRef, useEffect } from "react";

interface TermosStatus {
  termosAceitos: boolean;
  termosAceitosEm: string | null;
}

function FormTermoUso() {
  const [concordou, setConcordou] = useState(false);
  const [rolouTudo, setRolouTudo] = useState(false);
  const [termosStatus, setTermosStatus] = useState<TermosStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const termoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTermos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Sessão não encontrada. Faça login novamente.");
          return;
        }

        const res = await fetch(
          "http://localhost:3000/configuracoes/termos-de-uso",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(
            `Erro ao verificar termos: ${res.status} - ${errText}`
          );
        }

        const data: TermosStatus = await res.json();
        setTermosStatus(data);

        if (data.termosAceitos) {
          setConcordou(true);
        }
      } catch (err: any) {
        console.error("Erro ao carregar status dos termos:", err);
        setError(err.message || "Falha ao verificar status dos termos");
      } finally {
        setLoading(false);
      }
    };

    checkTermos();
  }, []);

  const handleScroll = () => {
    const el = termoRef.current;
    if (!el) return;

    const chegouNoFinal =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
    if (chegouNoFinal) {
      setRolouTudo(true);
    }
  };

  useEffect(() => {
    const el = termoRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 10) {
      setRolouTudo(true);
    }
  }, []);

  const handleAceitar = async () => {
    if (!concordou) return;

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sessão não encontrada");

      const res = await fetch(
        "http://localhost:3000/configuracoes/termos-de-uso",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ aceito: true }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao aceitar os termos");
      }

      const data = await res.json();
      setTermosStatus(data);
      setSuccess("Termos aceitos com sucesso!");
      setConcordou(true);
    } catch (err: any) {
      setError(err.message || "Falha ao registrar aceite dos termos");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-xl p-8 shadow-md flex items-center justify-center">
        <p className="text-gray-600">Carregando termos de uso...</p>
      </div>
    );
  }

  if (termosStatus?.termosAceitos) {
    const dataAceite = termosStatus.termosAceitosEm
      ? new Date(termosStatus.termosAceitosEm).toLocaleString("pt-BR", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "Data não disponível";

    return (
      <div className="flex-1 bg-white rounded-xl p-8 shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Termos de Uso aceitos
        </h2>
        <p className="text-gray-700 mb-2">Você concordou com os termos em:</p>
        <p className="text-lg font-medium text-gray-800">{dataAceite}</p>
        <p className="mt-6 text-gray-600">
          Pode continuar utilizando a plataforma normalmente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Termo de Uso
      </h1>

      <div
        ref={termoRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto text-gray-700 text-sm leading-relaxed pr-4 border border-gray-300 rounded-md p-6 bg-gray-50"
      >
        <p className="mb-4 font-medium">
          Ao utilizar esta plataforma, você declara estar ciente e de acordo com
          os termos abaixo descritos.
        </p>

        <p className="mb-4">
          <strong>Última atualização:</strong> 12/01/2026
        </p>

        <p className="mb-4">
          Bem-vindo à <strong>Escola Sapiros</strong>, uma Plataforma de
          Desempenho Educacional e Ambiente Virtual de Aprendizagem (AVA),
          desenvolvida com o objetivo de apoiar alunos do Ensino Médio na
          identificação de seus pontos fortes e fracos, especialmente no
          contexto de preparação para o ENEM e vestibulares.
        </p>

        <p className="mb-4">
          Ao acessar, cadastrar-se ou utilizar a plataforma, o usuário declara
          que leu, compreendeu e concorda integralmente com os presentes Termos
          de Uso. Caso não concorde com quaisquer disposições aqui previstas, o
          uso da plataforma deve ser imediatamente interrompido.
        </p>

        <h2 className="font-semibold mt-6 mb-2">1. Objetivo da Plataforma</h2>
        <p className="mb-4">
          A Escola Sapiros tem como finalidade oferecer uma visão educacional
          mais ampla e analítica do desempenho dos alunos, indo além da simples
          atribuição de notas, com foco no desenvolvimento e domínio de
          habilidades pedagógicas.
        </p>

        <p className="mb-4">
          A plataforma fornece dashboards e relatórios que auxiliam alunos,
          professores e coordenadores na tomada de decisões educacionais, sem
          substituir avaliações oficiais ou decisões pedagógicas formais.
        </p>

        <h2 className="font-semibold mt-6 mb-2">2. Perfis de Usuário</h2>
        <p className="mb-4">
          A plataforma conta com diferentes perfis de usuário, cada um com
          responsabilidades específicas:
        </p>

        <p className="mb-2">
          <strong>Coordenador:</strong> responsável pela gestão da estrutura da
          plataforma, incluindo cadastro de disciplinas, habilidades, turmas e
          usuários, além da análise de relatórios globais de desempenho.
        </p>

        <p className="mb-2">
          <strong>Professor:</strong> responsável pela alimentação do AVA,
          criação de atividades, associação de questões a habilidades
          específicas, publicação de materiais de apoio e análise do desempenho
          dos alunos.
        </p>

        <p className="mb-4">
          <strong>Aluno:</strong> responsável por consumir os conteúdos
          disponibilizados, realizar atividades e acompanhar seu próprio
          desempenho por meio de painéis individuais.
        </p>

        <h2 className="font-semibold mt-6 mb-2">
          3. Funcionamento do Ciclo de Dados Educacionais
        </h2>
        <p className="mb-4">
          O funcionamento da Escola Sapiros baseia-se em um ciclo mínimo de
          dados educacionais, que compreende as seguintes etapas:
        </p>

        <p className="mb-2">a) Cadastro de habilidades pedagógicas;</p>
        <p className="mb-2">
          b) Criação de atividades pelo professor, associadas às habilidades;
        </p>
        <p className="mb-2">c) Resposta das atividades pelos alunos;</p>
        <p className="mb-2">
          d) Processamento e análise dos resultados por habilidade;
        </p>
        <p className="mb-4">
          e) Apresentação dos dados em dashboards de desempenho.
        </p>

        <h2 className="font-semibold mt-6 mb-2">
          4. Cadastro e Responsabilidade
        </h2>
        <p className="mb-4">
          O usuário compromete-se a fornecer informações verdadeiras, completas
          e atualizadas no momento do cadastro.
        </p>

        <p className="mb-4">
          O usuário é responsável pela confidencialidade de suas credenciais de
          acesso e por todas as atividades realizadas em sua conta.
        </p>

        <h2 className="font-semibold mt-6 mb-2">
          5. Uso Adequado da Plataforma
        </h2>
        <p className="mb-4">
          É expressamente proibido utilizar a plataforma para fins ilegais,
          inserir informações falsas, tentar acessar áreas restritas sem
          autorização, comprometer a segurança do sistema ou realizar qualquer
          ação que prejudique sua integridade.
        </p>

        <p className="mb-4">
          O descumprimento destas regras poderá resultar na suspensão ou
          exclusão da conta do usuário, sem aviso prévio.
        </p>

        <h2 className="font-semibold mt-6 mb-2">
          6. Dados Pessoais e Privacidade
        </h2>
        <p className="mb-4">
          A Escola Sapiros realiza o tratamento de dados pessoais e acadêmicos
          estritamente necessários para o funcionamento da plataforma, em
          conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº
          13.709/2018).
        </p>

        <p className="mb-4">
          Os dados coletados não serão compartilhados com terceiros, exceto
          quando exigido por lei ou mediante consentimento do usuário.
        </p>

        <h2 className="font-semibold mt-6 mb-2">
          7. Disponibilidade e Limitação de Responsabilidade
        </h2>
        <p className="mb-4">
          A plataforma é disponibilizada “como está”, podendo passar por
          manutenções, atualizações ou interrupções temporárias.
        </p>

        <p className="mb-4">
          A Escola Sapiros não se responsabiliza por decisões tomadas com base
          nas informações apresentadas nos dashboards, nem por falhas técnicas
          externas ou uso indevido da plataforma.
        </p>

        <h2 className="font-semibold mt-6 mb-2">8. Alterações dos Termos</h2>
        <p className="mb-4">
          Estes Termos de Uso poderão ser alterados a qualquer momento. A data
          da última atualização estará sempre indicada no início deste
          documento.
        </p>

        <p className="mb-4">
          O uso contínuo da plataforma após alterações implica concordância com
          os novos termos.
        </p>

        <p className="mt-10">
          Em caso de dúvidas ou solicitações relacionadas a estes Termos de Uso,
          entre em contato pelo e-mail:
          <strong> escolasapiros@edu.com.br</strong>
        </p>
      </div>

      {error && (
        <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
      )}
      {success && (
        <p className="text-[#1D5D7F] mt-4 text-center font-medium">{success}</p>
      )}

      <div className="flex items-center mt-6 gap-3">
        <input
          type="checkbox"
          id="concordo"
          disabled={!rolouTudo}
          checked={concordou}
          onChange={(e) => setConcordou(e.target.checked)}
          className="w-5 h-5 text-[#1D5D7F] border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
        />
        <label
          htmlFor="concordo"
          className={`text-sm font-medium ${
            !rolouTudo
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 cursor-pointer"
          }`}
        >
          Li e concordo com os Termos de Uso
        </label>
      </div>

      <button
        onClick={handleAceitar}
        disabled={!concordou}
        className={`mt-8 w-full md:w-auto px-10 py-3 rounded-lg text-white font-medium transition
          ${
            concordou
              ? "bg-[#1D5D7F] hover:bg-[#1D5D7F]/90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Continuar
      </button>
    </div>
  );
}

export default FormTermoUso;

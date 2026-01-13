import { useState, useRef, useEffect } from "react";

function FormTermoUso() {
  const [concordou, setConcordou] = useState(false);
  const [rolouTudo, setRolouTudo] = useState(false);

  const termoRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const el = termoRef.current;
    if (!el) return;

    const chegouNoFinal =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

    if (chegouNoFinal) {
      setRolouTudo(true);
    }
  };

  useEffect(() => {
    const el = termoRef.current;
    if (!el) return;

    if (el.scrollHeight <= el.clientHeight) {
      setRolouTudo(true);
    }
  }, []);

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Termo de Uso
      </h1>

      <div
        ref={termoRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto text-gray-700 text-sm leading-relaxed pr-2 border rounded-md p-4"
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

      <div className="flex items-center mt-4 gap-2">
        <input
          type="checkbox"
          id="concordo"
          disabled={!rolouTudo}
          checked={concordou}
          onChange={(e) => setConcordou(e.target.checked)}
          className="cursor-pointer"
        />
        <label
          htmlFor="concordo"
          className={`text-sm ${
            !rolouTudo ? "text-gray-400" : "text-gray-700"
          }`}
        >
          Li e concordo com os Termos de Uso
        </label>
      </div>

      <button
        disabled={!concordou}
        className={`mt-6 px-6 py-2 rounded-md text-white transition
          ${
            concordou
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
      >
        Continuar
      </button>
    </div>
  );
}

export default FormTermoUso;

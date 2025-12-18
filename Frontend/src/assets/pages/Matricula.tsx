import { useState, type JSX } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import FormAluno from "../components/FormAluno";
import FormResponsavel from "../components/FormResponsavel";
import FormDocumento, {
  type FormDocumentoData,
} from "../components/FormDocumento";

type DadosAluno = {
  nome?: string;
  email?: string;
  cpf?: string;
  serie?: string;
  escola_origem?: string;
  celular?: string;
  data_nascimento?: string;
  sexo?: string;
  rg?: string;
  data_emissao?: string;
  orgao_emissor?: string;
  logradouro?: string;
  numero?: string;
  cep?: string;
  complemento?: string;
  bairro?: string;
  estado?: string;
  cidade?: string;
  nacionalidade?: string;
  naturalidade?: string;
  necessidades_especiais?: string;
  tem_alergia?: string;
  quais_alergias?: string;
  saida_sozinho?: string;
  uso_imagem?: string;
};

type DadosResponsavel = {
  nome?: string;
  email?: string;
  cpf?: string;
  celular?: string;
  data_nascimento?: string;
  sexo?: string;
  nacionalidade?: string;
  naturalidade?: string;
  rg?: string;
  orgao_emissor?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
};

type DadosCompleto = {
  aluno: DadosAluno;
  responsavel: DadosResponsavel;
  documentos: FormDocumentoData | null;
};

function onlyDigits(value?: string) {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

function mapSexoFrontToDto(
  value?: string
): "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO" {
  if (!value) return "NAO_INFORMADO";
  const v = value.toLowerCase();
  if (v.includes("masc")) return "MASCULINO";
  if (v.includes("fem")) return "FEMININO";
  return "OUTRO";
}

function Matricula(): JSX.Element {
  const [etapa, setEtapa] = useState(1);
  const [dadosCompleto, setDadosCompleto] = useState<DadosCompleto>({
    aluno: {},
    responsavel: {},
    documentos: null,
  });
  const [enviando, setEnviando] = useState(false);

  const methods = useForm({ mode: "onBlur" });

  function handleNext(currentStep: number, data: any) {
    if (currentStep === 1) {
      setDadosCompleto((prev) => ({ ...prev, aluno: data }));
      setEtapa(2);
    }
    if (currentStep === 2) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: data }));
      setEtapa(3);
    }
  }

  function handleBack(currentStep: number, data: any) {
    if (currentStep === 2) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: data }));
      setEtapa(1);
    }
    if (currentStep === 3) {
      setDadosCompleto((prev) => ({ ...prev, documentos: data }));
      setEtapa(2);
    }
  }

  function buildPayload(aluno: DadosAluno, responsavel: DadosResponsavel) {
    const payload: any = {
      nome: aluno.nome,
      email: aluno.email,
      cpf: onlyDigits(aluno.cpf),
      telefone: onlyDigits(aluno.celular),
      data_nascimento: aluno.data_nascimento,
      sexo: mapSexoFrontToDto(aluno.sexo),
      role: "aluno",

      serieAno: aluno.serie,
      escolaOrigem: aluno.escola_origem,
      rgNumero: onlyDigits(aluno.rg) || aluno.rg,
      rgDataEmissao: aluno.data_emissao,
      rgOrgaoEmissor: aluno.orgao_emissor,

      enderecoLogradouro: aluno.logradouro,
      enderecoNumero: aluno.numero,
      enderecoCep: onlyDigits(aluno.cep),
      enderecoComplemento: aluno.complemento,
      enderecoBairro: aluno.bairro,
      enderecoEstado: aluno.estado,
      enderecoCidade: aluno.cidade,

      nacionalidade: aluno.nacionalidade,
      naturalidade: aluno.naturalidade,

      possuiNecessidadesEspeciais: !!aluno.necessidades_especiais,
      descricaoNecessidadesEspeciais: aluno.necessidades_especiais,
      possuiAlergias: aluno.tem_alergia === "sim",
      descricaoAlergias: aluno.quais_alergias,
      autorizacaoSaidaSozinho: aluno.saida_sozinho === "sim",
      autorizacaoUsoImagem: aluno.uso_imagem === "sim",

      responsavelNome: responsavel.nome,
      responsavelCpf: onlyDigits(responsavel.cpf),
      responsavelRg: onlyDigits(responsavel.rg) || responsavel.rg,
      responsavelTelefone: onlyDigits(responsavel.celular),
      responsavelEmail: responsavel.email,

      responsavel_Data_Nascimento: responsavel.data_nascimento
        ? new Date(responsavel.data_nascimento).toISOString().split("T")[0]
        : undefined,
      responsavel_sexo: mapSexoFrontToDto(responsavel.sexo),
      responsavel_nacionalidade: responsavel.nacionalidade,
      responsavel_naturalidade: responsavel.naturalidade,
      responsavel_rg_OrgaoEmissor: responsavel.orgao_emissor,
      responsavelCep: onlyDigits(responsavel.cep),
      responsavelLogradouro: responsavel.logradouro,
      responsavelNumero: responsavel.numero,
      responsavelComplemento: responsavel.complemento,
      responsavelBairro: responsavel.bairro,
      responsavelCidade: responsavel.cidade,
      responsavelEstado: responsavel.estado,
    };

    Object.keys(payload).forEach(
      (k) =>
        (payload[k] === undefined || payload[k] === "") && delete payload[k]
    );

    return payload;
  }

  async function handleFinalSubmit() {
    const { aluno, responsavel, documentos } = dadosCompleto;

    if (!aluno.nome) {
      toast.error("Preencha os dados do aluno");
      setEtapa(1);
      return;
    }

    if (!responsavel.nome) {
      toast.error("Preencha os dados do responsável");
      setEtapa(2);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token não encontrado");
      return;
    }

    const payload = buildPayload(aluno, responsavel);

    try {
      setEnviando(true);

      const res = await fetch("http://localhost:3000/alunos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Erro ao criar aluno");
        return;
      }

      const alunoCriado = await res.json();
      const documentacaoId = alunoCriado?.documentacao?.id;

      if (documentacaoId && documentos) {
        for (const [tipo, files] of Object.entries(documentos)) {
          if (files && files.length > 0) {
            const formData = new FormData();
            formData.append("arquivo", files[0]);
            formData.append("tipo", tipo);

            await fetch(
              `http://localhost:3000/documentacao/${documentacaoId}/upload`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );
          }
        }
      }

      toast.success("Matrícula criada com sucesso!");
      setEtapa(1);
      setDadosCompleto({ aluno: {}, responsavel: {}, documentos: null });
    } catch {
      toast.error("Erro de rede");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-auto p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
        <h1 className="text-4xl text-[#1D5D7F]">Matrícula online</h1>

        {etapa === 1 && (
          <FormAluno
            defaultValues={dadosCompleto.aluno}
            onNext={(data) => handleNext(1, data)}
          />
        )}

        {etapa === 2 && (
          <FormResponsavel
            defaultValues={dadosCompleto.responsavel}
            onNext={(data) => handleNext(2, data)}
            onBack={(data) => handleBack(2, data)}
          />
        )}

        {etapa === 3 && (
          <FormDocumento
            onNext={(data) => {
              setDadosCompleto((prev) => ({ ...prev, documentos: data }));
              setEtapa(4);
            }}
            onBack={(data) => {
              setDadosCompleto((prev) => ({ ...prev, documentos: data }));
              setEtapa(2);
            }}
          />
        )}

        {etapa === 4 && (
          <div className="w-full flex justify-center mt-10">
            <div className="w-48">
              <button
                onClick={handleFinalSubmit}
                disabled={enviando}
                className="w-full bg-[#1D5D7F] h-12 sm:h-14 text-white text-lg sm:text-xl font-normal rounded-lg transition duration-200 focus:outline-none focus:ring-4"
              >
                {enviando ? "Enviando..." : "Finalizar matrícula"}
              </button>
            </div>
          </div>
        )}

        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          theme="dark"
        />
      </div>
    </FormProvider>
  );
}

export default Matricula;

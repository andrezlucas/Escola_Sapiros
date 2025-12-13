import { useState, type JSX } from "react";
import FormAluno from "../components/FormAluno";
import FormResponsavel from "../components/FormResponsavel";
import { FormProvider, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
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
  const [etapa, setEtapa] = useState<number>(1);
  const [documentacaoId, setDocumentacaoId] = useState<string | null>(null);

  const methods = useForm({
    mode: "onBlur",
  });

  const [dadosCompleto, setDadosCompleto] = useState<DadosCompleto>({
    aluno: {},
    responsavel: {},
    documentos: null,
  });

  const [enviando, setEnviando] = useState<boolean>(false);

  function handleNext(currentStep: number, data: any) {
    if (currentStep === 1) {
      setDadosCompleto((prev) => ({ ...prev, aluno: data }));
      setEtapa(2);
    } else if (currentStep === 2) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: data }));
      setEtapa(3);
    }
  }

  function handleBack(currentStep: number, data: any) {
    if (currentStep === 2) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: data }));
      setEtapa(1);
    } else if (currentStep === 3) {
      setDadosCompleto((prev) => ({ ...prev, documentos: data }));
      setEtapa(2);
    }
  }

  function buildPayload(aluno: DadosAluno, responsavel: DadosResponsavel) {
    const payload: any = {
      nome: aluno.nome,
      email: aluno.email,
      cpf: onlyDigits(aluno.cpf),
      role: "aluno",
      serieAno: aluno.serie,
      escolaOrigem: aluno.escola_origem,
      telefone: onlyDigits(aluno.celular),
      data_nascimento: aluno.data_nascimento,
      sexo: mapSexoFrontToDto(aluno.sexo),
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
      autorizacaoUsoImagem: aluno.uso_imagem === "sim",

      responsavelNome: responsavel.nome,
      responsavelCpf: onlyDigits(responsavel.cpf),
      responsavelRg: onlyDigits(responsavel.rg) || responsavel.rg,
      responsavelTelefone: onlyDigits(responsavel.celular),
      responsavelEmail: responsavel.email,
      responsavel_nacionalidade: responsavel.nacionalidade,
      responsavel_naturalidade: responsavel.naturalidade,
      responsavel_sexo: mapSexoFrontToDto(responsavel.sexo),
      responsavelCep: onlyDigits(responsavel.cep),
      responsavelLogradouro: responsavel.logradouro,
      responsavelNumero: responsavel.numero,
      responsavelComplemento: responsavel.complemento,
      responsavelBairro: responsavel.bairro,
      responsavelCidade: responsavel.cidade,
      responsavelEstado: responsavel.estado,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    payload.role = "aluno";

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

    const payload = buildPayload(aluno, responsavel);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Token não encontrado");
      return;
    }

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
        toast.error("Erro ao criar aluno");
        return;
      }


      const alunoCriado = await res.json();

      const documentacaoId = alunoCriado?.documentacao?.id;

      if (!documentacaoId) {
        toast.error("Documentação não encontrada para este aluno");
        return;
      }

      if (documentos) {
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

      toast.success("Matrícula criada e documentos enviados!");
      setEtapa(1);
      setDadosCompleto({ aluno: {}, responsavel: {}, documentos: null });
    } catch (err) {
      toast.error("Erro de rede");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full h-auto p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
        <h1 className="text-4xl text-[#1D5D7F]">Matrícula online</h1>

        <div className="flex flex-row gap-4">
          <button
            className={`w-42 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
              etapa === 1
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setEtapa(1)}
          >
            <span className="text-sm font-bold">Dados do aluno</span>
          </button>

          <button
            className={`w-48 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
              etapa === 2
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setEtapa(2)}
          >
            <span className="text-sm font-bold">Dados do responsável</span>
          </button>

          <button
            className={`w-36 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
              etapa === 3
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setEtapa(3)}
          >
            <span className="text-sm font-bold">Documentos</span>
          </button>

          <button
            className={`w-36 h-9 px-5 py-3 rounded-lg shadow flex justify-center items-center ${
              etapa === 4
                ? "bg-[#1D5D7F] text-white"
                : "bg-white text-[#1D5D7F] border-2 border-[#1D5D7F]"
            }`}
            onClick={() => setEtapa(4)}
          >
            <span className="text-sm font-bold">Revisar dados</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-6">
              <div>
                <p className="mt-2 text-sm text-gray-600">
                  Verifique os dados antes de finalizar.
                </p>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-bold">Aluno</h3>
                <p>Nome: {dadosCompleto.aluno?.nome}</p>
                <p>CPF: {dadosCompleto.aluno?.cpf}</p>
                <p>Data nascimento: {dadosCompleto.aluno?.data_nascimento}</p>
                <p>Série/Ano: {dadosCompleto.aluno?.serie}</p>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-bold">Responsável</h3>
                <p>Nome: {dadosCompleto.responsavel?.nome}</p>
                <p>CPF: {dadosCompleto.responsavel?.cpf}</p>
                <p>Telefone: {dadosCompleto.responsavel?.celular}</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEtapa(3)}
                  className="w-40 h-12 sm:h-14 bg-white text-[#1D5D7F] border-2 border-[#1D5D7F] rounded-lg"
                >
                  Voltar
                </button>

                <button
                  onClick={handleFinalSubmit}
                  disabled={enviando}
                  className="w-48 h-12 sm:h-14 bg-[#1D5D7F] text-white rounded-lg"
                >
                  {enviando ? "Enviando..." : "Finalizar matrícula"}
                </button>
              </div>
            </div>
          )}
        </div>

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

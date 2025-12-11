import React, { useState, type JSX } from "react";
import FormAluno from "../components/FormAluno";
import FormResponsavel from "../components/FormResponsavel";
import { toast, ToastContainer } from "react-toastify";

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

type DadosDocumentos = {
  turmasIds?: string[];
};

type DadosCompleto = {
  aluno: DadosAluno;
  responsavel: DadosResponsavel;
  documentos: DadosDocumentos;
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

  const [dadosCompleto, setDadosCompleto] = useState<DadosCompleto>({
    aluno: {},
    responsavel: {},
    documentos: {},
  });

  const [enviando, setEnviando] = useState<boolean>(false);

  function handleNext(data: any) {
    if (etapa === 1) {
      setDadosCompleto((prev) => ({ ...prev, aluno: data }));
    }
    if (etapa === 2) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: data }));
    }
    setEtapa((prev) => prev + 1);
  }

  function handleBack(dataFromForm: any) {
    if (etapa === 2) {
      setDadosCompleto((prev) => ({ ...prev, aluno: dataFromForm }));
      setEtapa(1);
    }
    if (etapa === 3) {
      setDadosCompleto((prev) => ({ ...prev, responsavel: dataFromForm }));
      setEtapa(2);
    }
  }

  function buildPayload(
    alunoRaw: DadosAluno,
    responsavelRaw: DadosResponsavel,
    documentosRaw: DadosDocumentos
  ) {
    const payload: any = {
      nome: alunoRaw.nome || "",
      email: alunoRaw.email || undefined,
      cpf: onlyDigits(alunoRaw.cpf) || "",
      role: "aluno",

      serieAno: alunoRaw.serie || "",
      escolaOrigem: alunoRaw.escola_origem || undefined,
      telefone: onlyDigits(alunoRaw.celular) || undefined,
      data_nascimento: alunoRaw.data_nascimento || undefined,
      sexo: mapSexoFrontToDto(alunoRaw.sexo),
      rgNumero: onlyDigits(alunoRaw.rg) || alunoRaw.rg || "",
      rgDataEmissao: alunoRaw.data_emissao || undefined,
      rgOrgaoEmissor: alunoRaw.orgao_emissor || undefined,
      enderecoLogradouro: alunoRaw.logradouro || "",
      enderecoNumero: alunoRaw.numero || "",
      enderecoCep: onlyDigits(alunoRaw.cep) || "",
      enderecoComplemento: alunoRaw.complemento || undefined,
      enderecoBairro: alunoRaw.bairro || "",
      enderecoEstado: alunoRaw.estado || "",
      enderecoCidade: alunoRaw.cidade || "",
      nacionalidade: alunoRaw.nacionalidade || "",
      naturalidade: alunoRaw.naturalidade || "",

      possuiNecessidadesEspeciais: !!alunoRaw.necessidades_especiais,
      descricaoNecessidadesEspeciais:
        alunoRaw.necessidades_especiais || undefined,

      possuiAlergias:
        alunoRaw.tem_alergia?.toLowerCase() === "sim" ? true : false,
      descricaoAlergias: alunoRaw.quais_alergias || undefined,

      autorizacaoUsoImagem:
        alunoRaw.uso_imagem?.toLowerCase() === "sim" ? true : false,

      responsavelNome: responsavelRaw?.nome,
      responsavel_Data_Nascimento: responsavelRaw?.data_nascimento,
      responsavel_sexo: mapSexoFrontToDto(responsavelRaw?.sexo),
      responsavel_nacionalidade: responsavelRaw?.nacionalidade,
      responsavel_naturalidade: responsavelRaw?.naturalidade,
      responsavelCpf: onlyDigits(responsavelRaw?.cpf),
      responsavelRg: onlyDigits(responsavelRaw?.rg) || responsavelRaw?.rg,
      responsavel_rg_OrgaoEmissor: responsavelRaw?.orgao_emissor,
      responsavelTelefone: onlyDigits(responsavelRaw?.celular),
      responsavelEmail: responsavelRaw?.email,
      responsavelCep: onlyDigits(responsavelRaw?.cep),
      responsavelLogradouro: responsavelRaw?.logradouro,
      responsavelNumero: responsavelRaw?.numero,
      responsavelComplemento: responsavelRaw?.complemento,
      responsavelBairro: responsavelRaw?.bairro,
      responsavelCidade: responsavelRaw?.cidade,
      responsavelEstado: responsavelRaw?.estado,

      turmasIds: documentosRaw?.turmasIds || [],
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null) {
        delete payload[k];
      }
    });

    payload.role = "aluno";

    return payload;
  }

  async function handleFinalSubmit() {
    const aluno = dadosCompleto.aluno;
    const responsavel = dadosCompleto.responsavel;
    const documentos = dadosCompleto.documentos;

    if (!aluno?.nome) {
      alert("Preencha os dados do aluno antes de enviar.");
      setEtapa(1);
      return;
    }
    if (!responsavel?.nome) {
      alert("Preencha os dados do responsável antes de enviar.");
      setEtapa(2);
      return;
    }

    const payload = buildPayload(aluno, responsavel, documentos);
    console.log("PAYLOAD ENVIADO:", payload);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      alert("Token não encontrado. Faça login novamente.");
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

      if (res.ok) {
        const data = await res.json();
        console.log("Aluno criado:", data);
        toast.success("Matrícula finalizada com sucesso!");
        setDadosCompleto({ aluno: {}, responsavel: {}, documentos: {} });
        setEtapa(1);
      } else {
        const text = await res.text();
        console.error("Erro ao criar aluno:", res.status, text);
        toast.error(`Você não tem permissão para criar aluno!`);
      }
    } catch (err) {
      console.error("Erro de rede ao criar aluno:", err);
      toast.error("Erro de rede ao criar aluno.");
    } finally {
      setEnviando(false);
    }
  }

  return (
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
      </div>
      <div className="flex flex-col gap-4">
        {etapa === 1 && (
          <FormAluno defaultValues={dadosCompleto.aluno} onNext={handleNext} />
        )}
        {etapa === 2 && (
          <FormResponsavel
            defaultValues={dadosCompleto.responsavel}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {etapa === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-semibold">Revisar dados</h2>
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
                onClick={() => setEtapa(2)}
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
      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />{" "}
    </div>
  );
}

export default Matricula;

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import FormEditarDocumento, {
  type FormDocumentoData,
} from "../components/FormEditarDocumento";
import { toast } from "react-toastify";

interface Documentacao {
  id: string;
  aluno: {
    id: string;
    usuario: {
      nome: string;
      email: string;
      role: string;
      isBlocked?: boolean;
    };
    documentacao?: {
      id: string;
    };
  };
}

interface EditarDocumentoProps {
  idAluno?: string;
}

function EditarDocumento({ idAluno }: EditarDocumentoProps) {
  const [documentacao, setDocumentacao] = useState<Documentacao | null>(null);
  const methods = useForm<FormDocumentoData>();
  const token = localStorage.getItem("token");

  if (!idAluno) return <p>ID do aluno/documentação não encontrado</p>;

  const fetchDocumentacao = async (): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:3000/documentacao/${idAluno}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao buscar documentação");
      const data = await res.json();
      setDocumentacao(data);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar a documentação do aluno.");
    }
  };

  useEffect(() => {
    fetchDocumentacao();
  }, [idAluno, token]);

  const handleEnviarDocumentos = async (
    data: FormDocumentoData
  ): Promise<void> => {
    if (!documentacao) {
      toast.error("Documentação não carregada.");
      return;
    }

    try {
      for (const [key, value] of Object.entries(data)) {
        if (value && value.length > 0) {
          const formData = new FormData();
          formData.append("arquivo", value[0]);
          formData.append("tipo", key);

          const res = await fetch(
            `http://localhost:3000/documentacao/${documentacao.id}/upload`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          if (!res.ok) throw new Error(`Erro ao enviar arquivo: ${key}`);
        }
      }

      toast.success("Documentos enviados com sucesso!");

      await fetchDocumentacao();
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao enviar os documentos.");
    }
  };

  return (
    <div>
      {documentacao && (
        <FormProvider {...methods}>
          <FormEditarDocumento
            onSubmit={handleEnviarDocumentos}
            onBack={(data) => console.log("Voltar com dados:", data)}
            onAlunoUpdated={fetchDocumentacao}
          />
        </FormProvider>
      )}
    </div>
  );
}

export default EditarDocumento;

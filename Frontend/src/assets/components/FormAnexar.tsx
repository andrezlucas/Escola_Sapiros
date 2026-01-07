import { useEffect, useState } from "react";
import { FormRowMatricula } from "./FormRowMatricula";
import FormTextoMatricula from "./FormTextoMatricula";
import { Input } from "./Input";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

interface Turma {
  id: string;
  nome_turma: string;
}

function FormAnexar() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loadingListas, setLoadingListas] = useState(false);

  const {
    register,
    formState: { errors },
  } = useForm();

  function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  useEffect(() => {
    const fetchListas = async () => {
      setLoadingListas(true);
      try {
        const [turmasRes] = await Promise.all([
          authFetch("http://localhost:3000/professores/turmas"),
        ]);
        setTurmas(await turmasRes.json());
      } catch {
        toast.error("Erro ao carregar turmas e disciplinas");
      } finally {
        setLoadingListas(false);
      }
    };
    fetchListas();
  }, []);
  return (
    <div className="w-full h-full mx-auto">
      <div className="border rounded-xl p-6 flex flex-col gap-6 mb-12">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Fazer upload dos arquivos
        </h1>
        <div className="w-full">
          <div className="space-y-10 w-full">
            <div className="flex flex-col md:flex-row justify-center items-start gap-8 w-full">
              <div className="flex-1 max-w-md">
                <div className="flex flex-col items-center">
                  <FormTextoMatricula
                    className="font-medium text-gray-900 mb-4 text-center w-full"
                    title={"Fazer upload do computador"}
                  >
                    <div className="flex justify-center mt-4 w-full">
                      <Input label={""} type="file" className="w-full" />
                    </div>
                  </FormTextoMatricula>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <div className="flex flex-col items-center">
                  <FormTextoMatricula
                    className="font-medium text-gray-900 mb-4 text-center w-full"
                    title={"Adicionar link externo"}
                  >
                    <div className="flex flex-col gap-3 mt-4 w-full">
                      <Input
                        label={""}
                        type="url"
                        placeholder="Insira o link aqui"
                        className="w-full"
                      />
                      <div className="flex justify-center">
                        <button className="bg-[#1D5D7F] text-white px-6 py-2 rounded-lg hover:bg-[#15435e] transition-colors whitespace-nowrap">
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </FormTextoMatricula>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="flex flex-col gap-6">
              <div className="w-full">
                <h2 className="px-2">Título:</h2>
                <Input
                  label={""}
                  type="text"
                  placeholder="Digite o título"
                  className="w-full border rounded-xl p-6 flex flex-col gap-6 mb-12"
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Turma
                </label>
                <select
                  className="input w-full border border-gray-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-1 text-base placeholder-gray-500"
                  {...register("turmaId", {
                    required: "Selecione uma turma",
                  })}
                  disabled={loadingListas}
                >
                  <option value="">Selecione a turma</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome_turma}
                    </option>
                  ))}
                </select>
                {errors.turmaId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.turmaId.message as string}
                  </span>
                )}
            
                <div className="w-full mr-7 mt-6">
                  <h2 className="px-2">Descrição:</h2>
                  <textarea
                    placeholder="Digite a descrição"
                    className="w-full border rounded-xl p-6 flex flex-col gap-6 mb-12"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button className="px-10 py-2 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#15435e] transition-colors">
                  Inserir
                </button>
                <button className="px-10 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormAnexar;

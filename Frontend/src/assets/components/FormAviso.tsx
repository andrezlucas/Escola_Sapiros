import { useFormContext } from "react-hook-form";
import { Input } from "./Input";
import FormSelect from "./FormSelect";

function FormAviso() {
  const { register } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Título" {...register("nome", { required: true })} />

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição 
        </label>
        <textarea
          {...register("descricao", {
            required: "A descrição é obrigatória",
            minLength: {
              value: 10,
              message: "A descrição deve ter pelo menos 10 caracteres",
            },
          })}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D7E8F] focus:border-[#3D7E8F] resize-y min-h-[120px]"
          placeholder="Digite a descrição completa do aviso..."
        />
      </div>

      <FormSelect
        label="Tipo"
        name="tipo"
        options={[
          { value: "GERAL", label: "Geral" },
          { value: "TURMA", label: "Turma" },
          { value: "INDIVIDUAL", label: "Individual" },
        ]}
      />

      <Input
        label="Data de Início"
        type="date"
        {...register("dataInicio", { required: true })}
      />

      <Input label="Data Final" type="date" {...register("dataFinal")} />

      <FormSelect
        label="Categoria"
        name="categoria"
        options={[
          { value: "ACADEMICO", label: "Acadêmico" },
          { value: "SECRETARIA", label: "Secretaria" },
          { value: "EVENTO", label: "Evento" },
          { value: "URGENTE", label: "Urgente" },
          { value: "FERIADO", label: "Feriado" },
          { value: "TECNOLOGIA", label: "Tecnologia" },
        ]}
      />
    </div>
  );
}

export default FormAviso;

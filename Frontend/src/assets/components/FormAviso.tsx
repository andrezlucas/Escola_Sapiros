import { useFormContext } from "react-hook-form";
import { Input } from "./Input";
import FormSelect from "./FormSelect";

function FormAviso() {
  const { register } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Título" {...register("nome", { required: true })} />

      <Input label="Descrição" {...register("descricao", { required: true })} />

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

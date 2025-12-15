import {
  Controller,
  useFormContext,
  type RegisterOptions,
} from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  rules?: RegisterOptions;
}

export default function FormSelect({
  name,
  label,
  options,
  placeholder = "Selecione",
  className = "",
  rules,
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name as keyof typeof errors];

  return (
    <div className={className}>
      {label && <label className="block text-gray-700 mb-1">{label}</label>}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <select
            {...field}
            className="w-full h-12 px-3 bg-blue-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3d7e8f]"
          >
            <option value="">{placeholder}</option>

            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />

      {fieldError && (
        <span className="text-red-500 text-sm">
          {fieldError.message as string}
        </span>
      )}
    </div>
  );
}

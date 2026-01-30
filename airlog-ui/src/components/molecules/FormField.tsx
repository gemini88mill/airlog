import { Field } from "@headlessui/react";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";

type FormFieldProps = {
  id?: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export const FormField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
}: FormFieldProps) => {
  const inputClassName = `
    w-full px-3 py-3 border border-gray-300 rounded text-base
    text-gray-900 bg-white
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
  `;

  return (
    <Field disabled={disabled} className={`mb-4 ${className}`}>
      <Label required={required}>{label}</Label>
      {type === "date" ? (
        <div className="relative z-[1000]">
          <input
            id={id}
            type="date"
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${inputClassName} relative z-[1001]`}
          />
        </div>
      ) : (
        <Input
          id={id}
          type={
            type as "text" | "email" | "password" | "number" | "tel" | "url"
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
    </Field>
  );
};

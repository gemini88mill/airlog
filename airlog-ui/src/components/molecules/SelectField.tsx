import { Field, Select } from "@headlessui/react";
import { Label } from "../atoms/Label";

type SelectFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = "",
}: SelectFieldProps) => {
  return (
    <Field disabled={disabled} className={`mb-4 ${className}`}>
      <Label required={required}>{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-3 border border-gray-300 rounded text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent data-disabled:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:text-gray-500 data-focus:ring-2 data-focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
};

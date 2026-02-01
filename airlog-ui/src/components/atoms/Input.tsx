import { Input as HeadlessInput } from "@headlessui/react";
import type { ComponentProps } from "react";

type InputProps = {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
} & Omit<ComponentProps<typeof HeadlessInput>, "value" | "onChange" | "type">;

export const Input = ({
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...props
}: InputProps) => {
  return (
    <HeadlessInput
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`
        w-full px-3 py-3 border border-gray-300 rounded text-base
        text-gray-900 bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        data-disabled:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:text-gray-500
        data-focus:ring-2 data-focus:ring-blue-500
        ${className}
      `}
      {...props}
    />
  );
};

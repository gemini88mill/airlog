type LabelProps = {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export const Label = ({
  htmlFor,
  children,
  required = false,
  className = '',
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-2 font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

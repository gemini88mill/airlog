type ErrorMessageProps = {
  message: string;
  className?: string;
};

export const ErrorMessage = ({
  message,
  className = "",
}: ErrorMessageProps) => {
  return (
    <div
      role="alert"
      className={`
        mb-4 p-3 bg-red-50 text-red-700 rounded text-sm
        ${className}
      `}
    >
      {message}
    </div>
  );
};

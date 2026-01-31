type CardProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};

export const Card = ({ children, title, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white p-8 rounded-lg shadow-md w-full max-w-md ${className}`}
    >
      {title && (
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
};

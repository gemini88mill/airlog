import { Label as HeadlessLabel } from '@headlessui/react';
import type { ComponentProps } from 'react';

type LabelProps = {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof HeadlessLabel>, 'children'>;

export const Label = ({
  children,
  required = false,
  className = '',
  ...props
}: LabelProps) => {
  return (
    <HeadlessLabel
      className={`block mb-2 font-medium text-gray-700 data-disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </HeadlessLabel>
  );
};

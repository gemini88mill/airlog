import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { useState } from 'react';
import type { ComponentProps } from 'react';

type ComboboxOption<T> = {
  id: string | number;
  value: T;
  label: string;
  disabled?: boolean;
};

type ComboboxProps<T> = {
  value: T | null;
  onChange: (value: T | null) => void;
  options: ComboboxOption<T>[];
  displayValue?: (value: T | null) => string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
} & Omit<ComponentProps<typeof HeadlessCombobox>, 'value' | 'onChange' | 'children'>;

export const Combobox = <T,>({
  value,
  onChange,
  options,
  displayValue,
  placeholder,
  disabled = false,
  className = '',
  inputClassName = '',
  optionsClassName = '',
  optionClassName = '',
  onQueryChange,
  loading = false,
  emptyMessage = 'No options found',
  ...props
}: ComboboxProps<T>) => {
  const [query, setQuery] = useState('');

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const handleClose = () => {
    setQuery('');
  };

  const getDisplayValue = (val: T | null): string => {
    if (displayValue) {
      return displayValue(val);
    }
    if (val === null) {
      return '';
    }
    const option = options.find((opt) => opt.value === val);
    return option?.label || String(val);
  };

  return (
    <div className={`relative ${className}`}>
      <HeadlessCombobox
        value={value}
        onChange={onChange}
        onClose={handleClose}
        disabled={disabled}
        {...props}
      >
        <ComboboxInput
          placeholder={placeholder}
          displayValue={getDisplayValue}
          onChange={(event) => handleQueryChange(event.target.value)}
          className={`
            w-full px-3 py-3 border border-gray-300 rounded text-base
            text-gray-900 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            data-disabled:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:text-gray-500
            data-focus:ring-2 data-focus:ring-blue-500
            ${inputClassName}
          `}
        />
        <ComboboxOptions
          anchor="bottom"
          className={`
            mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5
            empty:invisible
            ${optionsClassName}
          `}
        >
          {loading && (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
              Loading...
            </div>
          )}
          {!loading && options.length === 0 && query && (
            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
              {emptyMessage}
            </div>
          )}
          {options.map((option) => (
            <ComboboxOption
              key={option.id}
              value={option.value}
              disabled={option.disabled}
              className={`
                relative cursor-default select-none px-4 py-2
                text-gray-900
                data-focus:bg-blue-100 data-focus:text-white
                data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:text-gray-500
                ${optionClassName}
              `}
            >
              {option.label}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </HeadlessCombobox>
    </div>
  );
};

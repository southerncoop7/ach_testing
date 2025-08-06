import React from 'react';

/**
 * Props for the Input component.
 */
type InputProps = {
  /** The label to display above the input field. */
  label?: string;
  /** An error message to display below the input field. */
  error?: string;
  /** The current value of the input field. */
  value: string;
  /** The function to call when the input value changes. */
  onChange: (value: string) => void;
  /** The placeholder text to display in the input field. */
  placeholder?: string;
  /** The type of the input field. */
  type?: 'text' | 'email' | 'password' | 'number';
  /** Additional CSS classes to apply to the input container. */
  className?: string;
  /** The id of the input field. */
  id?: string;
};

/**
 * A reusable input field component with a label and error message.
 * It provides consistent styling for form inputs across the application.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  id,
}) => {
  const baseStyles =
    'w-full px-3 py-2 rounded-[4px] font-normal text-base bg-white border focus:outline-none transition-all duration-150 text-[#5B6770] placeholder:text-[#5B6770] placeholder:opacity-60 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:border-gray-600';
  
  const focusStyles =
    'focus:border-[#3EB1C8] focus:ring-2 focus:ring-[#3EB1C8]/20';
  
  const errorStyles =
    'border-[#DD0033] focus:border-[#DD0033] focus:ring-2 focus:ring-[#DD0033]/20';
  
  const normalStyles = `border-[#DAD7D2] ${focusStyles} dark:border-gray-600`;

  const inputClasses = `${baseStyles} ${error ? errorStyles : normalStyles}`;

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#5B6770] dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <p id={error ? `${inputId}-error` : undefined} className="text-sm text-[#DD0033] dark:text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
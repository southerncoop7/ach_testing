import React from 'react';

/**
 * Represents a single option in the select dropdown.
 */
type Option = {
  label: string;
  value: string;
};

/**
 * Props for the Select component.
 */
type SelectProps = {
  /** The label to display above the select field. */
  label?: string;
  /** An array of options to display in the dropdown. */
  options: Option[];
  /** The currently selected value. */
  value: string;
  /** The function to call when the selected value changes. */
  onChange: (value: string) => void;
  /** The placeholder text to display when no option is selected. */
  placeholder?: string;
  /** An error message to display below the select field. */
  error?: string;
  /** Additional CSS classes to apply to the select container. */
  className?: string;
  /** The id of the select field. */
  id?: string;
};

/**
 * A reusable select (dropdown) component with a label and error message.
 * It provides consistent styling for form dropdowns across the application.
 */
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  className = '',
  id,
}) => {
  const baseStyles =
    'w-full px-3 py-2 rounded-[4px] font-normal text-base bg-white border focus:outline-none transition-all duration-150 text-[#5B6770] disabled:opacity-60 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-8 dark:bg-gray-700 dark:text-white dark:border-gray-600';
  
  const focusStyles =
    'focus:border-[#004F71] focus:ring-2 focus:ring-[#004F71]/20';
  
  const errorStyles =
    'border-[#DD0033] focus:border-[#DD0033] focus:ring-2 focus:ring-[#DD0033]/20';
  
  const normalStyles = `border-[#DAD7D2] ${focusStyles} dark:border-gray-600`;

  const selectClasses = `${baseStyles} ${error ? errorStyles : normalStyles}`;

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // SVG for the dropdown arrow
  const dropdownIcon = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%235B6770' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;
  const dropdownIconDark = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23FFFFFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#5B6770] dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={selectClasses}
          style={{ backgroundImage: `var(--icon-url, ${dropdownIcon})`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          onMouseEnter={(e) => e.currentTarget.style.setProperty('--icon-url', document.documentElement.classList.contains('dark') ? dropdownIconDark : dropdownIcon)}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={error ? `${selectId}-error` : undefined} className="text-sm text-[#DD0033] dark:text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
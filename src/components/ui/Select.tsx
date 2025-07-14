import React from 'react';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
}) => {
  // Design system values:
  // Default: bg-white, border-[#DAD7D2], rounded-[4px], text-[#5B6770]
  // Focus: border-[#004F71], ring-[#004F71]/20
  // Error: border-[#DD0033], ring-[#DD0033]/20
  // Font: Apercu (set globally), font-normal, text-base
  // Spacing: px-3 py-2
  // Disabled: opacity-60, cursor-not-allowed
  const base =
    'w-full px-3 py-2 rounded-[4px] font-normal text-base bg-white border focus:outline-none transition-all duration-150 text-[#5B6770] disabled:opacity-60 disabled:cursor-not-allowed';
  const focus =
    'focus:border-[#004F71] focus:ring-2 focus:ring-[#004F71]/20';
  const errorClass =
    'border-[#DD0033] focus:border-[#DD0033] focus:ring-2 focus:ring-[#DD0033]/20';
  const normalClass =
    'border-[#DAD7D2] ' + focus;
  const selectClass = `${base} ${error ? errorClass : normalClass}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[#5B6770]">
          {label}
        </label>
      )}
      <select
        className={selectClass}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-[#DD0033]" id={label ? `${label}-error` : undefined}>{error}</p>
      )}
    </div>
  );
};

export default Select; 
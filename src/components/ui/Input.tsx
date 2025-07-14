import React from 'react';

type InputProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => {
  // Design system values from Design.JSON:
  // Default: bg-white, border-[#DAD7D2], rounded-[4px], text-[#5B6770], placeholder-[#5B6770]/60
  // Focus: border-[#3EB1C8], ring-[#3EB1C8]/20
  // Error: border-[#DD0033], ring-[#DD0033]/20
  // Font: Apercu (set globally), font-normal, text-base
  // Spacing: px-3 py-2
  // Disabled: opacity-60, cursor-not-allowed
  const base =
    'w-full px-3 py-2 rounded-[4px] font-normal text-base bg-white border focus:outline-none transition-all duration-150 text-[#5B6770] placeholder:text-[#5B6770] placeholder:opacity-60 disabled:opacity-60 disabled:cursor-not-allowed';
  const focus =
    'focus:border-[#3EB1C8] focus:ring-2 focus:ring-[#3EB1C8]/20';
  const errorClass =
    'border-[#DD0033] focus:border-[#DD0033] focus:ring-2 focus:ring-[#DD0033]/20';
  const normalClass =
    'border-[#DAD7D2] ' + focus;
  const inputClass = `${base} ${error ? errorClass : normalClass}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[#5B6770]">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p className="text-sm text-[#DD0033]" id={label ? `${label}-error` : undefined}>{error}</p>
      )}
    </div>
  );
};

export default Input; 
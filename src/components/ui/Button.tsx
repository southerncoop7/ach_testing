import React from 'react';

// Apercu is set globally in Tailwind config, so no need to set fontFamily here

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  onClick,
  disabled = false,
  children,
  className = '',
}) => {
  // Design system values
  // Primary: bg-[#3EB1C8], text-white, rounded-[6px], shadow, hover:bg-[#00635B], hover:shadow-lg
  // Secondary: bg-white, text-[#3EB1C8], border border-[#3EB1C8], rounded-[6px], hover:bg-[#3EB1C8] hover:text-white
  // Font: semibold, Apercu (set globally)
  // Spacing: px-4 py-2
  // Focus: ring-2 ring-[#3EB1C8] ring-offset-2
  // Disabled: opacity-60, cursor-not-allowed
  const base =
    'px-4 py-2 rounded-[6px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3EB1C8] focus:ring-offset-2 transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';
  const primary =
    'bg-[#3EB1C8] text-white shadow-[0_2px_4px_rgba(62,177,200,0.2)] hover:bg-[#00635B] hover:shadow-[0_4px_8px_rgba(62,177,200,0.3)] active:bg-[#00635B] active:translate-y-[1px] border-none';
  const secondary =
    'bg-white text-[#3EB1C8] border border-[#3EB1C8] hover:bg-[#3EB1C8] hover:text-white';
  const variantClass = variant === 'primary' ? primary : secondary;
  return (
    <button
      type="button"
      className={`${base} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button; 
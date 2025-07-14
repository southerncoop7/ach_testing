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
  // Updated to use HEX #004F71 for all blue backgrounds and fonts
  // Primary: bg-[#004F71], text-white, rounded-[6px], shadow, hover:bg-[#00344A], hover:shadow-lg
  // Secondary: bg-white, text-[#004F71], border border-[#004F71], rounded-[6px], hover:bg-[#004F71] hover:text-white
  // Font: semibold, Apercu (set globally)
  // Spacing: px-4 py-2
  // Focus: ring-2 ring-[#004F71] ring-offset-2
  // Disabled: opacity-60, cursor-not-allowed
  const base =
    'px-4 py-2 rounded-[6px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#004F71] focus:ring-offset-2 transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';
  const primary =
    'bg-[#004F71] text-white shadow-[0_2px_4px_rgba(0,79,113,0.2)] hover:bg-[#00344A] hover:shadow-[0_4px_8px_rgba(0,79,113,0.3)] active:bg-[#00344A] active:translate-y-[1px] border-none';
  const secondary =
    'bg-white text-[#004F71] border border-[#004F71] hover:bg-[#004F71] hover:text-white';
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
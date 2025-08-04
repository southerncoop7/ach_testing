import React from 'react';

/**
 * Props for the Button component.
 */
type ButtonProps = {
  /** The visual style of the button. */
  variant?: 'primary' | 'secondary' | 'danger';
  /** The function to call when the button is clicked. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** The content to display inside the button. */
  children: React.ReactNode;
  /** Additional CSS classes to apply to the button. */
  className?: string;
  /** The size of the button. */
  size?: 'sm' | 'md' | 'lg';
};

/**
 * A reusable button component with different variants and sizes.
 * It provides consistent styling for buttons across the application.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  className = '',
}) => {
  const baseStyles =
    'rounded-[6px] font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: 'bg-[#004F71] text-white shadow-[0_2px_4px_rgba(0,79,113,0.2)] hover:bg-[#00344A] hover:shadow-[0_4px_8px_rgba(0,79,113,0.3)] active:bg-[#00344A] active:translate-y-[1px] border-none focus:ring-[#004F71]',
    secondary: 'bg-white text-[#004F71] border border-[#004F71] hover:bg-[#004F71] hover:text-white focus:ring-[#004F71]',
    danger: 'bg-red-600 text-white shadow-[0_2px_4px_rgba(220,53,69,0.2)] hover:bg-red-700 hover:shadow-[0_4px_8px_rgba(220,53,69,0.3)] active:bg-red-800 active:translate-y-[1px] border-none focus:ring-red-500',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
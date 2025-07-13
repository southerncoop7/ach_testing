import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  onClick,
  disabled = false,
  children,
}) => {
  const base = 'px-4 py-2 rounded font-semibold focus:outline-none transition';
  const styles =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100';
  return (
    <button
      type="button"
      className={`${base} ${styles}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button; 
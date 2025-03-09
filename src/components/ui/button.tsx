import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'small' | 'medium';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  onClick,
  disabled = false,
  children,
  variant = 'primary',
  size = 'small',
  type = 'button',
  ...props
}: ButtonProps): JSX.Element {
  const baseStyle =
    size === 'small'
      ? 'px-3 py-1 text-sm font-bold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed'
      : 'px-6 py-3 text-base font-bold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 hover:bg-blue-700',
    secondary: 'bg-green-500 hover:bg-green-700',
    danger: 'bg-red-500 hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

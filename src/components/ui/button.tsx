import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'smart';
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
  // Base styles for non-smart variants
  const baseStyle =
    size === 'small'
      ? 'px-3 py-1 text-sm font-bold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed'
      : 'px-6 py-3 text-base font-bold rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 hover:bg-blue-700',
    secondary: 'bg-green-500 hover:bg-green-700',
    danger: 'bg-red-500 hover:bg-red-700',
    smart:
      'border border-gray-400 text-sm text-black bg-white rounded px-3 py-1 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed',
  };

  // If variant is "smart", ignore baseStyle and size
  const computedClassName =
    variant === 'smart'
      ? variantStyles.smart
      : `${baseStyle} ${variantStyles[variant]}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={computedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

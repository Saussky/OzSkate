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
  /**
   * Common sizing classes. We still apply these for all variants
   * except 'smart' can also honor them if you wish; you can remove
   * them if you want 'smart' to ignore size as before.
   */
  const sizeClasses =
    size === 'small' ? 'px-3 py-1 text-sm' : 'px-6 py-3 text-base';

  /**
   * Shared base styles for non-smart variants:
   * - White background
   * - Rounded corners
   * - Transition
   * - Disabled state
   */
  const baseStyle = `
    ${sizeClasses}
    rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-white
  `;

  /**
   * Variant-specific styles for a more "smart" outline look:
   * - A colored border
   * - Matching colored text
   * - Hover background fill
   */
  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      border border-blue-500 text-sm text-blue-500
      hover:bg-blue-500 hover:text-white
    `,
    secondary: `
      border border-green-500 text-green-500 
      hover:bg-green-500 hover:text-white
    `,
    danger: `
      border border-red-500 text-red-500
      hover:bg-red-500 hover:text-white
    `,
    /**
     * The original 'smart' variant is unchanged.
     * It ignores the size classes by design.
     */
    smart: `
      border border-gray-400 text-sm text-black bg-white 
      rounded px-3 py-1 hover:cursor-pointer
      disabled:bg-gray-400 disabled:cursor-not-allowed
    `,
  };

  /**
   * If the variant is 'smart', we ignore the 'baseStyle' to preserve
   * the exact styling. Otherwise, we combine the base style with
   * the chosen variant style.
   */
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

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'upgrade' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 ease-out border-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-primary/50
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary to-primary-dark text-white
      shadow-lg shadow-primary/30
      hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5
      active:translate-y-0
    `,
    secondary: `
      bg-dark-secondary text-white border border-border-custom
      hover:bg-dark-tertiary hover:border-primary
    `,
    upgrade: `
      bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold
      shadow-lg shadow-amber-400/30
      hover:shadow-xl hover:shadow-amber-400/40 hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-gray-400 hover:text-white hover:bg-dark-secondary
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  );
}
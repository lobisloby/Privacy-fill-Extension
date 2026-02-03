import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'free' | 'premium' | 'pro';
  className?: string;
}

export function Badge({ children, variant = 'free', className = '' }: BadgeProps) {
  const variants = {
    free: 'bg-dark-tertiary text-gray-400 border border-border-custom',
    premium: 'bg-gradient-to-r from-amber-400 to-amber-500 text-black',
    pro: 'bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[9px] px-1.5 py-0.5',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full 
        text-xs font-semibold uppercase tracking-wide
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
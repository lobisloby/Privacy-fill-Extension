import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'upgrade';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variants = {
    default: 'bg-dark-card border border-border-custom',
    upgrade: 'bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30',
  };

  return (
    <div className={`rounded-2xl p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
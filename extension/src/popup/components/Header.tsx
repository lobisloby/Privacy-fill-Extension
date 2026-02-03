import React from 'react';
import { Badge } from './ui/Badge';
import { useApp } from '@/context/AppContext';

export function Header() {
  const { isPremium } = useApp();

  return (
    <header className="flex justify-between items-center pb-4 mb-4 border-b border-border-custom">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🛡️</span>
        <span className="text-lg font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          PrivacyFill
        </span>
      </div>
      <Badge variant={isPremium ? 'premium' : 'free'}>
        {isPremium ? 'PREMIUM' : 'FREE'}
      </Badge>
    </header>
  );
}
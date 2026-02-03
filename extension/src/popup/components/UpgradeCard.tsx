import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useApp } from '@/context/AppContext';

export function UpgradeCard() {
  const { isPremium, upgrade } = useApp();

  if (isPremium) return null;

  const features = [
    'Unlimited identities',
    'Auto-generated bios',
    'Real temp email inbox',
    'Identity history',
  ];

  return (
    <Card variant="upgrade" className="mb-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">👑</span>
        <span className="font-bold">Go Premium</span>
      </div>
      
      <ul className="text-sm text-gray-300 space-y-1.5 mb-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="text-accent">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <Button
        onClick={upgrade}
        variant="upgrade"
        className="w-full"
      >
        Upgrade - $4.99/month
      </Button>
    </Card>
  );
}
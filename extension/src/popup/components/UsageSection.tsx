import React from 'react';
import { useApp } from '@/context/AppContext';
import { FREE_LIMIT } from '@/utils/constants';

export function UsageSection() {
  const { usageCount, isPremium } = useApp();

  if (isPremium) return null;

  const percentage = Math.min((usageCount / FREE_LIMIT) * 100, 100);
  const isNearLimit = usageCount >= FREE_LIMIT - 2;

  return (
    <div className="mb-4 animate-fade-in">
      <div className="h-1.5 bg-dark-tertiary rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit 
              ? 'bg-gradient-to-r from-amber-500 to-red-500' 
              : 'bg-gradient-to-r from-accent to-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-center">
        <span className={isNearLimit ? 'text-amber-400 font-medium' : ''}>
          {usageCount}
        </span>
        /{FREE_LIMIT} free identities this month
      </p>
    </div>
  );
}
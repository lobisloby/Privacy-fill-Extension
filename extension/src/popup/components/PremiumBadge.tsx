import React from 'react';
import { useApp } from '@/context/AppContext';

export function PremiumBadge() {
  const { isPremium, manageSubscription } = useApp();

  if (!isPremium) return null;

  return (
    <div className="text-center py-4 animate-bounce-in">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-3">
        <span>👑</span>
        <span>Premium Active</span>
      </div>
      <button 
        onClick={manageSubscription}
        className="block mx-auto text-primary-light text-sm hover:underline"
      >
        Manage Subscription
      </button>
    </div>
  );
}
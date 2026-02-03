import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useApp } from '@/context/AppContext';

interface FieldProps {
  label: string;
  value: string;
  onCopy: () => void;
  isPro?: boolean;
  isLocked?: boolean;
}

function Field({ label, value, onCopy, isPro, isLocked }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${isLocked ? 'opacity-50' : ''}`}>
      <label className="text-xs text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1">
        {label}
        {isPro && <Badge variant="pro">PRO</Badge>}
      </label>
      <div className="flex items-center justify-between gap-2 bg-dark-secondary px-3 py-2.5 rounded-lg border border-border-custom">
        <span className="text-sm text-white break-all flex-1">
          {value}
        </span>
        <button 
          onClick={onCopy}
          className="p-1 opacity-50 hover:opacity-100 transition-opacity"
          title="Copy"
        >
          📋
        </button>
      </div>
    </div>
  );
}

export function IdentityCard() {
  const { currentIdentity, isPremium, copyToClipboard } = useApp();

  const handleCopyAll = () => {
    if (!currentIdentity) return;
    
    const text = `
Name: ${currentIdentity.fullName}
Email: ${currentIdentity.email}
Username: ${currentIdentity.username}
${currentIdentity.bio ? `Bio: ${currentIdentity.bio}` : ''}
    `.trim();
    
    copyToClipboard(text);
  };

  return (
    <Card className="mb-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Current Identity
        </span>
        <button 
          onClick={handleCopyAll}
          className="p-1 opacity-60 hover:opacity-100 transition-opacity"
          title="Copy All"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <Field
          label="Email"
          value={currentIdentity?.email || 'Click generate to create'}
          onCopy={() => currentIdentity && copyToClipboard(currentIdentity.email)}
        />
        <Field
          label="Name"
          value={currentIdentity?.fullName || '-'}
          onCopy={() => currentIdentity && copyToClipboard(currentIdentity.fullName)}
        />
        <Field
          label="Username"
          value={currentIdentity?.username || '-'}
          onCopy={() => currentIdentity && copyToClipboard(currentIdentity.username)}
        />
        <Field
          label="Bio"
          value={currentIdentity?.bio || (isPremium ? '-' : 'Upgrade to Premium')}
          onCopy={() => currentIdentity?.bio && copyToClipboard(currentIdentity.bio)}
          isPro
          isLocked={!isPremium}
        />
      </div>
    </Card>
  );
}
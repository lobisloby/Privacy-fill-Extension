import React from 'react';
import { Button } from './ui/Button';
import { useApp } from '@/context/AppContext';

export function ActionButtons() {
  const { generateIdentity, autoFill, isLoading } = useApp();

  return (
    <div className="flex flex-col gap-3 mb-4">
      <Button
        onClick={generateIdentity}
        isLoading={isLoading}
        leftIcon={<span>⚡</span>}
        size="lg"
        className="w-full"
      >
        Generate New Identity
      </Button>
      
      <Button
        onClick={autoFill}
        variant="secondary"
        leftIcon={<span>✨</span>}
        className="w-full"
      >
        Auto-Fill This Page
      </Button>
    </div>
  );
}
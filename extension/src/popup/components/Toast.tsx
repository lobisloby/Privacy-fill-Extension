import React from 'react';
import { useApp } from '@/context/AppContext';

export function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-xl shadow-xl text-sm font-medium
            animate-slide-up flex items-center gap-2 bg-dark-tertiary
            ${toast.type === 'success' ? 'border-l-4 border-accent' : ''}
            ${toast.type === 'error' ? 'border-l-4 border-red-500' : ''}
            ${toast.type === 'warning' ? 'border-l-4 border-amber-500' : ''}
            ${toast.type === 'info' ? 'border-l-4 border-primary' : ''}
          `}
        >
          <span>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
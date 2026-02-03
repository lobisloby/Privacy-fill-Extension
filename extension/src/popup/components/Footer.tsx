import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto pt-4 border-t border-border-custom">
      <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
        <button className="hover:text-primary-light transition-colors">
          Settings
        </button>
        <span>•</span>
        <button className="hover:text-primary-light transition-colors">
          History
        </button>
        <span>•</span>
        <button className="hover:text-primary-light transition-colors">
          Help
        </button>
      </div>
    </footer>
  );
}
import React from 'react';
import { useApp } from '@/context/AppContext';

export function UserInfo() {
  const { user, signOut } = useApp();

  if (!user) return null;

  const avatarUrl = user.picture || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`;

  return (
    <div className="flex items-center gap-3 mb-4 p-3 bg-dark-secondary rounded-xl animate-fade-in">
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{user.name}</div>
        <div className="text-xs text-gray-400 truncate">{user.email}</div>
      </div>
      <button 
        onClick={signOut}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Sign Out"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </div>
  );
}
import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from './components/Header';
import { AuthSection } from './components/AuthSection';
import { UserInfo } from './components/UserInfo';
import { IdentityCard } from './components/IdentityCard';
import { ActionButtons } from './components/ActionButtons';
import { UsageSection } from './components/UsageSection';
import { UpgradeCard } from './components/UpgradeCard';
import { PremiumBadge } from './components/PremiumBadge';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

function AppContent() {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[520px] bg-dark-primary">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🛡️</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[520px] p-4 bg-dark-primary">
      <Header />
      
      {!user ? (
        <AuthSection />
      ) : (
        <div className="flex-1 flex flex-col">
          <UserInfo />
          <IdentityCard />
          <ActionButtons />
          <UsageSection />
          <UpgradeCard />
          <PremiumBadge />
        </div>
      )}
      
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
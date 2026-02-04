// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Identity {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  bio: string | null;
  password: string;
  // New: Email account credentials for checking inbox
  emailAccountId?: string;
  emailAccountToken?: string;
}

export interface Email {
  id: string;
  from: {
    address: string;
    name: string;
  };
  subject: string;
  intro: string;
  text?: string;
  html?: string[];
  createdAt: string;
}

export interface AppState {
  isPremium: boolean;
  licenseKey: string | null;
  usageCount: number;
  lastResetDate: string;
  currentIdentity: Identity | null;
  identityHistory: Identity[];
}

export type ToastType = 'success' | 'error' | 'info';
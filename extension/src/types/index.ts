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
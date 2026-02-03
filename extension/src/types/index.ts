// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Identity {
  id: string;
  createdAt: string;
  
  // Basic info
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Email
  email: string;
  emailPassword: string | null;
  emailToken: string | null;
  emailId: string | null;
  
  // Username
  username: string;
  
  // Premium features
  bio: string | null;
  
  // Metadata
  isPremium: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt?: string;
}

export interface Subscription {
  status: SubscriptionStatus;
  plan: 'free' | 'premium' | null;
  expiresAt: string | null;
  lemonSqueezyId: string | null;
  subscriptionId?: string;
  customerId?: string;
  cancelledAt?: string;
  endsAt?: string;
}

export type SubscriptionStatus = 'free' | 'active' | 'cancelled' | 'expired';

export interface UsageData {
  count: number;
  limit: number;
  resetDate: string;
}

export interface StorageData {
  user: User | null;
  subscription: Subscription | null;
  currentIdentity: Identity | null;
  usageCount: number;
  lastResetDate: string | null;
  identityHistory: Identity[];
}

export interface TempEmailResponse {
  email: string;
  password: string | null;
  id: string | null;
  token: string | null;
}

// Message types for communication between scripts
export type MessageAction = 
  | 'AUTOFILL'
  | 'GENERATE_IDENTITY'
  | 'GET_IDENTITY'
  | 'CHECK_SUBSCRIPTION'
  | 'SIGN_IN'
  | 'SIGN_OUT';

// Generic Message type with payload
export interface Message<T = unknown> {
  action: MessageAction;
  payload?: T;
}

// Message with specific payload types
export type AutoFillMessage = Message<Identity>;
export type GenerateIdentityMessage = Message<{ isPremium: boolean }>;

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// App State
export interface AppState {
  user: User | null;
  subscription: Subscription | null;
  currentIdentity: Identity | null;
  usageCount: number;
  isLoading: boolean;
  isPremium: boolean;
}
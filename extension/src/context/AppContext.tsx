// ============================================
// APP CONTEXT
// ============================================

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { User, Subscription, Identity, Toast, AppState } from '@/types';
import { storage } from '@/utils/storage';
import { authService } from '@/services/auth';
import { apiService } from '@/services/api';
import { identityGenerator } from '@/services/identity-generator';
import { FREE_LIMIT, LEMON_SQUEEZY } from '@/utils/constants';

// ============================================
// STATE & ACTIONS
// ============================================

interface State extends AppState {
  toasts: Toast[];
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null }
  | { type: 'SET_IDENTITY'; payload: Identity | null }
  | { type: 'SET_USAGE'; payload: number }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'RESET' };

const initialState: State = {
  user: null,
  subscription: null,
  currentIdentity: null,
  usageCount: 0,
  isLoading: true,
  isPremium: false,
  toasts: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SUBSCRIPTION':
      return { 
        ...state, 
        subscription: action.payload,
        isPremium: action.payload?.status === 'active'
      };
    case 'SET_IDENTITY':
      return { ...state, currentIdentity: action.payload };
    case 'SET_USAGE':
      return { ...state, usageCount: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    case 'RESET':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AppContextType extends State {
  // Auth
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Identity
  generateIdentity: () => Promise<void>;
  autoFill: () => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  
  // Subscription
  upgrade: () => void;
  manageSubscription: () => void;
  
  // Toast
  showToast: (message: string, type?: Toast['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ============================================
  // INITIALIZE
  // ============================================

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check and reset monthly usage
      await storage.checkAndResetMonthlyUsage();

      // Load stored data
      const [user, subscription, identity, usageCount] = await Promise.all([
        storage.getUser(),
        storage.getSubscription(),
        storage.getCurrentIdentity(),
        storage.getUsageCount(),
      ]);

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
      dispatch({ type: 'SET_IDENTITY', payload: identity });
      dispatch({ type: 'SET_USAGE', payload: usageCount });

      // Set identity in generator
      if (identity) {
        identityGenerator.setCurrentIdentity(identity);
      }

      // Verify subscription with backend
      if (user) {
        const freshSubscription = await apiService.getSubscriptionStatus(user.id);
        if (freshSubscription) {
          dispatch({ type: 'SET_SUBSCRIPTION', payload: freshSubscription });
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ============================================
  // TOAST
  // ============================================

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, []);

  // ============================================
  // AUTH
  // ============================================

  const signIn = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authService.signInWithGoogle();
      dispatch({ type: 'SET_USER', payload: user });
      
      // Get subscription status
      const subscription = await apiService.getSubscriptionStatus(user.id);
      if (subscription) {
        dispatch({ type: 'SET_SUBSCRIPTION', payload: subscription });
      }

      showToast('Signed in successfully!', 'success');
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('Sign in failed. Please try again.', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'RESET' });
      showToast('Signed out successfully', 'success');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Sign out failed', 'error');
    }
  };

  // ============================================
  // IDENTITY
  // ============================================

  const generateIdentity = async () => {
    // Check free tier limit
    if (!state.isPremium && state.usageCount >= FREE_LIMIT) {
      showToast(`Free limit reached! Upgrade to Premium.`, 'error');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const identity = await identityGenerator.generateIdentity(state.isPremium);
      
      // Save to storage
      await storage.setCurrentIdentity(identity);
      dispatch({ type: 'SET_IDENTITY', payload: identity });

      // Increment usage for free users
      if (!state.isPremium) {
        const newCount = await storage.incrementUsage();
        dispatch({ type: 'SET_USAGE', payload: newCount });
      }

      showToast('New identity generated!', 'success');
    } catch (error) {
      console.error('Error generating identity:', error);
      showToast('Failed to generate identity', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const autoFill = async () => {
    if (!state.currentIdentity) {
      showToast('Generate an identity first!', 'error');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      await chrome.tabs.sendMessage(tab.id, {
        action: 'AUTOFILL',
        payload: state.currentIdentity
      });

      showToast('Form filled successfully!', 'success');
    } catch (error) {
      console.error('Error auto-filling:', error);
      showToast('No form found on this page', 'error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Failed to copy', 'error');
    }
  };

  // ============================================
  // SUBSCRIPTION
  // ============================================

  const upgrade = () => {
    if (!state.user) {
      showToast('Please sign in first', 'error');
      return;
    }

    const checkoutUrl = LEMON_SQUEEZY.CHECKOUT_URL(state.user.id, state.user.email);
    chrome.tabs.create({ url: checkoutUrl });
  };

  const manageSubscription = () => {
    chrome.tabs.create({ url: LEMON_SQUEEZY.BILLING_URL });
  };

  // ============================================
  // RENDER
  // ============================================

  const value: AppContextType = {
    ...state,
    signIn,
    signOut,
    generateIdentity,
    autoFill,
    copyToClipboard,
    upgrade,
    manageSubscription,
    showToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
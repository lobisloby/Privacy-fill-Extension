// ============================================
// CONSTANTS
// ============================================

import config from '@/config/env';

// Free tier limit
export const FREE_LIMIT = 10;

// Firebase API URL
export const API_BASE_URL = config.FIREBASE_API_URL;

// Lemon Squeezy Configuration
export const LEMON_SQUEEZY = {
  // Generate checkout URL with user data
  CHECKOUT_URL: (userId: string, email: string) => {
    const baseUrl = `https://${config.LEMON_SQUEEZY_STORE_SLUG}.lemonsqueezy.com`;
    const variantId = config.LEMON_SQUEEZY_VARIANT_ID;
    const params = new URLSearchParams({
      'checkout[custom][user_id]': userId,
      'checkout[email]': email,
    });
    return `${baseUrl}/checkout/buy/${variantId}?${params.toString()}`;
  },
  
  // Customer billing portal
  BILLING_URL: `https://${config.LEMON_SQUEEZY_STORE_SLUG}.lemonsqueezy.com/billing`,
};

// Google OAuth
export const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID;

// Temp Email API
export const TEMP_EMAIL_API = 'https://api.mail.tm';

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  SUBSCRIPTION: 'subscription',
  CURRENT_IDENTITY: 'currentIdentity',
  USAGE_COUNT: 'usageCount',
  LAST_RESET_DATE: 'lastResetDate',
  IDENTITY_HISTORY: 'identityHistory',
} as const;
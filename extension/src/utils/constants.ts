// ============================================
// CONSTANTS
// ============================================

export const FREE_LIMIT = 10;

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://YOUR_FIREBASE_URL';

export const LEMON_SQUEEZY = {
  STORE_URL: 'https://YOUR_STORE.lemonsqueezy.com',
  PRODUCT_ID: 'YOUR_PRODUCT_ID',
  CHECKOUT_URL: (userId: string, email: string) => 
    `https://YOUR_STORE.lemonsqueezy.com/checkout/buy/YOUR_PRODUCT_ID?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(email)}`,
  BILLING_URL: 'https://YOUR_STORE.lemonsqueezy.com/billing',
};

export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export const TEMP_EMAIL_API = 'https://api.mail.tm';

export const STORAGE_KEYS = {
  USER: 'user',
  SUBSCRIPTION: 'subscription',
  CURRENT_IDENTITY: 'currentIdentity',
  USAGE_COUNT: 'usageCount',
  LAST_RESET_DATE: 'lastResetDate',
  IDENTITY_HISTORY: 'identityHistory',
} as const;
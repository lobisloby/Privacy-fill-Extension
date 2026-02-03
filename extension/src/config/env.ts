// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

// These are placeholders - replace with your actual values
// OR use environment variables in production

interface EnvConfig {
  // Firebase
  FIREBASE_API_URL: string;
  
  // Lemon Squeezy
  LEMON_SQUEEZY_STORE_SLUG: string;
  LEMON_SQUEEZY_VARIANT_ID: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID: string;
}

// Default values for development
// ⚠️ Replace these with your actual values before building for production
const config: EnvConfig = {
  // Firebase - You'll get this after deploying Firebase Functions
  FIREBASE_API_URL: 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net',
  
  // Lemon Squeezy - You'll get these from your Lemon Squeezy dashboard
  LEMON_SQUEEZY_STORE_SLUG: 'your-store-name', // e.g., 'privacyfill'
  LEMON_SQUEEZY_VARIANT_ID: 'YOUR_VARIANT_ID', // e.g., '123456'
  
  // Google OAuth - You'll get this from Google Cloud Console
  GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
};

export default config;
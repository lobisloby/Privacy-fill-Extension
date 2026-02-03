import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'PrivacyFill - Temp Identity Generator',
  version: '1.0.0',
  description: 'Generate temporary identities and auto-fill signup forms with 1 click. Keep your real inbox clean!',
  
  permissions: [
    'activeTab',
    'storage',
    'scripting',
    'identity',
  ],
  
  host_permissions: [
    '<all_urls>',
  ],
  
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
    },
  ],
  
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },

  // OAuth2 configuration - replace with your client ID
  oauth2: {
    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    scopes: ['email', 'profile'],
  },
});
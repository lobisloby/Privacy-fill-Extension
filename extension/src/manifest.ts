// ============================================
// EXTENSION MANIFEST
// ============================================

import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'PrivacyFill - Temp Identity Generator',
  version: '1.0.0',
  description: 'Generate temporary identities and auto-fill forms with 1 click!',

  permissions: ['activeTab', 'storage', 'scripting'],

  host_permissions: ['<all_urls>'],

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
});
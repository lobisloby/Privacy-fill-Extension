// ============================================
// BACKGROUND SERVICE WORKER
// ============================================

import type { Message, MessageResponse } from '@/types';

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PrivacyFill installed!');
    
    // Set default storage values
    chrome.storage.local.set({
      usageCount: 0,
      lastResetDate: new Date().toISOString(),
      identityHistory: []
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener(
  (request: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
    handleMessage(request)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep channel open for async response
  }
);

async function handleMessage(request: Message): Promise<MessageResponse> {
  switch (request.action) {
    case 'GET_IDENTITY':
      const data = await chrome.storage.local.get(['currentIdentity']);
      return { success: true, data: data.currentIdentity };

    case 'CHECK_SUBSCRIPTION':
      const userData = await chrome.storage.local.get(['subscription']);
      return { success: true, data: userData.subscription };

    default:
      return { success: false, error: 'Unknown action' };
  }
}

export {};
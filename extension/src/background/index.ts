// ============================================
// BACKGROUND SERVICE WORKER
// ============================================

import { storage } from '../utils/storage';

// On extension install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('PrivacyFill installed!');
    await storage.checkMonthlyReset();
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'GET_STATE') {
    storage.getState().then(sendResponse);
    return true;
  }
  return false;
});

export {};
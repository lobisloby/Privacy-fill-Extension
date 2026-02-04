// ============================================
// STORAGE UTILITY
// ============================================

import type { Identity, AppState } from '../types';
import { FREE_LIMIT } from './constants';

const KEYS = {
  IS_PREMIUM: 'pf_isPremium',
  LICENSE_KEY: 'pf_licenseKey',
  USAGE_COUNT: 'pf_usageCount',
  LAST_RESET: 'pf_lastReset',
  CURRENT_IDENTITY: 'pf_currentIdentity',
  HISTORY: 'pf_history',
};

class Storage {
  // ========== STATE ==========
  async getState(): Promise<AppState> {
    const data = await chrome.storage.local.get(Object.values(KEYS));
    return {
      isPremium: data[KEYS.IS_PREMIUM] || false,
      licenseKey: data[KEYS.LICENSE_KEY] || null,
      usageCount: data[KEYS.USAGE_COUNT] || 0,
      lastResetDate: data[KEYS.LAST_RESET] || new Date().toISOString(),
      currentIdentity: data[KEYS.CURRENT_IDENTITY] || null,
      identityHistory: data[KEYS.HISTORY] || [],
    };
  }

  // ========== PREMIUM ==========
  async isPremium(): Promise<boolean> {
    const data = await chrome.storage.local.get(KEYS.IS_PREMIUM);
    return data[KEYS.IS_PREMIUM] || false;
  }

  async setPremium(value: boolean, key?: string): Promise<void> {
    await chrome.storage.local.set({
      [KEYS.IS_PREMIUM]: value,
      [KEYS.LICENSE_KEY]: key || null,
    });
  }

  async getLicenseKey(): Promise<string | null> {
    const data = await chrome.storage.local.get(KEYS.LICENSE_KEY);
    return data[KEYS.LICENSE_KEY] || null;
  }

  // ========== USAGE ==========
  async getUsageCount(): Promise<number> {
    await this.checkMonthlyReset();
    const data = await chrome.storage.local.get(KEYS.USAGE_COUNT);
    return data[KEYS.USAGE_COUNT] || 0;
  }

  async incrementUsage(): Promise<number> {
    const count = await this.getUsageCount();
    const newCount = count + 1;
    await chrome.storage.local.set({ [KEYS.USAGE_COUNT]: newCount });
    return newCount;
  }

  async checkMonthlyReset(): Promise<void> {
    const data = await chrome.storage.local.get(KEYS.LAST_RESET);
    const lastReset = data[KEYS.LAST_RESET];

    if (!lastReset) {
      await chrome.storage.local.set({
        [KEYS.LAST_RESET]: new Date().toISOString(),
        [KEYS.USAGE_COUNT]: 0,
      });
      return;
    }

    const lastDate = new Date(lastReset);
    const now = new Date();

    if (now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear()) {
      await chrome.storage.local.set({
        [KEYS.LAST_RESET]: now.toISOString(),
        [KEYS.USAGE_COUNT]: 0,
      });
    }
  }

  async canGenerate(): Promise<boolean> {
    if (await this.isPremium()) return true;
    const count = await this.getUsageCount();
    return count < FREE_LIMIT;
  }

  // ========== IDENTITY ==========
  async getCurrentIdentity(): Promise<Identity | null> {
    const data = await chrome.storage.local.get(KEYS.CURRENT_IDENTITY);
    return data[KEYS.CURRENT_IDENTITY] || null;
  }

  async setCurrentIdentity(identity: Identity): Promise<void> {
    await chrome.storage.local.set({ [KEYS.CURRENT_IDENTITY]: identity });
    await this.addToHistory(identity);
  }

  async getHistory(): Promise<Identity[]> {
    const data = await chrome.storage.local.get(KEYS.HISTORY);
    return data[KEYS.HISTORY] || [];
  }

  async addToHistory(identity: Identity): Promise<void> {
    const history = await this.getHistory();
    const updated = [identity, ...history].slice(0, 50);
    await chrome.storage.local.set({ [KEYS.HISTORY]: updated });
  }

  async clearHistory(): Promise<void> {
    await chrome.storage.local.set({ [KEYS.HISTORY]: [] });
  }

  async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }
}

export const storage = new Storage();
export default storage;
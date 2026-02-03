// ============================================
// CHROME STORAGE UTILITIES
// ============================================

import type { StorageData, User, Subscription, Identity } from '@/types';
import { STORAGE_KEYS } from './constants';

class StorageService {
  // Get all storage data
  async getAll(): Promise<Partial<StorageData>> {
    return chrome.storage.local.get(Object.values(STORAGE_KEYS));
  }

  // Get specific item
  async get<K extends keyof StorageData>(key: K): Promise<StorageData[K] | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  }

  // Set specific item
  async set<K extends keyof StorageData>(key: K, value: StorageData[K]): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  // Remove specific item
  async remove(key: keyof StorageData): Promise<void> {
    await chrome.storage.local.remove(key);
  }

  // Clear all storage
  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }

  // ============================================
  // USER METHODS
  // ============================================
  
  async getUser(): Promise<User | null> {
    return this.get('user');
  }

  async setUser(user: User): Promise<void> {
    await this.set('user', user);
  }

  async removeUser(): Promise<void> {
    await this.remove('user');
  }

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================
  
  async getSubscription(): Promise<Subscription | null> {
    return this.get('subscription');
  }

  async setSubscription(subscription: Subscription): Promise<void> {
    await this.set('subscription', subscription);
  }

  async isPremium(): Promise<boolean> {
    const subscription = await this.getSubscription();
    return subscription?.status === 'active';
  }

  // ============================================
  // IDENTITY METHODS
  // ============================================
  
  async getCurrentIdentity(): Promise<Identity | null> {
    return this.get('currentIdentity');
  }

  async setCurrentIdentity(identity: Identity): Promise<void> {
    await this.set('currentIdentity', identity);
    
    // Also add to history
    await this.addToHistory(identity);
  }

  async getIdentityHistory(): Promise<Identity[]> {
    const history = await this.get('identityHistory');
    return history ?? [];
  }

  async addToHistory(identity: Identity): Promise<void> {
    const history = await this.getIdentityHistory();
    history.unshift(identity);
    // Keep only last 50 identities
    await this.set('identityHistory', history.slice(0, 50));
  }

  async clearHistory(): Promise<void> {
    await this.set('identityHistory', []);
  }

  // ============================================
  // USAGE METHODS
  // ============================================
  
  async getUsageCount(): Promise<number> {
    const count = await this.get('usageCount');
    return count ?? 0;
  }

  async incrementUsage(): Promise<number> {
    const currentCount = await this.getUsageCount();
    const newCount = currentCount + 1;
    await this.set('usageCount', newCount);
    return newCount;
  }

  async resetUsage(): Promise<void> {
    await this.set('usageCount', 0);
    await this.set('lastResetDate', new Date().toISOString());
  }

  async checkAndResetMonthlyUsage(): Promise<boolean> {
    const lastResetDate = await this.get('lastResetDate');
    const now = new Date();
    
    if (!lastResetDate) {
      await this.resetUsage();
      return true;
    }

    const lastReset = new Date(lastResetDate);
    if (now.getMonth() !== lastReset.getMonth() || 
        now.getFullYear() !== lastReset.getFullYear()) {
      await this.resetUsage();
      return true;
    }

    return false;
  }
}

export const storage = new StorageService();
export default storage;
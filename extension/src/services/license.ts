// ============================================
// LICENSE SERVICE
// ============================================

import { storage } from '../utils/storage';
import { api } from './api';

export interface LicenseInfo {
  key: string;
  instanceId?: string;
  activatedAt: string;
  email?: string;
  name?: string;
  productName?: string;
}

class LicenseService {
  /**
   * Activate a license key
   */
  async activate(key: string): Promise<{ success: boolean; message: string }> {
    const cleanKey = key.trim();

    if (!cleanKey) {
      return {
        success: false,
        message: 'Please enter a license key',
      };
    }

    // Try to activate with Lemon Squeezy API
    const result = await api.activateLicense(cleanKey);

    if (result.valid) {
      // Save license info
      const licenseInfo: LicenseInfo = {
        key: cleanKey,
        instanceId: result.instanceId,
        activatedAt: new Date().toISOString(),
        email: result.meta?.customerEmail,
        name: result.meta?.customerName,
        productName: result.meta?.productName,
      };

      await storage.setPremium(true, cleanKey);
      await chrome.storage.local.set({ licenseInfo });

      return {
        success: true,
        message: result.message,
      };
    }

    return {
      success: false,
      message: result.message,
    };
  }

  /**
   * Deactivate current license
   */
  async deactivate(): Promise<boolean> {
    try {
      const info = await this.getInfo();
      
      if (info?.key && info?.instanceId) {
        await api.deactivateLicense(info.key, info.instanceId);
      }

      await storage.setPremium(false);
      await chrome.storage.local.remove('licenseInfo');
      
      return true;
    } catch (error) {
      console.error('Deactivation error:', error);
      return false;
    }
  }

  /**
   * Check if premium is active
   */
  async isActive(): Promise<boolean> {
    return storage.isPremium();
  }

  /**
   * Get stored license key
   */
  async getKey(): Promise<string | null> {
    return storage.getLicenseKey();
  }

  /**
   * Get full license info
   */
  async getInfo(): Promise<LicenseInfo | null> {
    const data = await chrome.storage.local.get('licenseInfo');
    return data.licenseInfo || null;
  }

  /**
   * Verify license is still valid (periodic check)
   */
  async verify(): Promise<boolean> {
    const key = await this.getKey();
    if (!key) return false;

    const result = await api.validateLicense(key);
    
    if (!result.valid) {
      // License no longer valid
      await this.deactivate();
      return false;
    }

    return true;
  }
}

export const license = new LicenseService();
export default license;
// ============================================
// LICENSE VALIDATION
// ============================================

import { storage } from '../utils/storage';

// License format: PF-XXXX-XXXX-XXXX-XXXX
const LICENSE_REGEX = /^PF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

class LicenseService {
  isValidFormat(key: string): boolean {
    return LICENSE_REGEX.test(key.toUpperCase().trim());
  }

  async activate(key: string): Promise<{ success: boolean; message: string }> {
    const cleanKey = key.toUpperCase().trim();

    if (!this.isValidFormat(cleanKey)) {
      return {
        success: false,
        message: 'Invalid license format. Expected: PF-XXXX-XXXX-XXXX-XXXX',
      };
    }

    // For now, accept any valid format
    // Later: Add API validation with Lemon Squeezy or Gumroad
    await storage.setPremium(true, cleanKey);

    return {
      success: true,
      message: 'License activated! Enjoy unlimited access.',
    };
  }

  async deactivate(): Promise<void> {
    await storage.setPremium(false);
  }

  async isActive(): Promise<boolean> {
    return storage.isPremium();
  }

  async getKey(): Promise<string | null> {
    return storage.getLicenseKey();
  }

  // Generate test key (for development)
  generateTestKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `PF-${segment()}-${segment()}-${segment()}-${segment()}`;
  }
}

export const license = new LicenseService();
export default license;
// ============================================
// LEMON SQUEEZY API SERVICE
// ============================================

import { LEMON_SQUEEZY } from '../utils/constants';

export interface LicenseResult {
  valid: boolean;
  message: string;
  instanceId?: string;
  meta?: {
    storeId?: number;
    productId?: number;
    productName?: string;
    variantId?: number;
    variantName?: string;
    customerEmail?: string;
    customerName?: string;
  };
}

class ApiService {
  /**
   * Activate a license key with Lemon Squeezy
   */
  async activateLicense(licenseKey: string): Promise<LicenseResult> {
    try {
      // Generate a unique instance identifier for this installation
      const instanceId = await this.getInstanceId();

      const response = await fetch(`${LEMON_SQUEEZY.API_URL}/licenses/activate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          instance_name: `PrivacyFill-${instanceId.substring(0, 8)}`,
        }),
      });

      const data = await response.json();
      console.log('Lemon Squeezy activate response:', data);

      // Handle error responses
      if (data.error) {
        return {
          valid: false,
          message: this.parseError(data.error),
        };
      }

      // Handle successful activation
      if (data.activated === true || data.valid === true) {
        return {
          valid: true,
          message: 'License activated successfully!',
          instanceId: data.instance?.id,
          meta: {
            storeId: data.meta?.store_id,
            productId: data.meta?.product_id,
            productName: data.meta?.product_name,
            variantId: data.meta?.variant_id,
            variantName: data.meta?.variant_name,
            customerEmail: data.meta?.customer_email,
            customerName: data.meta?.customer_name,
          },
        };
      }

      // License exists but couldn't activate
      return {
        valid: false,
        message: data.error || 'Could not activate license',
      };
    } catch (error) {
      console.error('License activation error:', error);
      return {
        valid: false,
        message: 'Network error. Please check your internet connection.',
      };
    }
  }

  /**
   * Validate a license key (check if valid without activating)
   */
  async validateLicense(licenseKey: string): Promise<LicenseResult> {
    try {
      const response = await fetch(`${LEMON_SQUEEZY.API_URL}/licenses/validate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
        }),
      });

      const data = await response.json();
      console.log('Lemon Squeezy validate response:', data);

      if (data.valid === true) {
        return {
          valid: true,
          message: 'License is valid',
          meta: {
            customerEmail: data.meta?.customer_email,
            customerName: data.meta?.customer_name,
            productName: data.meta?.product_name,
          },
        };
      }

      return {
        valid: false,
        message: data.error || 'Invalid license key',
      };
    } catch (error) {
      console.error('License validation error:', error);
      return {
        valid: false,
        message: 'Network error. Please check your internet connection.',
      };
    }
  }

  /**
   * Deactivate a license instance
   */
  async deactivateLicense(licenseKey: string, instanceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${LEMON_SQUEEZY.API_URL}/licenses/deactivate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          instance_id: instanceId,
        }),
      });

      const data = await response.json();
      return data.deactivated === true;
    } catch (error) {
      console.error('License deactivation error:', error);
      return false;
    }
  }

  /**
   * Get or create a unique instance ID for this browser
   */
  private async getInstanceId(): Promise<string> {
    const data = await chrome.storage.local.get('instanceId');
    
    if (data.instanceId) {
      return data.instanceId;
    }

    // Generate new instance ID
    const instanceId = crypto.randomUUID();
    await chrome.storage.local.set({ instanceId });
    return instanceId;
  }

  /**
   * Parse error messages from Lemon Squeezy
   */
  private parseError(error: string): string {
    const errorMap: Record<string, string> = {
      'license_key is required': 'Please enter a license key',
      'license key was not found': 'Invalid license key. Please check and try again.',
      'license key has been disabled': 'This license has been disabled',
      'activation limit has been reached': 'Activation limit reached. Please deactivate another device first.',
      'license key has expired': 'This license has expired',
    };

    // Check if error matches any known pattern
    for (const [pattern, message] of Object.entries(errorMap)) {
      if (error.toLowerCase().includes(pattern.toLowerCase())) {
        return message;
      }
    }

    return error || 'An error occurred';
  }
}

export const api = new ApiService();
export default api;
// ============================================
// API SERVICE
// ============================================

import type { Subscription } from '@/types';
import { API_BASE_URL } from '@/utils/constants';
import { storage } from '@/utils/storage';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // ============================================
  // SUBSCRIPTION
  // ============================================

  async getSubscriptionStatus(userId: string): Promise<Subscription | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getSubscriptionStatus?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      const data = await response.json();
      
      if (data.subscription) {
        await storage.setSubscription(data.subscription);
      }

      return data.subscription;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }

  // ============================================
  // USAGE TRACKING
  // ============================================

  async trackUsage(userId: string): Promise<{ count: number; reset: boolean } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/trackUsage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to track usage');
      }

      return response.json();
    } catch (error) {
      console.error('Error tracking usage:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
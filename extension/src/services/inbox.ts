// ============================================
// INBOX SERVICE - CHECK TEMP EMAILS
// ============================================

import type { Email } from '../types';

const MAIL_API = 'https://api.mail.tm';

class InboxService {
  // Get all emails for an account
  async getEmails(token: string): Promise<Email[]> {
    try {
      const res = await fetch(`${MAIL_API}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch emails');
        return [];
      }

      const data = await res.json();
      return data['hydra:member'] || [];
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }

  // Get single email details
  async getEmail(token: string, messageId: string): Promise<Email | null> {
    try {
      const res = await fetch(`${MAIL_API}/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (error) {
      console.error('Error fetching email:', error);
      return null;
    }
  }

  // Extract verification code from email text
  extractCode(text: string): string | null {
    // Common patterns for verification codes
    const patterns = [
      /\b(\d{6})\b/,           // 6 digits
      /\b(\d{4})\b/,           // 4 digits
      /code[:\s]+(\d{4,8})/i,  // "code: 123456"
      /verify[:\s]+(\d{4,8})/i, // "verify: 123456"
      /\b([A-Z0-9]{6,8})\b/,   // Alphanumeric code
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const inbox = new InboxService();
export default inbox;
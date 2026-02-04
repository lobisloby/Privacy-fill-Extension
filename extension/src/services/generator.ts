// ============================================
// IDENTITY GENERATOR WITH REAL TEMP EMAIL
// ============================================

import type { Identity } from '../types';

const FIRST_NAMES = [
  'James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella',
  'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Sebastian',
  'Harper', 'Jack', 'Evelyn', 'Aiden', 'Abigail', 'Owen', 'Emily', 'Samuel',
  'Elizabeth', 'Ryan', 'Sofia', 'Nathan', 'Avery', 'Leo', 'Ella', 'Daniel',
  'Grace', 'Matthew', 'Chloe', 'Joseph', 'Victoria', 'David', 'Riley', 'Noah',
  'Zoe', 'Michael', 'Lily', 'Ethan', 'Hannah', 'Jacob', 'Aria', 'Logan'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green'
];

const BIOS = [
  "Just here to explore 🌍",
  "Coffee lover ☕ | Tech enthusiast",
  "Living life one day at a time ✨",
  "Curious mind, kind heart 💭",
  "Adventure seeker 🚀",
  "Making things happen 💪",
  "Always learning something new 📚",
  "Dreamer & doer ⭐",
  "Keeping it simple 🎯",
  "Good vibes only ✌️"
];

// mail.tm API
const MAIL_API = 'https://api.mail.tm';

class Generator {
  private random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomString(len: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => this.random(chars.split(''))).join('');
  }

  private randomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generatePassword(length = 16): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const symbols = '!@#$%&*';
    const all = lower + upper + nums + symbols;

    let pass = '';
    pass += this.random(lower.split(''));
    pass += this.random(upper.split(''));
    pass += this.random(nums.split(''));
    pass += this.random(symbols.split(''));

    for (let i = 4; i < length; i++) {
      pass += this.random(all.split(''));
    }

    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // Create real temp email using mail.tm
  async createRealEmail(): Promise<{
    email: string;
    password: string;
    accountId: string;
    token: string;
  } | null> {
    try {
      // Step 1: Get available domains
      const domainsRes = await fetch(`${MAIL_API}/domains`);
      const domainsData = await domainsRes.json();
      
      if (!domainsData['hydra:member']?.length) {
        console.error('No domains available');
        return null;
      }

      const domain = domainsData['hydra:member'][0].domain;
      const emailLocal = this.randomString(10);
      const email = `${emailLocal}@${domain}`;
      const password = this.randomString(12);

      // Step 2: Create account
      const createRes = await fetch(`${MAIL_API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email, password }),
      });

      if (!createRes.ok) {
        console.error('Failed to create email account');
        return null;
      }

      const accountData = await createRes.json();

      // Step 3: Get auth token
      const tokenRes = await fetch(`${MAIL_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email, password }),
      });

      if (!tokenRes.ok) {
        console.error('Failed to get token');
        return null;
      }

      const tokenData = await tokenRes.json();

      return {
        email,
        password,
        accountId: accountData.id,
        token: tokenData.token,
      };
    } catch (error) {
      console.error('Error creating temp email:', error);
      return null;
    }
  }

  // Fallback fake email if API fails
  private createFakeEmail(firstName: string): string {
    const domains = ['tempbox.email', 'quickmail.dev', 'mailtemp.net'];
    const num = this.randomNum(100, 9999);
    return `${firstName.toLowerCase()}${num}@${this.random(domains)}`;
  }

  async generate(includeBio = false): Promise<Identity> {
    const firstName = this.random(FIRST_NAMES);
    const lastName = this.random(LAST_NAMES);

    // Try to create real temp email
    const realEmail = await this.createRealEmail();

    const identity: Identity = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: realEmail?.email || this.createFakeEmail(firstName),
      username: `${firstName.toLowerCase()}_${this.randomString(4)}`,
      bio: includeBio ? this.random(BIOS) : null,
      password: this.generatePassword(),
    };

    // If we have real email, add account credentials
    if (realEmail) {
      identity.emailAccountId = realEmail.accountId;
      identity.emailAccountToken = realEmail.token;
    }

    return identity;
  }
}

export const generator = new Generator();
export default generator;
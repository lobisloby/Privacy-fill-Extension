// ============================================
// IDENTITY GENERATOR SERVICE
// ============================================

import type { Identity, TempEmailResponse } from '@/types';
import { TEMP_EMAIL_API } from '@/utils/constants';

const FIRST_NAMES = [
  'James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella',
  'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Sebastian',
  'Harper', 'Jack', 'Evelyn', 'Aiden', 'Abigail', 'Owen', 'Emily', 'Samuel',
  'Elizabeth', 'Ryan', 'Sofia', 'Nathan', 'Avery', 'Leo', 'Ella', 'Daniel',
  'Grace', 'Matthew', 'Chloe', 'Joseph', 'Victoria', 'David', 'Riley', 'Carter',
  'Scarlett', 'Michael', 'Aria', 'Jayden', 'Lily', 'Ethan', 'Zoey', 'Noah'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter'
];

const BIO_TEMPLATES = [
  "Passionate about {interest1} and {interest2}. Always learning something new. 🚀",
  "Coffee enthusiast ☕ | {interest1} lover | Exploring the world of {interest2}",
  "Just a {adjective} person who loves {interest1} and {interest2}. ✨",
  "Living life one {interest1} at a time. {interest2} on weekends. 🌟",
  "{adjective} by nature, {interest1} by choice. Let's connect! 🤝",
  "Building things with {interest1}. Dreaming about {interest2}. 💭",
  "Not all who wander are lost. {interest1} | {interest2} | {interest3} 🌍",
  "Making the world better through {interest1}. {adjective} problem solver. 💡",
  "{interest1} nerd 🤓 | {interest2} enthusiast | {adjective} thinker",
  "On a journey of {interest1} and {interest2}. {adjective} and proud! 🎯",
  "Fueled by {interest1} and {interest2}. Creating magic daily. ✨",
  "{adjective} soul with a passion for {interest1}. {interest2} is my escape. 🌈"
];

const INTERESTS = [
  'technology', 'coffee', 'travel', 'books', 'music', 'photography', 'hiking',
  'cooking', 'gaming', 'fitness', 'art', 'movies', 'podcasts', 'design',
  'nature', 'yoga', 'writing', 'science', 'space', 'innovation', 'startups',
  'coding', 'AI', 'blockchain', 'sustainability', 'mindfulness', 'running',
  'meditation', 'cycling', 'swimming', 'dance', 'fashion', 'food', 'wine'
];

const ADJECTIVES = [
  'curious', 'creative', 'adventurous', 'passionate', 'driven', 'thoughtful',
  'inspired', 'determined', 'optimistic', 'authentic', 'innovative', 'bold',
  'mindful', 'dedicated', 'ambitious', 'resilient', 'dynamic', 'energetic'
];

const FALLBACK_DOMAINS = [
  'tempmail.io',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email'
];

class IdentityGenerator {
  private currentIdentity: Identity | null = null;

  // ============================================
  // UTILITY METHODS
  // ============================================

  private randomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }

  private randomPick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomPickMultiple<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ============================================
  // NAME GENERATION
  // ============================================

  private generateName(): { firstName: string; lastName: string; fullName: string } {
    const firstName = this.randomPick(FIRST_NAMES);
    const lastName = this.randomPick(LAST_NAMES);
    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`
    };
  }

  // ============================================
  // USERNAME GENERATION
  // ============================================

  private generateUsername(firstName: string, lastName: string): string {
    const styles = [
      () => `${firstName.toLowerCase()}${lastName.toLowerCase()}${this.randomNumber(1, 999)}`,
      () => `${firstName.toLowerCase()}_${lastName.toLowerCase().substring(0, 3)}`,
      () => `${firstName.toLowerCase()}${this.randomNumber(1, 9999)}`,
      () => `${firstName.substring(0, 1).toLowerCase()}${lastName.toLowerCase()}${this.randomNumber(1, 99)}`,
      () => `the_${firstName.toLowerCase()}${this.randomNumber(1, 999)}`,
      () => `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      () => `${lastName.toLowerCase()}${firstName.substring(0, 1).toLowerCase()}${this.randomNumber(1, 999)}`,
      () => `${firstName.toLowerCase()}${lastName.substring(0, 1).toLowerCase()}${this.randomNumber(1, 99)}`,
      () => `real_${firstName.toLowerCase()}${this.randomNumber(1, 99)}`,
    ];
    return this.randomPick(styles)();
  }

  // ============================================
  // EMAIL GENERATION
  // ============================================

  async generateTempEmail(): Promise<TempEmailResponse> {
    try {
      // Get available domains from mail.tm
      const domainsResponse = await fetch(`${TEMP_EMAIL_API}/domains`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!domainsResponse.ok) {
        throw new Error('Failed to fetch domains');
      }

      const domainsData = await domainsResponse.json();
      
      if (!domainsData['hydra:member']?.length) {
        throw new Error('No domains available');
      }

      const domain = domainsData['hydra:member'][0].domain;
      const localPart = this.randomString(12);
      const email = `${localPart}@${domain}`;
      const password = this.randomString(16);

      // Create the account
      const createResponse = await fetch(`${TEMP_EMAIL_API}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          address: email,
          password: password
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create email account');
      }

      const accountData = await createResponse.json();

      // Get auth token for the account
      const tokenResponse = await fetch(`${TEMP_EMAIL_API}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          address: email,
          password: password
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get auth token');
      }

      const tokenData = await tokenResponse.json();

      return {
        email,
        password,
        id: accountData.id,
        token: tokenData.token
      };
    } catch (error) {
      console.error('Temp email generation failed:', error);
      
      // Fallback to fake email
      return {
        email: `${this.randomString(12)}@${this.randomPick(FALLBACK_DOMAINS)}`,
        password: null,
        id: null,
        token: null
      };
    }
  }

  // ============================================
  // BIO GENERATION
  // ============================================

  private generateBio(): string {
    const template = this.randomPick(BIO_TEMPLATES);
    const interests = this.randomPickMultiple(INTERESTS, 3);
    
    return template
      .replace('{interest1}', interests[0])
      .replace('{interest2}', interests[1])
      .replace('{interest3}', interests[2] || interests[0])
      .replace('{adjective}', this.randomPick(ADJECTIVES));
  }

  // ============================================
  // PASSWORD GENERATION
  // ============================================

  generatePassword(length = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    // Ensure at least one of each type
    let password = '';
    password += this.randomPick(lowercase.split(''));
    password += this.randomPick(uppercase.split(''));
    password += this.randomPick(numbers.split(''));
    password += this.randomPick(symbols.split(''));

    // Fill the rest randomly
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += this.randomPick(allChars.split(''));
    }

    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // ============================================
  // MAIN GENERATION METHOD
  // ============================================

  async generateIdentity(isPremium = false): Promise<Identity> {
    const nameData = this.generateName();
    const emailData = await this.generateTempEmail();
    
    const identity: Identity = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      
      // Basic info
      firstName: nameData.firstName,
      lastName: nameData.lastName,
      fullName: nameData.fullName,
      
      // Email
      email: emailData.email,
      emailPassword: emailData.password,
      emailToken: emailData.token,
      emailId: emailData.id,
      
      // Username
      username: this.generateUsername(nameData.firstName, nameData.lastName),
      
      // Premium features
      bio: isPremium ? this.generateBio() : null,
      
      // Metadata
      isPremium
    };

    this.currentIdentity = identity;
    return identity;
  }

  // ============================================
  // GETTERS/SETTERS
  // ============================================

  getCurrentIdentity(): Identity | null {
    return this.currentIdentity;
  }

  setCurrentIdentity(identity: Identity): void {
    this.currentIdentity = identity;
  }
}

export const identityGenerator = new IdentityGenerator();
export default identityGenerator;
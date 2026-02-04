// ============================================
// IDENTITY GENERATOR
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
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter'
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
  "Good vibes only ✌️",
  "Creating my own path 🛤️",
  "Passionate about life 🌟",
  "Just getting started 🔥",
  "Here for the journey 🎒",
  "Building something cool 🔨"
];

const EMAIL_DOMAINS = [
  'tempbox.email',
  'quickmail.dev',
  'mailtemp.net',
  'inboxfast.org',
  'randomail.io'
];

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

    // Ensure at least one of each type
    let pass = '';
    pass += this.random(lower.split(''));
    pass += this.random(upper.split(''));
    pass += this.random(nums.split(''));
    pass += this.random(symbols.split(''));

    // Fill the rest
    for (let i = 4; i < length; i++) {
      pass += this.random(all.split(''));
    }

    // Shuffle
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  }

  generate(includeBio = false): Identity {
    const firstName = this.random(FIRST_NAMES);
    const lastName = this.random(LAST_NAMES);
    const num = this.randomNum(10, 9999);
    const domain = this.random(EMAIL_DOMAINS);

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}${num}@${domain}`,
      username: `${firstName.toLowerCase()}_${this.randomString(4)}`,
      bio: includeBio ? this.random(BIOS) : null,
      password: this.generatePassword(),
    };
  }
}

export const generator = new Generator();
export default generator;
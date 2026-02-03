import * as crypto from 'crypto';
import * as functions from 'firebase-functions';

/**
 * Verify Lemon Squeezy webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Get config value with fallback to environment variable
 */
export function getConfig(key: string, fallback?: string): string {
  try {
    const config = functions.config();
    const keys = key.split('.');
    let value: Record<string, unknown> | string = config;
    
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k] as Record<string, unknown> | string;
      } else {
        throw new Error(`Config key not found: ${key}`);
      }
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    throw new Error(`Config value is not a string: ${key}`);
  } catch {
    if (fallback !== undefined) {
      return fallback;
    }
    // Try environment variable
    const envKey = key.replace(/\./g, '_').toUpperCase();
    const envValue = process.env[envKey];
    if (envValue) {
      return envValue;
    }
    throw new Error(`Config not found: ${key}`);
  }
}

/**
 * Create a standardized API response
 */
export function createResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): { success: boolean; data?: T; error?: string } {
  const response: { success: boolean; data?: T; error?: string } = { success };
  if (data !== undefined) response.data = data;
  if (error !== undefined) response.error = error;
  return response;
}

/**
 * Check if a date string is expired
 */
export function isExpired(dateString: string | null): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

/**
 * Check if usage should be reset (monthly)
 */
export function shouldResetUsage(resetDateString: string): boolean {
  const resetDate = new Date(resetDateString);
  const now = new Date();
  
  return (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  );
}
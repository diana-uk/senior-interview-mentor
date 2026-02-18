import { logger } from './logger.js';

/**
 * Safe localStorage wrappers that handle QuotaExceededError
 * (iOS Safari private mode has a 5MB limit) and other exceptions.
 */

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    logger.warn(`[storage] Failed to read key "${key}"`);
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      logger.warn(`[storage] QuotaExceededError writing key "${key}" (${value.length} chars)`);
    } else {
      logger.warn(`[storage] Failed to write key "${key}"`);
    }
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    logger.warn(`[storage] Failed to remove key "${key}"`);
  }
}

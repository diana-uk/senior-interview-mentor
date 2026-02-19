import { describe, it, expect, beforeEach, vi } from 'vitest';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../storage';

// Mock logger to suppress output and spy on calls
vi.mock('../logger.js', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { logger } from '../logger.js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ── safeGetItem ──

  describe('safeGetItem', () => {
    it('returns value when key exists', () => {
      localStorageMock.setItem('foo', 'bar');
      expect(safeGetItem('foo')).toBe('bar');
    });

    it('returns null when key does not exist', () => {
      expect(safeGetItem('nonexistent')).toBeNull();
    });

    it('delegates to localStorage.getItem', () => {
      safeGetItem('test-key');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
    });

    it('returns null when localStorage throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      expect(safeGetItem('key')).toBeNull();
    });

    it('logs warning when localStorage throws', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      safeGetItem('my-key');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('my-key'),
      );
    });

    it('returns empty string when value is empty string', () => {
      localStorageMock.setItem('empty', '');
      expect(safeGetItem('empty')).toBe('');
    });
  });

  // ── safeSetItem ──

  describe('safeSetItem', () => {
    it('stores value and returns true', () => {
      const result = safeSetItem('key', 'value');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value');
    });

    it('returns true on success', () => {
      expect(safeSetItem('a', 'b')).toBe(true);
    });

    it('returns false when localStorage throws generic error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('generic');
      });
      expect(safeSetItem('key', 'value')).toBe(false);
    });

    it('logs warning for generic error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('generic');
      });
      safeSetItem('my-key', 'val');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write key "my-key"'),
      );
    });

    it('returns false on QuotaExceededError', () => {
      const err = new DOMException('quota exceeded', 'QuotaExceededError');
      localStorageMock.setItem.mockImplementationOnce(() => { throw err; });
      expect(safeSetItem('key', 'x'.repeat(100))).toBe(false);
    });

    it('logs QuotaExceededError with value length', () => {
      const err = new DOMException('quota exceeded', 'QuotaExceededError');
      localStorageMock.setItem.mockImplementationOnce(() => { throw err; });
      safeSetItem('quota-key', 'x'.repeat(50));
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('QuotaExceededError'),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('50 chars'),
      );
    });

    it('distinguishes QuotaExceededError from other DOMExceptions', () => {
      const err = new DOMException('other error', 'NotFoundError');
      localStorageMock.setItem.mockImplementationOnce(() => { throw err; });
      safeSetItem('key', 'val');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write'),
      );
    });

    it('stores JSON strings correctly', () => {
      const json = JSON.stringify({ a: 1, b: [2, 3] });
      safeSetItem('json-key', json);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('json-key', json);
    });
  });

  // ── safeRemoveItem ──

  describe('safeRemoveItem', () => {
    it('removes item from localStorage', () => {
      localStorageMock.setItem('key', 'value');
      safeRemoveItem('key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');
    });

    it('does not throw when localStorage throws', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      expect(() => safeRemoveItem('key')).not.toThrow();
    });

    it('logs warning when localStorage throws', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('SecurityError');
      });
      safeRemoveItem('rm-key');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('rm-key'),
      );
    });

    it('does not throw when removing non-existent key', () => {
      expect(() => safeRemoveItem('nonexistent')).not.toThrow();
    });
  });
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { writeSession, readSession, clearSession, createDebouncedSave } from '../useSessionStorage';

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

// Mock logger to suppress output
vi.mock('../../utils/logger.js', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const STORAGE_KEY = 'sim-session';

describe('useSessionStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── writeSession ──

  describe('writeSession', () => {
    it('writes data wrapped in an envelope', () => {
      writeSession({ foo: 'bar' });
      const raw = localStorageMock.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const envelope = JSON.parse(raw!);
      expect(envelope.data).toEqual({ foo: 'bar' });
    });

    it('includes version number in envelope', () => {
      writeSession({ a: 1 });
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.version).toBe(1);
    });

    it('includes savedAt timestamp', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-20T10:00:00Z'));
      writeSession({ test: true });
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.savedAt).toBe(new Date('2026-02-20T10:00:00Z').getTime());
      vi.useRealTimers();
    });

    it('overwrites previous session data', () => {
      writeSession({ first: true });
      writeSession({ second: true });
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data).toEqual({ second: true });
    });

    it('handles complex nested data', () => {
      const data = { items: [1, 2, 3], nested: { deep: { value: 'ok' } } };
      writeSession(data);
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data).toEqual(data);
    });
  });

  // ── readSession ──

  describe('readSession', () => {
    it('returns data from valid envelope', () => {
      writeSession({ hello: 'world' });
      const result = readSession<{ hello: string }>(60_000);
      expect(result).toEqual({ hello: 'world' });
    });

    it('returns null when no session stored', () => {
      expect(readSession(60_000)).toBeNull();
    });

    it('returns null when session exceeds maxAge', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-20T10:00:00Z'));
      writeSession({ old: true });

      // Advance time past maxAge
      vi.setSystemTime(new Date('2026-02-20T10:02:00Z')); // +2 minutes
      const result = readSession(60_000); // maxAge = 1 minute
      expect(result).toBeNull();
      vi.useRealTimers();
    });

    it('returns data when session is within maxAge', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-20T10:00:00Z'));
      writeSession({ fresh: true });

      vi.setSystemTime(new Date('2026-02-20T10:00:30Z')); // +30 seconds
      const result = readSession<{ fresh: boolean }>(60_000); // maxAge = 1 minute
      expect(result).toEqual({ fresh: true });
      vi.useRealTimers();
    });

    it('removes expired session from localStorage', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-20T10:00:00Z'));
      writeSession({ data: 1 });

      vi.setSystemTime(new Date('2026-02-21T10:00:00Z')); // +24 hours
      readSession(60_000);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      vi.useRealTimers();
    });

    it('returns null for wrong version and removes entry', () => {
      const wrongVersion = { version: 99, savedAt: Date.now(), data: { x: 1 } };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(wrongVersion));
      const result = readSession(60_000);
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('returns null for corrupted JSON and removes entry', () => {
      localStorageMock.setItem(STORAGE_KEY, '{not valid json!!!');
      const result = readSession(60_000);
      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('returns null for empty string', () => {
      localStorageMock.setItem(STORAGE_KEY, '');
      const result = readSession(60_000);
      expect(result).toBeNull();
    });

    it('round-trips complex data through write and read', () => {
      const data = {
        messages: [{ id: '1', text: 'hello' }],
        count: 42,
        nested: { a: { b: [1, 2] } },
      };
      writeSession(data);
      const result = readSession<typeof data>(86_400_000);
      expect(result).toEqual(data);
    });
  });

  // ── clearSession ──

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      writeSession({ data: 'test' });
      clearSession();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('makes readSession return null', () => {
      writeSession({ data: 'test' });
      clearSession();
      expect(readSession(86_400_000)).toBeNull();
    });
  });

  // ── createDebouncedSave ──

  describe('createDebouncedSave', () => {
    it('saves data after delay', () => {
      vi.useFakeTimers();
      const save = createDebouncedSave<{ x: number }>(500);
      save({ x: 1 });

      // Not yet saved
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();

      // Advance timer
      vi.advanceTimersByTime(500);
      const raw = localStorageMock.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const envelope = JSON.parse(raw!);
      expect(envelope.data).toEqual({ x: 1 });
      vi.useRealTimers();
    });

    it('debounces multiple rapid calls', () => {
      vi.useFakeTimers();
      const save = createDebouncedSave<{ v: number }>(300);
      save({ v: 1 });
      save({ v: 2 });
      save({ v: 3 });

      vi.advanceTimersByTime(300);
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      // Only last call should be saved
      expect(envelope.data).toEqual({ v: 3 });
      vi.useRealTimers();
    });

    it('resets timer on each call', () => {
      vi.useFakeTimers();
      const save = createDebouncedSave<{ n: number }>(200);

      save({ n: 1 });
      vi.advanceTimersByTime(150); // 150ms — not yet fired
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();

      save({ n: 2 }); // resets timer
      vi.advanceTimersByTime(150); // 150ms from second call — not yet
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();

      vi.advanceTimersByTime(50); // 200ms from second call — fires
      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data).toEqual({ n: 2 });
      vi.useRealTimers();
    });

    it('allows multiple saves after debounce settles', () => {
      vi.useFakeTimers();
      const save = createDebouncedSave<{ round: number }>(100);

      save({ round: 1 });
      vi.advanceTimersByTime(100);
      let envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data).toEqual({ round: 1 });

      save({ round: 2 });
      vi.advanceTimersByTime(100);
      envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data).toEqual({ round: 2 });
      vi.useRealTimers();
    });

    it('does not save before delay expires', () => {
      vi.useFakeTimers();
      const save = createDebouncedSave<{ waiting: boolean }>(1000);
      save({ waiting: true });

      vi.advanceTimersByTime(999);
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();

      vi.advanceTimersByTime(1);
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeTruthy();
      vi.useRealTimers();
    });
  });
});

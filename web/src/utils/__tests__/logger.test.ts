import { describe, it, expect, beforeEach, vi } from 'vitest';

/* eslint-disable no-console */

describe('logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  // ── Dev mode (import.meta.env.DEV = true, default in vitest) ──

  describe('dev mode', () => {
    it('logger.log calls console.log', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.log('hello');
      expect(spy).toHaveBeenCalledWith('hello');
    });

    it('logger.log passes multiple arguments', async () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.log('a', 'b', 123);
      expect(spy).toHaveBeenCalledWith('a', 'b', 123);
    });

    it('logger.warn calls console.warn', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.warn('warning message');
      expect(spy).toHaveBeenCalledWith('warning message');
    });

    it('logger.warn passes multiple arguments', async () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.warn('warn', { detail: true });
      expect(spy).toHaveBeenCalledWith('warn', { detail: true });
    });

    it('logger.error calls console.error', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.error('error message');
      expect(spy).toHaveBeenCalledWith('error message');
    });

    it('logger.error passes multiple arguments', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.error('err', new Error('test'), 42);
      expect(spy).toHaveBeenCalledWith('err', expect.any(Error), 42);
    });
  });

  // ── Prod mode (import.meta.env.DEV = false) ──

  describe('prod mode', () => {
    it('logger.log is silent', async () => {
      vi.stubEnv('DEV', false as unknown as string);
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.log('should not appear');
      expect(spy).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it('logger.warn is silent', async () => {
      vi.stubEnv('DEV', false as unknown as string);
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.warn('should not appear');
      expect(spy).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it('logger.error is still active in prod', async () => {
      vi.stubEnv('DEV', false as unknown as string);
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { logger } = await import('../logger');
      logger.error('always visible');
      expect(spy).toHaveBeenCalledWith('always visible');
      vi.unstubAllEnvs();
    });
  });

  // ── Structure ──

  describe('structure', () => {
    it('has log, warn, and error methods', async () => {
      const { logger } = await import('../logger');
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('logger is a frozen-like object with exactly 3 methods', async () => {
      const { logger } = await import('../logger');
      expect(Object.keys(logger)).toHaveLength(3);
      expect(Object.keys(logger).sort()).toEqual(['error', 'log', 'warn']);
    });
  });
});

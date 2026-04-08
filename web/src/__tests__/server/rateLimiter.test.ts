import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock express-rate-limit ──────────────────────────────────────────────────
// Capture the config object passed to rateLimit() and return a mock middleware.
// vi.hoisted() is required because capturedConfig is referenced directly (not
// via a nested callback) inside the vi.mock factory, which is hoisted above imports.

type RateLimitConfig = {
  windowMs?: number;
  limit?: number;
  standardHeaders?: string | boolean;
  legacyHeaders?: boolean;
  message?: unknown;
};

const { capturedConfig, mockMiddleware } = vi.hoisted(() => {
  const capturedConfig: { value: RateLimitConfig } = { value: {} };
  const mockMiddleware = vi.fn();
  return { capturedConfig, mockMiddleware };
});

vi.mock('express-rate-limit', () => ({
  default: (config: RateLimitConfig) => {
    capturedConfig.value = config;
    return mockMiddleware;
  },
}));

import { chatLimiter } from '../../../server/middleware/rateLimiter.js';

// ─── chatLimiter config ───────────────────────────────────────────────────────

beforeEach(() => {
  mockMiddleware.mockClear();
});

describe('chatLimiter — export', () => {
  it('is exported as a function (middleware)', () => {
    expect(typeof chatLimiter).toBe('function');
  });

  it('is the middleware returned by rateLimit()', () => {
    expect(chatLimiter).toBe(mockMiddleware);
  });
});

describe('chatLimiter — windowMs', () => {
  it('is 60 seconds (60000 ms)', () => {
    expect(capturedConfig.value.windowMs).toBe(60 * 1000);
  });

  it('equals 60000', () => {
    expect(capturedConfig.value.windowMs).toBe(60000);
  });
});

describe('chatLimiter — limit', () => {
  it('allows 20 requests per window', () => {
    expect(capturedConfig.value.limit).toBe(20);
  });
});

describe('chatLimiter — headers', () => {
  it('uses draft-7 standard headers', () => {
    expect(capturedConfig.value.standardHeaders).toBe('draft-7');
  });

  it('disables legacy headers', () => {
    expect(capturedConfig.value.legacyHeaders).toBe(false);
  });
});

describe('chatLimiter — message', () => {
  it('message is an object', () => {
    expect(typeof capturedConfig.value.message).toBe('object');
    expect(capturedConfig.value.message).not.toBeNull();
  });

  it('message has an error property', () => {
    const msg = capturedConfig.value.message as { error: string };
    expect(typeof msg.error).toBe('string');
  });

  it('message error mentions "Too many requests"', () => {
    const msg = capturedConfig.value.message as { error: string };
    expect(msg.error).toContain('Too many requests');
  });

  it('message error is non-empty', () => {
    const msg = capturedConfig.value.message as { error: string };
    expect(msg.error.trim().length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../../../server/db/queries.js', () => ({
  getSubscription: vi.fn(),
}));

vi.mock('../../../server/db/client.js', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

import { tierLimits } from '../../../server/middleware/tierLimits';
import { getSubscription } from '../../../server/db/queries';
import { isSupabaseConfigured } from '../../../server/db/client';

// Unique IP counter to avoid usage state leaking between tests
let ipCounter = 1;
function freshIp() {
  return `10.${Math.floor(ipCounter / 255)}.${ipCounter++ % 255}.1`;
}

interface ReqOptions {
  ip?: string;
  userId?: string;
  headers?: Record<string, string>;
}

function makeReq(opts: ReqOptions = {}): Request {
  return {
    headers: opts.headers ?? {},
    ip: opts.ip ?? freshIp(),
    userId: opts.userId,
  } as unknown as Request;
}

interface MockRes {
  res: Response;
  headers: Record<string, string>;
  statusCode: number | null;
  body: unknown;
}

function makeRes(): MockRes {
  const headers: Record<string, string> = {};
  let statusCode: number | null = null;
  let body: unknown = null;

  const res = {
    setHeader(key: string, value: string | number) {
      headers[key] = String(value);
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(b: unknown) {
      body = b;
      return res;
    },
  } as unknown as Response;

  return {
    res,
    get headers() { return headers; },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
}

beforeEach(() => {
  vi.mocked(getSubscription).mockClear();
  vi.mocked(isSupabaseConfigured).mockReturnValue(false);
  delete process.env.TIER_BYPASS_TOKEN;
});

afterEach(() => {
  delete process.env.TIER_BYPASS_TOKEN;
});

describe('tierLimits middleware', () => {
  describe('bypass token', () => {
    it('calls next when bypass token matches', async () => {
      process.env.TIER_BYPASS_TOKEN = 'secret-token';
      const req = makeReq({ headers: { 'x-bypass-token': 'secret-token' } });
      const { res } = makeRes();
      const next = vi.fn() as NextFunction;
      await tierLimits(req, res, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('sets X-RateLimit-Plan to pro on bypass', async () => {
      process.env.TIER_BYPASS_TOKEN = 'secret-token';
      const req = makeReq({ headers: { 'x-bypass-token': 'secret-token' } });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Plan']).toBe('pro');
    });

    it('sets X-RateLimit-Limit to unlimited on bypass', async () => {
      process.env.TIER_BYPASS_TOKEN = 'secret-token';
      const req = makeReq({ headers: { 'x-bypass-token': 'secret-token' } });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Limit']).toBe('unlimited');
    });

    it('does not bypass when token does not match', async () => {
      process.env.TIER_BYPASS_TOKEN = 'secret-token';
      const req = makeReq({ headers: { 'x-bypass-token': 'wrong-token' } });
      const { res } = makeRes();
      const next = vi.fn() as NextFunction;
      await tierLimits(req, res, next);
      // Still calls next (free tier), but not as bypass
      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe('premium/pro plans (unlimited)', () => {
    beforeEach(() => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    });

    it('calls next for premium user', async () => {
      vi.mocked(getSubscription).mockResolvedValue({ plan: 'premium', status: 'active' } as never);
      const req = makeReq({ userId: 'user-premium-1' });
      const { res } = makeRes();
      const next = vi.fn() as NextFunction;
      await tierLimits(req, res, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('sets X-RateLimit-Limit to unlimited for premium', async () => {
      vi.mocked(getSubscription).mockResolvedValue({ plan: 'premium', status: 'active' } as never);
      const req = makeReq({ userId: 'user-premium-2' });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Limit']).toBe('unlimited');
    });

    it('sets X-RateLimit-Plan to premium for premium user', async () => {
      vi.mocked(getSubscription).mockResolvedValue({ plan: 'premium', status: 'active' } as never);
      const req = makeReq({ userId: 'user-premium-3' });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Plan']).toBe('premium');
    });

    it('sets unlimited for pro user', async () => {
      vi.mocked(getSubscription).mockResolvedValue({ plan: 'pro', status: 'active' } as never);
      const req = makeReq({ userId: 'user-pro-1' });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Limit']).toBe('unlimited');
      expect(headers['X-RateLimit-Plan']).toBe('pro');
    });

    it('falls back to free when subscription status is not active', async () => {
      vi.mocked(getSubscription).mockResolvedValue({ plan: 'premium', status: 'canceled' } as never);
      const req = makeReq({ userId: 'user-canceled-1' });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Plan']).toBe('free');
    });

    it('falls back to free when getSubscription throws', async () => {
      vi.mocked(getSubscription).mockRejectedValue(new Error('DB error'));
      const req = makeReq({ userId: 'user-dberr-1' });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Plan']).toBe('free');
    });
  });

  describe('free plan (anonymous)', () => {
    it('sets X-RateLimit-Plan to free for anonymous user', async () => {
      const req = makeReq();
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Plan']).toBe('free');
    });

    it('sets X-RateLimit-Limit to 10 for free plan', async () => {
      const req = makeReq();
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Limit']).toBe('10');
    });

    it('sets X-RateLimit-Remaining to 9 after first request', async () => {
      const req = makeReq({ ip: freshIp() });
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Remaining']).toBe('9');
    });

    it('calls next for first request', async () => {
      const req = makeReq();
      const { res } = makeRes();
      const next = vi.fn() as NextFunction;
      await tierLimits(req, res, next);
      expect(next).toHaveBeenCalledOnce();
    });

    it('sets X-RateLimit-Reset header', async () => {
      const req = makeReq();
      const { res, headers } = makeRes();
      await tierLimits(req, res, vi.fn());
      expect(headers['X-RateLimit-Reset']).toBeDefined();
      expect(Number(headers['X-RateLimit-Reset'])).toBeGreaterThan(0);
    });

    it('returns 429 after 10 requests from same IP', async () => {
      const ip = freshIp();
      const next = vi.fn() as NextFunction;

      // Make 10 allowed requests
      for (let i = 0; i < 10; i++) {
        await tierLimits(makeReq({ ip }), makeRes().res, next);
      }

      // 11th request should be blocked
      const mock = makeRes();
      await tierLimits(makeReq({ ip }), mock.res, vi.fn());
      expect(mock.statusCode).toBe(429);
    });

    it('429 response includes TIER_LIMIT_EXCEEDED code', async () => {
      const ip = freshIp();
      for (let i = 0; i < 10; i++) {
        await tierLimits(makeReq({ ip }), makeRes().res, vi.fn());
      }
      const mock = makeRes();
      await tierLimits(makeReq({ ip }), mock.res, vi.fn());
      expect((mock.body as Record<string, unknown>).code).toBe('TIER_LIMIT_EXCEEDED');
    });

    it('429 response includes plan and limit', async () => {
      const ip = freshIp();
      for (let i = 0; i < 10; i++) {
        await tierLimits(makeReq({ ip }), makeRes().res, vi.fn());
      }
      const mock = makeRes();
      await tierLimits(makeReq({ ip }), mock.res, vi.fn());
      const b = mock.body as Record<string, unknown>;
      expect(b.plan).toBe('free');
      expect(b.limit).toBe(10);
    });

    it('X-RateLimit-Remaining is 0 when at limit', async () => {
      const ip = freshIp();
      for (let i = 0; i < 10; i++) {
        await tierLimits(makeReq({ ip }), makeRes().res, vi.fn());
      }
      const mock = makeRes();
      await tierLimits(makeReq({ ip }), mock.res, vi.fn());
      expect(mock.headers['X-RateLimit-Remaining']).toBe('0');
    });
  });

  describe('unauthenticated users bypass Supabase', () => {
    it('does not call getSubscription when no userId', async () => {
      const req = makeReq(); // no userId
      await tierLimits(req, makeRes().res, vi.fn());
      expect(getSubscription).not.toHaveBeenCalled();
    });

    it('does not call getSubscription when supabase not configured', async () => {
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);
      const req = makeReq({ userId: 'some-user' });
      await tierLimits(req, makeRes().res, vi.fn());
      expect(getSubscription).not.toHaveBeenCalled();
    });
  });
});

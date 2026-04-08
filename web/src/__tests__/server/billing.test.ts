import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../server/middleware/auth';

// ─── Auth mock ───────────────────────────────────────────────────────────────

vi.mock('../../../server/middleware/auth.js', () => ({
  requireAuth: vi.fn((req: Request, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).userId = 'user-test';
    next();
  }),
}));

// ─── Stripe service mocks ─────────────────────────────────────────────────────

const mockIsStripeConfigured = vi.fn();
const mockHandleWebhookEvent = vi.fn();
const mockCreateCheckoutSession = vi.fn();
const mockCreatePortalSession = vi.fn();

vi.mock('../../../server/services/stripe.js', () => ({
  isStripeConfigured: () => mockIsStripeConfigured(),
  handleWebhookEvent: (...args: unknown[]) => mockHandleWebhookEvent(...args),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
  createPortalSession: (...args: unknown[]) => mockCreatePortalSession(...args),
}));

// ─── DB mock ──────────────────────────────────────────────────────────────────

const mockGetSubscription = vi.fn();

vi.mock('../../../server/db/queries.js', () => ({
  getSubscription: (...args: unknown[]) => mockGetSubscription(...args),
}));

// ─── Supabase admin mock (for checkout's dynamic import) ─────────────────────

const mockGetUserById = vi.fn();

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin: () => ({
    auth: {
      admin: {
        getUserById: mockGetUserById,
      },
    },
  }),
}));

import billingRouter from '../../../server/routes/billing';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function handle(
  method: string,
  path: string,
  overrides: Partial<Request> = {},
): Promise<{ statusCode: number; body: unknown }> {
  return new Promise((resolve) => {
    let status = 200;
    let body: unknown;

    const res = {
      get statusCode() { return status; },
      status(code: number) { status = code; return res; },
      json(data: unknown) {
        body = data;
        resolve({ statusCode: status, body: data });
        return res;
      },
    } as unknown as Response;

    const req = {
      method: method.toUpperCase(),
      url: path,
      path,
      baseUrl: '',
      originalUrl: path,
      query: {},
      body: {},
      params: {},
      headers: {},
      ...overrides,
    } as unknown as Request;

    (billingRouter as unknown as (req: Request, res: Response, next: NextFunction) => void)(
      req,
      res,
      () => resolve({ statusCode: 404, body: null }),
    );
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockIsStripeConfigured.mockReturnValue(true);
  mockGetUserById.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
});

// ─── POST /webhook ────────────────────────────────────────────────────────────

describe('POST /webhook', () => {
  it('returns 503 when Stripe is not configured', async () => {
    mockIsStripeConfigured.mockReturnValue(false);
    const { statusCode, body } = await handle('POST', '/webhook');
    expect(statusCode).toBe(503);
    expect((body as Record<string, unknown>).error).toContain('Stripe not configured');
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const { statusCode, body } = await handle('POST', '/webhook', { headers: {} } as Partial<Request>);
    expect(statusCode).toBe(400);
    expect((body as Record<string, unknown>).error).toContain('stripe-signature');
  });

  it('returns webhook result on success', async () => {
    const result = { received: true };
    mockHandleWebhookEvent.mockResolvedValue(result);
    const { statusCode, body } = await handle('POST', '/webhook', {
      headers: { 'stripe-signature': 'sig_test' },
    } as Partial<Request>);
    expect(statusCode).toBe(200);
    expect(body).toEqual(result);
  });

  it('returns 400 when handleWebhookEvent throws', async () => {
    mockHandleWebhookEvent.mockRejectedValue(new Error('bad signature'));
    const { statusCode, body } = await handle('POST', '/webhook', {
      headers: { 'stripe-signature': 'sig_test' },
    } as Partial<Request>);
    expect(statusCode).toBe(400);
    expect((body as Record<string, unknown>).error).toBe('Webhook processing failed');
  });

  it('passes body and sig to handleWebhookEvent', async () => {
    mockHandleWebhookEvent.mockResolvedValue({});
    const payload = Buffer.from('raw-body');
    await handle('POST', '/webhook', {
      headers: { 'stripe-signature': 'whsec_abc' },
      body: payload,
    } as Partial<Request>);
    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(payload, 'whsec_abc');
  });
});

// ─── POST /checkout ───────────────────────────────────────────────────────────

describe('POST /checkout', () => {
  it('returns 503 when Stripe is not configured', async () => {
    mockIsStripeConfigured.mockReturnValue(false);
    const { statusCode } = await handle('POST', '/checkout', {
      body: { priceId: 'price_123', interval: 'month' },
    } as Partial<Request>);
    expect(statusCode).toBe(503);
  });

  it('returns 400 when priceId is missing', async () => {
    const { statusCode, body } = await handle('POST', '/checkout', {
      body: { interval: 'month' },
    } as Partial<Request>);
    expect(statusCode).toBe(400);
    expect((body as Record<string, unknown>).error).toContain('priceId');
  });

  it('returns 400 when interval is missing', async () => {
    const { statusCode, body } = await handle('POST', '/checkout', {
      body: { priceId: 'price_123' },
    } as Partial<Request>);
    expect(statusCode).toBe(400);
    expect((body as Record<string, unknown>).error).toContain('interval');
  });

  it('returns { url } on success', async () => {
    mockCreateCheckoutSession.mockResolvedValue('https://checkout.stripe.com/session');
    const { statusCode, body } = await handle('POST', '/checkout', {
      body: { priceId: 'price_123', interval: 'month' },
    } as Partial<Request>);
    expect(statusCode).toBe(200);
    expect((body as Record<string, unknown>).url).toBe('https://checkout.stripe.com/session');
  });

  it('returns 500 on error', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('stripe error'));
    const { statusCode } = await handle('POST', '/checkout', {
      body: { priceId: 'price_123', interval: 'year' },
    } as Partial<Request>);
    expect(statusCode).toBe(500);
  });

  it('passes userId, email, priceId, interval to createCheckoutSession', async () => {
    mockGetUserById.mockResolvedValue({ data: { user: { email: 'user@test.com' } } });
    mockCreateCheckoutSession.mockResolvedValue('https://url');
    await handle('POST', '/checkout', {
      body: { priceId: 'price_abc', interval: 'year' },
    } as Partial<Request>);
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith('user-test', 'user@test.com', 'price_abc', 'year');
  });
});

// ─── POST /portal ─────────────────────────────────────────────────────────────

describe('POST /portal', () => {
  it('returns 503 when Stripe is not configured', async () => {
    mockIsStripeConfigured.mockReturnValue(false);
    const { statusCode } = await handle('POST', '/portal');
    expect(statusCode).toBe(503);
  });

  it('returns 400 when no subscription found', async () => {
    mockGetSubscription.mockResolvedValue(null);
    const { statusCode, body } = await handle('POST', '/portal');
    expect(statusCode).toBe(400);
    expect((body as Record<string, unknown>).error).toContain('No active subscription');
  });

  it('returns 400 when subscription has no stripe_customer_id', async () => {
    mockGetSubscription.mockResolvedValue({ plan: 'premium', stripe_customer_id: null });
    const { statusCode } = await handle('POST', '/portal');
    expect(statusCode).toBe(400);
  });

  it('returns { url } on success', async () => {
    mockGetSubscription.mockResolvedValue({ stripe_customer_id: 'cus_123' });
    mockCreatePortalSession.mockResolvedValue('https://billing.stripe.com/portal');
    const { statusCode, body } = await handle('POST', '/portal');
    expect(statusCode).toBe(200);
    expect((body as Record<string, unknown>).url).toBe('https://billing.stripe.com/portal');
  });

  it('returns 500 on error', async () => {
    mockGetSubscription.mockRejectedValue(new Error('db fail'));
    const { statusCode } = await handle('POST', '/portal');
    expect(statusCode).toBe(500);
  });
});

// ─── GET /subscription ────────────────────────────────────────────────────────

describe('GET /subscription', () => {
  it('returns plan, status, currentPeriodEnd, hasStripeCustomer', async () => {
    mockGetSubscription.mockResolvedValue({
      plan: 'premium',
      status: 'active',
      current_period_end: '2026-12-31',
      stripe_customer_id: 'cus_abc',
    });
    const { body } = await handle('GET', '/subscription');
    expect(body).toEqual({
      plan: 'premium',
      status: 'active',
      currentPeriodEnd: '2026-12-31',
      hasStripeCustomer: true,
    });
  });

  it('returns free defaults when subscription is null', async () => {
    mockGetSubscription.mockResolvedValue(null);
    const { body } = await handle('GET', '/subscription');
    expect(body).toEqual({
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null,
      hasStripeCustomer: false,
    });
  });

  it('returns free defaults on db error (no 500)', async () => {
    mockGetSubscription.mockRejectedValue(new Error('db error'));
    const { statusCode, body } = await handle('GET', '/subscription');
    expect(statusCode).toBe(200);
    expect((body as Record<string, unknown>).plan).toBe('free');
  });

  it('hasStripeCustomer is false when stripe_customer_id is null', async () => {
    mockGetSubscription.mockResolvedValue({ plan: 'premium', status: 'active', current_period_end: null, stripe_customer_id: null });
    const { body } = await handle('GET', '/subscription');
    expect((body as Record<string, unknown>).hasStripeCustomer).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks (run before vi.mock factory) ───────────────────────────────
const mocks = vi.hoisted(() => {
  const mockConstructEvent = vi.fn();
  const mockSubscriptionsRetrieve = vi.fn();
  const mockUpsertSubscription = vi.fn();

  const stripeInstance = {
    webhooks: { constructEvent: mockConstructEvent },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
    customers: { create: vi.fn() },
  };

  return { mockConstructEvent, mockSubscriptionsRetrieve, mockUpsertSubscription, stripeInstance };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('stripe', () => {
  // Regular function (not arrow) so it works as a constructor
  function MockStripe() {
    return mocks.stripeInstance;
  }
  return { default: MockStripe };
});

vi.mock('../../../server/config.js', () => ({
  config: {
    stripeSecretKey: 'sk_test_mock_key',
    stripeWebhookSecret: 'whsec_mock',
    appUrl: 'http://localhost:5173',
    port: 3001,
    nodeEnv: 'test',
    anthropicApiKey: '',
    sentryDsn: '',
    projectRoot: '/mock',
    gitBashPath: undefined,
    claudeCliPath: undefined,
  },
}));

vi.mock('../../../server/db/queries.js', () => ({
  getSubscription: vi.fn(() => Promise.resolve(null)),
  upsertSubscription: (...args: unknown[]) => mocks.mockUpsertSubscription(...args),
}));

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

import { isStripeConfigured, handleWebhookEvent } from '../../../server/services/stripe';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSubscription(overrides: {
  id?: string;
  status?: string;
  priceId?: string;
  userId?: string;
  periodStart?: number;
  periodEnd?: number;
} = {}) {
  return {
    id: overrides.id ?? 'sub_123',
    status: overrides.status ?? 'active',
    metadata: { userId: overrides.userId ?? 'user-1' },
    items: { data: [{ price: { id: overrides.priceId ?? 'price_premium_monthly' } }] },
    current_period_start: overrides.periodStart ?? 1700000000,
    current_period_end: overrides.periodEnd ?? 1702000000,
  };
}

beforeEach(() => {
  mocks.mockConstructEvent.mockClear();
  mocks.mockSubscriptionsRetrieve.mockClear();
  mocks.mockUpsertSubscription.mockClear();
  mocks.mockUpsertSubscription.mockResolvedValue({ data: {}, error: null });
});

// ─── isStripeConfigured ───────────────────────────────────────────────────────

describe('isStripeConfigured', () => {
  it('returns true when stripeSecretKey is set', () => {
    expect(isStripeConfigured()).toBe(true);
  });
});

// ─── handleWebhookEvent ───────────────────────────────────────────────────────

describe('handleWebhookEvent', () => {
  const body = Buffer.from('{}');
  const sig = 'stripe-sig';

  describe('checkout.session.completed', () => {
    it('calls upsertSubscription with plan=premium for premium price ID', async () => {
      const sub = makeSubscription({ priceId: 'price_premium_monthly', status: 'active' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user-1' },
            subscription: 'sub_123',
            customer: 'cus_123',
          },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).toHaveBeenCalledOnce();
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.plan).toBe('premium');
    });

    it('calls upsertSubscription with plan=pro for pro price ID', async () => {
      const sub = makeSubscription({ priceId: 'price_pro_monthly', status: 'active' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user-1' },
            subscription: 'sub_123',
            customer: 'cus_123',
          },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.plan).toBe('pro');
    });

    it('unknown price ID defaults to premium plan', async () => {
      const sub = makeSubscription({ priceId: 'price_unknown_xyz' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: 'user-1' }, subscription: 'sub_123', customer: 'cus_123' },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.plan).toBe('premium');
    });

    it('sets status=trialing when subscription is trialing', async () => {
      const sub = makeSubscription({ status: 'trialing' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: 'user-1' }, subscription: 'sub_123', customer: 'cus_123' },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('trialing');
    });

    it('sets status=active when subscription is active', async () => {
      const sub = makeSubscription({ status: 'active' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: 'user-1' }, subscription: 'sub_123', customer: 'cus_123' },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('active');
    });

    it('skips upsert when no userId in metadata', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { metadata: {}, subscription: 'sub_123', customer: 'cus_123' } },
      });

      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });

    it('returns { received: true }', async () => {
      const sub = makeSubscription();
      mocks.mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: { metadata: { userId: 'user-1' }, subscription: 'sub_123', customer: 'cus_123' },
        },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      const result = await handleWebhookEvent(body, sig);
      expect(result).toEqual({ received: true });
    });
  });

  describe('customer.subscription.updated — status mapping', () => {
    function makeUpdateEvent(status: string) {
      return {
        type: 'customer.subscription.updated',
        data: { object: makeSubscription({ status }) },
      };
    }

    it('maps trialing → trialing', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('trialing'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('trialing');
    });

    it('maps past_due → past_due', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('past_due'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('past_due');
    });

    it('maps active → active', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('active'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('active');
    });

    it('maps canceled → canceled', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('canceled'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('canceled');
    });

    it('maps unknown status → canceled', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('incomplete'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('canceled');
    });

    it('skips upsert when no userId in metadata', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: { ...makeSubscription(), metadata: {} } },
      });
      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });

    it('includes period dates in upsert', async () => {
      mocks.mockConstructEvent.mockReturnValue(makeUpdateEvent('active'));
      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.current_period_start).toBeDefined();
      expect(updates.current_period_end).toBeDefined();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('sets plan=free', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: makeSubscription() },
      });

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.plan).toBe('free');
    });

    it('sets status=canceled', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: makeSubscription() },
      });

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('canceled');
    });

    it('sets stripe_subscription_id=null', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: makeSubscription() },
      });

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.stripe_subscription_id).toBeNull();
    });

    it('skips upsert when no userId', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: { ...makeSubscription(), metadata: {} } },
      });

      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });
  });

  describe('invoice.payment_failed', () => {
    it('calls upsertSubscription with status=past_due', async () => {
      const sub = makeSubscription({ userId: 'user-1' });
      mocks.mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { subscription: 'sub_123' } },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue(sub);

      await handleWebhookEvent(body, sig);
      const [, updates] = mocks.mockUpsertSubscription.mock.calls[0];
      expect(updates.status).toBe('past_due');
    });

    it('skips upsert when no subscription on invoice', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { subscription: null } },
      });

      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });

    it('skips upsert when subscription has no userId', async () => {
      mocks.mockConstructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { subscription: 'sub_123' } },
      });
      mocks.mockSubscriptionsRetrieve.mockResolvedValue({ ...makeSubscription(), metadata: {} });

      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });
  });

  describe('unknown event type', () => {
    it('returns { received: true } without error', async () => {
      mocks.mockConstructEvent.mockReturnValue({ type: 'payment_intent.created', data: { object: {} } });
      const result = await handleWebhookEvent(body, sig);
      expect(result).toEqual({ received: true });
    });

    it('does not call upsertSubscription for unknown event', async () => {
      mocks.mockConstructEvent.mockReturnValue({ type: 'charge.succeeded', data: { object: {} } });
      await handleWebhookEvent(body, sig);
      expect(mocks.mockUpsertSubscription).not.toHaveBeenCalled();
    });
  });
});

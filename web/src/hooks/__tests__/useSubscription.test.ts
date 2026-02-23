import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';

// ── Mocks ──

vi.mock('../../utils/logger.js', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from '../../utils/logger.js';
import { useSubscription } from '../useSubscription';
import type { SubscriptionState } from '../useSubscription';

// ── Helpers ──

function makeSession(token = 'test-token-123'): Session {
  return {
    access_token: token,
    refresh_token: 'refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'user-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-01-01T00:00:00Z',
    },
  } as Session;
}

function mockFetchResponse(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

// ── Test suite ──

describe('useSubscription', () => {
  const originalFetch = globalThis.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();

    // Mock window.location.href setter
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  // ── Default initialization ──

  describe('default initialization', () => {
    it('starts with free plan and active status', () => {
      const { result } = renderHook(() => useSubscription(null));
      expect(result.current.plan).toBe('free');
      expect(result.current.status).toBe('active');
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.hasStripeCustomer).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('exposes checkout, manage, and refresh functions', () => {
      const { result } = renderHook(() => useSubscription(null));
      expect(typeof result.current.checkout).toBe('function');
      expect(typeof result.current.manage).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  // ── Subscription fetch ──

  describe('subscription fetch', () => {
    it('does not fetch when session is null', async () => {
      renderHook(() => useSubscription(null));
      await act(async () => { vi.advanceTimersByTime(10); });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('fetches subscription on mount when session is present', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({
        plan: 'premium',
        status: 'active',
        currentPeriodEnd: '2026-03-01',
        hasStripeCustomer: true,
      });

      const { result } = renderHook(() => useSubscription(session));

      // The hook uses setTimeout(..., 0) so advance timers
      await act(async () => { vi.advanceTimersByTime(1); });
      // Wait for the fetch promise to resolve
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/billing/subscription',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token-123' },
        }),
      );
      expect(result.current.plan).toBe('premium');
      expect(result.current.status).toBe('active');
      expect(result.current.currentPeriodEnd).toBe('2026-03-01');
      expect(result.current.hasStripeCustomer).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('sets loading=true while fetching', async () => {
      const session = makeSession();
      let resolvePromise: (v: unknown) => void;
      const pending = new Promise((r) => { resolvePromise = r; });
      globalThis.fetch = vi.fn().mockReturnValue(pending);

      const { result } = renderHook(() => useSubscription(session));

      // Trigger the setTimeout
      await act(async () => { vi.advanceTimersByTime(1); });

      // fetchSubscription has been called, setState loading=true should have run
      // We need to resolve the promise to check loading transitions
      expect(result.current.loading).toBe(true);

      // Now resolve
      await act(async () => {
        resolvePromise!({ ok: true, json: () => Promise.resolve({ plan: 'free' }) });
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
    });

    it('handles non-ok response gracefully', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ error: 'not found' }, false, 404);

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      // State should remain at defaults, loading=false
      expect(result.current.plan).toBe('free');
      expect(result.current.loading).toBe(false);
    });

    it('handles network error gracefully', async () => {
      const session = makeSession();
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('free');
      expect(result.current.loading).toBe(false);
    });

    it('applies defaults for missing response fields', async () => {
      const session = makeSession();
      // Response with no fields at all
      globalThis.fetch = mockFetchResponse({});

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('free');
      expect(result.current.status).toBe('active');
      expect(result.current.currentPeriodEnd).toBeNull();
      expect(result.current.hasStripeCustomer).toBe(false);
    });

    it('re-fetches when session changes', async () => {
      const session1 = makeSession('token-A');
      globalThis.fetch = mockFetchResponse({ plan: 'premium', status: 'active' });

      const { result, rerender } = renderHook(
        ({ session }) => useSubscription(session),
        { initialProps: { session: session1 } },
      );

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });
      expect(result.current.plan).toBe('premium');

      // Change session
      const session2 = makeSession('token-B');
      globalThis.fetch = mockFetchResponse({ plan: 'pro', status: 'trialing' });

      rerender({ session: session2 });

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('pro');
      expect(result.current.status).toBe('trialing');
    });

    it('calls refresh to manually re-fetch subscription', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free', status: 'active' });

      const { result } = renderHook(() => useSubscription(session));

      // Initial fetch
      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });
      expect(result.current.plan).toBe('free');

      // Now change mock and call refresh
      globalThis.fetch = mockFetchResponse({ plan: 'premium', status: 'active', hasStripeCustomer: true });

      await act(async () => { await result.current.refresh(); });

      expect(result.current.plan).toBe('premium');
      expect(result.current.hasStripeCustomer).toBe(true);
    });
  });

  // ── Checkout flow ──

  describe('checkout', () => {
    it('does nothing when session is null', async () => {
      const { result } = renderHook(() => useSubscription(null));

      await act(async () => {
        await result.current.checkout('price_123', 'month');
      });

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('sends POST to /api/billing/checkout with correct body', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ url: 'https://checkout.stripe.com/session/123' });

      const { result } = renderHook(() => useSubscription(session));

      // Skip the auto-fetch from mount
      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      // Reset to track only checkout call
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockClear();
      globalThis.fetch = mockFetchResponse({ url: 'https://checkout.stripe.com/session/123' });

      await act(async () => {
        await result.current.checkout('price_premium_monthly', 'month');
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/billing/checkout',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123',
          },
          body: JSON.stringify({ priceId: 'price_premium_monthly', interval: 'month' }),
        }),
      );
    });

    it('redirects to checkout URL on success', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ url: 'https://checkout.stripe.com/session/abc' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      globalThis.fetch = mockFetchResponse({ url: 'https://checkout.stripe.com/session/abc' });

      await act(async () => {
        await result.current.checkout('price_pro_yearly', 'year');
      });

      expect(window.location.href).toBe('https://checkout.stripe.com/session/abc');
    });

    it('does not redirect when response has no url', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      globalThis.fetch = mockFetchResponse({});

      await act(async () => {
        await result.current.checkout('price_123', 'month');
      });

      // href should remain empty (our mock default)
      expect(window.location.href).toBe('');
    });

    it('does not redirect when checkout response is not ok', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      globalThis.fetch = mockFetchResponse({ error: 'bad' }, false, 400);

      await act(async () => {
        await result.current.checkout('price_123', 'month');
      });

      expect(window.location.href).toBe('');
    });

    it('logs error on checkout network failure', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      const error = new Error('Checkout network error');
      globalThis.fetch = vi.fn().mockRejectedValue(error);

      await act(async () => {
        await result.current.checkout('price_123', 'month');
      });

      expect(logger.error).toHaveBeenCalledWith('[billing] Checkout error:', error);
    });
  });

  // ── Manage portal flow ──

  describe('manage', () => {
    it('does nothing when session is null', async () => {
      const { result } = renderHook(() => useSubscription(null));

      await act(async () => {
        await result.current.manage();
      });

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('sends POST to /api/billing/portal', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ url: 'https://billing.stripe.com/portal/abc' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      (globalThis.fetch as ReturnType<typeof vi.fn>).mockClear();
      globalThis.fetch = mockFetchResponse({ url: 'https://billing.stripe.com/portal/abc' });

      await act(async () => {
        await result.current.manage();
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/billing/portal',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123',
          },
        }),
      );
    });

    it('redirects to portal URL on success', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'premium' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      globalThis.fetch = mockFetchResponse({ url: 'https://billing.stripe.com/portal/xyz' });

      await act(async () => {
        await result.current.manage();
      });

      expect(window.location.href).toBe('https://billing.stripe.com/portal/xyz');
    });

    it('does not redirect when portal response has no url', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      globalThis.fetch = mockFetchResponse({});

      await act(async () => {
        await result.current.manage();
      });

      expect(window.location.href).toBe('');
    });

    it('logs error on portal network failure', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      const error = new Error('Portal network error');
      globalThis.fetch = vi.fn().mockRejectedValue(error);

      await act(async () => {
        await result.current.manage();
      });

      expect(logger.error).toHaveBeenCalledWith('[billing] Portal error:', error);
    });
  });

  // ── Plan state mapping ──

  describe('plan state mapping', () => {
    it('correctly maps pro plan with trialing status', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({
        plan: 'pro',
        status: 'trialing',
        currentPeriodEnd: '2026-04-15T00:00:00Z',
        hasStripeCustomer: true,
      });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('pro');
      expect(result.current.status).toBe('trialing');
      expect(result.current.currentPeriodEnd).toBe('2026-04-15T00:00:00Z');
      expect(result.current.hasStripeCustomer).toBe(true);
    });

    it('correctly maps canceled status', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({
        plan: 'premium',
        status: 'canceled',
        currentPeriodEnd: '2026-02-28',
        hasStripeCustomer: true,
      });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('premium');
      expect(result.current.status).toBe('canceled');
    });

    it('correctly maps past_due status', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({
        plan: 'premium',
        status: 'past_due',
        hasStripeCustomer: true,
      });

      const { result } = renderHook(() => useSubscription(session));

      await act(async () => { vi.advanceTimersByTime(1); });
      await act(async () => { await vi.runAllTimersAsync(); });

      expect(result.current.plan).toBe('premium');
      expect(result.current.status).toBe('past_due');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('cleans up timer on unmount', async () => {
      const session = makeSession();
      globalThis.fetch = mockFetchResponse({ plan: 'free' });

      const { unmount } = renderHook(() => useSubscription(session));

      // Unmount before timer fires
      unmount();

      // Advance timer — fetch should not be called because clearTimeout ran
      await act(async () => { vi.advanceTimersByTime(10); });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('refresh does nothing when session is null', async () => {
      const { result } = renderHook(() => useSubscription(null));

      await act(async () => {
        await result.current.refresh();
      });

      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });
});

import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { PlanId } from '../config/tiers';

export interface SubscriptionState {
  plan: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  loading: boolean;
}

export function useSubscription(session: Session | null) {
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    status: 'active',
    currentPeriodEnd: null,
    hasStripeCustomer: false,
    loading: false,
  });

  const fetchSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch('/api/billing/subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setState({
          plan: data.plan ?? 'free',
          status: data.status ?? 'active',
          currentPeriodEnd: data.currentPeriodEnd ?? null,
          hasStripeCustomer: data.hasStripeCustomer ?? false,
          loading: false,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    void fetchSubscription();
  }, [fetchSubscription]);

  const checkout = useCallback(async (priceId: string, interval: 'month' | 'year') => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId, interval }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (err) {
      console.error('[billing] Checkout error:', err);
    }
  }, [session?.access_token]);

  const manage = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) window.location.href = url;
      }
    } catch (err) {
      console.error('[billing] Portal error:', err);
    }
  }, [session?.access_token]);

  return {
    ...state,
    checkout,
    manage,
    refresh: fetchSubscription,
  };
}

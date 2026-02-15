import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { getSubscription } from '../db/queries.js';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  isStripeConfigured,
} from '../services/stripe.js';

const router = Router();

/**
 * POST /api/billing/webhook
 * Stripe sends raw body — must be registered BEFORE express.json()
 */
router.post('/webhook', async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const result = await handleWebhookEvent(req.body as Buffer, sig);
    res.json(result);
  } catch (err) {
    console.error('[billing] Webhook error:', err);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/billing/checkout — create a Stripe Checkout session
 * Body: { priceId: string, interval: 'month' | 'year' }
 */
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const { userId } = req as AuthenticatedRequest;
  const { priceId, interval } = req.body as { priceId: string; interval: 'month' | 'year' };

  if (!priceId || !interval) {
    res.status(400).json({ error: 'priceId and interval are required' });
    return;
  }

  try {
    // Get user email from Supabase auth
    const { getSupabaseAdmin } = await import('../db/client.js');
    const { data: { user } } = await getSupabaseAdmin().auth.admin.getUserById(userId);
    const email = user?.email ?? '';

    const url = await createCheckoutSession(userId, email, priceId, interval);
    res.json({ url });
  } catch (err) {
    console.error('[billing] Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/billing/portal — create a Stripe Customer Portal session
 */
router.post('/portal', requireAuth, async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const { userId } = req as AuthenticatedRequest;

  try {
    const subscription = await getSubscription(userId);
    if (!subscription?.stripe_customer_id) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    const url = await createPortalSession(subscription.stripe_customer_id);
    res.json({ url });
  } catch (err) {
    console.error('[billing] Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * GET /api/billing/subscription — get current user's subscription
 */
router.get('/subscription', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;

  try {
    const subscription = await getSubscription(userId);
    res.json({
      plan: subscription?.plan ?? 'free',
      status: subscription?.status ?? 'active',
      currentPeriodEnd: subscription?.current_period_end ?? null,
      hasStripeCustomer: !!subscription?.stripe_customer_id,
    });
  } catch (err) {
    console.error('[billing] Subscription fetch error:', err);
    res.json({ plan: 'free', status: 'active', currentPeriodEnd: null, hasStripeCustomer: false });
  }
});

export default router;

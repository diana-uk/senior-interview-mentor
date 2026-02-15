import Stripe from 'stripe';
import { config } from '../config.js';
import { upsertSubscription, getSubscription } from '../db/queries.js';
import { getSupabaseAdmin } from '../db/client.js';
import type { PlanId } from '../../src/config/tiers.js';

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripe) return stripe;
  if (!config.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2025-04-30.basil' });
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!config.stripeSecretKey;
}

/**
 * Map Stripe price ID → plan ID.
 * These must match the stripePriceIds in tiers.ts config.
 */
const PRICE_TO_PLAN: Record<string, PlanId> = {};

function populatePriceToPlan() {
  // Dynamically import tiers to avoid circular deps at startup
  // We populate lazily on first webhook call
  if (Object.keys(PRICE_TO_PLAN).length > 0) return;

  // Placeholder values that match tiers.ts — updated when real IDs are set
  const mappings: [string, PlanId][] = [
    ['price_premium_monthly', 'premium'],
    ['price_premium_yearly', 'premium'],
    ['price_pro_monthly', 'pro'],
    ['price_pro_yearly', 'pro'],
  ];
  for (const [priceId, plan] of mappings) {
    PRICE_TO_PLAN[priceId] = plan;
  }
}

function planFromPriceId(priceId: string): PlanId {
  populatePriceToPlan();
  return PRICE_TO_PLAN[priceId] ?? 'premium';
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  interval: 'month' | 'year',
): Promise<string> {
  const client = getStripeClient();

  // Check if user already has a Stripe customer
  const existing = await getSubscription(userId);
  let customerId = existing?.stripe_customer_id;

  if (!customerId) {
    const customer = await client.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  const session = await client.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.appUrl}?billing=success`,
    cancel_url: `${config.appUrl}?billing=canceled`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId },
    },
    metadata: { userId },
  });

  return session.url!;
}

export async function createPortalSession(stripeCustomerId: string): Promise<string> {
  const client = getStripeClient();
  const session = await client.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${config.appUrl}`,
  });
  return session.url;
}

export async function handleWebhookEvent(body: Buffer, signature: string) {
  const client = getStripeClient();
  const event = client.webhooks.constructEvent(body, signature, config.stripeWebhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const subscription = await client.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id ?? '';
      const plan = planFromPriceId(priceId);

      await upsertSubscription(userId, {
        plan,
        status: subscription.status === 'trialing' ? 'trialing' : 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      // Update profile plan
      await getSupabaseAdmin()
        .from('profiles')
        .update({ plan })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id ?? '';
      const plan = planFromPriceId(priceId);
      const status = subscription.status === 'trialing' ? 'trialing'
        : subscription.status === 'past_due' ? 'past_due'
        : subscription.status === 'active' ? 'active'
        : 'canceled';

      await upsertSubscription(userId, {
        plan,
        status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      await getSupabaseAdmin()
        .from('profiles')
        .update({ plan })
        .eq('id', userId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await upsertSubscription(userId, {
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
      });

      await getSupabaseAdmin()
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', userId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;
      if (!subscriptionId) break;

      const subscription = await client.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await upsertSubscription(userId, { status: 'past_due' });
      break;
    }
  }

  return { received: true };
}

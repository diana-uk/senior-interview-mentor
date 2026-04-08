import type { PlanId } from '../middleware/rateLimit.js';

/** Grace period in days for expired subscriptions (mirrors rateLimit.ts constant) */
export const GRACE_PERIOD_DAYS = 7;

/** Threshold (0–1) at which soft upgrade hints appear */
export const UPGRADE_HINT_THRESHOLD = 0.8;

/**
 * Validate and normalize a plan ID from header input.
 * Falls back to 'free' for any unrecognised value.
 */
export function parsePlan(raw: unknown): PlanId {
  if (typeof raw === 'string' && (raw === 'free' || raw === 'premium' || raw === 'pro')) {
    return raw;
  }
  return 'free';
}

/**
 * Check whether a user is within the grace period after their
 * subscription has lapsed.
 */
export function isWithinGracePeriod(subscriptionEnd: string | undefined): boolean {
  if (!subscriptionEnd) return false;

  const endDate = new Date(subscriptionEnd);
  if (isNaN(endDate.getTime())) return false;

  const now = new Date();
  const diffMs = now.getTime() - endDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= GRACE_PERIOD_DAYS;
}

/**
 * Build a soft upgrade hint if usage is >= 80% of limit.
 * Returns undefined when below threshold or plan is unlimited.
 */
export function buildUpgradeHint(
  action: 'problem' | 'message' | 'interview',
  used: number,
  limit: number,
): string | undefined {
  if (limit === -1) return undefined;
  if (used / limit < UPGRADE_HINT_THRESHOLD) return undefined;

  switch (action) {
    case 'problem':
      return `You've used ${used} of ${limit} daily problems. Upgrade to Premium for unlimited access.`;
    case 'message':
      return `You've used ${used} of ${limit} messages for this problem. Upgrade for unlimited AI coaching.`;
    case 'interview':
      return `You've used ${used} of ${limit} daily mock interviews. Upgrade to Premium for unlimited practice.`;
  }
}

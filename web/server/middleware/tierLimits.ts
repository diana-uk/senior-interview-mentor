import type { Request, Response, NextFunction } from 'express';
import type { OptionalAuthRequest } from './auth.js';
import { getSubscription } from '../db/queries.js';
import { isSupabaseConfigured } from '../db/client.js';
import type { PlanId } from '../../src/config/tiers.js';
import { todayUTC, getNextMidnightUTC } from '../utils/rateLimitUtils.js';

// ---------------------------------------------------------------------------
// In-memory daily usage tracker
// ---------------------------------------------------------------------------

interface UsageEntry {
  count: number;
  /** UTC date string (YYYY-MM-DD) when this entry was created */
  date: string;
}

/** userId or IP → usage entry */
const usageMap = new Map<string, UsageEntry>();

function getUsage(key: string): UsageEntry {
  const today = todayUTC();
  const entry = usageMap.get(key);
  if (!entry || entry.date !== today) {
    const fresh: UsageEntry = { count: 0, date: today };
    usageMap.set(key, fresh);
    return fresh;
  }
  return entry;
}

// ---------------------------------------------------------------------------
// Plan limits
// ---------------------------------------------------------------------------

const DAILY_MESSAGE_LIMITS: Record<PlanId, number> = {
  free: 10, // ~3 problems at 3 messages each
  premium: -1, // unlimited
  pro: -1, // unlimited
};

// Clean up stale entries every hour to prevent memory leaks
setInterval(() => {
  const today = todayUTC();
  for (const [key, entry] of usageMap) {
    if (entry.date !== today) usageMap.delete(key);
  }
}, 60 * 60 * 1000);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Tier-based rate limiting for chat messages.
 * Must be used AFTER optionalAuth so req.userId may be set.
 *
 * - Authenticated users: looks up subscription plan, enforces daily limit
 * - Anonymous users: uses IP-based tracking, applies free tier limits
 * - Paid plans (premium/pro): no limit (-1)
 *
 * Sets X-RateLimit-* headers on the response for the frontend to consume.
 */
export async function tierLimits(req: Request, res: Response, next: NextFunction) {
  // Bypass via secret token set in env (for local dev / admin testing).
  // Set TIER_BYPASS_TOKEN in .env, then send X-Bypass-Token header to skip limits.
  const bypassToken = process.env.TIER_BYPASS_TOKEN;
  if (bypassToken && req.headers['x-bypass-token'] === bypassToken) {
    res.setHeader('X-RateLimit-Plan', 'pro');
    res.setHeader('X-RateLimit-Limit', 'unlimited');
    res.setHeader('X-RateLimit-Remaining', 'unlimited');
    next();
    return;
  }

  const userId = (req as OptionalAuthRequest).userId;
  let plan: PlanId = 'free';

  // Look up subscription for authenticated users
  if (userId && isSupabaseConfigured()) {
    try {
      const sub = await getSubscription(userId);
      if (sub?.plan && sub.status === 'active') {
        plan = sub.plan as PlanId;
      }
    } catch {
      // Fall back to free tier on DB errors
    }
  }

  const limit = DAILY_MESSAGE_LIMITS[plan] ?? DAILY_MESSAGE_LIMITS.free;

  // Unlimited plans skip counting
  if (limit === -1) {
    res.setHeader('X-RateLimit-Plan', plan);
    res.setHeader('X-RateLimit-Limit', 'unlimited');
    res.setHeader('X-RateLimit-Remaining', 'unlimited');
    next();
    return;
  }

  // Identify user by userId or IP
  const key = userId ?? req.ip ?? 'unknown';
  const usage = getUsage(key);

  // Calculate reset time (next midnight UTC)
  const resetTimeIso = getNextMidnightUTC();
  const resetEpoch = Math.floor(new Date(resetTimeIso).getTime() / 1000);

  const remaining = Math.max(0, limit - usage.count);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Plan', plan);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(resetEpoch));

  if (usage.count >= limit) {
    res.status(429).json({
      error: `You've reached your daily limit of ${limit} AI messages on the ${plan} plan. Upgrade to Premium for unlimited access.`,
      code: 'TIER_LIMIT_EXCEEDED',
      plan,
      limit,
      resetAt: resetTimeIso,
    });
    return;
  }

  // Increment usage count
  usage.count++;
  // Update remaining after increment
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - usage.count)));

  next();
}

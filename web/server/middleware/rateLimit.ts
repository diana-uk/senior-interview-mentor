import type { Request, Response, NextFunction } from 'express';

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export type PlanId = 'free' | 'premium' | 'pro';

interface UsageRecord {
  problemsToday: number;
  messagesPerProblem: Record<string, number>; // problemId → message count
  mockInterviewsToday: number;
  lastResetDate: string; // YYYY-MM-DD, resets daily
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: string; // ISO datetime
  upgradeHint?: string; // soft upgrade message, only when close to limit
}

interface TierLimits {
  problemsPerDay: number; // -1 = unlimited
  messagesPerProblem: number; // -1 = unlimited
  mockInterviewsPerDay: number; // -1 = unlimited
}

// ═══════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════

const TIER_LIMITS: Record<PlanId, TierLimits> = {
  free: {
    problemsPerDay: 5,
    messagesPerProblem: 3,
    mockInterviewsPerDay: 2,
  },
  premium: {
    problemsPerDay: -1,
    messagesPerProblem: -1,
    mockInterviewsPerDay: -1,
  },
  pro: {
    problemsPerDay: -1,
    messagesPerProblem: -1,
    mockInterviewsPerDay: -1,
  },
};

/** Grace period in days for expired subscriptions */
const GRACE_PERIOD_DAYS = 7;

/** Threshold (0-1) at which soft upgrade hints appear */
const UPGRADE_HINT_THRESHOLD = 0.8;

// ═══════════════════════════════════════
// IN-MEMORY STORE (MVP; replace with Redis later)
// ═══════════════════════════════════════

const usageStore = new Map<string, UsageRecord>();

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

/** Compute the next midnight UTC as an ISO datetime string */
function getNextMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  ));
  return tomorrow.toISOString();
}

/** Create a fresh usage record for today */
function createEmptyRecord(): UsageRecord {
  return {
    problemsToday: 0,
    messagesPerProblem: {},
    mockInterviewsToday: 0,
    lastResetDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Build a soft upgrade hint if usage is >= 80% of limit.
 * Returns undefined if below threshold or plan is unlimited.
 */
function buildUpgradeHint(
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

/**
 * Check whether a premium/pro user is within the grace period
 * after their subscription has lapsed.
 */
function isWithinGracePeriod(subscriptionEnd: string | undefined): boolean {
  if (!subscriptionEnd) return false;

  const endDate = new Date(subscriptionEnd);
  if (isNaN(endDate.getTime())) return false;

  const now = new Date();
  const diffMs = now.getTime() - endDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= GRACE_PERIOD_DAYS;
}

/** Validate and normalize a plan ID from header input */
function parsePlan(raw: unknown): PlanId {
  if (typeof raw === 'string' && (raw === 'free' || raw === 'premium' || raw === 'pro')) {
    return raw;
  }
  return 'free';
}

// ═══════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════

/** Get or create usage record for a user (resets daily) */
function getUsage(userId: string): UsageRecord {
  let record = usageStore.get(userId);
  if (!record) {
    record = createEmptyRecord();
    usageStore.set(userId, record);
    return record;
  }
  return maybeResetDaily(record);
}

/** Reset usage counters if the stored date is not today */
function maybeResetDaily(record: UsageRecord): UsageRecord {
  const today = new Date().toISOString().slice(0, 10);
  if (record.lastResetDate !== today) {
    record.problemsToday = 0;
    record.messagesPerProblem = {};
    record.mockInterviewsToday = 0;
    record.lastResetDate = today;
  }
  return record;
}

/**
 * Check rate limit for a specific action.
 *
 * Returns whether the action is allowed, remaining quota,
 * and an optional soft upgrade hint when usage is high.
 */
export function checkRateLimit(
  userId: string,
  plan: PlanId,
  action: 'problem' | 'message' | 'interview',
  problemId?: string,
): RateLimitResult {
  const limits = TIER_LIMITS[plan];
  const usage = getUsage(userId);
  const resetAt = getNextMidnightUTC();

  switch (action) {
    case 'problem': {
      const limit = limits.problemsPerDay;
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1, resetAt };
      }
      const used = usage.problemsToday;
      const remaining = Math.max(0, limit - used);
      const upgradeHint = buildUpgradeHint(action, used, limit);
      return {
        allowed: remaining > 0,
        remaining,
        limit,
        resetAt,
        ...(upgradeHint && { upgradeHint }),
      };
    }

    case 'message': {
      const limit = limits.messagesPerProblem;
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1, resetAt };
      }
      const pid = problemId ?? '_default';
      const used = usage.messagesPerProblem[pid] ?? 0;
      const remaining = Math.max(0, limit - used);
      const upgradeHint = buildUpgradeHint(action, used, limit);
      return {
        allowed: remaining > 0,
        remaining,
        limit,
        resetAt,
        ...(upgradeHint && { upgradeHint }),
      };
    }

    case 'interview': {
      const limit = limits.mockInterviewsPerDay;
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1, resetAt };
      }
      const used = usage.mockInterviewsToday;
      const remaining = Math.max(0, limit - used);
      const upgradeHint = buildUpgradeHint(action, used, limit);
      return {
        allowed: remaining > 0,
        remaining,
        limit,
        resetAt,
        ...(upgradeHint && { upgradeHint }),
      };
    }
  }
}

/**
 * Record usage after a successful action.
 *
 * Call this AFTER the action succeeds (not before),
 * so that failed requests don't consume quota.
 */
export function recordUsage(
  userId: string,
  action: 'problem' | 'message' | 'interview',
  problemId?: string,
): void {
  const usage = getUsage(userId);

  switch (action) {
    case 'problem':
      usage.problemsToday += 1;
      break;
    case 'message': {
      const pid = problemId ?? '_default';
      usage.messagesPerProblem[pid] = (usage.messagesPerProblem[pid] ?? 0) + 1;
      break;
    }
    case 'interview':
      usage.mockInterviewsToday += 1;
      break;
  }
}

/**
 * Get usage summary for dashboard display.
 *
 * Returns current usage, limits, and remaining quota
 * for each rate-limited resource.
 */
export function getUsageSummary(
  userId: string,
  plan: PlanId,
): {
  problems: { used: number; limit: number; remaining: number };
  interviews: { used: number; limit: number; remaining: number };
  resetsAt: string;
} {
  const limits = TIER_LIMITS[plan];
  const usage = getUsage(userId);
  const resetsAt = getNextMidnightUTC();

  const problemLimit = limits.problemsPerDay;
  const interviewLimit = limits.mockInterviewsPerDay;

  return {
    problems: {
      used: usage.problemsToday,
      limit: problemLimit,
      remaining: problemLimit === -1 ? -1 : Math.max(0, problemLimit - usage.problemsToday),
    },
    interviews: {
      used: usage.mockInterviewsToday,
      limit: interviewLimit,
      remaining: interviewLimit === -1 ? -1 : Math.max(0, interviewLimit - usage.mockInterviewsToday),
    },
    resetsAt,
  };
}

// ═══════════════════════════════════════
// EXPRESS MIDDLEWARE FACTORY
// ═══════════════════════════════════════

/**
 * Express middleware factory that enforces per-tier rate limits.
 *
 * Usage:
 *   router.post('/chat', rateLimitMiddleware('message'), handler);
 *   router.post('/problem', rateLimitMiddleware('problem'), handler);
 *   router.post('/interview', rateLimitMiddleware('interview'), handler);
 *
 * Reads from request:
 *   - `x-user-id` header (required, same pattern as progress routes)
 *   - `x-user-plan` header (defaults to 'free')
 *   - `x-subscription-status` header (for grace period check)
 *   - `x-subscription-end` header (ISO date, for grace period check)
 *   - `req.body.problemId` or `req.query.problemId` (for message actions)
 *
 * On success: sets rate limit headers and calls next().
 * On limit exceeded: returns 429 with rate limit info and optional upgrade hint.
 */
export function rateLimitMiddleware(
  action: 'problem' | 'message' | 'interview',
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Extract user ID (same pattern as progress routes)
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!userId) {
      res.status(401).json({ error: 'Missing X-User-Id header.' });
      return;
    }

    // 2. Determine the effective plan
    let plan = parsePlan(req.headers['x-user-plan']);

    // 3. Grace period: if subscription is past_due, check whether
    //    we're still within the 7-day grace window
    const subscriptionStatus = req.headers['x-subscription-status'] as string | undefined;
    const subscriptionEnd = req.headers['x-subscription-end'] as string | undefined;

    if (
      (plan === 'premium' || plan === 'pro') &&
      subscriptionStatus === 'past_due'
    ) {
      if (isWithinGracePeriod(subscriptionEnd)) {
        // Allow continued access at their paid tier during grace period
        // plan stays as-is
      } else {
        // Grace period expired — downgrade to free limits
        plan = 'free';
      }
    }

    // 4. For message actions, extract the problemId
    const problemId =
      action === 'message'
        ? ((req.body?.problemId as string) ?? (req.query.problemId as string) ?? undefined)
        : undefined;

    // 5. Check rate limit
    const result = checkRateLimit(userId, plan, action, problemId);

    // 6. Set rate limit headers on the response regardless of outcome
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', result.resetAt);
    res.setHeader('X-RateLimit-Limit', String(result.limit));

    // 7. If allowed, proceed to the next handler
    if (result.allowed) {
      next();
      return;
    }

    // 8. Rate limited — return 429 with details
    const responseBody: {
      error: string;
      remaining: number;
      limit: number;
      resetAt: string;
      upgradeHint?: string;
    } = {
      error: `Rate limit exceeded for ${action}. Please try again after the reset time.`,
      remaining: result.remaining,
      limit: result.limit,
      resetAt: result.resetAt,
    };

    if (result.upgradeHint) {
      responseBody.upgradeHint = result.upgradeHint;
    }

    res.status(429).json(responseBody);
  };
}

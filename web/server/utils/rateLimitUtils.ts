import type { PlanId } from '../middleware/rateLimit.js';

// ── Tier limits ──────────────────────────────────────────────────────────────

export interface TierLimits {
  problemsPerDay: number; // -1 = unlimited
  messagesPerProblem: number; // -1 = unlimited
  mockInterviewsPerDay: number; // -1 = unlimited
}

export const TIER_LIMITS: Record<PlanId, TierLimits> = {
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

// ── Date helpers ─────────────────────────────────────────────────────────────

/** Compute the next midnight UTC as an ISO datetime string (used as rate-limit reset time). */
export function getNextMidnightUTC(): string {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  ));
  return tomorrow.toISOString();
}

export interface UsageRecord {
  problemsToday: number;
  messagesPerProblem: Record<string, number>; // problemId → message count
  mockInterviewsToday: number;
  lastResetDate: string; // YYYY-MM-DD, resets daily
}

/** Create a fresh usage record for today. */
export function createEmptyRecord(): UsageRecord {
  return {
    problemsToday: 0,
    messagesPerProblem: {},
    mockInterviewsToday: 0,
    lastResetDate: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Reset daily counters if the stored date differs from today's UTC date.
 * Mutates and returns the same record object.
 */
export function maybeResetDaily(record: UsageRecord): UsageRecord {
  const today = new Date().toISOString().slice(0, 10);
  if (record.lastResetDate !== today) {
    record.problemsToday = 0;
    record.messagesPerProblem = {};
    record.mockInterviewsToday = 0;
    record.lastResetDate = today;
  }
  return record;
}

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

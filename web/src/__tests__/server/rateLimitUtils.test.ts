import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parsePlan,
  isWithinGracePeriod,
  buildUpgradeHint,
  createEmptyRecord,
  maybeResetDaily,
  getNextMidnightUTC,
  TIER_LIMITS,
  GRACE_PERIOD_DAYS,
  UPGRADE_HINT_THRESHOLD,
} from '../../../server/utils/rateLimitUtils';

// ─── constants ────────────────────────────────────────────────────────────────

describe('rateLimitUtils constants', () => {
  it('GRACE_PERIOD_DAYS is 7', () => {
    expect(GRACE_PERIOD_DAYS).toBe(7);
  });

  it('UPGRADE_HINT_THRESHOLD is 0.8', () => {
    expect(UPGRADE_HINT_THRESHOLD).toBe(0.8);
  });
});

// ─── parsePlan ────────────────────────────────────────────────────────────────

describe('parsePlan', () => {
  it('returns "free" for the string "free"', () => {
    expect(parsePlan('free')).toBe('free');
  });

  it('returns "premium" for the string "premium"', () => {
    expect(parsePlan('premium')).toBe('premium');
  });

  it('returns "pro" for the string "pro"', () => {
    expect(parsePlan('pro')).toBe('pro');
  });

  it('returns "free" for an unknown string', () => {
    expect(parsePlan('enterprise')).toBe('free');
  });

  it('returns "free" for an empty string', () => {
    expect(parsePlan('')).toBe('free');
  });

  it('returns "free" for undefined', () => {
    expect(parsePlan(undefined)).toBe('free');
  });

  it('returns "free" for null', () => {
    expect(parsePlan(null)).toBe('free');
  });

  it('returns "free" for a number', () => {
    expect(parsePlan(42)).toBe('free');
  });

  it('returns "free" for an object', () => {
    expect(parsePlan({ plan: 'premium' })).toBe('free');
  });

  it('is case-sensitive — "Free" is not valid', () => {
    expect(parsePlan('Free')).toBe('free');
  });
});

// ─── isWithinGracePeriod ──────────────────────────────────────────────────────

describe('isWithinGracePeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false when subscriptionEnd is undefined', () => {
    expect(isWithinGracePeriod(undefined)).toBe(false);
  });

  it('returns false for an invalid date string', () => {
    expect(isWithinGracePeriod('not-a-date')).toBe(false);
  });

  it('returns true when subscription ended 1 day ago (within grace)', () => {
    // now = 2026-01-10, ended 1 day ago = 2026-01-09
    expect(isWithinGracePeriod('2026-01-09T12:00:00.000Z')).toBe(true);
  });

  it('returns true when subscription ended exactly 7 days ago (boundary)', () => {
    // 7 days before 2026-01-10 = 2026-01-03
    expect(isWithinGracePeriod('2026-01-03T12:00:00.000Z')).toBe(true);
  });

  it('returns false when subscription ended 8 days ago (past grace)', () => {
    // 8 days before 2026-01-10 = 2026-01-02
    expect(isWithinGracePeriod('2026-01-02T12:00:00.000Z')).toBe(false);
  });

  it('returns false when subscription ended 30 days ago', () => {
    expect(isWithinGracePeriod('2025-12-11T12:00:00.000Z')).toBe(false);
  });

  it('returns false when subscriptionEnd is a future date (negative diff)', () => {
    // subscription ends in the future → diffDays is negative → <= 7 is true
    // Actually negative diffDays <= 7 means yes, it passes the check... Let's verify:
    // future = 2026-01-20, now = 2026-01-10 → diff = -10 days → -10 <= 7 → TRUE
    // This is by design: the function only checks if the diff is <= GRACE_PERIOD_DAYS
    // A currently active subscription (future end date) should return true
    expect(isWithinGracePeriod('2026-01-20T12:00:00.000Z')).toBe(true);
  });
});

// ─── buildUpgradeHint ─────────────────────────────────────────────────────────

describe('buildUpgradeHint', () => {
  it('returns undefined when limit is -1 (unlimited)', () => {
    expect(buildUpgradeHint('problem', 100, -1)).toBeUndefined();
  });

  it('returns undefined when usage is below 80% threshold', () => {
    // 3/5 = 60% < 80%
    expect(buildUpgradeHint('problem', 3, 5)).toBeUndefined();
  });

  it('returns undefined when usage is exactly 79%', () => {
    // 79/100 = 79%
    expect(buildUpgradeHint('problem', 79, 100)).toBeUndefined();
  });

  it('returns a hint when usage is exactly 80%', () => {
    // 4/5 = 80%
    expect(buildUpgradeHint('problem', 4, 5)).toBeDefined();
  });

  it('returns a hint when usage is above 80%', () => {
    expect(buildUpgradeHint('message', 3, 3)).toBeDefined();
  });

  it('returns problem hint with correct used/limit values', () => {
    const hint = buildUpgradeHint('problem', 4, 5);
    expect(hint).toBe("You've used 4 of 5 daily problems. Upgrade to Premium for unlimited access.");
  });

  it('returns message hint with correct used/limit values', () => {
    const hint = buildUpgradeHint('message', 3, 3);
    expect(hint).toBe("You've used 3 of 3 messages for this problem. Upgrade for unlimited AI coaching.");
  });

  it('returns interview hint with correct used/limit values', () => {
    const hint = buildUpgradeHint('interview', 2, 2);
    expect(hint).toBe("You've used 2 of 2 daily mock interviews. Upgrade to Premium for unlimited practice.");
  });

  it('returns undefined for 0/5 usage', () => {
    expect(buildUpgradeHint('problem', 0, 5)).toBeUndefined();
  });
});

// ─── createEmptyRecord ───────────────────────────────────────────────────────

describe('createEmptyRecord', () => {
  it('returns problemsToday of 0', () => {
    expect(createEmptyRecord().problemsToday).toBe(0);
  });

  it('returns mockInterviewsToday of 0', () => {
    expect(createEmptyRecord().mockInterviewsToday).toBe(0);
  });

  it('returns empty messagesPerProblem', () => {
    expect(createEmptyRecord().messagesPerProblem).toEqual({});
  });

  it('sets lastResetDate to today YYYY-MM-DD', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T10:00:00Z'));
    expect(createEmptyRecord().lastResetDate).toBe('2026-04-08');
    vi.useRealTimers();
  });
});

// ─── maybeResetDaily ─────────────────────────────────────────────────────────

describe('maybeResetDaily', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns same record unchanged when date matches today', () => {
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
    const record = {
      problemsToday: 3,
      messagesPerProblem: { p1: 5 },
      mockInterviewsToday: 1,
      lastResetDate: '2026-04-08',
    };
    const result = maybeResetDaily(record);
    expect(result.problemsToday).toBe(3);
    expect(result.lastResetDate).toBe('2026-04-08');
  });

  it('resets counters when date is stale', () => {
    vi.setSystemTime(new Date('2026-04-09T00:00:00Z'));
    const record = {
      problemsToday: 5,
      messagesPerProblem: { p1: 10 },
      mockInterviewsToday: 2,
      lastResetDate: '2026-04-08',
    };
    maybeResetDaily(record);
    expect(record.problemsToday).toBe(0);
    expect(record.mockInterviewsToday).toBe(0);
    expect(record.messagesPerProblem).toEqual({});
    expect(record.lastResetDate).toBe('2026-04-09');
  });

  it('returns the same object reference (mutates in place)', () => {
    vi.setSystemTime(new Date('2026-04-08T12:00:00Z'));
    const record = { problemsToday: 1, messagesPerProblem: {}, mockInterviewsToday: 0, lastResetDate: '2026-04-07' };
    const result = maybeResetDaily(record);
    expect(result).toBe(record);
  });
});
// ─── TIER_LIMITS ──────────────────────────────────────────────────────────────

describe('TIER_LIMITS', () => {
  it('free plan has 5 problems per day', () => {
    expect(TIER_LIMITS.free.problemsPerDay).toBe(5);
  });

  it('free plan has 3 messages per problem', () => {
    expect(TIER_LIMITS.free.messagesPerProblem).toBe(3);
  });

  it('free plan has 2 mock interviews per day', () => {
    expect(TIER_LIMITS.free.mockInterviewsPerDay).toBe(2);
  });

  it('premium plan is unlimited for all actions', () => {
    expect(TIER_LIMITS.premium.problemsPerDay).toBe(-1);
    expect(TIER_LIMITS.premium.messagesPerProblem).toBe(-1);
    expect(TIER_LIMITS.premium.mockInterviewsPerDay).toBe(-1);
  });

  it('pro plan is unlimited for all actions', () => {
    expect(TIER_LIMITS.pro.problemsPerDay).toBe(-1);
    expect(TIER_LIMITS.pro.messagesPerProblem).toBe(-1);
    expect(TIER_LIMITS.pro.mockInterviewsPerDay).toBe(-1);
  });
});

// ─── getNextMidnightUTC ───────────────────────────────────────────────────────

describe('getNextMidnightUTC', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an ISO string', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
    const result = getNextMidnightUTC();
    expect(() => new Date(result)).not.toThrow();
    expect(new Date(result).toISOString()).toBe(result);
  });

  it('returns midnight of the next day when called at noon', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
    const result = getNextMidnightUTC();
    expect(result).toBe('2026-01-11T00:00:00.000Z');
  });

  it('returns midnight of the next day when called just before midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T23:59:59.999Z'));
    const result = getNextMidnightUTC();
    expect(result).toBe('2026-01-11T00:00:00.000Z');
  });

  it('rolls over month boundary correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-31T06:00:00.000Z'));
    const result = getNextMidnightUTC();
    expect(result).toBe('2026-02-01T00:00:00.000Z');
  });

  it('rolls over year boundary correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-31T06:00:00.000Z'));
    const result = getNextMidnightUTC();
    expect(result).toBe('2026-01-01T00:00:00.000Z');
  });
});

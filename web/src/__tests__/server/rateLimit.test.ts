import { describe, it, expect } from 'vitest';
import {
  checkRateLimit,
  recordUsage,
  getUsageSummary,
} from '../../../server/middleware/rateLimit';

// Use unique user IDs per test to avoid shared in-memory state pollution
let idCounter = 0;
function uid() { return `test-user-${++idCounter}`; }

describe('rateLimit utilities', () => {
  describe('checkRateLimit — free plan', () => {
    it('allows first problem request (remaining = 5)', () => {
      const result = checkRateLimit(uid(), 'free', 'problem');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5); // 5 - 0 used = 5
      expect(result.limit).toBe(5);
    });

    it('allows first message request (remaining = 3)', () => {
      const result = checkRateLimit(uid(), 'free', 'message', 'p1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3); // 3 - 0 used = 3
      expect(result.limit).toBe(3);
    });

    it('allows first interview request (remaining = 2)', () => {
      const result = checkRateLimit(uid(), 'free', 'interview');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 2 - 0 used = 2
      expect(result.limit).toBe(2);
    });

    it('returns resetAt as ISO datetime', () => {
      const result = checkRateLimit(uid(), 'free', 'problem');
      expect(new Date(result.resetAt).toISOString()).toBe(result.resetAt);
    });

    it('blocks when problem limit exceeded', () => {
      const userId = uid();
      // Use up 5 problems
      for (let i = 0; i < 5; i++) recordUsage(userId, 'problem');
      const result = checkRateLimit(userId, 'free', 'problem');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('blocks when message limit exceeded for a problem', () => {
      const userId = uid();
      for (let i = 0; i < 3; i++) recordUsage(userId, 'message', 'problem-a');
      const result = checkRateLimit(userId, 'free', 'message', 'problem-a');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('blocks when interview limit exceeded', () => {
      const userId = uid();
      for (let i = 0; i < 2; i++) recordUsage(userId, 'interview');
      const result = checkRateLimit(userId, 'free', 'interview');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('message limit is per-problem (different problems are independent)', () => {
      const userId = uid();
      // Exhaust messages for problem-x
      for (let i = 0; i < 3; i++) recordUsage(userId, 'message', 'problem-x');
      // problem-y should still have full quota (0 used → remaining = 3)
      const result = checkRateLimit(userId, 'free', 'message', 'problem-y');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it('shows upgradeHint when at 80% threshold for problems', () => {
      const userId = uid();
      // 4/5 = 80% → should trigger hint
      for (let i = 0; i < 4; i++) recordUsage(userId, 'problem');
      const result = checkRateLimit(userId, 'free', 'problem');
      expect(result.upgradeHint).toBeDefined();
      expect(result.upgradeHint).toContain('4 of 5');
    });

    it('no upgradeHint below 80% threshold', () => {
      const userId = uid();
      // 3/5 = 60% → no hint
      for (let i = 0; i < 3; i++) recordUsage(userId, 'problem');
      const result = checkRateLimit(userId, 'free', 'problem');
      expect(result.upgradeHint).toBeUndefined();
    });
  });

  describe('checkRateLimit — premium/pro (unlimited)', () => {
    it('premium plan returns allowed=true for problems', () => {
      expect(checkRateLimit(uid(), 'premium', 'problem').allowed).toBe(true);
    });

    it('premium plan returns limit=-1 for problems', () => {
      expect(checkRateLimit(uid(), 'premium', 'problem').limit).toBe(-1);
    });

    it('premium plan returns remaining=-1 for messages', () => {
      expect(checkRateLimit(uid(), 'premium', 'message', 'p1').remaining).toBe(-1);
    });

    it('pro plan returns allowed=true for interviews', () => {
      expect(checkRateLimit(uid(), 'pro', 'interview').allowed).toBe(true);
    });

    it('premium plan has no upgradeHint', () => {
      expect(checkRateLimit(uid(), 'premium', 'problem').upgradeHint).toBeUndefined();
    });
  });

  describe('recordUsage', () => {
    it('increments problemsToday', () => {
      const userId = uid();
      recordUsage(userId, 'problem');
      const after = checkRateLimit(userId, 'free', 'problem');
      // After 1 recordUsage: used=1, remaining = 5-1 = 4
      expect(after.remaining).toBe(4);
    });

    it('increments mockInterviewsToday', () => {
      const userId = uid();
      recordUsage(userId, 'interview');
      const after = checkRateLimit(userId, 'free', 'interview');
      expect(after.remaining).toBe(1); // 2 - 1 = 1 ✓
    });

    it('increments messagesPerProblem for specific problemId', () => {
      const userId = uid();
      recordUsage(userId, 'message', 'problem-test');
      const after = checkRateLimit(userId, 'free', 'message', 'problem-test');
      expect(after.remaining).toBe(2); // 3 - 1 = 2 ✓
    });

    it('uses _default as problemId when none provided', () => {
      const userId = uid();
      recordUsage(userId, 'message'); // no problemId → _default
      const after = checkRateLimit(userId, 'free', 'message'); // also no problemId → _default
      expect(after.remaining).toBe(2); // 3 - 1 = 2 ✓
    });

    it('multiple recordUsage calls accumulate', () => {
      const userId = uid();
      recordUsage(userId, 'problem');
      recordUsage(userId, 'problem');
      const after = checkRateLimit(userId, 'free', 'problem');
      expect(after.remaining).toBe(3); // 5 - 2 = 3 ✓
    });
  });

  describe('getUsageSummary', () => {
    it('returns problems.used=0 for new user', () => {
      const summary = getUsageSummary(uid(), 'free');
      expect(summary.problems.used).toBe(0);
    });

    it('returns correct limit for free plan problems', () => {
      const summary = getUsageSummary(uid(), 'free');
      expect(summary.problems.limit).toBe(5);
    });

    it('returns correct remaining for free plan', () => {
      const summary = getUsageSummary(uid(), 'free');
      expect(summary.problems.remaining).toBe(5);
    });

    it('reflects recorded problem usage', () => {
      const userId = uid();
      recordUsage(userId, 'problem');
      recordUsage(userId, 'problem');
      const summary = getUsageSummary(userId, 'free');
      expect(summary.problems.used).toBe(2);
      expect(summary.problems.remaining).toBe(3);
    });

    it('returns limit=-1 for premium plan problems', () => {
      const summary = getUsageSummary(uid(), 'premium');
      expect(summary.problems.limit).toBe(-1);
    });

    it('returns remaining=-1 for premium plan', () => {
      const summary = getUsageSummary(uid(), 'premium');
      expect(summary.problems.remaining).toBe(-1);
    });

    it('returns resetsAt as ISO datetime', () => {
      const summary = getUsageSummary(uid(), 'free');
      expect(new Date(summary.resetsAt).toISOString()).toBe(summary.resetsAt);
    });

    it('reflects interview usage', () => {
      const userId = uid();
      recordUsage(userId, 'interview');
      const summary = getUsageSummary(userId, 'free');
      expect(summary.interviews.used).toBe(1);
      expect(summary.interviews.remaining).toBe(1);
    });
  });
});

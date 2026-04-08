import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateStreak, calcNewAvgScore, calcSessionAvgScore } from '../statsUtils';
import type { SessionRecord, StatsData } from '../../types';

afterEach(() => {
  vi.useRealTimers();
});

function makeStats(overrides: Partial<StatsData> = {}): StatsData {
  return {
    problemsSolved: 0,
    totalAttempts: 0,
    totalTime: 0,
    hintsUsed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    avgScore: 0,
    patternStrengths: [],
    sessions: [],
    problemProgress: {},
    reviews: [],
    ...overrides,
  };
}

// ─── updateStreak ─────────────────────────────────────────────────────────────

describe('updateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  it('returns same object reference when already active today', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-10', currentStreak: 3 });
    const result = updateStreak(stats);
    expect(result).toBe(stats); // same reference — no-op
  });

  it('increments streak when last active was yesterday', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-09', currentStreak: 4, longestStreak: 4 });
    const result = updateStreak(stats);
    expect(result.currentStreak).toBe(5);
  });

  it('resets streak to 1 when gap is > 1 day', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-05', currentStreak: 7, longestStreak: 7 });
    const result = updateStreak(stats);
    expect(result.currentStreak).toBe(1);
  });

  it('sets streak to 1 on first activity (empty lastActiveDate)', () => {
    const stats = makeStats({ lastActiveDate: '', currentStreak: 0 });
    const result = updateStreak(stats);
    expect(result.currentStreak).toBe(1);
  });

  it('updates longestStreak when new streak exceeds it', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-09', currentStreak: 10, longestStreak: 10 });
    const result = updateStreak(stats);
    expect(result.longestStreak).toBe(11);
  });

  it('preserves longestStreak when current reset is lower', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-01', currentStreak: 5, longestStreak: 20 });
    const result = updateStreak(stats);
    expect(result.longestStreak).toBe(20); // preserved
    expect(result.currentStreak).toBe(1);
  });

  it('sets lastActiveDate to today', () => {
    const stats = makeStats({ lastActiveDate: '2026-01-09' });
    const result = updateStreak(stats);
    expect(result.lastActiveDate).toBe('2026-01-10');
  });
});

// ─── calcNewAvgScore ──────────────────────────────────────────────────────────

describe('calcNewAvgScore', () => {
  it('returns newScore when existingAttempted is 0 (first observation)', () => {
    expect(calcNewAvgScore(0, 0, 3.0)).toBe(3.0);
  });

  it('computes correct rolling average for second observation', () => {
    // existing: avg=2.0 over 1 attempt, new score=4.0 → (2+4)/2 = 3.0
    expect(calcNewAvgScore(2.0, 1, 4.0)).toBe(3.0);
  });

  it('rounds result to 1 decimal place', () => {
    // avg=2.5 over 2 attempts, new=3.0 → (2.5*2+3)/3 = 8/3 ≈ 2.667 → 2.7
    expect(calcNewAvgScore(2.5, 2, 3.0)).toBe(2.7);
  });

  it('handles all-zero inputs', () => {
    expect(calcNewAvgScore(0, 0, 0)).toBe(0);
  });

  it('handles perfect scores accumulating to 4.0', () => {
    expect(calcNewAvgScore(4.0, 5, 4.0)).toBe(4.0);
  });

  it('returns 0 (not NaN) when score is 0 and existingAttempted is 0', () => {
    const result = calcNewAvgScore(0, 0, 0);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBe(0);
  });
});

// ─── calcSessionAvgScore ─────────────────────────────────────────────────────

function makeSession(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 's1',
    date: '2026-01-10',
    problemId: 'p1',
    problemTitle: 'Test',
    mode: 'TEACHER',
    duration: 300,
    hintsUsed: 0,
    score: null,
    patterns: [],
    ...overrides,
  };
}

describe('calcSessionAvgScore', () => {
  it('returns 0 for an empty session array', () => {
    expect(calcSessionAvgScore([])).toBe(0);
  });

  it('returns 0 when no sessions have scores', () => {
    const sessions = [makeSession({ score: null }), makeSession({ score: null })];
    expect(calcSessionAvgScore(sessions)).toBe(0);
  });

  it('returns the score when only one session has a score', () => {
    const sessions = [makeSession({ score: 3.0 })];
    expect(calcSessionAvgScore(sessions)).toBe(3.0);
  });

  it('averages only scored sessions (ignores nulls)', () => {
    const sessions = [
      makeSession({ score: 2.0 }),
      makeSession({ score: null }),
      makeSession({ score: 4.0 }),
    ];
    expect(calcSessionAvgScore(sessions)).toBe(3.0);
  });

  it('rounds to 1 decimal place', () => {
    // 1+2+3 = 6 / 3 = 2.0 exactly — test uneven: 1+2+4 = 7/3 ≈ 2.333 → 2.3
    const sessions = [makeSession({ score: 1 }), makeSession({ score: 2 }), makeSession({ score: 4 })];
    expect(calcSessionAvgScore(sessions)).toBe(2.3);
  });
});

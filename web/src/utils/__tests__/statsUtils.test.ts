import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateStreak } from '../statsUtils';
import type { StatsData } from '../../types';

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

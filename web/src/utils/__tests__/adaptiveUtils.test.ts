import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { daysSince, patternUrgency } from '../adaptiveUtils';
import type { PatternStrength } from '../../types';

afterEach(() => {
  vi.useRealTimers();
});

function makeStrength(overrides: Partial<PatternStrength> = {}): PatternStrength {
  return {
    pattern: 'Arrays',
    solved: 5,
    attempted: 10,
    avgScore: 2.5,
    lastPracticed: null,
    ...overrides,
  };
}

// ─── daysSince ────────────────────────────────────────────────────────────────

describe('daysSince', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  it('returns Infinity for null', () => {
    expect(daysSince(null)).toBe(Infinity);
  });

  it('returns 0 for today', () => {
    expect(daysSince('2026-01-10')).toBe(0);
  });

  it('returns 1 for yesterday', () => {
    expect(daysSince('2026-01-09')).toBe(1);
  });

  it('returns 7 for one week ago', () => {
    expect(daysSince('2026-01-03')).toBe(7);
  });

  it('returns 30 for one month ago', () => {
    expect(daysSince('2025-12-11')).toBe(30);
  });

  it('returns whole days (floors partial day)', () => {
    // 12 hours ago — still 0 whole days
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
    expect(daysSince('2026-01-10')).toBe(0);
  });
});

// ─── patternUrgency ───────────────────────────────────────────────────────────

describe('patternUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  it('unattempted pattern gets base urgency of 50', () => {
    const ps = makeStrength({ attempted: 0, avgScore: 0, solved: 0 });
    // No recency bonus (lastPracticed null → Infinity → >14 → +30), no mistakes, no solveRate bonus
    const score = patternUrgency(ps, 0);
    expect(score).toBe(80); // 50 (unattempted) + 30 (no lastPracticed)
  });

  it('weak pattern (avgScore 1.0) gets higher urgency than strong (avgScore 4.0)', () => {
    const weak = makeStrength({ avgScore: 1.0, attempted: 5, solved: 2, lastPracticed: '2026-01-10' });
    const strong = makeStrength({ avgScore: 4.0, attempted: 5, solved: 5, lastPracticed: '2026-01-10' });
    expect(patternUrgency(weak, 0)).toBeGreaterThan(patternUrgency(strong, 0));
  });

  it('each mistake adds 15 to score', () => {
    const ps = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.5, attempted: 10, solved: 5 });
    const score0 = patternUrgency(ps, 0);
    const score3 = patternUrgency(ps, 3);
    expect(score3 - score0).toBe(45); // 3 * 15
  });

  it('not practiced in >14 days adds 30', () => {
    const old = makeStrength({ lastPracticed: '2025-12-01', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(old, 0) - patternUrgency(recent, 0)).toBe(30);
  });

  it('not practiced in 8–14 days adds 20', () => {
    const ps8 = makeStrength({ lastPracticed: '2026-01-02', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(ps8, 0) - patternUrgency(recent, 0)).toBe(20);
  });

  it('not practiced in 4–7 days adds 10', () => {
    const ps4 = makeStrength({ lastPracticed: '2026-01-06', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(ps4, 0) - patternUrgency(recent, 0)).toBe(10);
  });

  it('low solve rate (0%) adds 20 to urgency', () => {
    const zero = makeStrength({ avgScore: 2.0, attempted: 5, solved: 0, lastPracticed: '2026-01-10' });
    const full = makeStrength({ avgScore: 2.0, attempted: 5, solved: 5, lastPracticed: '2026-01-10' });
    expect(patternUrgency(zero, 0) - patternUrgency(full, 0)).toBeCloseTo(20);
  });
});

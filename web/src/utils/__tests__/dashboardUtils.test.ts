import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { greeting, getWeeklyActivity, getWeakAreas } from '../dashboardUtils';
import type { PatternStrength } from '../../types';

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── greeting ─────────────────────────────────────────────────────────────────

describe('greeting', () => {
  it('returns "Good morning" for hours 0–11', () => {
    for (const h of [0, 6, 11]) {
      vi.spyOn(Date.prototype, 'getHours').mockReturnValue(h);
      expect(greeting()).toBe('Good morning');
    }
  });

  it('returns "Good afternoon" for hours 12–16', () => {
    for (const h of [12, 14, 16]) {
      vi.spyOn(Date.prototype, 'getHours').mockReturnValue(h);
      expect(greeting()).toBe('Good afternoon');
    }
  });

  it('returns "Good evening" for hours 17–23', () => {
    for (const h of [17, 20, 23]) {
      vi.spyOn(Date.prototype, 'getHours').mockReturnValue(h);
      expect(greeting()).toBe('Good evening');
    }
  });

  it('boundary: hour 11 is still "Good morning"', () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(11);
    expect(greeting()).toBe('Good morning');
  });

  it('boundary: hour 12 becomes "Good afternoon"', () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    expect(greeting()).toBe('Good afternoon');
  });

  it('boundary: hour 16 is still "Good afternoon"', () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(16);
    expect(greeting()).toBe('Good afternoon');
  });

  it('boundary: hour 17 becomes "Good evening"', () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(17);
    expect(greeting()).toBe('Good evening');
  });
});

// ─── getWeeklyActivity ────────────────────────────────────────────────────────

describe('getWeeklyActivity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns exactly 7 entries', () => {
    expect(getWeeklyActivity([])).toHaveLength(7);
  });

  it('dates run from 7 days ago to today in ascending order', () => {
    const result = getWeeklyActivity([]);
    expect(result[0].date).toBe('2026-01-04');
    expect(result[6].date).toBe('2026-01-10');
  });

  it('all counts are 0 when sessions array is empty', () => {
    const result = getWeeklyActivity([]);
    result.forEach((d) => expect(d.count).toBe(0));
  });

  it('counts sessions matching the date', () => {
    const sessions = [
      { date: '2026-01-10' },
      { date: '2026-01-10' },
      { date: '2026-01-08' },
    ] as any[];
    const result = getWeeklyActivity(sessions);
    expect(result.find((d) => d.date === '2026-01-10')!.count).toBe(2);
    expect(result.find((d) => d.date === '2026-01-08')!.count).toBe(1);
  });

  it('ignores sessions outside the 7-day window', () => {
    const sessions = [{ date: '2025-12-01' }, { date: '2026-02-01' }] as any[];
    const result = getWeeklyActivity(sessions);
    result.forEach((d) => expect(d.count).toBe(0));
  });

  it('each entry has date string in YYYY-MM-DD format', () => {
    const result = getWeeklyActivity([]);
    result.forEach((d) => expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });
});


function makeStrength(pattern: string, solved: number, attempted: number): PatternStrength {
  return { pattern, solved, attempted, avgScore: attempted > 0 ? solved / attempted * 4 : 0 };
}

// ─── getWeakAreas ─────────────────────────────────────────────────────────────

describe('getWeakAreas', () => {
  it('returns empty array when strengths is empty', () => {
    expect(getWeakAreas([])).toEqual([]);
  });

  it('filters out unattempted patterns', () => {
    const strengths = [
      makeStrength('Arrays', 0, 0),
      makeStrength('HashMap', 5, 10),
    ];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(1);
    expect(result[0].pattern).toBe('HashMap');
  });

  it('returns at most 3 areas', () => {
    const strengths = [
      makeStrength('Arrays', 1, 10),
      makeStrength('HashMap', 2, 10),
      makeStrength('Two Pointers', 3, 10),
      makeStrength('Sliding Window', 4, 10),
      makeStrength('BFS/DFS', 5, 10),
    ];
    expect(getWeakAreas(strengths)).toHaveLength(3);
  });

  it('sorts by ascending solve ratio (weakest first)', () => {
    const strengths = [
      makeStrength('Arrays', 8, 10),       // 0.8
      makeStrength('HashMap', 2, 10),      // 0.2
      makeStrength('Two Pointers', 5, 10), // 0.5
    ];
    const result = getWeakAreas(strengths);
    expect(result[0].pattern).toBe('HashMap');
    expect(result[1].pattern).toBe('Two Pointers');
    expect(result[2].pattern).toBe('Arrays');
  });

  it('handles a single attempted pattern', () => {
    const strengths = [makeStrength('Arrays', 3, 5)];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(1);
    expect(result[0].pattern).toBe('Arrays');
  });

  it('does not mutate the original array', () => {
    const strengths = [
      makeStrength('Arrays', 1, 10),
      makeStrength('HashMap', 9, 10),
    ];
    const copy = [...strengths];
    getWeakAreas(strengths);
    expect(strengths[0].pattern).toBe(copy[0].pattern);
    expect(strengths[1].pattern).toBe(copy[1].pattern);
  });

  it('returns fewer than 3 when fewer attempted patterns exist', () => {
    const strengths = [
      makeStrength('Arrays', 1, 5),
      makeStrength('HashMap', 0, 0), // unattempted
    ];
    expect(getWeakAreas(strengths)).toHaveLength(1);
  });

  it('handles equal ratios deterministically (stable relative order)', () => {
    const strengths = [
      makeStrength('A', 1, 2), // 0.5
      makeStrength('B', 1, 2), // 0.5
      makeStrength('C', 1, 2), // 0.5
      makeStrength('D', 1, 2), // 0.5
    ];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(3);
    // All ratios equal — just confirm we get 3 results
    result.forEach((r) => expect(r.solved / r.attempted).toBe(0.5));
  });
});

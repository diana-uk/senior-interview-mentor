import { describe, it, expect } from 'vitest';
import { checkCondition, getHeatmapColor } from '../achievementUtils';
import type { StatsData } from '../../types';

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

function makeSession(overrides: Partial<{ duration: number; score: number | null; date: string }> = {}) {
  return {
    id: 'sess-1',
    mode: 'TEACHER' as const,
    problemId: 'p1',
    problemTitle: 'Test',
    duration: 120,
    hintsUsed: 0,
    score: 3,
    patterns: [],
    date: '2026-01-10',
    ...overrides,
  };
}

function makeReview(overrides: Partial<{ overallScore: number }> = {}) {
  return {
    id: 'rev-1',
    problemId: 'p1',
    problemTitle: 'Test',
    dimensions: {},
    overallScore: 3.5,
    feedback: '',
    improvementPlan: [],
    createdAt: '2026-01-10',
    ...overrides,
  };
}

// ─── Milestones ────────────────────────────────────────────────────────────────

describe('checkCondition — milestones', () => {
  it('first-solve: true when problemsSolved >= 1', () => {
    expect(checkCondition('first-solve', makeStats({ problemsSolved: 1 }))).toBe(true);
    expect(checkCondition('first-solve', makeStats({ problemsSolved: 0 }))).toBe(false);
  });

  it('ten-solved: true when problemsSolved >= 10', () => {
    expect(checkCondition('ten-solved', makeStats({ problemsSolved: 10 }))).toBe(true);
    expect(checkCondition('ten-solved', makeStats({ problemsSolved: 9 }))).toBe(false);
  });

  it('twenty-five-solved: true when problemsSolved >= 25', () => {
    expect(checkCondition('twenty-five-solved', makeStats({ problemsSolved: 25 }))).toBe(true);
    expect(checkCondition('twenty-five-solved', makeStats({ problemsSolved: 24 }))).toBe(false);
  });

  it('fifty-solved: true when problemsSolved >= 50', () => {
    expect(checkCondition('fifty-solved', makeStats({ problemsSolved: 50 }))).toBe(true);
    expect(checkCondition('fifty-solved', makeStats({ problemsSolved: 49 }))).toBe(false);
  });

  it('hundred-solved: true when problemsSolved >= 100', () => {
    expect(checkCondition('hundred-solved', makeStats({ problemsSolved: 100 }))).toBe(true);
    expect(checkCondition('hundred-solved', makeStats({ problemsSolved: 99 }))).toBe(false);
  });

  it('all-clear: true when problemsSolved >= 150', () => {
    expect(checkCondition('all-clear', makeStats({ problemsSolved: 150 }))).toBe(true);
    expect(checkCondition('all-clear', makeStats({ problemsSolved: 149 }))).toBe(false);
  });
});

// ─── Streaks ──────────────────────────────────────────────────────────────────

describe('checkCondition — streaks', () => {
  it('streak-3: true when longestStreak >= 3', () => {
    expect(checkCondition('streak-3', makeStats({ longestStreak: 3 }))).toBe(true);
    expect(checkCondition('streak-3', makeStats({ longestStreak: 2 }))).toBe(false);
  });

  it('streak-7: true when longestStreak >= 7', () => {
    expect(checkCondition('streak-7', makeStats({ longestStreak: 7 }))).toBe(true);
    expect(checkCondition('streak-7', makeStats({ longestStreak: 6 }))).toBe(false);
  });

  it('streak-14: true when longestStreak >= 14', () => {
    expect(checkCondition('streak-14', makeStats({ longestStreak: 14 }))).toBe(true);
    expect(checkCondition('streak-14', makeStats({ longestStreak: 13 }))).toBe(false);
  });

  it('streak-30: true when longestStreak >= 30', () => {
    expect(checkCondition('streak-30', makeStats({ longestStreak: 30 }))).toBe(true);
    expect(checkCondition('streak-30', makeStats({ longestStreak: 29 }))).toBe(false);
  });
});

// ─── Patterns ─────────────────────────────────────────────────────────────────

describe('checkCondition — patterns', () => {
  it('pattern-explorer: true when >= 5 patterns attempted', () => {
    const strengths = Array.from({ length: 5 }, (_, i) => ({
      pattern: `P${i}`, solved: 1, attempted: 1, avgScore: 2, lastPracticed: null,
    }));
    expect(checkCondition('pattern-explorer', makeStats({ patternStrengths: strengths }))).toBe(true);
  });

  it('pattern-explorer: false when < 5 patterns attempted', () => {
    const strengths = Array.from({ length: 4 }, (_, i) => ({
      pattern: `P${i}`, solved: 1, attempted: 1, avgScore: 2, lastPracticed: null,
    }));
    expect(checkCondition('pattern-explorer', makeStats({ patternStrengths: strengths }))).toBe(false);
  });

  it('pattern-master: true when >= 3 attempted patterns all avg >= 3.0', () => {
    const strengths = Array.from({ length: 3 }, (_, i) => ({
      pattern: `P${i}`, solved: 3, attempted: 3, avgScore: 3.0, lastPracticed: null,
    }));
    expect(checkCondition('pattern-master', makeStats({ patternStrengths: strengths }))).toBe(true);
  });

  it('pattern-master: false when any attempted pattern avgScore < 3.0', () => {
    const strengths = [
      { pattern: 'A', solved: 3, attempted: 3, avgScore: 3.5, lastPracticed: null },
      { pattern: 'B', solved: 3, attempted: 3, avgScore: 3.5, lastPracticed: null },
      { pattern: 'C', solved: 1, attempted: 3, avgScore: 2.0, lastPracticed: null },
    ];
    expect(checkCondition('pattern-master', makeStats({ patternStrengths: strengths }))).toBe(false);
  });
});

// ─── Speed ────────────────────────────────────────────────────────────────────

describe('checkCondition — speed', () => {
  it('speed-demon: true for session with duration < 300 and score >= 3', () => {
    const stats = makeStats({ sessions: [makeSession({ duration: 299, score: 3 })] });
    expect(checkCondition('speed-demon', stats)).toBe(true);
  });

  it('speed-demon: false when duration >= 300', () => {
    const stats = makeStats({ sessions: [makeSession({ duration: 300, score: 3 })] });
    expect(checkCondition('speed-demon', stats)).toBe(false);
  });

  it('speed-demon: false when duration is 0', () => {
    const stats = makeStats({ sessions: [makeSession({ duration: 0, score: 3 })] });
    expect(checkCondition('speed-demon', stats)).toBe(false);
  });

  it('lightning-round: true when 3+ scored sessions on same day', () => {
    const stats = makeStats({
      sessions: [
        makeSession({ date: '2026-01-10', score: 3 }),
        makeSession({ date: '2026-01-10', score: 4 }),
        makeSession({ date: '2026-01-10', score: 3.5 }),
      ],
    });
    expect(checkCondition('lightning-round', stats)).toBe(true);
  });

  it('lightning-round: false when sessions spread across days', () => {
    const stats = makeStats({
      sessions: [
        makeSession({ date: '2026-01-08', score: 3 }),
        makeSession({ date: '2026-01-09', score: 3 }),
        makeSession({ date: '2026-01-10', score: 3 }),
      ],
    });
    expect(checkCondition('lightning-round', stats)).toBe(false);
  });
});

// ─── Mastery ──────────────────────────────────────────────────────────────────

describe('checkCondition — mastery', () => {
  it('perfect-score: true when any review overallScore >= 4.0', () => {
    const stats = makeStats({ reviews: [makeReview({ overallScore: 4.0 })] });
    expect(checkCondition('perfect-score', stats)).toBe(true);
  });

  it('perfect-score: false when no review reaches 4.0', () => {
    const stats = makeStats({ reviews: [makeReview({ overallScore: 3.9 })] });
    expect(checkCondition('perfect-score', stats)).toBe(false);
  });

  it('hint-free: true when a solved problem has 0 hints used', () => {
    const stats = makeStats({
      problemProgress: { 'p1': { status: 'solved', hintsUsed: 0, attempts: 1, bestScore: 4, bestTime: 120, lastAttempted: '2026-01-10', code: '' } },
    });
    expect(checkCondition('hint-free', stats)).toBe(true);
  });

  it('hint-free: false when all solved problems used hints', () => {
    const stats = makeStats({
      problemProgress: { 'p1': { status: 'solved', hintsUsed: 1, attempts: 1, bestScore: 3, bestTime: 180, lastAttempted: '2026-01-10', code: '' } },
    });
    expect(checkCondition('hint-free', stats)).toBe(false);
  });

  it('review-ace: true when 5 reviews have avg >= 3.5', () => {
    const reviews = Array.from({ length: 5 }, () => makeReview({ overallScore: 3.5 }));
    expect(checkCondition('review-ace', makeStats({ reviews }))).toBe(true);
  });

  it('review-ace: false when fewer than 5 reviews', () => {
    const reviews = Array.from({ length: 4 }, () => makeReview({ overallScore: 4.0 }));
    expect(checkCondition('review-ace', makeStats({ reviews }))).toBe(false);
  });

  it('review-ace: false when 5 reviews exist but avg < 3.5', () => {
    const reviews = Array.from({ length: 5 }, () => makeReview({ overallScore: 3.0 }));
    expect(checkCondition('review-ace', makeStats({ reviews }))).toBe(false);
  });
});

// ─── getHeatmapColor ──────────────────────────────────────────────────────────

describe('getHeatmapColor', () => {
  it('returns near-transparent for count 0', () => {
    expect(getHeatmapColor(0)).toBe('rgba(255, 255, 255, 0.04)');
  });

  it('returns 25% cyan for count 1', () => {
    expect(getHeatmapColor(1)).toBe('rgba(0, 240, 255, 0.25)');
  });

  it('returns 50% cyan for count 2', () => {
    expect(getHeatmapColor(2)).toBe('rgba(0, 240, 255, 0.5)');
  });

  it('returns 80% cyan for count 3', () => {
    expect(getHeatmapColor(3)).toBe('rgba(0, 240, 255, 0.8)');
  });

  it('returns 80% cyan for count > 3', () => {
    expect(getHeatmapColor(10)).toBe('rgba(0, 240, 255, 0.8)');
  });

  it('each level is visually distinct', () => {
    const colors = [0, 1, 2, 3].map(getHeatmapColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(4);
  });
});

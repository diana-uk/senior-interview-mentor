import { describe, it, expect } from 'vitest';
import { buildMemorySummary } from '../memoryBuilder';
import type { StatsData, MistakeEntryFull } from '../../types';

function makeStats(overrides: Partial<StatsData> = {}): StatsData {
  return {
    problemsSolved: 5,
    totalAttempts: 10,
    totalTime: 3600,
    hintsUsed: 3,
    currentStreak: 2,
    longestStreak: 5,
    lastActiveDate: '2026-02-13',
    avgScore: 3.2,
    patternStrengths: [
      { pattern: 'HashMap', solved: 4, attempted: 5, avgScore: 3.5, lastPracticed: '2026-02-13' },
      { pattern: 'Binary Search', solved: 2, attempted: 3, avgScore: 3.0, lastPracticed: '2026-02-12' },
      { pattern: 'Dynamic Programming', solved: 0, attempted: 2, avgScore: 1.5, lastPracticed: '2026-02-11' },
      { pattern: 'Sliding Window', solved: 1, attempted: 1, avgScore: 4.0, lastPracticed: '2026-02-10' },
      { pattern: 'Two Pointers', solved: 0, attempted: 0, avgScore: 0, lastPracticed: null },
    ],
    sessions: [],
    problemProgress: {
      'hm-1': {
        problemId: 'hm-1',
        status: 'solved',
        attempts: 1,
        bestScore: 4,
        bestTime: 300,
        lastAttempted: '2026-02-13',
        hintsUsed: 0,
        code: '',
      },
      'hm-2': {
        problemId: 'hm-2',
        status: 'solved',
        attempts: 2,
        bestScore: 3,
        bestTime: 500,
        lastAttempted: '2026-02-12',
        hintsUsed: 1,
        code: '',
      },
      'dp-1': {
        problemId: 'dp-1',
        status: 'attempted',
        attempts: 2,
        bestScore: null,
        bestTime: null,
        lastAttempted: '2026-02-11',
        hintsUsed: 3,
        code: '',
      },
    },
    reviews: [],
    ...overrides,
  };
}

function makeMistakes(): MistakeEntryFull[] {
  return [
    {
      id: 'm1',
      pattern: 'Dynamic Programming',
      problemId: 'dp-1',
      problemTitle: 'Climbing Stairs',
      description: 'Failed 2/3 test cases',
      createdAt: '2026-02-11',
      nextReview: '2026-02-12',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      streak: 0,
    },
    {
      id: 'm2',
      pattern: 'HashMap',
      problemId: 'hm-2',
      problemTitle: 'Group Anagrams',
      description: 'Needed all 3 hints',
      createdAt: '2026-02-12',
      nextReview: '2026-02-13',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      streak: 0,
    },
  ];
}

const defaultSettings = { hintStyle: 'pseudocode' as const, detailLevel: 'balanced' as const };

describe('buildMemorySummary', () => {
  it('returns correct hintStyle and detailLevel from settings', () => {
    const result = buildMemorySummary(makeStats(), [], { hintStyle: 'analogies', detailLevel: 'detailed' });
    expect(result.hintStyle).toBe('analogies');
    expect(result.detailLevel).toBe('detailed');
  });

  it('extracts solved problems sorted by lastAttempted', () => {
    const result = buildMemorySummary(makeStats(), [], defaultSettings);
    expect(result.solvedProblems).toHaveLength(2);
    // hm-1 (2026-02-13) should come before hm-2 (2026-02-12)
    expect(result.solvedProblems[0].title).toContain('Two Sum');
  });

  it('does not include non-solved problems', () => {
    const result = buildMemorySummary(makeStats(), [], defaultSettings);
    const ids = result.solvedProblems.map((p) => p.title);
    expect(ids).not.toContain('Climbing Stairs');
  });

  it('limits solved problems to 10', () => {
    const progress: StatsData['problemProgress'] = {};
    for (let i = 0; i < 15; i++) {
      progress[`p-${i}`] = {
        problemId: `p-${i}`,
        status: 'solved',
        attempts: 1,
        bestScore: 4,
        bestTime: 100,
        lastAttempted: `2026-01-${String(i + 1).padStart(2, '0')}`,
        hintsUsed: 0,
        code: '',
      };
    }
    const stats = makeStats({ problemProgress: progress, problemsSolved: 15 });
    const result = buildMemorySummary(stats, [], defaultSettings);
    expect(result.solvedProblems.length).toBeLessThanOrEqual(10);
  });

  it('extracts weak patterns sorted by avgScore ascending', () => {
    const result = buildMemorySummary(makeStats(), makeMistakes(), defaultSettings);
    expect(result.weakPatterns.length).toBeGreaterThan(0);
    // DP (1.5) should be first (weakest)
    expect(result.weakPatterns[0].pattern).toBe('Dynamic Programming');
    expect(result.weakPatterns[0].avgScore).toBe(1.5);
  });

  it('includes mistake count in weak patterns', () => {
    const result = buildMemorySummary(makeStats(), makeMistakes(), defaultSettings);
    const dp = result.weakPatterns.find((p) => p.pattern === 'Dynamic Programming');
    expect(dp?.mistakeCount).toBe(1);
  });

  it('extracts strong patterns sorted by avgScore descending', () => {
    const result = buildMemorySummary(makeStats(), [], defaultSettings);
    expect(result.strongPatterns.length).toBeGreaterThan(0);
    // Sliding Window (4.0) should be first (strongest)
    expect(result.strongPatterns[0].pattern).toBe('Sliding Window');
    expect(result.strongPatterns[0].avgScore).toBe(4.0);
  });

  it('extracts recent mistakes', () => {
    const result = buildMemorySummary(makeStats(), makeMistakes(), defaultSettings);
    expect(result.recentMistakes).toHaveLength(2);
    expect(result.recentMistakes[0].problem).toBe('Climbing Stairs');
    expect(result.recentMistakes[0].description).toBe('Failed 2/3 test cases');
  });

  it('limits recent mistakes to 5', () => {
    const manyMistakes: MistakeEntryFull[] = Array.from({ length: 8 }, (_, i) => ({
      id: `m${i}`,
      pattern: 'HashMap' as const,
      problemId: `p-${i}`,
      problemTitle: `Problem ${i}`,
      description: `Mistake ${i}`,
      createdAt: '2026-02-13',
      nextReview: '2026-02-14',
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      streak: 0,
    }));
    const result = buildMemorySummary(makeStats(), manyMistakes, defaultSettings);
    expect(result.recentMistakes.length).toBeLessThanOrEqual(5);
  });

  it('returns totalSolved and currentStreak from stats', () => {
    const result = buildMemorySummary(makeStats(), [], defaultSettings);
    expect(result.totalSolved).toBe(5);
    expect(result.currentStreak).toBe(2);
  });

  it('handles empty stats gracefully', () => {
    const emptyStats: StatsData = {
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
    };
    const result = buildMemorySummary(emptyStats, [], defaultSettings);
    expect(result.solvedProblems).toHaveLength(0);
    expect(result.weakPatterns).toHaveLength(0);
    expect(result.strongPatterns).toHaveLength(0);
    expect(result.recentMistakes).toHaveLength(0);
    expect(result.totalSolved).toBe(0);
    expect(result.currentStreak).toBe(0);
  });

  it('skips patterns with 0 attempts from weak/strong', () => {
    const result = buildMemorySummary(makeStats(), [], defaultSettings);
    const weakNames = result.weakPatterns.map((p) => p.pattern);
    const strongNames = result.strongPatterns.map((p) => p.pattern);
    expect(weakNames).not.toContain('Two Pointers');
    expect(strongNames).not.toContain('Two Pointers');
  });
});

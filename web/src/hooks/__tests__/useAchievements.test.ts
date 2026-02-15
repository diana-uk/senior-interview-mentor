import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../useAchievements';
import type { StatsData, PatternStrength, ReviewResult } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

/** Build a minimal StatsData with sensible defaults, overridable per test. */
function makeStats(overrides: Partial<StatsData> = {}): StatsData {
  return {
    problemsSolved: 0,
    totalAttempts: 0,
    totalTime: 0,
    hintsUsed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    avgScore: 0,
    patternStrengths: [],
    sessions: [],
    problemProgress: {},
    reviews: [],
    ...overrides,
  };
}

function makePatternStrength(
  pattern: string,
  overrides: Partial<PatternStrength> = {},
): PatternStrength {
  return {
    pattern: pattern as PatternStrength['pattern'],
    solved: 0,
    attempted: 0,
    avgScore: 0,
    lastPracticed: null,
    ...overrides,
  };
}

function makeReview(overallScore: number): ReviewResult {
  return {
    id: Math.random().toString(36).slice(2),
    problemId: 'p-1',
    problemTitle: 'Test Problem',
    dimensions: [],
    overallScore,
    feedback: '',
    improvementPlan: [],
    createdAt: new Date().toISOString(),
  };
}

describe('useAchievements', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('starts with no achievements unlocked', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.achievements.every(a => !a.unlockedAt)).toBe(true);
  });

  it('returns all 17 achievement definitions', () => {
    const { result } = renderHook(() => useAchievements());
    expect(result.current.totalCount).toBe(17);
    expect(result.current.achievements).toHaveLength(17);
  });

  it('unlocks first-solve when problemsSolved >= 1', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({ problemsSolved: 1 });
    let newlyUnlocked: ReturnType<typeof result.current.checkAchievements> = [];
    act(() => { newlyUnlocked = result.current.checkAchievements(stats); });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('first-solve');
    expect(result.current.unlockedCount).toBe(1);
  });

  it('unlocks milestone achievements at correct thresholds', () => {
    const { result } = renderHook(() => useAchievements());
    const thresholds: [number, string][] = [
      [10, 'ten-solved'],
      [25, 'twenty-five-solved'],
      [50, 'fifty-solved'],
      [100, 'hundred-solved'],
      [150, 'all-clear'],
    ];
    for (const [count, expectedId] of thresholds) {
      act(() => { result.current.checkAchievements(makeStats({ problemsSolved: count })); });
      const achievement = result.current.achievements.find(a => a.id === expectedId);
      expect(achievement?.unlockedAt, `${expectedId} should unlock at ${count}`).toBeTruthy();
    }
  });

  it('unlocks streak achievements at correct thresholds', () => {
    const { result } = renderHook(() => useAchievements());
    const thresholds: [number, string][] = [
      [3, 'streak-3'],
      [7, 'streak-7'],
      [14, 'streak-14'],
      [30, 'streak-30'],
    ];
    for (const [streak, expectedId] of thresholds) {
      act(() => { result.current.checkAchievements(makeStats({ longestStreak: streak })); });
      const achievement = result.current.achievements.find(a => a.id === expectedId);
      expect(achievement?.unlockedAt, `${expectedId} should unlock at streak ${streak}`).toBeTruthy();
    }
  });

  it('unlocks pattern-explorer when 5+ patterns attempted', () => {
    const { result } = renderHook(() => useAchievements());
    const patterns = ['HashMap', 'Two Pointers', 'Sliding Window', 'BFS/DFS', 'Binary Search'];
    const patternStrengths = patterns.map(p => makePatternStrength(p, { attempted: 1 }));
    const stats = makeStats({ patternStrengths });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'pattern-explorer');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('does NOT unlock pattern-explorer with only 4 patterns', () => {
    const { result } = renderHook(() => useAchievements());
    const patterns = ['HashMap', 'Two Pointers', 'Sliding Window', 'BFS/DFS'];
    const patternStrengths = patterns.map(p => makePatternStrength(p, { attempted: 1 }));
    const stats = makeStats({ patternStrengths });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'pattern-explorer');
    expect(achievement?.unlockedAt).toBeUndefined();
  });

  it('unlocks pattern-master when all attempted patterns avg >= 3.0', () => {
    const { result } = renderHook(() => useAchievements());
    const patternStrengths = [
      makePatternStrength('HashMap', { attempted: 3, avgScore: 3.5 }),
      makePatternStrength('Two Pointers', { attempted: 2, avgScore: 3.0 }),
      makePatternStrength('Sliding Window', { attempted: 4, avgScore: 3.2 }),
    ];
    const stats = makeStats({ patternStrengths });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'pattern-master');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('does NOT unlock pattern-master if any attempted pattern avgScore < 3.0', () => {
    const { result } = renderHook(() => useAchievements());
    const patternStrengths = [
      makePatternStrength('HashMap', { attempted: 3, avgScore: 3.5 }),
      makePatternStrength('Two Pointers', { attempted: 2, avgScore: 2.5 }),
      makePatternStrength('Sliding Window', { attempted: 4, avgScore: 3.2 }),
    ];
    const stats = makeStats({ patternStrengths });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'pattern-master');
    expect(achievement?.unlockedAt).toBeUndefined();
  });

  it('unlocks speed-demon for sub-5-minute solve with score >= 3', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      sessions: [{
        id: 's1', date: '2026-01-01', problemId: 'p-1', problemTitle: 'Test',
        mode: 'TEACHER', duration: 240, hintsUsed: 0, score: 3, patterns: [],
      }],
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'speed-demon');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('does NOT unlock speed-demon if duration >= 300', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      sessions: [{
        id: 's1', date: '2026-01-01', problemId: 'p-1', problemTitle: 'Test',
        mode: 'TEACHER', duration: 300, hintsUsed: 0, score: 4, patterns: [],
      }],
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'speed-demon');
    expect(achievement?.unlockedAt).toBeUndefined();
  });

  it('unlocks lightning-round for 3 solves in one day', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      sessions: [
        { id: 's1', date: '2026-01-15', problemId: 'p-1', problemTitle: 'A', mode: 'TEACHER', duration: 600, hintsUsed: 0, score: 3, patterns: [] },
        { id: 's2', date: '2026-01-15', problemId: 'p-2', problemTitle: 'B', mode: 'TEACHER', duration: 600, hintsUsed: 0, score: 3, patterns: [] },
        { id: 's3', date: '2026-01-15', problemId: 'p-3', problemTitle: 'C', mode: 'TEACHER', duration: 600, hintsUsed: 0, score: 4, patterns: [] },
      ],
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'lightning-round');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('unlocks perfect-score for 4.0 review', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({ reviews: [makeReview(4.0)] });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'perfect-score');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('unlocks hint-free for solve with 0 hints', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      problemProgress: {
        'p-1': {
          problemId: 'p-1', status: 'solved', attempts: 1,
          bestScore: 4, bestTime: 300, lastAttempted: '2026-01-01', hintsUsed: 0, code: '',
        },
      },
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'hint-free');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('does NOT unlock hint-free when hints were used', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      problemProgress: {
        'p-1': {
          problemId: 'p-1', status: 'solved', attempts: 1,
          bestScore: 4, bestTime: 300, lastAttempted: '2026-01-01', hintsUsed: 2, code: '',
        },
      },
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'hint-free');
    expect(achievement?.unlockedAt).toBeUndefined();
  });

  it('unlocks review-ace for 5 reviews with avg >= 3.5', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      reviews: [
        makeReview(4.0), makeReview(3.5), makeReview(3.5), makeReview(3.5), makeReview(3.5),
      ],
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'review-ace');
    expect(achievement?.unlockedAt).toBeTruthy();
  });

  it('does NOT unlock review-ace with fewer than 5 reviews', () => {
    const { result } = renderHook(() => useAchievements());
    const stats = makeStats({
      reviews: [makeReview(4.0), makeReview(4.0), makeReview(4.0), makeReview(4.0)],
    });
    act(() => { result.current.checkAchievements(stats); });
    const achievement = result.current.achievements.find(a => a.id === 'review-ace');
    expect(achievement?.unlockedAt).toBeUndefined();
  });

  it('persists unlocked achievements to localStorage', () => {
    const { result } = renderHook(() => useAchievements());
    act(() => { result.current.checkAchievements(makeStats({ problemsSolved: 1 })); });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sim-achievements',
      expect.stringContaining('first-solve'),
    );
  });

  it('loads previously unlocked achievements from localStorage', () => {
    // Pre-seed localStorage
    localStorageMock.setItem('sim-achievements', JSON.stringify({
      unlocked: { 'first-solve': '2026-01-01T00:00:00.000Z' },
    }));

    const { result } = renderHook(() => useAchievements());
    expect(result.current.unlockedCount).toBe(1);
    const firstSolve = result.current.achievements.find(a => a.id === 'first-solve');
    expect(firstSolve?.unlockedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('resetAchievements clears all data', () => {
    const { result } = renderHook(() => useAchievements());
    // Unlock something first
    act(() => { result.current.checkAchievements(makeStats({ problemsSolved: 1 })); });
    expect(result.current.unlockedCount).toBe(1);
    // Reset
    act(() => { result.current.resetAchievements(); });
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.achievements.every(a => !a.unlockedAt)).toBe(true);
  });

  it('returns only newly unlocked achievements (not previously unlocked)', () => {
    const { result } = renderHook(() => useAchievements());
    // First check: unlock first-solve
    let newlyUnlocked: ReturnType<typeof result.current.checkAchievements> = [];
    act(() => { newlyUnlocked = result.current.checkAchievements(makeStats({ problemsSolved: 1 })); });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('first-solve');

    // Second check with same stats: no new unlocks
    act(() => { newlyUnlocked = result.current.checkAchievements(makeStats({ problemsSolved: 1 })); });
    expect(newlyUnlocked).toHaveLength(0);

    // Third check with more solved: only new achievement reported
    act(() => { newlyUnlocked = result.current.checkAchievements(makeStats({ problemsSolved: 10 })); });
    expect(newlyUnlocked).toHaveLength(1);
    expect(newlyUnlocked[0].id).toBe('ten-solved');
  });
});

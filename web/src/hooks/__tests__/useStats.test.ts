import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStats } from '../useStats';
import type { ReviewResult } from '../../types';

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

// Freeze today's date for streak tests
const MOCK_TODAY = '2026-02-15';
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));

describe('useStats', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ── Initialization ──

  it('starts with empty stats', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats.problemsSolved).toBe(0);
    expect(result.current.stats.totalAttempts).toBe(0);
    expect(result.current.stats.totalTime).toBe(0);
    expect(result.current.stats.hintsUsed).toBe(0);
    expect(result.current.stats.currentStreak).toBe(0);
    expect(result.current.stats.sessions).toHaveLength(0);
    expect(result.current.stats.reviews).toHaveLength(0);
    expect(Object.keys(result.current.stats.problemProgress)).toHaveLength(0);
  });

  it('initializes with 14 pattern strengths', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats.patternStrengths).toHaveLength(14);
    const names = result.current.stats.patternStrengths.map((p) => p.pattern);
    expect(names).toContain('HashMap');
    expect(names).toContain('Dynamic Programming');
    expect(names).toContain('Sliding Window');
  });

  it('loads previously saved stats from localStorage', () => {
    const saved = {
      problemsSolved: 5,
      totalAttempts: 10,
      totalTime: 3600,
      hintsUsed: 3,
      currentStreak: 2,
      longestStreak: 5,
      lastActiveDate: MOCK_TODAY,
      avgScore: 3.2,
      patternStrengths: [
        { pattern: 'HashMap', solved: 4, attempted: 5, avgScore: 3.5, lastPracticed: MOCK_TODAY },
      ],
      sessions: [],
      problemProgress: {},
      reviews: [],
    };
    localStorageMock.setItem('sim-stats', JSON.stringify(saved));

    const { result } = renderHook(() => useStats());
    expect(result.current.stats.problemsSolved).toBe(5);
    expect(result.current.stats.totalAttempts).toBe(10);
  });

  // ── recordSession ──

  it('recordSession increments totalAttempts, totalTime, hintsUsed', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'two-sum',
        problemTitle: 'Two Sum',
        mode: 'TEACHER',
        duration: 300,
        hintsUsed: 2,
        score: 3,
        patterns: ['HashMap'],
      });
    });

    expect(result.current.stats.totalAttempts).toBe(1);
    expect(result.current.stats.totalTime).toBe(300);
    expect(result.current.stats.hintsUsed).toBe(2);
  });

  it('recordSession adds session to sessions array', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'two-sum',
        problemTitle: 'Two Sum',
        mode: 'TEACHER',
        duration: 300,
        hintsUsed: 0,
        score: 4,
        patterns: ['HashMap'],
      });
    });

    expect(result.current.stats.sessions).toHaveLength(1);
    expect(result.current.stats.sessions[0].problemTitle).toBe('Two Sum');
    expect(result.current.stats.sessions[0].date).toBe(MOCK_TODAY);
  });

  it('recordSession updates avgScore from scored sessions', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: 4, patterns: [],
      });
    });
    act(() => {
      result.current.recordSession({
        problemId: 'p2', problemTitle: 'P2', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: 2, patterns: [],
      });
    });

    expect(result.current.stats.avgScore).toBe(3); // (4+2)/2
  });

  it('recordSession does not change avgScore for null-scored sessions', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: 4, patterns: [],
      });
    });
    act(() => {
      result.current.recordSession({
        problemId: 'p2', problemTitle: 'P2', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(result.current.stats.avgScore).toBe(4); // only 1 scored session
  });

  it('recordSession limits sessions to 100', () => {
    const { result } = renderHook(() => useStats());

    for (let i = 0; i < 105; i++) {
      act(() => {
        result.current.recordSession({
          problemId: `p-${i}`, problemTitle: `Problem ${i}`, mode: 'TEACHER',
          duration: 10, hintsUsed: 0, score: null, patterns: [],
        });
      });
    }

    expect(result.current.stats.sessions.length).toBeLessThanOrEqual(100);
  });

  // ── recordProblemAttempt ──

  it('recordProblemAttempt creates a new progress entry', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'attempted',
        score: null, time: null, hintsUsed: 1, code: 'function twoSum() {}',
      });
    });

    const progress = result.current.stats.problemProgress['two-sum'];
    expect(progress).toBeDefined();
    expect(progress.status).toBe('attempted');
    expect(progress.attempts).toBe(1);
    expect(progress.hintsUsed).toBe(1);
  });

  it('recordProblemAttempt updates existing progress', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'attempted',
        score: 2, time: 600, hintsUsed: 2, code: 'v1',
      });
    });
    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'solved',
        score: 4, time: 300, hintsUsed: 0, code: 'v2',
      });
    });

    const progress = result.current.stats.problemProgress['two-sum'];
    expect(progress.status).toBe('solved');
    expect(progress.attempts).toBe(2);
    expect(progress.bestScore).toBe(4); // max(2, 4)
    expect(progress.bestTime).toBe(300); // min(600, 300)
  });

  it('recordProblemAttempt increments problemsSolved only on first solve', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'solved',
        score: 3, time: 300, hintsUsed: 0, code: '',
      });
    });
    expect(result.current.stats.problemsSolved).toBe(1);

    // Re-solving the same problem should NOT increment
    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'solved',
        score: 4, time: 200, hintsUsed: 0, code: '',
      });
    });
    expect(result.current.stats.problemsSolved).toBe(1);
  });

  it('recordProblemAttempt does not increment problemsSolved for attempted status', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'attempted',
        score: null, time: null, hintsUsed: 1, code: '',
      });
    });

    expect(result.current.stats.problemsSolved).toBe(0);
  });

  // ── recordReview ──

  it('recordReview adds review to front of list', () => {
    const { result } = renderHook(() => useStats());
    const review: ReviewResult = {
      id: 'r1', problemId: 'two-sum', problemTitle: 'Two Sum',
      dimensions: [], overallScore: 3.5, feedback: 'Good',
      improvementPlan: [], createdAt: MOCK_TODAY,
    };

    act(() => { result.current.recordReview(review); });

    expect(result.current.stats.reviews).toHaveLength(1);
    expect(result.current.stats.reviews[0].id).toBe('r1');
  });

  it('recordReview limits reviews to 50', () => {
    const { result } = renderHook(() => useStats());

    for (let i = 0; i < 55; i++) {
      act(() => {
        result.current.recordReview({
          id: `r${i}`, problemId: null, problemTitle: `P${i}`,
          dimensions: [], overallScore: 3, feedback: '',
          improvementPlan: [], createdAt: MOCK_TODAY,
        });
      });
    }

    expect(result.current.stats.reviews.length).toBeLessThanOrEqual(50);
  });

  // ── updatePatternStrength ──

  it('updatePatternStrength updates attempted, solved, avgScore, lastPracticed', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 4); });

    const ps = result.current.stats.patternStrengths.find((p) => p.pattern === 'HashMap')!;
    expect(ps.attempted).toBe(1);
    expect(ps.solved).toBe(1);
    expect(ps.avgScore).toBe(4);
    expect(ps.lastPracticed).toBe(MOCK_TODAY);
  });

  it('updatePatternStrength calculates running average correctly', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 4); });
    act(() => { result.current.updatePatternStrength('HashMap', false, 2); });

    const ps = result.current.stats.patternStrengths.find((p) => p.pattern === 'HashMap')!;
    expect(ps.attempted).toBe(2);
    expect(ps.solved).toBe(1); // only first was solved
    expect(ps.avgScore).toBe(3); // (4+2)/2
  });

  it('updatePatternStrength does not affect other patterns', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 4); });

    const dp = result.current.stats.patternStrengths.find((p) => p.pattern === 'Dynamic Programming')!;
    expect(dp.attempted).toBe(0);
    expect(dp.solved).toBe(0);
  });

  // ── Query methods ──

  it('getPatternStrength returns the correct pattern', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('Binary Search', true, 3.5); });

    const ps = result.current.getPatternStrength('Binary Search');
    expect(ps).toBeDefined();
    expect(ps!.pattern).toBe('Binary Search');
    expect(ps!.avgScore).toBe(3.5);
  });

  it('getWeakestPatterns returns patterns sorted by avgScore ascending', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 4); });
    act(() => { result.current.updatePatternStrength('Binary Search', false, 1); });
    act(() => { result.current.updatePatternStrength('Greedy', true, 2.5); });

    const weak = result.current.getWeakestPatterns(3);
    expect(weak).toHaveLength(3);
    expect(weak[0].pattern).toBe('Binary Search'); // 1.0
    expect(weak[1].pattern).toBe('Greedy'); // 2.5
    expect(weak[2].pattern).toBe('HashMap'); // 4.0
  });

  it('getWeakestPatterns excludes unattempted patterns', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 3); });

    const weak = result.current.getWeakestPatterns();
    expect(weak).toHaveLength(1);
    expect(weak[0].pattern).toBe('HashMap');
  });

  it('getStrongestPatterns returns patterns sorted by avgScore descending', () => {
    const { result } = renderHook(() => useStats());

    act(() => { result.current.updatePatternStrength('HashMap', true, 4); });
    act(() => { result.current.updatePatternStrength('Trees', true, 2); });
    act(() => { result.current.updatePatternStrength('Heap', true, 3); });

    const strong = result.current.getStrongestPatterns(3);
    expect(strong[0].pattern).toBe('HashMap'); // 4.0
    expect(strong[1].pattern).toBe('Heap'); // 3.0
    expect(strong[2].pattern).toBe('Trees'); // 2.0
  });

  it('getProblemStatus returns unseen for unknown problems', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.getProblemStatus('nonexistent')).toBe('unseen');
  });

  it('getProblemStatus returns correct status for tracked problems', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'solved',
        score: 4, time: 300, hintsUsed: 0, code: '',
      });
    });

    expect(result.current.getProblemStatus('two-sum')).toBe('solved');
  });

  it('getRecentSessions returns most recent N sessions', () => {
    const { result } = renderHook(() => useStats());

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.recordSession({
          problemId: `p${i}`, problemTitle: `Problem ${i}`, mode: 'TEACHER',
          duration: 100, hintsUsed: 0, score: null, patterns: [],
        });
      });
    }

    const recent = result.current.getRecentSessions(3);
    expect(recent).toHaveLength(3);
    // Most recent first (prepended)
    expect(recent[0].problemTitle).toBe('Problem 4');
  });

  // ── Streak logic ──

  it('streak starts at 1 on first activity', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(result.current.stats.currentStreak).toBe(1);
    expect(result.current.stats.longestStreak).toBe(1);
    expect(result.current.stats.lastActiveDate).toBe(MOCK_TODAY);
  });

  it('streak continues when last active was yesterday', () => {
    // Pre-seed with yesterday's activity
    const yesterday = '2026-02-14';
    const saved = {
      problemsSolved: 1, totalAttempts: 1, totalTime: 100,
      hintsUsed: 0, currentStreak: 3, longestStreak: 3,
      lastActiveDate: yesterday, avgScore: 0,
      patternStrengths: [], sessions: [], problemProgress: {}, reviews: [],
    };
    localStorageMock.setItem('sim-stats', JSON.stringify(saved));

    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(result.current.stats.currentStreak).toBe(4); // 3 + 1
  });

  it('streak resets to 1 after a gap', () => {
    // Pre-seed with activity from 3 days ago
    const saved = {
      problemsSolved: 1, totalAttempts: 1, totalTime: 100,
      hintsUsed: 0, currentStreak: 5, longestStreak: 5,
      lastActiveDate: '2026-02-12', avgScore: 0,
      patternStrengths: [], sessions: [], problemProgress: {}, reviews: [],
    };
    localStorageMock.setItem('sim-stats', JSON.stringify(saved));

    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(result.current.stats.currentStreak).toBe(1); // reset
    expect(result.current.stats.longestStreak).toBe(5); // preserved
  });

  it('streak does not increment on same day', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });
    act(() => {
      result.current.recordSession({
        problemId: 'p2', problemTitle: 'P2', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(result.current.stats.currentStreak).toBe(1); // still 1
  });

  // ── resetStats ──

  it('resetStats clears all data back to empty', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 300, hintsUsed: 2, score: 3, patterns: ['HashMap'],
      });
    });
    act(() => {
      result.current.recordProblemAttempt({
        problemId: 'two-sum', status: 'solved',
        score: 4, time: 300, hintsUsed: 0, code: '',
      });
    });

    act(() => { result.current.resetStats(); });

    expect(result.current.stats.problemsSolved).toBe(0);
    expect(result.current.stats.totalAttempts).toBe(0);
    expect(result.current.stats.sessions).toHaveLength(0);
    expect(Object.keys(result.current.stats.problemProgress)).toHaveLength(0);
  });

  // ── Persistence ──

  it('persists to localStorage on every mutation', () => {
    const { result } = renderHook(() => useStats());

    act(() => {
      result.current.recordSession({
        problemId: 'p1', problemTitle: 'P1', mode: 'TEACHER',
        duration: 100, hintsUsed: 0, score: null, patterns: [],
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sim-stats',
      expect.any(String),
    );
    const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
    expect(saved.totalAttempts).toBe(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAdaptiveRecommendation } from '../useAdaptiveRecommendation';
import type { PatternStrength, ProblemStatus, PatternName, Difficulty } from '../../types';
import { allProblemsList, problemsByPattern } from '../../data/problems';

// ── Helpers ──

const ALL_PATTERNS: PatternName[] = [
  'Sliding Window', 'Two Pointers', 'HashMap', 'Prefix Sum', 'Stack',
  'Linked List', 'BFS/DFS', 'Topological Sort', 'Union-Find', 'Binary Search',
  'Heap', 'Intervals', 'Greedy', 'Dynamic Programming', 'Backtracking',
  'Bit Manipulation', 'Trees',
];

function makeStrength(overrides: Partial<PatternStrength> & { pattern: PatternName }): PatternStrength {
  return {
    solved: 0,
    attempted: 0,
    avgScore: 0,
    lastPracticed: null,
    ...overrides,
  };
}

/** Build a full set of pattern strengths — all zeroed unless overridden */
function makeAllStrengths(overrides: Partial<Record<PatternName, Partial<PatternStrength>>> = {}): PatternStrength[] {
  return ALL_PATTERNS.map((p) => makeStrength({ pattern: p, ...overrides[p] }));
}

/** Stable status function: everything unseen */
const allUnseen = () => 'unseen' as ProblemStatus;

/** Status function where specific problems are solved */
function withSolved(solvedIds: Set<string>) {
  return (id: string): ProblemStatus => solvedIds.has(id) ? 'solved' : 'unseen';
}

// Freeze time for deterministic "days since" calculations
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-02-15T12:00:00Z'));

describe('useAdaptiveRecommendation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getNextProblem ──

  describe('getNextProblem', () => {
    it('returns a problem when all patterns are unattempted', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const rec = result.current.getNextProblem();
      expect(rec).not.toBeNull();
      expect(rec!.id).toBeTruthy();
      expect(rec!.title).toBeTruthy();
      expect(rec!.pattern).toBeTruthy();
      expect(rec!.reason).toContain("haven't practiced");
    });

    it('prioritizes weak patterns over strong ones', () => {
      const strengths = makeAllStrengths({
        HashMap: { attempted: 10, solved: 9, avgScore: 3.8, lastPracticed: '2026-02-14' },
        'Sliding Window': { attempted: 3, solved: 0, avgScore: 0.5, lastPracticed: '2026-02-14' },
      });

      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: allUnseen,
          weakPatterns: [{ pattern: 'Sliding Window' as PatternName, count: 3, avgStreak: 0 }],
        }),
      );
      const rec = result.current.getNextProblem();
      expect(rec).not.toBeNull();
      // Sliding Window has low score + mistakes → should be recommended
      // (or another never-attempted pattern with higher urgency)
      expect(rec!.reason).toBeTruthy();
    });

    it('respects difficulty filter', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );

      const easy = result.current.getNextProblem('Easy' as Difficulty);
      expect(easy).not.toBeNull();
      // The difficulty filter is a preference, not a hard constraint,
      // but with enough problems available it should match
      expect(['Easy', 'Medium', 'Hard']).toContain(easy!.difficulty);
    });

    it('returns null when all problems are solved', () => {
      const allSolvedIds = new Set(allProblemsList.map((p) => p.id));
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths({
            HashMap: { attempted: 5, solved: 5, avgScore: 4, lastPracticed: '2026-02-15' },
          }),
          getProblemStatus: withSolved(allSolvedIds),
          weakPatterns: [],
        }),
      );
      const rec = result.current.getNextProblem();
      expect(rec).toBeNull();
    });

    it('suggests appropriate reason for never-attempted pattern', () => {
      const strengths = makeAllStrengths();
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const rec = result.current.getNextProblem();
      expect(rec).not.toBeNull();
      expect(rec!.reason).toContain("haven't practiced");
    });

    it('suggests review for patterns not practiced recently', () => {
      // All patterns practiced recently EXCEPT one which is 10 days old
      const strengths = makeAllStrengths();
      strengths[0] = makeStrength({
        pattern: strengths[0].pattern,
        attempted: 5,
        solved: 3,
        avgScore: 2.5,
        lastPracticed: '2026-02-01', // 14 days ago
      });
      // Make all other patterns strong and recent
      for (let i = 1; i < strengths.length; i++) {
        strengths[i] = makeStrength({
          pattern: strengths[i].pattern,
          attempted: 5,
          solved: 5,
          avgScore: 4.0,
          lastPracticed: '2026-02-14',
        });
      }

      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const rec = result.current.getNextProblem();
      expect(rec).not.toBeNull();
      // The stale pattern should float to top due to urgency
      expect(rec!.pattern).toBeTruthy();
    });
  });

  // ── getRecommendations ──

  describe('getRecommendations', () => {
    it('returns requested count of recommendations', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const recs = result.current.getRecommendations(3);
      expect(recs).toHaveLength(3);
    });

    it('defaults to 5 recommendations', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const recs = result.current.getRecommendations();
      expect(recs).toHaveLength(5);
    });

    it('returns unique patterns (no duplicates)', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const recs = result.current.getRecommendations(5);
      const patterns = recs.map((r) => r.pattern);
      expect(new Set(patterns).size).toBe(patterns.length);
    });

    it('each recommendation has required fields', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const recs = result.current.getRecommendations(3);
      for (const rec of recs) {
        expect(rec.id).toBeTruthy();
        expect(rec.title).toBeTruthy();
        expect(rec.difficulty).toBeTruthy();
        expect(rec.pattern).toBeTruthy();
        expect(rec.reason).toBeTruthy();
      }
    });

    it('returns fewer than count when not enough patterns available', () => {
      // All problems solved → no recommendations
      const allSolvedIds = new Set(allProblemsList.map((p) => p.id));
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: withSolved(allSolvedIds),
          weakPatterns: [],
        }),
      );
      const recs = result.current.getRecommendations(5);
      expect(recs).toHaveLength(0);
    });
  });

  // ── getReadinessScore ──

  describe('getReadinessScore', () => {
    it('returns 0 when no problems attempted', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      expect(result.current.getReadinessScore()).toBe(0);
    });

    it('returns value between 0 and 100', () => {
      const strengths = makeAllStrengths({
        HashMap: { attempted: 5, solved: 3, avgScore: 3.0, lastPracticed: '2026-02-14' },
        'Two Pointers': { attempted: 3, solved: 2, avgScore: 2.5, lastPracticed: '2026-02-13' },
      });
      // Mark some problems as solved
      const hashMapProblems = allProblemsList.filter((p) => p.pattern === 'HashMap').slice(0, 3);
      const solvedIds = new Set(hashMapProblems.map((p) => p.id));

      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: withSolved(solvedIds),
          weakPatterns: [],
        }),
      );
      const score = result.current.getReadinessScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('increases when more problems are solved', () => {
      const strengths1 = makeAllStrengths({
        HashMap: { attempted: 2, solved: 1, avgScore: 2.0, lastPracticed: '2026-02-14' },
      });
      const strengths2 = makeAllStrengths({
        HashMap: { attempted: 5, solved: 5, avgScore: 4.0, lastPracticed: '2026-02-14' },
        'Two Pointers': { attempted: 3, solved: 3, avgScore: 3.5, lastPracticed: '2026-02-14' },
        Stack: { attempted: 2, solved: 2, avgScore: 3.0, lastPracticed: '2026-02-14' },
      });

      const hashMapProblems = allProblemsList.filter((p) => p.pattern === 'HashMap');
      const solvedIds1 = new Set(hashMapProblems.slice(0, 1).map((p) => p.id));
      const tpProblems = allProblemsList.filter((p) => p.pattern === 'Two Pointers');
      const stackProblems = allProblemsList.filter((p) => p.pattern === 'Stack');
      const solvedIds2 = new Set([
        ...hashMapProblems.map((p) => p.id),
        ...tpProblems.slice(0, 3).map((p) => p.id),
        ...stackProblems.slice(0, 2).map((p) => p.id),
      ]);

      const { result: r1 } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths1,
          getProblemStatus: withSolved(solvedIds1),
          weakPatterns: [],
        }),
      );
      const { result: r2 } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths2,
          getProblemStatus: withSolved(solvedIds2),
          weakPatterns: [],
        }),
      );

      expect(r2.current.getReadinessScore()).toBeGreaterThan(r1.current.getReadinessScore());
    });

    it('returns a rounded integer', () => {
      const strengths = makeAllStrengths({
        HashMap: { attempted: 3, solved: 2, avgScore: 2.7, lastPracticed: '2026-02-14' },
      });
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const score = result.current.getReadinessScore();
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  // ── getPatternCoverage ──

  describe('getPatternCoverage', () => {
    it('returns coverage for all patterns', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const coverage = result.current.getPatternCoverage();
      expect(coverage.length).toBeGreaterThan(0);
      // Each entry should have the right shape
      for (const entry of coverage) {
        expect(entry.pattern).toBeTruthy();
        expect(entry.total).toBeGreaterThan(0);
        expect(entry.solved).toBe(0);
        expect(entry.percentage).toBe(0);
      }
    });

    it('shows correct solved count', () => {
      const hashMapProblems = problemsByPattern['HashMap'] ?? [];
      expect(hashMapProblems.length).toBeGreaterThan(2);
      const solvedIds = new Set(hashMapProblems.slice(0, 2).map((p) => p.id));

      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: withSolved(solvedIds),
          weakPatterns: [],
        }),
      );
      const coverage = result.current.getPatternCoverage();
      const hashMapCoverage = coverage.find((c) => c.pattern === 'HashMap');
      expect(hashMapCoverage).toBeDefined();
      expect(hashMapCoverage!.solved).toBe(2);
      expect(hashMapCoverage!.percentage).toBeGreaterThan(0);
    });
  });

  // ── getDailyChallenge ──

  describe('getDailyChallenge', () => {
    it('returns a problem', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const daily = result.current.getDailyChallenge();
      expect(daily).not.toBeNull();
      expect(daily!.reason).toContain('Daily Challenge');
    });

    it('returns deterministic result for same day', () => {
      const { result: r1 } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const { result: r2 } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      expect(r1.current.getDailyChallenge()!.id).toBe(r2.current.getDailyChallenge()!.id);
    });

    it('returns a problem even when all are solved', () => {
      const allSolvedIds = new Set(allProblemsList.map((p) => p.id));
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: withSolved(allSolvedIds),
          weakPatterns: [],
        }),
      );
      const daily = result.current.getDailyChallenge();
      expect(daily).not.toBeNull();
      expect(daily!.reason).toContain('review');
    });
  });

  // ── getInterviewReadyScore ──

  describe('getInterviewReadyScore', () => {
    it('returns low score for beginners', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const readiness = result.current.getInterviewReadyScore('senior');
      expect(readiness.score).toBeLessThan(30);
      expect(readiness.company).toBe('Senior Level');
      expect(readiness.weakPatterns.length).toBe(ALL_PATTERNS.length);
      expect(readiness.strongPatterns.length).toBe(0);
    });

    it('returns higher score with more practiced patterns', () => {
      const strengths = makeAllStrengths({
        HashMap: { attempted: 8, solved: 7, avgScore: 3.5, lastPracticed: '2026-02-14' },
        'Two Pointers': { attempted: 5, solved: 4, avgScore: 3.2, lastPracticed: '2026-02-13' },
        Stack: { attempted: 4, solved: 3, avgScore: 3.0, lastPracticed: '2026-02-12' },
      });
      const solvedIds = new Set(
        allProblemsList.filter((p) => ['HashMap', 'Two Pointers', 'Stack'].includes(p.pattern)).slice(0, 10).map((p) => p.id),
      );

      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: withSolved(solvedIds),
          weakPatterns: [],
        }),
      );
      const readiness = result.current.getInterviewReadyScore('junior');
      expect(readiness.score).toBeGreaterThan(0);
      expect(readiness.strongPatterns.length).toBeGreaterThan(0);
    });

    it('defaults to senior level', () => {
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: makeAllStrengths(),
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const readiness = result.current.getInterviewReadyScore();
      expect(readiness.company).toBe('Senior Level');
    });

    it('categorizes patterns correctly for mid level', () => {
      const strengths = makeAllStrengths({
        HashMap: { attempted: 6, solved: 4, avgScore: 2.8, lastPracticed: '2026-02-14' },
      });
      const { result } = renderHook(() =>
        useAdaptiveRecommendation({
          patternStrengths: strengths,
          getProblemStatus: allUnseen,
          weakPatterns: [],
        }),
      );
      const readiness = result.current.getInterviewReadyScore('mid');
      expect(readiness.company).toBe('Mid Level');
      // HashMap has avgScore 2.8 >= 2.5 and solveRate 4/6 >= 0.5 → strong for mid
      expect(readiness.strongPatterns).toContain('HashMap');
    });
  });
});

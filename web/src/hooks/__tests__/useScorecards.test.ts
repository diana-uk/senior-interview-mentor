import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScorecards } from '../useScorecards';
import type { ReviewResult } from '../../types';

vi.mock('../../utils/storage', () => {
  let store: Record<string, string> = {};
  return {
    safeGetItem: (key: string) => store[key] ?? null,
    safeSetItem: (key: string, value: string) => { store[key] = value; },
    safeRemoveItem: (key: string) => { delete store[key]; },
    __resetStore: () => { store = {}; },
  };
});

import * as storage from '../../utils/storage';

function makeReview(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    id: Math.random().toString(36).slice(2, 9),
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    dimensions: [],
    overallScore: 3.5,
    feedback: 'Good work',
    improvementPlan: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('useScorecards', () => {
  describe('initial state', () => {
    it('starts with an empty array when nothing is stored', () => {
      const { result } = renderHook(() => useScorecards());
      expect(result.current.scorecards).toEqual([]);
    });

    it('loads persisted scorecards from storage on mount', () => {
      const review = makeReview({ id: 'r1' });
      storage.safeSetItem('sim-scorecards', JSON.stringify([review]));
      const { result } = renderHook(() => useScorecards());
      expect(result.current.scorecards.length).toBe(1);
      expect(result.current.scorecards[0].id).toBe('r1');
    });

    it('returns empty array when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-scorecards', 'not-json');
      const { result } = renderHook(() => useScorecards());
      expect(result.current.scorecards).toEqual([]);
    });
  });

  describe('saveScorecard', () => {
    it('adds a scorecard to the list', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'r1' })); });
      expect(result.current.scorecards.length).toBe(1);
    });

    it('prepends new scorecard (most recent first)', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'first' })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'second' })); });
      expect(result.current.scorecards[0].id).toBe('second');
      expect(result.current.scorecards[1].id).toBe('first');
    });

    it('persists scorecard to storage', () => {
      const { result } = renderHook(() => useScorecards());
      const review = makeReview({ id: 'r1' });
      act(() => { result.current.saveScorecard(review); });
      const stored = JSON.parse(storage.safeGetItem('sim-scorecards') ?? '[]') as ReviewResult[];
      expect(stored[0].id).toBe('r1');
    });

    it('accumulates multiple scorecards', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview()); });
      act(() => { result.current.saveScorecard(makeReview()); });
      act(() => { result.current.saveScorecard(makeReview()); });
      expect(result.current.scorecards.length).toBe(3);
    });

    it('enforces 100-item cap — drops oldest when over limit', () => {
      const { result } = renderHook(() => useScorecards());
      // Pre-fill storage with 100 items
      const existing = Array.from({ length: 100 }, (_, i) =>
        makeReview({ id: `old-${i}` }),
      );
      storage.safeSetItem('sim-scorecards', JSON.stringify(existing));

      // Re-mount so it loads the 100
      const { result: fresh } = renderHook(() => useScorecards());
      act(() => { fresh.current.saveScorecard(makeReview({ id: 'new-entry' })); });

      expect(fresh.current.scorecards.length).toBe(100);
      expect(fresh.current.scorecards[0].id).toBe('new-entry');
      // Last old item should be dropped
      expect(fresh.current.scorecards.find((r) => r.id === 'old-99')).toBeUndefined();
    });

    it('cap is exactly 100, not 101', () => {
      const existing = Array.from({ length: 99 }, (_, i) => makeReview({ id: `r${i}` }));
      storage.safeSetItem('sim-scorecards', JSON.stringify(existing));
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'r99' })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'r100' })); });
      expect(result.current.scorecards.length).toBe(100);
    });
  });

  describe('getScorecardsForProblem', () => {
    it('returns empty array when no scorecards match', () => {
      const { result } = renderHook(() => useScorecards());
      expect(result.current.getScorecardsForProblem('unknown')).toEqual([]);
    });

    it('returns scorecards matching the given problemId', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'r1', problemId: 'two-sum' })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'r2', problemId: 'two-sum' })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'r3', problemId: 'binary-search' })); });
      const results = result.current.getScorecardsForProblem('two-sum');
      expect(results.length).toBe(2);
      expect(results.every((r) => r.problemId === 'two-sum')).toBe(true);
    });

    it('does not include scorecards for other problems', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'r1', problemId: 'other' })); });
      expect(result.current.getScorecardsForProblem('two-sum')).toEqual([]);
    });

    it('handles null problemId — matches only null problemId entries', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'r1', problemId: null })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'r2', problemId: 'two-sum' })); });
      const nullResults = result.current.getScorecardsForProblem(null as unknown as string);
      expect(nullResults.length).toBe(1);
      expect(nullResults[0].id).toBe('r1');
    });
  });

  describe('getLatestScorecard', () => {
    it('returns null when there are no scorecards', () => {
      const { result } = renderHook(() => useScorecards());
      expect(result.current.getLatestScorecard()).toBeNull();
    });

    it('returns the first (most recently saved) scorecard', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'first' })); });
      act(() => { result.current.saveScorecard(makeReview({ id: 'latest' })); });
      expect(result.current.getLatestScorecard()?.id).toBe('latest');
    });

    it('returns the only scorecard when there is one', () => {
      const { result } = renderHook(() => useScorecards());
      act(() => { result.current.saveScorecard(makeReview({ id: 'solo' })); });
      expect(result.current.getLatestScorecard()?.id).toBe('solo');
    });
  });

  describe('persistence across remounts', () => {
    it('reloads scorecards from storage on fresh mount', () => {
      const { result: r1 } = renderHook(() => useScorecards());
      act(() => { r1.current.saveScorecard(makeReview({ id: 'persist-me' })); });

      const { result: r2 } = renderHook(() => useScorecards());
      expect(r2.current.scorecards[0].id).toBe('persist-me');
    });
  });

  describe('stable references', () => {
    it('saveScorecard reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useScorecards());
      const ref = result.current.saveScorecard;
      rerender();
      expect(result.current.saveScorecard).toBe(ref);
    });

    it('getScorecardsForProblem reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useScorecards());
      const ref = result.current.getScorecardsForProblem;
      rerender();
      expect(result.current.getScorecardsForProblem).toBe(ref);
    });

    it('getLatestScorecard reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useScorecards());
      const ref = result.current.getLatestScorecard;
      rerender();
      expect(result.current.getLatestScorecard).toBe(ref);
    });
  });
});

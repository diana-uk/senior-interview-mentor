import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePatternQuiz } from '../usePatternQuiz';
import type { PatternName } from '../../types';

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

const PATTERN = 'HashMap' as PatternName;
const PATTERN_B = 'Sliding Window' as PatternName;

beforeEach(() => {
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('usePatternQuiz', () => {
  describe('initial state', () => {
    it('starts with empty scores when nothing stored', () => {
      const { result } = renderHook(() => usePatternQuiz());
      expect(Object.keys(result.current.scores).length).toBe(0);
    });

    it('loads persisted scores from storage on mount', () => {
      storage.safeSetItem('sim-pattern-quiz', JSON.stringify({
        HashMap: { correct: 3, total: 5 },
      }));
      const { result } = renderHook(() => usePatternQuiz());
      expect(result.current.scores['HashMap']).toEqual({ correct: 3, total: 5 });
    });

    it('returns empty scores when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-pattern-quiz', 'not-json');
      const { result } = renderHook(() => usePatternQuiz());
      expect(Object.keys(result.current.scores).length).toBe(0);
    });

    it('returns empty scores when nothing is stored', () => {
      const { result } = renderHook(() => usePatternQuiz());
      expect(result.current.scores[PATTERN]).toBeUndefined();
    });
  });

  describe('recordAttempt — correct answer', () => {
    it('increments correct count by 1', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.scores[PATTERN]?.correct).toBe(1);
    });

    it('increments total count by 1', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.scores[PATTERN]?.total).toBe(1);
    });

    it('accumulates multiple correct answers', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.scores[PATTERN]?.correct).toBe(3);
      expect(result.current.scores[PATTERN]?.total).toBe(3);
    });
  });

  describe('recordAttempt — incorrect answer', () => {
    it('does NOT increment correct count', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, false); });
      expect(result.current.scores[PATTERN]?.correct).toBe(0);
    });

    it('increments total count by 1', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, false); });
      expect(result.current.scores[PATTERN]?.total).toBe(1);
    });
  });

  describe('recordAttempt — mixed attempts', () => {
    it('tracks correct and incorrect separately', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN, false); });
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.scores[PATTERN]?.correct).toBe(2);
      expect(result.current.scores[PATTERN]?.total).toBe(3);
    });

    it('handles two patterns independently', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN_B, false); });
      expect(result.current.scores[PATTERN]?.correct).toBe(1);
      expect(result.current.scores[PATTERN_B]?.correct).toBe(0);
      expect(result.current.scores[PATTERN_B]?.total).toBe(1);
    });

    it('does not affect other patterns when recording one pattern', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN_B, true); });
      expect(result.current.scores[PATTERN]?.total).toBe(1);
      expect(result.current.scores[PATTERN_B]?.total).toBe(1);
    });
  });

  describe('recordAttempt — persistence', () => {
    it('persists score to storage after correct answer', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      const stored = JSON.parse(storage.safeGetItem('sim-pattern-quiz') ?? '{}') as Record<string, unknown>;
      expect(stored[PATTERN]).toEqual({ correct: 1, total: 1 });
    });

    it('persists score to storage after incorrect answer', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, false); });
      const stored = JSON.parse(storage.safeGetItem('sim-pattern-quiz') ?? '{}') as Record<string, unknown>;
      expect(stored[PATTERN]).toEqual({ correct: 0, total: 1 });
    });
  });

  describe('getAccuracy', () => {
    it('returns null for an unknown pattern', () => {
      const { result } = renderHook(() => usePatternQuiz());
      expect(result.current.getAccuracy(PATTERN)).toBeNull();
    });

    it('returns null when total is 0 (edge case via loaded data)', () => {
      storage.safeSetItem('sim-pattern-quiz', JSON.stringify({ HashMap: { correct: 0, total: 0 } }));
      const { result } = renderHook(() => usePatternQuiz());
      expect(result.current.getAccuracy(PATTERN)).toBeNull();
    });

    it('returns 1.0 when all attempts are correct', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.getAccuracy(PATTERN)).toBe(1.0);
    });

    it('returns 0.0 when all attempts are incorrect', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, false); });
      act(() => { result.current.recordAttempt(PATTERN, false); });
      expect(result.current.getAccuracy(PATTERN)).toBe(0.0);
    });

    it('returns 0.5 for 1 correct out of 2', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      act(() => { result.current.recordAttempt(PATTERN, false); });
      expect(result.current.getAccuracy(PATTERN)).toBe(0.5);
    });

    it('returns correct ratio for loaded scores', () => {
      storage.safeSetItem('sim-pattern-quiz', JSON.stringify({ HashMap: { correct: 3, total: 4 } }));
      const { result } = renderHook(() => usePatternQuiz());
      expect(result.current.getAccuracy(PATTERN)).toBe(0.75);
    });

    it('returns null for PATTERN_B when only PATTERN has been attempted', () => {
      const { result } = renderHook(() => usePatternQuiz());
      act(() => { result.current.recordAttempt(PATTERN, true); });
      expect(result.current.getAccuracy(PATTERN_B)).toBeNull();
    });
  });

  describe('persistence across remounts', () => {
    it('reloads scores from storage on a fresh mount', () => {
      const { result: r1 } = renderHook(() => usePatternQuiz());
      act(() => { r1.current.recordAttempt(PATTERN, true); });

      const { result: r2 } = renderHook(() => usePatternQuiz());
      expect(r2.current.scores[PATTERN]).toEqual({ correct: 1, total: 1 });
    });

    it('accumulated score across sessions', () => {
      const { result: r1 } = renderHook(() => usePatternQuiz());
      act(() => { r1.current.recordAttempt(PATTERN, true); });
      act(() => { r1.current.recordAttempt(PATTERN, false); });

      const { result: r2 } = renderHook(() => usePatternQuiz());
      expect(r2.current.scores[PATTERN]).toEqual({ correct: 1, total: 2 });
    });
  });

  describe('stable references', () => {
    it('recordAttempt reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => usePatternQuiz());
      const first = result.current.recordAttempt;
      rerender();
      expect(result.current.recordAttempt).toBe(first);
    });

    it('getAccuracy reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => usePatternQuiz());
      const first = result.current.getAccuracy;
      rerender();
      expect(result.current.getAccuracy).toBe(first);
    });
  });
});

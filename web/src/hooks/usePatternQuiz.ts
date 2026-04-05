import { useState, useCallback } from 'react';
import type { PatternName } from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-pattern-quiz';

export interface PatternQuizScore {
  correct: number;
  total: number;
}

export type PatternQuizScores = Partial<Record<PatternName, PatternQuizScore>>;

function loadScores(): PatternQuizScores {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PatternQuizScores;
  } catch {
    return {};
  }
}

export function usePatternQuiz() {
  const [scores, setScores] = useState<PatternQuizScores>(loadScores);

  const recordAttempt = useCallback((pattern: PatternName, correct: boolean) => {
    setScores((prev) => {
      const existing = prev[pattern] ?? { correct: 0, total: 0 };
      const next: PatternQuizScores = {
        ...prev,
        [pattern]: {
          correct: existing.correct + (correct ? 1 : 0),
          total: existing.total + 1,
        },
      };
      safeSetItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getAccuracy = useCallback((pattern: PatternName): number | null => {
    const s = scores[pattern];
    if (!s || s.total === 0) return null;
    return s.correct / s.total;
  }, [scores]);

  return { scores, recordAttempt, getAccuracy };
}

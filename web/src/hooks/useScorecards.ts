import { useState, useCallback } from 'react';
import type { ReviewResult } from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-scorecards';
const MAX_SCORECARDS = 100;

function loadScorecards(): ReviewResult[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewResult[];
  } catch {
    return [];
  }
}

export function useScorecards() {
  const [scorecards, setScorecards] = useState<ReviewResult[]>(loadScorecards);

  const saveScorecard = useCallback((review: ReviewResult) => {
    setScorecards((prev) => {
      const next = [review, ...prev].slice(0, MAX_SCORECARDS);
      safeSetItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getScorecardsForProblem = useCallback(
    (problemId: string): ReviewResult[] => {
      return scorecards.filter((r) => r.problemId === problemId);
    },
    [scorecards],
  );

  const getLatestScorecard = useCallback((): ReviewResult | null => {
    return scorecards[0] ?? null;
  }, [scorecards]);

  return { scorecards, saveScorecard, getScorecardsForProblem, getLatestScorecard };
}

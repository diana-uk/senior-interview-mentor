import { useMemo } from 'react';
import { allProblemsList, problemPatternMap } from '../data/problems';
import type { RecommendedProblemEntry } from '../components/panels/ProblemList';
import type { ProblemStatus } from '../types';

/**
 * Simple deterministic hash: converts a date string to a stable index.
 * Uses djb2 algorithm for good distribution across the problem list.
 */
export function hashDateToIndex(dateStr: string, max: number): number {
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0;
  }
  return ((hash % max) + max) % max;
}

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Picks a daily challenge problem deterministically based on the date.
 * Prefers unseen problems; falls back to the hashed pick if all are solved.
 */
export function pickDailyChallenge(
  dateKey: string,
  getProblemStatus?: (id: string) => ProblemStatus,
): RecommendedProblemEntry {
  const problems = allProblemsList;
  const baseIndex = hashDateToIndex(dateKey, problems.length);

  // Try to find an unseen problem starting from baseIndex
  if (getProblemStatus) {
    for (let offset = 0; offset < problems.length; offset++) {
      const idx = (baseIndex + offset) % problems.length;
      const p = problems[idx];
      if (getProblemStatus(p.id) === 'unseen') {
        return {
          id: p.id,
          title: p.title,
          difficulty: p.difficulty,
          pattern: problemPatternMap[p.id] ?? '',
          reason: 'Daily challenge — fresh problem!',
        };
      }
    }
  }

  // Fallback: use the hashed pick regardless of status
  const p = problems[baseIndex];
  return {
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    pattern: problemPatternMap[p.id] ?? '',
    reason: 'Daily challenge',
  };
}

/**
 * Hook that returns today's daily challenge problem.
 */
export function useDailyChallenge(
  getProblemStatus?: (id: string) => ProblemStatus,
): RecommendedProblemEntry {
  return useMemo(
    () => pickDailyChallenge(getTodayKey(), getProblemStatus),
    [getProblemStatus],
  );
}

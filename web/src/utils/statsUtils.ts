import type { PatternName, SessionRecord, StatsData } from '../types';

export const ALL_PATTERNS: PatternName[] = [
  'Sliding Window', 'Two Pointers', 'HashMap', 'Prefix Sum',
  'BFS/DFS', 'Topological Sort', 'Union-Find', 'Binary Search',
  'Heap', 'Intervals', 'Greedy', 'Dynamic Programming',
  'Backtracking', 'Trees',
];

/**
 * Create an empty stats object with zeroed counters and default pattern strengths.
 */
export function emptyStats(): StatsData {
  return {
    problemsSolved: 0,
    totalAttempts: 0,
    totalTime: 0,
    hintsUsed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    avgScore: 0,
    patternStrengths: ALL_PATTERNS.map((p) => ({
      pattern: p,
      solved: 0,
      attempted: 0,
      avgScore: 0,
      lastPracticed: null,
    })),
    sessions: [],
    problemProgress: {},
    reviews: [],
  };
}

/**
 * Compute a new running average after one additional score observation.
 * Rounds to 1 decimal place; guards against NaN/Infinity.
 */
export function calcNewAvgScore(
  existingAvg: number,
  existingAttempted: number,
  newScore: number,
): number {
  const newAttempted = existingAttempted + 1;
  const rawAvg =
    existingAttempted > 0
      ? (existingAvg * existingAttempted + newScore) / newAttempted
      : newScore;
  return Number.isFinite(rawAvg) ? Math.round(rawAvg * 10) / 10 : 0;
}

/**
 * Compute the average score across all sessions that have a non-null score.
 * Returns 0 when no scored sessions exist.
 */
export function calcSessionAvgScore(sessions: SessionRecord[]): number {
  const scored = sessions.filter((s) => s.score !== null);
  if (scored.length === 0) return 0;
  const raw = scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length;
  return Number.isFinite(raw) ? Math.round(raw * 10) / 10 : 0;
}

/**
 * Updates streak fields based on today's date vs the last active date.
 * - Same day: no-op (returns same object)
 * - Active yesterday: increments currentStreak
 * - Gap or first time: resets currentStreak to 1
 * Also updates longestStreak and lastActiveDate.
 */
export function updateStreak(data: StatsData): StatsData {
  const t = new Date().toISOString().split('T')[0];
  if (data.lastActiveDate === t) return data;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (data.lastActiveDate === yesterdayStr) {
    newStreak = data.currentStreak + 1;
  } else if (data.lastActiveDate === '') {
    newStreak = 1;
  } else {
    newStreak = 1; // streak broken
  }

  return {
    ...data,
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActiveDate: t,
  };
}

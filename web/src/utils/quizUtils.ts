import type { PatternName } from '../types';

export const ALL_QUIZ_PATTERNS: PatternName[] = [
  'Sliding Window', 'Two Pointers', 'HashMap', 'Prefix Sum',
  'BFS/DFS', 'Topological Sort', 'Union-Find', 'Binary Search',
  'Heap', 'Intervals', 'Greedy', 'Dynamic Programming',
  'Backtracking', 'Trees',
];

/**
 * Pick `n` random unique items from `arr`, optionally excluding one item.
 * Returns fewer than `n` items if the pool is too small.
 */
export function pickRandom<T>(arr: T[], exclude?: T, n = 1): T[] {
  const pool = exclude != null ? arr.filter((x) => x !== exclude) : [...arr];
  const result: T[] = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

/**
 * Build a shuffled 4-choice array for a quiz question.
 * Contains exactly 1 correct answer and 3 distractors picked from ALL_QUIZ_PATTERNS.
 */
export function buildChoices(correct: PatternName): PatternName[] {
  const wrongs = pickRandom(ALL_QUIZ_PATTERNS, correct, 3);
  const choices = [correct, ...wrongs];
  // Fisher-Yates shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

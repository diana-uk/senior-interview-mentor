import type { PatternStrength } from '../types';

/**
 * Returns the number of whole days since the given date string.
 * Returns Infinity for null/missing dates.
 */
export function daysSince(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Score a pattern for how urgently it needs practice.
 * Higher score = should practice sooner.
 */
export function patternUrgency(ps: PatternStrength, mistakeCount: number): number {
  let score = 0;

  // Weak patterns score high (low avgScore = high urgency)
  if (ps.attempted > 0) {
    score += (4 - ps.avgScore) * 25;
  } else {
    // Never attempted patterns get moderate urgency
    score += 50;
  }

  // Patterns with more mistakes are more urgent
  score += mistakeCount * 15;

  // Patterns not practiced recently are more urgent
  const days = daysSince(ps.lastPracticed);
  if (days > 14) score += 30;
  else if (days > 7) score += 20;
  else if (days > 3) score += 10;

  // Low solve rate increases urgency
  if (ps.attempted > 0) {
    const solveRate = ps.solved / ps.attempted;
    score += (1 - solveRate) * 20;
  }

  return score;
}

import type { MistakeEntryFull, PatternName } from '../types';

/**
 * Group a flat mistakes array into a map of pattern → entries.
 */
export function groupMistakesByPattern(
  mistakes: MistakeEntryFull[],
): Record<string, MistakeEntryFull[]> {
  const grouped: Record<string, MistakeEntryFull[]> = {};
  for (const m of mistakes) {
    if (!grouped[m.pattern]) grouped[m.pattern] = [];
    grouped[m.pattern].push(m);
  }
  return grouped;
}

/**
 * Compute weak-pattern summary from a grouped mistakes map.
 * Each entry has: pattern name, mistake count, and average streak.
 * Sorted weakest-first (lowest avgStreak first).
 */
export function computeWeakPatterns(
  byPattern: Record<string, MistakeEntryFull[]>,
): { pattern: PatternName; count: number; avgStreak: number }[] {
  return Object.entries(byPattern)
    .map(([pattern, entries]) => ({
      pattern: pattern as PatternName,
      count: entries.length,
      avgStreak:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + e.streak, 0) / entries.length
          : 0,
    }))
    .sort((a, b) => a.avgStreak - b.avgStreak);
}

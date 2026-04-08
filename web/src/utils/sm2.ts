/**
 * SM-2 spaced repetition algorithm.
 * quality: 0–5 (0–2 = fail, 3–5 = pass)
 * Returns updated repetitions, easeFactor, and next interval (in days).
 */
export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number,
): { repetitions: number; easeFactor: number; interval: number } {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  if (quality < 3) {
    // Failed: reset repetitions and interval
    return { repetitions: 0, easeFactor: newEF, interval: 1 };
  }

  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  return { repetitions: repetitions + 1, easeFactor: newEF, interval: newInterval };
}

/**
 * Add `days` days to a YYYY-MM-DD date string.
 * Returns the resulting date as YYYY-MM-DD.
 */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

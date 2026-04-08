import type { PatternStrength } from '../types';

/**
 * Returns the 3 weakest pattern areas (lowest solve ratio) from attempted patterns.
 */
export function getWeakAreas(strengths: PatternStrength[]): PatternStrength[] {
  return [...strengths]
    .filter((s) => s.attempted > 0)
    .sort((a, b) => (a.solved / a.attempted) - (b.solved / b.attempted))
    .slice(0, 3);
}

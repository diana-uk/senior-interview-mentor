import { allProblemsList } from '../data/problems';
import type { Difficulty, ProblemStatus } from '../types';

export interface DifficultyBucket {
  difficulty: Difficulty;
  total: number;
  solved: number;
  attempted: number;
  color: string;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'var(--neon-lime)',
  Medium: 'var(--neon-amber)',
  Hard: 'var(--neon-red)',
};

/**
 * Computes per-difficulty counts of total / solved / attempted problems.
 */
export function computeDifficultyDistribution(
  getProblemStatus: (id: string) => ProblemStatus,
): DifficultyBucket[] {
  const buckets: Record<Difficulty, { total: number; solved: number; attempted: number }> = {
    Easy: { total: 0, solved: 0, attempted: 0 },
    Medium: { total: 0, solved: 0, attempted: 0 },
    Hard: { total: 0, solved: 0, attempted: 0 },
  };

  for (const p of allProblemsList) {
    buckets[p.difficulty].total++;
    const status = getProblemStatus(p.id);
    if (status === 'solved') buckets[p.difficulty].solved++;
    else if (status === 'attempted') buckets[p.difficulty].attempted++;
  }

  return (['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => ({
    difficulty: d,
    ...buckets[d],
    color: DIFFICULTY_COLORS[d],
  }));
}

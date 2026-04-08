import type { Difficulty, PatternStrength, ProblemStatus } from '../types';

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

// ─── Difficulty ordering + problem picker (SIM-254) ───────────────────────

export const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

/**
 * Pick the best unsolved problem from a list, favouring appropriate difficulty
 * based on the user's pattern strength. Prefers unseen > attempted, then
 * minimises distance from the target difficulty.
 */
export function pickProblemFromPattern(
  problems: Array<{ id: string; title: string; difficulty: Difficulty }>,
  getProblemStatus: (id: string) => ProblemStatus,
  strength: PatternStrength | undefined,
  preferDifficulty?: Difficulty,
): { id: string; title: string; difficulty: Difficulty } | null {
  if (!problems || problems.length === 0) return null;

  const unsolved = problems.filter((p) => getProblemStatus(p.id) !== 'solved');
  if (unsolved.length === 0) return null;

  let targetDifficulty: Difficulty;
  if (preferDifficulty) {
    targetDifficulty = preferDifficulty;
  } else if (!strength || strength.attempted === 0) {
    targetDifficulty = 'Easy';
  } else if (strength.avgScore >= 3.5) {
    targetDifficulty = 'Hard';
  } else if (strength.avgScore >= 2.0) {
    targetDifficulty = 'Medium';
  } else {
    targetDifficulty = 'Easy';
  }

  const sorted = [...unsolved].sort((a, b) => {
    const aStatus = getProblemStatus(a.id);
    const bStatus = getProblemStatus(b.id);

    if (aStatus === 'unseen' && bStatus !== 'unseen') return -1;
    if (bStatus === 'unseen' && aStatus !== 'unseen') return 1;

    const aDist = Math.abs(DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[targetDifficulty]);
    const bDist = Math.abs(DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[targetDifficulty]);
    return aDist - bDist;
  });

  return sorted[0];
}

// ─── Readiness scoring (SIM-255) ──────────────────────────────────────────

export interface CompanyReadiness {
  company: string;
  score: number;
  strongPatterns: string[];
  weakPatterns: string[];
}

export const INTERVIEW_LEVEL_THRESHOLDS = {
  junior: { minPatterns: 6,  minSolveRate: 0.3,  minAvgScore: 2.0 },
  mid:    { minPatterns: 10, minSolveRate: 0.5,  minAvgScore: 2.5 },
  senior: { minPatterns: 13, minSolveRate: 0.6,  minAvgScore: 3.0 },
  staff:  { minPatterns: 14, minSolveRate: 0.75, minAvgScore: 3.5 },
} as const;

/**
 * Overall interview readiness score (0–100).
 * Weights: 40% solved breadth, 30% pattern coverage, 30% avg quality.
 */
export function calcReadinessScore(
  allProblems: Array<{ id: string }>,
  patternStrengths: PatternStrength[],
  getProblemStatus: (id: string) => ProblemStatus,
): number {
  const totalProblems = allProblems.length;
  if (totalProblems === 0) return 0;

  let score = 0;

  const solvedCount = allProblems.filter((p) => getProblemStatus(p.id) === 'solved').length;
  score += (solvedCount / totalProblems) * 40;

  const practicedPatterns = patternStrengths.filter((ps) => ps.attempted > 0).length;
  const totalPatterns = patternStrengths.length;
  score += totalPatterns > 0 ? (practicedPatterns / totalPatterns) * 30 : 0;

  const scoredPatterns = patternStrengths.filter((ps) => ps.attempted > 0);
  if (scoredPatterns.length > 0) {
    const avgPatternScore =
      scoredPatterns.reduce((sum, ps) => sum + ps.avgScore, 0) / scoredPatterns.length;
    score += (avgPatternScore / 4) * 30;
  }

  return Math.round(score);
}

/**
 * Interview readiness broken down by pattern strength/weakness for a target level.
 */
export function calcInterviewReadyScore(
  allProblems: Array<{ id: string }>,
  patternStrengths: PatternStrength[],
  getProblemStatus: (id: string) => ProblemStatus,
  level: keyof typeof INTERVIEW_LEVEL_THRESHOLDS = 'senior',
): CompanyReadiness {
  const target = INTERVIEW_LEVEL_THRESHOLDS[level];
  const strongPatterns: string[] = [];
  const weakPatterns: string[] = [];

  for (const ps of patternStrengths) {
    if (ps.attempted === 0) {
      weakPatterns.push(ps.pattern);
      continue;
    }
    const solveRate = ps.solved / Math.max(ps.attempted, 1);
    if (solveRate >= target.minSolveRate && ps.avgScore >= target.minAvgScore) {
      strongPatterns.push(ps.pattern);
    } else {
      weakPatterns.push(ps.pattern);
    }
  }

  const patternCoverageScore = Math.min(strongPatterns.length / target.minPatterns, 1) * 40;

  const scoredPatterns = patternStrengths.filter((ps) => ps.attempted > 0);
  const avgQuality = scoredPatterns.length > 0
    ? scoredPatterns.reduce((sum, ps) => sum + ps.avgScore, 0) / scoredPatterns.length
    : 0;
  const qualityScore = Math.min(avgQuality / target.minAvgScore, 1) * 35;

  const totalSolved = allProblems.filter((p) => getProblemStatus(p.id) === 'solved').length;
  const breadthScore = allProblems.length > 0
    ? Math.min(totalSolved / (allProblems.length * target.minSolveRate), 1) * 25
    : 0;

  return {
    company: `${level.charAt(0).toUpperCase()}${level.slice(1)} Level`,
    score: Math.round(patternCoverageScore + qualityScore + breadthScore),
    strongPatterns,
    weakPatterns,
  };
}

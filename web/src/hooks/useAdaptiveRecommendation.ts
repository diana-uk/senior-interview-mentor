import { useCallback, useMemo } from 'react';
import type { Difficulty, PatternName, PatternStrength, ProblemStatus } from '../types';
import {
  problemsByPattern,
  problemsById,
  problemPatternMap,
  allProblemsList,
} from '../data/problems';

interface RecommendationInput {
  patternStrengths: PatternStrength[];
  getProblemStatus: (id: string) => ProblemStatus;
  weakPatterns: { pattern: PatternName; count: number; avgStreak: number }[];
}

export interface RecommendedProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  reason: string;
}

// Difficulty ordering for progression
const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

function daysSince(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Score a pattern for how urgently it needs practice.
 * Higher score = should practice sooner.
 */
function patternUrgency(ps: PatternStrength, mistakeCount: number): number {
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

/**
 * Pick the best unsolved problem from a pattern, favoring appropriate difficulty.
 */
function pickProblemFromPattern(
  pattern: string,
  getProblemStatus: (id: string) => ProblemStatus,
  strength: PatternStrength | undefined,
  preferDifficulty?: Difficulty,
): { id: string; title: string; difficulty: Difficulty } | null {
  const problems = problemsByPattern[pattern];
  if (!problems) return null;

  // Filter to unsolved problems
  const unsolved = problems.filter((p) => getProblemStatus(p.id) !== 'solved');
  if (unsolved.length === 0) return null;

  // Determine target difficulty
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

  // Sort by distance from target difficulty, preferring unattempted over attempted
  const sorted = [...unsolved].sort((a, b) => {
    const aStatus = getProblemStatus(a.id);
    const bStatus = getProblemStatus(b.id);

    // Prefer unattempted over previously-failed
    if (aStatus === 'unseen' && bStatus !== 'unseen') return -1;
    if (bStatus === 'unseen' && aStatus !== 'unseen') return 1;

    // Then sort by difficulty proximity to target
    const aDist = Math.abs(DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[targetDifficulty]);
    const bDist = Math.abs(DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[targetDifficulty]);
    return aDist - bDist;
  });

  return sorted[0];
}

export interface CompanyReadiness {
  company: string;
  score: number;
  strongPatterns: string[];
  weakPatterns: string[];
}

export interface UseAdaptiveRecommendationReturn {
  getNextProblem: (difficulty?: Difficulty) => RecommendedProblem | null;
  getRecommendations: (count?: number) => RecommendedProblem[];
  getReadinessScore: () => number;
  getPatternCoverage: () => { pattern: string; solved: number; total: number; percentage: number }[];
  getDailyChallenge: () => RecommendedProblem | null;
  getInterviewReadyScore: (level?: 'junior' | 'mid' | 'senior' | 'staff') => CompanyReadiness;
}

export function useAdaptiveRecommendation(
  input: RecommendationInput,
): UseAdaptiveRecommendationReturn {
  const { patternStrengths, getProblemStatus, weakPatterns } = input;

  // Build mistake count lookup
  const mistakeCountByPattern = useMemo(() => {
    const map: Record<string, number> = {};
    for (const wp of weakPatterns) {
      map[wp.pattern] = wp.count;
    }
    return map;
  }, [weakPatterns]);

  // Rank patterns by urgency
  const rankedPatterns = useMemo(() => {
    return [...patternStrengths]
      .map((ps) => ({
        ...ps,
        urgency: patternUrgency(ps, mistakeCountByPattern[ps.pattern] ?? 0),
      }))
      .sort((a, b) => b.urgency - a.urgency);
  }, [patternStrengths, mistakeCountByPattern]);

  const getNextProblem = useCallback(
    (difficulty?: Difficulty): RecommendedProblem | null => {
      for (const ps of rankedPatterns) {
        // Find the matching pattern group in problemsByPattern
        const patternGroup = Object.keys(problemsByPattern).find((g) =>
          g.toLowerCase().includes(ps.pattern.toLowerCase()) ||
          ps.pattern.toLowerCase().includes(g.toLowerCase()),
        );
        if (!patternGroup) continue;

        const problem = pickProblemFromPattern(
          patternGroup,
          getProblemStatus,
          ps,
          difficulty,
        );

        if (problem) {
          let reason: string;
          if (ps.attempted === 0) {
            reason = `Start learning ${ps.pattern} — you haven't practiced this pattern yet`;
          } else if (ps.avgScore < 2) {
            reason = `Strengthen ${ps.pattern} — your avg score is ${ps.avgScore.toFixed(1)}/4`;
          } else if (daysSince(ps.lastPracticed) > 7) {
            reason = `Review ${ps.pattern} — last practiced ${daysSince(ps.lastPracticed)} days ago`;
          } else if (mistakeCountByPattern[ps.pattern] > 0) {
            reason = `Address ${ps.pattern} mistakes — ${mistakeCountByPattern[ps.pattern]} tracked mistakes`;
          } else {
            reason = `Level up ${ps.pattern} — try a harder challenge`;
          }

          return {
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            pattern: patternGroup,
            reason,
          };
        }
      }
      return null;
    },
    [rankedPatterns, getProblemStatus, mistakeCountByPattern],
  );

  const getRecommendations = useCallback(
    (count = 5): RecommendedProblem[] => {
      const results: RecommendedProblem[] = [];
      const usedPatterns = new Set<string>();

      for (const ps of rankedPatterns) {
        if (results.length >= count) break;

        const patternGroup = Object.keys(problemsByPattern).find((g) =>
          g.toLowerCase().includes(ps.pattern.toLowerCase()) ||
          ps.pattern.toLowerCase().includes(g.toLowerCase()),
        );
        if (!patternGroup || usedPatterns.has(patternGroup)) continue;

        const problem = pickProblemFromPattern(patternGroup, getProblemStatus, ps);
        if (!problem) continue;

        usedPatterns.add(patternGroup);

        let reason: string;
        if (ps.attempted === 0) {
          reason = `New pattern — start learning ${ps.pattern}`;
        } else if (ps.avgScore < 2) {
          reason = `Weak area — avg ${ps.avgScore.toFixed(1)}/4`;
        } else if (daysSince(ps.lastPracticed) > 7) {
          reason = `Due for review — ${daysSince(ps.lastPracticed)}d ago`;
        } else {
          reason = `Keep improving — ${ps.solved} solved`;
        }

        results.push({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          pattern: patternGroup,
          reason,
        });
      }

      return results;
    },
    [rankedPatterns, getProblemStatus],
  );

  const getReadinessScore = useCallback((): number => {
    const totalProblems = allProblemsList.length;
    if (totalProblems === 0) return 0;

    let score = 0;

    // 40% weight: problems solved
    const solvedCount = allProblemsList.filter(
      (p) => getProblemStatus(p.id) === 'solved',
    ).length;
    score += (solvedCount / totalProblems) * 40;

    // 30% weight: pattern coverage (practiced at least 1 problem in each pattern)
    const practicedPatterns = patternStrengths.filter((ps) => ps.attempted > 0).length;
    const totalPatterns = patternStrengths.length;
    score += totalPatterns > 0 ? (practicedPatterns / totalPatterns) * 30 : 0;

    // 30% weight: average score across patterns
    const scoredPatterns = patternStrengths.filter((ps) => ps.attempted > 0);
    if (scoredPatterns.length > 0) {
      const avgPatternScore =
        scoredPatterns.reduce((sum, ps) => sum + ps.avgScore, 0) / scoredPatterns.length;
      score += (avgPatternScore / 4) * 30;
    }

    return Math.round(score);
  }, [getProblemStatus, patternStrengths]);

  const getPatternCoverage = useCallback(() => {
    return Object.entries(problemsByPattern).map(([pattern, problems]) => {
      const solved = problems.filter((p) => getProblemStatus(p.id) === 'solved').length;
      return {
        pattern,
        solved,
        total: problems.length,
        percentage: problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0,
      };
    });
  }, [getProblemStatus]);

  /**
   * Deterministic daily challenge based on today's date.
   * Same problem for all users on any given day; picks from weak patterns.
   */
  const getDailyChallenge = useCallback((): RecommendedProblem | null => {
    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const allProblems = allProblemsList;
    if (allProblems.length === 0) return null;

    // Use date as seed to deterministically pick a problem
    const seedIndex = daysSinceEpoch % allProblems.length;

    // Try to find an unsolved problem starting from the seed index
    for (let offset = 0; offset < allProblems.length; offset++) {
      const idx = (seedIndex + offset) % allProblems.length;
      const problem = allProblems[idx];
      if (getProblemStatus(problem.id) !== 'solved') {
        const patterns = problemPatternMap[problem.id] ?? [];
        return {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          pattern: patterns[0] ?? 'General',
          reason: 'Daily Challenge — a fresh problem selected just for today',
        };
      }
    }

    // All problems solved — pick from seed anyway
    const fallback = allProblems[seedIndex];
    const patterns = problemPatternMap[fallback.id] ?? [];
    return {
      id: fallback.id,
      title: fallback.title,
      difficulty: fallback.difficulty,
      pattern: patterns[0] ?? 'General',
      reason: 'Daily Challenge — review this classic problem',
    };
  }, [getProblemStatus]);

  /**
   * Interview readiness score broken down by pattern strength/weakness.
   */
  const getInterviewReadyScore = useCallback(
    (level: 'junior' | 'mid' | 'senior' | 'staff' = 'senior'): CompanyReadiness => {
      // Define target thresholds per level
      const thresholds: Record<string, { minPatterns: number; minSolveRate: number; minAvgScore: number }> = {
        junior: { minPatterns: 6, minSolveRate: 0.3, minAvgScore: 2.0 },
        mid: { minPatterns: 10, minSolveRate: 0.5, minAvgScore: 2.5 },
        senior: { minPatterns: 13, minSolveRate: 0.6, minAvgScore: 3.0 },
        staff: { minPatterns: 14, minSolveRate: 0.75, minAvgScore: 3.5 },
      };
      const target = thresholds[level];

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

      // Score calculation: weighted combo of pattern coverage, solve quality, breadth
      const patternCoverageScore = Math.min(strongPatterns.length / target.minPatterns, 1) * 40;

      const scoredPatterns = patternStrengths.filter((ps) => ps.attempted > 0);
      const avgQuality = scoredPatterns.length > 0
        ? scoredPatterns.reduce((sum, ps) => sum + ps.avgScore, 0) / scoredPatterns.length
        : 0;
      const qualityScore = Math.min(avgQuality / target.minAvgScore, 1) * 35;

      const totalSolved = allProblemsList.filter((p) => getProblemStatus(p.id) === 'solved').length;
      const breadthScore = Math.min(totalSolved / (allProblemsList.length * target.minSolveRate), 1) * 25;

      return {
        company: `${level.charAt(0).toUpperCase()}${level.slice(1)} Level`,
        score: Math.round(patternCoverageScore + qualityScore + breadthScore),
        strongPatterns,
        weakPatterns,
      };
    },
    [patternStrengths, getProblemStatus],
  );

  return {
    getNextProblem,
    getRecommendations,
    getReadinessScore,
    getPatternCoverage,
    getDailyChallenge,
    getInterviewReadyScore,
  };
}

import { useCallback, useMemo } from 'react';
import type { Difficulty, PatternName, PatternStrength, ProblemStatus } from '../types';
import {
  problemsByPattern,
  problemPatternMap,
  allProblemsList,
} from '../data/problems';
import {
  daysSince,
  patternUrgency,
  DIFFICULTY_ORDER,
  pickProblemFromPattern,
  calcReadinessScore,
  calcInterviewReadyScore,
  type CompanyReadiness,
  INTERVIEW_LEVEL_THRESHOLDS,
} from '../utils/adaptiveUtils.js';

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

export type { CompanyReadiness };

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
          problemsByPattern[patternGroup] ?? [],
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

        const problem = pickProblemFromPattern(
          problemsByPattern[patternGroup] ?? [],
          getProblemStatus,
          ps,
        );
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

  const getReadinessScore = useCallback(
    (): number => calcReadinessScore(allProblemsList, patternStrengths, getProblemStatus),
    [getProblemStatus, patternStrengths],
  );

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
    (level: keyof typeof INTERVIEW_LEVEL_THRESHOLDS = 'senior'): CompanyReadiness =>
      calcInterviewReadyScore(allProblemsList, patternStrengths, getProblemStatus, level),
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

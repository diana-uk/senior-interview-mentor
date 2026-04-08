import { useState, useCallback } from 'react';
import type {
  Mode,
  PatternName,
  PatternStrength,
  ProblemProgress,
  ProblemStatus,
  ReviewResult,
  SessionRecord,
  StatsData,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';
import { ALL_PATTERNS, emptyStats, updateStreak, calcNewAvgScore, calcSessionAvgScore, todayString, generateId } from '../utils/statsUtils.js';

const STORAGE_KEY = 'sim-stats';

function loadStats(): StatsData {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    // Ensure all patterns exist (handles upgrades)
    const existing = new Set(parsed.patternStrengths?.map((p: PatternStrength) => p.pattern) ?? []);
    for (const p of ALL_PATTERNS) {
      if (!existing.has(p)) {
        parsed.patternStrengths = parsed.patternStrengths ?? [];
        parsed.patternStrengths.push({
          pattern: p, solved: 0, attempted: 0, avgScore: 0, lastPracticed: null,
        });
      }
    }
    return { ...emptyStats(), ...parsed };
  } catch {
    return emptyStats();
  }
}

function saveStats(data: StatsData): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
}

export interface UseStatsReturn {
  stats: StatsData;
  recordSession: (params: {
    problemId: string | null;
    problemTitle: string;
    mode: Mode;
    duration: number;
    hintsUsed: number;
    score: number | null;
    patterns: PatternName[];
  }) => void;
  recordProblemAttempt: (params: {
    problemId: string;
    status: ProblemStatus;
    score: number | null;
    time: number | null;
    hintsUsed: number;
    code: string;
  }) => void;
  recordReview: (review: ReviewResult) => void;
  updatePatternStrength: (pattern: PatternName, solved: boolean, score: number) => void;
  getPatternStrength: (pattern: PatternName) => PatternStrength | undefined;
  getWeakestPatterns: (n?: number) => PatternStrength[];
  getStrongestPatterns: (n?: number) => PatternStrength[];
  getProblemStatus: (problemId: string) => ProblemStatus;
  getRecentSessions: (n?: number) => SessionRecord[];
  resetStats: () => void;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData>(loadStats);

  const persist = useCallback((updated: StatsData) => {
    setStats(updated);
    saveStats(updated);
  }, []);

  const recordSession = useCallback(
    (params: {
      problemId: string | null;
      problemTitle: string;
      mode: Mode;
      duration: number;
      hintsUsed: number;
      score: number | null;
      patterns: PatternName[];
    }) => {
      const current = loadStats();
      const session: SessionRecord = {
        id: generateId(),
        date: todayString(),
        problemId: params.problemId,
        problemTitle: params.problemTitle,
        mode: params.mode,
        duration: params.duration,
        hintsUsed: params.hintsUsed,
        score: params.score,
        patterns: params.patterns,
      };

      let updated: StatsData = {
        ...current,
        totalAttempts: current.totalAttempts + 1,
        totalTime: current.totalTime + params.duration,
        hintsUsed: current.hintsUsed + params.hintsUsed,
        sessions: [session, ...current.sessions].slice(0, 100), // keep last 100
      };

      // Update avg score if we have a score
      if (params.score !== null) {
        updated.avgScore = calcSessionAvgScore(updated.sessions);
      }

      updated = updateStreak(updated);
      persist(updated);
    },
    [persist],
  );

  const recordProblemAttempt = useCallback(
    (params: {
      problemId: string;
      status: ProblemStatus;
      score: number | null;
      time: number | null;
      hintsUsed: number;
      code: string;
    }) => {
      const current = loadStats();
      const existing = current.problemProgress[params.problemId];
      const progress: ProblemProgress = {
        problemId: params.problemId,
        status: params.status,
        attempts: (existing?.attempts ?? 0) + 1,
        bestScore:
          params.score !== null
            ? Math.max(existing?.bestScore ?? 0, params.score)
            : existing?.bestScore ?? null,
        bestTime:
          params.time !== null
            ? Math.min(existing?.bestTime ?? Infinity, params.time)
            : existing?.bestTime ?? null,
        lastAttempted: todayString(),
        hintsUsed: params.hintsUsed,
        code: params.code,
      };

      const wasSolved = existing?.status === 'solved';
      const nowSolved = params.status === 'solved';

      let updated = {
        ...current,
        problemProgress: { ...current.problemProgress, [params.problemId]: progress },
        problemsSolved: current.problemsSolved + (nowSolved && !wasSolved ? 1 : 0),
      };

      updated = updateStreak(updated);
      persist(updated);
    },
    [persist],
  );

  const recordReview = useCallback(
    (review: ReviewResult) => {
      const current = loadStats();
      persist({
        ...current,
        reviews: [review, ...current.reviews].slice(0, 50),
      });
    },
    [persist],
  );

  const updatePatternStrength = useCallback(
    (pattern: PatternName, solved: boolean, score: number) => {
      const current = loadStats();
      const strengths = current.patternStrengths.map((ps) => {
        if (ps.pattern !== pattern) return ps;
        const newAttempted = ps.attempted + 1;
        const newSolved = ps.solved + (solved ? 1 : 0);
        return {
          ...ps,
          attempted: newAttempted,
          solved: newSolved,
          avgScore: calcNewAvgScore(ps.avgScore ?? 0, ps.attempted ?? 0, score),
          lastPracticed: todayString(),
        };
      });
      persist({ ...current, patternStrengths: strengths });
    },
    [persist],
  );

  const getPatternStrength = useCallback(
    (pattern: PatternName) => stats.patternStrengths.find((p) => p.pattern === pattern),
    [stats.patternStrengths],
  );

  const getWeakestPatterns = useCallback(
    (n = 5) =>
      [...stats.patternStrengths]
        .filter((p) => p.attempted > 0)
        .sort((a, b) => a.avgScore - b.avgScore)
        .slice(0, n),
    [stats.patternStrengths],
  );

  const getStrongestPatterns = useCallback(
    (n = 5) =>
      [...stats.patternStrengths]
        .filter((p) => p.attempted > 0)
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, n),
    [stats.patternStrengths],
  );

  const getProblemStatus = useCallback(
    (problemId: string): ProblemStatus =>
      stats.problemProgress[problemId]?.status ?? 'unseen',
    [stats.problemProgress],
  );

  const getRecentSessions = useCallback(
    (n = 10) => stats.sessions.slice(0, n),
    [stats.sessions],
  );

  const resetStats = useCallback(() => {
    persist(emptyStats());
  }, [persist]);

  return {
    stats,
    recordSession,
    recordProblemAttempt,
    recordReview,
    updatePatternStrength,
    getPatternStrength,
    getWeakestPatterns,
    getStrongestPatterns,
    getProblemStatus,
    getRecentSessions,
    resetStats,
  };
}

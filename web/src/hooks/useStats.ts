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

const STORAGE_KEY = 'sim-stats';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

const ALL_PATTERNS: PatternName[] = [
  'Sliding Window', 'Two Pointers', 'HashMap', 'Prefix Sum',
  'BFS/DFS', 'Topological Sort', 'Union-Find', 'Binary Search',
  'Heap', 'Intervals', 'Greedy', 'Dynamic Programming',
  'Backtracking', 'Trees',
];

function emptyStats(): StatsData {
  return {
    problemsSolved: 0,
    totalAttempts: 0,
    totalTime: 0,
    hintsUsed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    avgScore: 0,
    patternStrengths: ALL_PATTERNS.map((p) => ({
      pattern: p,
      solved: 0,
      attempted: 0,
      avgScore: 0,
      lastPracticed: null,
    })),
    sessions: [],
    problemProgress: {},
    reviews: [],
  };
}

function loadStats(): StatsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

function updateStreak(data: StatsData): StatsData {
  const t = today();
  if (data.lastActiveDate === t) return data;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (data.lastActiveDate === yesterdayStr) {
    newStreak = data.currentStreak + 1;
  } else if (data.lastActiveDate === '') {
    newStreak = 1;
  } else {
    newStreak = 1; // streak broken
  }

  return {
    ...data,
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActiveDate: t,
  };
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
        date: today(),
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
        const scored = updated.sessions.filter((s) => s.score !== null);
        updated.avgScore =
          scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length;
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
        lastAttempted: today(),
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
        const newAvg =
          (ps.avgScore * ps.attempted + score) / newAttempted;
        return {
          ...ps,
          attempted: newAttempted,
          solved: newSolved,
          avgScore: Math.round(newAvg * 10) / 10,
          lastPracticed: today(),
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

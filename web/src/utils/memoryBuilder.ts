import type { StatsData, MistakeEntryFull } from '../types';
import type { HintStyle, DetailLevel } from '../components/panels/SettingsPanel';
import { problemsById } from '../data/problems';

export interface MemoryContext {
  hintStyle: HintStyle;
  detailLevel: DetailLevel;
  solvedProblems: { title: string; pattern: string; difficulty: string }[];
  weakPatterns: { pattern: string; mistakeCount: number; avgScore: number }[];
  strongPatterns: { pattern: string; solveCount: number; avgScore: number }[];
  recentMistakes: { problem: string; description: string }[];
  totalSolved: number;
  currentStreak: number;
}

export function buildMemorySummary(
  stats: StatsData,
  mistakes: MistakeEntryFull[],
  settings: { hintStyle: HintStyle; detailLevel: DetailLevel },
): MemoryContext {
  // Extract last 10 solved problems from problemProgress
  const solvedProblems = Object.values(stats.problemProgress)
    .filter((p) => p.status === 'solved')
    .sort((a, b) => (b.lastAttempted > a.lastAttempted ? 1 : -1))
    .slice(0, 10)
    .map((p) => {
      const problem = problemsById[p.problemId];
      return {
        title: problem?.title ?? p.problemId,
        pattern: problem?.pattern ?? 'Unknown',
        difficulty: problem?.difficulty ?? 'Unknown',
      };
    });

  // Top 5 weak patterns (lowest avgScore with >0 attempts)
  const weakPatterns = [...stats.patternStrengths]
    .filter((p) => p.attempted > 0)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5)
    .map((p) => {
      const mistakeCount = mistakes.filter((m) => m.pattern === p.pattern).length;
      return {
        pattern: p.pattern,
        mistakeCount,
        avgScore: p.avgScore,
      };
    });

  // Top 5 strong patterns (highest avgScore with >0 attempts)
  const strongPatterns = [...stats.patternStrengths]
    .filter((p) => p.attempted > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map((p) => ({
      pattern: p.pattern,
      solveCount: p.solved,
      avgScore: p.avgScore,
    }));

  // Recent 5 mistakes
  const recentMistakes = mistakes
    .slice(0, 5)
    .map((m) => ({
      problem: m.problemTitle,
      description: m.description,
    }));

  return {
    hintStyle: settings.hintStyle,
    detailLevel: settings.detailLevel,
    solvedProblems,
    weakPatterns,
    strongPatterns,
    recentMistakes,
    totalSolved: stats.problemsSolved,
    currentStreak: stats.currentStreak,
  };
}

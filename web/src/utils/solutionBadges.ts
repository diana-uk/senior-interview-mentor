export interface SolutionBadge {
  id: string;
  icon: string;
  label: string;
  color: string;
}

export const BADGE_DEFINITIONS: Record<string, SolutionBadge> = {
  'speed-demon': { id: 'speed-demon', icon: '⚡', label: 'Speed Demon', color: 'var(--neon-amber)' },
  'optimal': { id: 'optimal', icon: '🎯', label: 'Optimal', color: 'var(--neon-cyan)' },
  'no-hints': { id: 'no-hints', icon: '💡', label: 'No Hints', color: 'var(--neon-lime)' },
  'perfect-score': { id: 'perfect-score', icon: '🏆', label: 'Perfect Score', color: 'var(--neon-purple)' },
  'first-try': { id: 'first-try', icon: '🔄', label: 'First Try', color: 'var(--neon-cyan)' },
};

export interface SolutionMetrics {
  duration: number;
  hintsUsed: number;
  attempts: number;
  bestScore: number | null;
  isOptimalComplexity: boolean;
}

export function computeBadges(metrics: SolutionMetrics): SolutionBadge[] {
  const badges: SolutionBadge[] = [];

  if (metrics.duration > 0 && metrics.duration < 600) {
    badges.push(BADGE_DEFINITIONS['speed-demon']);
  }

  if (metrics.isOptimalComplexity) {
    badges.push(BADGE_DEFINITIONS['optimal']);
  }

  if (metrics.hintsUsed === 0) {
    badges.push(BADGE_DEFINITIONS['no-hints']);
  }

  if (metrics.bestScore !== null && metrics.bestScore === 4) {
    badges.push(BADGE_DEFINITIONS['perfect-score']);
  }

  if (metrics.attempts <= 1) {
    badges.push(BADGE_DEFINITIONS['first-try']);
  }

  return badges;
}

export function getBadgesForProblem(progress: {
  bestScore: number | null;
  bestTime: number | null;
  hintsUsed: number;
  attempts: number;
}, isOptimalComplexity = false): SolutionBadge[] {
  return computeBadges({
    duration: progress.bestTime ?? 0,
    hintsUsed: progress.hintsUsed,
    attempts: progress.attempts,
    bestScore: progress.bestScore,
    isOptimalComplexity,
  });
}

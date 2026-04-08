import type { AchievementId, StatsData } from '../types';

/**
 * Pure function that evaluates whether a given achievement condition is met.
 */
export function checkCondition(id: AchievementId, stats: StatsData): boolean {
  switch (id) {
    // Milestones
    case 'first-solve': return stats.problemsSolved >= 1;
    case 'ten-solved': return stats.problemsSolved >= 10;
    case 'twenty-five-solved': return stats.problemsSolved >= 25;
    case 'fifty-solved': return stats.problemsSolved >= 50;
    case 'hundred-solved': return stats.problemsSolved >= 100;
    case 'all-clear': return stats.problemsSolved >= 150;

    // Streaks
    case 'streak-3': return stats.longestStreak >= 3;
    case 'streak-7': return stats.longestStreak >= 7;
    case 'streak-14': return stats.longestStreak >= 14;
    case 'streak-30': return stats.longestStreak >= 30;

    // Patterns
    case 'pattern-explorer': {
      const attempted = stats.patternStrengths.filter(p => p.attempted > 0).length;
      return attempted >= 5;
    }
    case 'pattern-master': {
      const attempted = stats.patternStrengths.filter(p => p.attempted > 0);
      return attempted.length >= 3 && attempted.every(p => p.avgScore >= 3.0);
    }

    // Speed
    case 'speed-demon': {
      return stats.sessions.some(s => s.duration > 0 && s.duration < 300 && s.score !== null && s.score >= 3);
    }
    case 'lightning-round': {
      const dateCounts: Record<string, number> = {};
      for (const s of stats.sessions) {
        if (s.score !== null && s.score >= 3) {
          dateCounts[s.date] = (dateCounts[s.date] || 0) + 1;
        }
      }
      return Object.values(dateCounts).some(c => c >= 3);
    }

    // Mastery
    case 'perfect-score': {
      return stats.reviews.some(r => r.overallScore >= 4.0);
    }
    case 'hint-free': {
      return Object.values(stats.problemProgress).some(
        p => p.status === 'solved' && p.hintsUsed === 0,
      );
    }
    case 'review-ace': {
      if (stats.reviews.length < 5) return false;
      const avgScore = stats.reviews.slice(0, 5).reduce((sum, r) => sum + r.overallScore, 0) / 5;
      return avgScore >= 3.5;
    }

    default: return false;
  }
}

import { useState, useCallback, useRef } from 'react';
import type {
  Achievement,
  AchievementId,
  AchievementsData,
  StatsData,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-achievements';

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  // Milestones
  { id: 'first-solve', title: 'First Blood', description: 'Solve your first problem', icon: '\u{1F3AF}', category: 'milestones' },
  { id: 'ten-solved', title: 'Getting Warm', description: 'Solve 10 problems', icon: '\u{1F525}', category: 'milestones' },
  { id: 'twenty-five-solved', title: 'Quarter Century', description: 'Solve 25 problems', icon: '\u{1F4AA}', category: 'milestones' },
  { id: 'fifty-solved', title: 'Half Way There', description: 'Solve 50 problems', icon: '\u{26A1}', category: 'milestones' },
  { id: 'hundred-solved', title: 'Centurion', description: 'Solve 100 problems', icon: '\u{1F3C6}', category: 'milestones' },
  { id: 'all-clear', title: 'All Clear', description: 'Solve all 150 problems', icon: '\u{1F451}', category: 'milestones' },
  // Streaks
  { id: 'streak-3', title: 'Three-Peat', description: 'Maintain a 3-day streak', icon: '\u{1F4C6}', category: 'streaks' },
  { id: 'streak-7', title: 'Weekly Warrior', description: 'Maintain a 7-day streak', icon: '\u{1F5D3}\u{FE0F}', category: 'streaks' },
  { id: 'streak-14', title: 'Fortnight Force', description: 'Maintain a 14-day streak', icon: '\u{1F31F}', category: 'streaks' },
  { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '\u{1F48E}', category: 'streaks' },
  // Patterns
  { id: 'pattern-explorer', title: 'Pattern Explorer', description: 'Attempt 5 different patterns', icon: '\u{1F9ED}', category: 'patterns' },
  { id: 'pattern-master', title: 'Pattern Master', description: 'Average 3.0+ on all attempted patterns', icon: '\u{1F9E0}', category: 'patterns' },
  // Speed
  { id: 'speed-demon', title: 'Speed Demon', description: 'Solve a problem in under 5 minutes', icon: '\u{23F1}\u{FE0F}', category: 'speed' },
  { id: 'lightning-round', title: 'Lightning Round', description: 'Solve 3 problems in one day', icon: '\u{26A1}', category: 'speed' },
  // Mastery
  { id: 'perfect-score', title: 'Perfect Score', description: 'Get a 4.0 review score', icon: '\u{1F4AF}', category: 'mastery' },
  { id: 'hint-free', title: 'No Training Wheels', description: 'Solve a problem without any hints', icon: '\u{1F6B2}', category: 'mastery' },
  { id: 'review-ace', title: 'Review Ace', description: 'Complete 5 reviews with avg 3.5+', icon: '\u{2B50}', category: 'mastery' },
];

function loadAchievements(): AchievementsData {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return { unlocked: {} as Record<AchievementId, string> };
    return JSON.parse(raw);
  } catch {
    return { unlocked: {} as Record<AchievementId, string> };
  }
}

function saveAchievements(data: AchievementsData): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(data));
}

function checkCondition(id: AchievementId, stats: StatsData): boolean {
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
        p => p.status === 'solved' && p.hintsUsed === 0
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

export interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  checkAchievements: (stats: StatsData) => Achievement[];
  resetAchievements: () => void;
}

export function useAchievements(): UseAchievementsReturn {
  const [data, setData] = useState<AchievementsData>(loadAchievements);
  const prevUnlockedRef = useRef<Set<string>>(new Set(Object.keys(data.unlocked)));

  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map(def => ({
    ...def,
    unlockedAt: data.unlocked[def.id] ?? undefined,
  }));

  const unlockedCount = Object.keys(data.unlocked).length;
  const totalCount = ACHIEVEMENT_DEFS.length;

  const checkAchievements = useCallback((stats: StatsData): Achievement[] => {
    const current = loadAchievements();
    const newlyUnlocked: Achievement[] = [];
    let changed = false;

    for (const def of ACHIEVEMENT_DEFS) {
      if (current.unlocked[def.id]) continue;
      if (checkCondition(def.id, stats)) {
        const now = new Date().toISOString();
        current.unlocked[def.id] = now;
        changed = true;
        // Only report as "new" if it wasn't in our previous check
        if (!prevUnlockedRef.current.has(def.id)) {
          newlyUnlocked.push({ ...def, unlockedAt: now });
        }
      }
    }

    if (changed) {
      saveAchievements(current);
      setData(current);
      prevUnlockedRef.current = new Set(Object.keys(current.unlocked));
    }

    return newlyUnlocked;
  }, []);

  const resetAchievements = useCallback(() => {
    const empty = { unlocked: {} as Record<AchievementId, string> };
    saveAchievements(empty);
    setData(empty);
    prevUnlockedRef.current = new Set();
  }, []);

  return { achievements, unlockedCount, totalCount, checkAchievements, resetAchievements };
}

import { useState, useCallback, useRef } from 'react';
import type {
  Achievement,
  AchievementId,
  AchievementsData,
  StatsData,
} from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';
import { checkCondition } from '../utils/achievementUtils.js';

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

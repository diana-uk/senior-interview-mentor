import type { StatsData } from '../types';

/**
 * Updates streak fields based on today's date vs the last active date.
 * - Same day: no-op (returns same object)
 * - Active yesterday: increments currentStreak
 * - Gap or first time: resets currentStreak to 1
 * Also updates longestStreak and lastActiveDate.
 */
export function updateStreak(data: StatsData): StatsData {
  const t = new Date().toISOString().split('T')[0];
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

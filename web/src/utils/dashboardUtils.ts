import type { PatternStrength, SessionRecord } from '../types';

/**
 * Time-of-day greeting: "Good morning" / "Good afternoon" / "Good evening".
 */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Returns session counts for each of the last 7 days (oldest → newest).
 */
export function getWeeklyActivity(sessions: SessionRecord[]): { date: string; count: number }[] {
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split('T')[0];
    const count = sessions.filter((s) => s.date === date).length;
    days.push({ date, count });
  }
  return days;
}

/**
 * Returns the 3 weakest pattern areas (lowest solve ratio) from attempted patterns.
 */
export function getWeakAreas(strengths: PatternStrength[]): PatternStrength[] {
  return [...strengths]
    .filter((s) => s.attempted > 0)
    .sort((a, b) => (a.solved / a.attempted) - (b.solved / b.attempted))
    .slice(0, 3);
}

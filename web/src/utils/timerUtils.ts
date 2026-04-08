import type { Difficulty } from '../types';

/**
 * Format seconds to "MM:SS" string (zero-padded).
 * Examples: 0 → "00:00", 61 → "01:01", 3661 → "61:01"
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Return the CSS timer class based on remaining seconds and running state.
 * Returns "" when not running.
 */
export function getTimerClass(seconds: number, running: boolean): string {
  if (!running) return '';
  if (seconds > 600) return 'interview-timer-safe';
  if (seconds > 120) return 'interview-timer-warning';
  return 'interview-timer-danger';
}

/**
 * Return the CSS badge class for a difficulty level.
 * Example: "Hard" → "badge badge-hard"
 */
export function getDifficultyClass(d: Difficulty): string {
  return `badge badge-${d.toLowerCase()}`;
}

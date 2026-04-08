import type { User } from '@supabase/supabase-js';

/** Count words in a string; returns 0 for blank input. */
export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * CSS colour token for a word-count gauge.
 * - 0 words → muted
 * - below min → red (too short)
 * - above max → amber (too long)
 * - in range → lime (good)
 */
export function getWordCountColor(count: number, min: number, max: number): string {
  if (count === 0) return 'var(--text-muted)';
  if (count < min) return 'var(--neon-red)';
  if (count > max) return 'var(--neon-amber)';
  return 'var(--neon-lime)';
}

/** CSS colour token for a problem difficulty label. */
export function difficultyColor(difficulty: string): string {
  if (difficulty === 'Easy') return 'var(--neon-lime)';
  if (difficulty === 'Hard') return 'var(--neon-red)';
  return 'var(--neon-amber)';
}

/**
 * Format an ISO date string as a short human-readable label (e.g. "Jan 5").
 * Falls back to the raw string if parsing fails.
 */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * Derive 1-2 uppercase initials from a Supabase User's display name or email.
 * Falls back to '?' when no usable name is found.
 */
export function getInitials(user: User): string {
  const name = user.user_metadata?.full_name || user.email || '';
  if (name.includes('@')) return name[0]?.toUpperCase() || '?';
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

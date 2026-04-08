/**
 * Format a duration in seconds to a human-readable string.
 * Returns "—" for zero or negative values.
 * Examples: 45 → "45s", 90 → "1m 30s", 3600 → "60m 0s"
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Format an ISO date string to a short locale date like "Jan 15, 2026".
 * Falls back to the raw string if parsing fails.
 */
export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * Format a numeric score (0–4 range) to "X.X/4".
 * Returns "—" for null.
 */
export function formatScore(score: number | null): string {
  if (score === null) return '—';
  return `${score.toFixed(1)}/4`;
}

/**
 * Compact duration format used in the Dashboard: "45s", "2m", "1h 30m".
 * Returns "0s" for zero or negative values.
 */
export function formatDurationCompact(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

/**
 * Stats-panel duration format: hours and minutes only, no seconds.
 * Examples: 3600 → "1h 0m", 1800 → "30m", 90 → "1m"
 */
export function formatDurationStats(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

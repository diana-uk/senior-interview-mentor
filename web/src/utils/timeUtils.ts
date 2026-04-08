/**
 * Format a duration in seconds as M:SS (e.g. 0 → "0:00", 75 → "1:15").
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

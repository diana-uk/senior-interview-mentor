import type { MistakeEntryFull } from '../types';

/**
 * Converts mistake entries to Anki-compatible tab-separated CSV.
 * Format: Front\tBack  (one card per line)
 */
export function exportToAnkiCSV(mistakes: MistakeEntryFull[]): string {
  const rows = mistakes.map((m) => {
    const front = `${m.problemTitle} — What pattern does this use and why?`;
    const back = [
      `Pattern: ${m.pattern}`,
      `Approach: ${m.description}`,
    ].join('<br>');
    // Escape tabs/newlines inside fields so they don't break the format
    return `${escapeField(front)}\t${escapeField(back)}`;
  });
  return rows.join('\n');
}

function escapeField(value: string): string {
  // Replace actual newlines/tabs inside fields with HTML breaks (Anki supports HTML)
  return value.replace(/\t/g, ' ').replace(/\n/g, '<br>');
}

export function downloadAnkiCSV(mistakes: MistakeEntryFull[]): void {
  const csv = exportToAnkiCSV(mistakes);
  const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'senior-mentor-flashcards.csv';
  a.click();
  URL.revokeObjectURL(url);
}

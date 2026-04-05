import { describe, it, expect } from 'vitest';
import { exportToAnkiCSV } from '../ankiExport';
import type { MistakeEntryFull } from '../../types';

function makeMistake(overrides: Partial<MistakeEntryFull> = {}): MistakeEntryFull {
  return {
    id: 'test-id',
    pattern: 'HashMap',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    description: 'Forgot to use a hash map for O(n) lookup',
    createdAt: '2026-01-01',
    nextReview: '2026-01-02',
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    streak: 0,
    ...overrides,
  };
}

describe('exportToAnkiCSV', () => {
  it('returns empty string for empty array', () => {
    expect(exportToAnkiCSV([])).toBe('');
  });

  it('produces one row per mistake', () => {
    const mistakes = [makeMistake(), makeMistake({ id: 'id2', problemTitle: 'Best Time to Buy Stock' })];
    const rows = exportToAnkiCSV(mistakes).split('\n');
    expect(rows).toHaveLength(2);
  });

  it('each row is tab-separated into exactly two fields', () => {
    const row = exportToAnkiCSV([makeMistake()]);
    const parts = row.split('\t');
    expect(parts).toHaveLength(2);
  });

  it('front contains problem title and the standard question', () => {
    const row = exportToAnkiCSV([makeMistake()]);
    const front = row.split('\t')[0];
    expect(front).toContain('Two Sum');
    expect(front).toContain('What pattern does this use and why?');
  });

  it('back contains pattern name', () => {
    const row = exportToAnkiCSV([makeMistake()]);
    const back = row.split('\t')[1];
    expect(back).toContain('HashMap');
  });

  it('back contains approach/description', () => {
    const row = exportToAnkiCSV([makeMistake()]);
    const back = row.split('\t')[1];
    expect(back).toContain('Forgot to use a hash map for O(n) lookup');
  });

  it('uses HTML <br> instead of newlines in back field', () => {
    const row = exportToAnkiCSV([makeMistake()]);
    const back = row.split('\t')[1];
    expect(back).toContain('<br>');
    expect(back).not.toContain('\n');
  });

  it('escapes tabs within field values to spaces', () => {
    const m = makeMistake({ description: 'Line1\tLine2' });
    const row = exportToAnkiCSV([m]);
    const back = row.split('\t');
    // The row should have exactly 2 parts even though description had a tab
    expect(back).toHaveLength(2);
  });

  it('escapes newlines in description to <br>', () => {
    const m = makeMistake({ description: 'First\nSecond' });
    const row = exportToAnkiCSV([m]);
    expect(row).toContain('<br>');
    // Should not have literal newlines inside a field (only between rows)
    const rows = row.split('\n');
    expect(rows).toHaveLength(1);
  });

  it('handles problem title containing dashes without issue', () => {
    const m = makeMistake({ problemTitle: 'Best Time to Buy and Sell Stock II' });
    const front = exportToAnkiCSV([m]).split('\t')[0];
    expect(front).toContain('Best Time to Buy and Sell Stock II');
  });

  it('works with multiple different patterns', () => {
    const mistakes = [
      makeMistake({ pattern: 'Sliding Window', problemTitle: 'Longest Substring' }),
      makeMistake({ pattern: 'BFS/DFS', problemTitle: 'Number of Islands' }),
      makeMistake({ pattern: 'Dynamic Programming', problemTitle: 'Climbing Stairs' }),
    ];
    const csv = exportToAnkiCSV(mistakes);
    const rows = csv.split('\n');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toContain('Sliding Window');
    expect(rows[1]).toContain('BFS/DFS');
    expect(rows[2]).toContain('Dynamic Programming');
  });

  it('front format is: "<title> — What pattern does this use and why?"', () => {
    const m = makeMistake({ problemTitle: 'Two Sum' });
    const front = exportToAnkiCSV([m]).split('\t')[0];
    expect(front).toBe('Two Sum — What pattern does this use and why?');
  });

  it('back starts with "Pattern: <pattern>"', () => {
    const m = makeMistake({ pattern: 'Two Pointers' });
    const back = exportToAnkiCSV([m]).split('\t')[1];
    expect(back.startsWith('Pattern: Two Pointers')).toBe(true);
  });

  it('back includes "Approach: <description>"', () => {
    const m = makeMistake({ description: 'Use two pointers moving inward' });
    const back = exportToAnkiCSV([m]).split('\t')[1];
    expect(back).toContain('Approach: Use two pointers moving inward');
  });

  it('rows are joined by newline, not carriage return', () => {
    const mistakes = [makeMistake(), makeMistake({ id: 'id2' })];
    const csv = exportToAnkiCSV(mistakes);
    expect(csv).not.toContain('\r');
    expect(csv.split('\n')).toHaveLength(2);
  });
});

import { describe, it, expect } from 'vitest';
import { groupMistakesByPattern, computeWeakPatterns } from '../mistakeUtils';
import type { MistakeEntryFull } from '../../types';

function makeMistake(overrides: Partial<MistakeEntryFull> & { id: string; pattern: string }): MistakeEntryFull {
  return {
    problemId: null,
    problemTitle: 'Test Problem',
    description: 'Made a mistake',
    createdAt: '2026-01-10',
    nextReview: '2026-01-11',
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    streak: 0,
    ...overrides,
  } as MistakeEntryFull;
}

// ─── groupMistakesByPattern ───────────────────────────────────────────────────

describe('groupMistakesByPattern', () => {
  it('returns an empty object for an empty array', () => {
    expect(groupMistakesByPattern([])).toEqual({});
  });

  it('groups a single mistake under its pattern', () => {
    const m = makeMistake({ id: 'm1', pattern: 'HashMap' });
    const result = groupMistakesByPattern([m]);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result['HashMap']).toHaveLength(1);
    expect(result['HashMap'][0].id).toBe('m1');
  });

  it('groups multiple mistakes under the same pattern', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'BFS/DFS' });
    const m2 = makeMistake({ id: 'm2', pattern: 'BFS/DFS' });
    const result = groupMistakesByPattern([m1, m2]);
    expect(result['BFS/DFS']).toHaveLength(2);
  });

  it('groups mistakes across multiple patterns', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'HashMap' });
    const m2 = makeMistake({ id: 'm2', pattern: 'Heap' });
    const m3 = makeMistake({ id: 'm3', pattern: 'HashMap' });
    const result = groupMistakesByPattern([m1, m2, m3]);
    expect(result['HashMap']).toHaveLength(2);
    expect(result['Heap']).toHaveLength(1);
  });

  it('preserves mistake objects in the group', () => {
    const m = makeMistake({ id: 'm1', pattern: 'Greedy', description: 'Greedy mistake' });
    const result = groupMistakesByPattern([m]);
    expect(result['Greedy'][0].description).toBe('Greedy mistake');
  });
});

// ─── computeWeakPatterns ─────────────────────────────────────────────────────

describe('computeWeakPatterns', () => {
  it('returns an empty array for an empty object', () => {
    expect(computeWeakPatterns({})).toEqual([]);
  });

  it('returns one entry per pattern key', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'HashMap', streak: 2 });
    const grouped = groupMistakesByPattern([m1]);
    const result = computeWeakPatterns(grouped);
    expect(result).toHaveLength(1);
  });

  it('sets count equal to number of mistakes per pattern', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'DP', streak: 0 });
    const m2 = makeMistake({ id: 'm2', pattern: 'DP', streak: 2 });
    const result = computeWeakPatterns(groupMistakesByPattern([m1, m2]));
    expect(result[0].count).toBe(2);
  });

  it('computes avgStreak as the mean of streak values', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'Trees', streak: 1 });
    const m2 = makeMistake({ id: 'm2', pattern: 'Trees', streak: 3 });
    const result = computeWeakPatterns(groupMistakesByPattern([m1, m2]));
    expect(result[0].avgStreak).toBe(2);
  });

  it('sorts patterns weakest-first (lowest avgStreak first)', () => {
    const m1 = makeMistake({ id: 'm1', pattern: 'HashMap', streak: 5 });
    const m2 = makeMistake({ id: 'm2', pattern: 'BFS/DFS', streak: 1 });
    const result = computeWeakPatterns(groupMistakesByPattern([m1, m2]));
    expect(result[0].pattern).toBe('BFS/DFS');
    expect(result[1].pattern).toBe('HashMap');
  });

  it('avgStreak is 0 for a single mistake with streak 0', () => {
    const m = makeMistake({ id: 'm1', pattern: 'Heap', streak: 0 });
    const result = computeWeakPatterns(groupMistakesByPattern([m]));
    expect(result[0].avgStreak).toBe(0);
  });

  it('pattern field is typed as PatternName', () => {
    const m = makeMistake({ id: 'm1', pattern: 'Sliding Window', streak: 2 });
    const result = computeWeakPatterns(groupMistakesByPattern([m]));
    expect(result[0].pattern).toBe('Sliding Window');
  });
});

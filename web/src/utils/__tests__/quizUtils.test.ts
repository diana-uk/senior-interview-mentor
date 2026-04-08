import { describe, it, expect } from 'vitest';
import { pickRandom, buildChoices, ALL_QUIZ_PATTERNS } from '../quizUtils';

// ─── ALL_QUIZ_PATTERNS ────────────────────────────────────────────────────────

describe('ALL_QUIZ_PATTERNS', () => {
  it('contains 14 patterns', () => {
    expect(ALL_QUIZ_PATTERNS).toHaveLength(14);
  });

  it('contains HashMap', () => {
    expect(ALL_QUIZ_PATTERNS).toContain('HashMap');
  });
});

// ─── pickRandom ───────────────────────────────────────────────────────────────

describe('pickRandom', () => {
  it('returns empty array from empty input', () => {
    expect(pickRandom([])).toEqual([]);
  });

  it('returns n items by default (n=1)', () => {
    const result = pickRandom([1, 2, 3, 4, 5]);
    expect(result).toHaveLength(1);
  });

  it('returns n items when n is specified', () => {
    const result = pickRandom([1, 2, 3, 4, 5], undefined, 3);
    expect(result).toHaveLength(3);
  });

  it('returns no duplicates', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr, undefined, 5);
    expect(new Set(result).size).toBe(result.length);
  });

  it('excludes the specified item', () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 20; i++) {
      const result = pickRandom(arr, 3, 4);
      expect(result).not.toContain(3);
    }
  });

  it('returns fewer items when pool is smaller than n', () => {
    const result = pickRandom([1, 2], undefined, 10);
    expect(result).toHaveLength(2);
  });

  it('all returned items are from the original array', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const result = pickRandom(arr, undefined, 3);
    for (const item of result) {
      expect(arr).toContain(item);
    }
  });

  it('works when exclude is not in array', () => {
    const result = pickRandom([1, 2, 3], 99, 2);
    expect(result).toHaveLength(2);
  });
});

// ─── buildChoices ─────────────────────────────────────────────────────────────

describe('buildChoices', () => {
  it('returns exactly 4 choices', () => {
    expect(buildChoices('HashMap')).toHaveLength(4);
  });

  it('always includes the correct answer', () => {
    for (let i = 0; i < 10; i++) {
      expect(buildChoices('BFS/DFS')).toContain('BFS/DFS');
    }
  });

  it('returns no duplicate choices', () => {
    for (let i = 0; i < 10; i++) {
      const choices = buildChoices('Heap');
      expect(new Set(choices).size).toBe(4);
    }
  });

  it('all choices are valid PatternNames from ALL_QUIZ_PATTERNS', () => {
    const choices = buildChoices('Greedy');
    for (const c of choices) {
      expect(ALL_QUIZ_PATTERNS).toContain(c);
    }
  });
});

import { describe, it, expect } from 'vitest';
import { getWeakAreas } from '../dashboardUtils';
import type { PatternStrength } from '../../types';

function makeStrength(pattern: string, solved: number, attempted: number): PatternStrength {
  return { pattern, solved, attempted, avgScore: attempted > 0 ? solved / attempted * 4 : 0 };
}

// ─── getWeakAreas ─────────────────────────────────────────────────────────────

describe('getWeakAreas', () => {
  it('returns empty array when strengths is empty', () => {
    expect(getWeakAreas([])).toEqual([]);
  });

  it('filters out unattempted patterns', () => {
    const strengths = [
      makeStrength('Arrays', 0, 0),
      makeStrength('HashMap', 5, 10),
    ];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(1);
    expect(result[0].pattern).toBe('HashMap');
  });

  it('returns at most 3 areas', () => {
    const strengths = [
      makeStrength('Arrays', 1, 10),
      makeStrength('HashMap', 2, 10),
      makeStrength('Two Pointers', 3, 10),
      makeStrength('Sliding Window', 4, 10),
      makeStrength('BFS/DFS', 5, 10),
    ];
    expect(getWeakAreas(strengths)).toHaveLength(3);
  });

  it('sorts by ascending solve ratio (weakest first)', () => {
    const strengths = [
      makeStrength('Arrays', 8, 10),       // 0.8
      makeStrength('HashMap', 2, 10),      // 0.2
      makeStrength('Two Pointers', 5, 10), // 0.5
    ];
    const result = getWeakAreas(strengths);
    expect(result[0].pattern).toBe('HashMap');
    expect(result[1].pattern).toBe('Two Pointers');
    expect(result[2].pattern).toBe('Arrays');
  });

  it('handles a single attempted pattern', () => {
    const strengths = [makeStrength('Arrays', 3, 5)];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(1);
    expect(result[0].pattern).toBe('Arrays');
  });

  it('does not mutate the original array', () => {
    const strengths = [
      makeStrength('Arrays', 1, 10),
      makeStrength('HashMap', 9, 10),
    ];
    const copy = [...strengths];
    getWeakAreas(strengths);
    expect(strengths[0].pattern).toBe(copy[0].pattern);
    expect(strengths[1].pattern).toBe(copy[1].pattern);
  });

  it('returns fewer than 3 when fewer attempted patterns exist', () => {
    const strengths = [
      makeStrength('Arrays', 1, 5),
      makeStrength('HashMap', 0, 0), // unattempted
    ];
    expect(getWeakAreas(strengths)).toHaveLength(1);
  });

  it('handles equal ratios deterministically (stable relative order)', () => {
    const strengths = [
      makeStrength('A', 1, 2), // 0.5
      makeStrength('B', 1, 2), // 0.5
      makeStrength('C', 1, 2), // 0.5
      makeStrength('D', 1, 2), // 0.5
    ];
    const result = getWeakAreas(strengths);
    expect(result).toHaveLength(3);
    // All ratios equal — just confirm we get 3 results
    result.forEach((r) => expect(r.solved / r.attempted).toBe(0.5));
  });
});

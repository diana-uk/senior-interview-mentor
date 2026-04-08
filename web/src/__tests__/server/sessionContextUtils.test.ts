import { describe, it, expect } from 'vitest';
import { buildMemoryContext, HINT_STYLE_LABELS, DETAIL_LABELS } from '../../../server/utils/sessionContextUtils';
import type { Memory } from '../../../server/utils/sessionContextUtils';

function makeMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    hintStyle: 'direct',
    detailLevel: 'balanced',
    solvedProblems: [],
    weakPatterns: [],
    strongPatterns: [],
    recentMistakes: [],
    totalSolved: 0,
    currentStreak: 0,
    ...overrides,
  };
}

// ─── HINT_STYLE_LABELS / DETAIL_LABELS ───────────────────────────────────────

describe('HINT_STYLE_LABELS', () => {
  it('has a label for all 4 hint styles', () => {
    expect(Object.keys(HINT_STYLE_LABELS)).toHaveLength(4);
  });

  it('maps analogies correctly', () => {
    expect(HINT_STYLE_LABELS.analogies).toContain('analogies');
  });
});

describe('DETAIL_LABELS', () => {
  it('has a label for all 3 detail levels', () => {
    expect(Object.keys(DETAIL_LABELS)).toHaveLength(3);
  });
});

// ─── buildMemoryContext ───────────────────────────────────────────────────────

describe('buildMemoryContext', () => {
  it('starts with the memory heading', () => {
    expect(buildMemoryContext(makeMemory())).toContain('## User Memory & Personalization');
  });

  it('includes teaching style with the correct hint style label', () => {
    const result = buildMemoryContext(makeMemory({ hintStyle: 'pseudocode' }));
    expect(result).toContain('pseudocode outlines');
  });

  it('includes the correct detail level label', () => {
    const result = buildMemoryContext(makeMemory({ detailLevel: 'detailed' }));
    expect(result).toContain('detailed (thorough with deep dives)');
  });

  it('shows total problems solved in progress line', () => {
    const result = buildMemoryContext(makeMemory({ totalSolved: 42 }));
    expect(result).toContain('42 problems solved');
  });

  it('shows streak when currentStreak > 0', () => {
    const result = buildMemoryContext(makeMemory({ totalSolved: 10, currentStreak: 5 }));
    expect(result).toContain('5-day streak');
  });

  it('omits streak text when currentStreak is 0', () => {
    const result = buildMemoryContext(makeMemory({ currentStreak: 0 }));
    expect(result).not.toContain('streak');
  });

  it('includes recently solved problems when present', () => {
    const result = buildMemoryContext(makeMemory({
      solvedProblems: [{ title: 'Two Sum', pattern: 'HashMap', difficulty: 'Easy' }],
    }));
    expect(result).toContain('**Recently Solved:**');
    expect(result).toContain('Two Sum (HashMap, Easy)');
  });

  it('omits recently solved section when empty', () => {
    expect(buildMemoryContext(makeMemory({ solvedProblems: [] }))).not.toContain('Recently Solved');
  });

  it('includes strong patterns when present', () => {
    const result = buildMemoryContext(makeMemory({
      strongPatterns: [{ pattern: 'Binary Search', solveCount: 8, avgScore: 3.5 }],
    }));
    expect(result).toContain('**Strong Patterns:**');
    expect(result).toContain('Binary Search (avg 3.5/4, 8 solved)');
  });

  it('omits strong patterns section when empty', () => {
    expect(buildMemoryContext(makeMemory({ strongPatterns: [] }))).not.toContain('Strong Patterns');
  });

  it('includes weak patterns with mistake count when > 0', () => {
    const result = buildMemoryContext(makeMemory({
      weakPatterns: [{ pattern: 'Dynamic Programming', avgScore: 1.0, mistakeCount: 3 }],
    }));
    expect(result).toContain('**Weak Patterns (focus here):**');
    expect(result).toContain('Dynamic Programming (avg 1/4, 3 mistakes)');
  });

  it('omits mistake count in weak patterns when mistakeCount is 0', () => {
    const result = buildMemoryContext(makeMemory({
      weakPatterns: [{ pattern: 'Greedy', avgScore: 1.5, mistakeCount: 0 }],
    }));
    expect(result).toContain('Greedy (avg 1.5/4)');
    expect(result).not.toContain('mistakes');
  });

  it('includes recent mistakes when present', () => {
    const result = buildMemoryContext(makeMemory({
      recentMistakes: [{ description: 'forgot base case', problem: 'Fibonacci' }],
    }));
    expect(result).toContain('**Recent Mistakes:**');
    expect(result).toContain('forgot base case on Fibonacci');
  });

  it('omits recent mistakes section when empty', () => {
    expect(buildMemoryContext(makeMemory({ recentMistakes: [] }))).not.toContain('Recent Mistakes');
  });

  it('ends with the instructions block referencing the hint style', () => {
    const result = buildMemoryContext(makeMemory({ hintStyle: 'visual' }));
    expect(result).toContain('**Instructions:**');
    expect(result).toContain('diagrams and visual examples');
  });
});

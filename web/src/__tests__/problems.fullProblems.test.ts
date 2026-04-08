import { describe, it, expect } from 'vitest';
import { allFullProblems } from '../data/problems';
import type { PatternName } from '../types';

// ─── Valid PatternName set ─────────────────────────────────────────────────────

const VALID_PATTERNS: Set<PatternName> = new Set([
  'Sliding Window',
  'Two Pointers',
  'HashMap',
  'Prefix Sum',
  'Stack',
  'Linked List',
  'BFS/DFS',
  'Topological Sort',
  'Union-Find',
  'Binary Search',
  'Heap',
  'Intervals',
  'Greedy',
  'Dynamic Programming',
  'Backtracking',
  'Bit Manipulation',
  'Trees',
]);

// ─── allFullProblems count ─────────────────────────────────────────────────────

describe('allFullProblems count', () => {
  it('has exactly 150 entries', () => {
    expect(allFullProblems).toHaveLength(150);
  });
});

// ─── description ──────────────────────────────────────────────────────────────

describe('allFullProblems — description', () => {
  it('every problem has a non-empty description', () => {
    for (const p of allFullProblems) {
      expect(typeof p.description).toBe('string');
      expect(p.description.trim().length).toBeGreaterThan(0);
    }
  });
});

// ─── examples ─────────────────────────────────────────────────────────────────

describe('allFullProblems — examples', () => {
  it('every problem has at least one example', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.examples)).toBe(true);
      expect(p.examples.length).toBeGreaterThan(0);
    }
  });

  it('every example is a non-empty string', () => {
    for (const p of allFullProblems) {
      for (const ex of p.examples) {
        expect(typeof ex).toBe('string');
        expect(ex.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── constraints ──────────────────────────────────────────────────────────────

describe('allFullProblems — constraints', () => {
  it('every problem has at least one constraint', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.constraints)).toBe(true);
      expect(p.constraints.length).toBeGreaterThan(0);
    }
  });

  it('every constraint is a non-empty string', () => {
    for (const p of allFullProblems) {
      for (const c of p.constraints) {
        expect(typeof c).toBe('string');
        expect(c.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── testCases ────────────────────────────────────────────────────────────────

describe('allFullProblems — testCases', () => {
  it('every problem has at least one test case', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.testCases)).toBe(true);
      expect(p.testCases.length).toBeGreaterThan(0);
    }
  });

  it('every testCase has a non-empty input', () => {
    for (const p of allFullProblems) {
      for (const tc of p.testCases) {
        expect(typeof tc.input).toBe('string');
        expect(tc.input.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('every testCase has a non-empty expected value', () => {
    for (const p of allFullProblems) {
      for (const tc of p.testCases) {
        expect(typeof tc.expected).toBe('string');
        expect(tc.expected.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── starterCode ──────────────────────────────────────────────────────────────

describe('allFullProblems — starterCode', () => {
  it('every problem has a starterCode that is a string or object', () => {
    for (const p of allFullProblems) {
      const sc = p.starterCode;
      const isString = typeof sc === 'string';
      const isObject = typeof sc === 'object' && sc !== null;
      expect(isString || isObject).toBe(true);
    }
  });

  it('string starterCode is non-empty', () => {
    for (const p of allFullProblems) {
      if (typeof p.starterCode === 'string') {
        expect(p.starterCode.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('MultiLangCode starterCode has a non-empty typescript field', () => {
    for (const p of allFullProblems) {
      if (typeof p.starterCode === 'object' && p.starterCode !== null) {
        const sc = p.starterCode as { typescript: string; python?: string };
        expect(typeof sc.typescript).toBe('string');
        expect(sc.typescript.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('MultiLangCode starterCode has a non-empty python field', () => {
    for (const p of allFullProblems) {
      if (typeof p.starterCode === 'object' && p.starterCode !== null) {
        const sc = p.starterCode as { typescript: string; python?: string };
        expect(typeof sc.python).toBe('string');
        expect((sc.python ?? '').trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── pattern field ────────────────────────────────────────────────────────────

describe('allFullProblems — pattern', () => {
  it('every problem has a valid pattern name', () => {
    for (const p of allFullProblems) {
      expect(VALID_PATTERNS.has(p.pattern as PatternName)).toBe(true);
    }
  });
});

// ─── group field ─────────────────────────────────────────────────────────────

describe('allFullProblems — group', () => {
  it('every problem has a non-empty group', () => {
    for (const p of allFullProblems) {
      expect(typeof p.group).toBe('string');
      expect(p.group.trim().length).toBeGreaterThan(0);
    }
  });
});

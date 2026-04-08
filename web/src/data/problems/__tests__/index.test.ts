import { describe, it, expect } from 'vitest';
import {
  allProblemsList,
  allFullProblems,
  problemsByPattern,
  problemPatternMap,
  problemsById,
  totalProblemCount,
} from '../index';

const VALID_DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard']);
const EXPECTED_TOTAL = 150;

// ─── totalProblemCount ────────────────────────────────────────────────────────

describe('totalProblemCount', () => {
  it('equals 150', () => {
    expect(totalProblemCount).toBe(EXPECTED_TOTAL);
  });

  it('matches allProblemsList.length', () => {
    expect(totalProblemCount).toBe(allProblemsList.length);
  });

  it('matches allFullProblems.length', () => {
    expect(totalProblemCount).toBe(allFullProblems.length);
  });
});

// ─── allProblemsList ──────────────────────────────────────────────────────────

describe('allProblemsList', () => {
  it('contains 150 entries', () => {
    expect(allProblemsList).toHaveLength(EXPECTED_TOTAL);
  });

  it('has no duplicate IDs', () => {
    const ids = allProblemsList.map(p => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every entry has a non-empty id', () => {
    for (const p of allProblemsList) {
      expect(p.id).toBeTruthy();
      expect(typeof p.id).toBe('string');
    }
  });

  it('every entry has a non-empty title', () => {
    for (const p of allProblemsList) {
      expect(p.title).toBeTruthy();
      expect(typeof p.title).toBe('string');
    }
  });

  it('every entry has a valid difficulty', () => {
    for (const p of allProblemsList) {
      expect(VALID_DIFFICULTIES.has(p.difficulty)).toBe(true);
    }
  });

  it('has a reasonable distribution of Easy/Medium/Hard problems', () => {
    const easy = allProblemsList.filter(p => p.difficulty === 'Easy').length;
    const medium = allProblemsList.filter(p => p.difficulty === 'Medium').length;
    const hard = allProblemsList.filter(p => p.difficulty === 'Hard').length;
    expect(easy).toBeGreaterThan(0);
    expect(medium).toBeGreaterThan(0);
    expect(hard).toBeGreaterThan(0);
    expect(easy + medium + hard).toBe(EXPECTED_TOTAL);
  });
});

// ─── allFullProblems ──────────────────────────────────────────────────────────

describe('allFullProblems', () => {
  it('every entry has a group (pattern) set', () => {
    for (const p of allFullProblems) {
      expect(p.group).toBeTruthy();
      expect(typeof p.group).toBe('string');
    }
  });

  it('every entry has a non-empty description', () => {
    for (const p of allFullProblems) {
      expect(p.description).toBeTruthy();
    }
  });

  it('every entry has at least one example', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.examples)).toBe(true);
      expect(p.examples.length).toBeGreaterThan(0);
    }
  });

  it('every entry has at least one constraint', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.constraints)).toBe(true);
      expect(p.constraints.length).toBeGreaterThan(0);
    }
  });

  it('every entry has starterCode', () => {
    for (const p of allFullProblems) {
      expect(p.starterCode).toBeTruthy();
    }
  });

  it('every entry has at least one test case', () => {
    for (const p of allFullProblems) {
      expect(Array.isArray(p.testCases)).toBe(true);
      expect(p.testCases.length).toBeGreaterThan(0);
    }
  });

  it('MultiLangCode starterCode entries have a typescript field', () => {
    for (const p of allFullProblems) {
      if (typeof p.starterCode === 'object' && p.starterCode !== null) {
        expect((p.starterCode as { typescript?: string }).typescript).toBeTruthy();
      }
    }
  });
});

// ─── problemsByPattern ────────────────────────────────────────────────────────

describe('problemsByPattern', () => {
  it('contains at least 14 patterns', () => {
    expect(Object.keys(problemsByPattern).length).toBeGreaterThanOrEqual(14);
  });

  it('every pattern group has at least one problem', () => {
    for (const [pattern, problems] of Object.entries(problemsByPattern)) {
      expect(problems.length).toBeGreaterThan(0);
      void pattern;
    }
  });

  it('total problems across all groups equals 150', () => {
    const total = Object.values(problemsByPattern).reduce((sum, g) => sum + g.length, 0);
    expect(total).toBe(EXPECTED_TOTAL);
  });

  it('all entries within groups have valid fields', () => {
    for (const problems of Object.values(problemsByPattern)) {
      for (const p of problems) {
        expect(p.id).toBeTruthy();
        expect(p.title).toBeTruthy();
        expect(VALID_DIFFICULTIES.has(p.difficulty)).toBe(true);
      }
    }
  });
});

// ─── problemPatternMap ────────────────────────────────────────────────────────

describe('problemPatternMap', () => {
  it('covers every problem ID in allProblemsList', () => {
    for (const p of allProblemsList) {
      expect(problemPatternMap[p.id]).toBeTruthy();
    }
  });

  it('maps to pattern strings that exist in problemsByPattern', () => {
    const patternKeys = new Set(Object.keys(problemsByPattern));
    for (const pattern of Object.values(problemPatternMap)) {
      expect(patternKeys.has(pattern)).toBe(true);
    }
  });

  it('has exactly 150 entries', () => {
    expect(Object.keys(problemPatternMap).length).toBe(EXPECTED_TOTAL);
  });
});

// ─── problemsById ─────────────────────────────────────────────────────────────

describe('problemsById', () => {
  it('has exactly 150 entries', () => {
    expect(Object.keys(problemsById).length).toBe(EXPECTED_TOTAL);
  });

  it('every key matches the stored problem id', () => {
    for (const [key, problem] of Object.entries(problemsById)) {
      expect(problem.id).toBe(key);
    }
  });

  it('can look up a known problem by ID', () => {
    // two-sum is the canonical first problem in most lists
    const ids = Object.keys(problemsById);
    expect(ids.length).toBeGreaterThan(0);
    const first = ids[0];
    const p = problemsById[first];
    expect(p.id).toBe(first);
    expect(p.title).toBeTruthy();
  });
});

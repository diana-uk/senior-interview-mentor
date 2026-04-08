import { describe, it, expect } from 'vitest';
import {
  totalProblemCount,
  allProblemsList,
  problemsById,
  problemsByPattern,
  problemPatternMap,
  allFullProblems,
} from '../data/problems';

// ─── totalProblemCount ────────────────────────────────────────────────────────

describe('totalProblemCount', () => {
  it('is exactly 150', () => {
    expect(totalProblemCount).toBe(150);
  });
});

// ─── allProblemsList ──────────────────────────────────────────────────────────

describe('allProblemsList', () => {
  it('has 150 entries', () => {
    expect(allProblemsList).toHaveLength(150);
  });

  it('every entry has an id string', () => {
    for (const p of allProblemsList) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a title string', () => {
    for (const p of allProblemsList) {
      expect(typeof p.title).toBe('string');
      expect(p.title.length).toBeGreaterThan(0);
    }
  });

  it('every entry has a difficulty of Easy, Medium, or Hard', () => {
    const valid = new Set(['Easy', 'Medium', 'Hard']);
    for (const p of allProblemsList) {
      expect(valid.has(p.difficulty)).toBe(true);
    }
  });

  it('no duplicate IDs', () => {
    const ids = allProblemsList.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── problemsById ─────────────────────────────────────────────────────────────

describe('problemsById', () => {
  it('has 150 entries', () => {
    expect(Object.keys(problemsById)).toHaveLength(150);
  });

  it('contains hm-1 (first HashMap problem)', () => {
    expect(problemsById['hm-1']).toBeDefined();
  });

  it('contains dp-23 (last DP problem)', () => {
    expect(problemsById['dp-23']).toBeDefined();
  });

  it('contains mg-5 (last Math & Geometry problem)', () => {
    expect(problemsById['mg-5']).toBeDefined();
  });

  it('each entry has title, difficulty, pattern fields', () => {
    const problem = problemsById['hm-1'];
    expect(problem).toHaveProperty('title');
    expect(problem).toHaveProperty('difficulty');
    expect(problem).toHaveProperty('pattern');
  });
});

// ─── problemsByPattern ────────────────────────────────────────────────────────

describe('problemsByPattern', () => {
  it('has 20 pattern groups', () => {
    expect(Object.keys(problemsByPattern)).toHaveLength(20);
  });

  it('has a HashMap group with problems', () => {
    const hm = problemsByPattern['HashMap'];
    expect(hm).toBeDefined();
    expect(hm.length).toBeGreaterThan(0);
  });

  it('has a Dynamic Programming group', () => {
    expect(problemsByPattern['Dynamic Programming']).toBeDefined();
  });

  it('total problems across all groups is 150', () => {
    const total = Object.values(problemsByPattern).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(150);
  });
});

// ─── problemPatternMap ────────────────────────────────────────────────────────

describe('problemPatternMap', () => {
  it('has 150 entries', () => {
    expect(Object.keys(problemPatternMap)).toHaveLength(150);
  });

  it('maps hm-1 to HashMap', () => {
    expect(problemPatternMap['hm-1']).toBe('HashMap');
  });

  it('maps dp-1 to Dynamic Programming', () => {
    expect(problemPatternMap['dp-1']).toBe('Dynamic Programming');
  });
});

// ─── allFullProblems ──────────────────────────────────────────────────────────

describe('allFullProblems', () => {
  it('has 150 entries', () => {
    expect(allFullProblems).toHaveLength(150);
  });

  it('length matches totalProblemCount', () => {
    expect(allFullProblems.length).toBe(totalProblemCount);
  });

  it('each full problem has a group field', () => {
    for (const p of allFullProblems) {
      expect(typeof (p as { group: string }).group).toBe('string');
    }
  });
});

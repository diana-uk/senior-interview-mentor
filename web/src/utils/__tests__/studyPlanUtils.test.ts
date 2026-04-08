import { describe, it, expect } from 'vitest';
import { resolveProblemIds } from '../studyPlanUtils';
import { allFullProblems } from '../../data/problems/index';
import type { StudyPlanTemplate } from '../../data/studyPlans';

function makeTemplate(overrides: Partial<StudyPlanTemplate> = {}): StudyPlanTemplate {
  return {
    id: 'test',
    name: 'Test Plan',
    description: '',
    durationDays: 30,
    ...overrides,
  };
}

describe('resolveProblemIds', () => {
  it('returns the same count as allFullProblems when no patterns filter', () => {
    const ids = resolveProblemIds(makeTemplate());
    expect(ids).toHaveLength(allFullProblems.length);
  });

  it('returns only string IDs', () => {
    const ids = resolveProblemIds(makeTemplate());
    for (const id of ids) {
      expect(typeof id).toBe('string');
    }
  });

  it('returns filtered problems when patterns is set', () => {
    const template = makeTemplate({ patterns: ['HashMap'] });
    const ids = resolveProblemIds(template);
    const hashMapProblems = allFullProblems.filter((p) => p.group === 'HashMap');
    expect(ids).toHaveLength(hashMapProblems.length);
  });

  it('all returned IDs exist in allFullProblems', () => {
    const allIds = new Set(allFullProblems.map((p) => p.id));
    const ids = resolveProblemIds(makeTemplate({ patterns: ['BFS/DFS'] }));
    for (const id of ids) {
      expect(allIds.has(id)).toBe(true);
    }
  });

  it('sorts Easy before Medium before Hard', () => {
    const ids = resolveProblemIds(makeTemplate());
    const byId = new Map(allFullProblems.map((p) => [p.id, p]));
    const difficulties = ids.map((id) => byId.get(id)!.difficulty);
    const order = { Easy: 0, Medium: 1, Hard: 2 } as Record<string, number>;
    for (let i = 1; i < difficulties.length; i++) {
      expect(order[difficulties[i - 1]]).toBeLessThanOrEqual(order[difficulties[i]]);
    }
  });

  it('returns empty array for a pattern that matches nothing', () => {
    const ids = resolveProblemIds(makeTemplate({ patterns: ['__nonexistent__'] }));
    expect(ids).toEqual([]);
  });

  it('filters to the union of multiple patterns', () => {
    const patterns = ['Heap', 'Greedy'];
    const ids = resolveProblemIds(makeTemplate({ patterns }));
    const expected = allFullProblems.filter((p) => patterns.includes(p.group));
    expect(ids).toHaveLength(expected.length);
  });
});

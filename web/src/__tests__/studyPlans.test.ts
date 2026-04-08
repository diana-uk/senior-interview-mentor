import { describe, it, expect } from 'vitest';
import {
  PACE_CONFIG,
  STUDY_PLAN_TEMPLATES,
  type Pace,
  type StudyPlanTemplate,
} from '../data/studyPlans';

const ALL_PACES: Pace[] = ['relaxed', 'normal', 'intense'];

// ─── PACE_CONFIG ──────────────────────────────────────────────────────────────

describe('PACE_CONFIG', () => {
  it('has exactly 3 paces', () => {
    expect(Object.keys(PACE_CONFIG)).toHaveLength(3);
  });

  it('has all three pace keys', () => {
    for (const pace of ALL_PACES) {
      expect(PACE_CONFIG[pace]).toBeDefined();
    }
  });

  it('every pace has a non-empty label', () => {
    for (const pace of ALL_PACES) {
      expect(typeof PACE_CONFIG[pace].label).toBe('string');
      expect(PACE_CONFIG[pace].label.length).toBeGreaterThan(0);
    }
  });

  it('every pace has a positive problemsPerDay', () => {
    for (const pace of ALL_PACES) {
      expect(PACE_CONFIG[pace].problemsPerDay).toBeGreaterThan(0);
    }
  });

  it('every pace has a non-empty description', () => {
    for (const pace of ALL_PACES) {
      expect(typeof PACE_CONFIG[pace].description).toBe('string');
      expect(PACE_CONFIG[pace].description.length).toBeGreaterThan(0);
    }
  });

  it('relaxed pace is 1 problem per day', () => {
    expect(PACE_CONFIG.relaxed.problemsPerDay).toBe(1);
  });

  it('normal pace is 2 problems per day', () => {
    expect(PACE_CONFIG.normal.problemsPerDay).toBe(2);
  });

  it('intense pace is 5 problems per day', () => {
    expect(PACE_CONFIG.intense.problemsPerDay).toBe(5);
  });

  it('paces are ordered by increasing difficulty', () => {
    expect(PACE_CONFIG.relaxed.problemsPerDay).toBeLessThan(PACE_CONFIG.normal.problemsPerDay);
    expect(PACE_CONFIG.normal.problemsPerDay).toBeLessThan(PACE_CONFIG.intense.problemsPerDay);
  });
});

// ─── STUDY_PLAN_TEMPLATES ─────────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES', () => {
  it('has exactly 4 templates', () => {
    expect(STUDY_PLAN_TEMPLATES).toHaveLength(4);
  });

  it('every template has a non-empty id', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(typeof t.id).toBe('string');
      expect(t.id.length).toBeGreaterThan(0);
    }
  });

  it('no duplicate template IDs', () => {
    const ids = STUDY_PLAN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template has a non-empty name', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(typeof t.name).toBe('string');
      expect(t.name.length).toBeGreaterThan(0);
    }
  });

  it('every template has a non-empty description', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(typeof t.description).toBe('string');
      expect(t.description.length).toBeGreaterThan(0);
    }
  });

  it('every template has a positive durationDays', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(t.durationDays).toBeGreaterThan(0);
    }
  });
});

// ─── Blind 75 template ────────────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES — Blind 75', () => {
  let blind75: StudyPlanTemplate;

  beforeAll(() => {
    const found = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'blind75');
    expect(found).toBeDefined();
    blind75 = found!;
  });

  it('has durationDays of 30', () => {
    expect(blind75.durationDays).toBe(30);
  });

  it('has a patterns array', () => {
    expect(Array.isArray(blind75.patterns)).toBe(true);
  });

  it('patterns array is non-empty', () => {
    expect(blind75.patterns!.length).toBeGreaterThan(0);
  });

  it('patterns include HashMap', () => {
    expect(blind75.patterns).toContain('HashMap');
  });
});

// ─── NeetCode 150 template ────────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES — NeetCode 150', () => {
  it('has durationDays of 60', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'neetcode150')!;
    expect(t.durationDays).toBe(60);
  });

  it('has no patterns (uses all patterns)', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'neetcode150')!;
    expect(t.patterns).toBeUndefined();
  });
});

// ─── Arrays Sprint template ───────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES — Arrays Sprint', () => {
  it('has durationDays of 7', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'arrays-sprint')!;
    expect(t.durationDays).toBe(7);
  });

  it('patterns include Sliding Window, Two Pointers, HashMap', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'arrays-sprint')!;
    expect(t.patterns).toContain('Sliding Window');
    expect(t.patterns).toContain('Two Pointers');
    expect(t.patterns).toContain('HashMap');
  });
});

// ─── Graph Theory template ────────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES — Graph Theory', () => {
  it('has durationDays of 14', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'graph-theory')!;
    expect(t.durationDays).toBe(14);
  });

  it('patterns include BFS/DFS, Topological Sort, Union-Find', () => {
    const t = STUDY_PLAN_TEMPLATES.find((t) => t.id === 'graph-theory')!;
    expect(t.patterns).toContain('BFS/DFS');
    expect(t.patterns).toContain('Topological Sort');
    expect(t.patterns).toContain('Union-Find');
  });
});

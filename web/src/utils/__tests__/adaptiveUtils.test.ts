import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  daysSince,
  patternUrgency,
  DIFFICULTY_ORDER,
  pickProblemFromPattern,
  INTERVIEW_LEVEL_THRESHOLDS,
  calcReadinessScore,
  calcInterviewReadyScore,
} from '../adaptiveUtils';
import type { Difficulty, PatternStrength, ProblemStatus } from '../../types';

afterEach(() => {
  vi.useRealTimers();
});

function makeStrength(overrides: Partial<PatternStrength> = {}): PatternStrength {
  return {
    pattern: 'Arrays',
    solved: 5,
    attempted: 10,
    avgScore: 2.5,
    lastPracticed: null,
    ...overrides,
  };
}

// ─── daysSince ────────────────────────────────────────────────────────────────

describe('daysSince', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  it('returns Infinity for null', () => {
    expect(daysSince(null)).toBe(Infinity);
  });

  it('returns 0 for today', () => {
    expect(daysSince('2026-01-10')).toBe(0);
  });

  it('returns 1 for yesterday', () => {
    expect(daysSince('2026-01-09')).toBe(1);
  });

  it('returns 7 for one week ago', () => {
    expect(daysSince('2026-01-03')).toBe(7);
  });

  it('returns 30 for one month ago', () => {
    expect(daysSince('2025-12-11')).toBe(30);
  });

  it('returns whole days (floors partial day)', () => {
    // 12 hours ago — still 0 whole days
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
    expect(daysSince('2026-01-10')).toBe(0);
  });
});

// ─── patternUrgency ───────────────────────────────────────────────────────────

describe('patternUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
  });

  it('unattempted pattern gets base urgency of 50', () => {
    const ps = makeStrength({ attempted: 0, avgScore: 0, solved: 0 });
    // No recency bonus (lastPracticed null → Infinity → >14 → +30), no mistakes, no solveRate bonus
    const score = patternUrgency(ps, 0);
    expect(score).toBe(80); // 50 (unattempted) + 30 (no lastPracticed)
  });

  it('weak pattern (avgScore 1.0) gets higher urgency than strong (avgScore 4.0)', () => {
    const weak = makeStrength({ avgScore: 1.0, attempted: 5, solved: 2, lastPracticed: '2026-01-10' });
    const strong = makeStrength({ avgScore: 4.0, attempted: 5, solved: 5, lastPracticed: '2026-01-10' });
    expect(patternUrgency(weak, 0)).toBeGreaterThan(patternUrgency(strong, 0));
  });

  it('each mistake adds 15 to score', () => {
    const ps = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.5, attempted: 10, solved: 5 });
    const score0 = patternUrgency(ps, 0);
    const score3 = patternUrgency(ps, 3);
    expect(score3 - score0).toBe(45); // 3 * 15
  });

  it('not practiced in >14 days adds 30', () => {
    const old = makeStrength({ lastPracticed: '2025-12-01', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(old, 0) - patternUrgency(recent, 0)).toBe(30);
  });

  it('not practiced in 8–14 days adds 20', () => {
    const ps8 = makeStrength({ lastPracticed: '2026-01-02', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(ps8, 0) - patternUrgency(recent, 0)).toBe(20);
  });

  it('not practiced in 4–7 days adds 10', () => {
    const ps4 = makeStrength({ lastPracticed: '2026-01-06', avgScore: 2.0, attempted: 5, solved: 3 });
    const recent = makeStrength({ lastPracticed: '2026-01-10', avgScore: 2.0, attempted: 5, solved: 3 });
    expect(patternUrgency(ps4, 0) - patternUrgency(recent, 0)).toBe(10);
  });

  it('low solve rate (0%) adds 20 to urgency', () => {
    const zero = makeStrength({ avgScore: 2.0, attempted: 5, solved: 0, lastPracticed: '2026-01-10' });
    const full = makeStrength({ avgScore: 2.0, attempted: 5, solved: 5, lastPracticed: '2026-01-10' });
    expect(patternUrgency(zero, 0) - patternUrgency(full, 0)).toBeCloseTo(20);
  });
});

// ─── DIFFICULTY_ORDER ─────────────────────────────────────────────────────────

describe('DIFFICULTY_ORDER', () => {
  it('Easy < Medium < Hard', () => {
    expect(DIFFICULTY_ORDER.Easy).toBeLessThan(DIFFICULTY_ORDER.Medium);
    expect(DIFFICULTY_ORDER.Medium).toBeLessThan(DIFFICULTY_ORDER.Hard);
  });

  it('Easy = 0, Medium = 1, Hard = 2', () => {
    expect(DIFFICULTY_ORDER).toEqual({ Easy: 0, Medium: 1, Hard: 2 });
  });
});

// ─── pickProblemFromPattern ───────────────────────────────────────────────────

type MinProblem = { id: string; title: string; difficulty: Difficulty };

function makeProblems(specs: Array<[string, Difficulty]>): MinProblem[] {
  return specs.map(([id, difficulty]) => ({ id, title: id, difficulty }));
}

const allUnseen = (): ProblemStatus => 'unseen';
const allSolved = (): ProblemStatus => 'solved';

describe('pickProblemFromPattern', () => {
  it('returns null for an empty array', () => {
    expect(pickProblemFromPattern([], allUnseen, undefined)).toBeNull();
  });

  it('returns null when all problems are solved', () => {
    const problems = makeProblems([['p1', 'Easy'], ['p2', 'Medium']]);
    expect(pickProblemFromPattern(problems, allSolved, undefined)).toBeNull();
  });

  it('returns the unsolved problem', () => {
    const problems = makeProblems([['p1', 'Easy']]);
    const result = pickProblemFromPattern(problems, allUnseen, undefined);
    expect(result?.id).toBe('p1');
  });

  it('prefers unseen over attempted (non-solved)', () => {
    const problems = makeProblems([['p1', 'Easy'], ['p2', 'Easy']]);
    const status = (id: string): ProblemStatus => id === 'p1' ? 'attempted' : 'unseen';
    const result = pickProblemFromPattern(problems, status, undefined);
    expect(result?.id).toBe('p2');
  });

  it('defaults to Easy target when no strength', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['hard1', 'Hard']]);
    const result = pickProblemFromPattern(problems, allUnseen, undefined);
    expect(result?.difficulty).toBe('Easy');
  });

  it('defaults to Easy when strength.attempted === 0', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['hard1', 'Hard']]);
    const strength = makeStrength({ attempted: 0, avgScore: 0 });
    const result = pickProblemFromPattern(problems, allUnseen, strength);
    expect(result?.difficulty).toBe('Easy');
  });

  it('targets Medium when avgScore >= 2.0 and < 3.5', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['med1', 'Medium'], ['hard1', 'Hard']]);
    const strength = makeStrength({ attempted: 5, avgScore: 2.5 });
    const result = pickProblemFromPattern(problems, allUnseen, strength);
    expect(result?.difficulty).toBe('Medium');
  });

  it('targets Hard when avgScore >= 3.5', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['med1', 'Medium'], ['hard1', 'Hard']]);
    const strength = makeStrength({ attempted: 5, avgScore: 3.8 });
    const result = pickProblemFromPattern(problems, allUnseen, strength);
    expect(result?.difficulty).toBe('Hard');
  });

  it('targets Easy when avgScore < 2.0', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['med1', 'Medium']]);
    const strength = makeStrength({ attempted: 5, avgScore: 1.5 });
    const result = pickProblemFromPattern(problems, allUnseen, strength);
    expect(result?.difficulty).toBe('Easy');
  });

  it('respects preferDifficulty override regardless of strength', () => {
    const problems = makeProblems([['easy1', 'Easy'], ['hard1', 'Hard']]);
    const strength = makeStrength({ attempted: 5, avgScore: 1.0 }); // would target Easy
    const result = pickProblemFromPattern(problems, allUnseen, strength, 'Hard');
    expect(result?.difficulty).toBe('Hard');
  });
});

// ─── INTERVIEW_LEVEL_THRESHOLDS ───────────────────────────────────────────────

describe('INTERVIEW_LEVEL_THRESHOLDS', () => {
  it('has 4 levels', () => {
    expect(Object.keys(INTERVIEW_LEVEL_THRESHOLDS)).toHaveLength(4);
  });

  it('junior has minPatterns: 6', () => {
    expect(INTERVIEW_LEVEL_THRESHOLDS.junior.minPatterns).toBe(6);
  });

  it('senior has minPatterns: 13', () => {
    expect(INTERVIEW_LEVEL_THRESHOLDS.senior.minPatterns).toBe(13);
  });

  it('staff has highest minSolveRate', () => {
    const { junior, mid, senior, staff } = INTERVIEW_LEVEL_THRESHOLDS;
    expect(staff.minSolveRate).toBeGreaterThan(senior.minSolveRate);
    expect(senior.minSolveRate).toBeGreaterThan(mid.minSolveRate);
    expect(mid.minSolveRate).toBeGreaterThan(junior.minSolveRate);
  });
});

// ─── calcReadinessScore ───────────────────────────────────────────────────────

describe('calcReadinessScore', () => {
  it('returns 0 for an empty problem list', () => {
    expect(calcReadinessScore([], [], allUnseen)).toBe(0);
  });

  it('returns 0 when nothing is solved and no patterns attempted', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }];
    const strengths = [makeStrength({ attempted: 0 })];
    expect(calcReadinessScore(problems, strengths, allUnseen)).toBe(0);
  });

  it('returns 40 when all problems solved, no patterns attempted', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }];
    const strengths = [makeStrength({ attempted: 0 })];
    expect(calcReadinessScore(problems, strengths, allSolved)).toBe(40);
  });

  it('adds up to 100 when everything is perfect', () => {
    const problems = [{ id: 'p1' }];
    const strengths = [makeStrength({ attempted: 5, avgScore: 4.0 })];
    const score = calcReadinessScore(problems, strengths, allSolved);
    expect(score).toBe(100);
  });

  it('partial pattern coverage contributes to score', () => {
    const problems = [{ id: 'p1' }];
    // 1 of 2 patterns practiced
    const strengths = [
      makeStrength({ pattern: 'A', attempted: 5, avgScore: 4.0 }),
      makeStrength({ pattern: 'B', attempted: 0 }),
    ];
    const score = calcReadinessScore(problems, strengths, allSolved);
    // 40 (all solved) + 15 (1/2 patterns * 30) + 30 (avg 4.0/4 * 30) = 85
    expect(score).toBe(85);
  });

  it('returns a number between 0 and 100', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }];
    const strengths = [makeStrength({ attempted: 3, avgScore: 2.0 })];
    const status = (id: string): ProblemStatus => id === 'p1' ? 'solved' : 'unseen';
    const score = calcReadinessScore(problems, strengths, status);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── calcInterviewReadyScore ──────────────────────────────────────────────────

describe('calcInterviewReadyScore', () => {
  it('returns company string with capitalised level', () => {
    const result = calcInterviewReadyScore([], [], allUnseen, 'senior');
    expect(result.company).toBe('Senior Level');
  });

  it('defaults to senior level', () => {
    const result = calcInterviewReadyScore([], [], allUnseen);
    expect(result.company).toBe('Senior Level');
  });

  it('returns score 0 when nothing is practiced and no problems solved', () => {
    const strengths = [makeStrength({ attempted: 0 })];
    const result = calcInterviewReadyScore([{ id: 'p1' }], strengths, allUnseen, 'senior');
    expect(result.score).toBe(0);
  });

  it('categorises unattempted patterns as weak', () => {
    const strengths = [makeStrength({ pattern: 'DP', attempted: 0 })];
    const result = calcInterviewReadyScore([], strengths, allUnseen, 'junior');
    expect(result.weakPatterns).toContain('DP');
    expect(result.strongPatterns).not.toContain('DP');
  });

  it('categorises pattern meeting thresholds as strong (junior)', () => {
    // junior: minSolveRate=0.3, minAvgScore=2.0
    const strengths = [makeStrength({ pattern: 'HashMap', attempted: 10, solved: 5, avgScore: 2.5 })];
    const result = calcInterviewReadyScore([], strengths, allUnseen, 'junior');
    expect(result.strongPatterns).toContain('HashMap');
  });

  it('categorises pattern below threshold as weak', () => {
    // senior: minAvgScore=3.0, so 2.5 is below threshold
    const strengths = [makeStrength({ pattern: 'HashMap', attempted: 10, solved: 6, avgScore: 2.5 })];
    const result = calcInterviewReadyScore([], strengths, allUnseen, 'senior');
    expect(result.weakPatterns).toContain('HashMap');
  });

  it('returns score ≤ 100', () => {
    const strengths = Array.from({ length: 14 }, (_, i) =>
      makeStrength({ pattern: `P${i}`, attempted: 10, solved: 10, avgScore: 4.0 }),
    );
    const problems = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}` }));
    const result = calcInterviewReadyScore(problems, strengths, allSolved, 'staff');
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

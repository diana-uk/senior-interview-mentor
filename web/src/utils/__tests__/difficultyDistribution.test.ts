import { describe, it, expect, vi } from 'vitest';
import { computeDifficultyDistribution } from '../difficultyDistribution';
import { allProblemsList } from '../../data/problems';
import type { ProblemStatus, Difficulty } from '../../types';

describe('computeDifficultyDistribution', () => {
  // ── Shape / structure ──

  it('returns exactly 3 buckets (Easy, Medium, Hard)', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    expect(result).toHaveLength(3);
    expect(result.map(b => b.difficulty)).toEqual(['Easy', 'Medium', 'Hard']);
  });

  it('each bucket has total, solved, attempted, color', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      expect(bucket).toHaveProperty('total');
      expect(bucket).toHaveProperty('solved');
      expect(bucket).toHaveProperty('attempted');
      expect(bucket).toHaveProperty('color');
      expect(typeof bucket.total).toBe('number');
      expect(typeof bucket.solved).toBe('number');
      expect(typeof bucket.attempted).toBe('number');
      expect(typeof bucket.color).toBe('string');
    }
  });

  it('totals sum to allProblemsList.length', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    const totalSum = result.reduce((s, b) => s + b.total, 0);
    expect(totalSum).toBe(allProblemsList.length);
  });

  // ── Colors ──

  it('Easy bucket uses neon-lime color', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    expect(result.find(b => b.difficulty === 'Easy')!.color).toBe('var(--neon-lime)');
  });

  it('Medium bucket uses neon-amber color', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    expect(result.find(b => b.difficulty === 'Medium')!.color).toBe('var(--neon-amber)');
  });

  it('Hard bucket uses neon-red color', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    expect(result.find(b => b.difficulty === 'Hard')!.color).toBe('var(--neon-red)');
  });

  // ── All unseen ──

  it('all unseen: solved and attempted are 0 for every bucket', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      expect(bucket.solved).toBe(0);
      expect(bucket.attempted).toBe(0);
    }
  });

  // ── All solved ──

  it('all solved: solved equals total for every bucket', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('solved');
    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      expect(bucket.solved).toBe(bucket.total);
      expect(bucket.attempted).toBe(0);
    }
  });

  // ── All attempted ──

  it('all attempted: attempted equals total for every bucket', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('attempted');
    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      expect(bucket.attempted).toBe(bucket.total);
      expect(bucket.solved).toBe(0);
    }
  });

  // ── Mixed statuses ──

  it('counts solved and attempted separately', () => {
    const easyProblems = allProblemsList.filter(p => p.difficulty === 'Easy');
    const solvedId = easyProblems[0]?.id;
    const attemptedId = easyProblems[1]?.id;

    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockImplementation((id: string) => {
      if (id === solvedId) return 'solved';
      if (id === attemptedId) return 'attempted';
      return 'unseen';
    });

    const result = computeDifficultyDistribution(getProblemStatus);
    const easy = result.find(b => b.difficulty === 'Easy')!;
    expect(easy.solved).toBe(1);
    expect(easy.attempted).toBe(1);
  });

  it('solved + attempted + unseen = total for each bucket', () => {
    // Mark first 5 problems of each difficulty as solved, next 3 as attempted
    const byDifficulty: Record<string, string[]> = { Easy: [], Medium: [], Hard: [] };
    for (const p of allProblemsList) {
      byDifficulty[p.difficulty].push(p.id);
    }

    const solvedIds = new Set<string>();
    const attemptedIds = new Set<string>();
    for (const diff of ['Easy', 'Medium', 'Hard']) {
      for (let i = 0; i < Math.min(5, byDifficulty[diff].length); i++) {
        solvedIds.add(byDifficulty[diff][i]);
      }
      for (let i = 5; i < Math.min(8, byDifficulty[diff].length); i++) {
        attemptedIds.add(byDifficulty[diff][i]);
      }
    }

    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockImplementation((id: string) => {
      if (solvedIds.has(id)) return 'solved';
      if (attemptedIds.has(id)) return 'attempted';
      return 'unseen';
    });

    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      const unseen = bucket.total - bucket.solved - bucket.attempted;
      expect(unseen).toBeGreaterThanOrEqual(0);
      expect(bucket.solved + bucket.attempted + unseen).toBe(bucket.total);
    }
  });

  // ── Calls getProblemStatus for every problem ──

  it('calls getProblemStatus for every problem in allProblemsList', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    computeDifficultyDistribution(getProblemStatus);
    expect(getProblemStatus).toHaveBeenCalledTimes(allProblemsList.length);
  });

  // ── Order is always Easy, Medium, Hard ──

  it('order is always Easy, Medium, Hard regardless of status distribution', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('solved');
    const result = computeDifficultyDistribution(getProblemStatus);
    expect(result[0].difficulty).toBe('Easy');
    expect(result[1].difficulty).toBe('Medium');
    expect(result[2].difficulty).toBe('Hard');
  });

  // ── Each difficulty has at least 1 problem ──

  it('each difficulty bucket has total > 0 (problem data has all difficulties)', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const result = computeDifficultyDistribution(getProblemStatus);
    for (const bucket of result) {
      expect(bucket.total).toBeGreaterThan(0);
    }
  });
});

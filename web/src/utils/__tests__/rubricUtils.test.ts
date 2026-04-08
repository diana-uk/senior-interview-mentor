import { describe, it, expect } from 'vitest';
import { generateImprovementPlan } from '../rubricUtils';
import type { RubricDimension } from '../../types/index';

// ─── helpers ──────────────────────────────────────────────────────────────────

function dim(id: RubricDimension['id'], score: number): RubricDimension {
  return { id, label: id, description: '', score, maxScore: 4 };
}

// ─── generateImprovementPlan ──────────────────────────────────────────────────

describe('generateImprovementPlan', () => {
  it('returns the fallback message when all dimensions score > 2', () => {
    const dims = [
      dim('correctness', 3),
      dim('time-complexity', 4),
      dim('space-complexity', 3),
    ];
    expect(generateImprovementPlan(dims)).toEqual([
      'Great work! Focus on speed and consistency to maintain this level.',
    ]);
  });

  it('returns the fallback when the array is empty', () => {
    expect(generateImprovementPlan([])).toEqual([
      'Great work! Focus on speed and consistency to maintain this level.',
    ]);
  });

  it('returns the correctness tip for score 0', () => {
    const result = generateImprovementPlan([dim('correctness', 0)]);
    expect(result).toContain(
      'Practice writing test cases before coding to catch logic errors early.',
    );
  });

  it('returns the time-complexity tip for score 1', () => {
    const result = generateImprovementPlan([dim('time-complexity', 1)]);
    expect(result).toContain(
      'Study pattern-to-complexity mappings. Practice identifying the optimal approach before coding.',
    );
  });

  it('returns the space-complexity tip for score 2', () => {
    const result = generateImprovementPlan([dim('space-complexity', 2)]);
    expect(result).toContain(
      'Consider in-place algorithms and whether auxiliary data structures are necessary.',
    );
  });

  it('returns the code-quality tip', () => {
    const result = generateImprovementPlan([dim('code-quality', 1)]);
    expect(result).toContain(
      'Use descriptive variable names and extract helper functions for repeated logic.',
    );
  });

  it('returns the edge-cases tip', () => {
    const result = generateImprovementPlan([dim('edge-cases', 0)]);
    expect(result).toContain(
      'Build a checklist: empty input, single element, duplicates, negative numbers, overflow.',
    );
  });

  it('returns the communication tip', () => {
    const result = generateImprovementPlan([dim('communication', 2)]);
    expect(result).toContain(
      'Practice thinking aloud: state your approach, trade-offs, and complexity before coding.',
    );
  });

  it('returns the edge-case-handling tip', () => {
    const result = generateImprovementPlan([dim('edge-case-handling', 1)]);
    expect(result).toContain(
      'List edge cases before coding: empty input, single element, large input, negative/zero values.',
    );
  });

  it('returns the time-management tip', () => {
    const result = generateImprovementPlan([dim('time-management', 0)]);
    expect(result).toContain(
      'Practice with a timer. Aim to have a working solution within 30 minutes.',
    );
  });

  it('returns one tip per weak dimension', () => {
    const dims = [dim('correctness', 1), dim('time-complexity', 2), dim('code-quality', 0)];
    expect(generateImprovementPlan(dims)).toHaveLength(3);
  });

  it('sorts weakest dimensions first (score 0 before score 2)', () => {
    const dims = [dim('time-complexity', 2), dim('correctness', 0)];
    const result = generateImprovementPlan(dims);
    // correctness (score=0) tip should come before time-complexity (score=2)
    const correctnessIdx = result.findIndex((s) => s.includes('test cases'));
    const timeIdx = result.findIndex((s) => s.includes('pattern-to-complexity'));
    expect(correctnessIdx).toBeLessThan(timeIdx);
  });

  it('does not include strong dimensions (score 3) in the plan', () => {
    const result = generateImprovementPlan([dim('correctness', 3)]);
    expect(result).toEqual([
      'Great work! Focus on speed and consistency to maintain this level.',
    ]);
  });

  it('score === 2 is considered weak and included', () => {
    const result = generateImprovementPlan([dim('correctness', 2)]);
    expect(result).toContain(
      'Practice writing test cases before coding to catch logic errors early.',
    );
  });
});

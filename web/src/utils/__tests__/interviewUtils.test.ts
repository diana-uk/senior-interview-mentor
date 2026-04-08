import { describe, it, expect } from 'vitest';
import { getEstimatedDuration, getOverallGrade } from '../interviewUtils';
import type { ComparisonResult } from '../../components/SolutionComparison';

// ─── getEstimatedDuration ─────────────────────────────────────────────────────

describe('getEstimatedDuration', () => {
  it('returns ~45 Minutes when stage is null', () => {
    expect(getEstimatedDuration(null, null)).toBe('~45 Minutes');
  });

  it('returns ~45 Minutes for technical leetcode format', () => {
    expect(getEstimatedDuration('technical', 'leetcode')).toBe('~45 Minutes');
  });

  it('returns ~60 Minutes for technical project format', () => {
    expect(getEstimatedDuration('technical', 'project')).toBe('~60 Minutes');
  });

  it('returns ~45 Minutes for technical stage with null format', () => {
    expect(getEstimatedDuration('technical', null)).toBe('~45 Minutes');
  });

  it('returns ~45 Minutes for system-design stage', () => {
    expect(getEstimatedDuration('system-design', null)).toBe('~45 Minutes');
  });

  it('returns ~30 Minutes for phone stage', () => {
    expect(getEstimatedDuration('phone', null)).toBe('~30 Minutes');
  });

  it('returns ~30 Minutes for behavioral stage', () => {
    expect(getEstimatedDuration('behavioral', null)).toBe('~30 Minutes');
  });
});

// ─── getOverallGrade ──────────────────────────────────────────────────────────

function makeApproach() {
  return {
    name: 'Brute Force',
    pattern: 'Nested Loops',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: '',
    pros: [],
    cons: [],
  };
}

function makeComparison(overrides: Partial<ComparisonResult> = {}): ComparisonResult {
  return {
    problemTitle: 'Test',
    userApproach: makeApproach(),
    optimalApproach: makeApproach(),
    isOptimal: false,
    missedOptimizations: [],
    missedEdgeCases: [],
    patternInsight: '',
    improvementTips: [],
    ...overrides,
  };
}

describe('getOverallGrade', () => {
  it('returns Optimal (lime) when isOptimal and no misses', () => {
    const result = getOverallGrade(makeComparison({ isOptimal: true }));
    expect(result.label).toBe('Optimal');
    expect(result.color).toBe('var(--neon-lime)');
  });

  it('returns Good (cyan) when isOptimal but has missed items', () => {
    const result = getOverallGrade(
      makeComparison({ isOptimal: true, missedEdgeCases: ['null input'] }),
    );
    expect(result.label).toBe('Good');
    expect(result.color).toBe('var(--neon-cyan)');
  });

  it('returns Good (amber) when not optimal but ≤1 miss each', () => {
    const result = getOverallGrade(
      makeComparison({ isOptimal: false, missedOptimizations: ['use HashMap'], missedEdgeCases: [] }),
    );
    expect(result.label).toBe('Good');
    expect(result.color).toBe('var(--neon-amber)');
  });

  it('returns Needs Improvement when not optimal and >1 misses', () => {
    const result = getOverallGrade(
      makeComparison({
        isOptimal: false,
        missedOptimizations: ['opt1', 'opt2'],
        missedEdgeCases: ['edge1', 'edge2'],
      }),
    );
    expect(result.label).toBe('Needs Improvement');
    expect(result.color).toBe('var(--neon-red)');
  });

  it('returns Needs Improvement when missedOptimizations > 1 even with 0 edge cases', () => {
    const result = getOverallGrade(
      makeComparison({ isOptimal: false, missedOptimizations: ['a', 'b'] }),
    );
    expect(result.label).toBe('Needs Improvement');
  });
});

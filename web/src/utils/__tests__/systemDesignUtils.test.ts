import { describe, it, expect } from 'vitest';
import { generateSDImprovementPlan, createEmptyApproach } from '../systemDesignUtils';
import type { SDRubricDimension } from '../../components/systemdesign/SystemDesignRubric';

function makeDim(id: SDRubricDimension['id'], score: number): SDRubricDimension {
  return { id, label: id, description: '', score, maxScore: 4 };
}

describe('generateSDImprovementPlan', () => {
  it('returns encouragement when all dimensions score > 2', () => {
    const dims = [
      makeDim('scalability', 3),
      makeDim('reliability', 4),
      makeDim('data-model', 3),
    ];
    const result = generateSDImprovementPlan(dims);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Excellent design');
  });

  it('returns empty-plan encouragement when dims array is empty', () => {
    const result = generateSDImprovementPlan([]);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Excellent design');
  });

  it('generates a plan for scalability when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('scalability', 1)]);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('sharding');
  });

  it('generates a plan for reliability when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('reliability', 0)]);
    expect(result[0]).toContain('circuit breakers');
  });

  it('generates a plan for data-model when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('data-model', 2)]);
    expect(result[0]).toContain('SQL vs NoSQL');
  });

  it('generates a plan for api-design when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('api-design', 1)]);
    expect(result[0]).toContain('REST best practices');
  });

  it('generates a plan for trade-offs when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('trade-offs', 0)]);
    expect(result[0]).toContain('CAP theorem');
  });

  it('generates a plan for communication when score ≤ 2', () => {
    const result = generateSDImprovementPlan([makeDim('communication', 2)]);
    expect(result[0]).toContain('Narrate as you draw');
  });

  it('returns one plan per weak dimension', () => {
    const dims = [
      makeDim('scalability', 1),
      makeDim('reliability', 2),
      makeDim('api-design', 0),
    ];
    expect(generateSDImprovementPlan(dims)).toHaveLength(3);
  });

  it('sorts weakest (lowest score) first', () => {
    const dims = [
      makeDim('scalability', 2),  // score=2, appears after score=0
      makeDim('reliability', 0),  // score=0, appears first
    ];
    const result = generateSDImprovementPlan(dims);
    expect(result[0]).toContain('circuit breakers'); // reliability (score=0)
    expect(result[1]).toContain('sharding');          // scalability (score=2)
  });

  it('ignores dimensions with score > 2', () => {
    const dims = [
      makeDim('scalability', 3),
      makeDim('reliability', 1),
    ];
    const result = generateSDImprovementPlan(dims);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('circuit breakers');
  });
});

// ─── createEmptyApproach ──────────────────────────────────────────────────────

describe('createEmptyApproach', () => {
  it('returns an object with name, pros, and cons', () => {
    const a = createEmptyApproach();
    expect(a).toHaveProperty('name');
    expect(a).toHaveProperty('pros');
    expect(a).toHaveProperty('cons');
  });

  it('sets name to empty string', () => {
    expect(createEmptyApproach().name).toBe('');
  });

  it('sets pros to empty string', () => {
    expect(createEmptyApproach().pros).toBe('');
  });

  it('sets cons to empty string', () => {
    expect(createEmptyApproach().cons).toBe('');
  });

  it('returns a new object on each call', () => {
    const a = createEmptyApproach();
    const b = createEmptyApproach();
    expect(a).not.toBe(b);
  });
});

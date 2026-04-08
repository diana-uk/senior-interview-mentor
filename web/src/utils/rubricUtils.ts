import type { RubricDimension } from '../types/index.js';

/**
 * Build a list of actionable improvement suggestions based on rubric dimensions
 * scored 2 or below (weakest first). Returns a motivational fallback when all
 * dimensions are strong.
 */
export function generateImprovementPlan(dims: RubricDimension[]): string[] {
  const weak = dims.filter((d) => d.score <= 2).sort((a, b) => a.score - b.score);
  const plans: string[] = [];
  for (const d of weak) {
    switch (d.id) {
      case 'correctness':
        plans.push('Practice writing test cases before coding to catch logic errors early.');
        break;
      case 'time-complexity':
        plans.push('Study pattern-to-complexity mappings. Practice identifying the optimal approach before coding.');
        break;
      case 'space-complexity':
        plans.push('Consider in-place algorithms and whether auxiliary data structures are necessary.');
        break;
      case 'code-quality':
        plans.push('Use descriptive variable names and extract helper functions for repeated logic.');
        break;
      case 'edge-cases':
        plans.push('Build a checklist: empty input, single element, duplicates, negative numbers, overflow.');
        break;
      case 'communication':
        plans.push('Practice thinking aloud: state your approach, trade-offs, and complexity before coding.');
        break;
      case 'edge-case-handling':
        plans.push('List edge cases before coding: empty input, single element, large input, negative/zero values.');
        break;
      case 'time-management':
        plans.push('Practice with a timer. Aim to have a working solution within 30 minutes.');
        break;
    }
  }
  if (plans.length === 0) {
    plans.push('Great work! Focus on speed and consistency to maintain this level.');
  }
  return plans;
}

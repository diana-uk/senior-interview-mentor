import type { InterviewStage, TechnicalFormat } from '../types';
import type { ComparisonResult } from '../components/SolutionComparison';

export function getEstimatedDuration(
  stage: InterviewStage | null,
  format: TechnicalFormat | null,
): string {
  if (!stage) return '~45 Minutes';
  if (stage === 'technical') {
    if (format === 'project') return '~60 Minutes';
    return '~45 Minutes';
  }
  if (stage === 'system-design') return '~45 Minutes';
  return '~30 Minutes';
}

export function getOverallGrade(comparison: ComparisonResult): { label: string; color: string } {
  if (
    comparison.isOptimal &&
    comparison.missedEdgeCases.length === 0 &&
    comparison.missedOptimizations.length === 0
  ) {
    return { label: 'Optimal', color: 'var(--neon-lime)' };
  }
  if (comparison.isOptimal) {
    return { label: 'Good', color: 'var(--neon-cyan)' };
  }
  if (comparison.missedOptimizations.length <= 1 && comparison.missedEdgeCases.length <= 1) {
    return { label: 'Good', color: 'var(--neon-amber)' };
  }
  return { label: 'Needs Improvement', color: 'var(--neon-red)' };
}

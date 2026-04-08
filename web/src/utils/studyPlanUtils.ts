import type { StudyPlanTemplate } from '../data/studyPlans';
import { allFullProblems } from '../data/problems/index';

/**
 * Pick and sort problem IDs for a study plan template.
 * Filters by template.patterns (if set), then sorts Easy → Medium → Hard.
 */
export function resolveProblemIds(template: StudyPlanTemplate): string[] {
  const filtered = template.patterns
    ? allFullProblems.filter((p) => template.patterns!.includes(p.group))
    : allFullProblems;
  const order = { Easy: 0, Medium: 1, Hard: 2 } as Record<string, number>;
  return [...filtered]
    .sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1))
    .map((p) => p.id);
}

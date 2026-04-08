import { behavioralQuestions } from '../data/behavioral';
import type { BehavioralCategory } from '../data/behavioral';

/**
 * Count the number of behavioral questions that match any of the given category tags.
 * Returns 0 when `tags` is empty.
 */
export function getAnswersCount(tags: BehavioralCategory[]): number {
  if (tags.length === 0) return 0;
  return behavioralQuestions.filter((q) => tags.includes(q.category)).length;
}

/**
 * Detect common red flags in a STAR story answer.
 * Returns an array of human-readable warning strings (empty = no issues).
 */
export function detectRedFlags(
  situation: string,
  task: string,
  action: string,
  result: string,
): string[] {
  const all = `${situation} ${task} ${action} ${result}`.toLowerCase();
  const flags: string[] = [];

  if (/\b(they|team|we)\b/.test(action) && !/\b(i|my)\b/.test(action)) {
    flags.push('Action section uses "they/we" without "I" — focus on YOUR specific contributions');
  }
  if (result.length < 20 && result.length > 0) {
    flags.push('Result is too brief — add specific metrics or measurable outcomes');
  }
  if (!/\d/.test(result) && result.length > 0) {
    flags.push('No numbers in Result — quantify impact (%, time saved, users affected)');
  }
  if (situation.length === 0 || task.length === 0 || action.length === 0 || result.length === 0) {
    flags.push('One or more STAR sections are empty — complete all four for a strong answer');
  }
  if (/\b(blame|fault|their mistake)\b/.test(all)) {
    flags.push('Avoid blaming others — focus on what you did to resolve the situation');
  }
  if (/\b(basically|just|kind of|sort of|like)\b/.test(all)) {
    flags.push('Filler words detected ("basically", "just", "kind of") — be more precise');
  }
  return flags;
}

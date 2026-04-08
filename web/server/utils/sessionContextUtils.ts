import type { ChatRequest } from '../types.js';

export type Memory = NonNullable<NonNullable<ChatRequest['context']>['memory']>;

export const HINT_STYLE_LABELS: Record<Memory['hintStyle'], string> = {
  analogies: 'real-world analogies',
  pseudocode: 'pseudocode outlines',
  visual: 'diagrams and visual examples',
  direct: 'concise, direct explanations',
};

export const DETAIL_LABELS: Record<Memory['detailLevel'], string> = {
  brief: 'brief (concise, essentials only)',
  balanced: 'balanced (standard depth with examples)',
  detailed: 'detailed (thorough with deep dives)',
};

/**
 * Build the memory/personalization section of the AI prompt context.
 * Returns a markdown string summarising the user's learning profile.
 */
export function buildMemoryContext(memory: Memory): string {
  const parts: string[] = ['## User Memory & Personalization'];

  parts.push(
    `**Teaching Style:** Use ${HINT_STYLE_LABELS[memory.hintStyle]} for hints. Keep explanations ${DETAIL_LABELS[memory.detailLevel]}.`,
  );

  const streakStr = memory.currentStreak > 0
    ? `, ${memory.currentStreak}-day streak`
    : '';
  parts.push(`**Progress:** ${memory.totalSolved} problems solved${streakStr}.`);

  if (memory.solvedProblems.length > 0) {
    const list = memory.solvedProblems
      .map((p) => `${p.title} (${p.pattern}, ${p.difficulty})`)
      .join(', ');
    parts.push(`**Recently Solved:** ${list}`);
  }

  if (memory.strongPatterns.length > 0) {
    const list = memory.strongPatterns
      .map((p) => `${p.pattern} (avg ${p.avgScore}/4, ${p.solveCount} solved)`)
      .join(', ');
    parts.push(`**Strong Patterns:** ${list}`);
  }

  if (memory.weakPatterns.length > 0) {
    const list = memory.weakPatterns
      .map((p) => {
        const mistakes = p.mistakeCount > 0 ? `, ${p.mistakeCount} mistakes` : '';
        return `${p.pattern} (avg ${p.avgScore}/4${mistakes})`;
      })
      .join(', ');
    parts.push(`**Weak Patterns (focus here):** ${list}`);
  }

  if (memory.recentMistakes.length > 0) {
    const list = memory.recentMistakes
      .map((m) => `${m.description} on ${m.problem}`)
      .join('; ');
    parts.push(`**Recent Mistakes:** ${list}`);
  }

  parts.push(
    `**Instructions:** When this user encounters a pattern they've solved before, reference their prior solution. Proactively address weak patterns. Adapt hint style to use ${HINT_STYLE_LABELS[memory.hintStyle]}.`,
  );

  return parts.join('\n');
}

import type { ChatRequest } from '../types.js';

type Memory = NonNullable<NonNullable<ChatRequest['context']>['memory']>;

const HINT_STYLE_LABELS: Record<Memory['hintStyle'], string> = {
  analogies: 'real-world analogies',
  pseudocode: 'pseudocode outlines',
  visual: 'diagrams and visual examples',
  direct: 'concise, direct explanations',
};

const DETAIL_LABELS: Record<Memory['detailLevel'], string> = {
  brief: 'brief (concise, essentials only)',
  balanced: 'balanced (standard depth with examples)',
  detailed: 'detailed (thorough with deep dives)',
};

function buildMemoryContext(memory: Memory): string {
  const parts: string[] = ['## User Memory & Personalization'];

  // Teaching style
  parts.push(
    `**Teaching Style:** Use ${HINT_STYLE_LABELS[memory.hintStyle]} for hints. Keep explanations ${DETAIL_LABELS[memory.detailLevel]}.`,
  );

  // Progress summary
  const streakStr = memory.currentStreak > 0
    ? `, ${memory.currentStreak}-day streak`
    : '';
  parts.push(`**Progress:** ${memory.totalSolved} problems solved${streakStr}.`);

  // Recently solved
  if (memory.solvedProblems.length > 0) {
    const list = memory.solvedProblems
      .map((p) => `${p.title} (${p.pattern}, ${p.difficulty})`)
      .join(', ');
    parts.push(`**Recently Solved:** ${list}`);
  }

  // Strong patterns
  if (memory.strongPatterns.length > 0) {
    const list = memory.strongPatterns
      .map((p) => `${p.pattern} (avg ${p.avgScore}/4, ${p.solveCount} solved)`)
      .join(', ');
    parts.push(`**Strong Patterns:** ${list}`);
  }

  // Weak patterns
  if (memory.weakPatterns.length > 0) {
    const list = memory.weakPatterns
      .map((p) => {
        const mistakes = p.mistakeCount > 0 ? `, ${p.mistakeCount} mistakes` : '';
        return `${p.pattern} (avg ${p.avgScore}/4${mistakes})`;
      })
      .join(', ');
    parts.push(`**Weak Patterns (focus here):** ${list}`);
  }

  // Recent mistakes
  if (memory.recentMistakes.length > 0) {
    const list = memory.recentMistakes
      .map((m) => `${m.description} on ${m.problem}`)
      .join('; ');
    parts.push(`**Recent Mistakes:** ${list}`);
  }

  // Instructions for the AI
  parts.push(
    `**Instructions:** When this user encounters a pattern they've solved before, reference their prior solution. Proactively address weak patterns. Adapt hint style to use ${HINT_STYLE_LABELS[memory.hintStyle]}.`,
  );

  return parts.join('\n');
}

/**
 * Build session context to prepend to the conversation prompt.
 * CLAUDE.md is automatically loaded by the `claude` CLI when cwd = project root.
 */
export function buildSessionContext(context?: ChatRequest['context']): string {
  if (!context) return '';

  const sections: string[] = [];

  // Memory context first (if available)
  if (context.memory) {
    sections.push(buildMemoryContext(context.memory));
  }

  const parts: string[] = ['## Current Session Context'];
  parts.push(`- **Mode:** ${context.mode}`);
  parts.push(`- **Hints Used:** ${context.hintsUsed}/3`);
  parts.push(
    `- **Commitment Gate:** ${context.commitmentGateCompleted}/5 items completed`,
  );

  if (context.language) {
    parts.push(`- **Language:** ${context.language}`);
    if (context.language === 'python') {
      parts.push(
        '  - Respond with Python code examples. Use Python idioms: list comprehensions, snake_case naming, type hints, f-strings. Use `def` instead of `function`.',
      );
    }
  }

  if (context.currentProblem) {
    const p = context.currentProblem;
    parts.push(`\n### Current Problem: ${p.title}`);
    parts.push(`- Difficulty: ${p.difficulty}`);
    parts.push(`- Pattern: ${p.pattern}`);
    parts.push(`- Description: ${p.description}`);
    if (p.constraints.length > 0) {
      parts.push(`- Constraints: ${p.constraints.join('; ')}`);
    }
  }

  if (context.interviewStage) {
    parts.push(`\n### Interview Stage: ${context.interviewStage}`);
    if (context.interviewStage === 'technical-questions') {
      parts.push(
        'The user is in a technical questions interview (knowledge-based Q&A, no coding). Behave as a senior engineering manager. Ask conceptual questions, probe for depth and tradeoffs, and evaluate their understanding.',
      );
      if (context.technicalQuestionCategory) {
        parts.push(`- **Question Category:** ${context.technicalQuestionCategory}`);
      }
    } else {
      parts.push(
        'The user is in a mock interview. Behave as a professional interviewer. Give minimal hints. Evaluate their communication, problem-solving, and code quality.',
      );
    }
  }

  sections.push(parts.join('\n'));

  return sections.join('\n\n');
}

import type { ChatRequest } from '../types.js';
import { buildMemoryContext } from '../utils/sessionContextUtils.js';

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

  // Mode-specific behavioral instructions
  if (context.mode === 'TEACHER') {
    parts.push(
      '  **TEACHER MODE ACTIVE:** Use Socratic guidance — ask questions rather than giving answers. Use the hint ladder (nudge → structure → pseudocode). Focus on pattern recognition and building understanding. Enforce the commitment gate before providing solutions.',
    );
  } else if (context.mode === 'INTERVIEWER') {
    parts.push(
      '  **INTERVIEWER MODE ACTIVE:** You are a professional interviewer conducting a real interview simulation. Apply time pressure. Give minimal hints — only clarifying questions the candidate asks. Evaluate communication, problem-solving process, and code quality. Do NOT teach or guide. Respond like a real interviewer would: brief, neutral, probing.',
    );
  } else if (context.mode === 'REVIEWER') {
    parts.push(
      '  **REVIEWER MODE ACTIVE:** You are a code reviewer. Score the user\'s code on a 0-4 rubric across 6 dimensions (correctness, efficiency, code quality, edge cases, communication, testing). Provide specific improvement suggestions. Do NOT teach or give hints — analyze and score what was submitted.',
    );
  }

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

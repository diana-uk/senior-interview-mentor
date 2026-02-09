import type { ChatRequest } from '../types.js';

/**
 * Build session context to prepend to the conversation prompt.
 * CLAUDE.md is automatically loaded by the `claude` CLI when cwd = project root.
 */
export function buildSessionContext(context?: ChatRequest['context']): string {
  if (!context) return '';

  const parts: string[] = ['## Current Session Context'];
  parts.push(`- **Mode:** ${context.mode}`);
  parts.push(`- **Hints Used:** ${context.hintsUsed}/3`);
  parts.push(
    `- **Commitment Gate:** ${context.commitmentGateCompleted}/5 items completed`,
  );

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

  return parts.join('\n');
}

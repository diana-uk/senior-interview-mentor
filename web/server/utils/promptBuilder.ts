import { buildSessionContext } from '../services/systemPrompt.js';
import type { ChatRequest, ChatMessagePayload } from '../types.js';

const MAX_MESSAGES = 40;

/**
 * Build the full prompt string sent to the AI backend (CLI or SDK).
 * Shared between claude.ts and claudeSdk.ts.
 */
export function buildChatPrompt(
  messages: ChatMessagePayload[],
  context?: ChatRequest['context'],
): string {
  const trimmed = messages.slice(-MAX_MESSAGES);
  const parts: string[] = [];

  // Core identity — prevent tool use and file reading
  parts.push(
    'You are Senior Mentor, an AI coding interview coach. ' +
    'Respond ONLY with text. You have NO tools available — do NOT output <tool_call>, ' +
    'do NOT attempt to read files, and do NOT reference tool names like Read, Grep, or Bash. ' +
    'Answer directly based on what the user provides.',
  );
  parts.push('---');

  // Session context
  const sessionContext = buildSessionContext(context);
  if (sessionContext) {
    parts.push(sessionContext);
    parts.push('---');
  }

  // Format conversation history — all messages except the last one
  if (trimmed.length > 1) {
    parts.push('Conversation so far:');
    const history = trimmed.slice(0, -1);
    for (const m of history) {
      const role = m.role === 'user' ? 'User' : 'Mentor';
      parts.push(`${role}: ${m.content}`);
    }
    parts.push('---');
  }

  // Latest user message
  const last = trimmed[trimmed.length - 1];
  if (last) {
    parts.push(last.content);
  }

  return parts.join('\n\n');
}

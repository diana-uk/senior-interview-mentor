import type { ChatMessage } from '../types';

/** Messages stored with timestamp as ISO string for JSON safety */
export interface PersistedMessage {
  id: string;
  role: 'mentor' | 'user';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export function serializeMessages(messages: ChatMessage[]): PersistedMessage[] {
  return messages
    .filter((m) => !m.isStreaming)
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      ...(m.isError ? { isError: true } : {}),
    }));
}

export function deserializeMessages(persisted: PersistedMessage[]): ChatMessage[] {
  return persisted.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
    ...(m.isError ? { isError: true } : {}),
  }));
}

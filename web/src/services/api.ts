import type { ChatContext } from '../types/index.js';

interface ChatPayload {
  messages: { role: 'mentor' | 'user'; content: string }[];
  context?: ChatContext;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export async function streamChat(
  payload: ChatPayload,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err: unknown) {
    if (signal?.aborted) return;
    callbacks.onError(
      err instanceof Error ? err.message : 'Failed to connect to server.',
    );
    return;
  }

  if (!response.ok) {
    let message = 'Server error. Please try again.';
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // use default message
    }
    callbacks.onError(message);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('Streaming not supported in this browser.');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        const json = trimmed.slice(6);
        try {
          const event = JSON.parse(json);
          if (event.type === 'delta') {
            callbacks.onDelta(event.text);
          } else if (event.type === 'done') {
            callbacks.onDone();
            return;
          } else if (event.type === 'error') {
            callbacks.onError(event.message);
            return;
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
    // Stream ended without explicit done event
    callbacks.onDone();
  } catch (err: unknown) {
    if (signal?.aborted) return;
    callbacks.onError(
      err instanceof Error ? err.message : 'Stream interrupted.',
    );
  } finally {
    reader.releaseLock();
  }
}

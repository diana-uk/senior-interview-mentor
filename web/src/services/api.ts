import type { ChatContext } from '../types/index.js';

interface ChatPayload {
  messages: { role: 'mentor' | 'user'; content: string }[];
  context?: ChatContext;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  onEditorUpdate?: (starterCode: string, testCode: string) => void;
}

const RESPONSE_TIMEOUT_MS = 90_000;

export async function streamChat(
  payload: ChatPayload,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  console.log('[API] Sending chat payload:', JSON.stringify(payload, null, 2));

  // Combine user abort signal with a 90s timeout so the UI never hangs forever
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), RESPONSE_TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: combinedSignal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (signal?.aborted) return;
    if (timeoutController.signal.aborted) {
      callbacks.onError('Response timed out. Claude CLI may be slow or unresponsive — try again.');
      return;
    }
    callbacks.onError(
      err instanceof Error ? err.message : 'Failed to connect to server.',
    );
    return;
  }

  if (!response.ok) {
    let message = 'Server error. Please try again.';
    try {
      const body = await response.json();
      console.error('[API] Error response:', response.status, body);
      if (body.error) message = body.error;
      if (body.details) message += ': ' + JSON.stringify(body.details);
    } catch {
      console.error('[API] Error status:', response.status, response.statusText);
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
          } else if (event.type === 'editor-update') {
            callbacks.onEditorUpdate?.(event.starterCode, event.testCode);
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
    if (timeoutController.signal.aborted) {
      callbacks.onError('Response timed out. Claude CLI may be slow or unresponsive — try again.');
      return;
    }
    callbacks.onError(
      err instanceof Error ? err.message : 'Stream interrupted.',
    );
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}

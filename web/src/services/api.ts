import type { ChatContext } from '../types/index.js';
import { logger } from '../utils/logger.js';

interface ChatPayload {
  messages: { role: 'mentor' | 'user'; content: string }[];
  context?: ChatContext;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  onEditorUpdate?: (starterCode: string, testCode: string) => void;
  onRateLimit?: (remaining: number, limit: number, plan: string) => void;
}

interface StreamOptions {
  accessToken?: string;
}

const IDLE_TIMEOUT_MS = 120_000; // abort if no data received for 120s

export async function streamChat(
  payload: ChatPayload,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
  options?: StreamOptions,
): Promise<void> {
  logger.log('[API] Sending chat payload:', JSON.stringify(payload, null, 2));

  // Activity-based timeout: resets every time we receive data from the server.
  // The server sends keepalive pings every 15s while the CLI is working,
  // so this only fires if the connection is truly dead.
  const timeoutController = new AbortController();
  let timeout = setTimeout(() => timeoutController.abort(), IDLE_TIMEOUT_MS);
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => timeoutController.abort(), IDLE_TIMEOUT_MS);
  };
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }
  const bypassToken = import.meta.env.VITE_TIER_BYPASS_TOKEN;
  if (bypassToken) {
    headers['X-Bypass-Token'] = bypassToken;
  }

  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers,
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
      logger.error('[API] Error response:', response.status, body);
      if (body.error) message = body.error;
      if (body.details) message += ': ' + JSON.stringify(body.details);
    } catch {
      logger.error('[API] Error status:', response.status, response.statusText);
    }
    callbacks.onError(message);
    return;
  }

  // Parse rate limit headers and notify frontend
  const rlRemaining = response.headers.get('X-RateLimit-Remaining');
  const rlLimit = response.headers.get('X-RateLimit-Limit');
  const rlPlan = response.headers.get('X-RateLimit-Plan');
  if (rlRemaining && rlLimit && rlPlan && callbacks.onRateLimit) {
    const remaining = rlRemaining === 'unlimited' ? -1 : parseInt(rlRemaining, 10);
    const limit = rlLimit === 'unlimited' ? -1 : parseInt(rlLimit, 10);
    callbacks.onRateLimit(remaining, limit, rlPlan);
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

      resetTimeout();
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

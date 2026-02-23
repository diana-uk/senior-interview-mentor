import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock logger to suppress output
vi.mock('../../utils/logger.js', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { streamChat } from '../api';

// ── Helpers ──

/** Encode a string to Uint8Array (simulating what fetch body stream returns) */
function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Build a mock Response whose body is a ReadableStream.
 * Feed SSE-formatted chunks via the returned `push` and `close` functions.
 */
function createMockSSEResponse(
  status = 200,
  headerOverrides: Record<string, string> = {},
) {
  const chunks: Uint8Array[] = [];
  let resolveWaiting: ((val: { done: boolean; value?: Uint8Array }) => void) | null = null;
  let closed = false;

  const push = (text: string) => {
    const encoded = encode(text);
    if (resolveWaiting) {
      const res = resolveWaiting;
      resolveWaiting = null;
      res({ done: false, value: encoded });
    } else {
      chunks.push(encoded);
    }
  };

  const close = () => {
    closed = true;
    if (resolveWaiting) {
      const res = resolveWaiting;
      resolveWaiting = null;
      res({ done: true });
    }
  };

  const reader = {
    read: vi.fn(() => {
      if (chunks.length > 0) {
        return Promise.resolve({ done: false, value: chunks.shift()! });
      }
      if (closed) {
        return Promise.resolve({ done: true, value: undefined });
      }
      return new Promise<{ done: boolean; value?: Uint8Array }>((resolve) => {
        resolveWaiting = resolve;
      });
    }),
    releaseLock: vi.fn(),
  };

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    ...headerOverrides,
  });

  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers,
    body: { getReader: () => reader },
    json: vi.fn(),
  } as unknown as Response;

  return { response, push, close, reader };
}

function makeCallbacks() {
  return {
    onDelta: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    onEditorUpdate: vi.fn(),
    onRateLimit: vi.fn(),
  };
}

function defaultPayload() {
  return {
    messages: [{ role: 'user' as const, content: 'hello' }],
  };
}

// ── Tests ──

describe('streamChat', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;
    // Clear the bypass token env var by default
    vi.stubEnv('VITE_TIER_BYPASS_TOKEN', '');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  // ── 1. Basic SSE delta parsing ──

  it('parses delta events and invokes onDelta', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    // Push delta events
    push('data: {"type":"delta","text":"Hello"}\n');
    push('data: {"type":"delta","text":" World"}\n');
    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledTimes(2);
    expect(cb.onDelta).toHaveBeenCalledWith('Hello');
    expect(cb.onDelta).toHaveBeenCalledWith(' World');
  });

  // ── 2. Done event ──

  it('invokes onDone when done event is received', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 3. Error event from SSE stream ──

  it('invokes onError when error event is received in stream', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"error","message":"Something went wrong"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Something went wrong');
    // onDone should NOT be called when error event terminates the stream
    expect(cb.onDone).not.toHaveBeenCalled();
  });

  // ── 4. Editor-update event ──

  it('invokes onEditorUpdate with starterCode and testCode', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"editor-update","starterCode":"function f() {}","testCode":"console.log(f())"}\n');
    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onEditorUpdate).toHaveBeenCalledWith('function f() {}', 'console.log(f())');
  });

  // ── 5. Rate limit headers: numeric values ──

  it('extracts numeric rate limit headers and invokes onRateLimit', async () => {
    const { response, push, close } = createMockSSEResponse(200, {
      'X-RateLimit-Remaining': '7',
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Plan': 'free',
    });
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onRateLimit).toHaveBeenCalledWith(7, 10, 'free');
  });

  // ── 6. Rate limit headers: unlimited ──

  it('maps "unlimited" rate limit headers to -1', async () => {
    const { response, push, close } = createMockSSEResponse(200, {
      'X-RateLimit-Remaining': 'unlimited',
      'X-RateLimit-Limit': 'unlimited',
      'X-RateLimit-Plan': 'premium',
    });
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onRateLimit).toHaveBeenCalledWith(-1, -1, 'premium');
  });

  // ── 7. Rate limit headers missing → onRateLimit not called ──

  it('does not call onRateLimit when headers are missing', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onRateLimit).not.toHaveBeenCalled();
  });

  // ── 8. Authorization header with accessToken ──

  it('includes Authorization header when accessToken is provided', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb, undefined, {
      accessToken: 'my-jwt-token',
    });

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall[1].headers['Authorization']).toBe('Bearer my-jwt-token');
  });

  // ── 9. Bypass token header ──

  it('includes X-Bypass-Token header when env var is set', async () => {
    vi.stubEnv('VITE_TIER_BYPASS_TOKEN', 'secret-bypass');

    // Re-import to pick up the env var at call time
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall[1].headers['X-Bypass-Token']).toBe('secret-bypass');
  });

  // ── 10. Non-OK response with JSON error body ──

  it('calls onError with error message from JSON response body', async () => {
    const { response } = createMockSSEResponse(429);
    (response as any).json = vi.fn().mockResolvedValue({
      error: 'Rate limited',
      details: { retryAfter: 60 },
    });
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Rate limited: {"retryAfter":60}');
  });

  // ── 11. Non-OK response without details ──

  it('calls onError with just the error field when no details', async () => {
    const { response } = createMockSSEResponse(500);
    (response as any).json = vi.fn().mockResolvedValue({
      error: 'Internal server error',
    });
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Internal server error');
  });

  // ── 12. Non-OK response with unparseable body ──

  it('calls onError with default message when response body is not valid JSON', async () => {
    const { response } = createMockSSEResponse(502);
    (response as any).json = vi.fn().mockRejectedValue(new Error('not json'));
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Server error. Please try again.');
  });

  // ── 13. Malformed JSON lines are skipped ──

  it('skips malformed JSON lines and continues processing', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {not valid json}\n');
    push('data: {"type":"delta","text":"OK"}\n');
    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledWith('OK');
    expect(cb.onDone).toHaveBeenCalledTimes(1);
    expect(cb.onError).not.toHaveBeenCalled();
  });

  // ── 14. AbortSignal handling (user abort) ──

  it('returns silently when user AbortSignal is triggered', async () => {
    const controller = new AbortController();
    fetchSpy.mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'));
    // Manually set aborted
    controller.abort();

    const cb = makeCallbacks();
    const promise = streamChat(defaultPayload(), cb, controller.signal);

    await vi.runAllTimersAsync();
    await promise;

    // Should not invoke onError when user aborts
    expect(cb.onError).not.toHaveBeenCalled();
    expect(cb.onDone).not.toHaveBeenCalled();
  });

  // ── 15. Multiple SSE lines in a single chunk ──

  it('handles multiple SSE lines in a single chunk', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    // Send multiple events in one chunk
    push(
      'data: {"type":"delta","text":"A"}\ndata: {"type":"delta","text":"B"}\ndata: {"type":"delta","text":"C"}\ndata: {"type":"done"}\n',
    );
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledTimes(3);
    expect(cb.onDelta).toHaveBeenNthCalledWith(1, 'A');
    expect(cb.onDelta).toHaveBeenNthCalledWith(2, 'B');
    expect(cb.onDelta).toHaveBeenNthCalledWith(3, 'C');
    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 16. Empty lines between events are ignored ──

  it('ignores empty lines between SSE events', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('\n\ndata: {"type":"delta","text":"hi"}\n\n\ndata: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledWith('hi');
    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 17. Stream ends without done event → onDone still called ──

  it('calls onDone when stream ends without explicit done event', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"delta","text":"partial"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledWith('partial');
    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 18. No body on response → error ──

  it('calls onError when response has no body (streaming not supported)', async () => {
    const response = {
      ok: true,
      status: 200,
      headers: new Headers(),
      body: null,
    } as unknown as Response;
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Streaming not supported in this browser.');
  });

  // ── 19. Fetch network error (not abort) ──

  it('calls onError with error message on network failure', async () => {
    fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Failed to fetch');
  });

  // ── 20. Fetch non-Error rejection ──

  it('calls onError with default message when fetch rejects with non-Error', async () => {
    fetchSpy.mockRejectedValue('some string error');
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);
    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onError).toHaveBeenCalledWith('Failed to connect to server.');
  });

  // ── 21. Lines not starting with "data: " are skipped ──

  it('skips lines that do not start with "data: "', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('event: message\n');
    push('id: 123\n');
    push('retry: 5000\n');
    push('data: {"type":"delta","text":"valid"}\n');
    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledTimes(1);
    expect(cb.onDelta).toHaveBeenCalledWith('valid');
  });

  // ── 22. Partial chunk buffering across reads ──

  it('handles partial SSE lines split across chunks', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    // First chunk ends mid-line
    push('data: {"type":"del');
    // Second chunk completes the line
    push('ta","text":"split"}\ndata: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(cb.onDelta).toHaveBeenCalledWith('split');
    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 23. No accessToken → no Authorization header ──

  it('does not include Authorization header when no accessToken', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall[1].headers['Authorization']).toBeUndefined();
  });

  // ── 24. onEditorUpdate is optional ──

  it('does not throw when onEditorUpdate is not provided', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
      // onEditorUpdate intentionally omitted
    };

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"editor-update","starterCode":"a","testCode":"b"}\n');
    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    // Should complete without throwing
    expect(cb.onDone).toHaveBeenCalledTimes(1);
  });

  // ── 25. Idle timeout fires when no data received ──

  it('calls onError with timeout message when idle timeout fires', async () => {
    // Fetch never resolves - the idle timeout should abort
    fetchSpy.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted', 'AbortError'));
        });
      });
    });

    const cb = makeCallbacks();
    const promise = streamChat(defaultPayload(), cb);

    // Advance past the 120s idle timeout
    await vi.advanceTimersByTimeAsync(120_000);
    await promise;

    expect(cb.onError).toHaveBeenCalledWith(
      'Response timed out. Claude CLI may be slow or unresponsive — try again.',
    );
  });

  // ── 26. Payload is sent as JSON body ──

  it('sends the payload as JSON body to /api/chat', async () => {
    const { response, push, close } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();
    const payload = {
      messages: [{ role: 'user' as const, content: 'test message' }],
    };

    const promise = streamChat(payload, cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/chat');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual(payload);
  });

  // ── 27. Reader releaseLock is always called ──

  it('releases the reader lock on successful completion', async () => {
    const { response, push, close, reader } = createMockSSEResponse();
    fetchSpy.mockResolvedValue(response);
    const cb = makeCallbacks();

    const promise = streamChat(defaultPayload(), cb);

    push('data: {"type":"done"}\n');
    close();

    await vi.runAllTimersAsync();
    await promise;

    expect(reader.releaseLock).toHaveBeenCalled();
  });
});

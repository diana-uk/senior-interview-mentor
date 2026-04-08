import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../server/middleware/rateLimiter.js', () => ({
  chatLimiter: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock('../../../server/middleware/auth.js', () => ({
  optionalAuth: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock('../../../server/middleware/tierLimits.js', () => ({
  tierLimits: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

vi.mock('../../../server/middleware/validate.js', () => ({
  validate: () => (_req: Request, _res: Response, next: NextFunction) => next(),
}));

let mockStream: {
  onText: (cb: (text: string) => void) => void;
  onDone: (cb: () => void) => void;
  onError: (cb: (msg: string) => void) => void;
};
let onTextCb: ((text: string) => void) | null = null;
let onDoneCb: (() => void) | null = null;
let onErrorCb: ((msg: string) => void) | null = null;
let mockStreamChat = vi.fn();

vi.mock('../../../server/services/ai.js', () => ({
  streamChat: (...args: unknown[]) => {
    mockStreamChat(...args);
    return mockStream;
  },
}));

import chatRouter from '../../../server/routes/chat';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(): Partial<Request> {
  return {
    method: 'POST',
    url: '/chat',
    path: '/chat',
    baseUrl: '',
    originalUrl: '/chat',
    headers: {},
    body: { message: 'hello', mode: 'TEACHER' },
    query: {},
    params: {},
    on: vi.fn(),
  };
}

function makeRes() {
  return {
    writeHead: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
}

function callRouter(req = makeReq(), res = makeRes()) {
  (chatRouter as unknown as Function)(req as Request, res as unknown as Response, vi.fn());
  return { req, res };
}

beforeEach(() => {
  vi.useFakeTimers();
  onTextCb = null;
  onDoneCb = null;
  onErrorCb = null;
  mockStreamChat.mockClear();
  mockStream = {
    onText: (cb) => { onTextCb = cb; },
    onDone: (cb) => { onDoneCb = cb; },
    onError: (cb) => { onErrorCb = cb; },
  };
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Missing SSE headers ──────────────────────────────────────────────────────

describe('POST /chat — SSE headers (additional)', () => {
  it('sets X-Accel-Buffering to no', () => {
    const { res } = callRouter();
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'X-Accel-Buffering': 'no',
    }));
  });

  it('sets Connection to keep-alive', () => {
    const { res } = callRouter();
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Connection': 'keep-alive',
    }));
  });
});

// ─── keepalive interval ───────────────────────────────────────────────────────

describe('POST /chat — keepalive', () => {
  it('writes a keepalive ping after 15 seconds', () => {
    const { res } = callRouter();
    vi.advanceTimersByTime(15_000);
    expect(res.write).toHaveBeenCalledWith(': keepalive\n\n');
  });

  it('writes two keepalive pings after 30 seconds', () => {
    const { res } = callRouter();
    vi.advanceTimersByTime(30_000);
    const keepaliveCalls = (res.write as ReturnType<typeof vi.fn>).mock.calls
      .filter(([arg]) => arg === ': keepalive\n\n');
    expect(keepaliveCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── onText — delta events ────────────────────────────────────────────────────

describe('POST /chat — onText delta events', () => {
  it('writes at least one delta SSE event', async () => {
    const { res } = callRouter();
    onTextCb!('hello world');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    expect(writes.some((w) => w.includes('"type":"delta"'))).toBe(true);
  });

  it('delta event contains the text chunk', async () => {
    const { res } = callRouter();
    onTextCb!('hello');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    const deltaWrite = writes.find((w) => w.includes('"type":"delta"'));
    expect(deltaWrite).toBeDefined();
    expect(deltaWrite).toContain('hello');
  });

  it('delta event is formatted as SSE data line', async () => {
    const { res } = callRouter();
    onTextCb!('test');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    const deltaWrite = writes.find((w) => w.includes('"type":"delta"'));
    expect(deltaWrite).toMatch(/^data: /);
    expect(deltaWrite).toMatch(/\n\n$/);
  });
});

// ─── onText — editor-update events ───────────────────────────────────────────

describe('POST /chat — onText editor-update', () => {
  it('sends editor-update event when starter-code block found', async () => {
    const { res } = callRouter();
    onTextCb!('```typescript starter-code\nfunction f() {}\n```');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    expect(writes.some((w) => w.includes('"type":"editor-update"'))).toBe(true);
  });

  it('sends editor-update event when test-code block found', async () => {
    const { res } = callRouter();
    onTextCb!('```typescript test-code\nconsole.log(f()); // expected: 1\n```');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    expect(writes.some((w) => w.includes('"type":"editor-update"'))).toBe(true);
  });

  it('does NOT send editor-update when no code blocks present', async () => {
    const { res } = callRouter();
    onTextCb!('Just some plain text response here.');
    await vi.runAllTimersAsync();
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    expect(writes.every((w) => !w.includes('"type":"editor-update"'))).toBe(true);
  });
});

// ─── onError when aborted ─────────────────────────────────────────────────────

describe('POST /chat — onError when aborted', () => {
  it('does not write an error event when request was aborted', () => {
    const req = makeReq();
    const res = makeRes();
    callRouter(req, res);
    // Trigger close to abort the controller
    const onMock = req.on as ReturnType<typeof vi.fn>;
    const closeCb = onMock.mock.calls.find(([event]) => event === 'close')?.[1] as (() => void) | undefined;
    closeCb?.();
    // Fire error after abort
    onErrorCb!('post-abort error');
    const writes = (res.write as ReturnType<typeof vi.fn>).mock.calls.map(([a]) => a as string);
    expect(writes.every((w) => !w.includes('"type":"error"'))).toBe(true);
  });

  it('still calls res.end when aborted', () => {
    const req = makeReq();
    const res = makeRes();
    callRouter(req, res);
    const onMock = req.on as ReturnType<typeof vi.fn>;
    const closeCb = onMock.mock.calls.find(([event]) => event === 'close')?.[1] as (() => void) | undefined;
    closeCb?.();
    onErrorCb!('post-abort error');
    expect(res.end).toHaveBeenCalled();
  });
});

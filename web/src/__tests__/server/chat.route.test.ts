import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// ─── Mocks ────────────────────────────────────────────────────────────────────
// All middleware pass-through; streamChat is controlled per test.

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

// mockStream is built fresh in beforeEach
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

// ─── Test setup ───────────────────────────────────────────────────────────────

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
  return res;
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

// ─── Chat route handler ───────────────────────────────────────────────────────

describe('POST /chat — SSE setup', () => {
  it('sets Content-Type to text/event-stream', () => {
    const res = callRouter();
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Content-Type': 'text/event-stream',
    }));
  });

  it('sets Cache-Control to no-cache', () => {
    const res = callRouter();
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Cache-Control': 'no-cache',
    }));
  });

  it('calls streamChat with the request body', () => {
    const req = makeReq();
    callRouter(req);
    expect(mockStreamChat).toHaveBeenCalledWith(
      { message: 'hello', mode: 'TEACHER' },
      expect.any(AbortSignal),
    );
  });

  it('registers onText, onDone, onError callbacks on the stream', () => {
    callRouter();
    expect(onTextCb).toBeTypeOf('function');
    expect(onDoneCb).toBeTypeOf('function');
    expect(onErrorCb).toBeTypeOf('function');
  });
});

describe('POST /chat — onDone', () => {
  it('writes a done event', async () => {
    const res = callRouter();
    onDoneCb!();
    await Promise.resolve(); // flush .then() microtask
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"type":"done"'));
  });

  it('calls res.end after done', async () => {
    const res = callRouter();
    onDoneCb!();
    await Promise.resolve();
    expect(res.end).toHaveBeenCalled();
  });
});

describe('POST /chat — onError', () => {
  it('writes an error event', () => {
    const res = callRouter();
    onErrorCb!('something went wrong');
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('"type":"error"'));
  });

  it('includes the error message in the error event', () => {
    const res = callRouter();
    onErrorCb!('specific error message');
    expect(res.write).toHaveBeenCalledWith(expect.stringContaining('specific error message'));
  });

  it('calls res.end after error', () => {
    const res = callRouter();
    onErrorCb!('some error');
    expect(res.end).toHaveBeenCalled();
  });
});

describe('POST /chat — client disconnect', () => {
  it('registers a close listener on the request', () => {
    const req = makeReq();
    callRouter(req);
    expect(req.on).toHaveBeenCalledWith('close', expect.any(Function));
  });
});

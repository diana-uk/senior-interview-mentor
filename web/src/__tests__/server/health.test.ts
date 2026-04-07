import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response } from 'express';

const mockGetAIBackend = vi.fn();

vi.mock('../../../server/services/ai.js', () => ({
  getAIBackend: () => mockGetAIBackend(),
}));

import { handleHealth } from '../../../server/routes/health';

function makeRes() {
  let body: unknown = undefined;
  return {
    get body() { return body; },
    json(data: unknown) { body = data; return this; },
  } as unknown as Response & { body: unknown };
}

beforeEach(() => {
  mockGetAIBackend.mockReturnValue('claude-cli');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Response shape ───────────────────────────────────────────────────────────

describe('handleHealth — response shape', () => {
  it('includes all expected top-level keys', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const body = res.body as Record<string, unknown>;
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('aiBackend');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('nodeVersion');
  });

  it('memory object has exactly rss, heapUsed, heapTotal keys', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const mem = (res.body as Record<string, unknown>).memory as Record<string, unknown>;
    expect(Object.keys(mem).sort()).toEqual(['heapTotal', 'heapUsed', 'rss']);
  });

  it('status is "ok"', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    expect((res.body as Record<string, unknown>).status).toBe('ok');
  });
});

// ─── timestamp ────────────────────────────────────────────────────────────────

describe('handleHealth — timestamp', () => {
  it('timestamp is a string', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    expect(typeof (res.body as Record<string, unknown>).timestamp).toBe('string');
  });

  it('timestamp is a valid ISO 8601 datetime', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const ts = (res.body as Record<string, unknown>).timestamp as string;
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

// ─── uptime ───────────────────────────────────────────────────────────────────

describe('handleHealth — uptime', () => {
  it('uptime is a non-negative number', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const uptime = (res.body as Record<string, unknown>).uptime as number;
    expect(typeof uptime).toBe('number');
    expect(uptime).toBeGreaterThanOrEqual(0);
  });

  it('uptime is an integer (floored seconds)', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const uptime = (res.body as Record<string, unknown>).uptime as number;
    expect(Number.isInteger(uptime)).toBe(true);
  });
});

// ─── aiBackend ────────────────────────────────────────────────────────────────

describe('handleHealth — aiBackend', () => {
  it('returns aiBackend from getAIBackend()', () => {
    mockGetAIBackend.mockReturnValue('claude-cli');
    const res = makeRes();
    handleHealth({} as Request, res);
    expect((res.body as Record<string, unknown>).aiBackend).toBe('claude-cli');
  });

  it('reflects different aiBackend values', () => {
    mockGetAIBackend.mockReturnValue('anthropic-sdk');
    const res = makeRes();
    handleHealth({} as Request, res);
    expect((res.body as Record<string, unknown>).aiBackend).toBe('anthropic-sdk');
  });
});

// ─── memory ───────────────────────────────────────────────────────────────────

describe('handleHealth — memory', () => {
  it('memory.rss is a number', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const mem = (res.body as Record<string, unknown>).memory as Record<string, unknown>;
    expect(typeof mem.rss).toBe('number');
  });

  it('memory.heapUsed is a number', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const mem = (res.body as Record<string, unknown>).memory as Record<string, unknown>;
    expect(typeof mem.heapUsed).toBe('number');
  });

  it('memory.heapTotal is a number', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    const mem = (res.body as Record<string, unknown>).memory as Record<string, unknown>;
    expect(typeof mem.heapTotal).toBe('number');
  });

  it('rounds memory values to whole MB', () => {
    vi.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 50 * 1024 * 1024,
      heapUsed: 30 * 1024 * 1024,
      heapTotal: 60 * 1024 * 1024,
      external: 0,
      arrayBuffers: 0,
    });
    const res = makeRes();
    handleHealth({} as Request, res);
    const mem = (res.body as Record<string, unknown>).memory as Record<string, number>;
    expect(mem.rss).toBe(50);
    expect(mem.heapUsed).toBe(30);
    expect(mem.heapTotal).toBe(60);
  });
});

// ─── nodeVersion ─────────────────────────────────────────────────────────────

describe('handleHealth — nodeVersion', () => {
  it('nodeVersion is a string', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    expect(typeof (res.body as Record<string, unknown>).nodeVersion).toBe('string');
  });

  it('nodeVersion starts with "v"', () => {
    const res = makeRes();
    handleHealth({} as Request, res);
    expect(((res.body as Record<string, unknown>).nodeVersion as string).startsWith('v')).toBe(true);
  });
});

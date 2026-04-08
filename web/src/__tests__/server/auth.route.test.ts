import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../server/middleware/auth';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSyncFromLocalStorage = vi.fn();

vi.mock('../../../server/middleware/auth.js', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).userId = 'user-test';
    next();
  },
}));

vi.mock('../../../server/db/queries.js', () => ({
  syncFromLocalStorage: (...args: unknown[]) => mockSyncFromLocalStorage(...args),
}));

import authRouter from '../../../server/routes/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const samplePayload = {
  progress: {},
  mistakes: [],
  sessions: [],
  reviews: [],
};

function handle(
  overrides: Partial<Request> = {},
): Promise<{ statusCode: number; body: unknown }> {
  return new Promise((resolve) => {
    const req = {
      method: 'POST',
      url: '/sync',
      path: '/sync',
      baseUrl: '',
      originalUrl: '/sync',
      headers: {},
      body: samplePayload,
      query: {},
      params: {},
      ...overrides,
    } as Request;

    let statusCode = 200;
    const res = {
      status: vi.fn((code: number) => { statusCode = code; return res; }),
      json: vi.fn((body: unknown) => resolve({ statusCode, body })),
    } as unknown as Response;

    (authRouter as unknown as Function)(req, res, () => resolve({ statusCode: 404, body: null }));
  });
}

beforeEach(() => {
  mockSyncFromLocalStorage.mockReset();
});

// ─── POST /sync ───────────────────────────────────────────────────────────────

describe('POST /sync', () => {
  it('calls syncFromLocalStorage with userId from requireAuth', async () => {
    mockSyncFromLocalStorage.mockResolvedValue({ synced: true });
    await handle();
    expect(mockSyncFromLocalStorage).toHaveBeenCalledWith('user-test', samplePayload);
  });

  it('calls syncFromLocalStorage with the request body payload', async () => {
    const customPayload = { ...samplePayload, sessions: [{ mode: 'TEACHER' }] };
    mockSyncFromLocalStorage.mockResolvedValue({ synced: true });
    await handle({ body: customPayload } as Partial<Request>);
    const [, payload] = mockSyncFromLocalStorage.mock.calls[0];
    expect(payload).toEqual(customPayload);
  });

  it('returns the result from syncFromLocalStorage', async () => {
    mockSyncFromLocalStorage.mockResolvedValue({ synced: true });
    const { body } = await handle();
    expect(body).toEqual({ synced: true });
  });

  it('returns 200 status on success', async () => {
    mockSyncFromLocalStorage.mockResolvedValue({ synced: true });
    const { statusCode } = await handle();
    expect(statusCode).toBe(200);
  });

  it('returns 500 when syncFromLocalStorage throws', async () => {
    mockSyncFromLocalStorage.mockRejectedValue(new Error('db error'));
    const { statusCode } = await handle();
    expect(statusCode).toBe(500);
  });

  it('error body includes "Failed to sync data"', async () => {
    mockSyncFromLocalStorage.mockRejectedValue(new Error('db error'));
    const { body } = await handle();
    expect((body as { error: string }).error).toBe('Failed to sync data');
  });

  it('error body includes the error details', async () => {
    mockSyncFromLocalStorage.mockRejectedValue(new Error('connection refused'));
    const { body } = await handle();
    expect((body as { details: string }).details).toContain('connection refused');
  });

  it('calls syncFromLocalStorage once per request', async () => {
    mockSyncFromLocalStorage.mockResolvedValue({ synced: true });
    await handle();
    expect(mockSyncFromLocalStorage).toHaveBeenCalledOnce();
  });
});

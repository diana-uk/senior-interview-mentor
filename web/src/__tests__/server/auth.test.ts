import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

const mockGetUser      = vi.fn();
const mockGetAdmin     = vi.fn(() => ({ auth: { getUser: mockGetUser } }));
const mockIsConfigured = vi.fn();

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin:   () => mockGetAdmin(),
  isSupabaseConfigured: () => mockIsConfigured(),
}));

import { requireAuth, optionalAuth } from '../../../server/middleware/auth';

function makeReq(overrides: Partial<Request> = {}): Request {
  return { headers: {}, ...overrides } as Request;
}

function makeRes() {
  const mock = {
    statusCode: null as number | null,
    body: null as unknown,
    status(code: number) { mock.statusCode = code; return mock; },
    json(b: unknown) { mock.body = b; return mock; },
  };
  return mock as unknown as Response & typeof mock;
}

beforeEach(() => {
  mockGetUser.mockClear();
  mockGetAdmin.mockClear();
  mockIsConfigured.mockReturnValue(true);
});

describe('requireAuth', () => {
  it('returns 503 when Supabase not configured', async () => {
    mockIsConfigured.mockReturnValue(false);
    const res = makeRes();
    await requireAuth(makeReq(), res, vi.fn());
    expect(res.statusCode).toBe(503);
  });

  it('503 body mentions database not configured', async () => {
    mockIsConfigured.mockReturnValue(false);
    const res = makeRes();
    await requireAuth(makeReq(), res, vi.fn());
    expect((res.body as Record<string, unknown>).error).toContain('Database not configured');
  });

  it('returns 401 when no Authorization header', async () => {
    const res = makeRes();
    await requireAuth(makeReq({ headers: {} }), res, vi.fn());
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid') });
    const req = makeReq({ headers: { authorization: 'Bearer bad-token' } });
    const res = makeRes();
    await requireAuth(req, res, vi.fn());
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when getUser throws', async () => {
    mockGetUser.mockRejectedValue(new Error('network error'));
    const req = makeReq({ headers: { authorization: 'Bearer token' } });
    const res = makeRes();
    await requireAuth(req, res, vi.fn());
    expect(res.statusCode).toBe(401);
  });

  it('attaches userId when token is valid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    await requireAuth(req, makeRes(), vi.fn());
    expect((req as Request & { userId: string }).userId).toBe('user-123');
  });

  it('calls next when token is valid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-abc' } }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    const next = vi.fn() as NextFunction;
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('strips Bearer prefix before passing to getUser', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer my-jwt-token' } });
    await requireAuth(req, makeRes(), vi.fn());
    expect(mockGetUser).toHaveBeenCalledWith('my-jwt-token');
  });
});

describe('optionalAuth', () => {
  it('calls next when Supabase not configured', async () => {
    mockIsConfigured.mockReturnValue(false);
    const next = vi.fn() as NextFunction;
    await optionalAuth(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next when no Authorization header', async () => {
    const next = vi.fn() as NextFunction;
    await optionalAuth(makeReq({ headers: {} }), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next even when getUser throws', async () => {
    mockGetUser.mockRejectedValue(new Error('network'));
    const req = makeReq({ headers: { authorization: 'Bearer broken' } });
    const next = vi.fn() as NextFunction;
    await optionalAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('attaches userId when valid token provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-opt' } }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer valid' } });
    await optionalAuth(req, makeRes(), vi.fn());
    expect((req as Request & { userId?: string }).userId).toBe('user-opt');
  });

  it('calls next after valid auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-opt' } }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer valid' } });
    const next = vi.fn() as NextFunction;
    await optionalAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('does not attach userId when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeReq({ headers: { authorization: 'Bearer invalid' } });
    await optionalAuth(req, makeRes(), vi.fn());
    expect((req as Request & { userId?: string }).userId).toBeUndefined();
  });

  it('does not set 401 — always continues', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('bad') });
    const res = makeRes();
    await optionalAuth(makeReq({ headers: { authorization: 'Bearer token' } }), res, vi.fn());
    expect(res.statusCode).toBeNull();
  });
});

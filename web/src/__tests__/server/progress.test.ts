import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../server/middleware/auth';

// ─── Auth mock ───────────────────────────────────────────────────────────────

vi.mock('../../../server/middleware/auth.js', () => ({
  requireAuth: vi.fn((req: Request, _res: Response, next: NextFunction) => {
    (req as AuthenticatedRequest).userId = 'user-test';
    next();
  }),
}));

// ─── DB mocks ────────────────────────────────────────────────────────────────

const mockGetProgressForUser = vi.fn();
const mockUpsertProgress = vi.fn();
const mockGetSessionsForUser = vi.fn();
const mockCreateSession = vi.fn();
const mockGetMistakesForUser = vi.fn();
const mockGetDueMistakes = vi.fn();
const mockCreateMistake = vi.fn();
const mockUpdateMistake = vi.fn();
const mockDeleteMistake = vi.fn();
const mockGetReviewsForUser = vi.fn();
const mockCreateReview = vi.fn();
const mockGetStreak = vi.fn();
const mockRecordActivity = vi.fn();
const mockSyncFromLocalStorage = vi.fn();

vi.mock('../../../server/db/queries.js', () => ({
  getProgressForUser: (...args: unknown[]) => mockGetProgressForUser(...args),
  upsertProgress: (...args: unknown[]) => mockUpsertProgress(...args),
  getSessionsForUser: (...args: unknown[]) => mockGetSessionsForUser(...args),
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  getMistakesForUser: (...args: unknown[]) => mockGetMistakesForUser(...args),
  getDueMistakes: (...args: unknown[]) => mockGetDueMistakes(...args),
  createMistake: (...args: unknown[]) => mockCreateMistake(...args),
  updateMistake: (...args: unknown[]) => mockUpdateMistake(...args),
  deleteMistake: (...args: unknown[]) => mockDeleteMistake(...args),
  getReviewsForUser: (...args: unknown[]) => mockGetReviewsForUser(...args),
  createReview: (...args: unknown[]) => mockCreateReview(...args),
  getStreak: (...args: unknown[]) => mockGetStreak(...args),
  recordActivity: (...args: unknown[]) => mockRecordActivity(...args),
  syncFromLocalStorage: (...args: unknown[]) => mockSyncFromLocalStorage(...args),
}));

import progressRouter from '../../../server/routes/progress';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeRes() {
  let status = 200;
  let body: unknown;
  const res = {
    get statusCode() { return status; },
    get body() { return body; },
    status(code: number) { status = code; return res; },
    json(data: unknown) { body = data; return res; },
  } as unknown as Response & { statusCode: number; body: unknown };
  return res;
}

function handle(
  method: string,
  path: string,
  overrides: Partial<Request> = {},
): Promise<{ statusCode: number; body: unknown }> {
  return new Promise((resolve) => {
    const req = {
      method: method.toUpperCase(),
      url: path,
      path,
      baseUrl: '',
      originalUrl: path,
      query: {},
      body: {},
      params: {},
      headers: {},
      ...overrides,
    } as unknown as Request;

    const res = makeRes();

    // Wrap json to resolve promise
    const origJson = res.json.bind(res);
    (res as unknown as Record<string, unknown>).json = (data: unknown) => {
      origJson(data);
      resolve({ statusCode: (res as unknown as { statusCode: number }).statusCode, body: data });
      return res;
    };

    (progressRouter as unknown as (req: Request, res: Response, next: NextFunction) => void)(
      req,
      res,
      () => resolve({ statusCode: 404, body: null }),
    );
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRecordActivity.mockResolvedValue(undefined);
});

// ─── GET /progress ────────────────────────────────────────────────────────────

describe('GET /progress', () => {
  it('returns data from getProgressForUser', async () => {
    const data = [{ problem_id: 'hm-1', status: 'solved' }];
    mockGetProgressForUser.mockResolvedValue(data);
    const { body } = await handle('GET', '/progress');
    expect(body).toEqual(data);
  });

  it('calls getProgressForUser with userId', async () => {
    mockGetProgressForUser.mockResolvedValue([]);
    await handle('GET', '/progress');
    expect(mockGetProgressForUser).toHaveBeenCalledWith('user-test');
  });

  it('returns 500 on db error', async () => {
    mockGetProgressForUser.mockRejectedValue(new Error('db fail'));
    const { statusCode, body } = await handle('GET', '/progress');
    expect(statusCode).toBe(500);
    expect((body as Record<string, unknown>).error).toBe('Failed to fetch progress');
  });
});

// ─── POST /progress ───────────────────────────────────────────────────────────

describe('POST /progress', () => {
  it('returns upserted data', async () => {
    const saved = { problem_id: 'hm-1', status: 'solved', attempts: 2 };
    mockUpsertProgress.mockResolvedValue(saved);
    const { body } = await handle('POST', '/progress', {
      body: { problemId: 'hm-1', status: 'solved', attempts: 2 },
    } as Partial<Request>);
    expect(body).toEqual(saved);
  });

  it('also calls recordActivity', async () => {
    mockUpsertProgress.mockResolvedValue({});
    await handle('POST', '/progress', { body: { problemId: 'tp-1' } } as Partial<Request>);
    expect(mockRecordActivity).toHaveBeenCalledWith('user-test');
  });

  it('returns 500 on db error', async () => {
    mockUpsertProgress.mockRejectedValue(new Error('upsert fail'));
    const { statusCode, body } = await handle('POST', '/progress', { body: {} } as Partial<Request>);
    expect(statusCode).toBe(500);
    expect((body as Record<string, unknown>).error).toBe('Failed to save progress');
  });
});

// ─── GET /sessions ────────────────────────────────────────────────────────────

describe('GET /sessions', () => {
  it('returns sessions from getSessionsForUser', async () => {
    const sessions = [{ id: 's1', mode: 'teacher' }];
    mockGetSessionsForUser.mockResolvedValue(sessions);
    const { body } = await handle('GET', '/sessions');
    expect(body).toEqual(sessions);
  });

  it('uses default limit of 50 when not specified', async () => {
    mockGetSessionsForUser.mockResolvedValue([]);
    await handle('GET', '/sessions', { query: {} } as Partial<Request>);
    expect(mockGetSessionsForUser).toHaveBeenCalledWith('user-test', 50);
  });

  it('caps limit at 100', async () => {
    mockGetSessionsForUser.mockResolvedValue([]);
    await handle('GET', '/sessions', { query: { limit: '200' } } as Partial<Request>);
    expect(mockGetSessionsForUser).toHaveBeenCalledWith('user-test', 100);
  });

  it('returns 500 on db error', async () => {
    mockGetSessionsForUser.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('GET', '/sessions');
    expect(statusCode).toBe(500);
  });
});

// ─── POST /sessions ───────────────────────────────────────────────────────────

describe('POST /sessions', () => {
  it('returns created session', async () => {
    const session = { id: 's1', mode: 'interviewer' };
    mockCreateSession.mockResolvedValue(session);
    const { body } = await handle('POST', '/sessions', {
      body: { mode: 'interviewer', duration: 30 },
    } as Partial<Request>);
    expect(body).toEqual(session);
  });

  it('returns 500 on db error', async () => {
    mockCreateSession.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('POST', '/sessions', { body: {} } as Partial<Request>);
    expect(statusCode).toBe(500);
  });
});

// ─── GET /mistakes ────────────────────────────────────────────────────────────

describe('GET /mistakes', () => {
  it('returns mistakes from getMistakesForUser', async () => {
    const mistakes = [{ id: 'm1', pattern: 'HashMap' }];
    mockGetMistakesForUser.mockResolvedValue(mistakes);
    const { body } = await handle('GET', '/mistakes');
    expect(body).toEqual(mistakes);
  });

  it('returns 500 on db error', async () => {
    mockGetMistakesForUser.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('GET', '/mistakes');
    expect(statusCode).toBe(500);
  });
});

// ─── GET /mistakes/due ────────────────────────────────────────────────────────

describe('GET /mistakes/due', () => {
  it('returns due mistakes from getDueMistakes', async () => {
    const due = [{ id: 'm2', pattern: 'DP' }];
    mockGetDueMistakes.mockResolvedValue(due);
    const { body } = await handle('GET', '/mistakes/due');
    expect(body).toEqual(due);
  });
});

// ─── POST /mistakes ───────────────────────────────────────────────────────────

describe('POST /mistakes', () => {
  it('returns created mistake', async () => {
    const mistake = { id: 'm3', pattern: 'BFS' };
    mockCreateMistake.mockResolvedValue(mistake);
    const { body } = await handle('POST', '/mistakes', {
      body: { pattern: 'BFS', problemId: 'gr-1', description: 'missed edge' },
    } as Partial<Request>);
    expect(body).toEqual(mistake);
  });

  it('returns 500 on db error', async () => {
    mockCreateMistake.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('POST', '/mistakes', { body: {} } as Partial<Request>);
    expect(statusCode).toBe(500);
  });
});

// ─── PATCH /mistakes/:id ─────────────────────────────────────────────────────

describe('PATCH /mistakes/:id', () => {
  it('returns updated mistake', async () => {
    const updated = { id: 'abc', interval_days: 4 };
    mockUpdateMistake.mockResolvedValue(updated);
    const { body } = await handle('PATCH', '/mistakes/abc', {
      body: { intervalDays: 4, easeFactor: 2.5, repetitions: 3, streak: 1 },
    } as Partial<Request>);
    expect(body).toEqual(updated);
  });

  it('returns 500 on db error', async () => {
    mockUpdateMistake.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('PATCH', '/mistakes/abc', { body: {} } as Partial<Request>);
    expect(statusCode).toBe(500);
  });
});

// ─── DELETE /mistakes/:id ─────────────────────────────────────────────────────

describe('DELETE /mistakes/:id', () => {
  it('returns { deleted: true }', async () => {
    mockDeleteMistake.mockResolvedValue(undefined);
    const { body } = await handle('DELETE', '/mistakes/abc');
    expect(body).toEqual({ deleted: true });
  });

  it('returns 500 on db error', async () => {
    mockDeleteMistake.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('DELETE', '/mistakes/abc');
    expect(statusCode).toBe(500);
  });
});

// ─── GET /reviews ─────────────────────────────────────────────────────────────

describe('GET /reviews', () => {
  it('returns reviews from getReviewsForUser', async () => {
    const reviews = [{ id: 'r1', overall_score: 3 }];
    mockGetReviewsForUser.mockResolvedValue(reviews);
    const { body } = await handle('GET', '/reviews');
    expect(body).toEqual(reviews);
  });

  it('returns 500 on db error', async () => {
    mockGetReviewsForUser.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('GET', '/reviews');
    expect(statusCode).toBe(500);
  });
});

// ─── POST /reviews ────────────────────────────────────────────────────────────

describe('POST /reviews', () => {
  it('returns created review', async () => {
    const review = { id: 'r2', overall_score: 4 };
    mockCreateReview.mockResolvedValue(review);
    const { body } = await handle('POST', '/reviews', {
      body: { problemId: 'hm-1', overallScore: 4 },
    } as Partial<Request>);
    expect(body).toEqual(review);
  });
});

// ─── GET /streak ──────────────────────────────────────────────────────────────

describe('GET /streak', () => {
  it('returns streak data from getStreak', async () => {
    const streak = { current_streak: 5, longest_streak: 10, last_active_date: '2026-04-07' };
    mockGetStreak.mockResolvedValue(streak);
    const { body } = await handle('GET', '/streak');
    expect(body).toEqual(streak);
  });

  it('returns default zeros when getStreak returns null', async () => {
    mockGetStreak.mockResolvedValue(null);
    const { body } = await handle('GET', '/streak');
    expect(body).toEqual({ current_streak: 0, longest_streak: 0, last_active_date: null });
  });

  it('returns 500 on db error', async () => {
    mockGetStreak.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('GET', '/streak');
    expect(statusCode).toBe(500);
  });
});

// ─── POST /sync ───────────────────────────────────────────────────────────────

describe('POST /sync', () => {
  it('returns sync result from syncFromLocalStorage', async () => {
    const result = { synced: 12 };
    mockSyncFromLocalStorage.mockResolvedValue(result);
    const { body } = await handle('POST', '/sync', { body: { progress: [] } } as Partial<Request>);
    expect(body).toEqual(result);
  });

  it('returns 500 on db error', async () => {
    mockSyncFromLocalStorage.mockRejectedValue(new Error('fail'));
    const { statusCode } = await handle('POST', '/sync', { body: {} } as Partial<Request>);
    expect(statusCode).toBe(500);
  });
});

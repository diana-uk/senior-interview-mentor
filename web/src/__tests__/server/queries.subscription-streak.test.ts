import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────────────────────
// Flexible chainable builder matching the pattern in queries.additional.test.ts

let mockResult: { data: unknown; error: unknown } = { data: null, error: null };
let lastFromTable = '';

function makeChain() {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'lte', 'order', 'insert', 'update', 'delete', 'upsert']) {
    chain[m] = vi.fn(() => chain);
  }
  chain['limit'] = vi.fn(() => Promise.resolve(mockResult));
  chain['single'] = vi.fn(() => Promise.resolve(mockResult));
  (chain as { then?: unknown }).then = (
    resolve: (v: unknown) => unknown,
    reject: (e: unknown) => unknown,
  ) => Promise.resolve(mockResult).then(resolve, reject);
  return chain;
}

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn((table: string) => {
      lastFromTable = table;
      return makeChain();
    }),
  })),
}));

import {
  getStreak,
  upsertStreak,
  getSubscription,
  upsertSubscription,
  syncFromLocalStorage,
} from '../../../server/db/queries';

beforeEach(() => {
  mockResult = { data: null, error: null };
  lastFromTable = '';
});

// ─── getStreak ────────────────────────────────────────────────────────────────

describe('getStreak', () => {
  it('queries the streaks table', async () => {
    await getStreak('user-1');
    expect(lastFromTable).toBe('streaks');
  });

  it('returns data when found', async () => {
    const row = { user_id: 'user-1', current_streak: 5, longest_streak: 10, last_active_date: '2026-01-10' };
    mockResult = { data: row, error: null };
    const result = await getStreak('user-1');
    expect(result).toEqual(row);
  });

  it('returns null when PGRST116 (no rows found)', async () => {
    mockResult = { data: null, error: { code: 'PGRST116', message: 'no rows found' } };
    const result = await getStreak('user-1');
    expect(result).toBeNull();
  });

  it('throws when error code is not PGRST116', async () => {
    mockResult = { data: null, error: { code: 'DB_ERROR', message: 'connection failed' } };
    await expect(getStreak('user-1')).rejects.toMatchObject({ code: 'DB_ERROR' });
  });
});

// ─── upsertStreak ─────────────────────────────────────────────────────────────

describe('upsertStreak', () => {
  const updates = { current_streak: 3, longest_streak: 5, last_active_date: '2026-01-10' };

  it('queries the streaks table', async () => {
    await upsertStreak('user-1', updates);
    expect(lastFromTable).toBe('streaks');
  });

  it('returns upserted row', async () => {
    const row = { user_id: 'user-1', ...updates };
    mockResult = { data: row, error: null };
    const result = await upsertStreak('user-1', updates);
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('upsert failed') };
    await expect(upsertStreak('user-1', updates)).rejects.toThrow('upsert failed');
  });
});

// ─── getSubscription ──────────────────────────────────────────────────────────

describe('getSubscription', () => {
  it('queries the subscriptions table', async () => {
    await getSubscription('user-1');
    expect(lastFromTable).toBe('subscriptions');
  });

  it('returns data when found', async () => {
    const row = { user_id: 'user-1', plan: 'premium', status: 'active' };
    mockResult = { data: row, error: null };
    const result = await getSubscription('user-1');
    expect(result).toEqual(row);
  });

  it('returns null when PGRST116 (no subscription found)', async () => {
    mockResult = { data: null, error: { code: 'PGRST116', message: 'no rows found' } };
    const result = await getSubscription('user-1');
    expect(result).toBeNull();
  });

  it('throws when error code is not PGRST116', async () => {
    mockResult = { data: null, error: { code: 'DB_ERROR', message: 'connection failed' } };
    await expect(getSubscription('user-1')).rejects.toMatchObject({ code: 'DB_ERROR' });
  });
});

// ─── upsertSubscription ───────────────────────────────────────────────────────

describe('upsertSubscription', () => {
  const updates = { plan: 'pro', status: 'active' };

  it('queries the subscriptions table', async () => {
    await upsertSubscription('user-1', updates as any);
    expect(lastFromTable).toBe('subscriptions');
  });

  it('returns upserted row', async () => {
    const row = { user_id: 'user-1', ...updates };
    mockResult = { data: row, error: null };
    const result = await upsertSubscription('user-1', updates as any);
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('upsert failed') };
    await expect(upsertSubscription('user-1', updates as any)).rejects.toThrow('upsert failed');
  });
});

// ─── syncFromLocalStorage ─────────────────────────────────────────────────────

describe('syncFromLocalStorage', () => {
  const emptyPayload = { progress: {}, mistakes: [], sessions: [], reviews: [] };

  it('returns { synced: true } on empty payload', async () => {
    const result = await syncFromLocalStorage('user-1', emptyPayload);
    expect(result).toEqual({ synced: true });
  });

  it('resolves successfully with progress data', async () => {
    const payload = {
      ...emptyPayload,
      progress: {
        'two-sum': { status: 'solved', attempts: 1, bestScore: 4, bestTime: 120, hintsUsed: 0, code: '', lastAttempted: '2026-01-10' },
      },
    };
    await expect(syncFromLocalStorage('user-1', payload)).resolves.toEqual({ synced: true });
  });

  it('throws when problem_progress upsert errors', async () => {
    mockResult = { data: null, error: new Error('progress upsert failed') };
    const payload = {
      ...emptyPayload,
      progress: {
        'two-sum': { status: 'solved', attempts: 1, bestScore: 4, bestTime: 120, hintsUsed: 0, code: '', lastAttempted: '2026-01-10' },
      },
    };
    await expect(syncFromLocalStorage('user-1', payload)).rejects.toThrow('progress upsert failed');
  });

  it('throws when mistakes insert errors', async () => {
    mockResult = { data: null, error: new Error('mistakes insert failed') };
    const payload = {
      ...emptyPayload,
      mistakes: [{
        pattern: 'Arrays', problemId: 'p1', problemTitle: 'Two Sum',
        description: 'missed edge case', nextReview: '2026-01-15',
        interval: 1, easeFactor: 2.5, repetitions: 1, streak: 1, createdAt: '2026-01-10',
      }],
    };
    await expect(syncFromLocalStorage('user-1', payload)).rejects.toThrow('mistakes insert failed');
  });

  it('throws when sessions insert errors', async () => {
    mockResult = { data: null, error: new Error('sessions insert failed') };
    const payload = {
      ...emptyPayload,
      sessions: [{
        mode: 'TEACHER', problemId: 'p1', problemTitle: 'Two Sum',
        duration: 300, hintsUsed: 1, score: 3.5, patterns: ['HashMap'], date: '2026-01-10',
      }],
    };
    await expect(syncFromLocalStorage('user-1', payload)).rejects.toThrow('sessions insert failed');
  });

  it('throws when reviews insert errors', async () => {
    mockResult = { data: null, error: new Error('reviews insert failed') };
    const payload = {
      ...emptyPayload,
      reviews: [{
        problemId: 'p1', problemTitle: 'Two Sum',
        dimensions: { correctness: 4, 'time-complexity': 3 },
        overallScore: 3.5, feedback: 'Good', improvementPlan: [], createdAt: '2026-01-10',
      }],
    };
    await expect(syncFromLocalStorage('user-1', payload)).rejects.toThrow('reviews insert failed');
  });
});

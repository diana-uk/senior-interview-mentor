import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ─────────────────────────────────────────────────────────────
// Flexible chainable builder that supports all Supabase operations:
// - .single() and .limit() are terminal: return Promise.resolve(mockResult)
// - All other methods return the chain for further chaining
// - The chain itself is thenable so direct `await chain` works too
//   (used when terminal is .eq() / .order() / .lte())

let mockResult: { data: unknown; error: unknown } = { data: null, error: null };
let lastFromTable = '';

function makeChain() {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'lte', 'order', 'insert', 'update', 'delete', 'upsert']) {
    chain[m] = vi.fn(() => chain);
  }
  chain['limit'] = vi.fn(() => Promise.resolve(mockResult));
  chain['single'] = vi.fn(() => Promise.resolve(mockResult));
  // Thenable so `await chain` works for queries that don't end in .single()/.limit()
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
  getProfile,
  updateProfile,
  getProgressForUser,
  upsertProgress,
  updateProgress,
  createSession,
  getSessionsForUser,
  getMistakesForUser,
  getDueMistakes,
  createMistake,
  updateMistake,
  deleteMistake,
  createReview,
  getReviewsForUser,
} from '../../../server/db/queries';

beforeEach(() => {
  mockResult = { data: null, error: null };
  lastFromTable = '';
});

// ─── getProfile ───────────────────────────────────────────────────────────────

describe('getProfile', () => {
  it('queries the profiles table', async () => {
    await getProfile('user-1');
    expect(lastFromTable).toBe('profiles');
  });

  it('returns data on success', async () => {
    const row = { id: 'user-1', display_name: 'Alice' };
    mockResult = { data: row, error: null };
    const result = await getProfile('user-1');
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('db error') };
    await expect(getProfile('user-1')).rejects.toThrow('db error');
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  it('queries the profiles table', async () => {
    await updateProfile('user-1', { display_name: 'Bob' });
    expect(lastFromTable).toBe('profiles');
  });

  it('returns updated data on success', async () => {
    const row = { id: 'user-1', display_name: 'Bob' };
    mockResult = { data: row, error: null };
    const result = await updateProfile('user-1', { display_name: 'Bob' });
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('update failed') };
    await expect(updateProfile('user-1', {})).rejects.toThrow('update failed');
  });
});

// ─── getProgressForUser ───────────────────────────────────────────────────────

describe('getProgressForUser', () => {
  it('queries the problem_progress table', async () => {
    await getProgressForUser('user-1');
    expect(lastFromTable).toBe('problem_progress');
  });

  it('returns data array on success', async () => {
    const rows = [{ user_id: 'user-1', problem_id: 'hm-1' }];
    mockResult = { data: rows, error: null };
    const result = await getProgressForUser('user-1');
    expect(result).toEqual(rows);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('query failed') };
    await expect(getProgressForUser('user-1')).rejects.toThrow('query failed');
  });
});

// ─── upsertProgress ───────────────────────────────────────────────────────────

describe('upsertProgress', () => {
  it('queries the problem_progress table', async () => {
    await upsertProgress({ user_id: 'user-1', problem_id: 'hm-1', status: 'solved', attempts: 1 });
    expect(lastFromTable).toBe('problem_progress');
  });

  it('returns upserted row on success', async () => {
    const row = { user_id: 'user-1', problem_id: 'hm-1', status: 'solved' };
    mockResult = { data: row, error: null };
    const result = await upsertProgress({ user_id: 'user-1', problem_id: 'hm-1', status: 'solved', attempts: 1 });
    expect(result).toEqual(row);
  });
});

// ─── updateProgress ───────────────────────────────────────────────────────────

describe('updateProgress', () => {
  it('queries the problem_progress table', async () => {
    await updateProgress('user-1', 'hm-1', { status: 'solved' });
    expect(lastFromTable).toBe('problem_progress');
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('not found') };
    await expect(updateProgress('user-1', 'hm-1', {})).rejects.toThrow('not found');
  });
});

// ─── createSession ────────────────────────────────────────────────────────────

describe('createSession', () => {
  const sessionInsert = {
    user_id: 'user-1',
    mode: 'TEACHER' as const,
    problem_id: 'hm-1',
    problem_title: 'Two Sum',
    duration: 1800,
    hints_used: 1,
    score: 3,
    patterns: ['HashMap'],
  };

  it('queries the sessions table', async () => {
    await createSession(sessionInsert);
    expect(lastFromTable).toBe('sessions');
  });

  it('returns created row on success', async () => {
    const row = { id: 'sess-1', ...sessionInsert };
    mockResult = { data: row, error: null };
    const result = await createSession(sessionInsert);
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('insert failed') };
    await expect(createSession(sessionInsert)).rejects.toThrow('insert failed');
  });
});

// ─── getSessionsForUser ───────────────────────────────────────────────────────

describe('getSessionsForUser', () => {
  it('queries the sessions table', async () => {
    await getSessionsForUser('user-1');
    expect(lastFromTable).toBe('sessions');
  });

  it('returns sessions array on success', async () => {
    const rows = [{ id: 'sess-1', user_id: 'user-1' }];
    mockResult = { data: rows, error: null };
    const result = await getSessionsForUser('user-1');
    expect(result).toEqual(rows);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('query failed') };
    await expect(getSessionsForUser('user-1')).rejects.toThrow('query failed');
  });
});

// ─── getMistakesForUser ───────────────────────────────────────────────────────

describe('getMistakesForUser', () => {
  it('queries the mistakes table', async () => {
    await getMistakesForUser('user-1');
    expect(lastFromTable).toBe('mistakes');
  });

  it('returns mistakes array on success', async () => {
    const rows = [{ id: 'mist-1', user_id: 'user-1' }];
    mockResult = { data: rows, error: null };
    const result = await getMistakesForUser('user-1');
    expect(result).toEqual(rows);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('query failed') };
    await expect(getMistakesForUser('user-1')).rejects.toThrow('query failed');
  });
});

// ─── getDueMistakes ───────────────────────────────────────────────────────────

describe('getDueMistakes', () => {
  it('queries the mistakes table', async () => {
    await getDueMistakes('user-1');
    expect(lastFromTable).toBe('mistakes');
  });

  it('returns due mistakes array on success', async () => {
    const rows = [{ id: 'mist-1', next_review: '2026-01-01T00:00:00Z' }];
    mockResult = { data: rows, error: null };
    const result = await getDueMistakes('user-1');
    expect(result).toEqual(rows);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('query failed') };
    await expect(getDueMistakes('user-1')).rejects.toThrow('query failed');
  });
});

// ─── createMistake ────────────────────────────────────────────────────────────

describe('createMistake', () => {
  const mistakeInsert = {
    user_id: 'user-1',
    pattern: 'HashMap',
    problem_id: 'hm-1',
    problem_title: 'Two Sum',
    description: 'forgot edge case',
    next_review: '2026-04-09T00:00:00Z',
    interval_days: 1,
    ease_factor: 2.5,
    repetitions: 0,
    streak: 0,
  };

  it('queries the mistakes table', async () => {
    await createMistake(mistakeInsert);
    expect(lastFromTable).toBe('mistakes');
  });

  it('returns created row on success', async () => {
    const row = { id: 'mist-1', ...mistakeInsert };
    mockResult = { data: row, error: null };
    const result = await createMistake(mistakeInsert);
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('insert failed') };
    await expect(createMistake(mistakeInsert)).rejects.toThrow('insert failed');
  });
});

// ─── updateMistake ────────────────────────────────────────────────────────────

describe('updateMistake', () => {
  it('queries the mistakes table', async () => {
    await updateMistake('mist-1', 'user-1', { interval_days: 3 });
    expect(lastFromTable).toBe('mistakes');
  });

  it('returns updated row on success', async () => {
    const row = { id: 'mist-1', interval_days: 3 };
    mockResult = { data: row, error: null };
    const result = await updateMistake('mist-1', 'user-1', { interval_days: 3 });
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('not found') };
    await expect(updateMistake('mist-1', 'user-1', {})).rejects.toThrow('not found');
  });
});

// ─── deleteMistake ────────────────────────────────────────────────────────────

describe('deleteMistake', () => {
  it('queries the mistakes table', async () => {
    await deleteMistake('mist-1', 'user-1');
    expect(lastFromTable).toBe('mistakes');
  });

  it('resolves without throwing on success', async () => {
    mockResult = { data: null, error: null };
    await expect(deleteMistake('mist-1', 'user-1')).resolves.toBeUndefined();
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('delete failed') };
    await expect(deleteMistake('mist-1', 'user-1')).rejects.toThrow('delete failed');
  });
});

// ─── createReview ─────────────────────────────────────────────────────────────

describe('createReview', () => {
  const reviewInsert = {
    user_id: 'user-1',
    problem_id: 'hm-1',
    problem_title: 'Two Sum',
    correctness: 4,
    time_complexity: 3,
    space_complexity: 3,
    code_quality: 4,
    edge_cases: 3,
    communication: 4,
    overall_score: 3.5,
    feedback: 'Good approach',
    improvement_plan: ['Consider edge cases'],
  };

  it('queries the reviews table', async () => {
    await createReview(reviewInsert);
    expect(lastFromTable).toBe('reviews');
  });

  it('returns created row on success', async () => {
    const row = { id: 'rev-1', ...reviewInsert };
    mockResult = { data: row, error: null };
    const result = await createReview(reviewInsert);
    expect(result).toEqual(row);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('insert failed') };
    await expect(createReview(reviewInsert)).rejects.toThrow('insert failed');
  });
});

// ─── getReviewsForUser ────────────────────────────────────────────────────────

describe('getReviewsForUser', () => {
  it('queries the reviews table', async () => {
    await getReviewsForUser('user-1');
    expect(lastFromTable).toBe('reviews');
  });

  it('returns reviews array on success', async () => {
    const rows = [{ id: 'rev-1', user_id: 'user-1' }];
    mockResult = { data: rows, error: null };
    const result = await getReviewsForUser('user-1');
    expect(result).toEqual(rows);
  });

  it('throws when error is returned', async () => {
    mockResult = { data: null, error: new Error('query failed') };
    await expect(getReviewsForUser('user-1')).rejects.toThrow('query failed');
  });
});

import { describe, it, expect, vi } from 'vitest';

// ─── Mock underlying modules ──────────────────────────────────────────────────
// The barrel (server/db/index.ts) re-exports from client.ts and queries.ts.
// We mock both to avoid real DB connections and verify the exports surface through.

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock('../../../server/db/queries.js', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getProgressForUser: vi.fn(),
  upsertProgress: vi.fn(),
  updateProgress: vi.fn(),
  createSession: vi.fn(),
  getSessionsForUser: vi.fn(),
  getMistakesForUser: vi.fn(),
  getDueMistakes: vi.fn(),
  createMistake: vi.fn(),
  updateMistake: vi.fn(),
  deleteMistake: vi.fn(),
  createReview: vi.fn(),
  getReviewsForUser: vi.fn(),
  getStreak: vi.fn(),
  upsertStreak: vi.fn(),
  recordActivity: vi.fn(),
  syncFromLocalStorage: vi.fn(),
  getSubscription: vi.fn(),
}));

import * as dbIndex from '../../../server/db/index.js';

// ─── client.ts re-exports ─────────────────────────────────────────────────────

describe('server/db/index — client exports', () => {
  it('exports getSupabaseAdmin', () => {
    expect(typeof dbIndex.getSupabaseAdmin).toBe('function');
  });

  it('exports isSupabaseConfigured', () => {
    expect(typeof dbIndex.isSupabaseConfigured).toBe('function');
  });
});

// ─── queries.ts re-exports ────────────────────────────────────────────────────

describe('server/db/index — query exports', () => {
  it('exports getProfile', () => {
    expect(typeof dbIndex.getProfile).toBe('function');
  });

  it('exports updateProfile', () => {
    expect(typeof dbIndex.updateProfile).toBe('function');
  });

  it('exports getProgressForUser', () => {
    expect(typeof dbIndex.getProgressForUser).toBe('function');
  });

  it('exports upsertProgress', () => {
    expect(typeof dbIndex.upsertProgress).toBe('function');
  });

  it('exports updateProgress', () => {
    expect(typeof dbIndex.updateProgress).toBe('function');
  });

  it('exports createSession', () => {
    expect(typeof dbIndex.createSession).toBe('function');
  });

  it('exports getSessionsForUser', () => {
    expect(typeof dbIndex.getSessionsForUser).toBe('function');
  });

  it('exports getMistakesForUser', () => {
    expect(typeof dbIndex.getMistakesForUser).toBe('function');
  });

  it('exports getDueMistakes', () => {
    expect(typeof dbIndex.getDueMistakes).toBe('function');
  });

  it('exports createMistake', () => {
    expect(typeof dbIndex.createMistake).toBe('function');
  });

  it('exports updateMistake', () => {
    expect(typeof dbIndex.updateMistake).toBe('function');
  });

  it('exports deleteMistake', () => {
    expect(typeof dbIndex.deleteMistake).toBe('function');
  });

  it('exports createReview', () => {
    expect(typeof dbIndex.createReview).toBe('function');
  });

  it('exports getReviewsForUser', () => {
    expect(typeof dbIndex.getReviewsForUser).toBe('function');
  });

  it('exports getStreak', () => {
    expect(typeof dbIndex.getStreak).toBe('function');
  });

  it('exports upsertStreak', () => {
    expect(typeof dbIndex.upsertStreak).toBe('function');
  });

  it('exports recordActivity', () => {
    expect(typeof dbIndex.recordActivity).toBe('function');
  });

  it('exports syncFromLocalStorage', () => {
    expect(typeof dbIndex.syncFromLocalStorage).toBe('function');
  });

  it('exports getSubscription', () => {
    expect(typeof dbIndex.getSubscription).toBe('function');
  });
});

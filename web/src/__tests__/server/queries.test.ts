import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Supabase mock ──────────────────────────────────────────────────────────
// We need a chainable builder that lets us control what .single() returns
// for both SELECT (getStreak) and UPSERT (upsertStreak) calls.

let mockSelectResult: { data: unknown; error: unknown } = { data: null, error: null };
let mockUpsertResult: { data: unknown; error: unknown } = { data: null, error: null };
let upsertSpy = vi.fn();

function makeChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const methods = ['from', 'select', 'eq', 'lte', 'order', 'limit', 'insert', 'update', 'delete', 'upsert'];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // Terminal .single() returns the controlled result
  chain['single'] = vi.fn(() => Promise.resolve(result));
  return chain;
}

vi.mock('../../../server/db/client.js', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn((table: string) => {
      // Return upsert chain for writes, select chain for reads
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        single: vi.fn(() => Promise.resolve(mockSelectResult)),
        upsert: vi.fn((...args: unknown[]) => {
          upsertSpy(...args);
          const upsertChain = {
            select: vi.fn(() => upsertChain),
            single: vi.fn(() => Promise.resolve(mockUpsertResult)),
          };
          return upsertChain;
        }),
      };
      return chain;
    }),
  })),
}));

import { recordActivity } from '../../../server/db/queries';

// Helper: format date as YYYY-MM-DD
function dateStr(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

const today = dateStr(0);
const yesterday = dateStr(-1);
const twoDaysAgo = dateStr(-2);

beforeEach(() => {
  upsertSpy.mockClear();
  // Default: no existing streak
  mockSelectResult = { data: null, error: { code: 'PGRST116', message: 'no rows' } };
  // Default upsert returns the upserted row
  mockUpsertResult = { data: { current_streak: 1, longest_streak: 1, last_active_date: today }, error: null };
});

describe('recordActivity', () => {
  describe('no existing streak', () => {
    it('creates a new streak when none exists', async () => {
      mockSelectResult = { data: null, error: { code: 'PGRST116' } };
      mockUpsertResult = {
        data: { current_streak: 1, longest_streak: 1, last_active_date: today },
        error: null,
      };

      const result = await recordActivity('user-1');
      expect(result).toBeDefined();
    });

    it('calls upsert with current_streak=1', async () => {
      mockSelectResult = { data: null, error: { code: 'PGRST116' } };
      mockUpsertResult = { data: { current_streak: 1 }, error: null };

      await recordActivity('user-1');
      expect(upsertSpy).toHaveBeenCalledOnce();
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.current_streak).toBe(1);
    });

    it('calls upsert with longest_streak=1', async () => {
      mockSelectResult = { data: null, error: { code: 'PGRST116' } };
      mockUpsertResult = { data: { longest_streak: 1 }, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.longest_streak).toBe(1);
    });

    it('calls upsert with last_active_date = today', async () => {
      mockSelectResult = { data: null, error: { code: 'PGRST116' } };
      mockUpsertResult = { data: { last_active_date: today }, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.last_active_date).toBe(today);
    });

    it('includes user_id in upsert payload', async () => {
      mockSelectResult = { data: null, error: { code: 'PGRST116' } };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-xyz');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.user_id).toBe('user-xyz');
    });
  });

  describe('already active today', () => {
    it('returns existing record without calling upsert', async () => {
      const existing = {
        user_id: 'user-1',
        current_streak: 5,
        longest_streak: 10,
        last_active_date: today,
      };
      mockSelectResult = { data: existing, error: null };

      const result = await recordActivity('user-1');
      expect(upsertSpy).not.toHaveBeenCalled();
      expect(result).toEqual(existing);
    });

    it('preserves current_streak when already active today', async () => {
      mockSelectResult = {
        data: { current_streak: 7, longest_streak: 7, last_active_date: today },
        error: null,
      };

      const result = await recordActivity('user-1');
      expect((result as { current_streak: number }).current_streak).toBe(7);
    });
  });

  describe('active yesterday (consecutive)', () => {
    it('increments current_streak by 1', async () => {
      mockSelectResult = {
        data: { current_streak: 3, longest_streak: 5, last_active_date: yesterday },
        error: null,
      };
      mockUpsertResult = { data: { current_streak: 4 }, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.current_streak).toBe(4); // 3 + 1
    });

    it('does not increase longest_streak when new streak is below existing longest', async () => {
      mockSelectResult = {
        data: { current_streak: 3, longest_streak: 10, last_active_date: yesterday },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.longest_streak).toBe(10); // remains 10
    });

    it('updates longest_streak when new streak exceeds it', async () => {
      mockSelectResult = {
        data: { current_streak: 9, longest_streak: 9, last_active_date: yesterday },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.current_streak).toBe(10);
      expect(upsertArg.longest_streak).toBe(10);
    });

    it('sets last_active_date to today', async () => {
      mockSelectResult = {
        data: { current_streak: 2, longest_streak: 2, last_active_date: yesterday },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.last_active_date).toBe(today);
    });
  });

  describe('streak broken (gap > 1 day)', () => {
    it('resets current_streak to 1 after a skipped day', async () => {
      mockSelectResult = {
        data: { current_streak: 5, longest_streak: 5, last_active_date: twoDaysAgo },
        error: null,
      };
      mockUpsertResult = { data: { current_streak: 1 }, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.current_streak).toBe(1);
    });

    it('preserves longest_streak when resetting', async () => {
      mockSelectResult = {
        data: { current_streak: 5, longest_streak: 20, last_active_date: twoDaysAgo },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.longest_streak).toBe(20);
    });

    it('sets last_active_date to today after reset', async () => {
      mockSelectResult = {
        data: { current_streak: 3, longest_streak: 3, last_active_date: twoDaysAgo },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.last_active_date).toBe(today);
    });

    it('longest_streak increases to 1 if reset produces new max (from 0)', async () => {
      // Edge case: if longest_streak was somehow 0, reset streak=1 becomes new longest=1
      mockSelectResult = {
        data: { current_streak: 0, longest_streak: 0, last_active_date: twoDaysAgo },
        error: null,
      };
      mockUpsertResult = { data: {}, error: null };

      await recordActivity('user-1');
      const [upsertArg] = upsertSpy.mock.calls[0];
      expect(upsertArg.longest_streak).toBe(1);
    });
  });
});

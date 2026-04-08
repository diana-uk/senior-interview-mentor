import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock @supabase/supabase-js ───────────────────────────────────────────────

let mockCreateClient = vi.fn();
const mockClient = { from: vi.fn(), auth: {} };

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    mockCreateClient(...args);
    return mockClient;
  },
}));

const TEST_URL = 'https://test.supabase.co';
const TEST_KEY = 'service-role-key-abc';

// Reset the module cache (clears the `supabase` singleton) and env vars before each test.
beforeEach(() => {
  vi.resetModules();
  mockCreateClient.mockClear();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

afterEach(() => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

// ─── isSupabaseConfigured ─────────────────────────────────────────────────────

describe('isSupabaseConfigured', () => {
  it('returns true when both env vars are set', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { isSupabaseConfigured } = await import('../../../server/db/client.js');
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('returns false when URL is missing', async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { isSupabaseConfigured } = await import('../../../server/db/client.js');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false when SERVICE_ROLE_KEY is missing', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    const { isSupabaseConfigured } = await import('../../../server/db/client.js');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('returns false when neither var is set', async () => {
    const { isSupabaseConfigured } = await import('../../../server/db/client.js');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('reflects env var changes without module reset', async () => {
    const { isSupabaseConfigured } = await import('../../../server/db/client.js');
    expect(isSupabaseConfigured()).toBe(false);
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    expect(isSupabaseConfigured()).toBe(true);
  });
});

// ─── getSupabaseAdmin ─────────────────────────────────────────────────────────

describe('getSupabaseAdmin', () => {
  it('throws when SUPABASE_URL is not set', async () => {
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    expect(() => getSupabaseAdmin()).toThrow('Missing SUPABASE_URL');
  });

  it('throws when SUPABASE_SERVICE_ROLE_KEY is not set', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    expect(() => getSupabaseAdmin()).toThrow();
  });

  it('throws when both env vars are missing', async () => {
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    expect(() => getSupabaseAdmin()).toThrow(Error);
  });

  it('returns a client when env vars are set', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    const result = getSupabaseAdmin();
    expect(result).toBe(mockClient);
  });

  it('calls createClient with URL and key', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    getSupabaseAdmin();
    expect(mockCreateClient).toHaveBeenCalledWith(TEST_URL, TEST_KEY, expect.any(Object));
  });

  it('returns the same instance on repeated calls (singleton)', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    const first = getSupabaseAdmin();
    const second = getSupabaseAdmin();
    expect(first).toBe(second);
  });

  it('only calls createClient once for the singleton', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    getSupabaseAdmin();
    getSupabaseAdmin();
    expect(mockCreateClient).toHaveBeenCalledOnce();
  });

  it('disables session persistence for server client', async () => {
    process.env.SUPABASE_URL = TEST_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_KEY;
    const { getSupabaseAdmin } = await import('../../../server/db/client.js');
    getSupabaseAdmin();
    const [, , options] = mockCreateClient.mock.calls[0] as [unknown, unknown, { auth: { persistSession: boolean } }];
    expect(options.auth.persistSession).toBe(false);
  });
});

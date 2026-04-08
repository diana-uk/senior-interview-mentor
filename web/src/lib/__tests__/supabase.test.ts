import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock @supabase/supabase-js ───────────────────────────────────────────────
// Avoids real network calls and gives us a predictable client object.

let mockCreateClient = vi.fn();
const mockClient = { auth: { onAuthStateChange: vi.fn() } };

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    mockCreateClient(...args);
    return mockClient;
  },
}));

// Module-level vars in supabase.ts are evaluated at import time, so we
// use vi.resetModules() + vi.stubEnv() before each dynamic import.

beforeEach(() => {
  vi.resetModules();
  mockCreateClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const TEST_URL = 'https://test.supabase.co';
const TEST_KEY = 'anon-key-abc';

// ─── supabaseConfigured ───────────────────────────────────────────────────────

describe('supabaseConfigured', () => {
  it('is true when both URL and ANON_KEY are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    const { supabaseConfigured } = await import('../supabase');
    expect(supabaseConfigured).toBe(true);
  });

  it('is false when URL is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');         // override real .env value
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    const { supabaseConfigured } = await import('../supabase');
    expect(supabaseConfigured).toBe(false);
  });

  it('is false when ANON_KEY is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');    // override real .env value
    const { supabaseConfigured } = await import('../supabase');
    expect(supabaseConfigured).toBe(false);
  });

  it('is false when neither var is set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const { supabaseConfigured } = await import('../supabase');
    expect(supabaseConfigured).toBe(false);
  });

  it('is false when URL is an empty string', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    const { supabaseConfigured } = await import('../supabase');
    expect(supabaseConfigured).toBe(false);
  });
});

// ─── supabase client ──────────────────────────────────────────────────────────

describe('supabase', () => {
  it('is null when env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    const { supabase } = await import('../supabase');
    expect(supabase).toBeNull();
  });

  it('is not null when both vars are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    const { supabase } = await import('../supabase');
    expect(supabase).not.toBeNull();
  });

  it('calls createClient when vars are set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    await import('../supabase');
    expect(mockCreateClient).toHaveBeenCalledOnce();
  });

  it('passes URL to createClient', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    await import('../supabase');
    expect(mockCreateClient).toHaveBeenCalledWith(TEST_URL, TEST_KEY, expect.any(Object));
  });

  it('does not call createClient when vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    await import('../supabase');
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns the client from createClient', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', TEST_URL);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', TEST_KEY);
    const { supabase } = await import('../supabase');
    expect(supabase).toBe(mockClient);
  });
});

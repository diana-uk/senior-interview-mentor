import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock posthog-js ──────────────────────────────────────────────────────────
// The mock needs to be lazy (inside vi.fn callbacks) so `mockPosthogInit` is
// accessible when the module is requested after vi.resetModules().

let mockPosthogInit = vi.fn();

vi.mock('posthog-js', () => ({
  default: {
    init: (...args: unknown[]) => mockPosthogInit(...args),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

// vi.resetModules() resets the cache so each dynamic import gets a fresh module
// with `initialized = false`. Mock registrations persist across resets.

beforeEach(() => {
  vi.resetModules();
  mockPosthogInit.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ─── initPostHog ──────────────────────────────────────────────────────────────

describe('initPostHog', () => {
  it('is a no-op when VITE_POSTHOG_KEY is not set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    expect(mockPosthogInit).not.toHaveBeenCalled();
  });

  it('calls posthog.init when VITE_POSTHOG_KEY is set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    expect(mockPosthogInit).toHaveBeenCalledOnce();
  });

  it('passes the key to posthog.init', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    expect(mockPosthogInit).toHaveBeenCalledWith('phc_test_key', expect.any(Object));
  });

  it('passes VITE_POSTHOG_HOST as api_host when set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    vi.stubEnv('VITE_POSTHOG_HOST', 'https://custom.posthog.com');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    const [, options] = mockPosthogInit.mock.calls[0] as [string, { api_host: string }];
    expect(options.api_host).toBe('https://custom.posthog.com');
  });

  it('uses default host when VITE_POSTHOG_HOST is not set', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    vi.stubEnv('VITE_POSTHOG_HOST', '');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    const [, options] = mockPosthogInit.mock.calls[0] as [string, { api_host: string }];
    expect(options.api_host).toBe('https://us.i.posthog.com');
  });

  it('passes autocapture: false to posthog.init', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    const [, options] = mockPosthogInit.mock.calls[0] as [string, { autocapture: boolean }];
    expect(options.autocapture).toBe(false);
  });

  it('is idempotent — calling twice only calls posthog.init once', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { initPostHog } = await import('../posthog');
    initPostHog();
    initPostHog();
    expect(mockPosthogInit).toHaveBeenCalledOnce();
  });
});

// ─── isPostHogInitialized ─────────────────────────────────────────────────────

describe('isPostHogInitialized', () => {
  it('returns false before calling initPostHog', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { isPostHogInitialized } = await import('../posthog');
    expect(isPostHogInitialized()).toBe(false);
  });

  it('returns true after calling initPostHog with a key', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { initPostHog, isPostHogInitialized } = await import('../posthog');
    initPostHog();
    expect(isPostHogInitialized()).toBe(true);
  });

  it('returns false when initPostHog called without a key', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { initPostHog, isPostHogInitialized } = await import('../posthog');
    initPostHog();
    expect(isPostHogInitialized()).toBe(false);
  });
});

// ─── posthog re-export ────────────────────────────────────────────────────────

describe('posthog re-export', () => {
  it('exports posthog from posthog-js', async () => {
    const { posthog } = await import('../posthog');
    expect(posthog).toBeDefined();
  });

  it('exported posthog has an init function', async () => {
    const { posthog } = await import('../posthog');
    expect(typeof posthog.init).toBe('function');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────
// Using `let` (not vi.hoisted) because references inside vi.fn callbacks run
// lazily — the variables are initialized before any test body executes.

let mockSentryInit = vi.fn();
let mockSentryCapture = vi.fn();

vi.mock('@sentry/react', () => ({
  init: (...args: unknown[]) => mockSentryInit(...args),
  captureException: (...args: unknown[]) => mockSentryCapture(...args),
}));

// vi.resetModules() resets the module cache so each dynamic import gets a fresh
// module with `initialized = false`. Mock registrations (vi.mock) persist.
beforeEach(() => {
  vi.resetModules();
  mockSentryInit.mockReset();
  mockSentryCapture.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ─── initSentry ───────────────────────────────────────────────────────────────

describe('initSentry', () => {
  it('is a no-op when VITE_SENTRY_DSN is not set', async () => {
    // Default env has no VITE_SENTRY_DSN
    const { initSentry } = await import('../sentry');
    initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it('calls Sentry.init when VITE_SENTRY_DSN is set', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });

  it('passes the DSN to Sentry.init', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://abc@sentry.io/1' }),
    );
  });

  it('passes environment (import.meta.env.MODE) to Sentry.init', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    // In test mode MODE is 'test'
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ environment: import.meta.env.MODE }),
    );
  });

  it('passes tracesSampleRate to Sentry.init', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    const [callArg] = mockSentryInit.mock.calls[0];
    expect(typeof callArg.tracesSampleRate).toBe('number');
  });

  it('is idempotent — calling twice only initializes once', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });

  it('second call is skipped even after DSN cleared', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry } = await import('../sentry');
    initSentry();
    vi.stubEnv('VITE_SENTRY_DSN', '');
    initSentry(); // already initialized — should not call init again
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });
});

// ─── captureException ─────────────────────────────────────────────────────────

describe('captureException', () => {
  it('is a no-op when not initialized', async () => {
    const { captureException } = await import('../sentry');
    captureException(new Error('test'));
    expect(mockSentryCapture).not.toHaveBeenCalled();
  });

  it('calls Sentry.captureException when initialized', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry, captureException } = await import('../sentry');
    initSentry();
    captureException(new Error('boom'));
    expect(mockSentryCapture).toHaveBeenCalledOnce();
  });

  it('passes the error to Sentry.captureException', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
    const { initSentry, captureException } = await import('../sentry');
    initSentry();
    const err = new Error('specific error');
    captureException(err);
    expect(mockSentryCapture).toHaveBeenCalledWith(err);
  });
});

// ─── Sentry re-export ─────────────────────────────────────────────────────────

describe('Sentry re-export', () => {
  it('exports Sentry namespace from @sentry/react', async () => {
    const { Sentry } = await import('../sentry');
    expect(Sentry).toBeDefined();
  });

  it('exported Sentry has captureException function', async () => {
    const { Sentry } = await import('../sentry');
    expect(typeof Sentry.captureException).toBe('function');
  });
});

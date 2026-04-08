import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock @sentry/node and config ─────────────────────────────────────────────
// These are referenced inside vi.fn() callbacks (lazy), so plain `let` works.

let mockSentryInit = vi.fn();
let mockSentryCapture = vi.fn();

const mockConfig = { sentryDsn: '', nodeEnv: 'test' };

vi.mock('@sentry/node', () => ({
  init: (...args: unknown[]) => mockSentryInit(...args),
  captureException: (...args: unknown[]) => mockSentryCapture(...args),
}));

vi.mock('../../../server/config.js', () => ({
  config: mockConfig,
}));

// Re-import sentry.js after each test to reset the `initialized` flag.
// vi.resetModules() clears the module cache so a fresh module is imported with
// `initialized = false`. Mock registrations (vi.mock) persist across resets.

beforeEach(() => {
  vi.resetModules();
  mockSentryInit.mockReset();
  mockSentryCapture.mockReset();
  mockConfig.sentryDsn = '';
  mockConfig.nodeEnv = 'test';
});

// ─── initSentry ───────────────────────────────────────────────────────────────

describe('initSentry', () => {
  it('is a no-op when sentryDsn is empty', async () => {
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
  });

  it('calls Sentry.init when sentryDsn is set', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });

  it('passes dsn to Sentry.init', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://abc@sentry.io/1' }),
    );
  });

  it('passes nodeEnv as environment to Sentry.init', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    mockConfig.nodeEnv = 'staging';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ environment: 'staging' }),
    );
  });

  it('sets tracesSampleRate to 0.2 in production', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    mockConfig.nodeEnv = 'production';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ tracesSampleRate: 0.2 }),
    );
  });

  it('sets tracesSampleRate to 1.0 in non-production', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    mockConfig.nodeEnv = 'development';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({ tracesSampleRate: 1.0 }),
    );
  });

  it('is idempotent — calling twice only initializes once', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });

  it('second call with no DSN after first successful init remains initialized', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry } = await import('../../../server/lib/sentry.js');
    initSentry();
    mockConfig.sentryDsn = ''; // cleared after first init
    initSentry();             // second call is guarded by `initialized` flag
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });
});

// ─── captureException ─────────────────────────────────────────────────────────

describe('captureException', () => {
  it('is a no-op when not initialized', async () => {
    const { captureException } = await import('../../../server/lib/sentry.js');
    captureException(new Error('test'));
    expect(mockSentryCapture).not.toHaveBeenCalled();
  });

  it('calls Sentry.captureException when initialized', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry, captureException } = await import('../../../server/lib/sentry.js');
    initSentry();
    captureException(new Error('boom'));
    expect(mockSentryCapture).toHaveBeenCalledOnce();
  });

  it('passes the error to Sentry.captureException', async () => {
    mockConfig.sentryDsn = 'https://abc@sentry.io/1';
    const { initSentry, captureException } = await import('../../../server/lib/sentry.js');
    initSentry();
    const err = new Error('boom');
    captureException(err);
    expect(mockSentryCapture).toHaveBeenCalledWith(err);
  });
});

// ─── Sentry re-export ─────────────────────────────────────────────────────────

describe('Sentry re-export', () => {
  it('exports Sentry namespace from @sentry/node', async () => {
    const { Sentry } = await import('../../../server/lib/sentry.js');
    expect(Sentry).toBeDefined();
  });

  it('exported Sentry has captureException function', async () => {
    const { Sentry } = await import('../../../server/lib/sentry.js');
    expect(typeof Sentry.captureException).toBe('function');
  });
});

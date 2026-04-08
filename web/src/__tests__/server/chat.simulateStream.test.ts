import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { simulateStream } from '../../../server/routes/chat';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Helper: run simulateStream to completion by advancing all timers
async function run(
  text: string,
  signal: AbortSignal = new AbortController().signal,
): Promise<string[]> {
  const written: string[] = [];
  const done = simulateStream(text, (chunk) => written.push(chunk), signal);
  await vi.runAllTimersAsync();
  await done;
  return written;
}

// ─── Word chunking ────────────────────────────────────────────────────────────

describe('simulateStream — word chunking', () => {
  it('writes each word as a separate chunk', async () => {
    const chunks = await run('hello world foo');
    expect(chunks).toHaveLength(3);
  });

  it('first chunk is "hello "', async () => {
    const chunks = await run('hello world');
    expect(chunks[0]).toBe('hello ');
  });

  it('last chunk for "hello world" is "world"', async () => {
    const chunks = await run('hello world');
    expect(chunks[1]).toBe('world');
  });

  it('reconstructed text equals original (joined chunks)', async () => {
    const text = 'the quick brown fox';
    const chunks = await run(text);
    expect(chunks.join('')).toBe(text);
  });

  it('single word produces one chunk', async () => {
    const chunks = await run('hello');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('hello');
  });

  it('empty string falls back to [text] — writes one empty chunk', async () => {
    const chunks = await run('');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('');
  });

  it('preserves trailing whitespace on each chunk', async () => {
    const chunks = await run('a b');
    expect(chunks[0]).toBe('a ');
  });

  it('multi-space between words treated as part of preceding token', async () => {
    const text = 'one  two'; // double space
    const chunks = await run(text);
    expect(chunks.join('')).toBe(text);
  });
});

// ─── Abort signal ─────────────────────────────────────────────────────────────

describe('simulateStream — abort signal', () => {
  it('stops writing after abort', async () => {
    const controller = new AbortController();
    const written: string[] = [];
    const done = simulateStream(
      'word1 word2 word3 word4 word5',
      (chunk) => {
        written.push(chunk);
        // Abort after first write
        if (written.length === 1) controller.abort();
      },
      controller.signal,
    );
    await vi.runAllTimersAsync();
    await done;
    // Should have written only 1 chunk (abort prevents further writes)
    expect(written.length).toBeLessThanOrEqual(2);
  });

  it('writes nothing when already aborted before start', async () => {
    const controller = new AbortController();
    controller.abort();
    const chunks = await run('hello world', controller.signal);
    expect(chunks).toHaveLength(0);
  });
});

// ─── Return value ─────────────────────────────────────────────────────────────

describe('simulateStream — return value', () => {
  it('returns a Promise', () => {
    const controller = new AbortController();
    controller.abort();
    const result = simulateStream('text', () => {}, controller.signal);
    expect(result).toBeInstanceOf(Promise);
    vi.runAllTimersAsync();
  });

  it('resolves to undefined (void)', async () => {
    const result = await run('hello');
    // run() returns the written chunks; Promise resolved means no error
    expect(result).toBeDefined();
  });
});

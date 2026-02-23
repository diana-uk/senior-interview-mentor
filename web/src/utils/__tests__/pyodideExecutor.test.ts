import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for pyodideExecutor.ts
 *
 * The module creates a blob-based Web Worker singleton that loads Pyodide.
 * We mock the Worker constructor so no real worker is created.
 * Each test gets a fresh module instance via vi.resetModules() + dynamic import.
 */

// ─── Mock Worker ───────────────────────────────────────────────────────────

type MessageHandler = (e: MessageEvent) => void;

/** All worker instances created during a test, most recent last */
let workerInstances: MockWorker[] = [];

class MockWorker {
  /** Captured messages sent via postMessage */
  messages: Array<{ type: string; code?: string; testInput?: string }> = [];
  private listeners: MessageHandler[] = [];
  terminated = false;

  constructor() {
    workerInstances.push(this);
  }

  postMessage(data: unknown): void {
    this.messages.push(data as { type: string; code?: string; testInput?: string });
  }

  addEventListener(_event: string, handler: MessageHandler): void {
    if (_event === 'message') {
      this.listeners.push(handler);
    }
  }

  removeEventListener(_event: string, handler: MessageHandler): void {
    if (_event === 'message') {
      this.listeners = this.listeners.filter((h) => h !== handler);
    }
  }

  terminate(): void {
    this.terminated = true;
  }

  /** Simulate the worker posting a message back */
  simulateMessage(data: unknown): void {
    const event = { data } as MessageEvent;
    [...this.listeners].forEach((h) => h(event));
  }
}

function lastWorker(): MockWorker {
  return workerInstances[workerInstances.length - 1];
}

/** Flush pending microtasks so async continuations run */
function flushMicrotasks(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

// ─── Setup ─────────────────────────────────────────────────────────────────

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  vi.resetModules();
  workerInstances = [];

  // Mock URL.createObjectURL and revokeObjectURL
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();

  // Mock Worker constructor with a real class
  vi.stubGlobal('Worker', MockWorker);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

/** Import a fresh module instance (resets the singleton state) */
async function freshImport() {
  return await import('../pyodideExecutor');
}

/** Helper: complete init + run cycle for a call */
async function completeInitAndRun(
  worker: MockWorker,
  result?: string,
  logs: Array<{ type: string; message: string }> = [],
): Promise<void> {
  worker.simulateMessage({ type: 'ready' });
  await flushMicrotasks();
  worker.simulateMessage({ type: 'result', result, logs });
}

// ─── isPyodideReady ────────────────────────────────────────────────────────

describe('isPyodideReady', () => {
  it('returns false initially before any initialization', async () => {
    const { isPyodideReady } = await freshImport();
    expect(isPyodideReady()).toBe(false);
  });

  it('returns true after successful initialization', async () => {
    const { isPyodideReady, runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('pass', '');
    await completeInitAndRun(lastWorker());
    await promise;

    expect(isPyodideReady()).toBe(true);
  });

  it('returns false after worker is destroyed by timeout', async () => {
    vi.useFakeTimers();
    const { isPyodideReady, runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('pass', '');

    // Worker becomes ready (init succeeds)
    lastWorker().simulateMessage({ type: 'ready' });

    // Advance past the 10s execution timeout (this also flushes microtasks)
    await vi.advanceTimersByTimeAsync(10_000);

    const result = await promise;
    expect(result.error).toContain('timed out');
    expect(isPyodideReady()).toBe(false);
  });
});

// ─── ensureInitialized (tested via runPythonInWorker) ──────────────────────

describe('ensureInitialized', () => {
  it('creates a Worker and sends an init message', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', '');

    // A worker should have been created
    expect(workerInstances).toHaveLength(1);
    // The first message should be an init message
    expect(lastWorker().messages[0]).toEqual({ type: 'init' });

    // Complete the flow
    await completeInitAndRun(lastWorker());
    await promise;
  });

  it('reuses the init promise on second call (singleton)', async () => {
    const { runPythonInWorker } = await freshImport();

    // Start two concurrent calls
    const p1 = runPythonInWorker('a = 1', '');
    const p2 = runPythonInWorker('b = 2', '');

    // Only one Worker should have been created
    expect(workerInstances).toHaveLength(1);

    // Only one init message should be sent
    const initMessages = lastWorker().messages.filter((m) => m.type === 'init');
    expect(initMessages).toHaveLength(1);

    // Complete the init
    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    // Complete both runs
    lastWorker().simulateMessage({ type: 'result', result: 'r1', logs: [] });
    lastWorker().simulateMessage({ type: 'result', result: 'r2', logs: [] });

    await Promise.all([p1, p2]);
  });

  it('rejects when the worker posts an init-error message', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('code', '');

    // Simulate init failure
    lastWorker().simulateMessage({
      type: 'init-error',
      error: 'Network error: could not fetch pyodide.js',
    });

    await expect(promise).rejects.toThrow('Network error: could not fetch pyodide.js');
  });

  it('rejects when init times out (30s)', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('code', '');

    // Attach a no-op catch so the rejection is "handled" before the timer fires,
    // preventing Vitest from flagging it as an unhandled rejection.
    promise.catch(() => {});

    // Advance past the 30s init timeout without sending a ready message
    await vi.advanceTimersByTimeAsync(30_000);

    await expect(promise).rejects.toThrow('Pyodide initialization timed out (30s)');
  });

  it('skips init when already initialized', async () => {
    const { runPythonInWorker } = await freshImport();

    // First call: init + run
    const p1 = runPythonInWorker('a = 1', '');
    await completeInitAndRun(lastWorker(), '1');
    await p1;

    // Clear messages to track second call
    lastWorker().messages = [];

    // Second call: should skip init
    const p2 = runPythonInWorker('b = 2', '');

    // ensureInitialized returns Promise.resolve() when workerReady is true,
    // but the code after await still defers. Flush microtasks so postMessage fires.
    await flushMicrotasks();

    // Should NOT have sent another init message
    const initMessages = lastWorker().messages.filter((m) => m.type === 'init');
    expect(initMessages).toHaveLength(0);

    // Should have sent a run message directly
    const runMessages = lastWorker().messages.filter((m) => m.type === 'run');
    expect(runMessages).toHaveLength(1);

    lastWorker().simulateMessage({ type: 'result', result: '2', logs: [] });
    await p2;
  });
});

// ─── runPythonInWorker ─────────────────────────────────────────────────────

describe('runPythonInWorker', () => {
  it('sends run message with code and testInput after init', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('def add(a, b): return a + b', 'add(1, 2)');

    // Complete init
    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    // Find the run message
    const runMsg = lastWorker().messages.find((m) => m.type === 'run');
    expect(runMsg).toEqual({
      type: 'run',
      code: 'def add(a, b): return a + b',
      testInput: 'add(1, 2)',
    });

    // Complete the run
    lastWorker().simulateMessage({ type: 'result', result: '3', logs: [] });
    await promise;
  });

  it('resolves with result and logs on success', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 42', 'x');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    lastWorker().simulateMessage({
      type: 'result',
      result: '42',
      logs: [{ type: 'log', message: 'hello from print' }],
    });

    const output = await promise;
    expect(output.result).toBe('42');
    expect(output.logs).toEqual([{ type: 'log', message: 'hello from print' }]);
    expect(output.error).toBeUndefined();
  });

  it('resolves with stdout logs (print output)', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('print("line1")\nprint("line2")', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    lastWorker().simulateMessage({
      type: 'result',
      result: undefined,
      logs: [
        { type: 'log', message: 'line1' },
        { type: 'log', message: 'line2' },
      ],
    });

    const output = await promise;
    expect(output.logs).toHaveLength(2);
    expect(output.logs[0]).toEqual({ type: 'log', message: 'line1' });
    expect(output.logs[1]).toEqual({ type: 'log', message: 'line2' });
  });

  it('resolves with stderr logs (warn type)', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('import sys; sys.stderr.write("warning")', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    lastWorker().simulateMessage({
      type: 'result',
      result: undefined,
      logs: [{ type: 'warn', message: 'warning' }],
    });

    const output = await promise;
    expect(output.logs).toHaveLength(1);
    expect(output.logs[0]).toEqual({ type: 'warn', message: 'warning' });
  });

  it('resolves with error on runtime error', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('1 / 0', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    lastWorker().simulateMessage({
      type: 'result',
      logs: [{ type: 'error', message: 'ZeroDivisionError: division by zero' }],
      error: 'ZeroDivisionError: division by zero',
    });

    const output = await promise;
    expect(output.error).toBe('ZeroDivisionError: division by zero');
    expect(output.logs).toHaveLength(1);
    expect(output.logs[0].type).toBe('error');
  });

  it('resolves with default empty logs when worker sends no logs', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', 'x');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    // Worker sends result without a logs array
    lastWorker().simulateMessage({
      type: 'result',
      result: '1',
    });

    const output = await promise;
    expect(output.logs).toEqual([]);
  });

  it('handles empty code string', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    const runMsg = lastWorker().messages.find((m) => m.type === 'run');
    expect(runMsg).toEqual({ type: 'run', code: '', testInput: '' });

    lastWorker().simulateMessage({ type: 'result', result: undefined, logs: [] });

    const output = await promise;
    expect(output.logs).toEqual([]);
    expect(output.error).toBeUndefined();
  });

  it('handles code with only whitespace', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('   \n\t  ', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    const runMsg = lastWorker().messages.find((m) => m.type === 'run');
    expect(runMsg!.code).toBe('   \n\t  ');

    lastWorker().simulateMessage({ type: 'result', result: undefined, logs: [] });
    const output = await promise;
    expect(output.error).toBeUndefined();
  });

  it('passes result as undefined when worker sends no result field', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('print("hello")', '');

    lastWorker().simulateMessage({ type: 'ready' });
    await flushMicrotasks();

    lastWorker().simulateMessage({
      type: 'result',
      logs: [{ type: 'log', message: 'hello' }],
    });

    const output = await promise;
    expect(output.result).toBeUndefined();
  });
});

// ─── Timeout handling ──────────────────────────────────────────────────────

describe('execution timeout', () => {
  it('resolves with timeout error after 10s', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('while True: pass', '');

    // Complete init
    lastWorker().simulateMessage({ type: 'ready' });

    // Advance past the 10s execution timeout
    await vi.advanceTimersByTimeAsync(10_000);

    const output = await promise;
    expect(output.error).toContain('timed out');
    expect(output.error).toContain('10s');
    expect(output.logs).toHaveLength(1);
    expect(output.logs[0].type).toBe('error');
    expect(output.logs[0].message).toContain('timed out');
  });

  it('terminates the worker on timeout', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('while True: pass', '');

    const workerRef = lastWorker();
    workerRef.simulateMessage({ type: 'ready' });

    await vi.advanceTimersByTimeAsync(10_000);
    await promise;

    expect(workerRef.terminated).toBe(true);
  });

  it('ignores late worker result after timeout', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('slow_code()', '');

    lastWorker().simulateMessage({ type: 'ready' });
    const workerRef = lastWorker();

    // Timeout fires
    await vi.advanceTimersByTimeAsync(10_000);
    const output = await promise;
    expect(output.error).toContain('timed out');

    // Late result arrives — should not throw or change anything
    workerRef.simulateMessage({ type: 'result', result: 'late', logs: [] });
  });

  it('does not timeout if result arrives before 10s', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', 'x');

    lastWorker().simulateMessage({ type: 'ready' });

    // Advance 5s (before the 10s timeout), then simulate result
    await vi.advanceTimersByTimeAsync(5_000);
    lastWorker().simulateMessage({ type: 'result', result: '1', logs: [] });

    const output = await promise;
    expect(output.result).toBe('1');
    expect(output.error).toBeUndefined();

    // Advance well past the timeout — should not affect anything
    await vi.advanceTimersByTimeAsync(10_000);
  });
});

// ─── Worker destruction & recovery ─────────────────────────────────────────

describe('worker destruction and recovery', () => {
  it('creates a new worker after timeout destroys the old one', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    // First call: will time out
    const p1 = runPythonInWorker('while True: pass', '');
    const firstWorker = lastWorker();
    firstWorker.simulateMessage({ type: 'ready' });

    await vi.advanceTimersByTimeAsync(10_000);
    await p1;
    expect(firstWorker.terminated).toBe(true);

    // Second call: should create a new worker
    const p2 = runPythonInWorker('x = 1', 'x');

    const secondWorker = lastWorker();
    expect(secondWorker).not.toBe(firstWorker);
    expect(workerInstances).toHaveLength(2);

    // Complete the second call
    secondWorker.simulateMessage({ type: 'ready' });
    await vi.advanceTimersByTimeAsync(0);
    secondWorker.simulateMessage({ type: 'result', result: '1', logs: [] });
    await p2;
  });

  it('requires re-initialization after timeout destroys worker', async () => {
    vi.useFakeTimers();
    const { runPythonInWorker } = await freshImport();

    // First call times out
    const p1 = runPythonInWorker('slow()', '');
    lastWorker().simulateMessage({ type: 'ready' });
    await vi.advanceTimersByTimeAsync(10_000);
    await p1;

    // Second call should send a new init message
    const p2 = runPythonInWorker('x = 1', 'x');

    const newWorker = lastWorker();
    const initMessages = newWorker.messages.filter((m) => m.type === 'init');
    expect(initMessages).toHaveLength(1);

    newWorker.simulateMessage({ type: 'ready' });
    await vi.advanceTimersByTimeAsync(0);
    newWorker.simulateMessage({ type: 'result', result: '1', logs: [] });
    await p2;
  });
});

// ─── Worker creation details ───────────────────────────────────────────────

describe('worker creation', () => {
  it('creates a blob with application/javascript type', async () => {
    const blobSpy = vi.spyOn(globalThis, 'Blob');
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', '');

    expect(blobSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('self.onmessage')]),
      { type: 'application/javascript' },
    );

    await completeInitAndRun(lastWorker());
    await promise;
    blobSpy.mockRestore();
  });

  it('calls URL.createObjectURL and URL.revokeObjectURL', async () => {
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', '');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    await completeInitAndRun(lastWorker());
    await promise;
  });

  it('reuses existing worker on subsequent calls', async () => {
    const { runPythonInWorker } = await freshImport();

    // First call
    const p1 = runPythonInWorker('a = 1', '');
    await completeInitAndRun(lastWorker(), '1');
    await p1;

    // Second call should NOT create a new worker
    const p2 = runPythonInWorker('b = 2', '');
    await flushMicrotasks();
    expect(workerInstances).toHaveLength(1);

    lastWorker().simulateMessage({ type: 'result', result: '2', logs: [] });
    await p2;
  });

  it('worker code includes the Pyodide CDN URL', async () => {
    const blobSpy = vi.spyOn(globalThis, 'Blob');
    const { runPythonInWorker } = await freshImport();

    const promise = runPythonInWorker('x = 1', '');

    const blobContent = blobSpy.mock.calls[0][0]![0] as string;
    expect(blobContent).toContain('cdn.jsdelivr.net/pyodide');
    expect(blobContent).toContain('importScripts');
    expect(blobContent).toContain('loadPyodide');

    await completeInitAndRun(lastWorker());
    await promise;
    blobSpy.mockRestore();
  });
});

// Web Worker for sandboxed code execution
// Runs user code in an isolated context with no access to DOM, window, or parent scope

interface WorkerInput {
  code: string;       // Stripped JS code (no TypeScript)
  testInput?: string;  // Expression to invoke (e.g., "twoSum([2,7,11,15], 9)")
  testInputs?: string[]; // Batch mode: multiple test expressions
}

interface LogEntry {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

interface BatchResultEntry {
  result?: string;
  error?: string;
}

interface WorkerOutput {
  result?: string;
  logs: LogEntry[];
  error?: string;
  results?: BatchResultEntry[];
}

function fmt(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') {
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
  }
  return String(v);
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { code, testInput, testInputs } = e.data;

  if (testInputs) {
    // BATCH MODE — define code once, run each test input individually
    try {
      const testCaseCode = testInputs.map((input, i) =>
        `try { __results[${i}] = { result: JSON.stringify(${input}) }; }` +
        ` catch(__e${i}) { __results[${i}] = { error: __e${i} instanceof Error ? __e${i}.message : 'Runtime error' }; }`
      ).join('\n');

      const wrappedCode = `
        var __logs = [];
        var __fmt = ${fmt.toString()};
        var console = {
          log: function() { var a = [].slice.call(arguments); __logs.push({ type: 'log', message: a.map(__fmt).join(' ') }); },
          warn: function() { var a = [].slice.call(arguments); __logs.push({ type: 'warn', message: a.map(__fmt).join(' ') }); },
          error: function() { var a = [].slice.call(arguments); __logs.push({ type: 'error', message: a.map(__fmt).join(' ') }); },
          info: function() { var a = [].slice.call(arguments); __logs.push({ type: 'info', message: a.map(__fmt).join(' ') }); },
        };
        ${code}
        var __results = [];
        ${testCaseCode}
        return { results: __results, logs: __logs };
      `;

      const fn = new Function(wrappedCode);
      const output = fn() as { results: BatchResultEntry[]; logs: LogEntry[] };

      self.postMessage({
        results: output.results,
        logs: output.logs,
      } satisfies WorkerOutput);
    } catch (err: unknown) {
      // Code definition itself failed — all tests fail with same error
      const message = err instanceof Error ? err.message : 'Runtime error';
      const logs: LogEntry[] = [{ type: 'error', message }];
      self.postMessage({
        results: testInputs.map(() => ({ error: message })),
        logs,
        error: message,
      } satisfies WorkerOutput);
    }
  } else {
    // SINGLE MODE — unchanged (used by executeFreeform)
    const logs: LogEntry[] = [];
    try {
      const wrappedCode = `
        var __logs = [];
        var __fmt = ${fmt.toString()};
        var console = {
          log: function() { var a = [].slice.call(arguments); __logs.push({ type: 'log', message: a.map(__fmt).join(' ') }); },
          warn: function() { var a = [].slice.call(arguments); __logs.push({ type: 'warn', message: a.map(__fmt).join(' ') }); },
          error: function() { var a = [].slice.call(arguments); __logs.push({ type: 'error', message: a.map(__fmt).join(' ') }); },
          info: function() { var a = [].slice.call(arguments); __logs.push({ type: 'info', message: a.map(__fmt).join(' ') }); },
        };
        ${code}
        return { result: JSON.stringify(${testInput}), logs: __logs };
      `;

      const fn = new Function(wrappedCode);
      const output = fn() as { result: string; logs: LogEntry[] };

      self.postMessage({
        result: output.result,
        logs: output.logs,
      } satisfies WorkerOutput);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Runtime error';
      logs.push({ type: 'error', message });
      self.postMessage({
        logs,
        error: message,
      } satisfies WorkerOutput);
    }
  }
};

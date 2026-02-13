// Web Worker for sandboxed code execution
// Runs user code in an isolated context with no access to DOM, window, or parent scope

interface WorkerInput {
  code: string;       // Stripped JS code (no TypeScript)
  testInput: string;  // Expression to invoke (e.g., "twoSum([2,7,11,15], 9)")
}

interface LogEntry {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

interface WorkerOutput {
  result?: string;
  logs: LogEntry[];
  error?: string;
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
  const { code, testInput } = e.data;
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

    // eslint-disable-next-line no-new-func
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
};

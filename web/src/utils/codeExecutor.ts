import type { TestCase, ConsoleMessage } from '../types';
import { stripTypeAnnotations } from './stripTypes';
import ExecutorWorker from './executor.worker?worker';

const EXECUTION_TIMEOUT_MS = 10_000; // 10 seconds per test case

interface WorkerOutput {
  result?: string;
  logs: ConsoleMessage[];
  error?: string;
}

/** Run a single test case inside a Web Worker with a timeout. */
function runInWorker(code: string, testInput: string): Promise<WorkerOutput> {
  return new Promise((resolve) => {
    const worker = new ExecutorWorker();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        resolve({
          logs: [{ type: 'error', message: `Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit)` }],
          error: `Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit)`,
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve(e.data);
      }
    };

    worker.onerror = (e) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve({
          logs: [{ type: 'error', message: e.message || 'Worker error' }],
          error: e.message || 'Worker error',
        });
      }
    };

    worker.postMessage({ code, testInput });
  });
}

/** Compare expected vs actual result, handling array order independence. */
function compareResults(actual: string, expected: string): boolean {
  try {
    const expectedParsed = JSON.parse(expected);
    const actualParsed = JSON.parse(actual);
    if (Array.isArray(expectedParsed) && Array.isArray(actualParsed)) {
      return (
        JSON.stringify([...expectedParsed].sort()) ===
        JSON.stringify([...actualParsed].sort())
      );
    }
    return JSON.stringify(expectedParsed) === JSON.stringify(actualParsed);
  } catch {
    return actual.replace(/\s/g, '') === expected.replace(/\s/g, '');
  }
}

/** Execute all test cases in sandboxed Web Workers. */
export async function executeTests(
  code: string,
  testCases: TestCase[],
): Promise<{ results: TestCase[]; logs: ConsoleMessage[] }> {
  const jsCode = stripTypeAnnotations(code);
  const allLogs: ConsoleMessage[] = [];

  const results = await Promise.all(
    testCases.map(async (tc) => {
      const output = await runInWorker(jsCode, tc.input);
      allLogs.push(...output.logs);

      if (output.error) {
        return { ...tc, actual: `Error: ${output.error}`, passed: false };
      }

      const actual = String(output.result ?? '');
      const passed = compareResults(actual, tc.expected);
      return { ...tc, actual, passed };
    }),
  );

  return { results, logs: allLogs };
}

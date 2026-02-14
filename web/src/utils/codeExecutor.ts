import type { TestCase, ConsoleMessage, SupportedLanguage } from '../types';
import { stripTypeAnnotations } from './stripTypes';
import ExecutorWorker from './executor.worker?worker';
import { runPythonInWorker } from './pyodideExecutor';
import { extractPythonFuncName, toPythonTestInput } from './pythonTestAdapter';

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

/** Execute JS/TS test cases in sandboxed Web Workers. */
async function executeJsTests(
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

/**
 * Convert a JS test input to Python test input.
 * Uses the code to extract function names for replacement.
 */
function convertTestInputToPython(jsInput: string, pythonCode: string): string {
  // Extract the JS function name from the test input (first identifier before parenthesis)
  const callMatch = jsInput.match(/^([a-zA-Z_$][\w$]*)\s*\(/);
  if (!callMatch) return jsInput; // Can't parse, return as-is

  const jsFuncName = callMatch[1];
  const pyFuncName = extractPythonFuncName(pythonCode) ?? jsFuncName;

  return toPythonTestInput(jsInput, jsFuncName, pyFuncName);
}

/** Execute Python test cases via Pyodide Web Worker. */
async function executePythonTests(
  code: string,
  testCases: TestCase[],
): Promise<{ results: TestCase[]; logs: ConsoleMessage[] }> {
  const allLogs: ConsoleMessage[] = [];

  // Run test cases sequentially (Pyodide worker is single-threaded, shared state)
  const results: TestCase[] = [];
  for (const tc of testCases) {
    const pyTestInput = convertTestInputToPython(tc.input, code);
    const output = await runPythonInWorker(code, pyTestInput);
    allLogs.push(...output.logs);

    if (output.error) {
      results.push({ ...tc, actual: `Error: ${output.error}`, passed: false });
    } else {
      const actual = String(output.result ?? '');
      const passed = compareResults(actual, tc.expected);
      results.push({ ...tc, actual, passed });
    }
  }

  return { results, logs: allLogs };
}

/** Execute all test cases in sandboxed Web Workers. Routes to JS or Python executor. */
export async function executeTests(
  code: string,
  testCases: TestCase[],
  language: SupportedLanguage = 'typescript',
): Promise<{ results: TestCase[]; logs: ConsoleMessage[] }> {
  if (language === 'python') {
    return executePythonTests(code, testCases);
  }
  return executeJsTests(code, testCases);
}

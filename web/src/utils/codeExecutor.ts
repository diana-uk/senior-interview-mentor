import type { TestCase, ConsoleMessage, SupportedLanguage } from '../types';
import { stripTypeAnnotations } from './stripTypes';
import ExecutorWorker from './executor.worker?worker';
import { runPythonInWorker, runPythonBatchInWorker } from './pyodideExecutor';
import { extractPythonFuncName, toPythonTestInput } from './pythonTestAdapter';

const EXECUTION_TIMEOUT_MS = 10_000; // 10 seconds per test case

interface BatchResultEntry {
  result?: string;
  error?: string;
}

interface WorkerOutput {
  result?: string;
  logs: ConsoleMessage[];
  error?: string;
  results?: BatchResultEntry[];
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

/** Run all test cases in a single Web Worker with a timeout. Code is defined once. */
function runBatchInWorker(
  code: string,
  testInputs: string[],
): Promise<{ results: BatchResultEntry[]; logs: ConsoleMessage[] }> {
  return new Promise((resolve) => {
    const worker = new ExecutorWorker();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        worker.terminate();
        const error = `Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit)`;
        resolve({
          results: testInputs.map(() => ({ error })),
          logs: [{ type: 'error', message: error }],
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<WorkerOutput>) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        resolve({
          results: e.data.results ?? testInputs.map(() => ({ error: 'No result' })),
          logs: e.data.logs ?? [],
        });
      }
    };

    worker.onerror = (e) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        worker.terminate();
        const error = e.message || 'Worker error';
        resolve({
          results: testInputs.map(() => ({ error })),
          logs: [{ type: 'error', message: error }],
        });
      }
    };

    worker.postMessage({ code, testInputs });
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

/** Execute JS/TS test cases in a single sandboxed Web Worker (batch mode). */
async function executeJsTests(
  code: string,
  testCases: TestCase[],
): Promise<{ results: TestCase[]; logs: ConsoleMessage[] }> {
  const jsCode = stripTypeAnnotations(code);
  const testInputs = testCases.map((tc) => tc.input);
  const batch = await runBatchInWorker(jsCode, testInputs);

  const results = testCases.map((tc, i) => {
    const entry = batch.results[i];
    if (entry?.error) {
      return { ...tc, actual: `Error: ${entry.error}`, passed: false };
    }
    const actual = String(entry?.result ?? '');
    const passed = compareResults(actual, tc.expected);
    return { ...tc, actual, passed };
  });

  return { results, logs: batch.logs };
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

/** Execute Python test cases via Pyodide Web Worker (batch mode). */
async function executePythonTests(
  code: string,
  testCases: TestCase[],
): Promise<{ results: TestCase[]; logs: ConsoleMessage[] }> {
  const testInputs = testCases.map((tc) => convertTestInputToPython(tc.input, code));
  const batch = await runPythonBatchInWorker(code, testInputs);

  const results = testCases.map((tc, i) => {
    const entry = batch.results[i];
    if (entry?.error) {
      return { ...tc, actual: `Error: ${entry.error}`, passed: false };
    }
    const actual = String(entry?.result ?? '');
    const passed = compareResults(actual, tc.expected);
    return { ...tc, actual, passed };
  });

  return { results, logs: batch.logs };
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

/**
 * Parse test tab content into structured TestCase[].
 * Matches lines like: console.log(fn(args)); // expected: value
 */
export function parseTestCode(testCode: string): TestCase[] {
  const results: TestCase[] = [];
  const pattern = /^\s*console\.log\(\s*(.+?)\s*\)\s*;?\s*\/\/\s*expected:\s*(.+?)\s*$/;

  for (const line of testCode.split('\n')) {
    const match = line.match(pattern);
    if (match) {
      results.push({ input: match[1], expected: match[2] });
    }
  }
  return results;
}

/**
 * Run solution + test code concatenated (freeform execution).
 * Used when no structured test cases can be parsed from the Tests tab.
 */
export async function executeFreeform(
  code: string,
  testCode: string,
  language: SupportedLanguage = 'typescript',
): Promise<{ logs: ConsoleMessage[] }> {
  if (language === 'python') {
    const combined = code + '\n' + testCode;
    const output = await runPythonInWorker(combined, '');
    return { logs: output.logs };
  }
  const combined = stripTypeAnnotations(code + '\n' + testCode);
  const output = await runInWorker(combined, '');
  return { logs: output.logs };
}

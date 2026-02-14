/**
 * Pyodide Web Worker executor.
 * Lazy-loads Pyodide from CDN in a blob-based classic Web Worker.
 * The ~10MB WASM download is cached by the browser after first load.
 */

import type { ConsoleMessage } from '../types';

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/';
const EXECUTION_TIMEOUT_MS = 10_000;

export interface PythonWorkerOutput {
  result?: string;
  logs: ConsoleMessage[];
  error?: string;
}

// Reuse a single worker across calls (Pyodide init is expensive)
let workerInstance: Worker | null = null;
let workerReady = false;
let initPromise: Promise<void> | null = null;

const WORKER_CODE = `
// Classic Web Worker — no ESM, use importScripts
var pyodide = null;

async function initPyodide() {
  if (pyodide) return;
  importScripts('${PYODIDE_CDN}pyodide.js');
  pyodide = await loadPyodide({ indexURL: '${PYODIDE_CDN}' });
}

self.onmessage = async function(e) {
  var msg = e.data;

  if (msg.type === 'init') {
    try {
      await initPyodide();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'init-error', error: err.message || 'Failed to load Pyodide' });
    }
    return;
  }

  if (msg.type === 'run') {
    var logs = [];
    try {
      // Redirect stdout/stderr to capture print output
      pyodide.runPython(\`
import sys, io
__stdout_capture = io.StringIO()
__stderr_capture = io.StringIO()
sys.stdout = __stdout_capture
sys.stderr = __stderr_capture
\`);

      // Define user functions
      pyodide.runPython(msg.code);

      // Run the test expression and get result
      var result;
      if (msg.testInput) {
        var pyResult = pyodide.runPython('import json; json.dumps(' + msg.testInput + ')');
        result = pyResult;
      }

      // Capture stdout
      var stdout = pyodide.runPython('__stdout_capture.getvalue()');
      if (stdout) {
        stdout.split('\\n').filter(function(l) { return l.length > 0; }).forEach(function(line) {
          logs.push({ type: 'log', message: line });
        });
      }

      // Capture stderr
      var stderr = pyodide.runPython('__stderr_capture.getvalue()');
      if (stderr) {
        stderr.split('\\n').filter(function(l) { return l.length > 0; }).forEach(function(line) {
          logs.push({ type: 'warn', message: line });
        });
      }

      // Reset stdout/stderr
      pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');

      self.postMessage({ type: 'result', result: result, logs: logs });
    } catch (err) {
      // Reset stdout/stderr on error too
      try { pyodide.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__'); } catch(e) {}
      var errorMsg = err.message || 'Python runtime error';
      logs.push({ type: 'error', message: errorMsg });
      self.postMessage({ type: 'result', logs: logs, error: errorMsg });
    }
  }
};
`;

function getWorker(): Worker {
  if (!workerInstance) {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    workerInstance = new Worker(url);
    URL.revokeObjectURL(url);
  }
  return workerInstance;
}

function ensureInitialized(): Promise<void> {
  if (workerReady) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve, reject) => {
    const worker = getWorker();

    const timeout = setTimeout(() => {
      reject(new Error('Pyodide initialization timed out (30s)'));
    }, 30_000);

    const handler = (e: MessageEvent) => {
      if (e.data.type === 'ready') {
        clearTimeout(timeout);
        workerReady = true;
        worker.removeEventListener('message', handler);
        resolve();
      } else if (e.data.type === 'init-error') {
        clearTimeout(timeout);
        worker.removeEventListener('message', handler);
        reject(new Error(e.data.error));
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'init' });
  });

  return initPromise;
}

/**
 * Run Python code and a test expression in the Pyodide worker.
 * Lazy-initializes Pyodide on first call.
 */
export async function runPythonInWorker(
  code: string,
  testInput: string,
): Promise<PythonWorkerOutput> {
  await ensureInitialized();
  const worker = getWorker();

  return new Promise<PythonWorkerOutput>((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        // Kill and recreate worker on timeout (Pyodide can't be interrupted)
        destroyWorker();
        resolve({
          logs: [{ type: 'error', message: `Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit)` }],
          error: `Execution timed out (${EXECUTION_TIMEOUT_MS / 1000}s limit)`,
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    const handler = (e: MessageEvent) => {
      if (e.data.type === 'result' && !settled) {
        settled = true;
        clearTimeout(timer);
        worker.removeEventListener('message', handler);
        resolve({
          result: e.data.result,
          logs: e.data.logs || [],
          error: e.data.error,
        });
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'run', code, testInput });
  });
}

/** Check if Pyodide is already loaded and ready */
export function isPyodideReady(): boolean {
  return workerReady;
}

/** Destroy the worker (used on timeout or cleanup) */
function destroyWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  workerReady = false;
  initPromise = null;
}

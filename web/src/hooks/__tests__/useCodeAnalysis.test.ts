import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCodeAnalysis } from '../useCodeAnalysis';

const DEBOUNCE_MS = 2000;

describe('useCodeAnalysis', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Helper: render the hook and advance past the debounce so insights populate */
  function renderAndAnalyze(code: string, enabled = true) {
    const hook = renderHook(
      ({ code, enabled }) => useCodeAnalysis(code, enabled),
      { initialProps: { code, enabled } },
    );

    // Flush debounce + any microtask for isAnalyzing
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 50);
    });

    return hook;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Empty / Minimal Code
  // ══════════════════════════════════════════════════════════════════════════

  describe('empty and minimal code', () => {
    it('returns no insights for empty string', () => {
      const { result } = renderAndAnalyze('');
      expect(result.current.insights).toEqual([]);
      expect(result.current.complexity).toBeNull();
    });

    it('returns no insights for very short code', () => {
      const { result } = renderAndAnalyze('x = 1;');
      expect(result.current.insights).toEqual([]);
      expect(result.current.complexity).toBeNull();
    });

    it('returns no insights for whitespace-only code', () => {
      const { result } = renderAndAnalyze('       \n\n\n  ');
      expect(result.current.insights).toEqual([]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Enable / Disable Toggle
  // ══════════════════════════════════════════════════════════════════════════

  describe('enabled toggle', () => {
    it('returns empty results when disabled', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code, false);

      // Flush the setTimeout(0) used when disabled
      act(() => { vi.advanceTimersByTime(10); });

      expect(result.current.insights).toEqual([]);
      expect(result.current.complexity).toBeNull();
      expect(result.current.isAnalyzing).toBe(false);
    });

    it('produces insights when re-enabled', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result, rerender } = renderHook(
        ({ code, enabled }) => useCodeAnalysis(code, enabled),
        { initialProps: { code, enabled: false } },
      );

      // Flush disabled path
      act(() => { vi.advanceTimersByTime(50); });
      expect(result.current.insights).toEqual([]);

      // Re-enable
      rerender({ code, enabled: true });
      act(() => { vi.advanceTimersByTime(DEBOUNCE_MS + 50); });

      expect(result.current.insights.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // isAnalyzing State
  // ══════════════════════════════════════════════════════════════════════════

  describe('isAnalyzing state', () => {
    it('starts false before any code is analyzed', () => {
      const { result } = renderHook(() => useCodeAnalysis('', true));
      expect(result.current.isAnalyzing).toBe(false);
    });

    it('becomes false after debounce completes', () => {
      const code = `
function add(a, b) {
  return a + b;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 1: Nested Loops
  // ══════════════════════════════════════════════════════════════════════════

  describe('nested loops detection', () => {
    it('detects nested for loops', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code);
      const nested = result.current.insights.find(
        (i) => i.message.includes('Nested loop'),
      );
      expect(nested).toBeDefined();
      expect(nested!.type).toBe('anti-pattern');
      expect(nested!.severity).toBe('warning');
    });

    it('detects for + forEach nesting', () => {
      const code = `
function findPairs(arr, target) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    arr.forEach((val, j) => {
      if (i !== j && arr[i] + val === target) result.push([i, j]);
    });
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const nested = result.current.insights.find(
        (i) => i.message.includes('Nested loop'),
      );
      expect(nested).toBeDefined();
    });

    it('does NOT flag single flat loop', () => {
      const code = `
function sum(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;
      const { result } = renderAndAnalyze(code);
      const nested = result.current.insights.find(
        (i) => i.message.includes('Nested loop'),
      );
      expect(nested).toBeUndefined();
    });

    it('detects while loop nested inside for loop', () => {
      const code = `
function search(matrix, target) {
  for (let i = 0; i < matrix.length; i++) {
    let j = 0;
    while (j < matrix[i].length) {
      if (matrix[i][j] === target) return true;
      j++;
    }
  }
  return false;
}`;
      const { result } = renderAndAnalyze(code);
      const nested = result.current.insights.find(
        (i) => i.message.includes('Nested loop'),
      );
      expect(nested).toBeDefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 2: includes in loop
  // ══════════════════════════════════════════════════════════════════════════

  describe('includes-in-loop detection', () => {
    it('detects .includes inside a for loop', () => {
      const code = `
function intersect(a, b) {
  const result = [];
  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i])) {
      result.push(a[i]);
    }
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Array.includes inside a loop'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('optimization');
      expect(insight!.severity).toBe('suggestion');
    });

    it('detects .includes inside forEach', () => {
      const code = `
function intersect(a, b) {
  const result = [];
  a.forEach((val) => {
    if (b.includes(val)) result.push(val);
  });
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Array.includes inside a loop'),
      );
      expect(insight).toBeDefined();
    });

    it('does NOT flag .includes outside of loop', () => {
      const code = `
function hasElement(arr, val) {
  return arr.includes(val);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Array.includes inside a loop'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 3: Missing Null Checks
  // ══════════════════════════════════════════════════════════════════════════

  describe('missing null check detection', () => {
    it('detects function with no parameter guards', () => {
      const code = `
function process(data, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(data[i] * 2);
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('null/undefined guard'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('edge-case');
      expect(insight!.severity).toBe('warning');
    });

    it('does NOT flag function with null check', () => {
      const code = `
function process(data, count) {
  if (!data) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(data[i] * 2);
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('null/undefined guard'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag function with optional chaining guard', () => {
      const code = `
function getLength(arr) {
  const len = arr?.length;
  return len ?? 0;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('null/undefined guard'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag function with length check', () => {
      const code = `
function firstItem(arr) {
  if (arr.length === 0) return null;
  return arr[0];
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('null/undefined guard'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 4: No Early Return
  // ══════════════════════════════════════════════════════════════════════════

  describe('no early return detection', () => {
    it('detects function without early return that processes collections', () => {
      const code = `
function removeDuplicates(nums) {
  const seen = new Set();
  const result = [];
  nums.forEach((n) => {
    if (!seen.has(n)) {
      seen.add(n);
      result.push(n);
    }
  });
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('guard clauses'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('edge-case');
      expect(insight!.severity).toBe('suggestion');
    });

    it('does NOT flag function with early return', () => {
      const code = `
function removeDuplicates(nums) {
  if (nums.length === 0) return [];
  const seen = new Set();
  const result = [];
  nums.forEach((n) => {
    if (!seen.has(n)) {
      seen.add(n);
      result.push(n);
    }
  });
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('guard clauses'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag function without collection processing', () => {
      const code = `
function add(a, b) {
  return a + b;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('guard clauses'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 5: String Concatenation in Loop
  // ══════════════════════════════════════════════════════════════════════════

  describe('string concat in loop detection', () => {
    it('detects += with string literal inside for loop', () => {
      const code = `
function buildString(words) {
  let result = "";
  for (let i = 0; i < words.length; i++) {
    result += " " + words[i];
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('String concatenation'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('optimization');
      expect(insight!.severity).toBe('suggestion');
    });

    it('detects += with template literal in loop', () => {
      const code = `
function serialize(items) {
  let output = "";
  for (const item of items) {
    output += \`\${item.name}: \${item.value}\`;
  }
  return output;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('String concatenation'),
      );
      expect(insight).toBeDefined();
    });

    it('does NOT flag += outside of a loop', () => {
      const code = `
function greet(name) {
  let msg = "Hello, ";
  msg += name;
  return msg;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('String concatenation'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 6: Sort Then Search
  // ══════════════════════════════════════════════════════════════════════════

  describe('sort-then-search detection', () => {
    it('detects .sort() followed by .indexOf()', () => {
      const code = `
function findPosition(arr, target) {
  arr.sort((a, b) => a - b);
  return arr.indexOf(target);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('optimization');
    });

    it('detects .sort() followed by .find()', () => {
      const code = `
function findTarget(arr, target) {
  arr.sort((a, b) => a - b);
  return arr.find((x) => x === target);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      expect(insight).toBeDefined();
    });

    it('detects .sort() followed by .includes()', () => {
      const code = `
function hasTarget(arr, target) {
  arr.sort((a, b) => a - b);
  return arr.includes(target);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      expect(insight).toBeDefined();
    });

    it('does NOT flag .sort() alone without search', () => {
      const code = `
function sortArray(arr) {
  return arr.sort((a, b) => a - b);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag .find() alone without sort', () => {
      const code = `
function findItem(arr, id) {
  return arr.find((item) => item.id === id);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 7: Multiple Passes
  // ══════════════════════════════════════════════════════════════════════════

  describe('multiple passes detection', () => {
    it('detects 3+ array method calls', () => {
      const code = `
function process(data) {
  const filtered = data.filter((x) => x > 0);
  const doubled = filtered.map((x) => x * 2);
  const total = doubled.reduce((acc, x) => acc + x, 0);
  return total;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Multiple array passes'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('optimization');
      expect(insight!.severity).toBe('info');
    });

    it('detects multiple for loops as multiple passes', () => {
      const code = `
function analyze(nums) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) { sum += nums[i]; }
  let max = -Infinity;
  for (let i = 0; i < nums.length; i++) { if (nums[i] > max) max = nums[i]; }
  let min = Infinity;
  for (let i = 0; i < nums.length; i++) { if (nums[i] < min) min = nums[i]; }
  return { sum, max, min };
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Multiple array passes'),
      );
      expect(insight).toBeDefined();
    });

    it('does NOT flag single pass or two passes', () => {
      const code = `
function double(nums) {
  return nums.map((x) => x * 2);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Multiple array passes'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Detection Rule 8: Recursive Without Memoization
  // ══════════════════════════════════════════════════════════════════════════

  describe('recursive-no-memo detection', () => {
    it('detects recursive function without memoization', () => {
      const code = `
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('Recursive function') && i.message.includes('without memoization'),
      );
      expect(insight).toBeDefined();
      expect(insight!.type).toBe('anti-pattern');
      expect(insight!.severity).toBe('warning');
      expect(insight!.message).toContain('"fib"');
    });

    it('does NOT flag recursive function with memo Map', () => {
      const code = `
function fib(n, memo = new Map()) {
  if (memo.has(n)) return memo.get(n);
  if (n <= 1) return n;
  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('without memoization'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag recursive function with cache variable', () => {
      const code = `
const cache = {};
function fib(n) {
  if (cache[n]) return cache[n];
  if (n <= 1) return n;
  cache[n] = fib(n - 1) + fib(n - 2);
  return cache[n];
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('without memoization'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag recursive function with dp array', () => {
      const code = `
function fib(n) {
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  return fibHelper(n);
}
function fibHelper(n) {
  return fibHelper(n - 1) + fibHelper(n - 2);
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('without memoization'),
      );
      expect(insight).toBeUndefined();
    });

    it('does NOT flag non-recursive function', () => {
      const code = `
function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('without memoization'),
      );
      expect(insight).toBeUndefined();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Complexity Estimation
  // ══════════════════════════════════════════════════════════════════════════

  describe('complexity estimation', () => {
    it('returns null for code under 20 chars', () => {
      const code = `let x = 1;`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).toBeNull();
    });

    it('estimates O(1) for code with no loops', () => {
      const code = `
function add(a, b) {
  return a + b;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(1)');
    });

    it('estimates O(n) for single loop', () => {
      const code = `
function sum(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n)');
    });

    it('estimates O(n\u00B2) for two nested loops', () => {
      const code = `
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i; j++) {
      if (arr[j] > arr[j+1]) {
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
  }
  return arr;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n\u00B2)');
    });

    it('estimates O(n\u00B3) for three nested loops', () => {
      const code = `
function tripleScan(matrix) {
  let count = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      for (let k = 0; k < matrix.length; k++) {
        count++;
      }
    }
  }
  return count;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n\u00B3)');
    });

    it('estimates O(n log n) for code with .sort()', () => {
      const code = `
function sortedArray(nums) {
  return nums.sort((a, b) => a - b);
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n log n)');
    });

    it('estimates O(log n) for binary search pattern', () => {
      const code = `
function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(log n)');
    });

    it('estimates O(2^n) for two recursive calls without memo', () => {
      const code = `
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(2^n)');
    });

    it('estimates O(n) for recursive with memo', () => {
      const code = `
function fib(n, memo = new Map()) {
  if (memo.has(n)) return memo.get(n);
  if (n <= 1) return n;
  const val = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, val);
  return val;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n)');
    });

    // Space complexity

    it('estimates O(1) space for no allocations', () => {
      const code = `
function sum(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.space).toBe('O(1)');
    });

    it('estimates O(n) space when allocating Map/Set', () => {
      const code = `
function unique(nums) {
  const seen = new Set(nums);
  return Array.from(seen);
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.space).toBe('O(n)');
    });

    it('estimates O(n) space for array with push', () => {
      const code = `
function doubleAll(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    result.push(nums[i] * 2);
  }
  return result;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.space).toBe('O(n)');
    });

    it('estimates O(n\u00B2) space for matrix allocation', () => {
      const code = `
function createMatrix(n) {
  const matrix = Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    matrix[i] = Array(n).fill(0);
  }
  return matrix;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.space).toBe('O(n\u00B2)');
    });

    it('estimates O(n) space for recursive call stack', () => {
      const code = `
function countdown(n) {
  if (n === 0) return;
  console.log(n);
  countdown(n - 1);
  countdown(n - 1);
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.space).toBe('O(n)');
    });

    // Confidence levels

    it('returns high confidence for simple nested loops', () => {
      const code = `
function bubble(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] > arr[j]) [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.confidence).toBe('high');
    });

    it('returns low confidence for O(1) constant code', () => {
      const code = `
function greet(name) {
  return "Hello, " + name;
}`;
      const { result } = renderAndAnalyze(code);
      expect(result.current.complexity).not.toBeNull();
      // O(1) has confidence += 1 (time) + 2 (space O(1)) = 3 => medium
      expect(['low', 'medium']).toContain(result.current.complexity!.confidence);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Dismiss / Clear Dismissed
  // ══════════════════════════════════════════════════════════════════════════

  describe('dismissInsight', () => {
    it('marks an insight as dismissed', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code);

      const firstInsight = result.current.insights[0];
      expect(firstInsight).toBeDefined();
      expect(firstInsight.dismissed).toBe(false);

      act(() => {
        result.current.dismissInsight(firstInsight.id);
      });

      const dismissed = result.current.insights.find(
        (i) => i.id === firstInsight.id,
      );
      expect(dismissed!.dismissed).toBe(true);
    });

    it('preserves dismissed state across re-analysis of same code', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result, rerender } = renderHook(
        ({ code, enabled }) => useCodeAnalysis(code, enabled),
        { initialProps: { code, enabled: true } },
      );

      act(() => { vi.advanceTimersByTime(DEBOUNCE_MS + 50); });

      // Dismiss the first insight
      const targetId = result.current.insights[0].id;
      act(() => { result.current.dismissInsight(targetId); });

      // Re-trigger analysis with same code (add a space)
      rerender({ code: code + ' ', enabled: true });
      act(() => { vi.advanceTimersByTime(DEBOUNCE_MS + 50); });

      // The same insight should remain dismissed (via fingerprint)
      const nestedLoop = result.current.insights.find(
        (i) => i.message.includes('Nested loop'),
      );
      expect(nestedLoop).toBeDefined();
      expect(nestedLoop!.dismissed).toBe(true);
    });
  });

  describe('clearDismissed', () => {
    it('clears all dismissed insights', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code);

      // Dismiss all insights
      act(() => {
        result.current.insights.forEach((i) => {
          result.current.dismissInsight(i.id);
        });
      });

      // Verify all are dismissed
      expect(result.current.insights.every((i) => i.dismissed)).toBe(true);

      // Clear dismissed
      act(() => { result.current.clearDismissed(); });

      // All should be un-dismissed
      expect(result.current.insights.every((i) => !i.dismissed)).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Debounce Behavior
  // ══════════════════════════════════════════════════════════════════════════

  describe('debounce', () => {
    it('does not produce insights before debounce elapses', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderHook(() => useCodeAnalysis(code, true));

      // Advance only partially
      act(() => { vi.advanceTimersByTime(500); });

      expect(result.current.insights).toEqual([]);
    });

    it('produces insights after debounce elapses', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderHook(() => useCodeAnalysis(code, true));

      act(() => { vi.advanceTimersByTime(DEBOUNCE_MS + 50); });

      expect(result.current.insights.length).toBeGreaterThan(0);
    });

    it('resets debounce on rapid code changes', () => {
      const { result, rerender } = renderHook(
        ({ code, enabled }) => useCodeAnalysis(code, enabled),
        { initialProps: { code: 'let x = 1; let y = 2; let z = 3;', enabled: true } },
      );

      // Type fast — each rerender resets the debounce
      act(() => { vi.advanceTimersByTime(1000); });
      rerender({ code: 'let x = 1; let y = 2; let z = 3; let a = 4;', enabled: true });

      act(() => { vi.advanceTimersByTime(1000); });
      rerender({
        code: `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`,
        enabled: true,
      });

      // Still within debounce of last change — should be empty
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.insights).toEqual([]);

      // Now finish debounce
      act(() => { vi.advanceTimersByTime(DEBOUNCE_MS); });
      expect(result.current.insights.length).toBeGreaterThan(0);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Insight Structure
  // ══════════════════════════════════════════════════════════════════════════

  describe('insight structure', () => {
    it('each insight has required fields', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code);

      for (const insight of result.current.insights) {
        expect(insight.id).toBeDefined();
        expect(typeof insight.id).toBe('string');
        expect(['anti-pattern', 'optimization', 'edge-case', 'complexity']).toContain(insight.type);
        expect(['info', 'warning', 'suggestion']).toContain(insight.severity);
        expect(typeof insight.message).toBe('string');
        expect(typeof insight.detail).toBe('string');
        expect(typeof insight.dismissed).toBe('boolean');
      }
    });

    it('insights have unique IDs', () => {
      const code = `
function process(data, count) {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (data[i].includes(data[j])) console.log("match");
    }
  }
  const filtered = data.filter((x) => x.length > 0);
  const mapped = filtered.map((x) => x.toUpperCase());
  const reduced = mapped.reduce((a, b) => a + b, "");
}`;
      const { result } = renderAndAnalyze(code);

      const ids = result.current.insights.map((i) => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Combined Patterns
  // ══════════════════════════════════════════════════════════════════════════

  describe('combined patterns', () => {
    it('detects multiple issues in the same code', () => {
      const code = `
function findDuplicates(arr, target) {
  arr.sort((a, b) => a - b);
  const idx = arr.indexOf(target);
  const filtered = arr.filter((x) => x > 0);
  const mapped = filtered.map((x) => x * 2);
  const total = mapped.reduce((a, b) => a + b, 0);
  return { idx, total };
}`;
      const { result } = renderAndAnalyze(code);

      // Should detect sort-then-search AND multiple passes
      const sortSearch = result.current.insights.find(
        (i) => i.message.includes('Sorting then linear search'),
      );
      const multiPass = result.current.insights.find(
        (i) => i.message.includes('Multiple array passes'),
      );

      expect(sortSearch).toBeDefined();
      expect(multiPass).toBeDefined();
    });

    it('provides complexity estimate alongside insights', () => {
      const code = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}`;
      const { result } = renderAndAnalyze(code);

      expect(result.current.insights.length).toBeGreaterThan(0);
      expect(result.current.complexity).not.toBeNull();
      expect(result.current.complexity!.time).toBe('O(n\u00B2)');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Arrow Function Detection
  // ══════════════════════════════════════════════════════════════════════════

  describe('arrow function support', () => {
    it('detects missing null check on arrow function params', () => {
      const code = `
const process = (data, count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(data[i] * 2);
  }
  return result;
};`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('null/undefined guard'),
      );
      expect(insight).toBeDefined();
    });

    it('detects recursive arrow function without memo', () => {
      const code = `
const fib = (n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};`;
      const { result } = renderAndAnalyze(code);
      const insight = result.current.insights.find(
        (i) => i.message.includes('without memoization'),
      );
      expect(insight).toBeDefined();
      expect(insight!.message).toContain('"fib"');
    });
  });
});

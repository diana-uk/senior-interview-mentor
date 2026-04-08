import { describe, it, expect } from 'vitest';
import { fingerprint, estimateComplexity, analyzeCode, generateInsightId } from '../codeAnalysisUtils';

// ─── fingerprint ──────────────────────────────────────────────────────────────

describe('fingerprint', () => {
  it('formats type::message::global when line is omitted', () => {
    expect(fingerprint('anti-pattern', 'Nested loop detected')).toBe(
      'anti-pattern::Nested loop detected::global',
    );
  });

  it('formats type::message::line when line is provided', () => {
    expect(fingerprint('complexity', 'O(n²)', 5)).toBe('complexity::O(n²)::5');
  });

  it('treats line=0 as a real line number (not global)', () => {
    expect(fingerprint('optimization', 'Use Set', 0)).toBe('optimization::Use Set::0');
  });

  it('produces different fingerprints for different types', () => {
    const a = fingerprint('anti-pattern', 'msg');
    const b = fingerprint('optimization', 'msg');
    expect(a).not.toBe(b);
  });

  it('produces different fingerprints for different messages', () => {
    const a = fingerprint('info', 'msg A');
    const b = fingerprint('info', 'msg B');
    expect(a).not.toBe(b);
  });

  it('produces different fingerprints for different lines', () => {
    const a = fingerprint('info', 'msg', 1);
    const b = fingerprint('info', 'msg', 2);
    expect(a).not.toBe(b);
  });
});

// ─── estimateComplexity ───────────────────────────────────────────────────────

function run(code: string) {
  return estimateComplexity(code, code.split('\n'));
}

describe('estimateComplexity', () => {
  it('returns null for code shorter than 20 trimmed chars', () => {
    expect(estimateComplexity('  x = 1;  ', ['  x = 1;  '])).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(estimateComplexity('', [])).toBeNull();
  });

  it('returns O(1) time + O(1) space for simple arithmetic', () => {
    const code = 'function add(a, b) { return a + b; }';
    const result = run(code);
    expect(result?.time).toBe('O(1)');
    expect(result?.space).toBe('O(1)');
  });

  it('returns O(n) time for a single loop', () => {
    const code = [
      'function sum(arr) {',
      '  let s = 0;',
      '  for (let i = 0; i < arr.length; i++) {',
      '    s += arr[i];',
      '  }',
      '  return s;',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(n)');
  });

  it('returns O(n²) time for nested loops', () => {
    const code = [
      'function bubble(arr) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    for (let j = 0; j < arr.length; j++) {',
      '      if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '    }',
      '  }',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(n²)');
  });

  it('returns O(n log n) for sort', () => {
    const code = [
      'function sortNums(arr) {',
      '  return arr.sort((a, b) => a - b);',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(n log n)');
  });

  it('returns O(log n) for binary search pattern', () => {
    const code = [
      'function binarySearch(arr, target) {',
      '  let left = 0, right = arr.length - 1;',
      '  while (left <= right) {',
      '    const mid = Math.floor((left + right) / 2);',
      '    if (arr[mid] === target) return mid;',
      '    if (arr[mid] < target) left = mid + 1;',
      '    else right = mid - 1;',
      '  }',
      '  return -1;',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(log n)');
  });

  it('returns O(2^n) for dual recursive calls without memo', () => {
    const code = [
      'function fib(n) {',
      '  if (n <= 1) return n;',
      '  return fib(n - 1) + fib(n - 2);',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(2^n)');
  });

  it('returns O(n) for memoized recursion', () => {
    const code = [
      'const memo = {};',
      'function fib(n) {',
      '  if (n in memo) return memo[n];',
      '  memo[n] = fib(n - 1) + fib(n - 2);',
      '  return memo[n];',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.time).toBe('O(n)');
  });

  it('returns O(n) space when a Map is allocated', () => {
    const code = [
      'function twoSum(nums, target) {',
      '  const map = new Map();',
      '  for (const n of nums) {',
      '    if (map.has(target - n)) return true;',
      '    map.set(n, true);',
      '  }',
      '  return false;',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.space).toBe('O(n)');
  });

  it('confidence is high for clearly O(n) loop with no ambiguity', () => {
    const code = [
      'function findMax(arr) {',
      '  let max = -Infinity;',
      '  for (const x of arr) {',
      '    if (x > max) max = x;',
      '  }',
      '  return max;',
      '}',
    ].join('\n');
    const result = run(code);
    expect(result?.confidence).toBe('high');
  });

  it('confidence is medium for simple constant-time code (no loops/recursion)', () => {
    // O(1) time (1pt) + O(1) space (2pt) = 3 → medium
    const code = 'function clamp(x, min, max) {\n  return Math.min(Math.max(x, min), max);\n}';
    const result = run(code);
    expect(result?.confidence).toBe('medium');
  });

  it('returns an object with time, space, confidence fields', () => {
    const code = 'function noop(a) { return a + 1; } // just a simple addition';
    const result = run(code);
    expect(result).toHaveProperty('time');
    expect(result).toHaveProperty('space');
    expect(result).toHaveProperty('confidence');
  });
});

// ─── analyzeCode ──────────────────────────────────────────────────────────────

describe('analyzeCode', () => {
  it('returns empty insights and null complexity for very short code', () => {
    const result = analyzeCode('x = 1');
    expect(result.insights).toEqual([]);
    expect(result.complexity).toBeNull();
  });

  it('returns empty insights and null complexity for empty string', () => {
    const result = analyzeCode('');
    expect(result.insights).toEqual([]);
    expect(result.complexity).toBeNull();
  });

  it('detects nested loops (anti-pattern)', () => {
    const code = [
      'function foo(arr) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    for (let j = 0; j < arr.length; j++) {',
      '      console.log(arr[i] + arr[j]);',
      '    }',
      '  }',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    const nested = insights.find((i) => i.type === 'anti-pattern' && i.message.includes('Nested loop'));
    expect(nested).toBeDefined();
  });

  it('detects Array.includes inside a loop (optimization)', () => {
    const code = [
      'function check(arr, vals) {',
      '  for (const v of arr) {',
      '    if (vals.includes(v)) return true;',
      '  }',
      '  return false;',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    const inc = insights.find((i) => i.message.includes('includes'));
    expect(inc).toBeDefined();
    expect(inc?.severity).toBe('suggestion');
  });

  it('detects sort-then-search pattern (optimization)', () => {
    const code = [
      'function find(arr, target) {',
      '  arr.sort((a, b) => a - b);',
      '  return arr.find(x => x === target);',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    const opt = insights.find((i) => i.message.includes('Sorting then linear search'));
    expect(opt).toBeDefined();
  });

  it('detects multiple-passes pattern (optimization info)', () => {
    const code = [
      'function triple(arr) {',
      '  const a = arr.filter(x => x > 0);',
      '  const b = a.map(x => x * 2);',
      '  const c = b.reduce((s, x) => s + x, 0);',
      '  return c;',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    const passes = insights.find((i) => i.message.includes('Multiple array passes'));
    expect(passes).toBeDefined();
    expect(passes?.severity).toBe('info');
  });

  it('detects recursive function without memoization', () => {
    const code = [
      'function fib(n) {',
      '  if (n <= 1) return n;',
      '  return fib(n - 1) + fib(n - 2);',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    const rec = insights.find((i) => i.message.includes('without memoization'));
    expect(rec).toBeDefined();
    expect(rec?.type).toBe('anti-pattern');
  });

  it('returns a complexity estimate for analysable code', () => {
    const code = [
      'function sumAll(arr) {',
      '  let total = 0;',
      '  for (const x of arr) total += x;',
      '  return total;',
      '}',
    ].join('\n');
    const { complexity } = analyzeCode(code);
    expect(complexity).not.toBeNull();
    expect(complexity?.time).toBe('O(n)');
  });

  it('returns no insights for simple, clean code', () => {
    const code = [
      'function add(a, b) {',
      '  if (a == null || b == null) return 0;',
      '  return a + b;',
      '}',
    ].join('\n');
    const { insights } = analyzeCode(code);
    // No nested loops, no includes-in-loop, no sort+search, no recursion
    const antiPatterns = insights.filter((i) => i.type === 'anti-pattern');
    expect(antiPatterns).toHaveLength(0);
  });
});

// ─── generateInsightId ────────────────────────────────────────────────────────

describe('generateInsightId', () => {
  it('returns a string', () => {
    expect(typeof generateInsightId()).toBe('string');
  });

  it('starts with "insight-"', () => {
    expect(generateInsightId()).toMatch(/^insight-/);
  });

  it('returns unique ids on successive calls', () => {
    const a = generateInsightId();
    const b = generateInsightId();
    expect(a).not.toBe(b);
  });

  it('contains a timestamp segment (numeric)', () => {
    const id = generateInsightId();
    const parts = id.split('-');
    // format: insight-<timestamp>-<counter>
    expect(parts.length).toBe(3);
    expect(Number(parts[1])).toBeGreaterThan(0);
    expect(Number(parts[2])).toBeGreaterThan(0);
  });
});

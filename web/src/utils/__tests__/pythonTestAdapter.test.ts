import { describe, it, expect } from 'vitest';
import {
  camelToSnake,
  extractJsFuncName,
  extractPythonFuncName,
  toPythonTestInput,
} from '../pythonTestAdapter';

describe('camelToSnake', () => {
  it('converts single-word camelCase', () => {
    expect(camelToSnake('twoSum')).toBe('two_sum');
  });

  it('converts multi-word camelCase', () => {
    expect(camelToSnake('climbStairs')).toBe('climb_stairs');
    expect(camelToSnake('longestConsecutiveSequence')).toBe('longest_consecutive_sequence');
  });

  it('leaves already snake_case unchanged', () => {
    expect(camelToSnake('two_sum')).toBe('two_sum');
  });

  it('leaves single word unchanged', () => {
    expect(camelToSnake('solve')).toBe('solve');
  });

  it('handles leading lowercase correctly', () => {
    expect(camelToSnake('isValid')).toBe('is_valid');
    expect(camelToSnake('maxDepth')).toBe('max_depth');
  });
});

describe('extractJsFuncName', () => {
  it('extracts from a TS function declaration', () => {
    expect(extractJsFuncName('function twoSum(nums: number[], target: number): number[] {')).toBe('twoSum');
  });

  it('extracts from code with helpers above', () => {
    const code = `class TreeNode {}\nfunction buildTree() {}\nfunction invertTree(root: TreeNode | null): TreeNode | null {`;
    expect(extractJsFuncName(code)).toBe('buildTree');
  });

  it('returns null for no match', () => {
    expect(extractJsFuncName('const x = 1;')).toBeNull();
  });
});

describe('extractPythonFuncName', () => {
  it('extracts from a Python def', () => {
    expect(extractPythonFuncName('def two_sum(nums: list[int], target: int) -> list[int]:')).toBe('two_sum');
  });

  it('returns null for no match', () => {
    expect(extractPythonFuncName('x = 1')).toBeNull();
  });
});

describe('toPythonTestInput', () => {
  it('converts function name and leaves args unchanged', () => {
    expect(toPythonTestInput('twoSum([2,7,11,15], 9)', 'twoSum', 'two_sum')).toBe('two_sum([2,7,11,15], 9)');
  });

  it('converts null/true/false to Python equivalents', () => {
    expect(toPythonTestInput('isValid(null, true, false)', 'isValid', 'is_valid')).toBe('is_valid(None, True, False)');
  });

  it('converts undefined to None', () => {
    expect(toPythonTestInput('foo(undefined)', 'foo', 'foo')).toBe('foo(None)');
  });

  it('handles multiple occurrences of function name', () => {
    expect(toPythonTestInput('twoSum(twoSum([1], 2))', 'twoSum', 'two_sum')).toBe('two_sum(two_sum([1], 2))');
  });

  it('does not replace partial matches', () => {
    expect(toPythonTestInput('twoSumResult(1)', 'twoSum', 'two_sum')).toBe('twoSumResult(1)');
  });
});

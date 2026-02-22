import { describe, it, expect } from 'vitest';
import { parseTestCode } from '../codeExecutor';

describe('parseTestCode', () => {
  it('parses standard console.log with expected comment', () => {
    const code = 'console.log(twoSum([2,7,11,15], 9)); // expected: [0,1]';
    const result = parseTestCode(code);
    expect(result).toEqual([
      { input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' },
    ]);
  });

  it('parses multiple test lines', () => {
    const code = [
      'console.log(twoSum([2,7,11,15], 9)); // expected: [0,1]',
      'console.log(twoSum([3,2,4], 6)); // expected: [1,2]',
      'console.log(twoSum([3,3], 6)); // expected: [0,1]',
    ].join('\n');
    const result = parseTestCode(code);
    expect(result).toHaveLength(3);
    expect(result[0].expected).toBe('[0,1]');
    expect(result[1].expected).toBe('[1,2]');
    expect(result[2].expected).toBe('[0,1]');
  });

  it('ignores lines without expected comment', () => {
    const code = [
      'console.log(fn(1));',
      'console.log(fn(2)); // expected: 4',
      '// just a comment',
    ].join('\n');
    const result = parseTestCode(code);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ input: 'fn(2)', expected: '4' });
  });

  it('handles lines without semicolons', () => {
    const code = 'console.log(fn(5)) // expected: 25';
    const result = parseTestCode(code);
    expect(result).toEqual([{ input: 'fn(5)', expected: '25' }]);
  });

  it('returns empty array for empty input', () => {
    expect(parseTestCode('')).toEqual([]);
  });

  it('returns empty array for comment-only input', () => {
    const code = '// Test your solution\n// Add test cases here';
    expect(parseTestCode(code)).toEqual([]);
  });

  it('handles nested parentheses in expression', () => {
    const code = 'console.log(fn(Math.max(1, 2), [3, 4])); // expected: 10';
    const result = parseTestCode(code);
    expect(result).toEqual([
      { input: 'fn(Math.max(1, 2), [3, 4])', expected: '10' },
    ]);
  });

  it('handles string expected values', () => {
    const code = 'console.log(greet("world")); // expected: "hello world"';
    const result = parseTestCode(code);
    expect(result).toEqual([
      { input: 'greet("world")', expected: '"hello world"' },
    ]);
  });

  it('handles boolean expected values', () => {
    const code = 'console.log(isPrime(7)); // expected: true';
    const result = parseTestCode(code);
    expect(result).toEqual([{ input: 'isPrime(7)', expected: 'true' }]);
  });

  it('trims whitespace from input and expected', () => {
    const code = '  console.log(  fn(1)  );  //  expected:   42  ';
    const result = parseTestCode(code);
    expect(result).toEqual([{ input: 'fn(1)', expected: '42' }]);
  });

  it('handles mixed valid and invalid lines', () => {
    const code = [
      '// Test cases',
      'console.log(add(1, 2)); // expected: 3',
      'const x = 5;',
      'console.log(add(0, 0)); // expected: 0',
      '',
    ].join('\n');
    const result = parseTestCode(code);
    expect(result).toHaveLength(2);
    expect(result[0].expected).toBe('3');
    expect(result[1].expected).toBe('0');
  });

  it('handles null expected value', () => {
    const code = 'console.log(fn()); // expected: null';
    const result = parseTestCode(code);
    expect(result).toEqual([{ input: 'fn()', expected: 'null' }]);
  });

  it('handles array of arrays expected value', () => {
    const code = 'console.log(permute([1,2,3])); // expected: [[1,2,3],[1,3,2],[2,1,3]]';
    const result = parseTestCode(code);
    expect(result[0].expected).toBe('[[1,2,3],[1,3,2],[2,1,3]]');
  });
});

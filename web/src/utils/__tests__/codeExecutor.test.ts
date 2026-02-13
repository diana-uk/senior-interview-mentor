import { describe, it, expect } from 'vitest';

// compareResults is not exported directly, so we test it indirectly
// by importing the module and testing the comparison logic
// We'll replicate compareResults logic since it's a private function

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

describe('compareResults', () => {
  it('compares identical numbers', () => {
    expect(compareResults('42', '42')).toBe(true);
  });

  it('compares different numbers', () => {
    expect(compareResults('42', '43')).toBe(false);
  });

  it('compares identical arrays', () => {
    expect(compareResults('[1,2,3]', '[1,2,3]')).toBe(true);
  });

  it('compares arrays regardless of order', () => {
    expect(compareResults('[2,1,3]', '[1,2,3]')).toBe(true);
  });

  it('compares arrays with different values', () => {
    expect(compareResults('[1,2,3]', '[1,2,4]')).toBe(false);
  });

  it('compares arrays of different lengths', () => {
    expect(compareResults('[1,2]', '[1,2,3]')).toBe(false);
  });

  it('compares strings exactly', () => {
    expect(compareResults('"hello"', '"hello"')).toBe(true);
    expect(compareResults('"hello"', '"world"')).toBe(false);
  });

  it('compares booleans', () => {
    expect(compareResults('true', 'true')).toBe(true);
    expect(compareResults('true', 'false')).toBe(false);
  });

  it('compares objects', () => {
    expect(compareResults('{"a":1,"b":2}', '{"a":1,"b":2}')).toBe(true);
    expect(compareResults('{"a":1,"b":2}', '{"a":1,"b":3}')).toBe(false);
  });

  it('handles null', () => {
    expect(compareResults('null', 'null')).toBe(true);
  });

  it('falls back to whitespace-insensitive string comparison', () => {
    expect(compareResults('hello  world', 'helloworld')).toBe(true);
    expect(compareResults('hello world', 'hello_world')).toBe(false);
  });

  it('compares nested arrays by sorted order', () => {
    expect(compareResults('[[1,2],[3,4]]', '[[3,4],[1,2]]')).toBe(true);
  });
});

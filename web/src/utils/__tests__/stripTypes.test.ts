import { describe, it, expect } from 'vitest';
import { stripTypeAnnotations } from '../stripTypes';

describe('stripTypeAnnotations', () => {
  it('strips parameter type annotations', () => {
    const input = 'function add(a: number, b: number) { return a + b; }';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function add(a, b)');
    expect(result).not.toContain(': number');
  });

  it('strips return type annotations', () => {
    const input = 'function add(a: number, b: number): number { return a + b; }';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function add(a, b) {');
    expect(result).not.toContain('): number {');
  });

  it('strips arrow function return types', () => {
    const input = 'const add = (a: number, b: number): number => a + b;';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('=> a + b');
    expect(result).not.toContain('): number =>');
  });

  it('strips variable type annotations', () => {
    const input = 'const x: number = 42;';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('const x');
    expect(result).toContain('= 42;');
    expect(result).not.toContain(': number');
  });

  it('strips generic constructors', () => {
    const input = 'const map = new Map<string, number>();';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('new Map()');
    expect(result).not.toContain('<string, number>');
  });

  it('removes type/interface declarations', () => {
    const input = `type Pair = [number, number];
interface Foo { bar: string; }
const x = 1;`;
    const result = stripTypeAnnotations(input);
    expect(result).not.toContain('type Pair');
    expect(result).not.toContain('interface Foo');
    expect(result).toContain('const x = 1');
  });

  it('removes non-null assertions', () => {
    const input = 'const val = obj!.prop;';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('const val = obj.prop;');
  });

  it('removes as casts', () => {
    const input = 'const val = something as string;';
    const result = stripTypeAnnotations(input);
    expect(result).not.toContain('as string');
  });

  it('handles optional parameters', () => {
    const input = 'function fn(x?: number) { return x; }';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function fn(x)');
  });

  it('handles default parameter values', () => {
    const input = 'function fn(x: number = 5) { return x; }';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function fn(x = 5)');
  });

  it('handles complex generic types like Map<K,V>', () => {
    const input = 'function fn(map: Map<string, number[]>) {}';
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function fn(map)');
  });

  it('preserves code logic', () => {
    const input = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i: number = 0; i < nums.length; i++) {
    const complement: number = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`;
    const result = stripTypeAnnotations(input);
    expect(result).toContain('function twoSum(nums, target)');
    expect(result).toContain('new Map()');
    expect(result).toContain('return [map.get(complement), i]');
    expect(result).toContain('map.set(nums[i], i)');
  });

  it('collapses multiple blank lines', () => {
    const input = 'const a = 1;\n\n\n\n\nconst b = 2;';
    const result = stripTypeAnnotations(input);
    expect(result).not.toMatch(/\n{3,}/);
  });
});

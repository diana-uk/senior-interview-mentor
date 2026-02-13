import { describe, it, expect } from 'vitest';
import {
  getStarterCode,
  getTestCode,
  hasLanguageSupport,
  getAvailableLanguages,
} from '../problemLanguage';
import type { Problem } from '../../types';

const legacyProblem: Problem = {
  id: 'test-1',
  title: 'Test Problem',
  difficulty: 'Easy',
  pattern: 'HashMap',
  description: 'A test problem',
  examples: [],
  constraints: [],
  starterCode: `function foo(nums: number[]): number {\n  // Your solution here\n}`,
  testCases: [
    { input: 'foo([1,2,3])', expected: '6' },
    { input: 'foo([])', expected: '0' },
  ],
};

const multiLangProblem: Problem = {
  id: 'test-2',
  title: 'Multi-Lang Problem',
  difficulty: 'Medium',
  pattern: 'Binary Search',
  description: 'A multi-language problem',
  examples: [],
  constraints: [],
  starterCode: {
    typescript: `function bar(n: number): number {\n  // TS\n}`,
    javascript: `function bar(n) {\n  // JS\n}`,
    python: `def bar(n: int) -> int:\n    # Python\n    pass`,
  },
  testCases: [
    { input: 'bar(5)', expected: '25' },
    { input: 'bar(null)', expected: '0' },
  ],
};

describe('getStarterCode', () => {
  it('returns TypeScript for legacy problems', () => {
    const code = getStarterCode(legacyProblem, 'typescript');
    expect(code).toContain('function foo(nums: number[])');
  });

  it('auto-strips types for JavaScript from legacy problems', () => {
    const code = getStarterCode(legacyProblem, 'javascript');
    expect(code).toContain('function foo(nums)');
    expect(code).not.toContain('number[]');
  });

  it('returns empty string for Python on legacy problems', () => {
    const code = getStarterCode(legacyProblem, 'python');
    expect(code).toBe('');
  });

  it('returns TypeScript for multi-lang problems', () => {
    const code = getStarterCode(multiLangProblem, 'typescript');
    expect(code).toContain('n: number');
    expect(code).toContain('// TS');
  });

  it('returns explicit JavaScript for multi-lang problems', () => {
    const code = getStarterCode(multiLangProblem, 'javascript');
    expect(code).toContain('function bar(n)');
    expect(code).toContain('// JS');
  });

  it('returns Python for multi-lang problems', () => {
    const code = getStarterCode(multiLangProblem, 'python');
    expect(code).toContain('def bar');
    expect(code).toContain('# Python');
  });
});

describe('getTestCode', () => {
  it('generates console.log test code for TypeScript', () => {
    const code = getTestCode(legacyProblem, 'typescript');
    expect(code).toContain('console.log(foo([1,2,3]));');
    expect(code).toContain('// expected: 6');
  });

  it('generates console.log test code for JavaScript', () => {
    const code = getTestCode(legacyProblem, 'javascript');
    expect(code).toContain('console.log(foo([1,2,3]));');
  });

  it('generates print test code for Python', () => {
    const code = getTestCode(legacyProblem, 'python');
    expect(code).toContain('print(foo([1,2,3]))');
    expect(code).toContain('# expected: 6');
  });

  it('converts null to None for Python', () => {
    const code = getTestCode(multiLangProblem, 'python');
    expect(code).toContain('bar(None)');
  });
});

describe('hasLanguageSupport', () => {
  it('always supports TypeScript', () => {
    expect(hasLanguageSupport(legacyProblem, 'typescript')).toBe(true);
    expect(hasLanguageSupport(multiLangProblem, 'typescript')).toBe(true);
  });

  it('supports JavaScript via auto-strip for legacy', () => {
    expect(hasLanguageSupport(legacyProblem, 'javascript')).toBe(true);
  });

  it('does not support Python for legacy problems', () => {
    expect(hasLanguageSupport(legacyProblem, 'python')).toBe(false);
  });

  it('supports Python for multi-lang problems', () => {
    expect(hasLanguageSupport(multiLangProblem, 'python')).toBe(true);
  });
});

describe('getAvailableLanguages', () => {
  it('returns TS and JS for legacy problems', () => {
    const langs = getAvailableLanguages(legacyProblem);
    expect(langs).toEqual(['typescript', 'javascript']);
  });

  it('returns all three for multi-lang problems with Python', () => {
    const langs = getAvailableLanguages(multiLangProblem);
    expect(langs).toEqual(['typescript', 'javascript', 'python']);
  });
});

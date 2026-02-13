import type { Problem, SupportedLanguage, TestCase } from '../types';
import { stripTypeAnnotations } from './stripTypes';

/**
 * Get starter code for a problem in the specified language.
 * Falls back to TypeScript → auto-strip for JavaScript if no explicit JS version.
 */
export function getStarterCode(problem: Problem, lang: SupportedLanguage): string {
  const { starterCode } = problem;

  // Legacy format: single string (TypeScript)
  if (typeof starterCode === 'string') {
    if (lang === 'typescript') return starterCode;
    if (lang === 'javascript') return stripTypeAnnotations(starterCode);
    return ''; // Python not available for legacy problems
  }

  // Multi-language format
  if (lang === 'typescript') return starterCode.typescript;
  if (lang === 'javascript') {
    return starterCode.javascript ?? stripTypeAnnotations(starterCode.typescript);
  }
  return starterCode.python ?? '';
}

/**
 * Generate runnable test code string from test cases for a given language.
 */
export function getTestCode(problem: Problem, lang: SupportedLanguage): string {
  const header = '// Test your solution\n';

  if (lang === 'python') {
    return header + problem.testCases
      .map((tc) => `print(${toPythonCall(tc.input)})  # expected: ${tc.expected}`)
      .join('\n');
  }

  // TypeScript and JavaScript use the same test format
  return header + problem.testCases
    .map((tc) => `console.log(${tc.input}); // expected: ${tc.expected}`)
    .join('\n');
}

/**
 * Rough conversion of JS function call syntax to Python.
 * Handles common patterns: camelCase → snake_case, boolean literals, null → None.
 */
function toPythonCall(input: string): string {
  return input
    .replace(/\bnull\b/g, 'None')
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False');
}

/**
 * Check if a problem has starter code available for a given language.
 */
export function hasLanguageSupport(problem: Problem, lang: SupportedLanguage): boolean {
  if (lang === 'typescript') return true; // Always available
  if (typeof problem.starterCode === 'string') {
    return lang === 'javascript'; // Can auto-strip types
  }
  if (lang === 'javascript') return true; // Auto-strip fallback
  return !!problem.starterCode.python;
}

/**
 * Get the list of languages available for a problem.
 */
export function getAvailableLanguages(problem: Problem): SupportedLanguage[] {
  const langs: SupportedLanguage[] = ['typescript', 'javascript'];
  if (typeof problem.starterCode !== 'string' && problem.starterCode.python) {
    langs.push('python');
  }
  return langs;
}

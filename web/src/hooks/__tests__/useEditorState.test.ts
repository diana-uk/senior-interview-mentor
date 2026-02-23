import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorState } from '../useEditorState';
import type { Problem, SupportedLanguage } from '../../types';

// ── Mocks ──

vi.mock('../../utils/storage.js', () => ({
  safeGetItem: vi.fn(() => null),
}));

vi.mock('../../utils/problemLanguage', () => ({
  getStarterCode: vi.fn(() => 'mocked starter'),
  getTestCode: vi.fn(() => 'mocked tests'),
}));

import { safeGetItem } from '../../utils/storage.js';
import { getStarterCode, getTestCode } from '../../utils/problemLanguage';

// ── Constants matching the source ──

const DEFAULT_STARTER = `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`;
const DEFAULT_TEST = '// Write custom test cases here\nconsole.log(twoSum([2,7,11,15], 9)); // expected: [0,1]';
const DEFAULT_NOTES = '// Scratch pad\n// Pattern: HashMap\n// Key insight: store complement';

// ── Helpers ──

function makeProblem(overrides?: Partial<Problem>): Problem {
  return {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    pattern: 'HashMap',
    description: 'Find two numbers that add up to target.',
    examples: ['[2,7,11,15], target=9 => [0,1]'],
    constraints: ['2 <= nums.length <= 10^4'],
    starterCode: {
      typescript: 'function twoSum(nums: number[], target: number): number[] {}',
      python: 'def two_sum(nums, target):',
    },
    testCases: [{ input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' }],
    ...overrides,
  } as Problem;
}

describe('useEditorState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  // ── Default initialization ──

  describe('default initialization', () => {
    it('starts with DEFAULT_STARTER as editorCode', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.editorCode).toBe(DEFAULT_STARTER);
    });

    it('starts with DEFAULT_TEST as testCode', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.testCode).toBe(DEFAULT_TEST);
    });

    it('starts with DEFAULT_NOTES as notes', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.notes).toBe(DEFAULT_NOTES);
    });

    it('starts with editorTab set to "solution"', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.editorTab).toBe('solution');
    });

    it('starts with empty testResults array', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.testResults).toEqual([]);
    });

    it('starts with empty consoleLogs array', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.consoleLogs).toEqual([]);
    });

    it('starts with consoleOpen as false', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.consoleOpen).toBe(false);
    });

    it('starts with runningTests as false', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.runningTests).toBe(false);
    });

    it('defaults language to "typescript" when no saved settings', () => {
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('typescript');
    });
  });

  // ── Custom initialization via EditorInit ──

  describe('custom initialization', () => {
    it('accepts custom editorCode', () => {
      const { result } = renderHook(() =>
        useEditorState({ editorCode: 'custom code' }),
      );
      expect(result.current.editorCode).toBe('custom code');
    });

    it('accepts custom testCode', () => {
      const { result } = renderHook(() =>
        useEditorState({ testCode: 'custom test' }),
      );
      expect(result.current.testCode).toBe('custom test');
    });

    it('accepts custom notes', () => {
      const { result } = renderHook(() =>
        useEditorState({ notes: 'my notes' }),
      );
      expect(result.current.notes).toBe('my notes');
    });

    it('accepts custom editorTab', () => {
      const { result } = renderHook(() =>
        useEditorState({ editorTab: 'tests' }),
      );
      expect(result.current.editorTab).toBe('tests');
    });

    it('uses defaults for unspecified fields when some are provided', () => {
      const { result } = renderHook(() =>
        useEditorState({ editorCode: 'only code' }),
      );
      expect(result.current.editorCode).toBe('only code');
      expect(result.current.testCode).toBe(DEFAULT_TEST);
      expect(result.current.notes).toBe(DEFAULT_NOTES);
      expect(result.current.editorTab).toBe('solution');
    });
  });

  // ── Setter functions ──

  describe('setter functions', () => {
    it('setEditorCode updates editorCode', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setEditorCode('new code');
      });
      expect(result.current.editorCode).toBe('new code');
    });

    it('setTestCode updates testCode', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setTestCode('new test code');
      });
      expect(result.current.testCode).toBe('new test code');
    });

    it('setNotes updates notes', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setNotes('new notes');
      });
      expect(result.current.notes).toBe('new notes');
    });

    it('setEditorTab updates editorTab', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setEditorTab('notes');
      });
      expect(result.current.editorTab).toBe('notes');
    });

    it('setTestResults updates testResults', () => {
      const { result } = renderHook(() => useEditorState());
      const results = [{ input: 'fn(1)', expected: '2', actual: '2', passed: true }];
      act(() => {
        result.current.setTestResults(results);
      });
      expect(result.current.testResults).toEqual(results);
    });

    it('setConsoleLogs updates consoleLogs', () => {
      const { result } = renderHook(() => useEditorState());
      const logs = [{ type: 'log' as const, message: 'hello' }];
      act(() => {
        result.current.setConsoleLogs(logs);
      });
      expect(result.current.consoleLogs).toEqual(logs);
    });

    it('setConsoleOpen updates consoleOpen', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setConsoleOpen(true);
      });
      expect(result.current.consoleOpen).toBe(true);
    });

    it('setRunningTests updates runningTests', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setRunningTests(true);
      });
      expect(result.current.runningTests).toBe(true);
    });

    it('setLanguage updates language directly', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.setLanguage('python');
      });
      expect(result.current.language).toBe('python');
    });
  });

  // ── handleLanguageChange ──

  describe('handleLanguageChange', () => {
    it('updates language state', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.handleLanguageChange('python', null);
      });
      expect(result.current.language).toBe('python');
    });

    it('fetches new starter code and test code when problem is provided', () => {
      const problem = makeProblem();
      (getStarterCode as ReturnType<typeof vi.fn>).mockReturnValue('python starter');
      (getTestCode as ReturnType<typeof vi.fn>).mockReturnValue('python tests');

      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.handleLanguageChange('python', problem);
      });
      expect(getStarterCode).toHaveBeenCalledWith(problem, 'python');
      expect(getTestCode).toHaveBeenCalledWith(problem, 'python');
      expect(result.current.editorCode).toBe('python starter');
      expect(result.current.testCode).toBe('python tests');
    });

    it('does not update editor/test code when problem is null', () => {
      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.handleLanguageChange('javascript', null);
      });
      expect(getStarterCode).not.toHaveBeenCalled();
      expect(getTestCode).not.toHaveBeenCalled();
      expect(result.current.editorCode).toBe(DEFAULT_STARTER);
      expect(result.current.testCode).toBe(DEFAULT_TEST);
    });

    it('does not update editorCode when getStarterCode returns empty string', () => {
      const problem = makeProblem();
      (getStarterCode as ReturnType<typeof vi.fn>).mockReturnValue('');
      (getTestCode as ReturnType<typeof vi.fn>).mockReturnValue('valid tests');

      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.handleLanguageChange('python', problem);
      });
      // Empty string is falsy, so setEditorCode should NOT be called
      expect(result.current.editorCode).toBe(DEFAULT_STARTER);
      expect(result.current.testCode).toBe('valid tests');
    });

    it('does not update testCode when getTestCode returns empty string', () => {
      const problem = makeProblem();
      (getStarterCode as ReturnType<typeof vi.fn>).mockReturnValue('valid starter');
      (getTestCode as ReturnType<typeof vi.fn>).mockReturnValue('');

      const { result } = renderHook(() => useEditorState());
      act(() => {
        result.current.handleLanguageChange('python', problem);
      });
      expect(result.current.editorCode).toBe('valid starter');
      // Empty string is falsy, so setTestCode should NOT be called
      expect(result.current.testCode).toBe(DEFAULT_TEST);
    });
  });

  // ── Language loaded from localStorage ──

  describe('language loaded from localStorage', () => {
    it('loads "javascript" from saved settings', () => {
      (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ language: 'javascript' }),
      );
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('javascript');
    });

    it('loads "python" from saved settings', () => {
      (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ language: 'python' }),
      );
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('python');
    });

    it('defaults to "typescript" for unrecognized language', () => {
      (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ language: 'rust' }),
      );
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('typescript');
    });

    it('defaults to "typescript" when settings JSON is malformed', () => {
      (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue('not-json');
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('typescript');
    });

    it('defaults to "typescript" when settings have no language field', () => {
      (safeGetItem as ReturnType<typeof vi.fn>).mockReturnValue(
        JSON.stringify({ fontSize: 14 }),
      );
      const { result } = renderHook(() => useEditorState());
      expect(result.current.language).toBe('typescript');
    });

    it('reads from "sim-settings" key', () => {
      renderHook(() => useEditorState());
      expect(safeGetItem).toHaveBeenCalledWith('sim-settings');
    });
  });
});

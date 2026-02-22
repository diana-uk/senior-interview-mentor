import { useState, useCallback } from 'react';
import { safeGetItem } from '../utils/storage.js';
import { getStarterCode, getTestCode } from '../utils/problemLanguage';
import type {
  ConsoleMessage,
  EditorTab,
  Problem,
  SupportedLanguage,
  TestCase,
} from '../types';

interface EditorInit {
  editorCode?: string;
  testCode?: string;
  notes?: string;
  editorTab?: EditorTab;
}

const DEFAULT_STARTER = `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`;
const DEFAULT_TEST = '// Write custom test cases here\nconsole.log(twoSum([2,7,11,15], 9)); // expected: [0,1]';
const DEFAULT_NOTES = '// Scratch pad\n// Pattern: HashMap\n// Key insight: store complement';

function loadLanguage(): SupportedLanguage {
  const saved = safeGetItem('sim-settings');
  if (saved) {
    try {
      const lang = JSON.parse(saved).language;
      if (lang === 'javascript' || lang === 'python') return lang;
    } catch { /* ignore */ }
  }
  return 'typescript';
}

export function useEditorState(initial?: EditorInit) {
  const [editorCode, setEditorCode] = useState(initial?.editorCode ?? DEFAULT_STARTER);
  const [testCode, setTestCode] = useState(initial?.testCode ?? DEFAULT_TEST);
  const [notes, setNotes] = useState(initial?.notes ?? DEFAULT_NOTES);
  const [editorTab, setEditorTab] = useState<EditorTab>(initial?.editorTab ?? 'solution');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleMessage[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(loadLanguage);

  const handleLanguageChange = useCallback((newLang: SupportedLanguage, currentProblem: Problem | null) => {
    setLanguage(newLang);
    if (currentProblem) {
      const starter = getStarterCode(currentProblem, newLang);
      const tests = getTestCode(currentProblem, newLang);
      if (starter) setEditorCode(starter);
      if (tests) setTestCode(tests);
    }
  }, []);

  return {
    editorCode, setEditorCode,
    testCode, setTestCode,
    notes, setNotes,
    editorTab, setEditorTab,
    testResults, setTestResults,
    consoleLogs, setConsoleLogs,
    runningTests, setRunningTests,
    consoleOpen, setConsoleOpen,
    language, setLanguage,
    handleLanguageChange,
  };
}

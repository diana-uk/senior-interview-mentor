import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditorPanel from '../EditorPanel';
import type { EditorTab, TestCase, ConsoleMessage } from '../../../types';

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, language }: { value?: string; onChange?: (v: string) => void; language?: string }) => (
    <textarea
      data-testid="monaco-editor"
      data-language={language}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock('lucide-react', () => ({
  Play:         () => <span data-testid="icon-play" />,
  ChevronDown:  () => <span data-testid="icon-chevron-down" />,
  ChevronUp:    () => <span data-testid="icon-chevron-up" />,
  CheckCircle2: () => <span data-testid="icon-check-circle2" />,
  XCircle:      () => <span data-testid="icon-x-circle" />,
  Share2:       () => <span data-testid="icon-share2" />,
  Trash2:       () => <span data-testid="icon-trash2" />,
  RotateCcw:    () => <span data-testid="icon-rotate-ccw" />,
  Copy:         () => <span data-testid="icon-copy" />,
}));

vi.mock('../SystemDesignEditor', () => ({
  default: () => <div data-testid="system-design-editor" />,
}));

vi.mock('../../../utils/settings', () => ({
  getSettings: () => ({ theme: 'midnight' }),
}));

vi.mock('../../../utils/toast', () => ({
  showToast: vi.fn(),
}));

function makeTestCase(overrides: Partial<TestCase> = {}): TestCase {
  return {
    input: '[2,7,11,15], 9',
    expected: '[0,1]',
    passed: true,
    actual: '[0,1]',
    ...overrides,
  };
}

function makeLog(overrides: Partial<ConsoleMessage> = {}): ConsoleMessage {
  return {
    type: 'log',
    message: 'hello',
    ...overrides,
  };
}

const BASE_PROPS = {
  activeTab: 'solution' as EditorTab,
  onTabChange:       vi.fn(),
  code:              'function twoSum() {}',
  testCode:          'console.log(twoSum([2,7], 9))',
  notes:             '# My notes',
  onCodeChange:      vi.fn(),
  onTestCodeChange:  vi.fn(),
  onNotesChange:     vi.fn(),
  onRunTests:        vi.fn(),
  runningTests:      false,
  testResults:       [] as TestCase[],
  consoleLogs:       [] as ConsoleMessage[],
  consoleOpen:       false,
  onToggleConsole:   vi.fn(),
};

beforeEach(() => {
  Object.values(BASE_PROPS).forEach((v) => {
    if (typeof v === 'function' && 'mockClear' in v) (v as ReturnType<typeof vi.fn>).mockClear();
  });
});

describe('EditorPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<EditorPanel {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders Monaco editor by default', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      expect(screen.getByTestId('monaco-editor')).toBeDefined();
    });

    it('hidden prop adds panel-hidden class', () => {
      const { container } = render(<EditorPanel {...BASE_PROPS} hidden />);
      expect(container.querySelector('.panel-hidden')).not.toBeNull();
    });

    it('no panel-hidden class when not hidden', () => {
      const { container } = render(<EditorPanel {...BASE_PROPS} hidden={false} />);
      expect(container.querySelector('.panel-hidden')).toBeNull();
    });
  });

  describe('editor tabs', () => {
    it('shows Solution, Tests, Notes tabs by default', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      expect(screen.getByText('Solution')).toBeDefined();
      expect(screen.getByText('Tests')).toBeDefined();
      expect(screen.getByText('Notes')).toBeDefined();
    });

    it('active tab has editor-tab-active class', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="solution" />);
      const solutionTab = screen.getByText('Solution');
      expect(solutionTab.classList.contains('editor-tab-active')).toBe(true);
    });

    it('clicking a tab calls onTabChange with tab id', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Tests'));
      expect(BASE_PROPS.onTabChange).toHaveBeenCalledWith('tests');
    });

    it('clicking Notes tab calls onTabChange with notes', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Notes'));
      expect(BASE_PROPS.onTabChange).toHaveBeenCalledWith('notes');
    });
  });

  describe('language selector', () => {
    it('shows language select on solution tab (non-system-design)', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="solution" />);
      expect(document.querySelector('.language-select')).not.toBeNull();
    });

    it('shows language select on tests tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="tests" />);
      expect(document.querySelector('.language-select')).not.toBeNull();
    });

    it('hides language select on notes tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="notes" />);
      expect(document.querySelector('.language-select')).toBeNull();
    });

    it('shows TypeScript, JavaScript, Python options', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      expect(screen.getByText('TypeScript')).toBeDefined();
      expect(screen.getByText('JavaScript')).toBeDefined();
      expect(screen.getByText('Python')).toBeDefined();
    });

    it('changing language calls onLanguageChange', () => {
      const onLanguageChange = vi.fn();
      render(<EditorPanel {...BASE_PROPS} onLanguageChange={onLanguageChange} />);
      fireEvent.change(document.querySelector('.language-select')!, { target: { value: 'python' } });
      expect(onLanguageChange).toHaveBeenCalledWith('python');
    });

    it('selecting same language does not call onLanguageChange', () => {
      const onLanguageChange = vi.fn();
      render(<EditorPanel {...BASE_PROPS} onLanguageChange={onLanguageChange} />);
      fireEvent.change(document.querySelector('.language-select')!, { target: { value: 'typescript' } });
      expect(onLanguageChange).not.toHaveBeenCalled();
    });
  });

  describe('Run Tests button', () => {
    it('shows Run Tests button', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      expect(screen.getByText('Run Tests')).toBeDefined();
    });

    it('Run Tests button is enabled when not running', () => {
      render(<EditorPanel {...BASE_PROPS} runningTests={false} />);
      expect((screen.getByText('Run Tests').closest('button') as HTMLButtonElement).disabled).toBe(false);
    });

    it('shows Running... when runningTests=true', () => {
      render(<EditorPanel {...BASE_PROPS} runningTests={true} />);
      expect(screen.getByText('Running...')).toBeDefined();
    });

    it('Run Tests button is disabled when running', () => {
      render(<EditorPanel {...BASE_PROPS} runningTests={true} />);
      expect((screen.getByText('Running...').closest('button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('clicking Run Tests calls onRunTests', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Run Tests').closest('button')!);
      expect(BASE_PROPS.onRunTests).toHaveBeenCalledOnce();
    });
  });

  describe('reset code', () => {
    it('shows reset button when onResetCode provided (solution tab)', () => {
      render(<EditorPanel {...BASE_PROPS} onResetCode={vi.fn()} activeTab="solution" />);
      expect(screen.getByLabelText('Reset to starter code')).toBeDefined();
    });

    it('does not show reset button on tests tab', () => {
      render(<EditorPanel {...BASE_PROPS} onResetCode={vi.fn()} activeTab="tests" />);
      expect(screen.queryByLabelText('Reset to starter code')).toBeNull();
    });

    it('clicking reset button shows confirmation', () => {
      render(<EditorPanel {...BASE_PROPS} onResetCode={vi.fn()} activeTab="solution" />);
      fireEvent.click(screen.getByLabelText('Reset to starter code'));
      expect(screen.getByText('Reset to starter?')).toBeDefined();
    });

    it('clicking Reset in confirmation calls onResetCode', () => {
      const onResetCode = vi.fn();
      render(<EditorPanel {...BASE_PROPS} onResetCode={onResetCode} activeTab="solution" />);
      fireEvent.click(screen.getByLabelText('Reset to starter code'));
      fireEvent.click(screen.getByText('Reset'));
      expect(onResetCode).toHaveBeenCalledOnce();
    });

    it('clicking Cancel dismisses confirmation', () => {
      render(<EditorPanel {...BASE_PROPS} onResetCode={vi.fn()} activeTab="solution" />);
      fireEvent.click(screen.getByLabelText('Reset to starter code'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Reset to starter?')).toBeNull();
    });
  });

  describe('Share button', () => {
    it('does not show Share when no onShareSolution', () => {
      render(<EditorPanel {...BASE_PROPS} onShareSolution={undefined} />);
      expect(screen.queryByText('Share')).toBeNull();
    });

    it('does not show Share when tests not all passing', () => {
      const results = [makeTestCase({ passed: true }), makeTestCase({ passed: false })];
      render(<EditorPanel {...BASE_PROPS} onShareSolution={vi.fn()} testResults={results} />);
      expect(screen.queryByText('Share')).toBeNull();
    });

    it('shows Share when all tests pass', () => {
      const results = [makeTestCase({ passed: true }), makeTestCase({ passed: true })];
      render(<EditorPanel {...BASE_PROPS} onShareSolution={vi.fn()} testResults={results} />);
      expect(screen.getByText('Share')).toBeDefined();
    });

    it('clicking Share calls onShareSolution', () => {
      const onShareSolution = vi.fn();
      const results = [makeTestCase({ passed: true })];
      render(<EditorPanel {...BASE_PROPS} onShareSolution={onShareSolution} testResults={results} />);
      fireEvent.click(screen.getByText('Share').closest('button')!);
      expect(onShareSolution).toHaveBeenCalledOnce();
    });
  });

  describe('console / output panel', () => {
    it('shows Output toggle', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      expect(screen.getByText('Output')).toBeDefined();
    });

    it('clicking Output calls onToggleConsole', () => {
      render(<EditorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Output'));
      expect(BASE_PROPS.onToggleConsole).toHaveBeenCalledOnce();
    });

    it('shows Tests and Console output tabs when console open', () => {
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} />);
      // 'Tests' appears in both editor tabs and output tabs
      expect(screen.getAllByText('Tests').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Console')).toBeDefined();
    });

    it('shows pass count when tests provided and console open', () => {
      const results = [makeTestCase({ passed: true }), makeTestCase({ passed: false })];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      expect(screen.getByText('1/2 passed')).toBeDefined();
    });

    it('shows empty state message when no test results', () => {
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={[]} />);
      expect(screen.getByText('Run tests to see results here.')).toBeDefined();
    });

    it('shows test result input for each test', () => {
      const results = [makeTestCase({ input: '[2,7,11,15], 9', passed: true })];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      expect(screen.getByText(/Test 1: \[2,7,11,15\], 9/)).toBeDefined();
    });

    it('shows pass icon for passing test', () => {
      const results = [makeTestCase({ passed: true })];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      expect(screen.getAllByTestId('icon-check-circle2').length).toBeGreaterThan(0);
    });

    it('shows fail icon for failing test', () => {
      const results = [makeTestCase({ passed: false, actual: '[1,0]' })];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      expect(screen.getAllByTestId('icon-x-circle').length).toBeGreaterThan(0);
    });

    it('shows Got: actual value for failing test', () => {
      const results = [makeTestCase({ passed: false, actual: '[1,0]' })];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      expect(screen.getByText('[1,0]')).toBeDefined();
    });

    it('clicking Console tab switches output view', () => {
      const results = [makeTestCase()];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} />);
      fireEvent.click(screen.getByText('Console'));
      expect(screen.getByText(/Add console\.log\(\)/)).toBeDefined();
    });

    it('shows console log entries', () => {
      const logs = [makeLog({ message: 'debug output', type: 'log' })];
      render(
        <EditorPanel
          {...BASE_PROPS}
          consoleOpen={true}
          consoleLogs={logs}
          testResults={[]}
        />,
      );
      // Auto-switches to console tab when logs present and no test results
      expect(screen.getByText('debug output')).toBeDefined();
    });

    it('shows console entry count badge on Console tab', () => {
      const logs = [makeLog(), makeLog()];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} consoleLogs={logs} />);
      expect(screen.getByText('2')).toBeDefined();
    });

    it('shows Clear output button when results or logs exist', () => {
      const results = [makeTestCase()];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} onClearConsole={vi.fn()} />);
      expect(screen.getByLabelText('Clear output')).toBeDefined();
    });

    it('clicking Clear calls onClearConsole', () => {
      const onClearConsole = vi.fn();
      const results = [makeTestCase()];
      render(<EditorPanel {...BASE_PROPS} consoleOpen={true} testResults={results} onClearConsole={onClearConsole} />);
      fireEvent.click(screen.getByLabelText('Clear output'));
      expect(onClearConsole).toHaveBeenCalledOnce();
    });
  });

  describe('system design mode', () => {
    const sdProps = {
      ...BASE_PROPS,
      interviewStage: 'system-design' as const,
      systemDesignTopicId: 'url-shortener' as const,
    };

    it('shows Design and Notes tabs (not Solution/Tests)', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(screen.getByText('Design')).toBeDefined();
      expect(screen.queryByText('Tests')).toBeNull();
    });

    it('renders SystemDesignEditor on solution/design tab', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(screen.getByTestId('system-design-editor')).toBeDefined();
    });

    it('does not render Monaco editor in system-design solution tab', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(screen.queryByTestId('monaco-editor')).toBeNull();
    });

    it('hides language selector in system-design mode', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(document.querySelector('.language-select')).toBeNull();
    });

    it('hides Run Tests button in system-design mode', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(screen.queryByText('Run Tests')).toBeNull();
    });

    it('hides console / output panel in system-design mode', () => {
      render(<EditorPanel {...sdProps} activeTab="solution" />);
      expect(screen.queryByText('Output')).toBeNull();
    });
  });

  describe('editor content', () => {
    it('Monaco editor shows code value on solution tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="solution" code="my code" />);
      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(editor.value).toBe('my code');
    });

    it('Monaco editor shows testCode on tests tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="tests" testCode="test code" />);
      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(editor.value).toBe('test code');
    });

    it('Monaco editor shows notes on notes tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="notes" notes="my notes" />);
      const editor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(editor.value).toBe('my notes');
    });

    it('Monaco editor uses markdown language for notes tab', () => {
      render(<EditorPanel {...BASE_PROPS} activeTab="notes" />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor.getAttribute('data-language')).toBe('markdown');
    });
  });
});

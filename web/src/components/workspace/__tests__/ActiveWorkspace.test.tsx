import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActiveWorkspace from '../ActiveWorkspace';
import type { CommitmentGateItem, HintLevel } from '../../../types';

function makeGateItem(overrides: Partial<CommitmentGateItem> = {}): CommitmentGateItem {
  return {
    id: 'g1',
    label: 'Clarify constraints',
    completed: false,
    ...overrides,
  };
}

function makeHint(overrides: Partial<HintLevel> = {}): HintLevel {
  return {
    level: 1,
    label: 'Pattern Nudge',
    description: 'Think about the pattern',
    content: 'Use two pointers',
    unlocked: false,
    ...overrides,
  };
}

const BASE_PROPS = {
  problemTitle: 'Trapping Rain Water',
  difficulty: 'Hard' as const,
  timerDisplay: '35:00',
  commitmentGate: [
    makeGateItem({ id: 'g1', label: 'Clarify constraints', completed: false }),
    makeGateItem({ id: 'g2', label: 'Choose pattern', completed: false }),
  ],
  hints: [
    makeHint({ level: 1, label: 'Pattern Nudge', unlocked: false }),
    makeHint({ level: 2, label: 'Structure Hint', unlocked: false }),
    makeHint({ level: 3, label: 'Pseudocode', unlocked: false }),
  ],
  onToggleGateItem: vi.fn(),
  onRequestHint: vi.fn(),
  onSaveDraft: vi.fn(),
  onFinishSession: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onToggleGateItem.mockClear();
  BASE_PROPS.onRequestHint.mockClear();
  BASE_PROPS.onSaveDraft.mockClear();
  BASE_PROPS.onFinishSession.mockClear();
});

describe('ActiveWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ActiveWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows app logo', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Senior Interview Mentor')).toBeDefined();
    });

    it('shows problem title', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
    });

    it('shows difficulty badge', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Hard')).toBeDefined();
    });

    it('difficulty badge has --hard class', () => {
      render(<ActiveWorkspace {...BASE_PROPS} difficulty="Hard" />);
      expect(document.querySelector('.difficulty-badge--hard')).not.toBeNull();
    });

    it('difficulty badge has --easy class for Easy', () => {
      render(<ActiveWorkspace {...BASE_PROPS} difficulty="Easy" />);
      expect(document.querySelector('.difficulty-badge--easy')).not.toBeNull();
    });

    it('difficulty badge has --medium class for Medium', () => {
      render(<ActiveWorkspace {...BASE_PROPS} difficulty="Medium" />);
      expect(document.querySelector('.difficulty-badge--medium')).not.toBeNull();
    });

    it('shows timer display', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('35:00')).toBeDefined();
    });

    it('shows Save Draft button', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Save Draft')).toBeDefined();
    });

    it('shows Finish Session button', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Finish Session')).toBeDefined();
    });
  });

  describe('header actions', () => {
    it('clicking Save Draft calls onSaveDraft', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Save Draft'));
      expect(BASE_PROPS.onSaveDraft).toHaveBeenCalledOnce();
    });

    it('clicking Finish Session calls onFinishSession', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Finish Session'));
      expect(BASE_PROPS.onFinishSession).toHaveBeenCalledOnce();
    });
  });

  describe('mentor panel', () => {
    it('shows AI Mentor panel title', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('AI Mentor')).toBeDefined();
    });

    it('shows mentor message', () => {
      render(<ActiveWorkspace {...BASE_PROPS} mentorMessage="Think about two pointers." />);
      expect(screen.getByText('"Think about two pointers."')).toBeDefined();
    });

    it('shows default mentor message when none provided', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText(/two-pointer approach/)).toBeDefined();
    });

    it('shows Ask for a nudge input', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Ask for a nudge...')).toBeDefined();
    });
  });

  describe('hint ladder', () => {
    it('shows HINT LADDER heading', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('HINT LADDER')).toBeDefined();
    });

    it('shows all 3 hints', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText(/Level 1: Pattern Nudge/)).toBeDefined();
      expect(screen.getByText(/Level 2: Structure Hint/)).toBeDefined();
      expect(screen.getByText(/Level 3: Pseudocode/)).toBeDefined();
    });

    it('shows hint description when locked', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getAllByText('Think about the pattern').length).toBeGreaterThan(0);
    });

    it('shows hint content when unlocked', () => {
      const hints = [makeHint({ level: 1, unlocked: true, content: 'Use two pointers' })];
      render(<ActiveWorkspace {...BASE_PROPS} hints={hints} />);
      expect(screen.getByText('Use two pointers')).toBeDefined();
    });

    it('clicking a locked hint calls onRequestHint with that level', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      const hintSteps = document.querySelectorAll('.aw__hint-step--locked');
      fireEvent.click(hintSteps[0]);
      expect(BASE_PROPS.onRequestHint).toHaveBeenCalledWith(1);
    });

    it('clicking an unlocked hint does not call onRequestHint', () => {
      const hints = [makeHint({ level: 1, unlocked: true })];
      render(<ActiveWorkspace {...BASE_PROPS} hints={hints} />);
      const unlocked = document.querySelector('.aw__hint-step--unlocked')!;
      fireEvent.click(unlocked);
      expect(BASE_PROPS.onRequestHint).not.toHaveBeenCalled();
    });
  });

  describe('commitment gate checklist', () => {
    it('shows Pre-coding Checklist panel title', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Pre-coding Checklist')).toBeDefined();
    });

    it('shows COMMITMENT PROGRESS label', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('COMMITMENT PROGRESS')).toBeDefined();
    });

    it('shows 0% when no items completed', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('0%')).toBeDefined();
    });

    it('shows 50% when half items completed', () => {
      const items = [
        makeGateItem({ id: 'g1', completed: true }),
        makeGateItem({ id: 'g2', completed: false }),
      ];
      render(<ActiveWorkspace {...BASE_PROPS} commitmentGate={items} />);
      expect(screen.getByText('50%')).toBeDefined();
    });

    it('shows 100% when all items completed', () => {
      const items = [
        makeGateItem({ id: 'g1', completed: true }),
        makeGateItem({ id: 'g2', completed: true }),
      ];
      render(<ActiveWorkspace {...BASE_PROPS} commitmentGate={items} />);
      expect(screen.getByText('100%')).toBeDefined();
    });

    it('shows gate item labels', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Clarify constraints')).toBeDefined();
      expect(screen.getByText('Choose pattern')).toBeDefined();
    });

    it('clicking a gate item calls onToggleGateItem with its id', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      const items = document.querySelectorAll('.aw__gate-item');
      fireEvent.click(items[0]);
      expect(BASE_PROPS.onToggleGateItem).toHaveBeenCalledWith('g1');
    });

    it('View Solution button is disabled when not all completed', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect((screen.getByText('View Solution') as HTMLButtonElement).disabled).toBe(true);
    });

    it('View Solution button is enabled when all completed', () => {
      const items = [
        makeGateItem({ id: 'g1', completed: true }),
        makeGateItem({ id: 'g2', completed: true }),
      ];
      render(<ActiveWorkspace {...BASE_PROPS} commitmentGate={items} />);
      expect((screen.getByText('View Solution') as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('code editor panel', () => {
    it('shows language label in editor header', () => {
      render(<ActiveWorkspace {...BASE_PROPS} language="Python 3" />);
      expect(screen.getByText('Python 3')).toBeDefined();
    });

    it('shows custom code lines when provided', () => {
      render(<ActiveWorkspace {...BASE_PROPS} codeLines={['def hello():', '    pass']} />);
      // Code is rendered via dangerouslySetInnerHTML, check line numbers
      const lineNums = document.querySelectorAll('.aw__editor-linenum');
      expect(lineNums.length).toBe(2);
    });

    it('shows default code (6 lines) when codeLines not provided', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      const lineNums = document.querySelectorAll('.aw__editor-linenum');
      expect(lineNums.length).toBe(6);
    });

    it('shows Console panel', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Console')).toBeDefined();
    });
  });

  describe('footer', () => {
    it('shows System Ready status', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('System Ready')).toBeDefined();
    });

    it('shows Keyboard Shortcuts text', () => {
      render(<ActiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Keyboard Shortcuts')).toBeDefined();
    });
  });
});

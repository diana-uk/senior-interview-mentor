import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatternQuizPanel from '../PatternQuizPanel';

vi.mock('lucide-react', () => ({
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  XCircle: () => <span data-testid="icon-x-circle" />,
  SkipForward: () => <span data-testid="icon-skip" />,
  Play: () => <span data-testid="icon-play" />,
  Brain: () => <span data-testid="icon-brain" />,
}));

// Single problem — Math.floor(Math.random() * 1) === 0 always, so deterministic
vi.mock('../../../data/problems', () => ({
  allFullProblems: [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      pattern: 'HashMap',
      description: 'Given an array of integers, return indices of two numbers that add up to target.',
    },
  ],
}));

const mockRecordAttempt = vi.fn();
const mockGetAccuracy = vi.fn(() => null);

const mockHookState = {
  scores: {} as Record<string, { correct: number; total: number }>,
  recordAttempt: mockRecordAttempt,
  getAccuracy: mockGetAccuracy,
};

vi.mock('../../../hooks/usePatternQuiz', () => ({
  usePatternQuiz: () => mockHookState,
}));

const BASE_PROPS = {
  onSelectProblem: vi.fn(),
};

beforeEach(() => {
  mockHookState.scores = {};
  mockRecordAttempt.mockClear();
  mockGetAccuracy.mockClear();
  BASE_PROPS.onSelectProblem.mockClear();
});

/**
 * At 'answering' state: exactly 4 choice buttons. Return the first whose
 * text doesn't include 'HashMap' (the correct answer for our mocked problem).
 */
function getWrongChoiceButton() {
  return screen.getAllByRole('button').find((btn) => !btn.textContent?.includes('HashMap'))!;
}

describe('PatternQuizPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<PatternQuizPanel {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows "Pattern Quiz" label', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('Pattern Quiz')).toBeDefined();
    });

    it('shows problem title', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('Two Sum')).toBeDefined();
    });

    it('shows difficulty badge', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('Easy')).toBeDefined();
    });

    it('shows question text', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText(/Which pattern best solves this problem/i)).toBeDefined();
    });

    it('renders exactly 4 choice buttons in answering state', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getAllByRole('button').length).toBe(4);
    });

    it('correct answer is among the choices', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'HashMap' })).toBeDefined();
    });
  });

  describe('score header', () => {
    it('does not show score when no attempts recorded', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.queryByText(/correct$/)).toBeNull();
    });

    it('shows X/Y correct when scores exist', () => {
      mockHookState.scores = { HashMap: { correct: 3, total: 5 } };
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('3/5 correct')).toBeDefined();
    });
  });

  describe('answering correctly', () => {
    it('clicking correct answer shows Correct! feedback', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      expect(screen.getByText(/Correct!/)).toBeDefined();
    });

    it('shows Start Solving button after correct answer', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      expect(screen.getByRole('button', { name: /Start Solving/i })).toBeDefined();
    });

    it('shows Next Problem button after correct answer', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      expect(screen.getByRole('button', { name: /Next Problem/i })).toBeDefined();
    });

    it('choice buttons are disabled after answering correctly', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      expect(screen.getByRole('button', { name: 'HashMap' }).hasAttribute('disabled')).toBe(true);
    });

    it('recordAttempt called with correct pattern and firstTry=true', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      expect(mockRecordAttempt).toHaveBeenCalledWith('HashMap', true);
    });

    it('Start Solving calls onSelectProblem with problem id', () => {
      const onSelectProblem = vi.fn();
      render(<PatternQuizPanel {...BASE_PROPS} onSelectProblem={onSelectProblem} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      fireEvent.click(screen.getByRole('button', { name: /Start Solving/i }));
      expect(onSelectProblem).toHaveBeenCalledWith('two-sum');
    });

    it('Next Problem resets to answering state (hides Correct feedback)', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'HashMap' }));
      fireEvent.click(screen.getByRole('button', { name: /Next Problem/i }));
      expect(screen.queryByText(/Correct!/)).toBeNull();
    });
  });

  describe('answering wrong', () => {
    it('clicking wrong answer shows "Not quite" feedback', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      expect(screen.getByText(/Not quite/)).toBeDefined();
    });

    it('shows Try Again button after wrong answer', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeDefined();
    });

    it('shows Skip button after wrong answer', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      expect(screen.getByRole('button', { name: /Skip/i })).toBeDefined();
    });

    it('recordAttempt called with firstTry=false on wrong answer', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      expect(mockRecordAttempt).toHaveBeenCalledWith('HashMap', false);
    });

    it('Try Again resets to answering state (hides Not quite feedback)', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
      expect(screen.queryByText(/Not quite/)).toBeNull();
    });

    it('Skip resets to answering state (hides Not quite feedback)', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      fireEvent.click(getWrongChoiceButton());
      fireEvent.click(screen.getByRole('button', { name: /Skip/i }));
      expect(screen.queryByText(/Not quite/)).toBeNull();
    });
  });

  describe('pattern accuracy stats', () => {
    it('shows accuracy section when scores exist', () => {
      mockHookState.scores = { HashMap: { correct: 4, total: 5 } };
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('Your Pattern Accuracy')).toBeDefined();
    });

    it('shows percentage in accuracy row', () => {
      mockHookState.scores = { HashMap: { correct: 4, total: 5 } };
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('80%')).toBeDefined();
    });

    it('does not show accuracy section when scores are empty', () => {
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.queryByText('Your Pattern Accuracy')).toBeNull();
    });

    it('shows accuracy for multiple patterns sorted by accuracy', () => {
      mockHookState.scores = {
        HashMap: { correct: 4, total: 5 },
        'Binary Search': { correct: 1, total: 4 },
      };
      render(<PatternQuizPanel {...BASE_PROPS} />);
      expect(screen.getByText('25%')).toBeDefined();
      expect(screen.getByText('80%')).toBeDefined();
    });
  });
});

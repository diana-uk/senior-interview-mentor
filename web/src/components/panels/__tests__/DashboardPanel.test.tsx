import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPanel from '../DashboardPanel';
import type { StatsData, PatternStrength, SessionRecord } from '../../../types';

vi.mock('lucide-react', () => ({
  Zap: () => <span data-testid="icon-zap" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Flame: () => <span data-testid="icon-flame" />,
  BookOpen: () => <span data-testid="icon-book" />,
  Clock: () => <span data-testid="icon-clock" />,
}));

vi.mock('../../../data/problems', () => ({
  allProblemsList: [
    { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', pattern: 'HashMap' },
    { id: 'binary-search', title: 'Binary Search', difficulty: 'Easy', pattern: 'Binary Search' },
  ],
}));

function makeStats(overrides: Partial<StatsData> = {}): StatsData {
  return {
    problemsSolved: 0,
    totalAttempts: 0,
    totalTime: 0,
    hintsUsed: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    avgScore: 0,
    patternStrengths: [],
    sessions: [],
    problemProgress: {},
    reviews: [],
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 's1',
    date: new Date().toISOString().split('T')[0],
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    mode: 'TEACHER',
    duration: 300,
    hintsUsed: 0,
    score: null,
    patterns: [],
    ...overrides,
  };
}

function makeStrength(pattern: string, solved: number, attempted: number): PatternStrength {
  return { pattern: pattern as never, solved, attempted };
}

const BASE_PROPS = {
  stats: makeStats(),
  onSelectProblem: vi.fn(),
};

describe('DashboardPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<DashboardPanel {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders streak count', () => {
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ currentStreak: 7 })} />);
      expect(screen.getByText('7')).toBeDefined();
    });

    it('renders "day streak" label', () => {
      render(<DashboardPanel {...BASE_PROPS} />);
      expect(screen.getByText('day streak')).toBeDefined();
    });

    it('renders streak of 0', () => {
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ currentStreak: 0 })} />);
      expect(screen.getByText('0')).toBeDefined();
    });
  });

  describe('greeting', () => {
    it('renders a greeting text', () => {
      render(<DashboardPanel {...BASE_PROPS} />);
      const greeting = screen.queryByText(/good morning/i) ||
        screen.queryByText(/good afternoon/i) ||
        screen.queryByText(/good evening/i);
      expect(greeting).not.toBeNull();
    });
  });

  describe('Random Problem button', () => {
    it('renders Random Problem button', () => {
      render(<DashboardPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /random problem/i })).toBeDefined();
    });

    it('clicking Random Problem calls onSelectProblem', () => {
      const onSelectProblem = vi.fn();
      render(<DashboardPanel {...BASE_PROPS} onSelectProblem={onSelectProblem} />);
      fireEvent.click(screen.getByRole('button', { name: /random problem/i }));
      expect(onSelectProblem).toHaveBeenCalledOnce();
    });

    it('Random Problem calls onSelectProblem with a problem id from the list', () => {
      const onSelectProblem = vi.fn();
      render(<DashboardPanel {...BASE_PROPS} onSelectProblem={onSelectProblem} />);
      fireEvent.click(screen.getByRole('button', { name: /random problem/i }));
      const id = onSelectProblem.mock.calls[0][0];
      expect(['two-sum', 'binary-search']).toContain(id);
    });
  });

  describe('Resume Last button', () => {
    it('shows Resume Last when sessions exist', () => {
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ sessions: [makeSession()] })} />);
      expect(screen.getByRole('button', { name: /resume last/i })).toBeDefined();
    });

    it('does not show Resume Last when no sessions', () => {
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ sessions: [] })} />);
      expect(screen.queryByRole('button', { name: /resume last/i })).toBeNull();
    });

    it('Resume Last is disabled when last session has no problemId', () => {
      const session = makeSession({ problemId: null });
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ sessions: [session] })} />);
      const btn = screen.getByRole('button', { name: /resume last/i });
      expect(btn.hasAttribute('disabled')).toBe(true);
    });

    it('clicking Resume Last calls onSelectProblem with last problemId', () => {
      const onSelectProblem = vi.fn();
      const session = makeSession({ problemId: 'two-sum' });
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ sessions: [session] })} onSelectProblem={onSelectProblem} />);
      fireEvent.click(screen.getByRole('button', { name: /resume last/i }));
      expect(onSelectProblem).toHaveBeenCalledWith('two-sum');
    });
  });

  describe('daily challenge', () => {
    const challenge = { id: 'dp-1', title: 'Climbing Stairs', difficulty: 'Easy', pattern: 'Dynamic Programming', readinessScore: 80, urgency: 0, dueCount: 0 };

    it('shows daily challenge card when provided', () => {
      render(<DashboardPanel {...BASE_PROPS} dailyChallenge={challenge} />);
      expect(screen.getByText('Daily Challenge')).toBeDefined();
    });

    it('shows challenge title', () => {
      render(<DashboardPanel {...BASE_PROPS} dailyChallenge={challenge} />);
      expect(screen.getByText('Climbing Stairs')).toBeDefined();
    });

    it('shows challenge pattern', () => {
      render(<DashboardPanel {...BASE_PROPS} dailyChallenge={challenge} />);
      expect(screen.getByText('Dynamic Programming')).toBeDefined();
    });

    it('does not show daily challenge section when not provided', () => {
      render(<DashboardPanel {...BASE_PROPS} dailyChallenge={null} />);
      expect(screen.queryByText('Daily Challenge')).toBeNull();
    });

    it('clicking daily challenge calls onSelectProblem', () => {
      const onSelectProblem = vi.fn();
      render(<DashboardPanel {...BASE_PROPS} dailyChallenge={challenge} onSelectProblem={onSelectProblem} />);
      fireEvent.click(screen.getByText('Climbing Stairs'));
      expect(onSelectProblem).toHaveBeenCalledWith('dp-1');
    });
  });

  describe('weak areas', () => {
    it('shows "Needs Work" section when weak areas exist', () => {
      const strengths = [makeStrength('HashMap', 1, 5)];
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ patternStrengths: strengths })} />);
      expect(screen.getByText('Needs Work')).toBeDefined();
    });

    it('shows weak area pattern name', () => {
      const strengths = [makeStrength('HashMap', 1, 5)];
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ patternStrengths: strengths })} />);
      expect(screen.getByText('HashMap')).toBeDefined();
    });

    it('does not show "Needs Work" when no pattern strengths', () => {
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ patternStrengths: [] })} />);
      expect(screen.queryByText('Needs Work')).toBeNull();
    });

    it('does not show "Needs Work" when no patterns have been attempted', () => {
      const strengths = [makeStrength('HashMap', 0, 0)];
      render(<DashboardPanel {...BASE_PROPS} stats={makeStats({ patternStrengths: strengths })} />);
      expect(screen.queryByText('Needs Work')).toBeNull();
    });
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatsPanel from '../StatsPanel';
import type { PatternStrength, ReviewResult, SessionRecord, StatsData } from '../../../types';

vi.mock('lucide-react', () => ({
  BarChart2: () => <span data-testid="icon-bar-chart" />,
}));

vi.mock('../../ui/EmptyState', () => ({
  default: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

const mockGetBadgesForProblem = vi.fn(() => []);
vi.mock('../../../utils/solutionBadges', () => ({
  getBadgesForProblem: (...args: unknown[]) => mockGetBadgesForProblem(...args),
}));

const mockComputeDifficultyDistribution = vi.fn(() => [
  { difficulty: 'Easy', solved: 5, attempted: 3, total: 50, color: '#00ff88' },
  { difficulty: 'Medium', solved: 2, attempted: 4, total: 80, color: '#ffaa00' },
  { difficulty: 'Hard', solved: 0, attempted: 1, total: 20, color: '#ff3366' },
]);
vi.mock('../../../utils/difficultyDistribution', () => ({
  computeDifficultyDistribution: (...args: unknown[]) => mockComputeDifficultyDistribution(...args),
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
    date: '2026-01-15',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    mode: 'TEACHER',
    duration: 300,
    hintsUsed: 0,
    score: 3.5,
    patterns: [],
    ...overrides,
  };
}

function makeStrength(
  pattern: PatternStrength['pattern'],
  solved: number,
  attempted: number,
  avgScore: number,
): PatternStrength {
  return { pattern, solved, attempted, avgScore, lastPracticed: null };
}

function makeReview(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    id: 'r1',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    dimensions: [],
    overallScore: 3.5,
    feedback: '',
    improvementPlan: [],
    createdAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockGetBadgesForProblem.mockReturnValue([]);
  mockComputeDifficultyDistribution.mockReturnValue([
    { difficulty: 'Easy', solved: 5, attempted: 3, total: 50, color: '#00ff88' },
    { difficulty: 'Medium', solved: 2, attempted: 4, total: 80, color: '#ffaa00' },
    { difficulty: 'Hard', solved: 0, attempted: 1, total: 20, color: '#ff3366' },
  ]);
});

describe('StatsPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<StatsPanel stats={makeStats()} />)).not.toThrow();
    });
  });

  describe('top stats grid', () => {
    it('shows problems solved count', () => {
      render(<StatsPanel stats={makeStats({ problemsSolved: 42 })} />);
      expect(screen.getByText('42')).toBeDefined();
    });

    it('shows "Solved" label', () => {
      render(<StatsPanel stats={makeStats()} />);
      expect(screen.getByText('Solved')).toBeDefined();
    });

    it('shows streak with d suffix', () => {
      render(<StatsPanel stats={makeStats({ currentStreak: 7 })} />);
      expect(screen.getByText('7d')).toBeDefined();
    });

    it('shows "Streak" label', () => {
      render(<StatsPanel stats={makeStats()} />);
      expect(screen.getByText('Streak')).toBeDefined();
    });

    it('shows — for avg score when no attempts', () => {
      render(<StatsPanel stats={makeStats({ totalAttempts: 0 })} />);
      expect(screen.getByText('—')).toBeDefined();
    });

    it('shows formatted avg score when attempts exist', () => {
      render(<StatsPanel stats={makeStats({ totalAttempts: 5, avgScore: 3.2 })} />);
      expect(screen.getByText('3.2')).toBeDefined();
    });

    it('shows "Avg Score" label', () => {
      render(<StatsPanel stats={makeStats()} />);
      expect(screen.getByText('Avg Score')).toBeDefined();
    });

    it('shows hints used count', () => {
      render(<StatsPanel stats={makeStats({ hintsUsed: 12 })} />);
      expect(screen.getByText('12')).toBeDefined();
    });

    it('shows "Hints Used" label', () => {
      render(<StatsPanel stats={makeStats()} />);
      expect(screen.getByText('Hints Used')).toBeDefined();
    });
  });

  describe('difficulty distribution', () => {
    it('does not show Difficulty Progress when getProblemStatus not provided', () => {
      render(<StatsPanel stats={makeStats()} />);
      expect(screen.queryByText('Difficulty Progress')).toBeNull();
    });

    it('shows Difficulty Progress section when getProblemStatus provided', () => {
      render(<StatsPanel stats={makeStats()} getProblemStatus={vi.fn(() => 'unseen')} />);
      expect(screen.getByText('Difficulty Progress')).toBeDefined();
    });

    it('shows difficulty labels from mock buckets', () => {
      render(<StatsPanel stats={makeStats()} getProblemStatus={vi.fn(() => 'unseen')} />);
      expect(screen.getByText('Easy')).toBeDefined();
      expect(screen.getByText('Medium')).toBeDefined();
      expect(screen.getByText('Hard')).toBeDefined();
    });

    it('shows solved/total counts', () => {
      render(<StatsPanel stats={makeStats()} getProblemStatus={vi.fn(() => 'unseen')} />);
      expect(screen.getByText('5/50')).toBeDefined();
    });
  });

  describe('total practice time', () => {
    it('does not show time card when totalTime is 0', () => {
      render(<StatsPanel stats={makeStats({ totalTime: 0 })} />);
      expect(screen.queryByText('Total Practice Time')).toBeNull();
    });

    it('shows "Total Practice Time" label when totalTime > 0', () => {
      render(<StatsPanel stats={makeStats({ totalTime: 3600 })} />);
      expect(screen.getByText('Total Practice Time')).toBeDefined();
    });

    it('formats time as hours and minutes', () => {
      render(<StatsPanel stats={makeStats({ totalTime: 5400 })} />);
      expect(screen.getByText('1h 30m')).toBeDefined();
    });

    it('formats time as minutes only when under 1 hour', () => {
      render(<StatsPanel stats={makeStats({ totalTime: 1800 })} />);
      expect(screen.getByText('30m')).toBeDefined();
    });
  });

  describe('daily activity', () => {
    it('does not show Daily Activity when no sessions', () => {
      render(<StatsPanel stats={makeStats({ sessions: [] })} />);
      expect(screen.queryByText('Daily Activity')).toBeNull();
    });

    it('shows Daily Activity section when sessions exist', () => {
      render(<StatsPanel stats={makeStats({ sessions: [makeSession()] })} />);
      expect(screen.getByText('Daily Activity')).toBeDefined();
    });
  });

  describe('pattern strength', () => {
    it('does not show Pattern Strength when no patterns have attempts', () => {
      render(<StatsPanel stats={makeStats({ patternStrengths: [] })} />);
      expect(screen.queryByText('Pattern Strength')).toBeNull();
    });

    it('shows Pattern Strength label when patterns exist', () => {
      const ps = [makeStrength('HashMap', 3, 5, 2.8)];
      render(<StatsPanel stats={makeStats({ patternStrengths: ps })} />);
      expect(screen.getByText('Pattern Strength')).toBeDefined();
    });

    it('shows pattern name', () => {
      const ps = [makeStrength('HashMap', 3, 5, 2.8)];
      render(<StatsPanel stats={makeStats({ patternStrengths: ps })} />);
      expect(screen.getByText('HashMap')).toBeDefined();
    });

    it('shows solved/attempted for pattern', () => {
      const ps = [makeStrength('HashMap', 3, 5, 2.8)];
      render(<StatsPanel stats={makeStats({ patternStrengths: ps })} />);
      expect(screen.getByText('3/5')).toBeDefined();
    });
  });

  describe('scorecard history', () => {
    it('does not show Scorecard History when no reviews', () => {
      render(<StatsPanel stats={makeStats({ reviews: [] })} />);
      expect(screen.queryByText('Scorecard History')).toBeNull();
    });

    it('shows Scorecard History label when reviews exist', () => {
      render(<StatsPanel stats={makeStats({ reviews: [makeReview()] })} />);
      expect(screen.getByText('Scorecard History')).toBeDefined();
    });

    it('shows review problem title', () => {
      render(<StatsPanel stats={makeStats({ reviews: [makeReview({ problemTitle: 'Binary Search' })] })} />);
      expect(screen.getByText('Binary Search')).toBeDefined();
    });

    it('shows review score formatted to 1 decimal', () => {
      render(<StatsPanel stats={makeStats({ reviews: [makeReview({ overallScore: 3.5 })] })} />);
      expect(screen.getByText('3.5')).toBeDefined();
    });

    it('shows up arrow trend when score improved', () => {
      const reviews = [
        makeReview({ id: 'r1', overallScore: 3.5 }),
        makeReview({ id: 'r2', overallScore: 2.5 }),
      ];
      render(<StatsPanel stats={makeStats({ reviews })} />);
      expect(screen.getByText('▲')).toBeDefined();
    });

    it('shows down arrow trend when score dropped', () => {
      const reviews = [
        makeReview({ id: 'r1', overallScore: 2.0 }),
        makeReview({ id: 'r2', overallScore: 3.5 }),
      ];
      render(<StatsPanel stats={makeStats({ reviews })} />);
      expect(screen.getByText('▼')).toBeDefined();
    });
  });

  describe('recent sessions', () => {
    it('shows EmptyState when no sessions', () => {
      render(<StatsPanel stats={makeStats({ sessions: [] })} />);
      expect(screen.getByTestId('empty-state')).toBeDefined();
    });

    it('EmptyState title is "No sessions yet"', () => {
      render(<StatsPanel stats={makeStats({ sessions: [] })} />);
      expect(screen.getByText('No sessions yet')).toBeDefined();
    });

    it('does not show EmptyState when sessions exist', () => {
      render(<StatsPanel stats={makeStats({ sessions: [makeSession()] })} />);
      expect(screen.queryByTestId('empty-state')).toBeNull();
    });

    it('shows session problem title', () => {
      render(<StatsPanel stats={makeStats({ sessions: [makeSession({ problemTitle: 'Binary Search' })] })} />);
      expect(screen.getByText('Binary Search')).toBeDefined();
    });

    it('shows session score formatted to 1 decimal', () => {
      render(<StatsPanel stats={makeStats({ sessions: [makeSession({ score: 3.5 })] })} />);
      // score is displayed as s.score !== null ? s.score.toFixed(1) : '—'
      expect(screen.getByText('3.5')).toBeDefined();
    });

    it('shows — for null session score', () => {
      // Use totalAttempts > 0 so avg score shows a value (not "—") — avoids ambiguity
      render(<StatsPanel stats={makeStats({ totalAttempts: 5, avgScore: 3.2, sessions: [makeSession({ score: null })] })} />);
      expect(screen.getByText('—')).toBeDefined();
    });
  });
});

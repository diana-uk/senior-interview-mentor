import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AchievementsPanel from '../AchievementsPanel';
import type { Achievement, ReviewResult, SessionRecord, StatsData } from '../../../types';

vi.mock('lucide-react', () => ({
  Download: () => <span data-testid="icon-download" />,
}));

const mockExportProfileCard = vi.fn();
vi.mock('../../../utils/profileCard', () => ({
  exportProfileCard: (...args: unknown[]) => mockExportProfileCard(...args),
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

function makeReview(overrides: Partial<ReviewResult> = {}): ReviewResult {
  return {
    id: 'r1',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    dimensions: [],
    overallScore: 3.8,
    feedback: '',
    improvementPlan: [],
    createdAt: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'first-solve',
    title: 'First Solve',
    description: 'Solve your first problem',
    icon: '🎯',
    category: 'milestones',
    ...overrides,
  };
}

const BASE_PROPS = {
  achievements: [],
  unlockedCount: 0,
  totalCount: 17,
  stats: makeStats(),
};

beforeEach(() => {
  mockExportProfileCard.mockClear();
});

describe('AchievementsPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<AchievementsPanel {...BASE_PROPS} />)).not.toThrow();
    });
  });

  describe('progress bar', () => {
    it('shows X / Y Unlocked text', () => {
      render(<AchievementsPanel {...BASE_PROPS} unlockedCount={3} totalCount={17} />);
      expect(screen.getByText(/3 \/ 17 Unlocked/)).toBeDefined();
    });

    it('shows rounded percentage', () => {
      render(<AchievementsPanel {...BASE_PROPS} unlockedCount={3} totalCount={17} />);
      // Math.round(3/17*100) = 18
      expect(screen.getByText('18%')).toBeDefined();
    });

    it('shows 0% when none unlocked', () => {
      render(<AchievementsPanel {...BASE_PROPS} unlockedCount={0} totalCount={17} />);
      expect(screen.getByText('0%')).toBeDefined();
    });
  });

  describe('achievement categories', () => {
    it('shows category label for milestones', () => {
      render(<AchievementsPanel {...BASE_PROPS} achievements={[makeAchievement({ category: 'milestones' })]} />);
      expect(screen.getByText('Milestones')).toBeDefined();
    });

    it('shows category label for streaks', () => {
      render(<AchievementsPanel {...BASE_PROPS} achievements={[makeAchievement({ category: 'streaks', id: 'streak-3' })]} />);
      expect(screen.getByText('Streaks')).toBeDefined();
    });

    it('does not show category label when no achievements in that category', () => {
      render(<AchievementsPanel {...BASE_PROPS} achievements={[]} />);
      expect(screen.queryByText('Milestones')).toBeNull();
    });

    it('shows achievement title', () => {
      render(<AchievementsPanel {...BASE_PROPS} achievements={[makeAchievement({ title: 'First Solve' })]} />);
      expect(screen.getByText('First Solve')).toBeDefined();
    });

    it('shows achievement description', () => {
      render(<AchievementsPanel {...BASE_PROPS} achievements={[makeAchievement({ description: 'Solve your first problem' })]} />);
      expect(screen.getByText('Solve your first problem')).toBeDefined();
    });

    it('shows title of locked achievement (no unlockedAt)', () => {
      const locked = makeAchievement({ title: 'Locked Badge' });
      render(<AchievementsPanel {...BASE_PROPS} achievements={[locked]} />);
      expect(screen.getByText('Locked Badge')).toBeDefined();
    });

    it('shows title of unlocked achievement', () => {
      const unlocked = makeAchievement({ title: 'Unlocked Badge', unlockedAt: '2026-01-01T00:00:00Z' });
      render(<AchievementsPanel {...BASE_PROPS} achievements={[unlocked]} />);
      expect(screen.getByText('Unlocked Badge')).toBeDefined();
    });

    it('renders multiple achievements in the same category', () => {
      const achievements = [
        makeAchievement({ id: 'first-solve', title: 'First Solve' }),
        makeAchievement({ id: 'ten-solved', title: 'Ten Solved' }),
      ];
      render(<AchievementsPanel {...BASE_PROPS} achievements={achievements} />);
      expect(screen.getByText('First Solve')).toBeDefined();
      expect(screen.getByText('Ten Solved')).toBeDefined();
    });
  });

  describe('activity heatmap', () => {
    it('shows Activity section label', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByText(/Activity \(365 Days\)/)).toBeDefined();
    });

    it('shows Less and More legend labels', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByText('Less')).toBeDefined();
      expect(screen.getByText('More')).toBeDefined();
    });
  });

  describe('personal records', () => {
    it('shows Personal Records section label', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByText('Personal Records')).toBeDefined();
    });

    it('shows Longest Streak label', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByText('Longest Streak')).toBeDefined();
    });

    it('shows longestStreak value with d suffix', () => {
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ longestStreak: 7 })} />);
      expect(screen.getByText('7d')).toBeDefined();
    });

    it('shows "Most in a Day" label', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByText('Most in a Day')).toBeDefined();
    });

    it('shows 0 for Most in a Day when no sessions', () => {
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ sessions: [] })} />);
      expect(screen.getByText('0')).toBeDefined();
    });

    it('shows -- for Fastest Solve when no qualifying sessions', () => {
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ sessions: [] })} />);
      // '--' appears for both Fastest Solve and Best Review when none
      expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    });

    it('shows formatted time for Fastest Solve when qualifying session exists', () => {
      const sessions = [makeSession({ duration: 300, score: 3.5 })];
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ sessions })} />);
      expect(screen.getByText('5:00')).toBeDefined();
    });

    it('shows -- for Best Review when no reviews', () => {
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ reviews: [] })} />);
      expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    });

    it('shows best review score when reviews exist', () => {
      const reviews = [makeReview({ overallScore: 3.8 })];
      render(<AchievementsPanel {...BASE_PROPS} stats={makeStats({ reviews })} />);
      expect(screen.getByText('3.8')).toBeDefined();
    });
  });

  describe('Share Profile Card', () => {
    it('renders Share Profile Card button', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /Share Profile Card/i })).toBeDefined();
    });

    it('clicking Share Profile Card calls exportProfileCard', () => {
      render(<AchievementsPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /Share Profile Card/i }));
      expect(mockExportProfileCard).toHaveBeenCalledOnce();
    });

    it('exportProfileCard called with achievements and counts', () => {
      const achievements = [makeAchievement()];
      render(<AchievementsPanel {...BASE_PROPS} achievements={achievements} unlockedCount={1} totalCount={17} />);
      fireEvent.click(screen.getByRole('button', { name: /Share Profile Card/i }));
      const call = mockExportProfileCard.mock.calls[0][0];
      expect(call.unlockedCount).toBe(1);
      expect(call.totalCount).toBe(17);
    });
  });
});

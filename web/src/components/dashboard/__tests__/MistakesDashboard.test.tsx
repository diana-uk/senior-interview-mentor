import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MistakesDashboard from '../MistakesDashboard';
import type { Difficulty } from '../../../types';

interface PriorityArea {
  id: string; icon: string; name: string; rubricScore: number;
  color: string; spacedRepStatus: string; progressWidth: number; isUrgent: boolean;
}

interface MistakeRow {
  id: string; problemName: string; coreMistake: string;
  highlightedText: string; difficulty: Difficulty; lastAttempt: string;
}

function makePriority(overrides: Partial<PriorityArea> = {}): PriorityArea {
  return {
    id: 'dp',
    icon: 'dynamic_form',
    name: 'Dynamic Programming',
    rubricScore: 42,
    color: 'var(--neon-amber)',
    spacedRepStatus: 'Due in 2 days',
    progressWidth: 80,
    isUrgent: false,
    ...overrides,
  };
}

function makeMistake(overrides: Partial<MistakeRow> = {}): MistakeRow {
  return {
    id: 'm1',
    problemName: 'Two Sum',
    coreMistake: 'Failed to handle',
    highlightedText: 'duplicates',
    difficulty: 'Easy',
    lastAttempt: '1 hour ago',
    ...overrides,
  };
}

const BASE_PROPS = {
  onNavigate: vi.fn(),
  activeNav: 'mistakes',
  priorityAreas: [makePriority()],
  mistakes: [makeMistake()],
  onRetry: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onNavigate.mockClear();
  BASE_PROPS.onRetry.mockClear();
});

describe('MistakesDashboard', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<MistakesDashboard {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows Mistakes & Progress heading', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Mistakes & Progress')).toBeDefined();
    });

    it('shows Dashboard subtitle', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Dashboard')).toBeDefined();
    });
  });

  describe('sidebar navigation', () => {
    it('shows 4 nav buttons', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      const navBtns = document.querySelectorAll('.md__sidebar-btn');
      // 4 main + 1 settings = 5 total
      expect(navBtns.length).toBe(5);
    });

    it('active nav button has --active class', () => {
      render(<MistakesDashboard {...BASE_PROPS} activeNav="mistakes" />);
      const activeBtns = document.querySelectorAll('.md__sidebar-btn--active');
      expect(activeBtns.length).toBe(1);
    });

    it('clicking a nav button calls onNavigate with its id', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Problem List'));
      expect(BASE_PROPS.onNavigate).toHaveBeenCalledWith('problems');
    });

    it('clicking Settings calls onNavigate with "settings"', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Settings'));
      expect(BASE_PROPS.onNavigate).toHaveBeenCalledWith('settings');
    });
  });

  describe('priority areas', () => {
    it('shows PRIORITY REVIEW AREAS heading', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('PRIORITY REVIEW AREAS')).toBeDefined();
    });

    it('shows priority area name', () => {
      render(<MistakesDashboard {...BASE_PROPS} priorityAreas={[makePriority({ name: 'Binary Search' })]} />);
      expect(screen.getByText('Binary Search')).toBeDefined();
    });

    it('shows rubric score', () => {
      render(<MistakesDashboard {...BASE_PROPS} priorityAreas={[makePriority({ rubricScore: 65 })]} />);
      expect(screen.getByText('65%')).toBeDefined();
    });

    it('shows spaced rep status uppercased', () => {
      render(<MistakesDashboard {...BASE_PROPS} priorityAreas={[makePriority({ spacedRepStatus: 'Due Today' })]} />);
      expect(screen.getByText('DUE TODAY')).toBeDefined();
    });

    it('urgent area rep status has --urgent class', () => {
      render(<MistakesDashboard {...BASE_PROPS} priorityAreas={[makePriority({ isUrgent: true, spacedRepStatus: 'Due Today' })]} />);
      expect(document.querySelector('.md__priority-rep-status--urgent')).not.toBeNull();
    });

    it('non-urgent area does not have --urgent class', () => {
      render(<MistakesDashboard {...BASE_PROPS} priorityAreas={[makePriority({ isUrgent: false })]} />);
      expect(document.querySelector('.md__priority-rep-status--urgent')).toBeNull();
    });

    it('shows View All Patterns link', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('View All Patterns')).toBeDefined();
    });
  });

  describe('performance trend', () => {
    it('shows Performance Trend heading', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Performance Trend')).toBeDefined();
    });

    it('shows PROBLEM SOLVING legend item', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('PROBLEM SOLVING')).toBeDefined();
    });

    it('shows chart x-axis labels', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Today')).toBeDefined();
      expect(screen.getByText('30 Days ago')).toBeDefined();
    });
  });

  describe('mistakes table', () => {
    it('shows Recent Mistakes & Learning Log heading', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Recent Mistakes & Learning Log')).toBeDefined();
    });

    it('shows table headers', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('PROBLEM NAME')).toBeDefined();
      expect(screen.getByText('CORE MISTAKE')).toBeDefined();
      expect(screen.getByText('DIFFICULTY')).toBeDefined();
      expect(screen.getByText('LAST ATTEMPT')).toBeDefined();
      expect(screen.getByText('ACTION')).toBeDefined();
    });

    it('shows mistake row problem name', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ problemName: 'Two Sum' })]} />);
      expect(screen.getByText('Two Sum')).toBeDefined();
    });

    it('shows highlighted text in mistake', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ highlightedText: 'duplicates' })]} />);
      expect(screen.getByText('duplicates')).toBeDefined();
    });

    it('shows difficulty badge', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ difficulty: 'Hard' })]} />);
      expect(screen.getByText('Hard')).toBeDefined();
    });

    it('difficulty badge has correct class for Hard', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ difficulty: 'Hard' })]} />);
      expect(document.querySelector('.difficulty-badge--hard')).not.toBeNull();
    });

    it('shows last attempt', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ lastAttempt: '3 days ago' })]} />);
      expect(screen.getByText('3 days ago')).toBeDefined();
    });

    it('shows Re-try button per row', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake(), makeMistake({ id: 'm2' })]} />);
      expect(screen.getAllByText('Re-try').length).toBe(2);
    });

    it('clicking Re-try calls onRetry with row id', () => {
      render(<MistakesDashboard {...BASE_PROPS} mistakes={[makeMistake({ id: 'abc' })]} />);
      fireEvent.click(screen.getByText('Re-try'));
      expect(BASE_PROPS.onRetry).toHaveBeenCalledWith('abc');
    });
  });

  describe('search', () => {
    it('shows search input', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Search patterns or problems...')).toBeDefined();
    });

    it('filtering by problem name shows matching rows only', () => {
      const mistakes = [
        makeMistake({ id: 'm1', problemName: 'Two Sum' }),
        makeMistake({ id: 'm2', problemName: 'Three Sum' }),
      ];
      render(<MistakesDashboard {...BASE_PROPS} mistakes={mistakes} />);
      fireEvent.change(screen.getByPlaceholderText('Search patterns or problems...'), { target: { value: 'Two' } });
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.queryByText('Three Sum')).toBeNull();
    });

    it('filtering is case-insensitive', () => {
      const mistakes = [makeMistake({ id: 'm1', problemName: 'Binary Search' })];
      render(<MistakesDashboard {...BASE_PROPS} mistakes={mistakes} />);
      fireEvent.change(screen.getByPlaceholderText('Search patterns or problems...'), { target: { value: 'binary' } });
      expect(screen.getByText('Binary Search')).toBeDefined();
    });

    it('filtering by coreMistake shows matching rows', () => {
      const mistakes = [
        makeMistake({ id: 'm1', problemName: 'A', coreMistake: 'off-by-one error' }),
        makeMistake({ id: 'm2', problemName: 'B', coreMistake: 'wrong condition' }),
      ];
      render(<MistakesDashboard {...BASE_PROPS} mistakes={mistakes} />);
      fireEvent.change(screen.getByPlaceholderText('Search patterns or problems...'), { target: { value: 'off-by-one' } });
      expect(screen.getByText('A')).toBeDefined();
      expect(screen.queryByText('B')).toBeNull();
    });

    it('empty query shows all rows', () => {
      const mistakes = [
        makeMistake({ id: 'm1', problemName: 'A' }),
        makeMistake({ id: 'm2', problemName: 'B' }),
      ];
      render(<MistakesDashboard {...BASE_PROPS} mistakes={mistakes} />);
      fireEvent.change(screen.getByPlaceholderText('Search patterns or problems...'), { target: { value: '' } });
      expect(screen.getByText('A')).toBeDefined();
      expect(screen.getByText('B')).toBeDefined();
    });
  });

  describe('footer', () => {
    it('shows Analytics Updated in footer', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Analytics Updated')).toBeDefined();
    });

    it('shows Export Performance Data link', () => {
      render(<MistakesDashboard {...BASE_PROPS} />);
      expect(screen.getByText('Export Performance Data')).toBeDefined();
    });
  });

  describe('default props', () => {
    it('renders with no props (uses defaults)', () => {
      expect(() => render(<MistakesDashboard />)).not.toThrow();
    });

    it('shows default mistakes when none provided', () => {
      render(<MistakesDashboard />);
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
    });

    it('shows default priority areas when none provided', () => {
      render(<MistakesDashboard />);
      expect(screen.getByText('Dynamic Programming')).toBeDefined();
    });
  });
});

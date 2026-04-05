import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProblemList from '../ProblemList';
import type { RecommendedProblemEntry } from '../ProblemList';
import type { ProblemStatus } from '../../../types';

// ── Mock the problems data module ──
// vi.mock factory is hoisted above all const declarations, so we must inline
// the data directly inside the factory to avoid TDZ reference errors.

vi.mock('../../../data/problems', () => ({
  problemsByPattern: {
    'Two Pointers': [
      { id: 'tp-1', title: 'Valid Palindrome', difficulty: 'Easy' },
      { id: 'tp-2', title: 'Three Sum', difficulty: 'Medium' },
      { id: 'tp-3', title: 'Trapping Rain Water', difficulty: 'Hard' },
    ],
    HashMap: [
      { id: 'hm-1', title: 'Two Sum', difficulty: 'Easy' },
      { id: 'hm-2', title: 'Group Anagrams', difficulty: 'Medium' },
    ],
    'Sliding Window': [
      { id: 'sw-1', title: 'Best Time to Buy', difficulty: 'Easy' },
      { id: 'sw-2', title: 'Longest Substring', difficulty: 'Medium' },
      { id: 'sw-3', title: 'Minimum Window Substring', difficulty: 'Hard' },
    ],
  },
}));

// All problem titles for assertion helpers (must match mock data above)
const ALL_TITLES = [
  'Valid Palindrome',
  'Three Sum',
  'Trapping Rain Water',
  'Two Sum',
  'Group Anagrams',
  'Best Time to Buy',
  'Longest Substring',
  'Minimum Window Substring',
];

// ── Helpers ──

const defaultProps = {
  onSelect: vi.fn(),
  currentId: null as string | null,
};

function renderProblemList(overrides: Partial<Parameters<typeof ProblemList>[0]> = {}) {
  return render(<ProblemList {...defaultProps} {...overrides} />);
}

function getSearchInput(): HTMLInputElement {
  return screen.getByLabelText('Search problems') as HTMLInputElement;
}

function getPatternSelect(): HTMLSelectElement {
  // The pattern select contains an "All Patterns" option; find it by querying
  // all selects and picking the one with that option.
  const selects = document.querySelectorAll<HTMLSelectElement>('select.input');
  for (const sel of selects) {
    const opts = Array.from(sel.options).map((o) => o.textContent);
    if (opts.includes('All Patterns')) return sel;
  }
  throw new Error('Pattern select not found');
}

function getSortSelect(): HTMLSelectElement {
  const selects = document.querySelectorAll<HTMLSelectElement>('select.input');
  for (const sel of selects) {
    const opts = Array.from(sel.options).map((o) => o.textContent);
    if (opts.includes('Difficulty')) return sel;
  }
  throw new Error('Sort select not found');
}

/** Count how many of the known problem titles are currently visible. */
function countVisibleTitles(): number {
  return ALL_TITLES.filter((t) => screen.queryByText(t) !== null).length;
}

// ── Tests ──

describe('ProblemList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──

  describe('rendering', () => {
    it('renders all problems from every pattern group', () => {
      renderProblemList();
      for (const title of ALL_TITLES) {
        expect(screen.getByText(title)).toBeDefined();
      }
    });

    it('renders pattern group headers', () => {
      renderProblemList();
      // Pattern names appear twice: once in the select dropdown option and once
      // as the card-title header. Use getAllByText and verify at least 2 matches.
      expect(screen.getAllByText('Two Pointers').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('HashMap').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Sliding Window').length).toBeGreaterThanOrEqual(2);
    });

    it('renders difficulty badges for each problem', () => {
      renderProblemList();
      const easyBadges = document.querySelectorAll('.badge-easy');
      const mediumBadges = document.querySelectorAll('.badge-medium');
      const hardBadges = document.querySelectorAll('.badge-hard');
      // 3 Easy problems, 3 Medium, 2 Hard
      expect(easyBadges.length).toBe(3);
      expect(mediumBadges.length).toBe(3);
      expect(hardBadges.length).toBe(2);
    });

    it('renders the problem count per pattern group', () => {
      renderProblemList();
      // Two Pointers has 3, HashMap has 2, Sliding Window has 3
      const threes = screen.getAllByText('3');
      const twos = screen.getAllByText('2');
      expect(threes.length).toBeGreaterThanOrEqual(2);
      expect(twos.length).toBeGreaterThanOrEqual(1);
    });

    it('renders search input with placeholder', () => {
      renderProblemList();
      const input = getSearchInput();
      expect(input).toBeDefined();
      expect(input.placeholder).toBe('Search problems...');
    });

    it('renders difficulty filter chips (All, Easy, Medium, Hard)', () => {
      renderProblemList();
      expect(screen.getByRole('button', { name: 'All' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Easy' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Medium' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Hard' })).toBeDefined();
    });
  });

  // ── Search filtering ──

  describe('search filtering', () => {
    it('filters problems by title when typing in search box', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'Two Sum' } });
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.queryByText('Valid Palindrome')).toBe(null);
      expect(screen.queryByText('Three Sum')).toBe(null);
    });

    it('search is case-insensitive', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'two sum' } });
      expect(screen.getByText('Two Sum')).toBeDefined();
    });

    it('search matches against pattern name as well', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'hashmap' } });
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.getByText('Group Anagrams')).toBeDefined();
      expect(screen.queryByText('Valid Palindrome')).toBe(null);
    });

    it('search matches against difficulty', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'hard' } });
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
      expect(screen.getByText('Minimum Window Substring')).toBeDefined();
      expect(screen.queryByText('Two Sum')).toBe(null);
    });

    it('shows clear button when search has text and clears on click', () => {
      renderProblemList();
      expect(screen.queryByLabelText('Clear search')).toBe(null);
      fireEvent.change(getSearchInput(), { target: { value: 'sum' } });
      const clearBtn = screen.getByLabelText('Clear search');
      expect(clearBtn).toBeDefined();
      fireEvent.click(clearBtn);
      expect(getSearchInput().value).toBe('');
      expect(screen.getByText('Valid Palindrome')).toBeDefined();
    });

    it('empty search shows all problems', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'xyz' } });
      expect(countVisibleTitles()).toBe(0);
      fireEvent.change(getSearchInput(), { target: { value: '' } });
      expect(countVisibleTitles()).toBe(8);
    });

    it('special characters in search do not crash', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: '[]().*+?^${}|\\' } });
      expect(countVisibleTitles()).toBe(0);
    });
  });

  // ── Difficulty filter ──

  describe('difficulty filter', () => {
    it('filters to Easy problems when Easy chip clicked', () => {
      renderProblemList();
      fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
      expect(screen.getByText('Valid Palindrome')).toBeDefined();
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.getByText('Best Time to Buy')).toBeDefined();
      expect(screen.queryByText('Three Sum')).toBe(null);
      expect(screen.queryByText('Trapping Rain Water')).toBe(null);
    });

    it('filters to Hard problems when Hard chip clicked', () => {
      renderProblemList();
      fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
      expect(screen.getByText('Minimum Window Substring')).toBeDefined();
      expect(screen.queryByText('Two Sum')).toBe(null);
    });

    it('toggles filter off when same difficulty clicked again', () => {
      renderProblemList();
      const easyBtn = screen.getByRole('button', { name: 'Easy' });
      fireEvent.click(easyBtn);
      expect(screen.queryByText('Three Sum')).toBe(null);
      fireEvent.click(easyBtn);
      expect(screen.getByText('Three Sum')).toBeDefined();
    });

    it('sets aria-pressed on active difficulty chip', () => {
      renderProblemList();
      const easyBtn = screen.getByRole('button', { name: 'Easy' });
      expect(easyBtn.getAttribute('aria-pressed')).toBe('false');
      fireEvent.click(easyBtn);
      expect(easyBtn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  // ── Pattern filter ──

  describe('pattern filter', () => {
    it('filters to specific pattern when selected', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'HashMap' } });
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.getByText('Group Anagrams')).toBeDefined();
      expect(screen.queryByText('Valid Palindrome')).toBe(null);
      expect(screen.queryByText('Best Time to Buy')).toBe(null);
    });

    it('shows all patterns when reset to empty', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'HashMap' } });
      expect(screen.queryByText('Valid Palindrome')).toBe(null);
      fireEvent.change(getPatternSelect(), { target: { value: '' } });
      expect(screen.getByText('Valid Palindrome')).toBeDefined();
    });
  });

  // ── Sorting ──

  describe('sorting', () => {
    it('sorts by difficulty within groups', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'Two Pointers' } });
      fireEvent.change(getSortSelect(), { target: { value: 'difficulty' } });

      const cards = document.querySelectorAll('.card-interactive');
      const titles = Array.from(cards).map(
        (c) => c.querySelector('span[title]')?.textContent,
      );
      expect(titles).toEqual([
        'Valid Palindrome',
        'Three Sum',
        'Trapping Rain Water',
      ]);
    });

    it('sorts by status within groups when getProblemStatus provided', () => {
      const statusMap: Record<string, ProblemStatus> = {
        'tp-1': 'solved',
        'tp-2': 'unseen',
        'tp-3': 'attempted',
      };
      const getProblemStatus = (id: string) => statusMap[id] ?? 'unseen';

      renderProblemList({ getProblemStatus });
      fireEvent.change(getPatternSelect(), { target: { value: 'Two Pointers' } });
      fireEvent.change(getSortSelect(), { target: { value: 'status' } });

      const cards = document.querySelectorAll('.card-interactive');
      const titles = Array.from(cards).map(
        (c) => c.querySelector('span[title]')?.textContent,
      );
      // Status order: unseen(0) < attempted(1) < solved(2)
      expect(titles).toEqual([
        'Three Sum',           // unseen
        'Trapping Rain Water', // attempted
        'Valid Palindrome',    // solved
      ]);
    });
  });

  // ── Problem selection ──

  describe('problem selection', () => {
    it('calls onSelect with problem id when problem clicked', () => {
      const onSelect = vi.fn();
      renderProblemList({ onSelect });
      fireEvent.click(screen.getByText('Two Sum'));
      expect(onSelect).toHaveBeenCalledWith('hm-1');
    });

    it('highlights the currently selected problem', () => {
      renderProblemList({ currentId: 'hm-1' });
      const twoSumCard = screen.getByText('Two Sum').closest('.card-interactive');
      expect(twoSumCard?.classList.contains('card-hover-lift')).toBe(true);
    });

    it('does not highlight non-selected problems', () => {
      renderProblemList({ currentId: 'hm-1' });
      const palindromeCard = screen
        .getByText('Valid Palindrome')
        .closest('.card-interactive');
      expect(palindromeCard?.classList.contains('card-hover-lift')).toBe(false);
    });
  });

  // ── Empty state ──

  describe('empty state', () => {
    it('shows empty message when no problems match filters', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'zzzznotfound' } });
      expect(screen.getByText('No problems match your filters')).toBeDefined();
      expect(
        screen.getByText('Try adjusting your search, difficulty, or pattern filters.'),
      ).toBeDefined();
    });

    it('shows Clear filters button in empty state when filters active', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'zzz' } });
      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDefined();
    });

    it('clears all filters when Clear filters button clicked', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'xyz' } });
      fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
      expect(countVisibleTitles()).toBe(0);

      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
      expect(getSearchInput().value).toBe('');
      expect(countVisibleTitles()).toBe(8);
    });
  });

  // ── Problem count display ──

  describe('problem count display', () => {
    it('shows problem count when filters are active', () => {
      renderProblemList();
      fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
      expect(screen.getByText('3 problems found')).toBeDefined();
    });

    it('uses singular form for 1 problem', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'Two Sum' } });
      expect(screen.getByText('1 problem found')).toBeDefined();
    });

    it('does not show count when no filters are active', () => {
      renderProblemList();
      expect(screen.queryByText(/problems? found/)).toBe(null);
    });
  });

  // ── Combined filters ──

  describe('combined filters', () => {
    it('search + difficulty filter work together', () => {
      renderProblemList();
      fireEvent.change(getSearchInput(), { target: { value: 'sum' } });
      fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.queryByText('Three Sum')).toBe(null);
    });

    it('search + pattern filter work together', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'Two Pointers' } });
      fireEvent.change(getSearchInput(), { target: { value: 'palindrome' } });
      expect(screen.getByText('Valid Palindrome')).toBeDefined();
      expect(screen.queryByText('Three Sum')).toBe(null);
    });

    it('difficulty + pattern filter work together', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'Two Pointers' } });
      fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
      expect(screen.queryByText('Valid Palindrome')).toBe(null);
      expect(screen.queryByText('Three Sum')).toBe(null);
    });

    it('all three filters combined', () => {
      renderProblemList();
      fireEvent.change(getPatternSelect(), { target: { value: 'Two Pointers' } });
      fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
      fireEvent.change(getSearchInput(), { target: { value: 'three' } });
      expect(screen.getByText('Three Sum')).toBeDefined();
      expect(screen.getByText('1 problem found')).toBeDefined();
    });
  });

  // ── Status indicators ──

  describe('status indicators', () => {
    it('calls getProblemStatus for each rendered problem', () => {
      const getProblemStatus = vi.fn((_id: string): ProblemStatus => 'unseen');
      renderProblemList({ getProblemStatus });
      expect(getProblemStatus).toHaveBeenCalledWith('hm-1');
      expect(getProblemStatus).toHaveBeenCalledWith('tp-2');
      expect(getProblemStatus).toHaveBeenCalledWith('tp-1');
    });

    it('defaults to unseen status when getProblemStatus is not provided', () => {
      renderProblemList();
      expect(countVisibleTitles()).toBe(8);
    });
  });

  // ── Daily challenge ──

  describe('daily challenge', () => {
    const dailyChallenge: RecommendedProblemEntry = {
      id: 'dc-1',
      title: 'Daily Challenge Problem',
      difficulty: 'Medium',
      pattern: 'DP',
      reason: 'You need practice with DP',
    };

    it('renders daily challenge card when provided and no filters active', () => {
      renderProblemList({ dailyChallenge });
      expect(screen.getByText('Daily Challenge')).toBeDefined();
      expect(screen.getByText('Daily Challenge Problem')).toBeDefined();
      expect(screen.getByText('You need practice with DP')).toBeDefined();
    });

    it('hides daily challenge when filters are active', () => {
      renderProblemList({ dailyChallenge });
      fireEvent.change(getSearchInput(), { target: { value: 'sum' } });
      expect(screen.queryByText('Daily Challenge')).toBe(null);
    });

    it('calls onSelect with daily challenge id when clicked', () => {
      const onSelect = vi.fn();
      renderProblemList({ onSelect, dailyChallenge });
      fireEvent.click(screen.getByText('Daily Challenge Problem'));
      expect(onSelect).toHaveBeenCalledWith('dc-1');
    });
  });

  // ── Recommendations ──

  describe('recommendations', () => {
    const recommendations: RecommendedProblemEntry[] = [
      {
        id: 'rec-1',
        title: 'Recommended Problem One',
        difficulty: 'Easy',
        pattern: 'Array',
        reason: 'Strengthen fundamentals',
      },
      {
        id: 'rec-2',
        title: 'Recommended Problem Two',
        difficulty: 'Hard',
        pattern: 'DP',
        reason: 'Challenge yourself',
      },
    ];

    it('renders recommended section when recommendations provided and no filters', () => {
      renderProblemList({ recommendations });
      expect(screen.getByText('Recommended')).toBeDefined();
      expect(screen.getByText('Recommended Problem One')).toBeDefined();
      expect(screen.getByText('Recommended Problem Two')).toBeDefined();
    });

    it('hides recommendations when filters are active', () => {
      renderProblemList({ recommendations });
      fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
      expect(screen.queryByText('Recommended')).toBe(null);
    });

    it('calls onSelect when recommendation clicked', () => {
      const onSelect = vi.fn();
      renderProblemList({ onSelect, recommendations });
      fireEvent.click(screen.getByText('Recommended Problem One'));
      expect(onSelect).toHaveBeenCalledWith('rec-1');
    });

    it('does not render recommendations section when array is empty', () => {
      renderProblemList({ recommendations: [] });
      expect(screen.queryByText('Recommended')).toBe(null);
    });
  });
});

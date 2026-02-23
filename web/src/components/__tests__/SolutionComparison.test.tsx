import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SolutionComparison, {
  type ComparisonResult,
  type SolutionApproach,
} from '../SolutionComparison';

// ── Helpers ──

function makeApproach(overrides: Partial<SolutionApproach> = {}): SolutionApproach {
  return {
    name: 'Brute Force',
    pattern: 'Nested Loops',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Check all pairs.',
    pros: ['Simple to implement'],
    cons: ['Slow for large inputs'],
    ...overrides,
  };
}

function makeComparison(overrides: Partial<ComparisonResult> = {}): ComparisonResult {
  return {
    problemTitle: 'Two Sum',
    userApproach: makeApproach(),
    optimalApproach: makeApproach({
      name: 'HashMap',
      pattern: 'Hash Table',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description: 'Single pass with map.',
      pros: ['Linear time'],
      cons: ['Extra memory'],
    }),
    isOptimal: false,
    missedOptimizations: ['Use a hash map for O(1) lookups'],
    missedEdgeCases: ['Empty array input'],
    patternInsight: 'You used brute force; optimal uses Hash Table',
    improvementTips: ['Try identifying repeated work in nested loops'],
    ...overrides,
  };
}

function renderComparison(overrides: Partial<ComparisonResult> = {}, onClose = vi.fn()) {
  const comparison = makeComparison(overrides);
  const result = render(
    <SolutionComparison comparison={comparison} onClose={onClose} />,
  );
  return { ...result, comparison, onClose };
}

// ── Tests ──

describe('SolutionComparison', () => {
  // ── getOverallGrade logic ──

  describe('getOverallGrade', () => {
    it('returns "Optimal" when isOptimal + no missed edge cases + no missed optimizations', () => {
      renderComparison({
        isOptimal: true,
        missedEdgeCases: [],
        missedOptimizations: [],
      });

      // The grade label appears in both the banner badge and the footer
      const badges = screen.getAllByText('Optimal');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Good" (cyan) when isOptimal but has missed edge cases', () => {
      renderComparison({
        isOptimal: true,
        missedEdgeCases: ['Empty input'],
        missedOptimizations: [],
      });

      const badges = screen.getAllByText('Good');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Good" (cyan) when isOptimal but has missed optimizations', () => {
      renderComparison({
        isOptimal: true,
        missedEdgeCases: [],
        missedOptimizations: ['Could use early return'],
      });

      const badges = screen.getAllByText('Good');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Good" (amber) when suboptimal with at most 1 missed optimization and 1 missed edge case', () => {
      renderComparison({
        isOptimal: false,
        missedEdgeCases: ['Empty array'],
        missedOptimizations: ['Use hash map'],
      });

      const badges = screen.getAllByText('Good');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Good" (amber) when suboptimal with 0 missed items', () => {
      renderComparison({
        isOptimal: false,
        missedEdgeCases: [],
        missedOptimizations: [],
      });

      const badges = screen.getAllByText('Good');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Needs Improvement" when suboptimal with many missed optimizations', () => {
      renderComparison({
        isOptimal: false,
        missedEdgeCases: ['Empty', 'Negative numbers'],
        missedOptimizations: ['Hash map', 'Early termination'],
      });

      const badges = screen.getAllByText('Needs Improvement');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Needs Improvement" when suboptimal with >1 missed edge cases only', () => {
      renderComparison({
        isOptimal: false,
        missedEdgeCases: ['a', 'b'],
        missedOptimizations: [],
      });

      const badges = screen.getAllByText('Needs Improvement');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('returns "Needs Improvement" when suboptimal with >1 missed optimizations only', () => {
      renderComparison({
        isOptimal: false,
        missedEdgeCases: [],
        missedOptimizations: ['x', 'y'],
      });

      const badges = screen.getAllByText('Needs Improvement');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Tab switching ──

  describe('tab switching', () => {
    it('shows overview tab content by default', () => {
      renderComparison({
        userApproach: makeApproach({ code: 'const x = 1;' }),
        optimalApproach: makeApproach({ code: 'const y = 2;' }),
      });

      // Overview content: approach cards and complexity section
      expect(screen.getByText('Your Approach')).toBeDefined();
      expect(screen.getByText('Optimal Approach')).toBeDefined();
      expect(screen.getByText('Complexity Comparison')).toBeDefined();
    });

    it('switches to code tab when clicking "Code Diff"', () => {
      renderComparison({
        userApproach: makeApproach({ code: 'function solve() {}' }),
        optimalApproach: makeApproach({ code: 'function optimal() {}' }),
      });

      fireEvent.click(screen.getByText('Code Diff'));

      // Code tab content
      expect(screen.getByText('Your Code')).toBeDefined();
      expect(screen.getByText('Optimal Code')).toBeDefined();
      expect(screen.getByText('function solve() {}')).toBeDefined();
      expect(screen.getByText('function optimal() {}')).toBeDefined();
    });

    it('switches back to overview tab after clicking "Overview"', () => {
      renderComparison({
        userApproach: makeApproach({ code: 'code1' }),
        optimalApproach: makeApproach({ code: 'code2' }),
      });

      // Go to code tab
      fireEvent.click(screen.getByText('Code Diff'));
      expect(screen.queryByText('Complexity Comparison')).toBeNull();

      // Back to overview
      fireEvent.click(screen.getByText('Overview'));
      expect(screen.getByText('Complexity Comparison')).toBeDefined();
    });
  });

  // ── Conditional rendering: code tabs ──

  describe('conditional rendering - code section', () => {
    it('does not render tab bar when neither approach has code', () => {
      renderComparison({
        userApproach: makeApproach({ code: undefined }),
        optimalApproach: makeApproach({ code: undefined }),
      });

      expect(screen.queryByText('Overview')).toBeNull();
      expect(screen.queryByText('Code Diff')).toBeNull();
    });

    it('renders tab bar when only user approach has code', () => {
      renderComparison({
        userApproach: makeApproach({ code: 'user code' }),
        optimalApproach: makeApproach({ code: undefined }),
      });

      expect(screen.getByText('Overview')).toBeDefined();
      expect(screen.getByText('Code Diff')).toBeDefined();
    });

    it('renders tab bar when only optimal approach has code', () => {
      renderComparison({
        userApproach: makeApproach({ code: undefined }),
        optimalApproach: makeApproach({ code: 'optimal code' }),
      });

      expect(screen.getByText('Overview')).toBeDefined();
      expect(screen.getByText('Code Diff')).toBeDefined();
    });

    it('shows only user code block when only user has code (code tab)', () => {
      renderComparison({
        userApproach: makeApproach({ code: 'my solution' }),
        optimalApproach: makeApproach({ code: undefined }),
      });

      fireEvent.click(screen.getByText('Code Diff'));
      expect(screen.getByText('Your Code')).toBeDefined();
      expect(screen.queryByText('Optimal Code')).toBeNull();
    });

    it('shows only optimal code block when only optimal has code (code tab)', () => {
      renderComparison({
        userApproach: makeApproach({ code: undefined }),
        optimalApproach: makeApproach({ code: 'best solution' }),
      });

      fireEvent.click(screen.getByText('Code Diff'));
      expect(screen.getByText('Optimal Code')).toBeDefined();
      expect(screen.queryByText('Your Code')).toBeNull();
    });
  });

  // ── Missed items section ──

  describe('conditional rendering - missed items', () => {
    it('shows "What You Missed" section when there are missed edge cases', () => {
      renderComparison({
        missedEdgeCases: ['Empty array'],
        missedOptimizations: [],
      });

      expect(screen.getByText('What You Missed')).toBeDefined();
      expect(screen.getByText('Edge Cases')).toBeDefined();
      expect(screen.getByText('Empty array')).toBeDefined();
    });

    it('shows "What You Missed" section when there are missed optimizations', () => {
      renderComparison({
        missedEdgeCases: [],
        missedOptimizations: ['Use early return'],
      });

      expect(screen.getByText('What You Missed')).toBeDefined();
      expect(screen.getByText('Optimizations')).toBeDefined();
      expect(screen.getByText('Use early return')).toBeDefined();
    });

    it('does not show "What You Missed" section when no missed items', () => {
      renderComparison({
        missedEdgeCases: [],
        missedOptimizations: [],
      });

      expect(screen.queryByText('What You Missed')).toBeNull();
    });

    it('shows both Edge Cases and Optimizations headings when both exist', () => {
      renderComparison({
        missedEdgeCases: ['null input'],
        missedOptimizations: ['memoization'],
      });

      expect(screen.getByText('Edge Cases')).toBeDefined();
      expect(screen.getByText('Optimizations')).toBeDefined();
      expect(screen.getByText('null input')).toBeDefined();
      expect(screen.getByText('memoization')).toBeDefined();
    });
  });

  // ── Modal behavior ──

  describe('modal behavior', () => {
    it('calls onClose when the X close button is clicked', () => {
      const { onClose } = renderComparison();

      fireEvent.click(screen.getByLabelText('Close solution comparison'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the footer Close button is clicked', () => {
      const { onClose } = renderComparison();

      fireEvent.click(screen.getByText('Close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the backdrop is clicked', () => {
      const { onClose } = renderComparison();

      // The backdrop is the outermost div with class "modal-backdrop"
      const backdrop = document.querySelector('.modal-backdrop')!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when the modal content is clicked', () => {
      const { onClose } = renderComparison();

      const modal = document.querySelector('.modal')!;
      fireEvent.click(modal);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ── Complexity display ──

  describe('complexity display', () => {
    it('shows user and optimal time complexity values', () => {
      renderComparison({
        userApproach: makeApproach({ timeComplexity: 'O(n²)' }),
        optimalApproach: makeApproach({ timeComplexity: 'O(n log n)' }),
      });

      // Time complexity appears in the approach card and in the complexity bar
      expect(screen.getAllByText('O(n²)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('O(n log n)').length).toBeGreaterThanOrEqual(1);
    });

    it('shows user and optimal space complexity values', () => {
      renderComparison({
        userApproach: makeApproach({ spaceComplexity: 'O(1)' }),
        optimalApproach: makeApproach({ spaceComplexity: 'O(n)' }),
      });

      // Space complexity values are rendered in approach cards and in the complexity bar
      expect(screen.getAllByText('O(1)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('O(n)').length).toBeGreaterThanOrEqual(1);
    });

    it('renders "Time Complexity" and "Space Complexity" labels', () => {
      renderComparison();

      expect(screen.getByText('Time Complexity')).toBeDefined();
      expect(screen.getByText('Space Complexity')).toBeDefined();
    });
  });

  // ── Approach comparison ──

  describe('approach comparison', () => {
    it('displays user approach name and pattern', () => {
      renderComparison({
        userApproach: makeApproach({ name: 'Two Pointer', pattern: 'Sliding Window' }),
      });

      expect(screen.getByText('Two Pointer')).toBeDefined();
      expect(screen.getByText('Sliding Window')).toBeDefined();
    });

    it('displays optimal approach name and pattern', () => {
      renderComparison({
        optimalApproach: makeApproach({ name: 'Binary Search', pattern: 'Divide & Conquer' }),
      });

      expect(screen.getByText('Binary Search')).toBeDefined();
      expect(screen.getByText('Divide & Conquer')).toBeDefined();
    });

    it('shows approach descriptions', () => {
      renderComparison({
        userApproach: makeApproach({ description: 'Iterate with two nested loops.' }),
        optimalApproach: makeApproach({ description: 'One-pass hash table solution.' }),
      });

      expect(screen.getByText('Iterate with two nested loops.')).toBeDefined();
      expect(screen.getByText('One-pass hash table solution.')).toBeDefined();
    });

    it('shows pros and cons for approaches', () => {
      renderComparison({
        userApproach: makeApproach({
          pros: ['Easy to understand'],
          cons: ['Quadratic time'],
        }),
        optimalApproach: makeApproach({
          pros: ['Linear runtime'],
          cons: ['Extra space'],
        }),
      });

      expect(screen.getByText('Easy to understand')).toBeDefined();
      expect(screen.getByText('Quadratic time')).toBeDefined();
      expect(screen.getByText('Linear runtime')).toBeDefined();
      expect(screen.getByText('Extra space')).toBeDefined();
    });

    it('does not render pros section when pros array is empty', () => {
      renderComparison({
        userApproach: makeApproach({ pros: [], cons: ['Slow'] }),
        optimalApproach: makeApproach({ pros: [], cons: [] }),
      });

      // "Pros" label should not appear for approaches with empty pros
      // The word "Pros" appears only next to the CheckCircle icon
      const prosElements = screen.queryAllByText('Pros');
      // Only the cons approach that still has items should show;
      // approaches with empty pros should not render that sub-section
      // With user having cons=['Slow'] and empty pros, and optimal having both empty,
      // we should NOT see any Pros headings
      expect(prosElements.length).toBe(0);
    });

    it('does not render cons section when cons array is empty', () => {
      renderComparison({
        userApproach: makeApproach({ pros: ['Fast'], cons: [] }),
        optimalApproach: makeApproach({ pros: ['Efficient'], cons: [] }),
      });

      const consElements = screen.queryAllByText('Cons');
      expect(consElements.length).toBe(0);
    });
  });

  // ── Pattern insight and problem title ──

  describe('header and banner content', () => {
    it('displays the problem title in the header', () => {
      renderComparison({ problemTitle: 'Longest Substring Without Repeating Characters' });

      expect(screen.getByText('Longest Substring Without Repeating Characters')).toBeDefined();
    });

    it('displays the pattern insight in the banner', () => {
      renderComparison({ patternInsight: 'You used sorting; optimal uses Sliding Window' });

      expect(screen.getByText('You used sorting; optimal uses Sliding Window')).toBeDefined();
    });

    it('always displays "Solution Analysis" as the modal title', () => {
      renderComparison();

      expect(screen.getByText('Solution Analysis')).toBeDefined();
    });
  });

  // ── Improvement tips ──

  describe('improvement tips', () => {
    it('renders improvement tips when provided', () => {
      renderComparison({
        improvementTips: ['Practice hash map patterns', 'Learn sliding window'],
      });

      expect(screen.getByText('Improvement Tips')).toBeDefined();
      expect(screen.getByText('Practice hash map patterns')).toBeDefined();
      expect(screen.getByText('Learn sliding window')).toBeDefined();
    });

    it('renders numbered tips starting from 1', () => {
      renderComparison({
        improvementTips: ['First tip', 'Second tip', 'Third tip'],
      });

      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
    });

    it('does not render improvement tips section when array is empty', () => {
      renderComparison({ improvementTips: [] });

      expect(screen.queryByText('Improvement Tips')).toBeNull();
    });
  });

  // ── Footer assessment ──

  describe('footer assessment', () => {
    it('shows "Assessment:" label in the footer', () => {
      renderComparison();

      expect(screen.getByText('Assessment:')).toBeDefined();
    });

    it('shows the grade label in the footer', () => {
      renderComparison({
        isOptimal: true,
        missedEdgeCases: [],
        missedOptimizations: [],
      });

      // Footer should contain the Optimal grade
      const footer = document.querySelector('.modal-footer')!;
      expect(footer.textContent).toContain('Optimal');
    });
  });
});

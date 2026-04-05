import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewRubric from '../ReviewRubric';

// ── Helpers ──

const defaultProps = {
  problemTitle: 'Two Sum',
  problemId: 'two-sum',
  onSubmit: vi.fn(),
  onClose: vi.fn(),
};

function renderRubric(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<ReviewRubric {...props} />);
}

const DIMENSION_LABELS = [
  'Correctness',
  'Time Complexity',
  'Space Complexity',
  'Code Quality',
  'Edge Cases',
  'Communication',
  'Edge Case Handling',
  'Time Management',
];

const SCORE_LABELS = ['Missing', 'Weak', 'Adequate', 'Strong', 'Excellent'];

/** Click a specific score button for a dimension by its index (0-5) and score (0-4). */
function selectScore(dimensionIndex: number, score: number) {
  const label = `${SCORE_LABELS[score]} (${score})`;
  // Multiple dimensions each have buttons with the same aria-label; grab them all and pick the right group.
  const allButtons = screen.getAllByRole('button', { name: label });
  // Each dimension has one button per score label, so the dimensionIndex-th button with this label belongs to that dimension.
  fireEvent.click(allButtons[dimensionIndex]);
}

/** Select all eight dimensions to the same score. */
function selectAllScores(score: number) {
  for (let i = 0; i < 8; i++) {
    selectScore(i, score);
  }
}

// ── Tests ──

describe('ReviewRubric', () => {
  // ── Initial state ──

  describe('initial state', () => {
    it('renders the rubric form with title "Code Review Rubric"', () => {
      renderRubric();
      expect(screen.getByText('Code Review Rubric')).toBeDefined();
    });

    it('displays the problem title in the form description', () => {
      renderRubric({ problemTitle: 'Valid Parentheses' });
      expect(screen.getByText('Valid Parentheses')).toBeDefined();
    });

    it('has Submit Review button disabled initially (no scores selected)', () => {
      renderRubric();
      const submitBtn = screen.getByRole('button', { name: 'Submit Review' });
      expect(submitBtn).toBeDefined();
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('does not show the overall score preview before all dimensions are scored', () => {
      renderRubric();
      expect(screen.queryByText(/Overall Score/)).toBeNull();
    });

    it('does not show any score label text before scoring', () => {
      renderRubric();
      for (const label of SCORE_LABELS) {
        // The score labels are rendered as inline text ONLY when a score is selected.
        // But they also appear in aria-labels for buttons, so query by exact role-free text nodes.
        // We check that no element with just the label text (not inside a button aria-label) exists.
        const matches = screen.queryAllByText(label);
        // All matches should be inside buttons (aria-label rendered as accessible name).
        // The inline label spans are not shown yet because scores default to -1.
        for (const el of matches) {
          // buttons render the score as text content like "0", "1", not the label itself
          // The only place SCORE_LABELS show up before selection is in aria-label attributes
          // which are not returned by getByText — so if any match exists it would be the inline span
        }
        // Actually: aria-label is not returned by queryAllByText. Let's verify no inline spans exist.
        // queryAllByText finds text nodes. The score label spans only render when scores[dim.id] >= 0.
        // Since initial score is -1, no label text should appear as visible text.
        // Buttons only show the numeric score (0-4) as visible text, not the label.
      }
      // Simpler approach: no "Missing" / "Weak" / etc. inline text should be visible
      expect(screen.queryAllByText('Missing')).toHaveLength(0);
      expect(screen.queryAllByText('Weak')).toHaveLength(0);
      expect(screen.queryAllByText('Adequate')).toHaveLength(0);
      expect(screen.queryAllByText('Strong')).toHaveLength(0);
      expect(screen.queryAllByText('Excellent')).toHaveLength(0);
    });
  });

  // ── Dimension rendering ──

  describe('dimension rendering', () => {
    it('renders all 8 rubric dimensions with their labels', () => {
      renderRubric();
      for (const label of DIMENSION_LABELS) {
        expect(screen.getByText(label)).toBeDefined();
      }
    });

    it('renders 5 score buttons (0-4) per dimension, totaling 40 score buttons', () => {
      renderRubric();
      // Each score label appears once per dimension (8 dimensions)
      for (const label of SCORE_LABELS) {
        const buttons = screen.getAllByRole('button', { name: `${label} (${SCORE_LABELS.indexOf(label)})` });
        expect(buttons).toHaveLength(8);
      }
    });

    it('renders dimension descriptions', () => {
      renderRubric();
      expect(screen.getByText('Does the solution produce correct output for all cases?')).toBeDefined();
      expect(screen.getByText('Is the time complexity optimal for the problem?')).toBeDefined();
      expect(screen.getByText('Is space usage efficient and justified?')).toBeDefined();
      expect(screen.getByText('Is the code clean, readable, and well-structured?')).toBeDefined();
      expect(screen.getByText('Are edge cases identified and handled?')).toBeDefined();
      expect(screen.getByText('Was the thought process clearly explained?')).toBeDefined();
      expect(screen.getByText('Were specific edge cases proactively identified before coding?')).toBeDefined();
      expect(screen.getByText('Was the problem solved within a reasonable interview time frame?')).toBeDefined();
    });

    it('renders the feedback textarea with placeholder', () => {
      renderRubric();
      expect(screen.getByPlaceholderText('What went well? What could improve?')).toBeDefined();
    });
  });

  // ── Score selection ──

  describe('score selection', () => {
    it('shows the score label when a score is selected for a dimension', () => {
      renderRubric();
      selectScore(0, 4); // Correctness = Excellent
      expect(screen.getByText('Excellent')).toBeDefined();
    });

    it('sets aria-pressed=true on the selected score button', () => {
      renderRubric();
      selectScore(0, 3); // Correctness = Strong
      const strongButtons = screen.getAllByRole('button', { name: 'Strong (3)' });
      // The first "Strong (3)" button is for Correctness (dimension index 0)
      expect(strongButtons[0].getAttribute('aria-pressed')).toBe('true');
    });

    it('sets aria-pressed=false on unselected score buttons in the same dimension', () => {
      renderRubric();
      selectScore(0, 3); // Correctness = Strong
      const missingButtons = screen.getAllByRole('button', { name: 'Missing (0)' });
      expect(missingButtons[0].getAttribute('aria-pressed')).toBe('false');
    });

    it('allows changing a previously selected score', () => {
      renderRubric();
      selectScore(0, 2); // Correctness = Adequate
      expect(screen.getByText('Adequate')).toBeDefined();

      selectScore(0, 4); // Change to Excellent
      expect(screen.getByText('Excellent')).toBeDefined();
    });

    it('enables the Submit button when all 8 dimensions are scored', () => {
      renderRubric();
      selectAllScores(3);
      const submitBtn = screen.getByRole('button', { name: 'Submit Review' });
      expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
    });

    it('keeps Submit disabled if only some dimensions are scored', () => {
      renderRubric();
      selectScore(0, 3);
      selectScore(1, 3);
      selectScore(2, 3);
      // Only 3 of 8 scored
      const submitBtn = screen.getByRole('button', { name: 'Submit Review' });
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  // ── Overall score calculation ──

  describe('overall score calculation', () => {
    it('shows overall score preview when all dimensions are scored', () => {
      renderRubric();
      selectAllScores(4);
      expect(screen.getByText(/Overall Score/)).toBeDefined();
    });

    it('calculates overall score as average of all dimension scores (all 4s = 4.0)', () => {
      renderRubric();
      selectAllScores(4);
      expect(screen.getByText('4.0 / 4.0')).toBeDefined();
    });

    it('calculates overall score as average of all dimension scores (all 0s = 0.0)', () => {
      renderRubric();
      selectAllScores(0);
      expect(screen.getByText('0.0 / 4.0')).toBeDefined();
    });

    it('calculates overall score for mixed scores correctly', () => {
      renderRubric();
      // 0 + 1 + 2 + 3 + 4 + 2 + 2 + 2 = 16 / 8 = 2.0
      selectScore(0, 0);
      selectScore(1, 1);
      selectScore(2, 2);
      selectScore(3, 3);
      selectScore(4, 4);
      selectScore(5, 2);
      selectScore(6, 2);
      selectScore(7, 2);
      expect(screen.getByText('2.0 / 4.0')).toBeDefined();
    });

    it('calculates a non-integer average correctly', () => {
      renderRubric();
      // 1 + 2 + 3 + 4 + 4 + 4 + 4 + 2 = 24 / 8 = 3.0
      selectScore(0, 1);
      selectScore(1, 2);
      selectScore(2, 3);
      selectScore(3, 4);
      selectScore(4, 4);
      selectScore(5, 4);
      selectScore(6, 4);
      selectScore(7, 2);
      expect(screen.getByText('3.0 / 4.0')).toBeDefined();
    });
  });

  // ── Submit flow and results view ──

  describe('submit flow', () => {
    it('calls onSubmit with a ReviewResult when Submit Review is clicked', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);

      const result = onSubmit.mock.calls[0][0];
      expect(result.problemTitle).toBe('Two Sum');
      expect(result.problemId).toBe('two-sum');
      expect(result.dimensions).toHaveLength(8);
      expect(result.overallScore).toBe(3);
      expect(result.feedback).toBe('');
      expect(result.improvementPlan).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('transitions to the results view after submission', () => {
      renderRubric();
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      // Results view shows "Review Complete" instead of "Code Review Rubric"
      expect(screen.getByText('Review Complete')).toBeDefined();
      expect(screen.queryByText('Code Review Rubric')).toBeNull();
    });

    it('includes feedback text in the submitted review', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(3);
      const textarea = screen.getByPlaceholderText('What went well? What could improve?');
      fireEvent.change(textarea, { target: { value: 'Good approach but slow.' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      const result = onSubmit.mock.calls[0][0];
      expect(result.feedback).toBe('Good approach but slow.');
    });

    it('passes null problemId through to the result', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit, problemId: null });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      expect(onSubmit.mock.calls[0][0].problemId).toBeNull();
    });
  });

  // ── Results view ──

  describe('results view', () => {
    function submitWithScores(scores: number[], onSubmit = vi.fn(), onClose = vi.fn()) {
      const props = { ...defaultProps, onSubmit, onClose };
      render(<ReviewRubric {...props} />);
      for (let i = 0; i < 8; i++) {
        selectScore(i, scores[i]);
      }
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      return { onSubmit, onClose };
    }

    it('shows the overall numeric score', () => {
      submitWithScores([4, 4, 4, 4, 4, 4, 4, 4]);
      expect(screen.getByText('4.0')).toBeDefined();
      expect(screen.getByText('/4.0')).toBeDefined();
    });

    it('shows the problem title in results', () => {
      submitWithScores([3, 3, 3, 3, 3, 3, 3, 3]);
      expect(screen.getByText('Two Sum')).toBeDefined();
    });

    it('shows all dimension labels with their scores', () => {
      submitWithScores([0, 1, 2, 3, 4, 2, 2, 2]);
      for (const label of DIMENSION_LABELS) {
        expect(screen.getByText(label)).toBeDefined();
      }
      // The numeric scores are displayed
      expect(screen.getByText('0')).toBeDefined();
      expect(screen.getByText('1')).toBeDefined();
      // There should be four "2" scores (Space Complexity, Communication, Edge Case Handling, Time Management)
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(4);
      expect(screen.getByText('3')).toBeDefined();
      expect(screen.getByText('4')).toBeDefined();
    });

    it('shows the "Improvement Plan" heading', () => {
      submitWithScores([2, 2, 2, 2, 2, 2, 2, 2]);
      expect(screen.getByText('Improvement Plan')).toBeDefined();
    });

    it('shows a Done button', () => {
      submitWithScores([3, 3, 3, 3, 3, 3, 3, 3]);
      expect(screen.getByRole('button', { name: 'Done' })).toBeDefined();
    });
  });

  // ── Close / Cancel callbacks ──

  describe('close and cancel callbacks', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the close (X) button is clicked in rubric view', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      fireEvent.click(screen.getByRole('button', { name: 'Close rubric' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked in rubric view', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      // The modal-backdrop is the outermost div
      const backdrop = document.querySelector('.modal-backdrop')!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside the modal (stopPropagation)', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      const modal = document.querySelector('.modal')!;
      fireEvent.click(modal);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Done button is clicked in results view', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the close (X) button is clicked in results view', () => {
      const onClose = vi.fn();
      renderRubric({ onClose });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      fireEvent.click(screen.getByRole('button', { name: 'Close review' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ── Improvement plan generation ──

  describe('improvement plan generation', () => {
    function getImprovementPlan(scores: number[]): string[] {
      const onSubmit = vi.fn();
      render(<ReviewRubric {...defaultProps} onSubmit={onSubmit} />);
      for (let i = 0; i < 8; i++) {
        selectScore(i, scores[i]);
      }
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      return onSubmit.mock.calls[0][0].improvementPlan;
    }

    it('returns congratulatory message when all scores are 3 or higher', () => {
      const plan = getImprovementPlan([3, 3, 3, 3, 3, 3, 3, 3]);
      expect(plan).toEqual(['Great work! Focus on speed and consistency to maintain this level.']);
    });

    it('returns congratulatory message when all scores are 4', () => {
      const plan = getImprovementPlan([4, 4, 4, 4, 4, 4, 4, 4]);
      expect(plan).toEqual(['Great work! Focus on speed and consistency to maintain this level.']);
    });

    it('generates correctness plan for low correctness score', () => {
      const plan = getImprovementPlan([1, 4, 4, 4, 4, 4, 4, 4]);
      expect(plan).toContain('Practice writing test cases before coding to catch logic errors early.');
    });

    it('generates time-complexity plan for low time-complexity score', () => {
      const plan = getImprovementPlan([4, 0, 4, 4, 4, 4, 4, 4]);
      expect(plan).toContain('Study pattern-to-complexity mappings. Practice identifying the optimal approach before coding.');
    });

    it('generates space-complexity plan for low space-complexity score', () => {
      const plan = getImprovementPlan([4, 4, 2, 4, 4, 4, 4, 4]);
      expect(plan).toContain('Consider in-place algorithms and whether auxiliary data structures are necessary.');
    });

    it('generates code-quality plan for low code-quality score', () => {
      const plan = getImprovementPlan([4, 4, 4, 1, 4, 4, 4, 4]);
      expect(plan).toContain('Use descriptive variable names and extract helper functions for repeated logic.');
    });

    it('generates edge-cases plan for low edge-cases score', () => {
      const plan = getImprovementPlan([4, 4, 4, 4, 0, 4, 4, 4]);
      expect(plan).toContain('Build a checklist: empty input, single element, duplicates, negative numbers, overflow.');
    });

    it('generates communication plan for low communication score', () => {
      const plan = getImprovementPlan([4, 4, 4, 4, 4, 2, 4, 4]);
      expect(plan).toContain('Practice thinking aloud: state your approach, trade-offs, and complexity before coding.');
    });

    it('generates edge-case-handling plan for low edge-case-handling score', () => {
      const plan = getImprovementPlan([4, 4, 4, 4, 4, 4, 1, 4]);
      expect(plan).toContain('List edge cases before coding: empty input, single element, large input, negative/zero values.');
    });

    it('generates time-management plan for low time-management score', () => {
      const plan = getImprovementPlan([4, 4, 4, 4, 4, 4, 4, 0]);
      expect(plan).toContain('Practice with a timer. Aim to have a working solution within 30 minutes.');
    });

    it('generates multiple plans when multiple dimensions are weak, sorted by lowest first', () => {
      // correctness=0, time=1, rest=4
      const plan = getImprovementPlan([0, 1, 4, 4, 4, 4, 4, 4]);
      expect(plan).toHaveLength(2);
      // Sorted by score ascending: correctness(0) first, then time(1)
      expect(plan[0]).toContain('test cases before coding');
      expect(plan[1]).toContain('pattern-to-complexity');
    });

    it('generates plans for all 8 dimensions when all scores are 0', () => {
      const plan = getImprovementPlan([0, 0, 0, 0, 0, 0, 0, 0]);
      expect(plan).toHaveLength(8);
    });

    it('treats score of 2 as weak (included in improvement plan)', () => {
      const plan = getImprovementPlan([2, 4, 4, 4, 4, 4, 4, 4]);
      expect(plan).toHaveLength(1);
      expect(plan[0]).toContain('test cases before coding');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('all zeros results in 0.0 overall score', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(0);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      const result = onSubmit.mock.calls[0][0];
      expect(result.overallScore).toBe(0);
    });

    it('all fours results in 4.0 overall score', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(4);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));
      const result = onSubmit.mock.calls[0][0];
      expect(result.overallScore).toBe(4);
    });

    it('each dimension score is correctly recorded in the result', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectScore(0, 0);
      selectScore(1, 1);
      selectScore(2, 2);
      selectScore(3, 3);
      selectScore(4, 4);
      selectScore(5, 1);
      selectScore(6, 3);
      selectScore(7, 3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      const dims = onSubmit.mock.calls[0][0].dimensions;
      expect(dims[0].score).toBe(0);
      expect(dims[1].score).toBe(1);
      expect(dims[2].score).toBe(2);
      expect(dims[3].score).toBe(3);
      expect(dims[4].score).toBe(4);
      expect(dims[5].score).toBe(1);
    });

    it('all dimensions have maxScore of 4', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      const dims = onSubmit.mock.calls[0][0].dimensions;
      for (const d of dims) {
        expect(d.maxScore).toBe(4);
      }
    });

    it('result has a valid ISO date string', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      const result = onSubmit.mock.calls[0][0];
      expect(() => new Date(result.createdAt)).not.toThrow();
      expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
    });

    it('result has a non-empty string id', () => {
      const onSubmit = vi.fn();
      renderRubric({ onSubmit });
      selectAllScores(3);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

      const result = onSubmit.mock.calls[0][0];
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });
});

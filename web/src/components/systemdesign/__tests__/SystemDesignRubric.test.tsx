import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemDesignRubric from '../SystemDesignRubric';

vi.mock('lucide-react', () => ({
  Star:       () => null,
  TrendingUp: () => <span data-testid="icon-trending" />,
  X:          () => <span data-testid="icon-x" />,
}));

const BASE_PROPS = {
  topicTitle: 'URL Shortener',
  onSubmit: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onSubmit.mockClear();
  BASE_PROPS.onClose.mockClear();
});

/**
 * Score every dimension with the given value.
 * Each dimension has 5 score buttons (0–4). getAllByRole('button', { name: '3' })
 * returns one per dimension (6 total). Click all of them.
 */
function scoreAll(score = 3) {
  // Score buttons have text content = the score digit (Star renders null)
  const btns = screen.getAllByRole('button').filter(
    (b) => b.textContent?.trim() === String(score),
  );
  btns.forEach((btn) => fireEvent.click(btn));
}

describe('SystemDesignRubric', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<SystemDesignRubric {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows "System Design Rubric" modal title', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('System Design Rubric')).toBeDefined();
    });

    it('shows topic title in description', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('URL Shortener')).toBeDefined();
    });
  });

  describe('dimension labels', () => {
    it('shows Scalability dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('Scalability')).toBeDefined();
    });

    it('shows Reliability dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('Reliability')).toBeDefined();
    });

    it('shows Data Model dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('Data Model')).toBeDefined();
    });

    it('shows API Design dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('API Design')).toBeDefined();
    });

    it('shows Trade-offs dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('Trade-offs')).toBeDefined();
    });

    it('shows Communication dimension', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByText('Communication')).toBeDefined();
    });
  });

  describe('score buttons', () => {
    it('Submit Evaluation is disabled initially (no scores set)', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      const submitBtn = screen.getByRole('button', { name: /Submit Evaluation/i });
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    it('shows score label after clicking score 4 for Scalability', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      // Click the first "4" button (belongs to Scalability — first dimension)
      const fours = screen.getAllByRole('button').filter((b) => b.textContent?.trim() === '4');
      fireEvent.click(fours[0]);
      expect(screen.getByText('Excellent')).toBeDefined();
    });

    it('shows "Strong" label after clicking score 3', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      const threes = screen.getAllByRole('button').filter((b) => b.textContent?.trim() === '3');
      fireEvent.click(threes[0]);
      expect(screen.getByText('Strong')).toBeDefined();
    });

    it('Submit Evaluation enabled when all dimensions scored', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      expect(screen.getByRole('button', { name: /Submit Evaluation/i }).hasAttribute('disabled')).toBe(false);
    });

    it('shows Overall Score panel when all dimensions scored', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(4);
      expect(screen.getByText('Overall Score')).toBeDefined();
    });

    it('shows correct overall score when all dimensions scored 4', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(4);
      expect(screen.getByText('4.0 / 4.0')).toBeDefined();
    });

    it('shows correct overall score when all dimensions scored 2', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(2);
      expect(screen.getByText('2.0 / 4.0')).toBeDefined();
    });
  });

  describe('feedback textarea', () => {
    it('shows Additional Notes textarea', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText(/What went well/i)).toBeDefined();
    });
  });

  describe('Cancel and Close', () => {
    it('Cancel button calls onClose', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });

    it('close (X) button has aria-label "Close rubric"', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Close rubric' })).toBeDefined();
    });

    it('clicking X button calls onClose', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close rubric' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('submit flow', () => {
    it('clicking Submit Evaluation calls onSubmit', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      expect(BASE_PROPS.onSubmit).toHaveBeenCalledOnce();
    });

    it('onSubmit called with correct topicTitle', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      const review = BASE_PROPS.onSubmit.mock.calls[0][0];
      expect(review.topicTitle).toBe('URL Shortener');
    });

    it('onSubmit called with 6 dimensions', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      const review = BASE_PROPS.onSubmit.mock.calls[0][0];
      expect(review.dimensions).toHaveLength(6);
    });

    it('onSubmit called with overallScore 3.0 when all scored 3', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      const review = BASE_PROPS.onSubmit.mock.calls[0][0];
      expect(review.overallScore).toBe(3);
    });

    it('shows results view after submit', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      expect(screen.getByText('System Design Review Complete')).toBeDefined();
    });
  });

  describe('results view', () => {
    function submitAndShowResults() {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(3);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
    }

    it('shows overall score in results view', () => {
      submitAndShowResults();
      expect(screen.getByText('3.0')).toBeDefined();
    });

    it('shows /4.0 in results view', () => {
      submitAndShowResults();
      expect(screen.getByText('/4.0')).toBeDefined();
    });

    it('shows topic title in results view', () => {
      submitAndShowResults();
      expect(screen.getByText('URL Shortener')).toBeDefined();
    });

    it('shows Improvement Plan section', () => {
      submitAndShowResults();
      expect(screen.getByText('Improvement Plan')).toBeDefined();
    });

    it('shows Done button in results view', () => {
      submitAndShowResults();
      expect(screen.getByRole('button', { name: 'Done' })).toBeDefined();
    });

    it('clicking Done calls onClose', () => {
      submitAndShowResults();
      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });

    it('shows improvement plan item for weak dimensions (score ≤ 2)', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      // Score all 6 dimensions as 3 first, then downgrade Scalability to 0
      scoreAll(3);
      const zeros = screen.getAllByRole('button').filter((b) => b.textContent?.trim() === '0');
      fireEvent.click(zeros[0]); // change scalability from 3 → 0
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      expect(screen.getByText(/horizontal scaling/i)).toBeDefined();
    });

    it('shows "Excellent design" plan when all scores are perfect', () => {
      render(<SystemDesignRubric {...BASE_PROPS} />);
      scoreAll(4);
      fireEvent.click(screen.getByRole('button', { name: /Submit Evaluation/i }));
      expect(screen.getByText(/Excellent design/i)).toBeDefined();
    });
  });
});

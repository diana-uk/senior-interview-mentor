import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StarStoryEditor from '../StarStoryEditor';
import type { StarStory } from '../../../hooks/useStarStories';

vi.mock('lucide-react', () => ({
  X:    () => <span data-testid="icon-x" />,
  Send: () => <span data-testid="icon-send" />,
}));

vi.mock('../../../data/behavioral', () => ({
  CATEGORY_META: {
    leadership:   { label: 'Leadership',          color: 'var(--neon-cyan)' },
    conflict:     { label: 'Conflict Resolution',  color: 'var(--neon-red)' },
    collaboration:{ label: 'Collaboration',        color: 'var(--neon-lime)' },
  },
}));

function makeStory(overrides: Partial<StarStory> = {}): StarStory {
  return {
    id: 's1',
    title: 'Led migration to microservices',
    situation: 'We had a monolithic app that was slowing down deploys.',
    task: 'I was responsible for planning the migration strategy.',
    action: 'I broke the work into phases, starting with the auth service.',
    result: 'Deploys went from 2 hours to 15 minutes.',
    tags: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const BASE_PROPS = {
  onSave: vi.fn(),
  onClose: vi.fn(),
  onReviewWithAI: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onSave.mockClear();
  BASE_PROPS.onClose.mockClear();
  BASE_PROPS.onReviewWithAI.mockClear();
});

describe('StarStoryEditor', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<StarStoryEditor {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows "New STAR Story" title when no story prop', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('New STAR Story')).toBeDefined();
    });

    it('shows "Edit Story" title when story prop provided', () => {
      render(<StarStoryEditor {...BASE_PROPS} story={makeStory()} />);
      expect(screen.getByText('Edit Story')).toBeDefined();
    });

    it('shows Story Title input', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText(/Led migration to microservices/i)).toBeDefined();
    });

    it('shows Situation section label', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('Situation')).toBeDefined();
    });

    it('shows Task section label', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('Task')).toBeDefined();
    });

    it('shows Action section label', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('Action')).toBeDefined();
    });

    it('shows Result section label', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('Result')).toBeDefined();
    });

    it('shows Situation textarea with placeholder', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Enter situation...')).toBeDefined();
    });

    it('shows Task textarea with placeholder', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Enter task...')).toBeDefined();
    });

    it('shows Action textarea with placeholder', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Enter action...')).toBeDefined();
    });

    it('shows Result textarea with placeholder', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Enter result...')).toBeDefined();
    });

    it('shows Behavioral Categories section', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('Behavioral Categories')).toBeDefined();
    });
  });

  describe('pre-fill from story prop', () => {
    it('pre-fills title from story', () => {
      render(<StarStoryEditor {...BASE_PROPS} story={makeStory()} />);
      const input = screen.getByPlaceholderText(/Led migration to microservices/i) as HTMLInputElement;
      expect(input.value).toBe('Led migration to microservices');
    });

    it('pre-fills situation textarea from story', () => {
      render(<StarStoryEditor {...BASE_PROPS} story={makeStory()} />);
      const ta = screen.getByPlaceholderText('Enter situation...') as HTMLTextAreaElement;
      expect(ta.value).toBe('We had a monolithic app that was slowing down deploys.');
    });

    it('pre-fills tags from story — tagged button has aria-pressed="true"', () => {
      render(<StarStoryEditor {...BASE_PROPS} story={makeStory({ tags: ['leadership'] })} />);
      const btn = screen.getByRole('button', { name: 'Leadership' });
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('word count display', () => {
    it('shows 0 word count initially for empty situation', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByText('0 / 50–150 words')).toBeDefined();
    });

    it('shows updated word count after typing in situation', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'One two three four five' },
      });
      expect(screen.getByText('5 / 50–150 words')).toBeDefined();
    });
  });

  describe('tag selector', () => {
    it('renders category tag buttons from mock CATEGORY_META', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Leadership' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Conflict Resolution' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Collaboration' })).toBeDefined();
    });

    it('all category buttons start with aria-pressed="false" when no tags', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      const btn = screen.getByRole('button', { name: 'Leadership' });
      expect(btn.getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking a tag button toggles aria-pressed to true', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Leadership' }));
      expect(screen.getByRole('button', { name: 'Leadership' }).getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking active tag button toggles aria-pressed back to false', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Leadership' }));
      fireEvent.click(screen.getByRole('button', { name: 'Leadership' }));
      expect(screen.getByRole('button', { name: 'Leadership' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Save Story button', () => {
    it('Save Story button is disabled when all STAR fields are empty', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      const saveBtn = screen.getByRole('button', { name: 'Save Story' });
      expect(saveBtn.hasAttribute('disabled')).toBe(true);
    });

    it('Save Story button is enabled when at least one STAR field has text', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'Some situation text' },
      });
      const saveBtn = screen.getByRole('button', { name: 'Save Story' });
      expect(saveBtn.hasAttribute('disabled')).toBe(false);
    });

    it('clicking Save Story calls onSave', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'Some situation text' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Story' }));
      expect(BASE_PROPS.onSave).toHaveBeenCalledOnce();
    });

    it('onSave called with correct situation text', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'My situation' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Story' }));
      const arg = BASE_PROPS.onSave.mock.calls[0][0];
      expect(arg.situation).toBe('My situation');
    });

    it('onSave uses "Untitled Story" when title is empty', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'Some text' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Save Story' }));
      const arg = BASE_PROPS.onSave.mock.calls[0][0];
      expect(arg.title).toBe('Untitled Story');
    });

    it('shows "Update Story" label when editing existing story', () => {
      render(<StarStoryEditor {...BASE_PROPS} story={makeStory()} />);
      expect(screen.getByRole('button', { name: 'Update Story' })).toBeDefined();
    });
  });

  describe('AI Review button', () => {
    it('AI Review button is disabled when all STAR fields are empty', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      const aiBtn = screen.getByRole('button', { name: /AI Review/i });
      expect(aiBtn.hasAttribute('disabled')).toBe(true);
    });

    it('AI Review button is enabled when at least one field has text', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter action...'), {
        target: { value: 'I did the thing' },
      });
      const aiBtn = screen.getByRole('button', { name: /AI Review/i });
      expect(aiBtn.hasAttribute('disabled')).toBe(false);
    });

    it('clicking AI Review calls onReviewWithAI', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'My situation' },
      });
      fireEvent.click(screen.getByRole('button', { name: /AI Review/i }));
      expect(BASE_PROPS.onReviewWithAI).toHaveBeenCalledOnce();
    });

    it('AI Review text includes STAR section headers', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'My situation' },
      });
      fireEvent.click(screen.getByRole('button', { name: /AI Review/i }));
      const text: string = BASE_PROPS.onReviewWithAI.mock.calls[0][0];
      expect(text).toContain('Situation');
      expect(text).toContain('Task');
      expect(text).toContain('Action');
      expect(text).toContain('Result');
    });

    it('clicking AI Review also calls onClose', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Enter situation...'), {
        target: { value: 'My situation' },
      });
      fireEvent.click(screen.getByRole('button', { name: /AI Review/i }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Cancel and Close', () => {
    it('clicking Cancel button calls onClose', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });

    it('Close (X) button has aria-label "Close editor"', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Close editor' })).toBeDefined();
    });

    it('clicking Close (X) button calls onClose', () => {
      render(<StarStoryEditor {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close editor' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });
  });
});

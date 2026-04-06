import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StarStoryList from '../StarStoryList';
import type { StarStory } from '../../../hooks/useStarStories';

vi.mock('lucide-react', () => ({
  Plus:   () => <span data-testid="icon-plus" />,
  Edit3:  () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Tag:    () => <span data-testid="icon-tag" />,
  Star:   () => <span data-testid="icon-star" />,
}));

vi.mock('../../ui/EmptyState', () => ({
  default: ({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) => (
    <div data-testid="empty-state">
      {title}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  ),
}));

vi.mock('../../../data/behavioral', () => ({
  CATEGORY_META: {
    leadership:    { label: 'Leadership',         color: 'var(--neon-cyan)' },
    conflict:      { label: 'Conflict Resolution', color: 'var(--neon-red)' },
    collaboration: { label: 'Collaboration',       color: 'var(--neon-lime)' },
  },
  // 2 leadership questions, 1 conflict question
  behavioralQuestions: [
    { id: 'q1', category: 'leadership' },
    { id: 'q2', category: 'leadership' },
    { id: 'q3', category: 'conflict' },
  ],
}));

function makeStory(overrides: Partial<StarStory> = {}): StarStory {
  return {
    id: 's1',
    title: 'Led microservices migration',
    situation: 'We had a monolithic application.',
    task: 'Plan the migration.',
    action: 'I broke it into phases.',
    result: 'Deploys went from 2h to 15min.',
    tags: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const BASE_PROPS = {
  stories: [],
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onAdd.mockClear();
  BASE_PROPS.onEdit.mockClear();
  BASE_PROPS.onDelete.mockClear();
});

describe('StarStoryList', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<StarStoryList {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows "0 stories" label when empty', () => {
      render(<StarStoryList {...BASE_PROPS} />);
      expect(screen.getByText('0 stories')).toBeDefined();
    });

    it('shows "1 story" (singular) label', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      expect(screen.getByText('1 story')).toBeDefined();
    });

    it('shows "2 stories" (plural) label', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ id: 's1' }), makeStory({ id: 's2' })]} />);
      expect(screen.getByText('2 stories')).toBeDefined();
    });

    it('header New Story button calls onAdd', () => {
      // Use a story so EmptyState (with its own "+ New Story" action) is not rendered
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      fireEvent.click(screen.getByRole('button', { name: /New Story/i }));
      expect(BASE_PROPS.onAdd).toHaveBeenCalledOnce();
    });
  });

  describe('empty state', () => {
    it('shows EmptyState when no stories', () => {
      render(<StarStoryList {...BASE_PROPS} />);
      expect(screen.getByTestId('empty-state')).toBeDefined();
    });

    it('EmptyState title is "No stories yet"', () => {
      render(<StarStoryList {...BASE_PROPS} />);
      expect(screen.getByText('No stories yet')).toBeDefined();
    });

    it('EmptyState action button calls onAdd', () => {
      render(<StarStoryList {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('+ New Story'));
      expect(BASE_PROPS.onAdd).toHaveBeenCalledOnce();
    });

    it('does not show EmptyState when stories exist', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      expect(screen.queryByTestId('empty-state')).toBeNull();
    });
  });

  describe('story cards', () => {
    it('shows story title', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      expect(screen.getByText('Led microservices migration')).toBeDefined();
    });

    it('shows situation preview text', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      expect(screen.getByText(/We had a monolithic application/)).toBeDefined();
    });

    it('truncates situation preview at 100 chars with ellipsis', () => {
      const longSituation = 'A'.repeat(110);
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ situation: longSituation })]} />);
      expect(screen.getByText(`${'A'.repeat(100)}…`)).toBeDefined();
    });

    it('renders multiple stories', () => {
      const stories = [
        makeStory({ id: 's1', title: 'Story Alpha' }),
        makeStory({ id: 's2', title: 'Story Beta' }),
      ];
      render(<StarStoryList {...BASE_PROPS} stories={stories} />);
      expect(screen.getByText('Story Alpha')).toBeDefined();
      expect(screen.getByText('Story Beta')).toBeDefined();
    });
  });

  describe('question coverage badge', () => {
    it('does not show answers count when no tags', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: [] })]} />);
      expect(screen.queryByText(/answers \d+ question/)).toBeNull();
    });

    it('shows correct count for leadership tag (2 questions)', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: ['leadership'] })]} />);
      expect(screen.getByText('answers 2 questions')).toBeDefined();
    });

    it('shows "1 question" singular when count is 1', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: ['conflict'] })]} />);
      expect(screen.getByText('answers 1 question')).toBeDefined();
    });
  });

  describe('tags display', () => {
    it('shows category label chip for tagged story', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: ['leadership'] })]} />);
      expect(screen.getByText('Leadership')).toBeDefined();
    });

    it('shows multiple tag chips', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: ['leadership', 'conflict'] })]} />);
      expect(screen.getByText('Leadership')).toBeDefined();
      expect(screen.getByText('Conflict Resolution')).toBeDefined();
    });

    it('does not show tag icon when no tags', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ tags: [] })]} />);
      expect(screen.queryByTestId('icon-tag')).toBeNull();
    });
  });

  describe('edit button', () => {
    it('renders edit button with aria-label', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      expect(screen.getByRole('button', { name: /Edit story: Led microservices migration/i })).toBeDefined();
    });

    it('clicking edit button calls onEdit with the story', () => {
      const story = makeStory();
      render(<StarStoryList {...BASE_PROPS} stories={[story]} />);
      fireEvent.click(screen.getByRole('button', { name: /Edit story:/i }));
      expect(BASE_PROPS.onEdit).toHaveBeenCalledWith(story);
    });
  });

  describe('delete with confirmation', () => {
    it('first click shows confirmation message', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      fireEvent.click(screen.getByRole('button', { name: /Delete story:/i }));
      expect(screen.getByText('Click delete again to confirm.')).toBeDefined();
    });

    it('first click does NOT call onDelete', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory()]} />);
      fireEvent.click(screen.getByRole('button', { name: /Delete story:/i }));
      expect(BASE_PROPS.onDelete).not.toHaveBeenCalled();
    });

    it('second click calls onDelete with story id', () => {
      render(<StarStoryList {...BASE_PROPS} stories={[makeStory({ id: 's1' })]} />);
      // First click — enters confirm state; aria-label changes
      fireEvent.click(screen.getByRole('button', { name: /Delete story:/i }));
      // Second click — confirm state button
      fireEvent.click(screen.getByRole('button', { name: /Confirm delete:/i }));
      expect(BASE_PROPS.onDelete).toHaveBeenCalledWith('s1');
    });

  });
});

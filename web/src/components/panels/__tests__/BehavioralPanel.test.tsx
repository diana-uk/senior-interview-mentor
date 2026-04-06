import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BehavioralPanel from '../BehavioralPanel';

vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Filter: () => <span data-testid="icon-filter" />,
  Shuffle: () => <span data-testid="icon-shuffle" />,
  X: () => <span data-testid="icon-x" />,
  Star: () => <span data-testid="icon-star" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Save: () => <span data-testid="icon-save" />,
  BookOpen: () => <span data-testid="icon-book" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Edit3: () => <span data-testid="icon-edit" />,
}));

const mockGetRandomQuestion = vi.fn();

vi.mock('../../../data/behavioral', () => ({
  behavioralQuestions: [
    {
      id: 'q1',
      question: 'Tell me about a time you led a project',
      category: 'leadership',
      levels: ['senior'],
      companies: ['general'],
      tips: ['Be specific about your role'],
      followUps: ['What would you do differently?'],
    },
    {
      id: 'q2',
      question: 'Describe a conflict you resolved',
      category: 'conflict',
      levels: ['mid', 'senior'],
      companies: ['general'],
      tips: [],
      followUps: [],
    },
  ],
  getRandomQuestion: (...args: unknown[]) => mockGetRandomQuestion(...args),
  CATEGORY_META: {
    leadership: { label: 'Leadership', icon: 'crown', color: 'var(--neon-cyan)' },
    conflict: { label: 'Conflict Resolution', icon: 'swords', color: 'var(--neon-red)' },
  },
  COMPANY_META: {
    general: { label: 'General' },
  },
}));

vi.mock('../../../utils/storage.js', () => ({
  safeGetItem: vi.fn(() => null),
  safeSetItem: vi.fn(),
}));

vi.mock('../../../hooks/useStarStories', () => ({
  useStarStories: () => ({
    stories: [],
    addStory: vi.fn(),
    updateStory: vi.fn(),
    deleteStory: vi.fn(),
  }),
}));

vi.mock('../../behavioral/StarStoryList', () => ({
  default: () => <div data-testid="star-story-list" />,
}));

vi.mock('../../behavioral/StarStoryEditor', () => ({
  default: () => <div data-testid="star-story-editor" />,
}));

const BASE_PROPS = {
  onStartQuestion: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onStartQuestion.mockClear();
  mockGetRandomQuestion.mockReturnValue({
    id: 'q1',
    question: 'Tell me about a time you led a project',
    category: 'leadership',
    levels: ['senior'],
    companies: ['general'],
    tips: [],
    followUps: [],
  });
});

describe('BehavioralPanel', () => {
  describe('browse view', () => {
    it('renders without crashing', () => {
      expect(() => render(<BehavioralPanel {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows Random Practice Question button', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /Random Practice Question/i })).toBeDefined();
    });

    it('shows search input with placeholder', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Search questions...')).toBeDefined();
    });

    it('shows All Categories option in category select', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByRole('option', { name: 'All Categories' })).toBeDefined();
    });

    it('shows category label from mock data', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      // "Leadership" appears in both the dropdown option and the card header
      expect(screen.getAllByText('Leadership').length).toBeGreaterThan(0);
    });

    it('shows question text from mock data', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByText('Tell me about a time you led a project')).toBeDefined();
    });

    it('shows both mock questions', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByText('Tell me about a time you led a project')).toBeDefined();
      expect(screen.getByText('Describe a conflict you resolved')).toBeDefined();
    });

    it('shows "Questions" active tab button', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /^Questions$/i })).toBeDefined();
    });

    it('shows "My Stories" tab button', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /My Stories/i })).toBeDefined();
    });
  });

  describe('filter behavior', () => {
    it('shows result count when search is active', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Search questions...'), {
        target: { value: 'conflict' },
      });
      expect(screen.getByText(/question.* found/i)).toBeDefined();
    });

    it('shows clear search button when search has text', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Search questions...'), {
        target: { value: 'conflict' },
      });
      expect(screen.getByRole('button', { name: /Clear search/i })).toBeDefined();
    });

    it('clear search button removes search text', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Search questions...'), {
        target: { value: 'conflict' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Clear search/i }));
      expect(screen.queryByText(/question.* found/i)).toBeNull();
    });
  });

  describe('stories view', () => {
    it('clicking My Stories shows StarStoryList', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /My Stories/i }));
      expect(screen.getByTestId('star-story-list')).toBeDefined();
    });

    it('clicking Questions returns to browse view', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /My Stories/i }));
      fireEvent.click(screen.getByRole('button', { name: /^Questions$/i }));
      expect(screen.getByText('Tell me about a time you led a project')).toBeDefined();
    });
  });

  describe('practice view', () => {
    function goToPractice() {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Tell me about a time you led a project'));
    }

    it('clicking a question navigates to practice view', () => {
      goToPractice();
      expect(screen.getByText('STAR Method')).toBeDefined();
    });

    it('shows Back to Questions button', () => {
      goToPractice();
      expect(screen.getByRole('button', { name: /Back to Questions/i })).toBeDefined();
    });

    it('clicking Back to Questions returns to browse', () => {
      goToPractice();
      fireEvent.click(screen.getByRole('button', { name: /Back to Questions/i }));
      expect(screen.getByText('Tell me about a time you led a project')).toBeDefined();
    });

    it('shows the question text in practice view', () => {
      goToPractice();
      expect(screen.getByText('Tell me about a time you led a project')).toBeDefined();
    });

    it('shows Situation textarea', () => {
      goToPractice();
      expect(screen.getByPlaceholderText('Enter situation...')).toBeDefined();
    });

    it('shows Task textarea', () => {
      goToPractice();
      expect(screen.getByPlaceholderText('Enter task...')).toBeDefined();
    });

    it('shows Action textarea', () => {
      goToPractice();
      expect(screen.getByPlaceholderText('Enter action...')).toBeDefined();
    });

    it('shows Result textarea', () => {
      goToPractice();
      expect(screen.getByPlaceholderText('Enter result...')).toBeDefined();
    });

    it('shows Get AI Feedback button', () => {
      goToPractice();
      expect(screen.getByRole('button', { name: /Get AI Feedback/i })).toBeDefined();
    });

    it('clicking Get AI Feedback calls onStartQuestion', () => {
      goToPractice();
      fireEvent.click(screen.getByRole('button', { name: /Get AI Feedback/i }));
      expect(BASE_PROPS.onStartQuestion).toHaveBeenCalledOnce();
    });

    it('shows tips when question has tips', () => {
      goToPractice();
      expect(screen.getByText('Be specific about your role')).toBeDefined();
    });

    it('shows follow-up questions when present', () => {
      goToPractice();
      expect(screen.getByText('What would you do differently?')).toBeDefined();
    });
  });

  describe('Random Practice Question', () => {
    it('clicking Random Practice Question calls getRandomQuestion', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /Random Practice Question/i }));
      expect(mockGetRandomQuestion).toHaveBeenCalled();
    });

    it('Random Practice navigates to practice view', () => {
      render(<BehavioralPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /Random Practice Question/i }));
      expect(screen.getByText('STAR Method')).toBeDefined();
    });
  });
});

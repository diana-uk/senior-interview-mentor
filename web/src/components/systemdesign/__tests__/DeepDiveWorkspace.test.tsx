import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DeepDiveWorkspace from '../DeepDiveWorkspace';
import type { DeepDiveChallenge, SystemDesignPhase, PhaseStatus } from '../../../types';

vi.mock('lucide-react', () => ({
  Plus:        () => <span data-testid="icon-plus" />,
  X:           () => <span data-testid="icon-x" />,
  ArrowRight:  () => <span data-testid="icon-arrow-right" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

vi.mock('../MentorPanel', () => ({
  default: () => <div data-testid="mentor-panel" />,
}));

vi.mock('../deepdive/deepDiveSerializer', () => ({
  serializeDeepDivesToText: vi.fn(() => 'serialized-deep-dives'),
}));

import { serializeDeepDivesToText } from '../deepdive/deepDiveSerializer';

function makeChallenge(overrides: Partial<DeepDiveChallenge> = {}): DeepDiveChallenge {
  return {
    id: 'ch1',
    title: 'Caching Strategy',
    problem: 'How to cache data?',
    approaches: [
      { name: 'Write-through', pros: 'consistent', cons: 'slow writes' },
      { name: 'Write-behind', pros: 'fast writes', cons: 'risk of loss' },
    ],
    chosenIndex: -1,
    justification: '',
    tradeoffs: '',
    ...overrides,
  };
}

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed',
    requirements: 'completed',
    api: 'completed',
    data: 'completed',
    architecture: 'completed',
    deepdive: 'in-progress',
    scaling: 'locked',
    ...overrides,
  };
}

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview', 'requirements', 'api', 'data', 'architecture', 'deepdive', 'scaling',
];

const BASE_PROPS = {
  challenges: [] as DeepDiveChallenge[],
  onUpdateChallenges: vi.fn(),
  onAdvancePhase: vi.fn(),
  currentPhase: 'deepdive' as SystemDesignPhase,
  phaseStatuses: makeStatuses(),
  phaseOrder: PHASE_ORDER,
  onPhaseClick: vi.fn(),
  timerSeconds: 1200,
  messages: [],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onUpdateChallenges.mockClear();
  BASE_PROPS.onAdvancePhase.mockClear();
  BASE_PROPS.onPhaseClick.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  vi.mocked(serializeDeepDivesToText).mockClear();
});

describe('DeepDiveWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<DeepDiveWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders PhaseProgressSidebar', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
    });

    it('renders MentorPanel', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('mentor-panel')).toBeDefined();
    });

    it('shows Add Deep Dive button', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Add Deep Dive')).toBeDefined();
    });
  });

  describe('empty state', () => {
    it('shows Pick a Technical Challenge title', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      expect(screen.getByText('Pick a Technical Challenge')).toBeDefined();
    });

    it('shows all 5 template buttons', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      expect(screen.getByText('Caching Strategy')).toBeDefined();
      expect(screen.getByText('Consistency Model')).toBeDefined();
      expect(screen.getByText('Rate Limiting')).toBeDefined();
      expect(screen.getByText('Data Partitioning')).toBeDefined();
      expect(screen.getByText('Conflict Resolution')).toBeDefined();
    });

    it('clicking Caching template calls onUpdateChallenges with a caching challenge', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      fireEvent.click(screen.getByText('Caching Strategy'));
      expect(BASE_PROPS.onUpdateChallenges).toHaveBeenCalledOnce();
      const [challenges] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(challenges[0].title).toBe('Caching Strategy');
    });

    it('clicking Rate Limiting template creates challenge with correct title', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      fireEvent.click(screen.getByText('Rate Limiting'));
      const [challenges] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(challenges[0].title).toBe('Rate Limiting');
    });
  });

  describe('Add Deep Dive button', () => {
    it('clicking Add Deep Dive calls onUpdateChallenges with a new empty challenge', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      fireEvent.click(screen.getByText('Add Deep Dive'));
      expect(BASE_PROPS.onUpdateChallenges).toHaveBeenCalledOnce();
      const [challenges] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(challenges.length).toBe(1);
      expect(challenges[0].title).toBe('');
    });

    it('is disabled at MAX_CHALLENGES (3)', () => {
      const challenges = [
        makeChallenge({ id: 'ch1' }),
        makeChallenge({ id: 'ch2' }),
        makeChallenge({ id: 'ch3' }),
      ];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      expect(screen.getByText('Add Deep Dive').closest('button')!.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('tab bar', () => {
    it('shows a tab for each challenge', () => {
      const challenges = [
        makeChallenge({ id: 'ch1', title: 'Caching' }),
        makeChallenge({ id: 'ch2', title: 'Partitioning' }),
      ];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      expect(screen.getByText('Caching')).toBeDefined();
      expect(screen.getByText('Partitioning')).toBeDefined();
    });

    it('first tab has active class', () => {
      const challenges = [makeChallenge({ id: 'ch1', title: 'Caching' })];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      const tabs = document.querySelectorAll('.sd-deepdive__tab');
      expect(tabs[0].classList.contains('sd-deepdive__tab--active')).toBe(true);
    });

    it('shows tab badge numbers', () => {
      const challenges = [
        makeChallenge({ id: 'ch1', title: 'Caching' }),
        makeChallenge({ id: 'ch2', title: 'Partitioning' }),
      ];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      expect(screen.getByText('1')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();
    });

    it('shows Untitled for challenges with no title', () => {
      const challenges = [makeChallenge({ id: 'ch1', title: '' })];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      expect(screen.getByText('Untitled')).toBeDefined();
    });

    it('truncates long titles with ellipsis', () => {
      const longTitle = 'This is a very long challenge title that exceeds twenty chars';
      const challenges = [makeChallenge({ id: 'ch1', title: longTitle })];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      const tab = document.querySelectorAll('.sd-deepdive__tab')[0];
      expect(tab.textContent).toContain('\u2026');
    });

    it('close button has aria-label "Remove <title>"', () => {
      const challenges = [makeChallenge({ id: 'ch1', title: 'Caching' })];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      expect(screen.getByRole('button', { name: 'Remove Caching' })).toBeDefined();
    });

    it('clicking close calls onUpdateChallenges without that challenge', () => {
      const challenges = [
        makeChallenge({ id: 'ch1', title: 'Caching' }),
        makeChallenge({ id: 'ch2', title: 'Partitioning' }),
      ];
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={challenges} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Caching' }));
      const [updated] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(updated.length).toBe(1);
      expect(updated[0].id).toBe('ch2');
    });
  });

  describe('challenge editor', () => {
    const ch = makeChallenge({
      id: 'ch1',
      title: 'Caching Strategy',
      problem: 'How to cache?',
      approaches: [
        { name: 'Write-through', pros: 'consistent', cons: 'slow' },
        { name: 'Write-behind', pros: 'fast', cons: 'risky' },
      ],
      chosenIndex: 0,
      justification: 'Write-through is safer',
      tradeoffs: 'We lose write speed',
    });

    it('shows Challenge Title heading', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      expect(screen.getByText('Challenge Title')).toBeDefined();
    });

    it('shows title input with current value', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const input = screen.getByPlaceholderText(/e\.g\., Caching strategy/) as HTMLInputElement;
      expect(input.value).toBe('Caching Strategy');
    });

    it('changing title calls onUpdateChallenges with updated title', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      fireEvent.change(screen.getByPlaceholderText(/e\.g\., Caching strategy/), { target: { value: 'New Title' } });
      const [updated] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(updated[0].title).toBe('New Title');
    });

    it('shows problem statement textarea', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const ta = screen.getByPlaceholderText(/Describe the specific technical/) as HTMLTextAreaElement;
      expect(ta.value).toBe('How to cache?');
    });

    it('shows approach name inputs', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const nameInputs = screen.getAllByPlaceholderText('Approach name') as HTMLInputElement[];
      expect(nameInputs[0].value).toBe('Write-through');
      expect(nameInputs[1].value).toBe('Write-behind');
    });

    it('changing approach name calls onUpdateChallenges', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const nameInputs = screen.getAllByPlaceholderText('Approach name');
      fireEvent.change(nameInputs[0], { target: { value: 'Write-Around' } });
      expect(BASE_PROPS.onUpdateChallenges).toHaveBeenCalledOnce();
    });

    it('chosen approach radio is checked for chosenIndex=0', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      expect(radios[0].checked).toBe(true);
      expect(radios[1].checked).toBe(false);
    });

    it('changing chosen approach radio calls onUpdateChallenges with new chosenIndex', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[1]);
      const [updated] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(updated[0].chosenIndex).toBe(1);
    });

    it('shows justification textarea', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const ta = screen.getByPlaceholderText(/Why is this the right choice/) as HTMLTextAreaElement;
      expect(ta.value).toBe('Write-through is safer');
    });

    it('shows tradeoffs textarea', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      const ta = screen.getByPlaceholderText(/e\.g\., We sacrifice strong/) as HTMLTextAreaElement;
      expect(ta.value).toBe('We lose write speed');
    });

    it('Add Approach button is disabled at MAX_APPROACHES (4)', () => {
      const fourApproaches = makeChallenge({
        id: 'ch1',
        approaches: [
          { name: 'A', pros: '', cons: '' },
          { name: 'B', pros: '', cons: '' },
          { name: 'C', pros: '', cons: '' },
          { name: 'D', pros: '', cons: '' },
        ],
      });
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[fourApproaches]} />);
      expect(screen.getByText('Add Approach').closest('button')!.hasAttribute('disabled')).toBe(true);
    });

    it('clicking Add Approach calls onUpdateChallenges with one more approach', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      fireEvent.click(screen.getByText('Add Approach'));
      const [updated] = BASE_PROPS.onUpdateChallenges.mock.calls[0];
      expect(updated[0].approaches.length).toBe(3);
    });
  });

  describe('Review Deep Dives button', () => {
    it('is disabled when no challenges', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[]} />);
      expect(screen.getByText('Review Deep Dives').closest('button')!.hasAttribute('disabled')).toBe(true);
    });

    it('is enabled when challenges exist', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[makeChallenge()]} />);
      expect(screen.getByText('Review Deep Dives').closest('button')!.hasAttribute('disabled')).toBe(false);
    });

    it('clicking calls serializeDeepDivesToText and onSendMessage', () => {
      const ch = makeChallenge();
      render(<DeepDiveWorkspace {...BASE_PROPS} challenges={[ch]} />);
      fireEvent.click(screen.getByText('Review Deep Dives').closest('button')!);
      expect(serializeDeepDivesToText).toHaveBeenCalledWith([ch]);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my deep dives:\n\nserialized-deep-dives',
      );
    });
  });

  describe('Next: Scaling button', () => {
    it('shows Next: Scaling button', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} />);
      expect(screen.getByText(/Next: Scaling/)).toBeDefined();
    });

    it('clicking Next: Scaling calls onAdvancePhase', () => {
      render(<DeepDiveWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText(/Next: Scaling/).closest('button')!);
      expect(BASE_PROPS.onAdvancePhase).toHaveBeenCalledOnce();
    });
  });
});

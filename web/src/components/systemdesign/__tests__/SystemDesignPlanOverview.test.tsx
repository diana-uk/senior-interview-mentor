import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemDesignPlanOverview from '../SystemDesignPlanOverview';
import type { SystemDesignPhase, PhaseStatus } from '../../../types';

vi.mock('lucide-react', () => ({
  Check:      () => <span data-testid="icon-check" />,
  Lock:       () => <span data-testid="icon-lock" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  Clock:      () => <span data-testid="icon-clock" />,
}));

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'pending',
    requirements: 'pending',
    api: 'locked',
    data: 'locked',
    architecture: 'locked',
    deepdive: 'locked',
    scaling: 'locked',
    ...overrides,
  };
}

const BASE_PROPS = {
  topicTitle: 'URL Shortener',
  topicPrompt: 'Design a URL shortening service like bit.ly.',
  phaseStatuses: makeStatuses(),
  onStartDesigning: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onStartDesigning.mockClear();
});

describe('SystemDesignPlanOverview', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<SystemDesignPlanOverview {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows topic title', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('URL Shortener')).toBeDefined();
    });

    it('shows topic prompt', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Design a URL shortening service like bit.ly.')).toBeDefined();
    });

    it('shows Design Roadmap heading', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Design Roadmap')).toBeDefined();
    });
  });

  describe('phase titles', () => {
    it('shows Requirements & Scope phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Requirements & Scope')).toBeDefined();
    });

    it('shows API Design phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('API Design')).toBeDefined();
    });

    it('shows Data Model & Storage phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Data Model & Storage')).toBeDefined();
    });

    it('shows High-Level Architecture phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('High-Level Architecture')).toBeDefined();
    });

    it('shows Deep Dives phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Deep Dives')).toBeDefined();
    });

    it('shows Scaling & Reliability phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Scaling & Reliability')).toBeDefined();
    });
  });

  describe('phase progress', () => {
    it('shows 0 / 6 phases when none completed', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('0 / 6 phases')).toBeDefined();
    });

    it('shows 3 / 6 phases when three completed', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'completed',
        api: 'completed',
        data: 'completed',
      })} />);
      expect(screen.getByText('3 / 6 phases')).toBeDefined();
    });

    it('shows 6 / 6 phases when all completed', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'completed',
        api: 'completed',
        data: 'completed',
        architecture: 'completed',
        deepdive: 'completed',
        scaling: 'completed',
      })} />);
      expect(screen.getByText('6 / 6 phases')).toBeDefined();
    });
  });

  describe('phase status badges', () => {
    it('shows "Start Here" badge for first pending phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByText('Start Here')).toBeDefined();
    });

    it('shows "Upcoming" badge for pending non-first phases', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'pending',
        api: 'pending',
        data: 'pending',
        architecture: 'pending',
        deepdive: 'pending',
        scaling: 'pending',
      })} />);
      // 5 non-first pending phases → 5 "Upcoming" badges
      expect(screen.getAllByText('Upcoming').length).toBe(5);
    });

    it('shows "Locked" badge for locked phases', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      // 5 locked phases (api, data, architecture, deepdive, scaling)
      expect(screen.getAllByText('Locked').length).toBe(5);
    });

    it('shows "Done" badge for completed phases', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'completed',
        api: 'completed',
      })} />);
      expect(screen.getAllByText('Done').length).toBe(2);
    });

    it('shows "Active" badge for in-progress phase', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'in-progress',
      })} />);
      expect(screen.getByText('Active')).toBeDefined();
    });

    it('shows check icons for completed phases', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'completed',
        api: 'completed',
      })} />);
      expect(screen.getAllByTestId('icon-check').length).toBe(2);
    });

    it('shows lock icons for locked phases', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      // 5 locked phases
      expect(screen.getAllByTestId('icon-lock').length).toBe(5);
    });
  });

  describe('timer display', () => {
    it('shows default timer 45:00 when timerSeconds not provided', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      // Default is 2700 seconds = 45:00
      expect(screen.getByText('45:00')).toBeDefined();
    });

    it('shows formatted timer when timerSeconds provided', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} timerSeconds={600} />);
      expect(screen.getByText('10:00')).toBeDefined();
    });

    it('formats 65 seconds as 1:05', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} timerSeconds={65} />);
      expect(screen.getByText('1:05')).toBeDefined();
    });
  });

  describe('CTA button', () => {
    it('shows Begin Requirements Phase button', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: /Begin Requirements Phase/i })).toBeDefined();
    });

    it('clicking CTA button calls onStartDesigning', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: /Begin Requirements Phase/i }));
      expect(BASE_PROPS.onStartDesigning).toHaveBeenCalledOnce();
    });
  });

  describe('step numbers', () => {
    it('shows step numbers 1–6 in the timeline', () => {
      render(<SystemDesignPlanOverview {...BASE_PROPS} phaseStatuses={makeStatuses({
        requirements: 'pending',
        api: 'pending',
        data: 'pending',
        architecture: 'pending',
        deepdive: 'pending',
        scaling: 'pending',
      })} />);
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByText(String(i))).toBeDefined();
      }
    });
  });
});

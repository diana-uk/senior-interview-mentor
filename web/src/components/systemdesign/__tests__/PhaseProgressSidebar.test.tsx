import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PhaseProgressSidebar from '../PhaseProgressSidebar';
import type { SystemDesignPhase, PhaseStatus } from '../../../types';

// ── Mock lucide-react icons ──
vi.mock('lucide-react', () => ({
  Check: (props: Record<string, unknown>) => <div data-testid="icon-check" {...props} />,
  Lock: (props: Record<string, unknown>) => <div data-testid="icon-lock" {...props} />,
  Circle: (props: Record<string, unknown>) => <div data-testid="icon-circle" {...props} />,
  ChevronRight: (props: Record<string, unknown>) => <div data-testid="icon-chevron" {...props} />,
}));

// ── Helpers ──

const ALL_PHASES: SystemDesignPhase[] = [
  'overview',
  'requirements',
  'api',
  'data',
  'architecture',
  'deepdive',
  'scaling',
];

/** Visible phases (overview is excluded from rendered steps). */
const VISIBLE_PHASES: SystemDesignPhase[] = ALL_PHASES.filter((p) => p !== 'overview');

const PHASE_LABELS: Record<SystemDesignPhase, string> = {
  overview: 'Plan Overview',
  requirements: 'Requirements',
  api: 'API Design',
  data: 'Data Model',
  architecture: 'Architecture',
  deepdive: 'Deep Dives',
  scaling: 'Scaling',
};

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

function renderSidebar(overrides: Partial<React.ComponentProps<typeof PhaseProgressSidebar>> = {}) {
  const defaults: React.ComponentProps<typeof PhaseProgressSidebar> = {
    currentPhase: 'requirements',
    phaseStatuses: makeStatuses(),
    phaseOrder: ALL_PHASES,
    onPhaseClick: vi.fn(),
    timerSeconds: 0,
  };
  return render(<PhaseProgressSidebar {...defaults} {...overrides} />);
}

// ── Tests ──

describe('PhaseProgressSidebar', () => {
  // ── Phase labels ──

  describe('phase labels', () => {
    it('renders all visible phase labels (overview excluded)', () => {
      renderSidebar();
      for (const phase of VISIBLE_PHASES) {
        expect(screen.getByText(PHASE_LABELS[phase])).toBeDefined();
      }
    });

    it('does not render the overview label in the step list', () => {
      renderSidebar();
      expect(screen.queryByText('Plan Overview')).toBeNull();
    });

    it('renders step numbers 1 through 6', () => {
      renderSidebar();
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByText(String(i))).toBeDefined();
      }
    });
  });

  // ── Phase status icons ──

  describe('phase status icons', () => {
    it('shows check icon for completed phases', () => {
      renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
        }),
      });
      const checks = screen.getAllByTestId('icon-check');
      expect(checks.length).toBe(2);
    });

    it('shows lock icon for locked phases', () => {
      renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'pending',
          api: 'locked',
          data: 'locked',
          architecture: 'locked',
          deepdive: 'locked',
          scaling: 'locked',
        }),
        currentPhase: 'overview',
      });
      const locks = screen.getAllByTestId('icon-lock');
      expect(locks.length).toBe(5);
    });

    it('shows chevron icon for the active phase', () => {
      renderSidebar({ currentPhase: 'requirements' });
      const chevrons = screen.getAllByTestId('icon-chevron');
      expect(chevrons.length).toBe(1);
    });

    it('shows circle icon for pending non-active phases', () => {
      renderSidebar({
        currentPhase: 'requirements',
        phaseStatuses: makeStatuses({
          requirements: 'pending',
          api: 'pending',
          data: 'pending',
          architecture: 'pending',
          deepdive: 'pending',
          scaling: 'pending',
        }),
      });
      // requirements = chevron (active), the other 5 = circle
      const circles = screen.getAllByTestId('icon-circle');
      expect(circles.length).toBe(5);
    });
  });

  // ── Active phase highlighting ──

  describe('active phase highlighting', () => {
    it('adds active class to the current phase button', () => {
      renderSidebar({ currentPhase: 'api', phaseStatuses: makeStatuses({ api: 'in-progress' }) });
      const btn = screen.getByText('API Design').closest('button')!;
      expect(btn.className).toContain('phase-sidebar__step--active');
    });

    it('does not add active class to non-current phases', () => {
      renderSidebar({ currentPhase: 'api', phaseStatuses: makeStatuses({ api: 'in-progress' }) });
      const btn = screen.getByText('Requirements').closest('button')!;
      expect(btn.className).not.toContain('phase-sidebar__step--active');
    });
  });

  // ── Completed phase styling ──

  describe('completed phase styling', () => {
    it('adds completed class to completed phases', () => {
      renderSidebar({
        phaseStatuses: makeStatuses({ requirements: 'completed' }),
      });
      const btn = screen.getByText('Requirements').closest('button')!;
      expect(btn.className).toContain('phase-sidebar__step--completed');
    });
  });

  // ── Locked phase styling and behavior ──

  describe('locked phases', () => {
    it('adds locked class to locked phases', () => {
      renderSidebar();
      const btn = screen.getByText('API Design').closest('button')!;
      expect(btn.className).toContain('phase-sidebar__step--locked');
    });

    it('disables the button for locked phases', () => {
      renderSidebar();
      const btn = screen.getByText('API Design').closest('button')! as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('does not call onPhaseClick when a locked phase is clicked', () => {
      const onPhaseClick = vi.fn();
      renderSidebar({ onPhaseClick });
      const btn = screen.getByText('API Design').closest('button')!;
      fireEvent.click(btn);
      expect(onPhaseClick).not.toHaveBeenCalled();
    });
  });

  // ── Phase navigation ──

  describe('phase navigation', () => {
    it('calls onPhaseClick with the correct phase when an unlocked phase is clicked', () => {
      const onPhaseClick = vi.fn();
      renderSidebar({
        onPhaseClick,
        phaseStatuses: makeStatuses({ requirements: 'in-progress', api: 'pending' }),
      });
      const btn = screen.getByText('API Design').closest('button')!;
      fireEvent.click(btn);
      expect(onPhaseClick).toHaveBeenCalledWith('api');
    });

    it('calls onPhaseClick for a completed phase', () => {
      const onPhaseClick = vi.fn();
      renderSidebar({
        onPhaseClick,
        phaseStatuses: makeStatuses({ requirements: 'completed' }),
      });
      const btn = screen.getByText('Requirements').closest('button')!;
      fireEvent.click(btn);
      expect(onPhaseClick).toHaveBeenCalledWith('requirements');
    });
  });

  // ── Progress bar ──

  describe('progress bar', () => {
    it('shows 0/6 completed when no phases are completed', () => {
      renderSidebar();
      expect(screen.getByText('0/6 completed')).toBeDefined();
    });

    it('shows 3/6 completed when three phases are completed', () => {
      renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
          data: 'completed',
        }),
      });
      expect(screen.getByText('3/6 completed')).toBeDefined();
    });

    it('shows 6/6 completed when all phases are completed', () => {
      renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
          data: 'completed',
          architecture: 'completed',
          deepdive: 'completed',
          scaling: 'completed',
        }),
      });
      expect(screen.getByText('6/6 completed')).toBeDefined();
    });

    it('sets progress fill width to 50% when 3 of 6 phases are completed', () => {
      const { container } = renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
          data: 'completed',
        }),
      });
      const fill = container.querySelector('.phase-sidebar__progress-fill') as HTMLElement;
      expect(fill.style.width).toBe('50%');
    });

    it('sets progress fill width to 0% when no phases are completed', () => {
      const { container } = renderSidebar();
      const fill = container.querySelector('.phase-sidebar__progress-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('sets progress fill width to 100% when all phases are completed', () => {
      const { container } = renderSidebar({
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
          data: 'completed',
          architecture: 'completed',
          deepdive: 'completed',
          scaling: 'completed',
        }),
      });
      const fill = container.querySelector('.phase-sidebar__progress-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });
  });

  // ── Timer display ──

  describe('timer display', () => {
    it('formats 0 seconds as 0:00', () => {
      renderSidebar({ timerSeconds: 0 });
      expect(screen.getByText('0:00')).toBeDefined();
    });

    it('formats 65 seconds as 1:05', () => {
      renderSidebar({ timerSeconds: 65 });
      expect(screen.getByText('1:05')).toBeDefined();
    });

    it('formats 600 seconds as 10:00', () => {
      renderSidebar({ timerSeconds: 600 });
      expect(screen.getByText('10:00')).toBeDefined();
    });

    it('formats 3661 seconds as 61:01', () => {
      renderSidebar({ timerSeconds: 3661 });
      expect(screen.getByText('61:01')).toBeDefined();
    });

    it('pads single-digit seconds with leading zero', () => {
      renderSidebar({ timerSeconds: 9 });
      expect(screen.getByText('0:09')).toBeDefined();
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles all phases locked (none active matches a visible phase)', () => {
      renderSidebar({
        currentPhase: 'overview',
        phaseStatuses: makeStatuses({
          requirements: 'locked',
          api: 'locked',
          data: 'locked',
          architecture: 'locked',
          deepdive: 'locked',
          scaling: 'locked',
        }),
      });
      const locks = screen.getAllByTestId('icon-lock');
      expect(locks.length).toBe(6);
      // All buttons disabled
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => expect((btn as HTMLButtonElement).disabled).toBe(true));
    });

    it('handles all phases completed', () => {
      renderSidebar({
        currentPhase: 'scaling',
        phaseStatuses: makeStatuses({
          requirements: 'completed',
          api: 'completed',
          data: 'completed',
          architecture: 'completed',
          deepdive: 'completed',
          scaling: 'completed',
        }),
      });
      // scaling is both active and completed: completed takes icon priority since completed check runs first
      const checks = screen.getAllByTestId('icon-check');
      expect(checks.length).toBe(6);
      expect(screen.getByText('6/6 completed')).toBeDefined();
    });

    it('handles first visible phase as active', () => {
      renderSidebar({
        currentPhase: 'requirements',
        phaseStatuses: makeStatuses({ requirements: 'in-progress' }),
      });
      const btn = screen.getByText('Requirements').closest('button')!;
      expect(btn.className).toContain('phase-sidebar__step--active');
      expect(screen.getByTestId('icon-chevron')).toBeDefined();
    });
  });
});

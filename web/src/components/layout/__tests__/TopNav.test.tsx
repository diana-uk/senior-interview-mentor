import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopNav from '../TopNav';
import type { Problem, Mode } from '../../../types';

// ── Mock lucide-react icons as simple div stubs ──

vi.mock('lucide-react', () => ({
  BookOpen: (props: Record<string, unknown>) => <div data-testid="icon-book-open" {...props} />,
  ClipboardCheck: (props: Record<string, unknown>) => <div data-testid="icon-clipboard-check" {...props} />,
  Lightbulb: (props: Record<string, unknown>) => <div data-testid="icon-lightbulb" {...props} />,
  Mic: (props: Record<string, unknown>) => <div data-testid="icon-mic" {...props} />,
  Timer: (props: Record<string, unknown>) => <div data-testid="icon-timer" {...props} />,
}));

// ── Mock ProfileDropdown ──

vi.mock('../../auth/ProfileDropdown', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="profile-dropdown" data-plan={props.plan} data-syncing={String(props.syncing)} />
  ),
}));

// ── Helpers ──

const baseProblem: Problem = {
  id: 'two-sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  pattern: 'HashMap',
  description: 'Find two numbers that add to target.',
  examples: ['[2,7,11,15], target=9 -> [0,1]'],
  constraints: ['2 <= nums.length <= 10^4'],
  starterCode: 'function twoSum() {}',
  testCases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }],
};

const defaultProps = {
  mode: 'TEACHER' as Mode,
  problem: null as Problem | null,
  timerSeconds: 2700,
  timerRunning: false,
  hintsUsed: 0,
  progressPercent: 0,
};

function renderNav(overrides: Partial<Parameters<typeof TopNav>[0]> = {}) {
  return render(<TopNav {...defaultProps} {...overrides} />);
}

// ── Tests ──

describe('TopNav', () => {
  // ── formatTime utility (tested via rendered output) ──

  describe('formatTime (via rendered timer)', () => {
    it('renders 0 seconds as "00:00"', () => {
      renderNav({ mode: 'INTERVIEWER', timerSeconds: 0 });
      expect(screen.getByText('00:00')).toBeDefined();
    });

    it('renders 61 seconds as "01:01"', () => {
      renderNav({ mode: 'INTERVIEWER', timerSeconds: 61 });
      expect(screen.getByText('01:01')).toBeDefined();
    });

    it('renders 600 seconds as "10:00"', () => {
      renderNav({ mode: 'INTERVIEWER', timerSeconds: 600 });
      expect(screen.getByText('10:00')).toBeDefined();
    });

    it('renders 3661 seconds as "61:01"', () => {
      renderNav({ mode: 'INTERVIEWER', timerSeconds: 3661 });
      expect(screen.getByText('61:01')).toBeDefined();
    });

    it('renders 59 seconds as "00:59"', () => {
      renderNav({ mode: 'INTERVIEWER', timerSeconds: 59 });
      expect(screen.getByText('00:59')).toBeDefined();
    });
  });

  // ── getTimerClass utility (tested via rendered classes) ──

  describe('getTimerClass (via timer element classes)', () => {
    function getTimerValue(container: HTMLElement) {
      return container.querySelector('.interview-timer-value');
    }

    it('applies no extra class when timer is not running', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: false, timerSeconds: 50 });
      const el = getTimerValue(container);
      expect(el).not.toBeNull();
      expect(el!.className).toBe('interview-timer-value ');
    });

    it('applies "interview-timer-safe" when running and seconds > 600', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: true, timerSeconds: 700 });
      const el = getTimerValue(container);
      expect(el!.classList.contains('interview-timer-safe')).toBe(true);
    });

    it('applies "interview-timer-warning" when running and 120 < seconds <= 600', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: true, timerSeconds: 300 });
      const el = getTimerValue(container);
      expect(el!.classList.contains('interview-timer-warning')).toBe(true);
    });

    it('applies "interview-timer-danger" when running and seconds <= 120', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: true, timerSeconds: 60 });
      const el = getTimerValue(container);
      expect(el!.classList.contains('interview-timer-danger')).toBe(true);
    });

    it('applies "interview-timer-danger" at exactly 120 seconds running', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: true, timerSeconds: 120 });
      const el = getTimerValue(container);
      expect(el!.classList.contains('interview-timer-danger')).toBe(true);
    });

    it('applies "interview-timer-warning" at exactly 600 seconds running', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: true, timerSeconds: 600 });
      const el = getTimerValue(container);
      expect(el!.classList.contains('interview-timer-warning')).toBe(true);
    });
  });

  // ── getDifficultyClass utility (tested via rendered badges) ──

  describe('getDifficultyClass (via difficulty badge)', () => {
    it('applies "badge badge-easy" for Easy problems', () => {
      const { container } = renderNav({ problem: { ...baseProblem, difficulty: 'Easy' } });
      const badge = container.querySelector('.badge.badge-easy');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe('Easy');
    });

    it('applies "badge badge-medium" for Medium problems', () => {
      const { container } = renderNav({ problem: { ...baseProblem, difficulty: 'Medium' } });
      const badge = container.querySelector('.badge.badge-medium');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe('Medium');
    });

    it('applies "badge badge-hard" for Hard problems', () => {
      const { container } = renderNav({ problem: { ...baseProblem, difficulty: 'Hard' } });
      const badge = container.querySelector('.badge.badge-hard');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toBe('Hard');
    });
  });

  // ── Component rendering ──

  describe('component rendering', () => {
    it('renders brand logo with "S"', () => {
      renderNav();
      expect(screen.getByText('S')).toBeDefined();
    });

    it('renders brand title "Senior Interview Mentor"', () => {
      renderNav();
      expect(screen.getByText('Senior Interview Mentor')).toBeDefined();
    });

    it('shows "Select a problem to begin" when no problem is set', () => {
      renderNav({ problem: null });
      expect(screen.getByText('Select a problem to begin')).toBeDefined();
    });

    it('shows problem title when a problem is set', () => {
      renderNav({ problem: baseProblem });
      expect(screen.getByText('Two Sum')).toBeDefined();
    });

    it('renders the nav element with topnav class', () => {
      const { container } = renderNav();
      const nav = container.querySelector('nav.topnav');
      expect(nav).not.toBeNull();
    });
  });

  // ── Mode switcher ──

  describe('mode switcher', () => {
    it('renders all three mode buttons', () => {
      renderNav();
      expect(screen.getByText('Teacher')).toBeDefined();
      expect(screen.getByText('Interviewer')).toBeDefined();
      expect(screen.getByText('Reviewer')).toBeDefined();
    });

    it('marks the active mode with aria-checked="true"', () => {
      renderNav({ mode: 'INTERVIEWER' });
      const radioGroup = screen.getByRole('radiogroup');
      const radios = radioGroup.querySelectorAll('[role="radio"]');
      const teacher = Array.from(radios).find(r => r.textContent?.includes('Teacher'));
      const interviewer = Array.from(radios).find(r => r.textContent?.includes('Interviewer'));
      const reviewer = Array.from(radios).find(r => r.textContent?.includes('Reviewer'));
      expect(teacher!.getAttribute('aria-checked')).toBe('false');
      expect(interviewer!.getAttribute('aria-checked')).toBe('true');
      expect(reviewer!.getAttribute('aria-checked')).toBe('false');
    });

    it('applies "active" class to the active mode button', () => {
      renderNav({ mode: 'REVIEWER' });
      const reviewerBtn = screen.getByText('Reviewer').closest('button');
      expect(reviewerBtn!.classList.contains('active')).toBe(true);
      const teacherBtn = screen.getByText('Teacher').closest('button');
      expect(teacherBtn!.classList.contains('active')).toBe(false);
    });

    it('calls onModeChange when a mode button is clicked', () => {
      const onModeChange = vi.fn();
      renderNav({ onModeChange });
      fireEvent.click(screen.getByText('Interviewer'));
      expect(onModeChange).toHaveBeenCalledWith('INTERVIEWER');
    });

    it('calls onModeChange with TEACHER when Teacher button clicked', () => {
      const onModeChange = vi.fn();
      renderNav({ mode: 'INTERVIEWER', onModeChange });
      fireEvent.click(screen.getByText('Teacher'));
      expect(onModeChange).toHaveBeenCalledWith('TEACHER');
    });

    it('calls onModeChange with REVIEWER when Reviewer button clicked', () => {
      const onModeChange = vi.fn();
      renderNav({ onModeChange });
      fireEvent.click(screen.getByText('Reviewer'));
      expect(onModeChange).toHaveBeenCalledWith('REVIEWER');
    });

    it('does not throw when onModeChange is not provided', () => {
      renderNav({ onModeChange: undefined });
      expect(() => fireEvent.click(screen.getByText('Interviewer'))).not.toThrow();
    });

    it('has role="radiogroup" with aria-label', () => {
      renderNav();
      const group = screen.getByRole('radiogroup');
      expect(group.getAttribute('aria-label')).toBe('Coaching mode');
    });
  });

  // ── Timer visibility ──

  describe('timer visibility', () => {
    it('shows timer when mode is INTERVIEWER', () => {
      const { container } = renderNav({ mode: 'INTERVIEWER', timerRunning: false });
      expect(container.querySelector('.interview-timer')).not.toBeNull();
    });

    it('shows timer when timerRunning is true even in TEACHER mode', () => {
      const { container } = renderNav({ mode: 'TEACHER', timerRunning: true });
      expect(container.querySelector('.interview-timer')).not.toBeNull();
    });

    it('hides timer in TEACHER mode when not running', () => {
      const { container } = renderNav({ mode: 'TEACHER', timerRunning: false });
      expect(container.querySelector('.interview-timer')).toBeNull();
    });

    it('hides timer in REVIEWER mode when not running', () => {
      const { container } = renderNav({ mode: 'REVIEWER', timerRunning: false });
      expect(container.querySelector('.interview-timer')).toBeNull();
    });
  });

  // ── Hints badge ──

  describe('hints badge', () => {
    it('displays "0/3" when no hints used', () => {
      renderNav({ hintsUsed: 0 });
      expect(screen.getByText('0/3')).toBeDefined();
    });

    it('displays "2/3" when two hints used', () => {
      renderNav({ hintsUsed: 2 });
      expect(screen.getByText('2/3')).toBeDefined();
    });

    it('displays "3/3" when all hints used', () => {
      renderNav({ hintsUsed: 3 });
      expect(screen.getByText('3/3')).toBeDefined();
    });

    it('renders "hints" label', () => {
      renderNav();
      expect(screen.getByText('hints')).toBeDefined();
    });
  });

  // ── Progress ring ──

  describe('progress ring', () => {
    it('renders SVG element', () => {
      const { container } = renderNav({ progressPercent: 50 });
      const svg = container.querySelector('.progress-ring svg');
      expect(svg).not.toBeNull();
    });

    it('renders background and fill circles', () => {
      const { container } = renderNav({ progressPercent: 50 });
      const bgCircle = container.querySelector('.progress-ring-bg');
      const fillCircle = container.querySelector('.progress-ring-fill');
      expect(bgCircle).not.toBeNull();
      expect(fillCircle).not.toBeNull();
    });

    it('sets correct strokeDashoffset for 0%', () => {
      const { container } = renderNav({ progressPercent: 0 });
      const fill = container.querySelector('.progress-ring-fill') as SVGCircleElement;
      const circumference = 2 * Math.PI * 10;
      const expectedOffset = circumference; // 0% = full offset
      expect(fill.getAttribute('stroke-dashoffset')).toBe(String(expectedOffset));
    });

    it('sets correct strokeDashoffset for 100%', () => {
      const { container } = renderNav({ progressPercent: 100 });
      const fill = container.querySelector('.progress-ring-fill') as SVGCircleElement;
      expect(fill.getAttribute('stroke-dashoffset')).toBe('0');
    });

    it('sets correct strokeDashoffset for 50%', () => {
      const { container } = renderNav({ progressPercent: 50 });
      const fill = container.querySelector('.progress-ring-fill') as SVGCircleElement;
      const circumference = 2 * Math.PI * 10;
      const expectedOffset = circumference - (50 / 100) * circumference;
      expect(fill.getAttribute('stroke-dashoffset')).toBe(String(expectedOffset));
    });
  });

  // ── Plan badge ──

  describe('plan badge', () => {
    it('shows "Premium" badge when plan is premium', () => {
      renderNav({ plan: 'premium' });
      expect(screen.getByText('Premium')).toBeDefined();
    });

    it('shows "Pro" badge when plan is pro', () => {
      renderNav({ plan: 'pro' });
      expect(screen.getByText('Pro')).toBeDefined();
    });

    it('does not show plan badge when plan is free', () => {
      renderNav({ plan: 'free' });
      expect(screen.queryByText('Premium')).toBeNull();
      expect(screen.queryByText('Pro')).toBeNull();
    });

    it('does not show plan badge when plan is undefined', () => {
      renderNav({ plan: undefined });
      expect(screen.queryByText('Premium')).toBeNull();
      expect(screen.queryByText('Pro')).toBeNull();
    });

    it('applies correct CSS class for premium badge', () => {
      const { container } = renderNav({ plan: 'premium' });
      const badge = container.querySelector('.badge-plan--premium');
      expect(badge).not.toBeNull();
    });

    it('applies correct CSS class for pro badge', () => {
      const { container } = renderNav({ plan: 'pro' });
      const badge = container.querySelector('.badge-plan--pro');
      expect(badge).not.toBeNull();
    });
  });

  // ── ProfileDropdown ──

  describe('ProfileDropdown', () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' } as Parameters<typeof TopNav>[0]['user'];

    it('renders ProfileDropdown when user, onSignOut, and onSync are provided', () => {
      renderNav({
        user: mockUser,
        onSignOut: vi.fn(),
        onSync: vi.fn(),
      });
      expect(screen.getByTestId('profile-dropdown')).toBeDefined();
    });

    it('does not render ProfileDropdown when user is null', () => {
      renderNav({
        user: null,
        onSignOut: vi.fn(),
        onSync: vi.fn(),
      });
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });

    it('does not render ProfileDropdown when onSignOut is missing', () => {
      renderNav({
        user: mockUser,
        onSignOut: undefined,
        onSync: vi.fn(),
      });
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });

    it('does not render ProfileDropdown when onSync is missing', () => {
      renderNav({
        user: mockUser,
        onSignOut: vi.fn(),
        onSync: undefined,
      });
      expect(screen.queryByTestId('profile-dropdown')).toBeNull();
    });

    it('passes plan and syncing props to ProfileDropdown', () => {
      renderNav({
        user: mockUser,
        onSignOut: vi.fn(),
        onSync: vi.fn(),
        syncing: true,
        plan: 'pro',
      });
      const dd = screen.getByTestId('profile-dropdown');
      expect(dd.getAttribute('data-plan')).toBe('pro');
      expect(dd.getAttribute('data-syncing')).toBe('true');
    });
  });
});

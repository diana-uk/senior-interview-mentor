import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudyPlanPanel from '../StudyPlanPanel';

vi.mock('lucide-react', () => ({
  Play: () => <span data-testid="icon-play" />,
  Square: () => <span data-testid="icon-square" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  Circle: () => <span data-testid="icon-circle" />,
  Bell: () => <span data-testid="icon-bell" />,
  BellOff: () => <span data-testid="icon-bell-off" />,
}));

vi.mock('../../../data/studyPlans', () => ({
  STUDY_PLAN_TEMPLATES: [
    { id: 'blind75', name: 'Blind 75', description: 'Top 75 problems', durationDays: 30, problemIds: ['p1', 'p2'] },
    { id: 'neetcode150', name: 'NeetCode 150', description: 'Full 150', durationDays: 60, problemIds: ['p3'] },
  ],
  PACE_CONFIG: {
    relaxed: { label: 'Relaxed', problemsPerDay: 1, description: '1 problem/day' },
    normal: { label: 'Normal', problemsPerDay: 2, description: '2 problems/day' },
    intense: { label: 'Intense', problemsPerDay: 4, description: '4 problems/day' },
  },
}));

vi.mock('../../../data/problems/index', () => ({
  problemsById: {
    p1: { id: 'p1', title: 'Two Sum', difficulty: 'Easy', group: 'HashMap' },
    p2: { id: 'p2', title: 'Best Time to Buy', difficulty: 'Easy', group: 'Sliding Window' },
  },
}));

const mockStartPlan = vi.fn();
const mockStopPlan = vi.fn();
const mockMarkComplete = vi.fn();
const mockSetReminderTime = vi.fn();
const mockGetTodayProblems = vi.fn(() => ['p1']);
const mockGetProgress = vi.fn(() => ({ completed: 3, total: 10, pct: 30 }));

// Mutable state shared by the mock — tests mutate this between cases
const mockHookState = {
  activePlan: null as object | null,
  startPlan: mockStartPlan,
  stopPlan: mockStopPlan,
  markComplete: mockMarkComplete,
  setReminderTime: mockSetReminderTime,
  getTodayProblems: mockGetTodayProblems,
  getProgress: mockGetProgress,
};

vi.mock('../../../hooks/useStudyPlan', () => ({
  useStudyPlan: () => mockHookState,
}));

beforeEach(() => {
  mockHookState.activePlan = null;
  mockStartPlan.mockClear();
  mockStopPlan.mockClear();
  mockMarkComplete.mockClear();
  mockGetTodayProblems.mockReturnValue(['p1']);
  mockGetProgress.mockReturnValue({ completed: 3, total: 10, pct: 30 });
});

describe('StudyPlanPanel', () => {
  describe('no active plan — template picker', () => {
    it('renders without crashing', () => {
      expect(() => render(<StudyPlanPanel />)).not.toThrow();
    });

    it('shows introductory description text', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText(/choose a study plan/i)).toBeDefined();
    });

    it('renders all template cards', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText('Blind 75')).toBeDefined();
      expect(screen.getByText('NeetCode 150')).toBeDefined();
    });

    it('renders template descriptions', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText('Top 75 problems')).toBeDefined();
      expect(screen.getByText('Full 150')).toBeDefined();
    });

    it('renders pace buttons for all 3 paces', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText('Relaxed')).toBeDefined();
      expect(screen.getByText('Normal')).toBeDefined();
      expect(screen.getByText('Intense')).toBeDefined();
    });

    it('Normal pace is selected by default (aria-pressed=true)', () => {
      render(<StudyPlanPanel />);
      const normalBtn = screen.getByText('Normal').closest('button');
      expect(normalBtn?.getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking a pace button marks it as selected', () => {
      render(<StudyPlanPanel />);
      const relaxedBtn = screen.getByText('Relaxed').closest('button')!;
      fireEvent.click(relaxedBtn);
      expect(relaxedBtn.getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking pace deselects previous selection', () => {
      render(<StudyPlanPanel />);
      fireEvent.click(screen.getByText('Relaxed').closest('button')!);
      const normalBtn = screen.getByText('Normal').closest('button');
      expect(normalBtn?.getAttribute('aria-pressed')).toBe('false');
    });

    it('renders Start button for each template', () => {
      render(<StudyPlanPanel />);
      const startBtns = screen.getAllByRole('button', { name: /start/i });
      expect(startBtns.length).toBe(2);
    });

    it('clicking Start calls startPlan with template and selected pace', () => {
      render(<StudyPlanPanel />);
      const startBtns = screen.getAllByRole('button', { name: /start/i });
      fireEvent.click(startBtns[0]);
      expect(mockStartPlan).toHaveBeenCalledOnce();
      expect(mockStartPlan.mock.calls[0][0].id).toBe('blind75');
      expect(mockStartPlan.mock.calls[0][1]).toBe('normal');
    });

    it('clicking Start passes selected pace to startPlan', () => {
      render(<StudyPlanPanel />);
      fireEvent.click(screen.getByText('Intense').closest('button')!);
      fireEvent.click(screen.getAllByRole('button', { name: /start/i })[1]);
      expect(mockStartPlan.mock.calls[0][1]).toBe('intense');
    });
  });

  describe('active plan view', () => {
    const ACTIVE_PLAN = {
      id: 'blind75',
      name: 'Blind 75',
      description: 'Top 75',
      pace: 'normal' as const,
      startDate: '2026-01-01T00:00:00.000Z',
      completedIds: ['p1'],
      reminderTime: null,
      problemIds: ['p1', 'p2', 'p3'],
    };

    beforeEach(() => {
      mockHookState.activePlan = ACTIVE_PLAN;
    });

    it('shows plan name when active', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText('Blind 75')).toBeDefined();
    });

    it('shows progress percentage', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText(/30%/)).toBeDefined();
    });

    it('shows completed/total counts', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText(/3\/10/)).toBeDefined();
    });

    it('shows Stop button', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByTitle('Stop plan')).toBeDefined();
    });

    it('clicking Stop calls stopPlan', () => {
      render(<StudyPlanPanel />);
      fireEvent.click(screen.getByTitle('Stop plan'));
      expect(mockStopPlan).toHaveBeenCalledOnce();
    });

    it('renders today\'s problem from getTodayProblems', () => {
      render(<StudyPlanPanel />);
      expect(screen.getByText("Two Sum")).toBeDefined();
    });

    it('does not show template picker when active', () => {
      render(<StudyPlanPanel />);
      expect(screen.queryByText(/choose a study plan/i)).toBeNull();
    });
  });
});

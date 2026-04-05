import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';
import type { MistakeEntryFull, PatternName, ProblemStatus, SidebarPanel, StatsData } from '../../../types';

// ── Mock lucide-react icons ──

vi.mock('lucide-react', () => ({
  Home: (props: Record<string, unknown>) => <div data-testid="icon-home" {...props} />,
  Brain: (props: Record<string, unknown>) => <div data-testid="icon-brain" {...props} />,
  Play: (props: Record<string, unknown>) => <div data-testid="icon-play" {...props} />,
  List: (props: Record<string, unknown>) => <div data-testid="icon-list" {...props} />,
  AlertTriangle: (props: Record<string, unknown>) => <div data-testid="icon-alert" {...props} />,
  BarChart3: (props: Record<string, unknown>) => <div data-testid="icon-chart" {...props} />,
  MessageSquare: (props: Record<string, unknown>) => <div data-testid="icon-message" {...props} />,
  Trophy: (props: Record<string, unknown>) => <div data-testid="icon-trophy" {...props} />,
  History: (props: Record<string, unknown>) => <div data-testid="icon-history" {...props} />,
  Settings: (props: Record<string, unknown>) => <div data-testid="icon-settings" {...props} />,
  X: (props: Record<string, unknown>) => <div data-testid="icon-x" {...props} />,
}));

// ── Mock child panels ──

vi.mock('../../panels/ProblemList', () => ({
  default: () => <div data-testid="problem-list">ProblemList</div>,
}));

vi.mock('../../panels/MistakesPanel', () => ({
  default: () => <div data-testid="mistakes-panel">MistakesPanel</div>,
}));

vi.mock('../../panels/StatsPanel', () => ({
  default: () => <div data-testid="stats-panel">StatsPanel</div>,
}));

vi.mock('../../panels/AchievementsPanel', () => ({
  default: () => <div data-testid="achievements-panel">AchievementsPanel</div>,
}));

vi.mock('../../panels/BehavioralPanel', () => ({
  default: () => <div data-testid="behavioral-panel">BehavioralPanel</div>,
}));

vi.mock('../../panels/SettingsPanel', () => ({
  default: () => <div data-testid="settings-panel">SettingsPanel</div>,
}));

vi.mock('../../panels/DashboardPanel', () => ({
  default: () => <div data-testid="dashboard-panel">DashboardPanel</div>,
}));

vi.mock('../../panels/PatternQuizPanel', () => ({
  default: () => <div data-testid="quiz-panel">PatternQuizPanel</div>,
}));

vi.mock('../../panels/SessionHistoryPanel', () => ({
  default: () => <div data-testid="history-panel">SessionHistoryPanel</div>,
}));

// ── Helpers ──

const emptyStats: StatsData = {
  sessions: [],
  reviews: [],
  totalSolved: 0,
  totalAttempted: 0,
  averageScore: 0,
  streakDays: 0,
  lastActiveDate: null,
  activityDates: [],
  patternStats: {},
};

const defaultProps = {
  activePanel: null as SidebarPanel,
  onPanelChange: vi.fn(),
  onLaunchInterview: vi.fn(),
  onSelectProblem: vi.fn(),
  currentProblemId: null,
  mistakes: [] as MistakeEntryFull[],
  dueForReview: [] as MistakeEntryFull[],
  onReviewMistake: vi.fn(),
  onRemoveMistake: vi.fn(),
  onAddMistake: vi.fn(),
  stats: emptyStats,
  getProblemStatus: (() => 'unseen') as (id: string) => ProblemStatus,
};

function renderSidebar(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  // Reset all mocks before each render
  Object.values(props).forEach((v) => {
    if (typeof v === 'function' && 'mockClear' in v) (v as ReturnType<typeof vi.fn>).mockClear();
  });
  return render(<Sidebar {...props} />);
}

// ── Tests ──

describe('Sidebar', () => {
  // ── Navigation icons ──

  describe('navigation icons', () => {
    it('renders all 9 nav icons plus settings', () => {
      renderSidebar();
      expect(screen.getByLabelText('Home')).toBeDefined();
      expect(screen.getByLabelText('Interview')).toBeDefined();
      expect(screen.getByLabelText('Problems')).toBeDefined();
      expect(screen.getByLabelText('Pattern Quiz')).toBeDefined();
      expect(screen.getByLabelText('Behavioral')).toBeDefined();
      expect(screen.getByLabelText('Mistakes')).toBeDefined();
      expect(screen.getByLabelText('Stats')).toBeDefined();
      expect(screen.getByLabelText('Achievements')).toBeDefined();
      expect(screen.getByLabelText('History')).toBeDefined();
      expect(screen.getByLabelText('Settings')).toBeDefined();
    });

    it('marks the active panel icon as active', () => {
      renderSidebar({ activePanel: 'problems' });
      const btn = screen.getByLabelText('Problems');
      expect(btn.className).toContain('sidebar-nav-item-active');
    });

    it('does not mark inactive icons as active', () => {
      renderSidebar({ activePanel: 'problems' });
      const btn = screen.getByLabelText('Mistakes');
      expect(btn.className).not.toContain('sidebar-nav-item-active');
    });
  });

  // ── Interview button ──

  describe('interview button', () => {
    it('calls onLaunchInterview when interview icon is clicked', () => {
      const onLaunchInterview = vi.fn();
      renderSidebar({ onLaunchInterview });
      fireEvent.click(screen.getByLabelText('Interview'));
      expect(onLaunchInterview).toHaveBeenCalledOnce();
    });

    it('does NOT call onPanelChange for interview click', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange });
      fireEvent.click(screen.getByLabelText('Interview'));
      expect(onPanelChange).not.toHaveBeenCalled();
    });
  });

  // ── Panel toggling ──

  describe('panel toggling', () => {
    it('opens a panel when its icon is clicked and no panel is active', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange, activePanel: null });
      fireEvent.click(screen.getByLabelText('Problems'));
      expect(onPanelChange).toHaveBeenCalledWith('problems');
    });

    it('closes an active panel when its icon is clicked again (toggle off)', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange, activePanel: 'problems' });
      fireEvent.click(screen.getByLabelText('Problems'));
      expect(onPanelChange).toHaveBeenCalledWith(null);
    });

    it('switches panel when a different icon is clicked', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange, activePanel: 'problems' });
      fireEvent.click(screen.getByLabelText('Stats'));
      expect(onPanelChange).toHaveBeenCalledWith('stats');
    });

    it('toggles settings panel', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange, activePanel: null });
      fireEvent.click(screen.getByLabelText('Settings'));
      expect(onPanelChange).toHaveBeenCalledWith('settings');
    });
  });

  // ── Panel content rendering ──

  describe('panel content', () => {
    it('does not render panel content when no panel is active', () => {
      renderSidebar({ activePanel: null });
      expect(screen.queryByTestId('problem-list')).toBeNull();
      expect(screen.queryByTestId('mistakes-panel')).toBeNull();
    });

    it('renders ProblemList when problems panel is active', () => {
      renderSidebar({ activePanel: 'problems' });
      expect(screen.getByTestId('problem-list')).toBeDefined();
    });

    it('renders MistakesPanel when mistakes panel is active', () => {
      renderSidebar({ activePanel: 'mistakes' });
      expect(screen.getByTestId('mistakes-panel')).toBeDefined();
    });

    it('renders StatsPanel when stats panel is active', () => {
      renderSidebar({ activePanel: 'stats' });
      expect(screen.getByTestId('stats-panel')).toBeDefined();
    });

    it('renders BehavioralPanel when behavioral panel is active', () => {
      renderSidebar({ activePanel: 'behavioral' });
      expect(screen.getByTestId('behavioral-panel')).toBeDefined();
    });

    it('renders AchievementsPanel when achievements panel is active', () => {
      renderSidebar({
        activePanel: 'achievements',
        achievements: [],
        unlockedCount: 0,
        totalCount: 17,
      });
      expect(screen.getByTestId('achievements-panel')).toBeDefined();
    });

    it('renders SettingsPanel when settings panel is active', () => {
      renderSidebar({ activePanel: 'settings' });
      expect(screen.getByTestId('settings-panel')).toBeDefined();
    });

    it('renders SessionHistoryPanel when history panel is active', () => {
      renderSidebar({ activePanel: 'history' });
      expect(screen.getByTestId('history-panel')).toBeDefined();
    });

    it('does not render panel for interview (interview opens launcher modal)', () => {
      renderSidebar({ activePanel: 'interview' });
      expect(screen.queryByTestId('problem-list')).toBeNull();
      expect(screen.queryByTestId('mistakes-panel')).toBeNull();
    });
  });

  // ── Panel header ──

  describe('panel header', () => {
    it('shows panel title when a panel is open', () => {
      renderSidebar({ activePanel: 'problems' });
      expect(screen.getByText('Problems')).toBeDefined();
    });

    it('shows "Mistake Tracker" for mistakes panel', () => {
      renderSidebar({ activePanel: 'mistakes' });
      expect(screen.getByText('Mistake Tracker')).toBeDefined();
    });

    it('shows "Statistics" for stats panel', () => {
      renderSidebar({ activePanel: 'stats' });
      expect(screen.getByText('Statistics')).toBeDefined();
    });

    it('shows "Behavioral Interview" for behavioral panel', () => {
      renderSidebar({ activePanel: 'behavioral' });
      expect(screen.getByText('Behavioral Interview')).toBeDefined();
    });

    it('shows "Session History" for history panel', () => {
      renderSidebar({ activePanel: 'history' });
      expect(screen.getByText('Session History')).toBeDefined();
    });

    it('close button calls onPanelChange(null)', () => {
      const onPanelChange = vi.fn();
      renderSidebar({ onPanelChange, activePanel: 'problems' });
      fireEvent.click(screen.getByLabelText('Close panel'));
      expect(onPanelChange).toHaveBeenCalledWith(null);
    });
  });

  // ── Due-for-review badge ──

  describe('due-for-review badge', () => {
    const makeMistake = (id: string): MistakeEntryFull => ({
      id,
      pattern: 'HashMap' as PatternName,
      problemId: 'two-sum',
      problemTitle: 'Two Sum',
      description: 'Forgot to check',
      createdAt: '2026-01-01',
      nextReview: '2026-01-01',
      streak: 0,
      easeFactor: 2.5,
      interval: 1,
    });

    it('does not show badge dot when no mistakes are due', () => {
      const { container } = renderSidebar({ dueForReview: [] });
      // The badge dot has a specific inline style with neon-red background
      const dots = container.querySelectorAll('[style*="neon-red"]');
      expect(dots.length).toBe(0);
    });

    it('shows badge dot on mistakes icon when reviews are due', () => {
      const { container } = renderSidebar({
        dueForReview: [makeMistake('m1'), makeMistake('m2')],
      });
      const dots = container.querySelectorAll('[style*="neon-red"]');
      expect(dots.length).toBe(1);
    });
  });

  // ── Settings icon location ──

  describe('settings icon', () => {
    it('renders settings in sidebar footer', () => {
      const { container } = renderSidebar();
      const footer = container.querySelector('.sidebar-footer');
      expect(footer).not.toBeNull();
      const settingsBtn = footer!.querySelector('[aria-label="Settings"]');
      expect(settingsBtn).not.toBeNull();
    });

    it('marks settings as active when settings panel is open', () => {
      renderSidebar({ activePanel: 'settings' });
      const btn = screen.getByLabelText('Settings');
      expect(btn.className).toContain('sidebar-nav-item-active');
    });
  });

  // ── Accessibility ──

  describe('accessibility', () => {
    it('all nav buttons have type="button"', () => {
      renderSidebar();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn.getAttribute('type')).toBe('button');
      });
    });

    it('all nav buttons have aria-label', () => {
      renderSidebar();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('close button has aria-label "Close panel"', () => {
      renderSidebar({ activePanel: 'problems' });
      expect(screen.getByLabelText('Close panel')).toBeDefined();
    });
  });
});

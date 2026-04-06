import {
  Home,
  Play,
  List,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Trophy,
  Brain,
  History,
  CalendarDays,
  Settings,
  X,
} from 'lucide-react';
import type { Achievement, MistakeEntryFull, PatternName, ProblemStatus, SessionRecord, SidebarPanel, StatsData } from '../../types';
import Tooltip from '../ui/Tooltip';
import DashboardPanel from '../panels/DashboardPanel';
import PatternQuizPanel from '../panels/PatternQuizPanel';
import ProblemList from '../panels/ProblemList';
import type { RecommendedProblemEntry } from '../panels/ProblemList';
import MistakesPanel from '../panels/MistakesPanel';
import StatsPanel from '../panels/StatsPanel';
import AchievementsPanel from '../panels/AchievementsPanel';
import BehavioralPanel from '../panels/BehavioralPanel';
import SettingsPanel from '../panels/SettingsPanel';
import SessionHistoryPanel from '../panels/SessionHistoryPanel';
import StudyPlanPanel from '../panels/StudyPlanPanel';
import type { BehavioralQuestion } from '../../data/behavioral';

interface SidebarProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
  onLaunchInterview: () => void;
  onSelectProblem: (id: string) => void;
  currentProblemId: string | null;
  // Mistake tracker props
  mistakes: MistakeEntryFull[];
  dueForReview: MistakeEntryFull[];
  onReviewMistake: (id: string, quality: number) => void;
  onRemoveMistake: (id: string) => void;
  onAddMistake: (params: {
    pattern: PatternName;
    problemId: string | null;
    problemTitle: string;
    description: string;
  }) => void;
  // Stats props
  stats: StatsData;
  getProblemStatus: (id: string) => ProblemStatus;
  // Recommendation props
  recommendations?: RecommendedProblemEntry[];
  dailyChallenge?: RecommendedProblemEntry | null;
  // Behavioral props
  onStartBehavioral?: (question: BehavioralQuestion) => void;
  // Achievement props
  achievements?: Achievement[];
  unlockedCount?: number;
  totalCount?: number;
  // Badge props
  getProblemProgress?: (id: string) => { bestScore: number | null; bestTime: number | null; hintsUsed: number; attempts: number } | null;
  // History props
  sessions?: SessionRecord[];
  onResumeSession?: (problemId: string) => void;
}

const icons = [
  { id: 'dashboard' as const, icon: Home, label: 'Home', mobileVisible: true },
  { id: 'interview' as const, icon: Play, label: 'Interview', mobileVisible: true },
  { id: 'problems' as const, icon: List, label: 'Problems', mobileVisible: true },
  { id: 'quiz' as const, icon: Brain, label: 'Pattern Quiz', mobileVisible: false },
  { id: 'behavioral' as const, icon: MessageSquare, label: 'Behavioral', mobileVisible: true },
  { id: 'mistakes' as const, icon: AlertTriangle, label: 'Mistakes', mobileVisible: true },
  { id: 'stats' as const, icon: BarChart3, label: 'Stats', mobileVisible: false },
  { id: 'achievements' as const, icon: Trophy, label: 'Achievements', mobileVisible: false },
  { id: 'history' as const, icon: History, label: 'History', mobileVisible: false },
  { id: 'study' as const, icon: CalendarDays, label: 'Study Plan', mobileVisible: false },
];

const panelTitles: Record<string, string> = {
  dashboard: 'Home',
  problems: 'Problems',
  quiz: 'Pattern Quiz',
  behavioral: 'Behavioral Interview',
  mistakes: 'Mistake Tracker',
  stats: 'Statistics',
  achievements: 'Achievements',
  history: 'Session History',
  study: 'Study Plan',
  settings: 'Settings',
};

export default function Sidebar({
  activePanel,
  onPanelChange,
  onLaunchInterview,
  onSelectProblem,
  currentProblemId,
  mistakes,
  dueForReview,
  onReviewMistake,
  onRemoveMistake,
  onAddMistake,
  stats,
  getProblemStatus,
  recommendations,
  dailyChallenge,
  onStartBehavioral,
  achievements,
  unlockedCount,
  totalCount,
  getProblemProgress,
  sessions = [],
  onResumeSession,
}: SidebarProps) {
  function handleIconClick(id: SidebarPanel) {
    if (id === 'interview') {
      onLaunchInterview();
      return;
    }
    onPanelChange(activePanel === id ? null : id);
  }

  // Show badge count for due reviews
  const dueCount = dueForReview.length;

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-nav">
          {icons.map(({ id, icon: Icon, label, mobileVisible }) => (
            <Tooltip key={id} content={label} position="right">
              <button
                type="button"
                className={`sidebar-nav-item ${activePanel === id ? 'sidebar-nav-item-active' : ''}${!mobileVisible ? ' sidebar-nav-item--mobile-hidden' : ''}`}
                onClick={() => handleIconClick(id)}
                aria-label={label}
                style={{ position: 'relative' }}
              >
                <Icon size={18} aria-hidden="true" />
                {id === 'mistakes' && dueCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--neon-red)',
                    border: '2px solid var(--bg-surface)',
                  }} />
                )}
              </button>
            </Tooltip>
          ))}
        </div>
        <div className="sidebar-footer">
          <Tooltip content="Settings" position="right">
            <button
              type="button"
              className={`sidebar-nav-item ${activePanel === 'settings' ? 'sidebar-nav-item-active' : ''}`}
              aria-label="Settings"
              onClick={() => handleIconClick('settings')}
            >
              <Settings size={18} aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </aside>

      {activePanel && activePanel !== 'interview' && (
        <div className="sidebar-panel">
          <div className="sidebar-panel-header">
            <span className="sidebar-panel-title">{panelTitles[activePanel]}</span>
            <button type="button" className="sidebar-panel-close" aria-label="Close panel" onClick={() => onPanelChange(null)}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="sidebar-panel-content">
            {activePanel === 'dashboard' && (
              <DashboardPanel
                stats={stats}
                dailyChallenge={dailyChallenge}
                onSelectProblem={onSelectProblem}
              />
            )}
            {activePanel === 'quiz' && (
              <PatternQuizPanel onSelectProblem={onSelectProblem} />
            )}
            {activePanel === 'problems' && (
              <ProblemList
                onSelect={onSelectProblem}
                currentId={currentProblemId}
                getProblemStatus={getProblemStatus}
                recommendations={recommendations}
                dailyChallenge={dailyChallenge}
                getProblemProgress={getProblemProgress}
              />
            )}
            {activePanel === 'mistakes' && (
              <MistakesPanel
                mistakes={mistakes}
                dueForReview={dueForReview}
                onReview={onReviewMistake}
                onRemove={onRemoveMistake}
                onAdd={onAddMistake}
              />
            )}
            {activePanel === 'behavioral' && (
              <BehavioralPanel
                onStartQuestion={onStartBehavioral ?? (() => {})}
              />
            )}
            {activePanel === 'stats' && <StatsPanel stats={stats} getProblemProgress={getProblemProgress} getProblemStatus={getProblemStatus} />}
            {activePanel === 'achievements' && achievements && (
              <AchievementsPanel
                achievements={achievements}
                unlockedCount={unlockedCount ?? 0}
                totalCount={totalCount ?? 0}
                stats={stats}
              />
            )}
            {activePanel === 'history' && (
              <SessionHistoryPanel sessions={sessions} onResumeSession={onResumeSession} />
            )}
            {activePanel === 'study' && (
              <StudyPlanPanel onSelectProblem={onSelectProblem} />
            )}
            {activePanel === 'settings' && <SettingsPanel />}
          </div>
        </div>
      )}
    </>
  );
}

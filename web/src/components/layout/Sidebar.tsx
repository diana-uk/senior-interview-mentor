import {
  Play,
  List,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Trophy,
  Settings,
  X,
} from 'lucide-react';
import type { Achievement, MistakeEntryFull, PatternName, ProblemStatus, SidebarPanel, StatsData } from '../../types';
import Tooltip from '../ui/Tooltip';
import ProblemList from '../panels/ProblemList';
import type { RecommendedProblemEntry } from '../panels/ProblemList';
import MistakesPanel from '../panels/MistakesPanel';
import StatsPanel from '../panels/StatsPanel';
import AchievementsPanel from '../panels/AchievementsPanel';
import BehavioralPanel from '../panels/BehavioralPanel';
import SettingsPanel from '../panels/SettingsPanel';
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
}

const icons = [
  { id: 'interview' as const, icon: Play, label: 'Interview' },
  { id: 'problems' as const, icon: List, label: 'Problems' },
  { id: 'behavioral' as const, icon: MessageSquare, label: 'Behavioral' },
  { id: 'mistakes' as const, icon: AlertTriangle, label: 'Mistakes' },
  { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
  { id: 'achievements' as const, icon: Trophy, label: 'Achievements' },
];

const panelTitles: Record<string, string> = {
  problems: 'Problems',
  behavioral: 'Behavioral Interview',
  mistakes: 'Mistake Tracker',
  stats: 'Statistics',
  achievements: 'Achievements',
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
          {icons.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id} content={label} position="right">
              <button
                type="button"
                className={`sidebar-nav-item ${activePanel === id ? 'sidebar-nav-item-active' : ''}`}
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
            {activePanel === 'settings' && <SettingsPanel />}
          </div>
        </div>
      )}
    </>
  );
}

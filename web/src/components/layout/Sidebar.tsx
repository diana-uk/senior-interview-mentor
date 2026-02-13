import {
  Play,
  List,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Settings,
  X,
} from 'lucide-react';
import type { MistakeEntryFull, PatternName, ProblemStatus, SidebarPanel, StatsData } from '../../types';
import ProblemList from '../panels/ProblemList';
import type { RecommendedProblemEntry } from '../panels/ProblemList';
import MistakesPanel from '../panels/MistakesPanel';
import StatsPanel from '../panels/StatsPanel';
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
  // Behavioral props
  onStartBehavioral?: (question: BehavioralQuestion) => void;
}

const icons = [
  { id: 'interview' as const, icon: Play, label: 'Interview' },
  { id: 'problems' as const, icon: List, label: 'Problems' },
  { id: 'behavioral' as const, icon: MessageSquare, label: 'Behavioral' },
  { id: 'mistakes' as const, icon: AlertTriangle, label: 'Mistakes' },
  { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
];

const panelTitles: Record<string, string> = {
  problems: 'Problems',
  behavioral: 'Behavioral Interview',
  mistakes: 'Mistake Tracker',
  stats: 'Statistics',
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
  onStartBehavioral,
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
          {icons.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activePanel === id ? 'sidebar-nav-item-active' : ''}`}
              onClick={() => handleIconClick(id)}
              title={id}
              style={{ position: 'relative' }}
            >
              <Icon size={18} />
              {id === 'mistakes' && dueCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--neon-red)',
                  border: '2px solid var(--bg-surface)',
                }} />
              )}
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <button
            className={`sidebar-nav-item ${activePanel === 'settings' ? 'sidebar-nav-item-active' : ''}`}
            title="Settings"
            onClick={() => handleIconClick('settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {activePanel && activePanel !== 'interview' && (
        <div className="sidebar-panel">
          <div className="sidebar-panel-header">
            <span className="sidebar-panel-title">{panelTitles[activePanel]}</span>
            <button className="sidebar-panel-close" onClick={() => onPanelChange(null)}>
              <X size={16} />
            </button>
          </div>
          <div className="sidebar-panel-content">
            {activePanel === 'problems' && (
              <ProblemList
                onSelect={onSelectProblem}
                currentId={currentProblemId}
                getProblemStatus={getProblemStatus}
                recommendations={recommendations}
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
            {activePanel === 'stats' && <StatsPanel stats={stats} />}
            {activePanel === 'settings' && <SettingsPanel />}
          </div>
        </div>
      )}
    </>
  );
}

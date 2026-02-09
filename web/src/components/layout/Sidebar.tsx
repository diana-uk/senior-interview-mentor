import {
  Play,
  List,
  AlertTriangle,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import type { SidebarPanel } from '../../types';
import ProblemList from '../panels/ProblemList';
import MistakesPanel from '../panels/MistakesPanel';
import StatsPanel from '../panels/StatsPanel';

interface SidebarProps {
  activePanel: SidebarPanel;
  onPanelChange: (panel: SidebarPanel) => void;
  onLaunchInterview: () => void;
  onSelectProblem: (id: string) => void;
  currentProblemId: string | null;
}

const icons = [
  { id: 'interview' as const, icon: Play, label: 'Interview' },
  { id: 'problems' as const, icon: List, label: 'Problems' },
  { id: 'mistakes' as const, icon: AlertTriangle, label: 'Mistakes' },
  { id: 'stats' as const, icon: BarChart3, label: 'Stats' },
];

const panelTitles: Record<string, string> = {
  problems: 'Problems',
  mistakes: 'Mistake Tracker',
  stats: 'Statistics',
};

export default function Sidebar({
  activePanel,
  onPanelChange,
  onLaunchInterview,
  onSelectProblem,
  currentProblemId,
}: SidebarProps) {
  function handleIconClick(id: SidebarPanel) {
    if (id === 'interview') {
      onLaunchInterview();
      return;
    }
    onPanelChange(activePanel === id ? null : id);
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar__icons">
          {icons.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar__icon ${activePanel === id ? 'sidebar__icon--active' : ''}`}
              onClick={() => handleIconClick(id)}
              title={id}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
        <div className="sidebar__bottom">
          <button className="sidebar__icon" title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {activePanel && activePanel !== 'interview' && (
        <div className="sidebar-panel">
          <div className="sidebar-panel__header">
            <span>{panelTitles[activePanel]}</span>
            <button className="sidebar-panel__close" onClick={() => onPanelChange(null)}>
              <X size={16} />
            </button>
          </div>
          <div className="sidebar-panel__content">
            {activePanel === 'problems' && (
              <ProblemList onSelect={onSelectProblem} currentId={currentProblemId} />
            )}
            {activePanel === 'mistakes' && <MistakesPanel />}
            {activePanel === 'stats' && <StatsPanel />}
          </div>
        </div>
      )}
    </>
  );
}

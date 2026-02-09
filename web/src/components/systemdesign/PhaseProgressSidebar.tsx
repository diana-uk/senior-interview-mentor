import { Check, Lock, Circle, ChevronRight } from 'lucide-react';
import type { SystemDesignPhase, PhaseStatus } from '../../types';

const PHASE_META: Record<SystemDesignPhase, { label: string; shortLabel: string; icon: string }> = {
  overview: { label: 'Plan Overview', shortLabel: 'Overview', icon: 'map' },
  requirements: { label: 'Requirements', shortLabel: 'Reqs', icon: 'checklist' },
  api: { label: 'API Design', shortLabel: 'API', icon: 'api' },
  data: { label: 'Data Model', shortLabel: 'Data', icon: 'database' },
  architecture: { label: 'Architecture', shortLabel: 'Arch', icon: 'account_tree' },
  deepdive: { label: 'Deep Dives', shortLabel: 'Deep', icon: 'search' },
  scaling: { label: 'Scaling', shortLabel: 'Scale', icon: 'trending_up' },
};

interface PhaseProgressSidebarProps {
  currentPhase: SystemDesignPhase;
  phaseStatuses: Record<SystemDesignPhase, PhaseStatus>;
  phaseOrder: SystemDesignPhase[];
  onPhaseClick: (phase: SystemDesignPhase) => void;
  timerSeconds: number;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function PhaseProgressSidebar({
  currentPhase,
  phaseStatuses,
  phaseOrder,
  onPhaseClick,
  timerSeconds,
}: PhaseProgressSidebarProps) {
  const completedCount = phaseOrder.filter((p) => phaseStatuses[p] === 'completed').length;
  const totalPhases = phaseOrder.length - 1; // exclude overview

  return (
    <div className="phase-sidebar">
      <div className="phase-sidebar__timer">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>timer</span>
        <span className="phase-sidebar__timer-value">{formatTime(timerSeconds)}</span>
      </div>

      <div className="phase-sidebar__progress">
        <span className="phase-sidebar__progress-label">{completedCount}/{totalPhases} completed</span>
        <div className="phase-sidebar__progress-track">
          <div
            className="phase-sidebar__progress-fill"
            style={{ width: `${(completedCount / totalPhases) * 100}%` }}
          />
        </div>
      </div>

      <div className="phase-sidebar__steps">
        {phaseOrder.filter((p) => p !== 'overview').map((phase, idx) => {
          const status = phaseStatuses[phase];
          const meta = PHASE_META[phase];
          const isActive = phase === currentPhase;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';

          return (
            <button
              key={phase}
              className={`phase-sidebar__step ${isActive ? 'phase-sidebar__step--active' : ''} ${isCompleted ? 'phase-sidebar__step--completed' : ''} ${isLocked ? 'phase-sidebar__step--locked' : ''}`}
              onClick={() => !isLocked && onPhaseClick(phase)}
              disabled={isLocked}
            >
              <span className="phase-sidebar__step-indicator">
                {isCompleted ? (
                  <Check size={14} />
                ) : isLocked ? (
                  <Lock size={12} />
                ) : isActive ? (
                  <ChevronRight size={14} />
                ) : (
                  <Circle size={10} />
                )}
              </span>
              <span className="phase-sidebar__step-number">{idx + 1}</span>
              <span className="phase-sidebar__step-label">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

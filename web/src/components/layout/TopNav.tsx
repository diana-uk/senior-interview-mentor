import { BookOpen, ClipboardCheck, Lightbulb, Mic, Timer } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import ProfileDropdown from '../auth/ProfileDropdown';
import type { Difficulty, Mode, Problem } from '../../types';
import type { PlanId } from '../../config/tiers';
import { formatTime, getTimerClass, getDifficultyClass } from '../../utils/timerUtils';

const MODE_CONFIG: { mode: Mode; label: string; icon: typeof BookOpen }[] = [
  { mode: 'TEACHER', label: 'Teacher', icon: BookOpen },
  { mode: 'INTERVIEWER', label: 'Interviewer', icon: Mic },
  { mode: 'REVIEWER', label: 'Reviewer', icon: ClipboardCheck },
];

interface TopNavProps {
  mode: Mode;
  problem: Problem | null;
  timerSeconds: number;
  timerRunning: boolean;
  hintsUsed: number;
  progressPercent: number;
  user?: User | null;
  onSignOut?: () => Promise<void>;
  onSync?: () => void;
  syncing?: boolean;
  plan?: PlanId;
  onManageSubscription?: () => void;
  onModeChange?: (mode: Mode) => void;
}

export default function TopNav({ mode, problem, timerSeconds, timerRunning, hintsUsed, progressPercent, user, onSignOut, onSync, syncing, plan, onManageSubscription, onModeChange }: TopNavProps) {
  const circumference = 2 * Math.PI * 10;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <div className="topnav-brand">
          <div className="topnav-logo">S</div>
          <span className="topnav-title">Senior Interview Mentor</span>
        </div>

        <div className="topnav-breadcrumb">
          {problem ? (
            <>
              <span className="topnav-breadcrumb-item">{problem.title}</span>
              <span className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</span>
            </>
          ) : (
            <span className="topnav-breadcrumb-item">Select a problem to begin</span>
          )}
        </div>
      </div>

      <div className="topnav-center">
        <div className="mode-switcher" role="radiogroup" aria-label="Coaching mode">
          {MODE_CONFIG.map(({ mode: m, label, icon: Icon }) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={`mode-switcher-btn mode-${m.toLowerCase()}${mode === m ? ' active' : ''}`}
              onClick={() => onModeChange?.(m)}
            >
              <Icon size={12} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="topnav-right">
        {(mode === 'INTERVIEWER' || timerRunning) && (
          <div className="interview-timer">
            <Timer size={14} className="interview-timer-icon" />
            <span className={`interview-timer-value ${getTimerClass(timerSeconds, timerRunning)}`}>
              {formatTime(timerSeconds)}
            </span>
          </div>
        )}

        <div className="hints-badge">
          <Lightbulb size={14} className="hints-badge-icon" />
          <span className="hints-badge-count">{hintsUsed}/3</span>
          <span className="hints-badge-label">hints</span>
        </div>

        <div className="progress-ring">
          <svg viewBox="0 0 28 28" width="28" height="28">
            <circle className="progress-ring-bg" cx="14" cy="14" r="10" />
            <circle
              className="progress-ring-fill"
              cx="14"
              cy="14"
              r="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
        </div>

        {plan && plan !== 'free' && (
          <span className={`badge badge-plan badge-plan--${plan}`}>
            {plan === 'premium' ? 'Premium' : 'Pro'}
          </span>
        )}

        {user && onSignOut && onSync && (
          <ProfileDropdown
            user={user}
            onSignOut={onSignOut}
            onSync={onSync}
            syncing={syncing ?? false}
            plan={plan}
            onManageSubscription={onManageSubscription}
          />
        )}
      </div>
    </nav>
  );
}

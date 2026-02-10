import { Clock, Lightbulb, Timer } from 'lucide-react';
import type { Difficulty, Mode, Problem } from '../../types';

interface TopNavProps {
  mode: Mode;
  problem: Problem | null;
  timerSeconds: number;
  timerRunning: boolean;
  hintsUsed: number;
  progressPercent: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getTimerClass(seconds: number, running: boolean): string {
  if (!running) return '';
  if (seconds > 600) return 'interview-timer-safe';
  if (seconds > 120) return 'interview-timer-warning';
  return 'interview-timer-danger';
}

function getDifficultyClass(d: Difficulty): string {
  return `badge badge-${d.toLowerCase()}`;
}

function getModeClass(mode: Mode): string {
  const m = mode.toLowerCase();
  return `badge badge-pulse badge-${m}`;
}

export default function TopNav({ mode, problem, timerSeconds, timerRunning, hintsUsed, progressPercent }: TopNavProps) {
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
        <span className={getModeClass(mode)}>
          {mode}
        </span>
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
      </div>
    </nav>
  );
}

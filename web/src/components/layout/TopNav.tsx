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
  if (seconds > 1800) return 'topnav__timer--green';
  if (seconds > 600) return 'topnav__timer--orange';
  return 'topnav__timer--red';
}

function getDifficultyClass(d: Difficulty): string {
  return `difficulty-badge difficulty-badge--${d.toLowerCase()}`;
}

export default function TopNav({ mode, problem, timerSeconds, timerRunning, hintsUsed, progressPercent }: TopNavProps) {
  const circumference = 2 * Math.PI * 10;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <nav className="topnav">
      <div className="topnav__brand">Senior Interview Mentor</div>

      <div className="topnav__breadcrumb">
        {problem ? (
          <>
            <span>{problem.title}</span>
            <span className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</span>
          </>
        ) : (
          <span>Select a problem to begin</span>
        )}
      </div>

      <div className="topnav__controls">
        {(mode === 'INTERVIEWER' || timerRunning) && (
          <div className={`topnav__timer ${getTimerClass(timerSeconds, timerRunning)}`}>
            <Timer size={12} style={{ marginRight: 4, display: 'inline' }} />
            {formatTime(timerSeconds)}
          </div>
        )}

        <div className="topnav__control-item">
          <Lightbulb size={14} />
          <span>{hintsUsed}/3</span>
        </div>

        <svg className="progress-ring" viewBox="0 0 28 28">
          <circle className="progress-ring__circle-bg" cx="14" cy="14" r="10" />
          <circle
            className="progress-ring__circle"
            cx="14"
            cy="14"
            r="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
    </nav>
  );
}

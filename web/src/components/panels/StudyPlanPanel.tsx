import { useState } from 'react';
import { Play, Square, CheckCircle, Circle, Bell, BellOff } from 'lucide-react';
import { STUDY_PLAN_TEMPLATES, PACE_CONFIG } from '../../data/studyPlans';
import type { Pace } from '../../data/studyPlans';
import { useStudyPlan } from '../../hooks/useStudyPlan';
import { problemsById } from '../../data/problems/index';
import { formatDate, difficultyColor } from '../../utils/displayUtils.js';

interface StudyPlanPanelProps {
  onSelectProblem?: (id: string) => void;
}

const PACE_OPTIONS: Pace[] = ['relaxed', 'normal', 'intense'];

export default function StudyPlanPanel({ onSelectProblem }: StudyPlanPanelProps) {
  const { activePlan, startPlan, stopPlan, markComplete, setReminderTime, getTodayProblems, getProgress } = useStudyPlan();
  const [selectedPace, setSelectedPace] = useState<Pace>('normal');

  if (activePlan) {
    const progress = getProgress();
    const todayProblems = getTodayProblems();

    return (
      <div>
        {/* Plan header */}
        <div className="card" style={{ padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)' }}>{activePlan.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {PACE_CONFIG[activePlan.pace].description} · started {formatDate(activePlan.startDate)}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={stopPlan}
              title="Stop plan"
              style={{ padding: '3px 6px', color: 'var(--text-muted)' }}
            >
              <Square size={12} aria-hidden="true" />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Progress</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{progress.completed}/{progress.total} ({progress.pct}%)</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress.pct}%`,
                  background: 'var(--neon-cyan)',
                  borderRadius: 9999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Today's problems */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Up Next
        </div>

        {todayProblems.length === 0 ? (
          <div className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--neon-lime)', fontWeight: 600, marginBottom: 4 }}>All done!</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>You've completed all problems in this plan.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {todayProblems.map((id) => {
              const problem = problemsById[id];
              const done = activePlan.completedIds.includes(id);
              if (!problem) return null;
              return (
                <div
                  key={id}
                  className="card"
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <button
                    type="button"
                    onClick={() => markComplete(id)}
                    aria-label={done ? `Mark ${problem.title} incomplete` : `Mark ${problem.title} complete`}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: done ? 'var(--neon-lime)' : 'var(--text-muted)' }}
                  >
                    {done ? <CheckCircle size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: done ? 'var(--text-muted)' : 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none' }}>
                      {problem.title}
                    </div>
                    <div style={{ fontSize: 10, color: difficultyColor(problem.difficulty) }}>{problem.difficulty}</div>
                  </div>
                  {onSelectProblem && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onSelectProblem(id)}
                      style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0 }}
                    >
                      Go
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Daily reminder */}
        <ReminderSection reminderTime={activePlan.reminderTime} onSave={setReminderTime} />
      </div>
    );
  }

  // ── No active plan — show template picker ──
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Choose a study plan and a daily pace to get structured problem recommendations.
      </div>

      {/* Pace selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Daily Pace
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PACE_OPTIONS.map((p) => {
            const cfg = PACE_CONFIG[p];
            const active = selectedPace === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPace(p)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: 8,
                  border: `1px solid ${active ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                  background: active ? 'rgba(0,229,255,0.08)' : 'var(--bg-raised)',
                  color: active ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  textAlign: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{cfg.label}</div>
                <div style={{ fontSize: 9 }}>{cfg.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template cards */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Plans
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STUDY_PLAN_TEMPLATES.map((t) => (
          <div key={t.id} className="card" style={{ padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>{t.description}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {t.durationDays} days · {PACE_CONFIG[selectedPace].description}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => startPlan(t, selectedPace)}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                <Play size={11} aria-hidden="true" />
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReminderSection({ reminderTime, onSave }: { reminderTime: string | null; onSave: (t: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(reminderTime ?? '09:00');

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Daily Reminder
      </div>
      {!editing ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setEditing(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
        >
          {reminderTime ? <Bell size={12} aria-hidden="true" /> : <BellOff size={12} aria-hidden="true" />}
          {reminderTime ? `Reminder at ${reminderTime}` : 'Set reminder'}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="time"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px', flex: 1 }}
          />
          <button type="button" className="btn btn-primary btn-sm" onClick={() => { onSave(value); setEditing(false); }}>Save</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onSave(null); setEditing(false); }}>Off</button>
        </div>
      )}
    </div>
  );
}


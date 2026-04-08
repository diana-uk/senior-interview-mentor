import { useMemo } from 'react';
import { Zap, TrendingUp, Flame, BookOpen, Clock } from 'lucide-react';
import type { RecommendedProblemEntry } from './ProblemList';
import type { StatsData } from '../../types';
import { allProblemsList } from '../../data/problems';
import { formatDurationCompact } from '../../utils/formatters';
import { greeting, getWeakAreas, getWeeklyActivity } from '../../utils/dashboardUtils';

interface DashboardPanelProps {
  stats: StatsData;
  dailyChallenge?: RecommendedProblemEntry | null;
  onSelectProblem: (id: string) => void;
}

export default function DashboardPanel({ stats, dailyChallenge, onSelectProblem }: DashboardPanelProps) {
  const recentSessions = useMemo(() => stats.sessions.slice(-5).reverse(), [stats.sessions]);
  const weeklyActivity = useMemo(() => getWeeklyActivity(stats.sessions), [stats.sessions]);
  const weakAreas = useMemo(() => getWeakAreas(stats.patternStrengths), [stats.patternStrengths]);
  const maxActivity = useMemo(() => Math.max(1, ...weeklyActivity.map((d) => d.count)), [weeklyActivity]);

  function handleRandomProblem() {
    const unseen = allProblemsList.filter((p) => !(p.id in stats.problemProgress));
    const pool = unseen.length > 0 ? unseen : allProblemsList;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onSelectProblem(pick.id);
  }

  const lastSession = recentSessions[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Greeting + streak */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-raised), var(--bg-overlay))' }}>
        <div className="card-body">
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {greeting()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Flame size={16} color="var(--neon-amber)" aria-hidden="true" />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-bright)' }}>
              {stats.currentStreak}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              day streak
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {lastSession && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => lastSession.problemId && onSelectProblem(lastSession.problemId)}
                disabled={!lastSession.problemId}
                style={{ flex: 1, fontSize: 11 }}
              >
                Resume Last
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleRandomProblem}
              style={{ flex: 1, fontSize: 11 }}
            >
              Random Problem
            </button>
          </div>
        </div>
      </div>

      {/* Daily challenge */}
      {dailyChallenge && (
        <div
          className="card card-interactive"
          onClick={() => onSelectProblem(dailyChallenge.id)}
          style={{ borderColor: 'var(--neon-amber)' }}
        >
          <div className="card-header" style={{ marginBottom: 6, paddingBottom: 6 }}>
            <span className="card-title" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={12} color="var(--neon-amber)" aria-hidden="true" />
              Daily Challenge
            </span>
            <span className={`badge badge-${dailyChallenge.difficulty.toLowerCase()}`} style={{ fontSize: 9 }}>
              {dailyChallenge.difficulty}
            </span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
              {dailyChallenge.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {dailyChallenge.pattern}
            </div>
          </div>
        </div>
      )}

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingUp size={12} color="var(--neon-red)" aria-hidden="true" />
              Needs Work
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {weakAreas.map((area) => {
              const ratio = area.attempted > 0 ? area.solved / area.attempted : 0;
              return (
                <div key={area.pattern} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {area.pattern}
                  </span>
                  <div style={{ width: 60, height: 4, background: 'var(--bg-overlay)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${ratio * 100}%`,
                      background: ratio < 0.4 ? 'var(--neon-red)' : ratio < 0.7 ? 'var(--neon-amber)' : 'var(--neon-lime)',
                      borderRadius: 2,
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>
                    {area.solved}/{area.attempted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly activity */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>This Week</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {weeklyActivity.reduce((s, d) => s + d.count, 0)} sessions
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 36 }}>
            {weeklyActivity.map((d) => (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div
                  title={`${d.date}: ${d.count} session${d.count !== 1 ? 's' : ''}`}
                  style={{
                    width: '100%', borderRadius: 2,
                    height: d.count === 0 ? 4 : Math.max(4, (d.count / maxActivity) * 28),
                    background: d.count === 0 ? 'var(--bg-overlay)' : 'var(--neon-cyan)',
                    opacity: d.count === 0 ? 0.3 : Math.max(0.5, d.count / maxActivity),
                  }}
                />
                <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>
                  {new Date(d.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="card">
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={12} aria-hidden="true" />
              Recent Sessions
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className={s.problemId ? 'card card-interactive' : 'card'}
                onClick={() => s.problemId && onSelectProblem(s.problemId)}
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.problemTitle}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 1 }}>
                    <span>{s.mode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDurationCompact(s.duration)}</span>
                  </div>
                </div>
                {s.score !== null && (
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: s.score >= 3 ? 'var(--neon-lime)' : s.score >= 2 ? 'var(--neon-amber)' : 'var(--neon-red)',
                  }}>
                    {s.score.toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && weakAreas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
          <BookOpen size={24} style={{ display: 'block', margin: '0 auto 8px' }} aria-hidden="true" />
          Start your first session to see your progress here.
        </div>
      )}
    </div>
  );
}

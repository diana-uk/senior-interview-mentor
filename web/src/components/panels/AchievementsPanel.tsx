import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { Achievement, AchievementCategory, SessionRecord, StatsData } from '../../types';
import { exportProfileCard } from '../../utils/profileCard';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  stats: StatsData;
}

// ── Category labels ──

const categoryLabels: Record<AchievementCategory, string> = {
  milestones: 'Milestones',
  streaks: 'Streaks',
  patterns: 'Patterns',
  speed: 'Speed',
  mastery: 'Mastery',
};

const categoryOrder: AchievementCategory[] = ['milestones', 'streaks', 'patterns', 'speed', 'mastery'];

// ── Activity Heatmap (365 days, GitHub-style) ──

function ActivityHeatmap({ sessions }: { sessions: SessionRecord[] }) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { cells, months } = useMemo(() => {
    const dayCounts: Record<string, number> = {};
    for (const s of sessions) {
      dayCounts[s.date] = (dayCounts[s.date] || 0) + 1;
    }

    const now = new Date();
    const days = 364; // 52 weeks
    const cellList: { key: string; dayOfWeek: number; week: number; count: number; label: string }[] = [];
    const monthMarkers: { label: string; week: number }[] = [];
    let lastMonth = -1;

    for (let d = days; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const key = date.toISOString().split('T')[0];
      const count = dayCounts[key] || 0;
      const dayOfWeek = date.getDay();
      const weekIndex = Math.floor((days - d) / 7);

      cellList.push({
        key,
        dayOfWeek,
        week: weekIndex,
        count,
        label: `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} session${count !== 1 ? 's' : ''}`,
      });

      const month = date.getMonth();
      if (month !== lastMonth) {
        monthMarkers.push({
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          week: weekIndex,
        });
        lastMonth = month;
      }
    }

    return { cells: cellList, months: monthMarkers };
  }, [sessions]);

  const cellSize = 9;
  const cellGap = 2;
  const totalW = 52 * (cellSize + cellGap) + cellGap;
  const totalH = 7 * (cellSize + cellGap) + 18; // extra for month labels

  function getColor(count: number): string {
    if (count === 0) return 'rgba(255, 255, 255, 0.04)';
    if (count === 1) return 'rgba(0, 240, 255, 0.25)';
    if (count === 2) return 'rgba(0, 240, 255, 0.5)';
    return 'rgba(0, 240, 255, 0.8)';
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        width="100%"
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {months.map((m, i) => (
          <text
            key={i}
            x={m.week * (cellSize + cellGap)}
            y={10}
            fontSize="7"
            fill="#606078"
          >
            {m.label}
          </text>
        ))}

        {/* Day cells */}
        {cells.map((cell) => (
          <rect
            key={cell.key}
            x={cell.week * (cellSize + cellGap)}
            y={16 + cell.dayOfWeek * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={getColor(cell.count)}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              const rect = (e.target as SVGRectElement).getBoundingClientRect();
              const parent = (e.target as SVGRectElement).closest('div')!.getBoundingClientRect();
              setTooltip({
                text: cell.label,
                x: rect.left - parent.left + rect.width / 2,
                y: rect.top - parent.top - 6,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)', justifyContent: 'flex-end', marginTop: 4 }}>
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            style={{
              width: 9,
              height: 9,
              borderRadius: 2,
              background: getColor(level),
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Personal Records ──

function PersonalRecords({ stats }: { stats: StatsData }) {
  const records = useMemo(() => {
    // Most solves in a day
    const dayCounts: Record<string, number> = {};
    for (const s of stats.sessions) {
      if (s.score !== null) {
        dayCounts[s.date] = (dayCounts[s.date] || 0) + 1;
      }
    }
    const mostInDay = Math.max(0, ...Object.values(dayCounts));

    // Fastest solve (sessions with duration > 0 and score >= 3)
    const solvedSessions = stats.sessions.filter(s => s.duration > 0 && s.score !== null && s.score >= 3);
    const fastest = solvedSessions.length > 0
      ? Math.min(...solvedSessions.map(s => s.duration))
      : null;

    // Highest avg review score
    const highestReview = stats.reviews.length > 0
      ? Math.max(...stats.reviews.map(r => r.overallScore))
      : null;

    return { mostInDay, fastest, highestReview };
  }, [stats]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const items = [
    { label: 'Longest Streak', value: `${stats.longestStreak}d`, color: 'var(--neon-lime)' },
    { label: 'Most in a Day', value: String(records.mostInDay), color: 'var(--neon-cyan)' },
    { label: 'Fastest Solve', value: records.fastest ? formatTime(records.fastest) : '--', color: 'var(--neon-amber)' },
    { label: 'Best Review', value: records.highestReview ? records.highestReview.toFixed(1) : '--', color: 'var(--neon-purple)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
      {items.map(item => (
        <div key={item.label} className="card" style={{ textAlign: 'center', padding: '10px 8px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>
            {item.value}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Panel ──

export default function AchievementsPanel({ achievements, unlockedCount, totalCount, stats }: AchievementsPanelProps) {
  const grouped = useMemo(() => {
    const map: Partial<Record<AchievementCategory, Achievement[]>> = {};
    for (const a of achievements) {
      if (!map[a.category]) map[a.category] = [];
      map[a.category]!.push(a);
    }
    return map;
  }, [achievements]);

  return (
    <div>
      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>
            {unlockedCount} / {totalCount} Unlocked
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${(unlockedCount / totalCount) * 100}%`,
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-lime))',
            }}
          />
        </div>
      </div>

      {/* Achievement badges by category */}
      {categoryOrder.map(cat => {
        const items = grouped[cat];
        if (!items) return null;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{categoryLabels[cat]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {items.map(a => {
                const unlocked = !!a.unlockedAt;
                return (
                  <div
                    key={a.id}
                    className="card"
                    style={{
                      padding: '10px 10px',
                      opacity: unlocked ? 1 : 0.4,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {unlocked && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'var(--neon-cyan)',
                      }} />
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                        {a.icon}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: unlocked ? 'var(--text-bright)' : 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {a.title}
                        </div>
                        <div style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {a.description}
                        </div>
                      </div>
                    </div>
                    {unlocked && a.unlockedAt && (
                      <div style={{ fontSize: 9, color: 'var(--neon-cyan)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                        {new Date(a.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Activity Heatmap */}
      <div className="section-label" style={{ marginBottom: 8 }}>Activity (365 Days)</div>
      <div className="card" style={{ marginBottom: 16, padding: '10px 8px', overflowX: 'auto' }}>
        <ActivityHeatmap sessions={stats.sessions} />
      </div>

      {/* Personal Records */}
      <div className="section-label" style={{ marginBottom: 8 }}>Personal Records</div>
      <div style={{ marginBottom: 16 }}>
        <PersonalRecords stats={stats} />
      </div>

      {/* Share Profile button */}
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onClick={() => exportProfileCard({
          stats,
          achievements,
          unlockedCount,
          totalCount,
        })}
      >
        <Download size={14} />
        Share Profile Card
      </button>
    </div>
  );
}

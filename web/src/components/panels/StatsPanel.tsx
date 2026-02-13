import { useMemo } from 'react';
import type { Mode, PatternStrength, SessionRecord, StatsData } from '../../types';

interface StatsPanelProps {
  stats: StatsData;
}

const modeColors: Record<Mode, string> = {
  TEACHER: 'var(--neon-cyan)',
  INTERVIEWER: 'var(--neon-red)',
  REVIEWER: 'var(--neon-purple)',
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── Activity Chart: problems solved per day (last 30 days) ──

function ActivityChart({ sessions }: { sessions: SessionRecord[] }) {
  const data = useMemo(() => {
    const days = 30;
    const counts: number[] = new Array(days).fill(0);
    const labels: string[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const dayIndex = days - 1 - i;
      for (const s of sessions) {
        if (s.date === key) counts[dayIndex]++;
      }
    }

    return { counts, labels };
  }, [sessions]);

  const max = Math.max(1, ...data.counts);
  const w = 280;
  const h = 80;
  const padding = { top: 8, right: 4, bottom: 18, left: 24 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const barW = chartW / data.counts.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      {/* Y-axis labels */}
      <text x={padding.left - 4} y={padding.top + 4} textAnchor="end" fontSize="7" fill="#606078">{max}</text>
      <text x={padding.left - 4} y={padding.top + chartH} textAnchor="end" fontSize="7" fill="#606078">0</text>

      {/* Grid lines */}
      <line x1={padding.left} y1={padding.top} x2={padding.left + chartW} y2={padding.top} stroke="rgba(255,255,255,0.04)" />
      <line x1={padding.left} y1={padding.top + chartH / 2} x2={padding.left + chartW} y2={padding.top + chartH / 2} stroke="rgba(255,255,255,0.04)" />
      <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="rgba(255,255,255,0.06)" />

      {/* Bars */}
      {data.counts.map((count, i) => {
        const barH = count > 0 ? Math.max(2, (count / max) * chartH) : 0;
        const x = padding.left + i * barW + barW * 0.15;
        const y = padding.top + chartH - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW * 0.7}
            height={barH}
            rx={1.5}
            fill={count > 0 ? '#00f0ff' : 'transparent'}
            opacity={count > 0 ? 0.4 + (count / max) * 0.6 : 0}
          >
            <title>{data.labels[i]}: {count} problem{count !== 1 ? 's' : ''}</title>
          </rect>
        );
      })}

      {/* X-axis labels — show every 7th day */}
      {data.labels.map((label, i) => {
        if (i % 7 !== 0 && i !== data.counts.length - 1) return null;
        return (
          <text
            key={i}
            x={padding.left + i * barW + barW / 2}
            y={h - 2}
            textAnchor="middle"
            fontSize="6"
            fill="#606078"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Pattern Strength Radar Chart ──

function RadarChart({ patterns }: { patterns: PatternStrength[] }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const levels = 4; // score levels 1-4
  const n = patterns.length;

  if (n < 3) return null; // need at least 3 points for a radar

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // start from top

  // Compute polygon points for the data
  const dataPoints = patterns.map((p, i) => {
    const angle = startAngle + i * angleStep;
    const r = (p.avgScore / 4) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const points = Array.from({ length: n }, (_, j) => {
      const angle = startAngle + j * angleStep;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
    return points;
  });

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: cx + radius * Math.cos(angle),
      y2: cy + radius * Math.sin(angle),
    };
  });

  // Label positions (slightly outside the outermost ring)
  const labels = patterns.map((p, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = radius + 18;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      name: p.pattern,
      score: p.avgScore,
    };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: 'block' }}>
      {/* Grid rings */}
      {rings.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={i === levels - 1 ? 0.8 : 0.4}
        />
      ))}

      {/* Axis lines */}
      {axes.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={a.x2} y2={a.y2} stroke="rgba(255,255,255,0.06)" strokeWidth={0.4} />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill="rgba(0, 240, 255, 0.12)"
        stroke="#00f0ff"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#00f0ff" stroke="#030305" strokeWidth={1} />
      ))}

      {/* Labels */}
      {labels.map((l, i) => {
        const anchor = Math.abs(l.x - cx) < 5 ? 'middle' : l.x > cx ? 'start' : 'end';
        const color = l.score >= 3 ? '#a3ff00' : l.score >= 2 ? '#ffaa00' : '#ff3366';
        return (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="7"
            fill="#9090a8"
          >
            {l.name} <tspan fill={color} fontWeight="600">{l.score.toFixed(1)}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

// ── Main StatsPanel ──

export default function StatsPanel({ stats }: StatsPanelProps) {
  const recentSessions = stats.sessions.slice(0, 8);
  const practiedPatterns = stats.patternStrengths.filter((p) => p.attempted > 0);

  // Latest reviews for rubric display
  const latestReview = stats.reviews[0];

  return (
    <div>
      {/* Top stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <div className="card stagger-enter stagger-1" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>{stats.problemsSolved}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solved</div>
        </div>
        <div className="card stagger-enter stagger-2" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-lime)' }}>{stats.currentStreak}d</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
        </div>
        <div className="card stagger-enter stagger-3" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>
            {stats.avgScore ? stats.avgScore.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</div>
        </div>
        <div className="card stagger-enter stagger-4" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-amber)' }}>{stats.hintsUsed}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hints Used</div>
        </div>
      </div>

      {/* Time spent */}
      {stats.totalTime > 0 && (
        <div className="card stagger-enter stagger-5" style={{ marginBottom: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Practice Time</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
            {formatDuration(stats.totalTime)}
          </span>
        </div>
      )}

      {/* Activity Chart: problems/day */}
      {stats.sessions.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 8 }}>Daily Activity</div>
          <div className="card stagger-enter stagger-5" style={{ marginBottom: 16, padding: '8px 10px' }}>
            <ActivityChart sessions={stats.sessions} />
          </div>
        </>
      )}

      {/* Pattern Strength — Radar Chart + Bar List */}
      {practiedPatterns.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 8 }}>Pattern Strength</div>
          {practiedPatterns.length >= 3 && (
            <div className="card stagger-enter stagger-5" style={{ marginBottom: 8, padding: '4px 0' }}>
              <RadarChart patterns={practiedPatterns.sort((a, b) => b.avgScore - a.avgScore)} />
            </div>
          )}
          <div className="card stagger-enter stagger-6" style={{ marginBottom: 16 }}>
            {practiedPatterns
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((ps) => (
                <div key={ps.pattern} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ flex: '0 0 110px', fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ps.pattern}
                  </span>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(ps.avgScore / 4) * 100}%`,
                        background: ps.avgScore >= 3
                          ? 'var(--neon-lime)'
                          : ps.avgScore >= 2
                            ? 'linear-gradient(90deg, var(--neon-amber), var(--neon-lime))'
                            : 'linear-gradient(90deg, var(--neon-red), var(--neon-amber))',
                      }}
                    />
                  </div>
                  <span style={{ minWidth: 44, textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {ps.solved}/{ps.attempted}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Latest rubric scores */}
      {latestReview && (
        <>
          <div className="section-label" style={{ marginBottom: 8 }}>Latest Review</div>
          <div className="card stagger-enter stagger-6" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {latestReview.problemTitle} — {latestReview.overallScore.toFixed(1)}/4.0
            </div>
            {latestReview.dimensions.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <span style={{ flex: '0 0 100px', fontSize: 11, color: 'var(--text-secondary)' }}>{r.label}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(r.score / r.maxScore) * 100}%` }}
                  />
                </div>
                <span className="code-inline" style={{ minWidth: 28, textAlign: 'right', fontSize: 11 }}>{r.score}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent sessions */}
      <div className="section-label" style={{ marginBottom: 8 }}>Recent Sessions</div>
      {recentSessions.length === 0 ? (
        <div className="card" style={{ padding: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No sessions yet. Start solving!</span>
        </div>
      ) : (
        <div className="card stagger-enter stagger-7">
          {recentSessions.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < recentSessions.length - 1 ? '1px solid var(--border-default)' : 'none',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 48 }}>
                {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.problemTitle}
              </span>
              <span
                className="code-inline"
                style={{ color: modeColors[s.mode], fontSize: 11 }}
              >
                {s.score !== null ? s.score.toFixed(1) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

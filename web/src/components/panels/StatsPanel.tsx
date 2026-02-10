import type { SessionStats, Mode } from '../../types';

const stats: SessionStats = {
  problemsSolved: 24,
  totalAttempts: 31,
  avgScore: 3.2,
  hintsUsed: 18,
  streakDays: 7,
  rubricScores: [
    { category: 'Correctness', score: 3.5, maxScore: 4 },
    { category: 'Complexity', score: 3.0, maxScore: 4 },
    { category: 'Code Quality', score: 3.2, maxScore: 4 },
    { category: 'Edge Cases', score: 2.8, maxScore: 4 },
    { category: 'Communication', score: 3.6, maxScore: 4 },
    { category: 'Problem Solving', score: 3.1, maxScore: 4 },
  ],
  recentSessions: [
    { date: 'Jan 29', problem: 'Two Sum', score: 3.5, mode: 'TEACHER' },
    { date: 'Jan 28', problem: 'LIS', score: 3.0, mode: 'INTERVIEWER' },
    { date: 'Jan 27', problem: 'LCA', score: 2.8, mode: 'TEACHER' },
    { date: 'Jan 26', problem: 'Merge K Lists', score: 3.8, mode: 'REVIEWER' },
    { date: 'Jan 25', problem: 'Course Schedule', score: 3.2, mode: 'TEACHER' },
  ],
};

const modeColors: Record<Mode, string> = {
  TEACHER: 'var(--neon-cyan)',
  INTERVIEWER: 'var(--neon-red)',
  REVIEWER: 'var(--neon-purple)',
};

export default function StatsPanel() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <div className="card stagger-enter stagger-1" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>{stats.problemsSolved}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solved</div>
        </div>
        <div className="card stagger-enter stagger-2" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-lime)' }}>{stats.streakDays}d</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
        </div>
        <div className="card stagger-enter stagger-3" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-bright)' }}>{stats.avgScore}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Score</div>
        </div>
        <div className="card stagger-enter stagger-4" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--neon-amber)' }}>{stats.hintsUsed}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hints Used</div>
        </div>
      </div>

      <div className="section-label" style={{ marginBottom: 8 }}>Rubric Scores</div>
      <div className="card stagger-enter stagger-5" style={{ marginBottom: 16 }}>
        {stats.rubricScores.map((r) => (
          <div key={r.category} className="rubric-score" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ flex: '0 0 100px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.category}</span>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div
                className="progress-bar-fill"
                style={{ width: `${(r.score / r.maxScore) * 100}%` }}
              />
            </div>
            <span className="code-inline" style={{ minWidth: 32, textAlign: 'right' }}>{r.score}</span>
          </div>
        ))}
      </div>

      <div className="section-label" style={{ marginBottom: 8 }}>Recent Sessions</div>
      <div className="card stagger-enter stagger-6">
        {stats.recentSessions.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < stats.recentSessions.length - 1 ? '1px solid var(--border-default)' : 'none',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 48 }}>{s.date}</span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{s.problem}</span>
            <span
              className="code-inline"
              style={{ color: modeColors[s.mode] }}
            >
              {s.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

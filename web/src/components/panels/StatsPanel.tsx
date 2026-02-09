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
  TEACHER: 'var(--accent-blue)',
  INTERVIEWER: 'var(--accent-red)',
  REVIEWER: 'var(--accent-purple)',
};

export default function StatsPanel() {
  return (
    <div>
      <div className="stat-mini-grid">
        <div className="stat-card">
          <div className="stat-card__value">{stats.problemsSolved}</div>
          <div className="stat-card__label">Solved</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--accent-green)' }}>
            {stats.streakDays}d
          </div>
          <div className="stat-card__label">Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.avgScore}</div>
          <div className="stat-card__label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats.hintsUsed}</div>
          <div className="stat-card__label">Hints Used</div>
        </div>
      </div>

      <div className="section-label">Rubric Scores</div>
      <div style={{ marginBottom: 16 }}>
        {stats.rubricScores.map((r) => (
          <div key={r.category} className="rubric-bar">
            <span className="rubric-bar__label">{r.category}</span>
            <div className="rubric-bar__track">
              <div
                className="rubric-bar__fill"
                style={{ width: `${(r.score / r.maxScore) * 100}%` }}
              />
            </div>
            <span className="rubric-bar__value">{r.score}</span>
          </div>
        ))}
      </div>

      <div className="section-label">Recent Sessions</div>
      <div>
        {stats.recentSessions.map((s, i) => (
          <div key={i} className="session-history-item">
            <span className="session-history-item__date">{s.date}</span>
            <span className="session-history-item__problem">{s.problem}</span>
            <span
              className="session-history-item__score"
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

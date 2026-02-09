import type { MistakeEntry } from '../../types';

const sampleMistakes: MistakeEntry[] = [
  {
    id: 'm1',
    pattern: 'Sliding Window',
    description: 'Forgot to shrink window when condition met — off-by-one on right pointer',
    date: '2026-01-28',
    nextReview: '2026-01-31',
    streak: 2,
  },
  {
    id: 'm2',
    pattern: 'Dynamic Programming',
    description: 'Incorrect base case initialization for 2D DP table',
    date: '2026-01-26',
    nextReview: '2026-02-02',
    streak: 1,
  },
  {
    id: 'm3',
    pattern: 'Trees',
    description: 'Did not handle null child nodes in recursive LCA',
    date: '2026-01-25',
    nextReview: '2026-01-30',
    streak: 3,
  },
  {
    id: 'm4',
    pattern: 'Binary Search',
    description: 'Used wrong mid calculation — should be lo + (hi - lo) / 2 for overflow',
    date: '2026-01-22',
    nextReview: '2026-02-05',
    streak: 4,
  },
  {
    id: 'm5',
    pattern: 'HashMap',
    description: 'Missed edge case: empty input array should return empty result',
    date: '2026-01-20',
    nextReview: '2026-01-29',
    streak: 0,
  },
];

export default function MistakesPanel() {
  return (
    <div>
      <div className="section-label">Tracked Mistakes ({sampleMistakes.length})</div>
      {sampleMistakes.map((m) => {
        const isOverdue = new Date(m.nextReview) <= new Date();
        return (
          <div key={m.id} className="mistake-card">
            <div className="mistake-card__pattern">{m.pattern}</div>
            <div className="mistake-card__desc">{m.description}</div>
            <div className="mistake-card__meta">
              <span style={{ color: isOverdue ? 'var(--accent-red)' : undefined }}>
                {isOverdue ? 'Review due!' : `Review: ${m.nextReview}`}
              </span>
              <div className="streak-dots">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`streak-dot ${i < m.streak ? 'streak-dot--filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

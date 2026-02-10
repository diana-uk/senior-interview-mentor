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
      <div className="section-label" style={{ marginBottom: 12 }}>Tracked Mistakes ({sampleMistakes.length})</div>
      {sampleMistakes.map((m, i) => {
        const isOverdue = new Date(m.nextReview) <= new Date();
        return (
          <div key={m.id} className={`card card-interactive stagger-enter stagger-${i + 1}`} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="badge badge-secondary">{m.pattern}</span>
              <div className="streak-indicator">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <span
                    key={idx}
                    className={`streak-dot ${idx < m.streak ? 'streak-dot-filled' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>{m.description}</div>
            <div style={{ fontSize: 11, color: isOverdue ? 'var(--neon-red)' : 'var(--text-muted)' }}>
              {isOverdue ? 'Review due!' : `Review: ${m.nextReview}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

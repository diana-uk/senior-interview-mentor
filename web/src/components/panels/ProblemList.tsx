import type { Difficulty, PatternName } from '../../types';

interface ProblemEntry {
  id: string;
  title: string;
  difficulty: Difficulty;
}

const problemsByPattern: Record<string, ProblemEntry[]> = {
  'Sliding Window': [
    { id: 'sw-1', title: 'Maximum Subarray Sum', difficulty: 'Medium' },
    { id: 'sw-2', title: 'Longest Substring Without Repeating', difficulty: 'Medium' },
    { id: 'sw-3', title: 'Minimum Window Substring', difficulty: 'Hard' },
  ],
  'Two Pointers': [
    { id: 'tp-1', title: 'Two Sum II - Sorted Array', difficulty: 'Medium' },
    { id: 'tp-2', title: 'Container With Most Water', difficulty: 'Medium' },
    { id: 'tp-3', title: 'Trapping Rain Water', difficulty: 'Hard' },
  ],
  'HashMap': [
    { id: 'hm-1', title: 'Two Sum', difficulty: 'Easy' },
    { id: 'hm-2', title: 'Group Anagrams', difficulty: 'Medium' },
    { id: 'hm-3', title: 'Longest Consecutive Sequence', difficulty: 'Medium' },
  ],
  'Trees': [
    { id: 'tr-1', title: 'Invert Binary Tree', difficulty: 'Easy' },
    { id: 'tr-2', title: 'Lowest Common Ancestor', difficulty: 'Medium' },
    { id: 'tr-3', title: 'Serialize and Deserialize BST', difficulty: 'Hard' },
  ],
  'Dynamic Programming': [
    { id: 'dp-1', title: 'Climbing Stairs', difficulty: 'Easy' },
    { id: 'dp-2', title: 'Longest Increasing Subsequence', difficulty: 'Medium' },
    { id: 'dp-3', title: 'Edit Distance', difficulty: 'Hard' },
  ],
  'Binary Search': [
    { id: 'bs-1', title: 'Search in Rotated Array', difficulty: 'Medium' },
    { id: 'bs-2', title: 'Find Minimum in Rotated Array', difficulty: 'Medium' },
    { id: 'bs-3', title: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
  ],
  'Graphs': [
    { id: 'gr-1', title: 'Number of Islands', difficulty: 'Medium' },
    { id: 'gr-2', title: 'Course Schedule', difficulty: 'Medium' },
    { id: 'gr-3', title: 'Word Ladder', difficulty: 'Hard' },
  ],
  'Heap': [
    { id: 'hp-1', title: 'Kth Largest Element', difficulty: 'Medium' },
    { id: 'hp-2', title: 'Merge K Sorted Lists', difficulty: 'Hard' },
    { id: 'hp-3', title: 'Find Median from Data Stream', difficulty: 'Hard' },
  ],
};

interface ProblemListProps {
  onSelect: (id: string) => void;
  currentId: string | null;
}

export default function ProblemList({ onSelect, currentId }: ProblemListProps) {
  return (
    <div>
      {Object.entries(problemsByPattern).map(([pattern, problems], groupIndex) => (
        <div key={pattern} className={`card stagger-enter stagger-${groupIndex + 1}`} style={{ marginBottom: 12 }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13 }}>{pattern}</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {problems.map((p) => (
              <div
                key={p.id}
                className={`card card-interactive ${currentId === p.id ? 'card-hover-lift' : ''}`}
                onClick={() => onSelect(p.id)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: currentId === p.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                  borderColor: currentId === p.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                }}
              >
                <span style={{ fontSize: 13, color: currentId === p.id ? 'var(--text-bright)' : 'var(--text-primary)' }}>
                  {p.title}
                </span>
                <span className={`badge badge-${p.difficulty.toLowerCase()}`}>
                  {p.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { problemsByPattern };

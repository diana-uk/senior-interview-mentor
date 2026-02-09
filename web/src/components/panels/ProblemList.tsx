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

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'var(--accent-green)',
  Medium: 'var(--accent-orange)',
  Hard: 'var(--accent-red)',
};

interface ProblemListProps {
  onSelect: (id: string) => void;
  currentId: string | null;
}

export default function ProblemList({ onSelect, currentId }: ProblemListProps) {
  return (
    <div>
      {Object.entries(problemsByPattern).map(([pattern, problems]) => (
        <div key={pattern} className="problem-group">
          <div className="problem-group__title">{pattern}</div>
          {problems.map((p) => (
            <div
              key={p.id}
              className={`problem-item ${currentId === p.id ? 'problem-item--active' : ''}`}
              onClick={() => onSelect(p.id)}
            >
              <span className="problem-item__title">{p.title}</span>
              <span
                className="problem-item__badge"
                style={{ background: difficultyColors[p.difficulty] }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export { problemsByPattern };

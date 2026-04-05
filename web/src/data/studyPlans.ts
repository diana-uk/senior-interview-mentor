export type Pace = 'relaxed' | 'normal' | 'intense';

export interface StudyPlanTemplate {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  /** Pattern names to include. If undefined, all patterns are used. */
  patterns?: string[];
}

export const PACE_CONFIG: Record<Pace, { label: string; problemsPerDay: number; description: string }> = {
  relaxed: { label: 'Relaxed',  problemsPerDay: 1, description: '1 problem / day' },
  normal:  { label: 'Normal',   problemsPerDay: 2, description: '2 problems / day' },
  intense: { label: 'Intense',  problemsPerDay: 5, description: '5 problems / day' },
};

export const STUDY_PLAN_TEMPLATES: StudyPlanTemplate[] = [
  {
    id: 'blind75',
    name: 'Blind 75',
    description: '75 essential problems covering all core patterns. The industry-standard interview prep curriculum.',
    durationDays: 30,
    patterns: [
      'Sliding Window', 'Two Pointers', 'HashMap', 'Binary Search',
      'Trees', 'Dynamic Programming', 'Graphs', 'Heap',
    ],
  },
  {
    id: 'neetcode150',
    name: 'NeetCode 150',
    description: 'Complete 150-problem curriculum covering every major algorithm pattern.',
    durationDays: 60,
  },
  {
    id: 'arrays-sprint',
    name: 'Arrays Sprint',
    description: 'Focused 7-day sprint on array, string, and hash map fundamentals.',
    durationDays: 7,
    patterns: ['Sliding Window', 'Two Pointers', 'HashMap'],
  },
  {
    id: 'graph-theory',
    name: 'Graph Theory',
    description: '14-day deep dive into graph algorithms: BFS, DFS, topological sort, and union-find.',
    durationDays: 14,
    patterns: ['BFS/DFS', 'Topological Sort', 'Union-Find'],
  },
];

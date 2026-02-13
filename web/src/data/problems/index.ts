import type { Difficulty, Problem } from '../../types';
import type { FullProblem } from './helpers';

import { slidingWindowProblems } from './sliding-window';
import { twoPointersProblems } from './two-pointers';
import { hashmapProblems } from './hashmap';
import { binarySearchProblems } from './binary-search';
import { arrayProblems } from './array';
import { stringProblems } from './string';
import { linkedListProblems } from './linked-list';
import { matrixProblems } from './matrix';
import { intervalProblems } from './interval';
import { stackProblems } from './stack';
import { bitManipulationProblems } from './bit-manipulation';
import { treesProblems } from './trees';
import { trieProblems } from './trie';
import { dpProblems } from './dynamic-programming';
import { graphsProblems } from './graphs';
import { heapProblems } from './heap';
import { backtrackingProblems } from './backtracking';
import { greedyProblems } from './greedy';
import { advancedGraphsProblems } from './advanced-graphs';
import { mathGeometryProblems } from './math-geometry';

// ── Aggregate all problems ──

const allProblems: FullProblem[] = [
  ...slidingWindowProblems,
  ...twoPointersProblems,
  ...hashmapProblems,
  ...binarySearchProblems,
  ...arrayProblems,
  ...stringProblems,
  ...linkedListProblems,
  ...matrixProblems,
  ...intervalProblems,
  ...stackProblems,
  ...bitManipulationProblems,
  ...treesProblems,
  ...trieProblems,
  ...dpProblems,
  ...graphsProblems,
  ...heapProblems,
  ...backtrackingProblems,
  ...greedyProblems,
  ...advancedGraphsProblems,
  ...mathGeometryProblems,
];

// ── Derived exports (same interface as original problems.ts) ──

export interface ProblemEntry {
  id: string;
  title: string;
  difficulty: Difficulty;
}

export const problemsByPattern: Record<string, ProblemEntry[]> = {};
for (const p of allProblems) {
  if (!problemsByPattern[p.group]) problemsByPattern[p.group] = [];
  problemsByPattern[p.group].push({ id: p.id, title: p.title, difficulty: p.difficulty });
}

export const problemsById: Record<string, Problem> = {};
for (const { group: _group, ...problem } of allProblems) {
  problemsById[problem.id] = problem;
}

export const problemPatternMap: Record<string, string> = {};
for (const p of allProblems) {
  problemPatternMap[p.id] = p.group;
}

export const allProblemsList: ProblemEntry[] = allProblems.map((p) => ({
  id: p.id,
  title: p.title,
  difficulty: p.difficulty,
}));

export const totalProblemCount = allProblems.length;

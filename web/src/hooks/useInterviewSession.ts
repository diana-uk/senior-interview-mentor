import { useState } from 'react';
import type {
  CommitmentGateItem,
  HintLevel,
  InterviewStage,
  Mode,
  Problem,
  SystemDesignTopicId,
  TechnicalQuestionCategory,
} from '../types';

const defaultProblem: Problem = {
  id: 'hm-1',
  title: 'Two Sum',
  difficulty: 'Easy',
  pattern: 'HashMap',
  description:
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: ['Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
  starterCode: `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`,
  testCases: [
    { input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' },
    { input: 'twoSum([3,2,4], 6)', expected: '[1,2]' },
    { input: 'twoSum([3,3], 6)', expected: '[0,1]' },
  ],
};

export const DEFAULT_PROBLEM = defaultProblem;

export const DEFAULT_GATE: CommitmentGateItem[] = [
  { id: 'constraints', label: 'Constraints Recap', description: 'Summarize the key constraints in 1-3 bullets', completed: false },
  { id: 'pattern', label: 'Chosen Pattern', description: 'Name the algorithm pattern (e.g., HashMap, Sliding Window)', completed: false },
  { id: 'approach', label: 'Approach Plan', description: 'Outline your approach in 4-8 steps', completed: false },
  { id: 'complexity', label: 'Complexity Estimate', description: 'State time and space complexity', completed: false },
  { id: 'edges', label: 'Edge Cases', description: 'List 3-6 edge cases to handle', completed: false },
];

export const DEFAULT_HINTS: HintLevel[] = [
  { level: 1, label: 'Nudge', description: 'A small push in the right direction', content: 'Think about what data structure lets you look up values in O(1) time. What if you stored the complement?', unlocked: false, color: 'var(--neon-lime)' },
  { level: 2, label: 'Structure', description: 'Data structure + algorithm steps', content: 'Use a HashMap to store each number\'s index as you iterate. For each number, check if (target - num) exists in the map.', unlocked: false, color: 'var(--neon-amber)' },
  { level: 3, label: 'Pseudocode', description: 'Detailed pseudocode outline', content: '1. Create empty map\n2. For each num at index i:\n   a. complement = target - num\n   b. If complement in map → return [map[complement], i]\n   c. Else → map[num] = i\n3. Return [] (no solution)', unlocked: false, color: 'var(--neon-purple)' },
];

interface SessionInit {
  mode?: Mode;
  currentProblem?: Problem | null;
  interviewStage?: InterviewStage | null;
  interviewCategory?: TechnicalQuestionCategory | null;
  sdTopicId?: SystemDesignTopicId | null;
  hintsUsed?: number;
  commitmentGate?: CommitmentGateItem[];
  hints?: HintLevel[];
}

export function useInterviewSession(initial?: SessionInit) {
  const [mode, setMode] = useState<Mode>(initial?.mode ?? 'TEACHER');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(initial?.currentProblem ?? defaultProblem);
  const [interviewStage, setInterviewStage] = useState<InterviewStage | null>(initial?.interviewStage ?? null);
  const [interviewCategory, setInterviewCategory] = useState<TechnicalQuestionCategory | null>(initial?.interviewCategory ?? null);
  const [sdTopicId, setSdTopicId] = useState<SystemDesignTopicId | null>(initial?.sdTopicId ?? null);
  const [hintsUsed, setHintsUsed] = useState(initial?.hintsUsed ?? 0);
  const [commitmentGate, setCommitmentGate] = useState<CommitmentGateItem[]>(initial?.commitmentGate ?? DEFAULT_GATE);
  const [hints, setHints] = useState<HintLevel[]>(initial?.hints ?? DEFAULT_HINTS);
  const [hintLadderOpen, setHintLadderOpen] = useState(false);
  const [commitmentGateOpen, setCommitmentGateOpen] = useState(false);
  const [reviewRubricOpen, setReviewRubricOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  return {
    mode, setMode,
    currentProblem, setCurrentProblem,
    interviewStage, setInterviewStage,
    interviewCategory, setInterviewCategory,
    sdTopicId, setSdTopicId,
    hintsUsed, setHintsUsed,
    commitmentGate, setCommitmentGate,
    hints, setHints,
    hintLadderOpen, setHintLadderOpen,
    commitmentGateOpen, setCommitmentGateOpen,
    reviewRubricOpen, setReviewRubricOpen,
    interviewModalOpen, setInterviewModalOpen,
  };
}

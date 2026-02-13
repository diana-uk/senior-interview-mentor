import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Backtracking';

export const backtrackingProblems: FullProblem[] = [
  {
    group: 'Backtracking',
    id: 'bt-1',
    title: 'Subsets',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums` of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.',
    examples: [
      'Input: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]',
      'Input: nums = [0]\nOutput: [[],[0]]',
    ],
    constraints: [
      '1 <= nums.length <= 10',
      '-10 <= nums[i] <= 10',
      'All the numbers of nums are unique.',
    ],
    starterCode: `function subsets(nums: number[]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'subsets([1,2,3]).length', expected: '8' },
      { input: 'subsets([0]).length', expected: '2' },
      { input: 'subsets([]).length', expected: '1' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-2',
    title: 'Combination Sum',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an array of distinct integers `candidates` and a target integer `target`, return a list of all unique combinations of `candidates` where the chosen numbers sum to `target`. You may return the combinations in any order.\n\nThe same number may be chosen from `candidates` an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.',
    examples: [
      'Input: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]',
      'Input: candidates = [2,3,5], target = 8\nOutput: [[2,2,2,2],[2,3,3],[3,5]]',
      'Input: candidates = [2], target = 1\nOutput: []',
    ],
    constraints: [
      '1 <= candidates.length <= 30',
      '2 <= candidates[i] <= 40',
      'All elements of candidates are distinct.',
      '1 <= target <= 40',
    ],
    starterCode: `function combinationSum(candidates: number[], target: number): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'combinationSum([2,3,6,7], 7).length', expected: '2' },
      { input: 'combinationSum([2,3,5], 8).length', expected: '3' },
      { input: 'combinationSum([2], 1).length', expected: '0' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-3',
    title: 'Permutations',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.',
    examples: [
      'Input: nums = [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
      'Input: nums = [0,1]\nOutput: [[0,1],[1,0]]',
      'Input: nums = [1]\nOutput: [[1]]',
    ],
    constraints: [
      '1 <= nums.length <= 6',
      '-10 <= nums[i] <= 10',
      'All the integers of nums are unique.',
    ],
    starterCode: `function permute(nums: number[]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'permute([1,2,3]).length', expected: '6' },
      { input: 'permute([0,1]).length', expected: '2' },
      { input: 'permute([1]).length', expected: '1' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-4',
    title: 'Subsets II',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums` that may contain duplicates, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.',
    examples: [
      'Input: nums = [1,2,2]\nOutput: [[],[1],[1,2],[1,2,2],[2],[2,2]]',
      'Input: nums = [0]\nOutput: [[],[0]]',
    ],
    constraints: [
      '1 <= nums.length <= 10',
      '-10 <= nums[i] <= 10',
    ],
    starterCode: `function subsetsWithDup(nums: number[]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'subsetsWithDup([1,2,2]).length', expected: '6' },
      { input: 'subsetsWithDup([0]).length', expected: '2' },
      { input: 'subsetsWithDup([4,4,4,1,4]).length', expected: '10' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-5',
    title: 'Combination Sum II',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a collection of candidate numbers (`candidates`) and a target number (`target`), find all unique combinations in `candidates` where the candidate numbers sum to `target`.\n\nEach number in `candidates` may only be used once in the combination. The solution set must not contain duplicate combinations.',
    examples: [
      'Input: candidates = [10,1,2,7,6,1,5], target = 8\nOutput: [[1,1,6],[1,2,5],[1,7],[2,6]]',
      'Input: candidates = [2,5,2,1,2], target = 5\nOutput: [[1,2,2],[5]]',
    ],
    constraints: [
      '1 <= candidates.length <= 100',
      '1 <= candidates[i] <= 50',
      '1 <= target <= 30',
    ],
    starterCode: `function combinationSum2(candidates: number[], target: number): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'combinationSum2([10,1,2,7,6,1,5], 8).length', expected: '4' },
      { input: 'combinationSum2([2,5,2,1,2], 5).length', expected: '2' },
      { input: 'combinationSum2([1,1,1,1,1], 3).length', expected: '1' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-6',
    title: 'Palindrome Partitioning',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a string `s`, partition `s` such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of `s`.',
    examples: [
      'Input: s = "aab"\nOutput: [["a","a","b"],["aa","b"]]',
      'Input: s = "a"\nOutput: [["a"]]',
    ],
    constraints: [
      '1 <= s.length <= 16',
      's contains only lowercase English letters.',
    ],
    starterCode: `function partition(s: string): string[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'partition("aab").length', expected: '2' },
      { input: 'partition("a").length', expected: '1' },
      { input: 'partition("aabb").length', expected: '4' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-7',
    title: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a string containing digits from `2-9` inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.\n\nMapping of digits to letters (like telephone buttons):\n2 → abc, 3 → def, 4 → ghi, 5 → jkl, 6 → mno, 7 → pqrs, 8 → tuv, 9 → wxyz',
    examples: [
      'Input: digits = "23"\nOutput: ["ad","ae","af","bd","be","bf","cd","ce","cf"]',
      'Input: digits = ""\nOutput: []',
      'Input: digits = "2"\nOutput: ["a","b","c"]',
    ],
    constraints: [
      '0 <= digits.length <= 4',
      "digits[i] is a digit in the range ['2', '9'].",
    ],
    starterCode: `function letterCombinations(digits: string): string[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'letterCombinations("23").length', expected: '9' },
      { input: 'letterCombinations("").length', expected: '0' },
      { input: 'letterCombinations("2").length', expected: '3' },
    ],
  },
  {
    group: 'Backtracking',
    id: 'bt-8',
    title: 'N-Queens',
    difficulty: 'Hard',
    pattern,
    description:
      "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n\nGiven an integer `n`, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.\n\nEach solution contains a distinct board configuration where `'Q'` and `'.'` indicate a queen and an empty space, respectively.",
    examples: [
      'Input: n = 4\nOutput: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]\nExplanation: There exist two distinct solutions to the 4-queens puzzle.',
      'Input: n = 1\nOutput: [["Q"]]',
    ],
    constraints: ['1 <= n <= 9'],
    starterCode: `function solveNQueens(n: number): string[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'solveNQueens(4).length', expected: '2' },
      { input: 'solveNQueens(1).length', expected: '1' },
      { input: 'solveNQueens(8).length', expected: '92' },
    ],
  },
];

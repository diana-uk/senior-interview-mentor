import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Two Pointers';

export const twoPointersProblems: FullProblem[] = [
  {
    group: 'Two Pointers',
    id: 'tp-1',
    title: 'Two Sum II - Sorted Array',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a **1-indexed** array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number. Return the indices of the two numbers (1-indexed) as an integer array `[index1, index2]`.',
    examples: [
      'Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]\nExplanation: The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2.',
      'Input: numbers = [2,3,4], target = 6\nOutput: [1,3]',
    ],
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000',
      'numbers is sorted in non-decreasing order.',
      'Exactly one solution exists.',
    ],
    starterCode: {
      typescript: `function twoSumII(numbers: number[], target: number): number[] {\n  // Your solution here\n  \n}`,
      python: `def two_sum_ii(numbers: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'twoSumII([2,7,11,15], 9)', expected: '[1,2]' },
      { input: 'twoSumII([2,3,4], 6)', expected: '[1,3]' },
      { input: 'twoSumII([-1,0], -1)', expected: '[1,2]' },
    ],
  },
  {
    group: 'Two Pointers',
    id: 'tp-2',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
    examples: [
      'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49',
      'Input: height = [1,1]\nOutput: 1',
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    starterCode: {
      typescript: `function maxArea(height: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_area(height: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxArea([1,8,6,2,5,4,8,3,7])', expected: '49' },
      { input: 'maxArea([1,1])', expected: '1' },
      { input: 'maxArea([4,3,2,1,4])', expected: '16' },
    ],
  },
  {
    group: 'Two Pointers',
    id: 'tp-3',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    pattern,
    description:
      'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    examples: [
      'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: 6 units of rain water are trapped.',
      'Input: height = [4,2,0,3,2,5]\nOutput: 9',
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    starterCode: {
      typescript: `function trap(height: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def trap(height: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'trap([0,1,0,2,1,0,1,3,2,1,2,1])', expected: '6' },
      { input: 'trap([4,2,0,3,2,5])', expected: '9' },
      { input: 'trap([1,0,1])', expected: '1' },
    ],
  },
  {
    group: 'Two Pointers',
    id: 'tp-4',
    title: '3Sum',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.',
    examples: [
      'Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]',
      'Input: nums = [0,1,1]\nOutput: []',
      'Input: nums = [0,0,0]\nOutput: [[0,0,0]]',
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5',
    ],
    starterCode: {
      typescript: `function threeSum(nums: number[]): number[][] {\n  // Your solution here\n  \n}`,
      python: `def three_sum(nums: list[int]) -> list[list[int]]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'threeSum([-1,0,1,2,-1,-4])', expected: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'threeSum([0,1,1])', expected: '[]' },
      { input: 'threeSum([0,0,0])', expected: '[[0,0,0]]' },
    ],
  },
];

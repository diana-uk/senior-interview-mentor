import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const arrayProblems: FullProblem[] = [
  {
    group: 'Array',
    id: 'ar-1',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    pattern: 'Prefix Sum' as PatternName,
    description:
      'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.',
    examples: [
      'Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]',
      'Input: nums = [-1,1,0,-3,3]\nOutput: [0,0,9,0,0]',
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
    ],
    starterCode: {
      typescript: `function productExceptSelf(nums: number[]): number[] {\n  // Your solution here\n  \n}`,
      python: `def product_except_self(nums: list[int]) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'productExceptSelf([1,2,3,4])', expected: '[24,12,8,6]' },
      { input: 'productExceptSelf([-1,1,0,-3,3])', expected: '[0,0,9,0,0]' },
      { input: 'productExceptSelf([2,3])', expected: '[3,2]' },
    ],
  },
  {
    group: 'Array',
    id: 'ar-2',
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    pattern: 'Dynamic Programming' as PatternName,
    description:
      'Given an integer array `nums`, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer will fit in a 32-bit integer.',
    examples: [
      'Input: nums = [2,3,-2,4]\nOutput: 6\nExplanation: [2,3] has the largest product 6.',
      'Input: nums = [-2,0,-1]\nOutput: 0\nExplanation: The result cannot be 2, because [-2,-1] is not a subarray.',
    ],
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-10 <= nums[i] <= 10',
      'The product of any subarray of nums is guaranteed to fit in a 32-bit integer.',
    ],
    starterCode: {
      typescript: `function maxProduct(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_product(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxProduct([2,3,-2,4])', expected: '6' },
      { input: 'maxProduct([-2,0,-1])', expected: '0' },
      { input: 'maxProduct([-2,3,-4])', expected: '24' },
    ],
  },
];

import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Sliding Window';

export const slidingWindowProblems: FullProblem[] = [
  {
    group: 'Sliding Window',
    id: 'sw-1',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    examples: [
      'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
      'Input: nums = [1]\nOutput: 1',
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `function maxSubArray(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'maxSubArray([-2,1,-3,4,-1,2,1,-5,4])', expected: '6' },
      { input: 'maxSubArray([1])', expected: '1' },
      { input: 'maxSubArray([5,4,-1,7,8])', expected: '23' },
    ],
  },
  {
    group: 'Sliding Window',
    id: 'sw-2',
    title: 'Longest Substring Without Repeating',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
      'Input: s = "bbbbb"\nOutput: 1',
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    starterCode: `function lengthOfLongestSubstring(s: string): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'lengthOfLongestSubstring("abcabcbb")', expected: '3' },
      { input: 'lengthOfLongestSubstring("bbbbb")', expected: '1' },
      { input: 'lengthOfLongestSubstring("pwwkew")', expected: '3' },
    ],
  },
  {
    group: 'Sliding Window',
    id: 'sw-3',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    pattern,
    description:
      'Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.',
    examples: [
      'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"\nExplanation: The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.',
      'Input: s = "a", t = "a"\nOutput: "a"',
    ],
    constraints: [
      '1 <= s.length, t.length <= 10^5',
      's and t consist of uppercase and lowercase English letters.',
    ],
    starterCode: `function minWindow(s: string, t: string): string {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'minWindow("ADOBECODEBANC", "ABC")', expected: '"BANC"' },
      { input: 'minWindow("a", "a")', expected: '"a"' },
      { input: 'minWindow("a", "aa")', expected: '""' },
    ],
  },
  {
    group: 'Sliding Window',
    id: 'sw-4',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    pattern,
    description:
      'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a single day to sell. Return the maximum profit. If no profit, return 0.',
    examples: [
      'Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
      'Input: prices = [7,6,4,3,1]\nOutput: 0\nExplanation: No profitable transaction is possible.',
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    starterCode: `function maxProfit(prices: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'maxProfit([7,1,5,3,6,4])', expected: '5' },
      { input: 'maxProfit([7,6,4,3,1])', expected: '0' },
      { input: 'maxProfit([2,4,1])', expected: '2' },
    ],
  },
];

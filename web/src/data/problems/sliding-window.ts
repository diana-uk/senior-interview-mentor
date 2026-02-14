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
    starterCode: {
      typescript: `function maxSubArray(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_sub_array(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function lengthOfLongestSubstring(s: string): number {\n  // Your solution here\n  \n}`,
      python: `def length_of_longest_substring(s: str) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function minWindow(s: string, t: string): string {\n  // Your solution here\n  \n}`,
      python: `def min_window(s: str, t: str) -> str:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function maxProfit(prices: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_profit(prices: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxProfit([7,1,5,3,6,4])', expected: '5' },
      { input: 'maxProfit([7,6,4,3,1])', expected: '0' },
      { input: 'maxProfit([2,4,1])', expected: '2' },
    ],
  },
  {
    group: 'Sliding Window',
    id: 'sw-5',
    title: 'Permutation in String',
    difficulty: 'Medium',
    pattern,
    description:
      'Given two strings `s1` and `s2`, return `true` if `s2` contains a permutation of `s1`, or `false` otherwise.\n\nIn other words, return `true` if one of `s1`\'s permutations is a substring of `s2`.',
    examples: [
      'Input: s1 = "ab", s2 = "eidbaooo"\nOutput: true\nExplanation: s2 contains one permutation of s1 ("ba").',
      'Input: s1 = "ab", s2 = "eidboaoo"\nOutput: false',
    ],
    constraints: [
      '1 <= s1.length, s2.length <= 10^4',
      's1 and s2 consist of lowercase English letters.',
    ],
    starterCode: {
      typescript: `function checkInclusion(s1: string, s2: string): boolean {\n  // Your solution here\n  \n}`,
      python: `def check_inclusion(s1: str, s2: str) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'checkInclusion("ab", "eidbaooo")', expected: 'true' },
      { input: 'checkInclusion("ab", "eidboaoo")', expected: 'false' },
      { input: 'checkInclusion("adc", "dcda")', expected: 'true' },
    ],
  },
  {
    group: 'Sliding Window',
    id: 'sw-6',
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    pattern,
    description:
      'You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.\n\nReturn the max sliding window.',
    examples: [
      'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]\nExplanation:\nWindow position                Max\n---------------               -----\n[1  3  -1] -3  5  3  6  7       3\n 1 [3  -1  -3] 5  3  6  7       3\n 1  3 [-1  -3  5] 3  6  7       5\n 1  3  -1 [-3  5  3] 6  7       5\n 1  3  -1  -3 [5  3  6] 7       6\n 1  3  -1  -3  5 [3  6  7]      7',
      'Input: nums = [1], k = 1\nOutput: [1]',
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length',
    ],
    starterCode: {
      typescript: `function maxSlidingWindow(nums: number[], k: number): number[] {\n  // Your solution here\n  \n}`,
      python: `def max_sliding_window(nums: list[int], k: int) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)', expected: '[3,3,5,5,6,7]' },
      { input: 'maxSlidingWindow([1], 1)', expected: '[1]' },
      { input: 'maxSlidingWindow([1,-1], 1)', expected: '[1,-1]' },
    ],
  },
];

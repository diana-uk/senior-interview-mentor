import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Dynamic Programming';

export const dpProblems: FullProblem[] = [
  // ═══════════════════════════════════════════
  // EXISTING
  // ═══════════════════════════════════════════
  {
    group: 'Dynamic Programming',
    id: 'dp-1',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    pattern,
    description:
      'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?',
    examples: [
      'Input: n = 2\nOutput: 2\nExplanation: There are two ways: 1+1 and 2.',
      'Input: n = 3\nOutput: 3\nExplanation: Three ways: 1+1+1, 1+2, and 2+1.',
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: {
      typescript: `function climbStairs(n: number): number {\n  // Your solution here\n  \n}`,
      javascript: `function climbStairs(n) {\n  // Your solution here\n  \n}`,
      python: `def climb_stairs(n: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'climbStairs(2)', expected: '2' },
      { input: 'climbStairs(3)', expected: '3' },
      { input: 'climbStairs(5)', expected: '8' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-2',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
    examples: [
      'Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4\nExplanation: The longest increasing subsequence is [2,3,7,101], its length is 4.',
      'Input: nums = [0,1,0,3,2,3]\nOutput: 4',
    ],
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `function lengthOfLIS(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'lengthOfLIS([10,9,2,5,3,7,101,18])', expected: '4' },
      { input: 'lengthOfLIS([0,1,0,3,2,3])', expected: '4' },
      { input: 'lengthOfLIS([7,7,7,7,7,7,7])', expected: '1' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-3',
    title: 'Edit Distance',
    difficulty: 'Hard',
    pattern,
    description:
      'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character',
    examples: [
      'Input: word1 = "horse", word2 = "ros"\nOutput: 3\nExplanation: horse \u2192 rorse \u2192 rose \u2192 ros',
      'Input: word1 = "intention", word2 = "execution"\nOutput: 5',
    ],
    constraints: [
      '0 <= word1.length, word2.length <= 500',
      'word1 and word2 consist of lowercase English letters.',
    ],
    starterCode: `function minDistance(word1: string, word2: string): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'minDistance("horse", "ros")', expected: '3' },
      { input: 'minDistance("intention", "execution")', expected: '5' },
      { input: 'minDistance("", "abc")', expected: '3' },
    ],
  },

  // ═══════════════════════════════════════════
  // NEW — Blind 75 DP problems
  // ═══════════════════════════════════════════
  {
    group: 'Dynamic Programming',
    id: 'dp-4',
    title: 'Coin Change',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination, return `-1`.',
    examples: [
      'Input: coins = [1,5,10,25], amount = 30\nOutput: 2\nExplanation: 5 + 25 = 30',
      'Input: coins = [2], amount = 3\nOutput: -1',
      'Input: coins = [1], amount = 0\nOutput: 0',
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    starterCode: `function coinChange(coins: number[], amount: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'coinChange([1,5,10,25], 30)', expected: '2' },
      { input: 'coinChange([2], 3)', expected: '-1' },
      { input: 'coinChange([1], 0)', expected: '0' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-5',
    title: 'Word Break',
    difficulty: 'Medium',
    pattern,
    description:
      'Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
    examples: [
      'Input: s = "leetcode", wordDict = ["leet","code"]\nOutput: true\nExplanation: "leetcode" can be segmented as "leet code".',
      'Input: s = "applepenapple", wordDict = ["apple","pen"]\nOutput: true\nExplanation: "applepenapple" can be segmented as "apple pen apple".',
      'Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]\nOutput: false',
    ],
    constraints: [
      '1 <= s.length <= 300',
      '1 <= wordDict.length <= 1000',
      '1 <= wordDict[i].length <= 20',
      's and wordDict[i] consist of only lowercase English letters.',
      'All the strings of wordDict are unique.',
    ],
    starterCode: `function wordBreak(s: string, wordDict: string[]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'wordBreak("leetcode", ["leet","code"])', expected: 'true' },
      { input: 'wordBreak("applepenapple", ["apple","pen"])', expected: 'true' },
      { input: 'wordBreak("catsandog", ["cats","dog","sand","and","cat"])', expected: 'false' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-6',
    title: 'House Robber',
    difficulty: 'Medium',
    pattern,
    description:
      'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected — if two adjacent houses were broken into on the same night, it will automatically contact the police. Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
    examples: [
      'Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.',
      'Input: nums = [2,7,9,3,1]\nOutput: 12\nExplanation: Rob house 1 (money = 2), rob house 3 (money = 9), and rob house 5 (money = 1). Total = 2 + 9 + 1 = 12.',
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 400',
    ],
    starterCode: `function rob(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'rob([1,2,3,1])', expected: '4' },
      { input: 'rob([2,7,9,3,1])', expected: '12' },
      { input: 'rob([2,1,1,2])', expected: '4' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-7',
    title: 'House Robber II',
    difficulty: 'Medium',
    pattern,
    description:
      'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Adjacent houses have security systems connected — if two adjacent houses were broken into on the same night, it will automatically contact the police. Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
    examples: [
      'Input: nums = [2,3,2]\nOutput: 3\nExplanation: You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses.',
      'Input: nums = [1,2,3,1]\nOutput: 4\nExplanation: Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.',
      'Input: nums = [1,2,3]\nOutput: 3',
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 1000',
    ],
    starterCode: `function robII(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'robII([2,3,2])', expected: '3' },
      { input: 'robII([1,2,3,1])', expected: '4' },
      { input: 'robII([1,2,3])', expected: '3' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-8',
    title: 'Decode Ways',
    difficulty: 'Medium',
    pattern,
    description:
      "A message containing letters from `A-Z` can be encoded to numbers using the mapping: `'A' -> \"1\"`, `'B' -> \"2\"`, ..., `'Z' -> \"26\"`. Given a string `s` containing only digits, return the number of ways to decode it.",
    examples: [
      'Input: s = "12"\nOutput: 2\nExplanation: "12" could be decoded as "AB" (1 2) or "L" (12).',
      'Input: s = "226"\nOutput: 3\nExplanation: "226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).',
      'Input: s = "06"\nOutput: 0\nExplanation: "06" cannot be mapped to "F" because of the leading zero ("6" is different from "06").',
    ],
    constraints: [
      '1 <= s.length <= 100',
      's contains only digits and may contain leading zero(s).',
    ],
    starterCode: `function numDecodings(s: string): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'numDecodings("12")', expected: '2' },
      { input: 'numDecodings("226")', expected: '3' },
      { input: 'numDecodings("06")', expected: '0' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-9',
    title: 'Unique Paths',
    difficulty: 'Medium',
    pattern,
    description:
      'There is a robot on an `m x n` grid. The robot is initially located at the top-left corner (i.e., `grid[0][0]`). The robot tries to move to the bottom-right corner (i.e., `grid[m - 1][n - 1]`). The robot can only move either down or right at any point in time. Given the two integers `m` and `n`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.',
    examples: [
      'Input: m = 3, n = 7\nOutput: 28',
      'Input: m = 3, n = 2\nOutput: 3\nExplanation: From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:\n1. Right -> Down -> Down\n2. Down -> Down -> Right\n3. Down -> Right -> Down',
    ],
    constraints: [
      '1 <= m, n <= 100',
    ],
    starterCode: `function uniquePaths(m: number, n: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'uniquePaths(3, 7)', expected: '28' },
      { input: 'uniquePaths(3, 2)', expected: '3' },
      { input: 'uniquePaths(1, 1)', expected: '1' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-10',
    title: 'Jump Game',
    difficulty: 'Medium',
    pattern,
    description:
      "You are given an integer array `nums`. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.",
    examples: [
      'Input: nums = [2,3,1,1,4]\nOutput: true\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.',
      'Input: nums = [3,2,1,0,4]\nOutput: false\nExplanation: You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.',
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '0 <= nums[i] <= 10^5',
    ],
    starterCode: `function canJump(nums: number[]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'canJump([2,3,1,1,4])', expected: 'true' },
      { input: 'canJump([3,2,1,0,4])', expected: 'false' },
      { input: 'canJump([0])', expected: 'true' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-11',
    title: 'Combination Sum IV',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an array of distinct integers `nums` and a target integer `target`, return the number of possible combinations that add up to `target`. The order of the combination matters (different sequences count as different combinations).',
    examples: [
      'Input: nums = [1,2,3], target = 4\nOutput: 7\nExplanation: The possible combination ways are:\n(1,1,1,1)\n(1,1,2)\n(1,2,1)\n(1,3)\n(2,1,1)\n(2,2)\n(3,1)\nNote that different sequences are counted as different combinations.',
      'Input: nums = [9], target = 3\nOutput: 0',
    ],
    constraints: [
      '1 <= nums.length <= 200',
      '1 <= nums[i] <= 1000',
      'All the elements of nums are unique.',
      '1 <= target <= 1000',
    ],
    starterCode: `function combinationSum4(nums: number[], target: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'combinationSum4([1,2,3], 4)', expected: '7' },
      { input: 'combinationSum4([9], 3)', expected: '0' },
      { input: 'combinationSum4([1,2], 3)', expected: '3' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-12',
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    pattern,
    description:
      'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.',
    examples: [
      'Input: text1 = "abcde", text2 = "ace"\nOutput: 3\nExplanation: The longest common subsequence is "ace" and its length is 3.',
      'Input: text1 = "abc", text2 = "abc"\nOutput: 3\nExplanation: The longest common subsequence is "abc" and its length is 3.',
      'Input: text1 = "abc", text2 = "def"\nOutput: 0\nExplanation: There is no such common subsequence, so the result is 0.',
    ],
    constraints: [
      '1 <= text1.length, text2.length <= 1000',
      'text1 and text2 consist of only lowercase English characters.',
    ],
    starterCode: `function longestCommonSubsequence(text1: string, text2: string): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'longestCommonSubsequence("abcde", "ace")', expected: '3' },
      { input: 'longestCommonSubsequence("abc", "abc")', expected: '3' },
      { input: 'longestCommonSubsequence("abc", "def")', expected: '0' },
    ],
  },
];

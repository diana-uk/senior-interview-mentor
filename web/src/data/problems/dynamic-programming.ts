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
    starterCode: {
      typescript: `function lengthOfLIS(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def length_of_lis(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function minDistance(word1: string, word2: string): number {\n  // Your solution here\n  \n}`,
      python: `def min_distance(word1: str, word2: str) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function coinChange(coins: number[], amount: number): number {\n  // Your solution here\n  \n}`,
      python: `def coin_change(coins: list[int], amount: int) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function wordBreak(s: string, wordDict: string[]): boolean {\n  // Your solution here\n  \n}`,
      python: `def word_break(s: str, word_dict: list[str]) -> bool:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function rob(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def rob(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function robII(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def rob_ii(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function numDecodings(s: string): number {\n  // Your solution here\n  \n}`,
      python: `def num_decodings(s: str) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function uniquePaths(m: number, n: number): number {\n  // Your solution here\n  \n}`,
      python: `def unique_paths(m: int, n: int) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function canJump(nums: number[]): boolean {\n  // Your solution here\n  \n}`,
      python: `def can_jump(nums: list[int]) -> bool:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function combinationSum4(nums: number[], target: number): number {\n  // Your solution here\n  \n}`,
      python: `def combination_sum4(nums: list[int], target: int) -> int:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript: `function longestCommonSubsequence(text1: string, text2: string): number {\n  // Your solution here\n  \n}`,
      python: `def longest_common_subsequence(text1: str, text2: str) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'longestCommonSubsequence("abcde", "ace")', expected: '3' },
      { input: 'longestCommonSubsequence("abc", "abc")', expected: '3' },
      { input: 'longestCommonSubsequence("abc", "def")', expected: '0' },
    ],
  },

  // ═══════════════════════════════════════════
  // NeetCode 150 — additional 1-D DP
  // ═══════════════════════════════════════════
  {
    group: 'Dynamic Programming',
    id: 'dp-13',
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    pattern,
    description:
      'You are given an integer array `cost` where `cost[i]` is the cost of `ith` step on a staircase. Once you pay the cost, you can either climb one or two steps.\n\nYou can either start from the step with index `0`, or the step with index `1`.\n\nReturn the minimum cost to reach the top of the floor.',
    examples: [
      'Input: cost = [10,15,20]\nOutput: 15\nExplanation: You will start at index 1. Pay 15 and climb two steps to reach the top.',
      'Input: cost = [1,100,1,1,1,100,1,1,100,1]\nOutput: 6',
    ],
    constraints: [
      '2 <= cost.length <= 1000',
      '0 <= cost[i] <= 999',
    ],
    starterCode: {
      typescript: `function minCostClimbingStairs(cost: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def min_cost_climbing_stairs(cost: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'minCostClimbingStairs([10,15,20])', expected: '15' },
      { input: 'minCostClimbingStairs([1,100,1,1,1,100,1,1,100,1])', expected: '6' },
      { input: 'minCostClimbingStairs([0,0,0,1])', expected: '0' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-14',
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums`, return `true` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or `false` otherwise.',
    examples: [
      'Input: nums = [1,5,11,5]\nOutput: true\nExplanation: The array can be partitioned as [1, 5, 5] and [11].',
      'Input: nums = [1,2,3,5]\nOutput: false\nExplanation: The array cannot be partitioned into equal sum subsets.',
    ],
    constraints: [
      '1 <= nums.length <= 200',
      '1 <= nums[i] <= 100',
    ],
    starterCode: {
      typescript: `function canPartition(nums: number[]): boolean {\n  // Your solution here\n  \n}`,
      python: `def can_partition(nums: list[int]) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'canPartition([1,5,11,5])', expected: 'true' },
      { input: 'canPartition([1,2,3,5])', expected: 'false' },
      { input: 'canPartition([1,1])', expected: 'true' },
    ],
  },

  // ═══════════════════════════════════════════
  // NeetCode 150 — 2-D DP
  // ═══════════════════════════════════════════
  {
    group: 'Dynamic Programming',
    id: 'dp-15',
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.\n\nFind the maximum profit you can achieve. You may complete as many transactions as you like (i.e., buy one and sell one share of the stock multiple times) with the following restrictions:\n- After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).\n\nNote: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).',
    examples: [
      'Input: prices = [1,2,3,0,2]\nOutput: 3\nExplanation: transactions = [buy, sell, cooldown, buy, sell]',
      'Input: prices = [1]\nOutput: 0',
    ],
    constraints: [
      '1 <= prices.length <= 5000',
      '0 <= prices[i] <= 1000',
    ],
    starterCode: {
      typescript: `function maxProfitCooldown(prices: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_profit_cooldown(prices: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxProfitCooldown([1,2,3,0,2])', expected: '3' },
      { input: 'maxProfitCooldown([1])', expected: '0' },
      { input: 'maxProfitCooldown([1,2,4])', expected: '3' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-16',
    title: 'Coin Change II',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return `0`.\n\nYou may assume that you have an infinite number of each kind of coin.',
    examples: [
      'Input: amount = 5, coins = [1,2,5]\nOutput: 4\nExplanation: there are four ways to make up the amount:\n5=5\n5=2+2+1\n5=2+1+1+1\n5=1+1+1+1+1',
      'Input: amount = 3, coins = [2]\nOutput: 0',
      'Input: amount = 10, coins = [10]\nOutput: 1',
    ],
    constraints: [
      '1 <= coins.length <= 300',
      '1 <= coins[i] <= 5000',
      'All the values of coins are unique.',
      '0 <= amount <= 5000',
    ],
    starterCode: {
      typescript: `function change(amount: number, coins: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def change(amount: int, coins: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'change(5, [1,2,5])', expected: '4' },
      { input: 'change(3, [2])', expected: '0' },
      { input: 'change(10, [10])', expected: '1' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-17',
    title: 'Target Sum',
    difficulty: 'Medium',
    pattern,
    description:
      "You are given an integer array `nums` and an integer `target`.\n\nYou want to build an expression out of nums by adding one of the symbols `'+'` and `'-'` before each integer in nums and then concatenate all the integers.\n\nReturn the number of different expressions that you can build, which evaluates to `target`.",
    examples: [
      'Input: nums = [1,1,1,1,1], target = 3\nOutput: 5\nExplanation: There are 5 ways to assign symbols to make the sum equal 3.',
      'Input: nums = [1], target = 1\nOutput: 1',
    ],
    constraints: [
      '1 <= nums.length <= 20',
      '0 <= nums[i] <= 1000',
      '0 <= sum(nums[i]) <= 1000',
      '-1000 <= target <= 1000',
    ],
    starterCode: {
      typescript: `function findTargetSumWays(nums: number[], target: number): number {\n  // Your solution here\n  \n}`,
      python: `def find_target_sum_ways(nums: list[int], target: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'findTargetSumWays([1,1,1,1,1], 3)', expected: '5' },
      { input: 'findTargetSumWays([1], 1)', expected: '1' },
      { input: 'findTargetSumWays([1,0], 1)', expected: '2' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-18',
    title: 'Interleaving String',
    difficulty: 'Medium',
    pattern,
    description:
      'Given strings `s1`, `s2`, and `s3`, find whether `s3` is formed by an interleaving of `s1` and `s2`.\n\nAn interleaving of two strings `s` and `t` uses all characters from both strings while maintaining their relative order.',
    examples: [
      'Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"\nOutput: true',
      'Input: s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"\nOutput: false',
      'Input: s1 = "", s2 = "", s3 = ""\nOutput: true',
    ],
    constraints: [
      '0 <= s1.length, s2.length <= 100',
      '0 <= s3.length <= 200',
      's1, s2, and s3 consist of lowercase English letters.',
    ],
    starterCode: {
      typescript: `function isInterleave(s1: string, s2: string, s3: string): boolean {\n  // Your solution here\n  \n}`,
      python: `def is_interleave(s1: str, s2: str, s3: str) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'isInterleave("aabcc", "dbbca", "aadbbcbcac")', expected: 'true' },
      { input: 'isInterleave("aabcc", "dbbca", "aadbbbaccc")', expected: 'false' },
      { input: 'isInterleave("", "", "")', expected: 'true' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-19',
    title: 'Longest Increasing Path in a Matrix',
    difficulty: 'Hard',
    pattern,
    description:
      'Given an `m x n` integers `matrix`, return the length of the longest increasing path in `matrix`.\n\nFrom each cell, you can either move in four directions: left, right, up, or down. You may not move diagonally or move outside the boundary.',
    examples: [
      'Input: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4\nExplanation: The longest increasing path is [1, 2, 6, 9].',
      'Input: matrix = [[3,4,5],[3,2,6],[2,2,1]]\nOutput: 4',
      'Input: matrix = [[1]]\nOutput: 1',
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[i].length',
      '1 <= m, n <= 200',
      '0 <= matrix[i][j] <= 2^31 - 1',
    ],
    starterCode: {
      typescript: `function longestIncreasingPath(matrix: number[][]): number {\n  // Your solution here\n  \n}`,
      python: `def longest_increasing_path(matrix: list[list[int]]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'longestIncreasingPath([[9,9,4],[6,6,8],[2,1,1]])', expected: '4' },
      { input: 'longestIncreasingPath([[3,4,5],[3,2,6],[2,2,1]])', expected: '4' },
      { input: 'longestIncreasingPath([[1]])', expected: '1' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-20',
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    pattern,
    description:
      'Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equals `t`.\n\nThe test cases are generated so that the answer fits on a 32-bit signed integer.',
    examples: [
      'Input: s = "rabbbit", t = "rabbit"\nOutput: 3',
      'Input: s = "babgbag", t = "bag"\nOutput: 5',
    ],
    constraints: [
      '1 <= s.length, t.length <= 1000',
      's and t consist of English letters.',
    ],
    starterCode: {
      typescript: `function numDistinct(s: string, t: string): number {\n  // Your solution here\n  \n}`,
      python: `def num_distinct(s: str, t: str) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'numDistinct("rabbbit", "rabbit")', expected: '3' },
      { input: 'numDistinct("babgbag", "bag")', expected: '5' },
      { input: 'numDistinct("a", "a")', expected: '1' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-21',
    title: 'Burst Balloons',
    difficulty: 'Hard',
    pattern,
    description:
      'You are given `n` balloons, indexed from `0` to `n - 1`. Each balloon is painted with a number on it represented by an array `nums`. You are asked to burst all the balloons.\n\nIf you burst the `ith` balloon, you will get `nums[i - 1] * nums[i] * nums[i + 1]` coins. If `i - 1` or `i + 1` goes out of bounds of the array, then treat it as if there is a balloon with a `1` painted on it.\n\nReturn the maximum coins you can collect by bursting the balloons wisely.',
    examples: [
      'Input: nums = [3,1,5,8]\nOutput: 167\nExplanation:\nnums = [3,1,5,8] --> [3,5,8] --> [3,8] --> [8] --> []\ncoins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167',
      'Input: nums = [1,5]\nOutput: 10',
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 300',
      '0 <= nums[i] <= 100',
    ],
    starterCode: {
      typescript: `function maxCoins(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def max_coins(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'maxCoins([3,1,5,8])', expected: '167' },
      { input: 'maxCoins([1,5])', expected: '10' },
      { input: 'maxCoins([5])', expected: '5' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-22',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    pattern,
    description:
      "Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'` where:\n- `'.'` Matches any single character.\n- `'*'` Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
    examples: [
      'Input: s = "aa", p = "a"\nOutput: false',
      'Input: s = "aa", p = "a*"\nOutput: true',
      'Input: s = "ab", p = ".*"\nOutput: true',
    ],
    constraints: [
      '1 <= s.length <= 20',
      '1 <= p.length <= 20',
      's contains only lowercase English letters.',
      "p contains only lowercase English letters, '.', and '*'.",
      "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match.",
    ],
    starterCode: {
      typescript: `function isMatch(s: string, p: string): boolean {\n  // Your solution here\n  \n}`,
      python: `def is_match(s: str, p: str) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'isMatch("aa", "a")', expected: 'false' },
      { input: 'isMatch("aa", "a*")', expected: 'true' },
      { input: 'isMatch("ab", ".*")', expected: 'true' },
    ],
  },
  {
    group: 'Dynamic Programming',
    id: 'dp-23',
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums`, find a subarray that has the largest product, and return the product.\n\nThe test cases are generated so that the answer fits in a 32-bit integer.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
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

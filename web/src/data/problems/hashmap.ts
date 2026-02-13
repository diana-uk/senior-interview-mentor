import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'HashMap';

export const hashmapProblems: FullProblem[] = [
  {
    group: 'HashMap',
    id: 'hm-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    pattern,
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: ['Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`,
      javascript: `function twoSum(nums, target) {\n  // Your solution here\n  \n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' },
      { input: 'twoSum([3,2,4], 6)', expected: '[1,2]' },
      { input: 'twoSum([3,3], 6)', expected: '[0,1]' },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-2',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.',
    examples: [
      'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]',
      'Input: strs = [""]\nOutput: [[""]]',
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    starterCode: `function groupAnagrams(strs: string[]): string[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'groupAnagrams(["eat","tea","tan","ate","nat","bat"]).map(g => [...g].sort())',
        expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      },
      {
        input: 'groupAnagrams([""]).map(g => [...g].sort())',
        expected: '[[""]]',
      },
      {
        input: 'groupAnagrams(["a"]).map(g => [...g].sort())',
        expected: '[["a"]]',
      },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-3',
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in `O(n)` time.',
    examples: [
      'Input: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive sequence is [1, 2, 3, 4]. Its length is 4.',
      'Input: nums = [0,3,7,2,5,8,4,6,0,1]\nOutput: 9',
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    starterCode: `function longestConsecutive(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'longestConsecutive([100,4,200,1,3,2])', expected: '4' },
      { input: 'longestConsecutive([0,3,7,2,5,8,4,6,0,1])', expected: '9' },
      { input: 'longestConsecutive([])', expected: '0' },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-4',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    pattern,
    description:
      'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples: [
      'Input: nums = [1,2,3,1]\nOutput: true',
      'Input: nums = [1,2,3,4]\nOutput: false',
      'Input: nums = [1,1,1,3,3,4,3,2,4,2]\nOutput: true',
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    starterCode: `function containsDuplicate(nums: number[]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'containsDuplicate([1,2,3,1])', expected: 'true' },
      { input: 'containsDuplicate([1,2,3,4])', expected: 'false' },
      { input: 'containsDuplicate([1,1,1,3,3,4,3,2,4,2])', expected: 'true' },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-5',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    pattern,
    description:
      'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    examples: [
      'Input: s = "anagram", t = "nagaram"\nOutput: true',
      'Input: s = "rat", t = "car"\nOutput: false',
    ],
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    starterCode: `function isAnagram(s: string, t: string): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isAnagram("anagram", "nagaram")', expected: 'true' },
      { input: 'isAnagram("rat", "car")', expected: 'false' },
      { input: 'isAnagram("a", "ab")', expected: 'false' },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-6',
    title: 'Encode and Decode Strings',
    difficulty: 'Medium',
    pattern,
    description:
      'Design an algorithm to encode a list of strings to a single string. The encoded string is then decoded back to the original list of strings.\n\nImplement `encode` and `decode` functions.',
    examples: [
      'Input: strs = ["lint","code","love","you"]\nEncoded: "4#lint4#code4#love3#you"\nOutput: ["lint","code","love","you"]',
      'Input: strs = ["we","say",":","yes"]\nOutput: ["we","say",":","yes"]',
    ],
    constraints: [
      '0 <= strs.length <= 200',
      '0 <= strs[i].length <= 200',
      'strs[i] contains any possible characters out of 256 valid ASCII characters.',
    ],
    starterCode: `function encode(strs: string[]): string {\n  // Your solution here\n  \n}\n\nfunction decode(s: string): string[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'JSON.stringify(decode(encode(["lint","code","love","you"])))', expected: 'JSON.stringify(["lint","code","love","you"])' },
      { input: 'JSON.stringify(decode(encode(["we","say",":","yes"])))', expected: 'JSON.stringify(["we","say",":","yes"])' },
      { input: 'JSON.stringify(decode(encode([""])))', expected: 'JSON.stringify([""])' },
    ],
  },
  {
    group: 'HashMap',
    id: 'hm-7',
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    pattern,
    description:
      'Determine if a `9 x 9` Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n\n1. Each row must contain the digits `1-9` without repetition.\n2. Each column must contain the digits `1-9` without repetition.\n3. Each of the nine `3 x 3` sub-boxes of the grid must contain the digits `1-9` without repetition.\n\nNote: A Sudoku board (partially filled) could be valid but is not necessarily solvable. Only the filled cells need to be validated.',
    examples: [
      'Input: board =\n[["5","3",".",".","7",".",".",".","."]\n,["6",".",".","1","9","5",".",".","."]\n,[".","9","8",".",".",".",".","6","."]\n,["8",".",".",".","6",".",".",".","3"]\n,["4",".",".","8",".","3",".",".","1"]\n,["7",".",".",".","2",".",".",".","6"]\n,[".","6",".",".",".",".","2","8","."]\n,[".",".",".","4","1","9",".",".","5"]\n,[".",".",".",".","8",".",".","7","9"]]\nOutput: true',
      'Input: board (with duplicate "8" in first column)\nOutput: false',
    ],
    constraints: [
      'board.length == 9',
      'board[i].length == 9',
      'board[i][j] is a digit 1-9 or \'.\'.',
    ],
    starterCode: `function isValidSudoku(board: string[][]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'isValidSudoku([["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]])',
        expected: 'true',
      },
      {
        input: 'isValidSudoku([["8","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]])',
        expected: 'false',
      },
    ],
  },
];

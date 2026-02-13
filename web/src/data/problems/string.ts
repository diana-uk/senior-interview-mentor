import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const stringProblems: FullProblem[] = [
  {
    group: 'String',
    id: 'st-1',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    pattern: 'Two Pointers' as PatternName,
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    examples: [
      'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: "amanaplanacanalpanama" is a palindrome.',
      'Input: s = "race a car"\nOutput: false\nExplanation: "raceacar" is not a palindrome.',
      'Input: s = " "\nOutput: true\nExplanation: s is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.',
    ],
    starterCode: `function isPalindrome(s: string): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isPalindrome("A man, a plan, a canal: Panama")', expected: 'true' },
      { input: 'isPalindrome("race a car")', expected: 'false' },
      { input: 'isPalindrome(" ")', expected: 'true' },
    ],
  },
  {
    group: 'String',
    id: 'st-2',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    pattern: 'Dynamic Programming' as PatternName,
    description:
      'Given a string `s`, return the longest palindromic substring in `s.',
    examples: [
      'Input: s = "babad"\nOutput: "bab"\nExplanation: "aba" is also a valid answer.',
      'Input: s = "cbbd"\nOutput: "bb"',
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.',
    ],
    starterCode: `function longestPalindrome(s: string): string {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: '["bab","aba"].includes(longestPalindrome("babad"))', expected: 'true' },
      { input: 'longestPalindrome("cbbd")', expected: '"bb"' },
      { input: 'longestPalindrome("a")', expected: '"a"' },
    ],
  },
  {
    group: 'String',
    id: 'st-3',
    title: 'Palindromic Substrings',
    difficulty: 'Medium',
    pattern: 'Dynamic Programming' as PatternName,
    description:
      'Given a string `s`, return the number of palindromic substrings in it.\n\nA string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string.',
    examples: [
      'Input: s = "abc"\nOutput: 3\nExplanation: Three palindromic strings: "a", "b", "c".',
      'Input: s = "aaa"\nOutput: 6\nExplanation: Six palindromic strings: "a", "a", "a", "aa", "aa", "aaa".',
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consists of lowercase English letters.',
    ],
    starterCode: `function countSubstrings(s: string): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'countSubstrings("abc")', expected: '3' },
      { input: 'countSubstrings("aaa")', expected: '6' },
      { input: 'countSubstrings("abba")', expected: '6' },
    ],
  },
  {
    group: 'String',
    id: 'st-4',
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    pattern: 'Sliding Window' as PatternName,
    description:
      'You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English letter. You can perform this operation at most `k` times.\n\nReturn the length of the longest substring containing the same letter you can get after performing the above operations.',
    examples: [
      'Input: s = "ABAB", k = 2\nOutput: 4\nExplanation: Replace the two \'A\'s with two \'B\'s or vice versa.',
      'Input: s = "AABABBA", k = 1\nOutput: 4\nExplanation: Replace the one \'A\' in the middle with \'B\' and form "AABBBBA". The substring "BBBB" has the longest repeating letters, which is 4. There may exist other ways to achieve this answer too.',
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's consists of only uppercase English letters.',
      '0 <= k <= s.length',
    ],
    starterCode: `function characterReplacement(s: string, k: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'characterReplacement("ABAB", 2)', expected: '4' },
      { input: 'characterReplacement("AABABBA", 1)', expected: '4' },
      { input: 'characterReplacement("AAAA", 2)', expected: '4' },
    ],
  },
];

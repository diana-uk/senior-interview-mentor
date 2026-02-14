import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const bitManipulationProblems: FullProblem[] = [
  {
    group: 'Bit Manipulation',
    id: 'bm-1',
    title: 'Number of 1 Bits',
    difficulty: 'Easy',
    pattern: 'Binary Search' as PatternName,
    description:
      'Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).\n\nFor example, the 32-bit integer `11` has binary representation `00000000000000000000000000001011`, so the function should return `3`.',
    examples: [
      'Input: n = 11\nOutput: 3\nExplanation: The input binary string 1011 has a total of three set bits.',
      'Input: n = 128\nOutput: 1\nExplanation: The input binary string 10000000 has a total of one set bit.',
      'Input: n = 2147483645\nOutput: 30',
    ],
    constraints: [
      '1 <= n <= 2^31 - 1',
    ],
    starterCode: {
      typescript: `function hammingWeight(n: number): number {\n  // Your solution here\n  \n}`,
      python: `def hamming_weight(n: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'hammingWeight(11)', expected: '3' },
      { input: 'hammingWeight(128)', expected: '1' },
      { input: 'hammingWeight(2147483645)', expected: '30' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-2',
    title: 'Counting Bits',
    difficulty: 'Easy',
    pattern: 'Dynamic Programming' as PatternName,
    description:
      'Given an integer `n`, return an array `ans` of length `n + 1` such that for each `i` (`0 <= i <= n`), `ans[i]` is the number of `1`\'s in the binary representation of `i`.\n\nFollow up: Can you do it in linear time `O(n)` and without using any builtin function (like `__builtin_popcount` in C++)?',
    examples: [
      'Input: n = 2\nOutput: [0,1,1]\nExplanation:\n0 --> 0\n1 --> 1\n2 --> 10',
      'Input: n = 5\nOutput: [0,1,1,2,1,2]\nExplanation:\n0 --> 0\n1 --> 1\n2 --> 10\n3 --> 11\n4 --> 100\n5 --> 101',
    ],
    constraints: [
      '0 <= n <= 10^5',
    ],
    starterCode: {
      typescript: `function countBits(n: number): number[] {\n  // Your solution here\n  \n}`,
      python: `def count_bits(n: int) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'countBits(2)', expected: '[0,1,1]' },
      { input: 'countBits(5)', expected: '[0,1,1,2,1,2]' },
      { input: 'countBits(0)', expected: '[0]' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-3',
    title: 'Missing Number',
    difficulty: 'Easy',
    pattern: 'HashMap' as PatternName,
    description:
      'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.\n\nFollow up: Could you implement a solution using only `O(1)` extra space complexity and `O(n)` runtime complexity?',
    examples: [
      'Input: nums = [3,0,1]\nOutput: 2\nExplanation: n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number since it does not appear in nums.',
      'Input: nums = [0,1]\nOutput: 2\nExplanation: n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is the missing number since it does not appear in nums.',
      'Input: nums = [9,6,4,2,3,5,7,0,1]\nOutput: 8\nExplanation: n = 9 since there are 9 numbers, so all numbers are in the range [0,9]. 8 is the missing number since it does not appear in nums.',
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 10^4',
      '0 <= nums[i] <= n',
      'All the numbers of nums are unique.',
    ],
    starterCode: {
      typescript: `function missingNumber(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def missing_number(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'missingNumber([3,0,1])', expected: '2' },
      { input: 'missingNumber([0,1])', expected: '2' },
      { input: 'missingNumber([9,6,4,2,3,5,7,0,1])', expected: '8' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-4',
    title: 'Reverse Bits',
    difficulty: 'Easy',
    pattern: 'Binary Search' as PatternName,
    description:
      'Reverse bits of a given 32 bits unsigned integer.\n\nNote that in some languages, such as Java, there is no unsigned integer type. In this case, both input and output will be given as a signed integer type. They should not affect your implementation, as the integer\'s internal binary representation is the same, whether it is signed or unsigned.',
    examples: [
      'Input: n = 43261596 (00000010100101000001111010011100)\nOutput: 964176192 (00111001011110000010100101000000)',
      'Input: n = 4294967293 (11111111111111111111111111111101)\nOutput: 3221225471 (10111111111111111111111111111111)',
    ],
    constraints: [
      'The input must be a binary string of length 32.',
    ],
    starterCode: {
      typescript: `function reverseBits(n: number): number {\n  // Your solution here\n  \n}`,
      python: `def reverse_bits(n: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'reverseBits(43261596)', expected: '964176192' },
      { input: 'reverseBits(4294967293)', expected: '3221225471' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-5',
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    pattern: 'Binary Search' as PatternName,
    description:
      'Given two integers `a` and `b`, return the sum of the two integers without using the operators `+` and `-`.\n\nHint: Think about how addition works at the bit level. XOR gives you the sum without carries, and AND shifted left gives you the carries.',
    examples: [
      'Input: a = 1, b = 2\nOutput: 3',
      'Input: a = 2, b = 3\nOutput: 5',
    ],
    constraints: [
      '-1000 <= a, b <= 1000',
    ],
    starterCode: {
      typescript: `function getSum(a: number, b: number): number {\n  // Your solution here\n  \n}`,
      python: `def get_sum(a: int, b: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'getSum(1,2)', expected: '3' },
      { input: 'getSum(2,3)', expected: '5' },
      { input: 'getSum(-1,1)', expected: '0' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-6',
    title: 'Single Number',
    difficulty: 'Easy',
    pattern: 'Bit Manipulation' as PatternName,
    description:
      'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.',
    examples: [
      'Input: nums = [2,2,1]\nOutput: 1',
      'Input: nums = [4,1,2,1,2]\nOutput: 4',
      'Input: nums = [1]\nOutput: 1',
    ],
    constraints: [
      '1 <= nums.length <= 3 * 10^4',
      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
      'Each element in the array appears twice except for one element which appears only once.',
    ],
    starterCode: {
      typescript: `function singleNumber(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def single_number(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'singleNumber([2,2,1])', expected: '1' },
      { input: 'singleNumber([4,1,2,1,2])', expected: '4' },
      { input: 'singleNumber([1])', expected: '1' },
    ],
  },
  {
    group: 'Bit Manipulation',
    id: 'bm-7',
    title: 'Reverse Integer',
    difficulty: 'Medium',
    pattern: 'Bit Manipulation' as PatternName,
    description:
      'Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return `0`.\n\nAssume the environment does not allow you to store 64-bit integers (signed or unsigned).',
    examples: [
      'Input: x = 123\nOutput: 321',
      'Input: x = -123\nOutput: -321',
      'Input: x = 120\nOutput: 21',
    ],
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    starterCode: {
      typescript: `function reverse(x: number): number {\n  // Your solution here\n  \n}`,
      python: `def reverse(x: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'reverse(123)', expected: '321' },
      { input: 'reverse(-123)', expected: '-321' },
      { input: 'reverse(120)', expected: '21' },
    ],
  },
];

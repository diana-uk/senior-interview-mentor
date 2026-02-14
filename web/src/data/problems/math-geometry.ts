import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const mathGeometryProblems: FullProblem[] = [
  {
    group: 'Math & Geometry',
    id: 'mg-1',
    title: 'Happy Number',
    difficulty: 'Easy',
    pattern: 'HashMap' as PatternName,
    description:
      'Write an algorithm to determine if a number `n` is happy.\n\nA happy number is a number defined by the following process:\n- Starting with any positive integer, replace the number by the sum of the squares of its digits.\n- Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.\n- Those numbers for which this process ends in 1 are happy.\n\nReturn `true` if `n` is a happy number, and `false` if not.',
    examples: [
      'Input: n = 19\nOutput: true\nExplanation:\n1^2 + 9^2 = 82\n8^2 + 2^2 = 68\n6^2 + 8^2 = 100\n1^2 + 0^2 + 0^2 = 1',
      'Input: n = 2\nOutput: false',
    ],
    constraints: ['1 <= n <= 2^31 - 1'],
    starterCode: {
      typescript: `function isHappy(n: number): boolean {\n  // Your solution here\n  \n}`,
      python: `def is_happy(n: int) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'isHappy(19)', expected: 'true' },
      { input: 'isHappy(2)', expected: 'false' },
      { input: 'isHappy(1)', expected: 'true' },
    ],
  },
  {
    group: 'Math & Geometry',
    id: 'mg-2',
    title: 'Plus One',
    difficulty: 'Easy',
    pattern: 'Two Pointers' as PatternName,
    description:
      'You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `ith` digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading `0`\'s.\n\nIncrement the large integer by one and return the resulting array of digits.',
    examples: [
      'Input: digits = [1,2,3]\nOutput: [1,2,4]\nExplanation: The array represents the integer 123. Incrementing by one gives 123 + 1 = 124.',
      'Input: digits = [4,3,2,1]\nOutput: [4,3,2,2]',
      'Input: digits = [9]\nOutput: [1,0]',
    ],
    constraints: [
      '1 <= digits.length <= 100',
      '0 <= digits[i] <= 9',
      'digits does not contain any leading 0\'s.',
    ],
    starterCode: {
      typescript: `function plusOne(digits: number[]): number[] {\n  // Your solution here\n  \n}`,
      python: `def plus_one(digits: list[int]) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'plusOne([1,2,3])', expected: '[1,2,4]' },
      { input: 'plusOne([4,3,2,1])', expected: '[4,3,2,2]' },
      { input: 'plusOne([9])', expected: '[1,0]' },
    ],
  },
  {
    group: 'Math & Geometry',
    id: 'mg-3',
    title: 'Pow(x, n)',
    difficulty: 'Medium',
    pattern: 'Binary Search' as PatternName,
    description:
      'Implement `pow(x, n)`, which calculates `x` raised to the power `n` (i.e., `x^n`).',
    examples: [
      'Input: x = 2.00000, n = 10\nOutput: 1024.00000',
      'Input: x = 2.10000, n = 3\nOutput: 9.26100',
      'Input: x = 2.00000, n = -2\nOutput: 0.25000\nExplanation: 2^-2 = 1/2^2 = 1/4 = 0.25',
    ],
    constraints: [
      '-100.0 < x < 100.0',
      '-2^31 <= n <= 2^31 - 1',
      'n is an integer.',
      'Either x is not zero or n > 0.',
      '-10^4 <= x^n <= 10^4',
    ],
    starterCode: {
      typescript: `function myPow(x: number, n: number): number {\n  // Your solution here\n  \n}`,
      python: `def my_pow(x: float, n: int) -> float:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'myPow(2.0, 10)', expected: '1024' },
      { input: 'Number(myPow(2.1, 3).toFixed(5))', expected: '9.261' },
      { input: 'myPow(2.0, -2)', expected: '0.25' },
    ],
  },
  {
    group: 'Math & Geometry',
    id: 'mg-4',
    title: 'Multiply Strings',
    difficulty: 'Medium',
    pattern: 'Two Pointers' as PatternName,
    description:
      'Given two non-negative integers `num1` and `num2` represented as strings, return the product of `num1` and `num2`, also represented as a string.\n\nNote: You must not use any built-in BigInteger library or convert the inputs to integer directly.',
    examples: [
      'Input: num1 = "2", num2 = "3"\nOutput: "6"',
      'Input: num1 = "123", num2 = "456"\nOutput: "56088"',
    ],
    constraints: [
      '1 <= num1.length, num2.length <= 200',
      'num1 and num2 consist of digits only.',
      'Both num1 and num2 do not contain any leading zero, except the number 0 itself.',
    ],
    starterCode: {
      typescript: `function multiply(num1: string, num2: string): string {\n  // Your solution here\n  \n}`,
      python: `def multiply(num1: str, num2: str) -> str:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'multiply("2", "3")', expected: '"6"' },
      { input: 'multiply("123", "456")', expected: '"56088"' },
      { input: 'multiply("0", "52")', expected: '"0"' },
    ],
  },
  {
    group: 'Math & Geometry',
    id: 'mg-5',
    title: 'Detect Squares',
    difficulty: 'Medium',
    pattern: 'HashMap' as PatternName,
    description:
      'You are given a stream of points on the X-Y plane. Design a data structure that:\n\n- Adds new points from the stream into a data structure. Duplicate points are allowed and should be treated as different points.\n- Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an axis-aligned square with positive area.',
    examples: [
      'Input:\n["DetectSquares", "add", "add", "add", "count", "count", "add", "count"]\n[[], [[3,10]], [[11,1]], [[3,1]], [[11,10]], [[14,8]], [[11,10]], [[11,10]]]\nOutput: [null, null, null, null, 1, 0, null, 2]',
    ],
    constraints: [
      'point.length == 2',
      '0 <= x, y <= 1000',
      'At most 3000 calls in total will be made to add and count.',
    ],
    starterCode: {
      typescript: `class DetectSquares {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  add(point: number[]): void {\n    // Your solution here\n  }\n\n  count(point: number[]): number {\n    // Your solution here\n  }\n}`,
      python: `class DetectSquares:\n    def __init__(self):\n        # Initialize your data structure here\n        pass\n\n    def add(self, point: list[int]) -> None:\n        # Your solution here\n        pass\n\n    def count(self, point: list[int]) -> int:\n        # Your solution here\n        pass`,
    },
    testCases: [
      {
        input:
          '(() => { const ds = new DetectSquares(); ds.add([3,10]); ds.add([11,1]); ds.add([3,1]); return ds.count([11,10]); })()',
        expected: '1',
      },
      {
        input:
          '(() => { const ds = new DetectSquares(); ds.add([3,10]); ds.add([11,1]); ds.add([3,1]); return ds.count([14,8]); })()',
        expected: '0',
      },
      {
        input:
          '(() => { const ds = new DetectSquares(); ds.add([3,10]); ds.add([11,1]); ds.add([3,1]); ds.add([11,10]); return ds.count([11,10]); })()',
        expected: '2',
      },
    ],
  },
];

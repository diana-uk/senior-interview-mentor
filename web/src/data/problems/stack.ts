import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const stackProblems: FullProblem[] = [
  {
    group: 'Stack',
    id: 'sk-1',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    pattern: 'HashMap' as PatternName,
    description:
      'Given a string `s` containing just the characters `\'(\'`, `\')\'`, `\'{\'`, `\'}\'`, `\'[\'` and `\']\'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      'Input: s = "()"\nOutput: true',
      'Input: s = "()[]{}"\nOutput: true',
      'Input: s = "(]"\nOutput: false',
      'Input: s = "([)]"\nOutput: false',
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: {
      typescript: `function isValid(s: string): boolean {\n  // Your solution here\n  \n}`,
      python: `def is_valid(s: str) -> bool:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'isValid("()")', expected: 'true' },
      { input: 'isValid("()[]{}")', expected: 'true' },
      { input: 'isValid("(]")', expected: 'false' },
      { input: 'isValid("([)]")', expected: 'false' },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-2',
    title: 'Min Stack',
    difficulty: 'Medium',
    pattern: 'Stack' as PatternName,
    description:
      'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nImplement the `MinStack` class:\n- `MinStack()` initializes the stack object.\n- `push(val)` pushes the element val onto the stack.\n- `pop()` removes the element on the top of the stack.\n- `top()` gets the top element of the stack.\n- `getMin()` retrieves the minimum element in the stack.\n\nYou must implement a solution with `O(1)` time complexity for each function.',
    examples: [
      'Input:\n["MinStack","push","push","push","getMin","pop","top","getMin"]\n[[],[-2],[0],[-3],[],[],[],[]]\nOutput: [null,null,null,null,-3,null,0,-2]',
    ],
    constraints: [
      '-2^31 <= val <= 2^31 - 1',
      'Methods pop, top and getMin operations will always be called on non-empty stacks.',
      'At most 3 * 10^4 calls will be made to push, pop, top, and getMin.',
    ],
    starterCode: {
      typescript: `class MinStack {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  push(val: number): void {\n    // Your solution here\n  }\n\n  pop(): void {\n    // Your solution here\n  }\n\n  top(): number {\n    // Your solution here\n  }\n\n  getMin(): number {\n    // Your solution here\n  }\n}`,
      python: `class MinStack:\n    def __init__(self):\n        # Initialize your data structure here\n        pass\n\n    def push(self, val: int) -> None:\n        # Your solution here\n        pass\n\n    def pop(self) -> None:\n        # Your solution here\n        pass\n\n    def top(self) -> int:\n        # Your solution here\n        pass\n\n    def get_min(self) -> int:\n        # Your solution here\n        pass`,
    },
    testCases: [
      {
        input:
          '(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); return s.getMin(); })()',
        expected: '-3',
      },
      {
        input:
          '(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); s.pop(); return s.top(); })()',
        expected: '0',
      },
      {
        input:
          '(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); s.pop(); return s.getMin(); })()',
        expected: '-2',
      },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-3',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    pattern: 'Stack' as PatternName,
    description:
      'You are given an array of strings `tokens` that represents an arithmetic expression in a Reverse Polish Notation.\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nNote that:\n- The valid operators are `+`, `-`, `*`, and `/`.\n- Each operand may be an integer or another expression.\n- The division between two integers always truncates toward zero.\n- There will not be any division by zero.\n- The input represents a valid arithmetic expression in reverse polish notation.',
    examples: [
      'Input: tokens = ["2","1","+","3","*"]\nOutput: 9\nExplanation: ((2 + 1) * 3) = 9',
      'Input: tokens = ["4","13","5","/","+"]\nOutput: 6\nExplanation: (4 + (13 / 5)) = 6',
      'Input: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]\nOutput: 22',
    ],
    constraints: [
      '1 <= tokens.length <= 10^4',
      'tokens[i] is either an operator: "+", "-", "*", or "/", or an integer in the range [-200, 200].',
    ],
    starterCode: {
      typescript: `function evalRPN(tokens: string[]): number {\n  // Your solution here\n  \n}`,
      python: `def eval_rpn(tokens: list[str]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'evalRPN(["2","1","+","3","*"])', expected: '9' },
      { input: 'evalRPN(["4","13","5","/","+"])', expected: '6' },
      { input: 'evalRPN(["10","6","9","3","+","-11","*","/","*","17","+","5","+"])', expected: '22' },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-4',
    title: 'Generate Parentheses',
    difficulty: 'Medium',
    pattern: 'Stack' as PatternName,
    description:
      'Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    examples: [
      'Input: n = 3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]',
      'Input: n = 1\nOutput: ["()"]',
    ],
    constraints: ['1 <= n <= 8'],
    starterCode: {
      typescript: `function generateParenthesis(n: number): string[] {\n  // Your solution here\n  \n}`,
      python: `def generate_parenthesis(n: int) -> list[str]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'generateParenthesis(3).length', expected: '5' },
      { input: 'generateParenthesis(1).length', expected: '1' },
      { input: 'generateParenthesis(4).length', expected: '14' },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-5',
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    pattern: 'Stack' as PatternName,
    description:
      'Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `ith` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.',
    examples: [
      'Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]',
      'Input: temperatures = [30,40,50,60]\nOutput: [1,1,1,0]',
      'Input: temperatures = [30,60,90]\nOutput: [1,1,0]',
    ],
    constraints: [
      '1 <= temperatures.length <= 10^5',
      '30 <= temperatures[i] <= 100',
    ],
    starterCode: {
      typescript: `function dailyTemperatures(temperatures: number[]): number[] {\n  // Your solution here\n  \n}`,
      python: `def daily_temperatures(temperatures: list[int]) -> list[int]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'dailyTemperatures([73,74,75,71,69,72,76,73])', expected: '[1,1,4,2,1,1,0,0]' },
      { input: 'dailyTemperatures([30,40,50,60])', expected: '[1,1,1,0]' },
      { input: 'dailyTemperatures([30,60,90])', expected: '[1,1,0]' },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-6',
    title: 'Car Fleet',
    difficulty: 'Medium',
    pattern: 'Stack' as PatternName,
    description:
      'There are `n` cars going to the same destination along a one-lane road. The destination is `target` miles away.\n\nYou are given two integer arrays `position` and `speed`, both of length `n`, where `position[i]` is the position of the `ith` car and `speed[i]` is the speed of the `ith` car (in miles per hour).\n\nA car can never pass another car ahead of it, but it can catch up to it and drive bumper to bumper at the same speed. A car fleet is some non-empty set of cars driving at the same position and same speed.\n\nReturn the number of car fleets that will arrive at the destination.',
    examples: [
      'Input: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]\nOutput: 3\nExplanation:\nCars starting at 10 (speed 2) and 8 (speed 4) become a fleet, meeting at 12.\nCar starting at 0 (speed 1) does not catch up.\nCars starting at 5 (speed 1) and 3 (speed 3) become a fleet, meeting at 6. Then it never catches car at position 10.',
      'Input: target = 10, position = [3], speed = [3]\nOutput: 1',
    ],
    constraints: [
      'n == position.length == speed.length',
      '1 <= n <= 10^5',
      '0 < target <= 10^6',
      '0 <= position[i] < target',
      '0 < speed[i] <= 10^6',
      'All the values of position are unique.',
    ],
    starterCode: {
      typescript: `function carFleet(target: number, position: number[], speed: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def car_fleet(target: int, position: list[int], speed: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'carFleet(12, [10,8,0,5,3], [2,4,1,1,3])', expected: '3' },
      { input: 'carFleet(10, [3], [3])', expected: '1' },
      { input: 'carFleet(100, [0,2,4], [4,2,1])', expected: '1' },
    ],
  },
  {
    group: 'Stack',
    id: 'sk-7',
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    pattern: 'Stack' as PatternName,
    description:
      "Given an array of integers `heights` representing the histogram's bar height where the width of each bar is `1`, return the area of the largest rectangle in the histogram.",
    examples: [
      'Input: heights = [2,1,5,6,2,3]\nOutput: 10\nExplanation: The largest rectangle has an area of 10 units (bars at index 2 and 3 with height 5).',
      'Input: heights = [2,4]\nOutput: 4',
    ],
    constraints: [
      '1 <= heights.length <= 10^5',
      '0 <= heights[i] <= 10^4',
    ],
    starterCode: {
      typescript: `function largestRectangleArea(heights: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def largest_rectangle_area(heights: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'largestRectangleArea([2,1,5,6,2,3])', expected: '10' },
      { input: 'largestRectangleArea([2,4])', expected: '4' },
      { input: 'largestRectangleArea([1])', expected: '1' },
    ],
  },
];

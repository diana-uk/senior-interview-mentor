import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Greedy';

export const greedyProblems: FullProblem[] = [
  {
    group: 'Greedy',
    id: 'gy-1',
    title: 'Jump Game II',
    difficulty: 'Medium',
    pattern,
    description:
      "You are given a 0-indexed array of integers `nums` of length `n`. You are initially positioned at `nums[0]`.\n\nEach element `nums[i]` represents the maximum length of a forward jump from index `i`. Return the minimum number of jumps to reach `nums[n - 1]`.\n\nIt's guaranteed that you can reach `nums[n - 1]`.",
    examples: [
      'Input: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.',
      'Input: nums = [2,3,0,1,4]\nOutput: 2',
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '0 <= nums[i] <= 1000',
      "It's guaranteed that you can reach nums[n - 1].",
    ],
    starterCode: `function jump(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'jump([2,3,1,1,4])', expected: '2' },
      { input: 'jump([2,3,0,1,4])', expected: '2' },
      { input: 'jump([1])', expected: '0' },
    ],
  },
  {
    group: 'Greedy',
    id: 'gy-2',
    title: 'Gas Station',
    difficulty: 'Medium',
    pattern,
    description:
      "There are `n` gas stations along a circular route, where the amount of gas at the `ith` station is `gas[i]`.\n\nYou have a car with an unlimited gas tank and it costs `cost[i]` of gas to travel from the `ith` station to its next `(i + 1)th` station. You begin the journey with an empty tank at one of the gas stations.\n\nGiven two integer arrays `gas` and `cost`, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return `-1`. If there exists a solution, it is guaranteed to be unique.",
    examples: [
      'Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3',
      'Input: gas = [2,3,4], cost = [3,4,3]\nOutput: -1',
    ],
    constraints: [
      'n == gas.length == cost.length',
      '1 <= n <= 10^5',
      '0 <= gas[i], cost[i] <= 10^4',
    ],
    starterCode: `function canCompleteCircuit(gas: number[], cost: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2])', expected: '3' },
      { input: 'canCompleteCircuit([2,3,4], [3,4,3])', expected: '-1' },
      { input: 'canCompleteCircuit([5,1,2,3,4], [4,4,1,5,1])', expected: '4' },
    ],
  },
  {
    group: 'Greedy',
    id: 'gy-3',
    title: 'Hand of Straights',
    difficulty: 'Medium',
    pattern,
    description:
      "Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size `groupSize`, and consists of `groupSize` consecutive cards.\n\nGiven an integer array `hand` where `hand[i]` is the value written on the `ith` card and an integer `groupSize`, return `true` if she can rearrange the cards, or `false` otherwise.",
    examples: [
      "Input: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: true\nExplanation: Alice's hand can be rearranged as [1,2,3],[2,3,4],[6,7,8]",
      "Input: hand = [1,2,3,4,5], groupSize = 4\nOutput: false",
    ],
    constraints: [
      '1 <= hand.length <= 10^4',
      '0 <= hand[i] <= 10^9',
      '1 <= groupSize <= hand.length',
    ],
    starterCode: `function isNStraightHand(hand: number[], groupSize: number): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isNStraightHand([1,2,3,6,2,3,4,7,8], 3)', expected: 'true' },
      { input: 'isNStraightHand([1,2,3,4,5], 4)', expected: 'false' },
      { input: 'isNStraightHand([1,2,3], 1)', expected: 'true' },
    ],
  },
  {
    group: 'Greedy',
    id: 'gy-4',
    title: 'Merge Triplets to Form Target Triplet',
    difficulty: 'Medium',
    pattern,
    description:
      'A triplet is an array of three integers. You are given a 2D integer array `triplets`, where `triplets[i] = [ai, bi, ci]` describes the `ith` triplet. You are also given an integer array `target = [x, y, z]`.\n\nTo obtain `target`, you may apply the following operation any number of times:\n- Choose two indices i and j (i != j) and update `triplets[j]` to become `[max(ai, aj), max(bi, bj), max(ci, cj)]`.\n\nReturn `true` if it is possible to obtain the target triplet as an element of `triplets`, or `false` otherwise.',
    examples: [
      'Input: triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]\nOutput: true',
      'Input: triplets = [[3,4,5],[4,5,6]], target = [3,2,5]\nOutput: false',
    ],
    constraints: [
      '1 <= triplets.length <= 10^5',
      'triplets[i].length == target.length == 3',
      '1 <= ai, bi, ci, x, y, z <= 1000',
    ],
    starterCode: `function mergeTriplets(triplets: number[][], target: number[]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'mergeTriplets([[2,5,3],[1,8,4],[1,7,5]], [2,7,5])', expected: 'true' },
      { input: 'mergeTriplets([[3,4,5],[4,5,6]], [3,2,5])', expected: 'false' },
      { input: 'mergeTriplets([[2,5,3],[2,3,4],[1,2,5],[5,2,3]], [5,5,5])', expected: 'true' },
    ],
  },
  {
    group: 'Greedy',
    id: 'gy-5',
    title: 'Partition Labels',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given a string `s`. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nNote that the partition is done so that after concatenating all the parts in order, the resultant string should be `s`.\n\nReturn a list of integers representing the size of these parts.',
    examples: [
      'Input: s = "ababcbacadefegdehijhklij"\nOutput: [9,7,8]',
      'Input: s = "eccbbbbdec"\nOutput: [10]',
    ],
    constraints: [
      '1 <= s.length <= 500',
      's consists of lowercase English letters.',
    ],
    starterCode: `function partitionLabels(s: string): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'partitionLabels("ababcbacadefegdehijhklij")', expected: '[9,7,8]' },
      { input: 'partitionLabels("eccbbbbdec")', expected: '[10]' },
      { input: 'partitionLabels("abc")', expected: '[1,1,1]' },
    ],
  },
  {
    group: 'Greedy',
    id: 'gy-6',
    title: 'Valid Parenthesis String',
    difficulty: 'Medium',
    pattern,
    description:
      "Given a string `s` containing only three types of characters: `'('`, `')'` and `'*'`, return `true` if `s` is valid.\n\nThe following rules define a valid string:\n- Any left parenthesis `'('` must have a corresponding right parenthesis `')'`.\n- Any right parenthesis `')'` must have a corresponding left parenthesis `'('`.\n- Left parenthesis `'('` must go before the corresponding right parenthesis `')'`.\n- `'*'` could be treated as a single right parenthesis `')'` OR a single left parenthesis `'('` OR an empty string `\"\"`.",
    examples: [
      'Input: s = "()"\nOutput: true',
      'Input: s = "(*)"\nOutput: true',
      'Input: s = "(*))"\nOutput: true',
    ],
    constraints: [
      '1 <= s.length <= 100',
      "s[i] is '(', ')' or '*'.",
    ],
    starterCode: `function checkValidString(s: string): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'checkValidString("()")', expected: 'true' },
      { input: 'checkValidString("(*)")', expected: 'true' },
      { input: 'checkValidString("(*))")', expected: 'true' },
    ],
  },
];

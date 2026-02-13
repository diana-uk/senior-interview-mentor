import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

const pattern: PatternName = 'Binary Search';

export const binarySearchProblems: FullProblem[] = [
  {
    group: 'Binary Search',
    id: 'bs-1',
    title: 'Search in Rotated Array',
    difficulty: 'Medium',
    pattern,
    description:
      'There is an integer array `nums` sorted in ascending order (with distinct values). Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot index. Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not.',
    examples: [
      'Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4',
      'Input: nums = [4,5,6,7,0,1,2], target = 3\nOutput: -1',
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      'nums is possibly rotated.',
    ],
    starterCode: {
      typescript: `function search(nums: number[], target: number): number {\n  // Your solution here\n  \n}`,
      javascript: `function search(nums, target) {\n  // Your solution here\n  \n}`,
      python: `def search(nums: list[int], target: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'search([4,5,6,7,0,1,2], 0)', expected: '4' },
      { input: 'search([4,5,6,7,0,1,2], 3)', expected: '-1' },
      { input: 'search([1], 0)', expected: '-1' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-2',
    title: 'Find Minimum in Rotated Array',
    difficulty: 'Medium',
    pattern,
    description:
      'Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. Given the sorted rotated array `nums` of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in `O(log n)` time.',
    examples: [
      'Input: nums = [3,4,5,1,2]\nOutput: 1\nExplanation: The original array was [1,2,3,4,5] rotated 3 times.',
      'Input: nums = [4,5,6,7,0,1,2]\nOutput: 0',
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 5000',
      '-5000 <= nums[i] <= 5000',
      'All values are unique.',
    ],
    starterCode: `function findMin(nums: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'findMin([3,4,5,1,2])', expected: '1' },
      { input: 'findMin([4,5,6,7,0,1,2])', expected: '0' },
      { input: 'findMin([11,13,15,17])', expected: '11' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-3',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    pattern,
    description:
      'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
    examples: [
      'Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.0\nExplanation: merged array = [1,2,3] and median is 2.',
      'Input: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.5\nExplanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.',
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000',
      '-10^6 <= nums1[i], nums2[i] <= 10^6',
    ],
    starterCode: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'findMedianSortedArrays([1,3], [2])', expected: '2' },
      { input: 'findMedianSortedArrays([1,2], [3,4])', expected: '2.5' },
      { input: 'findMedianSortedArrays([0,0], [0,0])', expected: '0' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-4',
    title: 'Binary Search',
    difficulty: 'Easy',
    pattern,
    description:
      'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    examples: [
      'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4.',
      'Input: nums = [-1,0,3,5,9,12], target = 2\nOutput: -1\nExplanation: 2 does not exist in nums so return -1.',
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.',
    ],
    starterCode: `function binarySearch(nums: number[], target: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'binarySearch([-1,0,3,5,9,12], 9)', expected: '4' },
      { input: 'binarySearch([-1,0,3,5,9,12], 2)', expected: '-1' },
      { input: 'binarySearch([5], 5)', expected: '0' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-5',
    title: 'Search a 2D Matrix',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an `m x n` integer matrix `matrix` with the following two properties:\n- Each row is sorted in non-decreasing order.\n- The first integer of each row is greater than the last integer of the previous row.\n\nGiven an integer `target`, return `true` if `target` is in `matrix` or `false` otherwise.\n\nYou must write a solution in `O(log(m * n))` time complexity.',
    examples: [
      'Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: true',
      'Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13\nOutput: false',
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[i].length',
      '1 <= m, n <= 100',
      '-10^4 <= matrix[i][j], target <= 10^4',
    ],
    starterCode: `function searchMatrix(matrix: number[][], target: number): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3)', expected: 'true' },
      { input: 'searchMatrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13)', expected: 'false' },
      { input: 'searchMatrix([[1]], 1)', expected: 'true' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-6',
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    pattern,
    description:
      'Koko loves to eat bananas. There are `n` piles of bananas, the `ith` pile has `piles[i]` bananas. The guards have gone and will come back in `h` hours.\n\nKoko can decide her bananas-per-hour eating speed of `k`. Each hour, she chooses some pile of bananas and eats `k` bananas from that pile. If the pile has less than `k` bananas, she eats all of them instead and will not eat any more bananas during this hour.\n\nReturn the minimum integer `k` such that she can eat all the bananas within `h` hours.',
    examples: [
      'Input: piles = [3,6,7,11], h = 8\nOutput: 4',
      'Input: piles = [30,11,23,4,20], h = 5\nOutput: 30',
      'Input: piles = [30,11,23,4,20], h = 6\nOutput: 23',
    ],
    constraints: [
      '1 <= piles.length <= 10^4',
      'piles.length <= h <= 10^9',
      '1 <= piles[i] <= 10^9',
    ],
    starterCode: `function minEatingSpeed(piles: number[], h: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'minEatingSpeed([3,6,7,11], 8)', expected: '4' },
      { input: 'minEatingSpeed([30,11,23,4,20], 5)', expected: '30' },
      { input: 'minEatingSpeed([30,11,23,4,20], 6)', expected: '23' },
    ],
  },
  {
    group: 'Binary Search',
    id: 'bs-7',
    title: 'Time Based Key-Value Store',
    difficulty: 'Medium',
    pattern,
    description:
      'Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key\'s value at a certain timestamp.\n\nImplement the `TimeMap` class:\n- `TimeMap()` Initializes the object.\n- `set(key, value, timestamp)` Stores the key with the value at the given timestamp.\n- `get(key, timestamp)` Returns a value such that `set` was called previously, with `timestamp_prev <= timestamp`. If there are multiple such values, it returns the value associated with the largest `timestamp_prev`. If there are no values, it returns `""`.',
    examples: [
      'Input:\n["TimeMap", "set", "get", "get", "set", "get"]\n[[], ["foo","bar",1], ["foo",1], ["foo",3], ["foo","bar2",4], ["foo",4]]\nOutput: [null, null, "bar", "bar", null, "bar2"]',
    ],
    constraints: [
      '1 <= key.length, value.length <= 100',
      'key and value consist of lowercase English letters and digits.',
      '1 <= timestamp <= 10^7',
      'All the timestamps of set are strictly increasing.',
      'At most 2 * 10^5 calls will be made to set and get.',
    ],
    starterCode: `class TimeMap {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  set(key: string, value: string, timestamp: number): void {\n    // Your solution here\n  }\n\n  get(key: string, timestamp: number): string {\n    // Your solution here\n  }\n}`,
    testCases: [
      {
        input:
          '(() => { const tm = new TimeMap(); tm.set("foo","bar",1); return tm.get("foo",1); })()',
        expected: '"bar"',
      },
      {
        input:
          '(() => { const tm = new TimeMap(); tm.set("foo","bar",1); return tm.get("foo",3); })()',
        expected: '"bar"',
      },
      {
        input:
          '(() => { const tm = new TimeMap(); tm.set("foo","bar",1); tm.set("foo","bar2",4); return tm.get("foo",4); })()',
        expected: '"bar2"',
      },
    ],
  },
];

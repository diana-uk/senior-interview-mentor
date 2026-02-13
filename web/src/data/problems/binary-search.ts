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
];

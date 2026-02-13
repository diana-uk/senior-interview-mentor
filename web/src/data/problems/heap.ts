import type { PatternName } from '../../types';
import { LIST_HELPERS, type FullProblem } from './helpers';

const pattern: PatternName = 'Heap';

export const heapProblems: FullProblem[] = [
  // ═══════════════════════════════════════════
  // EXISTING
  // ═══════════════════════════════════════════
  {
    group: 'Heap',
    id: 'hp-1',
    title: 'Kth Largest Element',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\nNote that it is the `k`th largest element in the sorted order, not the `k`th distinct element.',
    examples: [
      'Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5',
      'Input: nums = [3,2,3,1,2,4,5,5,6], k = 4\nOutput: 4',
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: `function findKthLargest(nums: number[], k: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'findKthLargest([3,2,1,5,6,4], 2)', expected: '5' },
      { input: 'findKthLargest([3,2,3,1,2,4,5,5,6], 4)', expected: '4' },
      { input: 'findKthLargest([1], 1)', expected: '1' },
    ],
  },
  {
    group: 'Heap',
    id: 'hp-2',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    pattern,
    description:
      'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      'Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]',
      'Input: lists = []\nOutput: []',
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10^4.',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction mergeKLists(lists: (ListNode | null)[]): ListNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          'listToArray(mergeKLists([buildList([1,4,5]), buildList([1,3,4]), buildList([2,6])]))',
        expected: '[1,1,2,3,4,4,5,6]',
      },
      { input: 'listToArray(mergeKLists([]))', expected: '[]' },
      { input: 'listToArray(mergeKLists([buildList([])]))', expected: '[]' },
    ],
  },
  {
    group: 'Heap',
    id: 'hp-3',
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    pattern,
    description:
      'The median is the middle value in an ordered integer list. If the size of the list is even, the median is the mean of the two middle values.\n\nImplement the `MedianFinder` class:\n- `MedianFinder()` initializes the object.\n- `addNum(num: number)` adds the integer `num` to the data structure.\n- `findMedian(): number` returns the median of all elements so far.',
    examples: [
      'Input:\nMedianFinder mf = new MedianFinder();\nmf.addNum(1);\nmf.addNum(2);\nmf.findMedian(); // return 1.5\nmf.addNum(3);\nmf.findMedian(); // return 2.0',
    ],
    constraints: [
      '-10^5 <= num <= 10^5',
      'There will be at least one element before calling findMedian.',
      'At most 5 * 10^4 calls will be made to addNum and findMedian.',
    ],
    starterCode: `class MedianFinder {\n  constructor() {\n    // Initialize your data structure here\n    \n  }\n\n  addNum(num: number): void {\n    // Your solution here\n    \n  }\n\n  findMedian(): number {\n    // Your solution here\n    \n  }\n}`,
    testCases: [
      {
        input:
          '(() => { const mf = new MedianFinder(); mf.addNum(1); mf.addNum(2); return mf.findMedian(); })()',
        expected: '1.5',
      },
      {
        input:
          '(() => { const mf = new MedianFinder(); mf.addNum(1); mf.addNum(2); mf.addNum(3); return mf.findMedian(); })()',
        expected: '2',
      },
      {
        input:
          '(() => { const mf = new MedianFinder(); mf.addNum(6); mf.addNum(10); mf.addNum(2); mf.addNum(6); return mf.findMedian(); })()',
        expected: '6',
      },
    ],
  },

  // ═══════════════════════════════════════════
  // NEW
  // ═══════════════════════════════════════════
  {
    group: 'Heap',
    id: 'hp-4',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.',
    examples: [
      'Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]',
      'Input: nums = [1], k = 1\nOutput: [1]',
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      'k is in the range [1, the number of unique elements in the array].',
      'It is guaranteed that the answer is unique.',
    ],
    starterCode: `function topKFrequent(nums: number[], k: number): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'topKFrequent([1,1,1,2,2,3], 2).sort((a,b) => a-b)', expected: '[1,2]' },
      { input: 'topKFrequent([1], 1)', expected: '[1]' },
      { input: 'topKFrequent([1,2], 2).sort((a,b) => a-b)', expected: '[1,2]' },
    ],
  },
];

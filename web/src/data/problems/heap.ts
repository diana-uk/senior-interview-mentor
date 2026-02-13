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
  {
    group: 'Heap',
    id: 'hp-5',
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    pattern,
    description:
      'You are given an array of integers `stones` where `stones[i]` is the weight of the `ith` stone.\n\nWe are playing a game with the stones. On each turn, we choose the heaviest two stones and smash them together. Suppose the heaviest two stones have weights `x` and `y` with `x <= y`. The result of this smash is:\n- If `x == y`, both stones are destroyed, and\n- If `x != y`, the stone of weight `x` is destroyed, and the stone of weight `y` has new weight `y - x`.\n\nAt the end of the game, there is at most one stone left. Return the weight of the last remaining stone. If there are no stones left, return `0`.',
    examples: [
      'Input: stones = [2,7,4,1,8,1]\nOutput: 1\nExplanation:\nWe combine 7 and 8 to get 1 so stones = [2,4,1,1,1]\nWe combine 2 and 4 to get 2 so stones = [2,1,1,1]\nWe combine 2 and 1 to get 1 so stones = [1,1,1]\nWe combine 1 and 1 to get 0 so stones = [1]\nThere is 1 stone left.',
      'Input: stones = [1]\nOutput: 1',
    ],
    constraints: [
      '1 <= stones.length <= 30',
      '1 <= stones[i] <= 1000',
    ],
    starterCode: `function lastStoneWeight(stones: number[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'lastStoneWeight([2,7,4,1,8,1])', expected: '1' },
      { input: 'lastStoneWeight([1])', expected: '1' },
      { input: 'lastStoneWeight([2,2])', expected: '0' },
    ],
  },
  {
    group: 'Heap',
    id: 'hp-6',
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    pattern,
    description:
      'Given an array of `points` where `points[i] = [xi, yi]` represents a point on the X-Y plane and an integer `k`, return the `k` closest points to the origin `(0, 0)`.\n\nThe distance between two points on the X-Y plane is the Euclidean distance (i.e., `sqrt(x1^2 + y1^2)`).\n\nYou may return the answer in any order. The answer is guaranteed to be unique.',
    examples: [
      'Input: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: The distance between (1, 3) and the origin is sqrt(10). The distance between (-2, 2) and the origin is sqrt(8). Since sqrt(8) < sqrt(10), (-2, 2) is closer to the origin.',
      'Input: points = [[3,3],[5,-1],[-2,4]], k = 2\nOutput: [[3,3],[-2,4]]',
    ],
    constraints: [
      '1 <= k <= points.length <= 10^4',
      '-10^4 <= xi, yi <= 10^4',
    ],
    starterCode: `function kClosest(points: number[][], k: number): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'kClosest([[1,3],[-2,2]], 1)', expected: '[[-2,2]]' },
      { input: 'kClosest([[3,3],[5,-1],[-2,4]], 2).sort((a,b) => a[0]-b[0])', expected: '[[-2,4],[3,3]]' },
      { input: 'kClosest([[0,1],[1,0]], 2).sort((a,b) => a[0]-b[0])', expected: '[[0,1],[1,0]]' },
    ],
  },
  {
    group: 'Heap',
    id: 'hp-7',
    title: 'Task Scheduler',
    difficulty: 'Medium',
    pattern,
    description:
      'You are given an array of CPU tasks, each represented by letters A to Z, and a cooling interval `n`. Each cycle or interval allows the completion of one task. Tasks can be completed in any order, but there\'s a constraint: identical tasks must be separated by at least `n` intervals due to cooling time.\n\nReturn the minimum number of intervals the CPU will take to finish all the given tasks.',
    examples: [
      'Input: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8\nExplanation: A possible sequence is: A -> B -> idle -> A -> B -> idle -> A -> B.',
      'Input: tasks = ["A","C","A","B","D","B"], n = 1\nOutput: 6\nExplanation: A possible sequence is: A -> B -> A -> C -> D -> B.',
      'Input: tasks = ["A","A","A","B","B","B"], n = 0\nOutput: 6',
    ],
    constraints: [
      '1 <= tasks.length <= 10^4',
      'tasks[i] is an uppercase English letter.',
      '0 <= n <= 100',
    ],
    starterCode: `function leastInterval(tasks: string[], n: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'leastInterval(["A","A","A","B","B","B"], 2)', expected: '8' },
      { input: 'leastInterval(["A","C","A","B","D","B"], 1)', expected: '6' },
      { input: 'leastInterval(["A","A","A","B","B","B"], 0)', expected: '6' },
    ],
  },
];

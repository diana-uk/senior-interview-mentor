import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const intervalProblems: FullProblem[] = [
  {
    group: 'Intervals',
    id: 'iv-1',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    pattern: 'Intervals' as PatternName,
    description:
      'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    examples: [
      'Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      'Input: intervals = [[1,4],[4,5]]\nOutput: [[1,5]]\nExplanation: Intervals [1,4] and [4,5] are considered overlapping.',
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    starterCode: `function merge(intervals: number[][]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'merge([[1,3],[2,6],[8,10],[15,18]])',
        expected: '[[1,6],[8,10],[15,18]]',
      },
      {
        input: 'merge([[1,4],[4,5]])',
        expected: '[[1,5]]',
      },
      {
        input: 'merge([[1,4],[0,4]])',
        expected: '[[0,4]]',
      },
    ],
  },
  {
    group: 'Intervals',
    id: 'iv-2',
    title: 'Insert Interval',
    difficulty: 'Medium',
    pattern: 'Intervals' as PatternName,
    description:
      'You are given an array of non-overlapping intervals `intervals` where `intervals[i] = [starti, endi]` are sorted in ascending order by `starti`. You are also given an interval `newInterval = [start, end]` that represents the start and end of another interval.\n\nInsert `newInterval` into `intervals` such that `intervals` is still sorted in ascending order by `starti` and `intervals` still does not have any overlapping intervals (merge overlapping intervals if necessary).\n\nReturn `intervals` after the insertion.',
    examples: [
      'Input: intervals = [[1,3],[6,9]], newInterval = [2,5]\nOutput: [[1,5],[6,9]]',
      'Input: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]\nOutput: [[1,2],[3,10],[12,16]]\nExplanation: Because the new interval [4,8] overlaps with [3,5],[6,7],[8,10].',
    ],
    constraints: [
      '0 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^5',
      'intervals is sorted by starti in ascending order.',
      'newInterval.length == 2',
      '0 <= start <= end <= 10^5',
    ],
    starterCode: `function insert(intervals: number[][], newInterval: number[]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'insert([[1,3],[6,9]],[2,5])',
        expected: '[[1,5],[6,9]]',
      },
      {
        input: 'insert([[1,2],[3,5],[6,7],[8,10],[12,16]],[4,8])',
        expected: '[[1,2],[3,10],[12,16]]',
      },
      {
        input: 'insert([],[5,7])',
        expected: '[[5,7]]',
      },
    ],
  },
  {
    group: 'Intervals',
    id: 'iv-3',
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    pattern: 'Greedy' as PatternName,
    description:
      'Given an array of intervals `intervals` where `intervals[i] = [starti, endi]`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.\n\nNote that intervals which only touch at a point are non-overlapping. For example, `[1, 2]` and `[2, 3]` are non-overlapping.',
    examples: [
      'Input: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1\nExplanation: [1,3] can be removed and the rest of the intervals are non-overlapping.',
      'Input: intervals = [[1,2],[1,2],[1,2]]\nOutput: 2\nExplanation: You need to remove two [1,2] to make the rest non-overlapping.',
      'Input: intervals = [[1,2],[2,3]]\nOutput: 0\nExplanation: You don\'t need to remove any of the intervals since they\'re already non-overlapping.',
    ],
    constraints: [
      '1 <= intervals.length <= 10^5',
      'intervals[i].length == 2',
      '-5 * 10^4 <= starti < endi <= 5 * 10^4',
    ],
    starterCode: `function eraseOverlapIntervals(intervals: number[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]])',
        expected: '1',
      },
      {
        input: 'eraseOverlapIntervals([[1,2],[1,2],[1,2]])',
        expected: '2',
      },
      {
        input: 'eraseOverlapIntervals([[1,2],[2,3]])',
        expected: '0',
      },
    ],
  },
  {
    group: 'Intervals',
    id: 'iv-4',
    title: 'Meeting Rooms',
    difficulty: 'Easy',
    pattern: 'Intervals' as PatternName,
    description:
      'Given an array of meeting time intervals where `intervals[i] = [starti, endi]`, determine if a person could attend all meetings.\n\nA person can attend all meetings if no two meetings overlap. Note that meetings that end at the same time another starts are not considered overlapping.',
    examples: [
      'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: false\nExplanation: The meeting [0,30] overlaps with both [5,10] and [15,20].',
      'Input: intervals = [[7,10],[2,4]]\nOutput: true\nExplanation: No meetings overlap.',
    ],
    constraints: [
      '0 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti < endi <= 10^6',
    ],
    starterCode: `function canAttendMeetings(intervals: number[][]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'canAttendMeetings([[0,30],[5,10],[15,20]])',
        expected: 'false',
      },
      {
        input: 'canAttendMeetings([[7,10],[2,4]])',
        expected: 'true',
      },
      {
        input: 'canAttendMeetings([[1,5],[5,10]])',
        expected: 'true',
      },
    ],
  },
  {
    group: 'Intervals',
    id: 'iv-5',
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    pattern: 'Heap' as PatternName,
    description:
      'Given an array of meeting time intervals `intervals` where `intervals[i] = [starti, endi]`, return the minimum number of conference rooms required.\n\nTwo meetings that share an endpoint (one ends as the other starts) do not require separate rooms.',
    examples: [
      'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2\nExplanation: Meeting [0,30] uses one room for the entire time. Meetings [5,10] and [15,20] can share a second room.',
      'Input: intervals = [[7,10],[2,4]]\nOutput: 1\nExplanation: The two meetings do not overlap.',
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      '0 <= starti < endi <= 10^6',
    ],
    starterCode: `function minMeetingRooms(intervals: number[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'minMeetingRooms([[0,30],[5,10],[15,20]])',
        expected: '2',
      },
      {
        input: 'minMeetingRooms([[7,10],[2,4]])',
        expected: '1',
      },
      {
        input: 'minMeetingRooms([[0,5],[5,10],[10,15]])',
        expected: '1',
      },
    ],
  },
  {
    group: 'Intervals',
    id: 'iv-6',
    title: 'Minimum Interval to Include Each Query',
    difficulty: 'Hard',
    pattern: 'Intervals' as PatternName,
    description:
      'You are given a 2D integer array `intervals`, where `intervals[i] = [lefti, righti]` describes the `ith` interval starting at `lefti` and ending at `righti` (inclusive). The size of an interval is defined as the number of integers it contains, or more formally `righti - lefti + 1`.\n\nYou are also given an integer array `queries`. The answer to the `jth` query is the size of the smallest interval `i` such that `lefti <= queries[j] <= righti`. If no such interval exists, the answer is `-1`.\n\nReturn an array containing the answers to the queries.',
    examples: [
      'Input: intervals = [[1,4],[2,4],[3,6],[4,4]], queries = [2,3,4,5]\nOutput: [3,3,1,4]',
      'Input: intervals = [[2,3],[2,5],[1,8],[20,25]], queries = [2,19,5,22]\nOutput: [2,-1,4,6]',
    ],
    constraints: [
      '1 <= intervals.length <= 10^5',
      '1 <= queries.length <= 10^5',
      'intervals[i].length == 2',
      '1 <= lefti <= righti <= 10^7',
      '1 <= queries[j] <= 10^7',
    ],
    starterCode: `function minInterval(intervals: number[][], queries: number[]): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'minInterval([[1,4],[2,4],[3,6],[4,4]], [2,3,4,5])', expected: '[3,3,1,4]' },
      { input: 'minInterval([[2,3],[2,5],[1,8],[20,25]], [2,19,5,22])', expected: '[2,-1,4,6]' },
    ],
  },
];

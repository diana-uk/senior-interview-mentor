import type { PatternName } from '../../types';
import { LIST_HELPERS, type FullProblem } from './helpers';

export const linkedListProblems: FullProblem[] = [
  {
    group: 'Linked List',
    id: 'll-1',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    pattern: 'Two Pointers' as PatternName,
    description:
      'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]',
      'Input: head = [1,2]\nOutput: [2,1]',
      'Input: head = []\nOutput: []',
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'listToArray(reverseList(buildList([1,2,3,4,5])))', expected: '[5,4,3,2,1]' },
      { input: 'listToArray(reverseList(buildList([1,2])))', expected: '[2,1]' },
      { input: 'listToArray(reverseList(buildList([])))', expected: '[]' },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-2',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    pattern: 'Two Pointers' as PatternName,
    description:
      'You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.',
    examples: [
      'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
      'Input: list1 = [], list2 = []\nOutput: []',
      'Input: list1 = [], list2 = [0]\nOutput: [0]',
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'listToArray(mergeTwoLists(buildList([1,2,4]), buildList([1,3,4])))',
        expected: '[1,1,2,3,4,4]',
      },
      {
        input: 'listToArray(mergeTwoLists(buildList([]), buildList([])))',
        expected: '[]',
      },
      {
        input: 'listToArray(mergeTwoLists(buildList([]), buildList([0])))',
        expected: '[0]',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-3',
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    pattern: 'Two Pointers' as PatternName,
    description:
      'Given `head`, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Internally, `pos` is used to denote the index of the node that tail\'s `next` pointer is connected to. Note that `pos` is not passed as a parameter.\n\nReturn `true` if there is a cycle in the linked list. Otherwise, return `false`.',
    examples: [
      'Input: head = [3,2,0,-4], pos = 1\nOutput: true\nExplanation: There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).',
      'Input: head = [1,2], pos = 0\nOutput: true\nExplanation: There is a cycle in the linked list, where the tail connects to the 0th node.',
      'Input: head = [1], pos = -1\nOutput: false\nExplanation: There is no cycle in the linked list.',
    ],
    constraints: [
      'The number of the nodes in the list is in the range [0, 10^4].',
      '-10^5 <= Node.val <= 10^5',
      'pos is -1 or a valid index in the linked-list.',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction hasCycle(head: ListNode | null): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const h = buildList([3,2,0,-4]); let n = h; while(n!.next) n = n!.next; n!.next = h!.next; return hasCycle(h); })()',
        expected: 'true',
      },
      {
        input:
          '(() => { const h = buildList([1,2]); h!.next!.next = h; return hasCycle(h); })()',
        expected: 'true',
      },
      {
        input: 'hasCycle(buildList([1]))',
        expected: 'false',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-4',
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    pattern: 'Two Pointers' as PatternName,
    description:
      'Given the `head` of a linked list, remove the `n`th node from the end of the list and return its head.',
    examples: [
      'Input: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]',
      'Input: head = [1], n = 1\nOutput: []',
      'Input: head = [1,2], n = 1\nOutput: [1]',
    ],
    constraints: [
      'The number of nodes in the list is sz.',
      '1 <= sz <= 30',
      '0 <= Node.val <= 100',
      '1 <= n <= sz',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'listToArray(removeNthFromEnd(buildList([1,2,3,4,5]), 2))',
        expected: '[1,2,3,5]',
      },
      {
        input: 'listToArray(removeNthFromEnd(buildList([1]), 1))',
        expected: '[]',
      },
      {
        input: 'listToArray(removeNthFromEnd(buildList([1,2]), 1))',
        expected: '[1]',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-5',
    title: 'Reorder List',
    difficulty: 'Medium',
    pattern: 'Two Pointers' as PatternName,
    description:
      'You are given the head of a singly linked-list. The list can be represented as:\n\n`L0 -> L1 -> ... -> Ln-1 -> Ln`\n\nReorder the list to be on the following form:\n\n`L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...`\n\nYou may not modify the values in the list\'s nodes. Only nodes themselves may be changed.',
    examples: [
      'Input: head = [1,2,3,4]\nOutput: [1,4,2,3]',
      'Input: head = [1,2,3,4,5]\nOutput: [1,5,2,4,3]',
    ],
    constraints: [
      'The number of nodes in the list is in the range [1, 5 * 10^4].',
      '1 <= Node.val <= 1000',
    ],
    starterCode:
      LIST_HELPERS +
      `// Your solution below\nfunction reorderList(head: ListNode | null): void {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const h = buildList([1,2,3,4]); reorderList(h); return listToArray(h); })()',
        expected: '[1,4,2,3]',
      },
      {
        input:
          '(() => { const h = buildList([1,2,3,4,5]); reorderList(h); return listToArray(h); })()',
        expected: '[1,5,2,4,3]',
      },
    ],
  },
];

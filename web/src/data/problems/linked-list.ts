import type { PatternName } from '../../types';
import { LIST_HELPERS, PYTHON_LIST_HELPERS, type FullProblem } from './helpers';

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
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef reverse_list(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef merge_two_lists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction hasCycle(head: ListNode | null): boolean {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef has_cycle(head: Optional[ListNode]) -> bool:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef remove_nth_from_end(head: Optional[ListNode], n: int) -> Optional[ListNode]:\n    # Your solution here\n    pass`,
    },
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
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction reorderList(head: ListNode | null): void {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef reorder_list(head: Optional[ListNode]) -> None:\n    # Your solution here\n    pass`,
    },
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
  {
    group: 'Linked List',
    id: 'll-6',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    pattern: 'Linked List' as PatternName,
    description:
      'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.',
    examples: [
      'Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.',
      'Input: l1 = [0], l2 = [0]\nOutput: [0]',
      'Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]\nOutput: [8,9,9,9,0,0,0,1]',
    ],
    constraints: [
      'The number of nodes in each linked list is in the range [1, 100].',
      '0 <= Node.val <= 9',
      'It is guaranteed that the list represents a number that does not have leading zeros.',
    ],
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef add_two_numbers(l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      {
        input: 'listToArray(addTwoNumbers(buildList([2,4,3]), buildList([5,6,4])))',
        expected: '[7,0,8]',
      },
      {
        input: 'listToArray(addTwoNumbers(buildList([0]), buildList([0])))',
        expected: '[0]',
      },
      {
        input: 'listToArray(addTwoNumbers(buildList([9,9,9,9,9,9,9]), buildList([9,9,9,9])))',
        expected: '[8,9,9,9,0,0,0,1]',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-7',
    title: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    pattern: 'Linked List' as PatternName,
    description:
      'A linked list of length `n` is given such that each node contains an additional random pointer, which could point to any node in the list, or `null`.\n\nConstruct a deep copy of the list. The deep copy should consist of exactly `n` brand new nodes, where each new node has its value set to the value of its corresponding original node. Both the `next` and `random` pointer of the new nodes should point to new nodes in the copied list such that the pointers in the original list and copied list represent the same list state.',
    examples: [
      'Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]\nOutput: [[7,null],[13,0],[11,4],[10,2],[1,0]]',
      'Input: head = [[1,1],[2,1]]\nOutput: [[1,1],[2,1]]',
    ],
    constraints: [
      '0 <= n <= 1000',
      '-10^4 <= Node.val <= 10^4',
      'Node.random is null or is pointing to some node in the linked list.',
    ],
    starterCode: {
      typescript: `class RNode {\n  val: number;\n  next: RNode | null;\n  random: RNode | null;\n  constructor(val = 0, next: RNode | null = null, random: RNode | null = null) {\n    this.val = val;\n    this.next = next;\n    this.random = random;\n  }\n}\n\nfunction copyRandomList(head: RNode | null): RNode | null {\n  // Your solution here\n  \n}`,
      python: `from typing import Optional\n\nclass RNode:\n    def __init__(self, val: int = 0, next: 'Optional[RNode]' = None, random: 'Optional[RNode]' = None):\n        self.val = val\n        self.next = next\n        self.random = random\n\ndef copy_random_list(head: Optional[RNode]) -> Optional[RNode]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      {
        input:
          '(() => { const n1 = new RNode(7); const n2 = new RNode(13); const n3 = new RNode(11); n1.next = n2; n2.next = n3; n2.random = n1; n3.random = n1; const c = copyRandomList(n1); return c !== n1 && c!.val === 7 && c!.next!.random!.val === 7; })()',
        expected: 'true',
      },
      {
        input: 'copyRandomList(null)',
        expected: 'null',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-8',
    title: 'Find the Duplicate Number',
    difficulty: 'Medium',
    pattern: 'Two Pointers' as PatternName,
    description:
      'Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive.\n\nThere is only one repeated number in `nums`, return this repeated number.\n\nYou must solve the problem without modifying the array `nums` and using only constant extra space.',
    examples: [
      'Input: nums = [1,3,4,2,2]\nOutput: 2',
      'Input: nums = [3,1,3,4,2]\nOutput: 3',
      'Input: nums = [3,3,3,3,3]\nOutput: 3',
    ],
    constraints: [
      '1 <= n <= 10^5',
      'nums.length == n + 1',
      '1 <= nums[i] <= n',
      'All the integers in nums appear only once except for precisely one integer which appears two or more times.',
    ],
    starterCode: {
      typescript: `function findDuplicate(nums: number[]): number {\n  // Your solution here\n  \n}`,
      python: `def find_duplicate(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'findDuplicate([1,3,4,2,2])', expected: '2' },
      { input: 'findDuplicate([3,1,3,4,2])', expected: '3' },
      { input: 'findDuplicate([3,3,3,3,3])', expected: '3' },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-9',
    title: 'LRU Cache',
    difficulty: 'Medium',
    pattern: 'Linked List' as PatternName,
    description:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(capacity)` Initialize the LRU cache with positive size `capacity`.\n- `get(key)` Return the value of the key if the key exists, otherwise return `-1`.\n- `put(key, value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the `capacity`, evict the least recently used key.\n\nThe functions `get` and `put` must each run in `O(1)` average time complexity.',
    examples: [
      'Input:\n["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]\nOutput: [null,null,null,1,null,-1,null,-1,3,4]',
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.',
    ],
    starterCode: {
      typescript: `class LRUCache {\n  constructor(capacity: number) {\n    // Initialize your data structure here\n  }\n\n  get(key: number): number {\n    // Your solution here\n  }\n\n  put(key: number, value: number): void {\n    // Your solution here\n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # Initialize your data structure here\n        pass\n\n    def get(self, key: int) -> int:\n        # Your solution here\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # Your solution here\n        pass`,
    },
    testCases: [
      {
        input:
          '(() => { const c = new LRUCache(2); c.put(1,1); c.put(2,2); return c.get(1); })()',
        expected: '1',
      },
      {
        input:
          '(() => { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.put(3,3); return c.get(2); })()',
        expected: '-1',
      },
      {
        input:
          '(() => { const c = new LRUCache(2); c.put(1,1); c.put(2,2); c.get(1); c.put(3,3); return c.get(2); })()',
        expected: '-1',
      },
    ],
  },
  {
    group: 'Linked List',
    id: 'll-10',
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    pattern: 'Linked List' as PatternName,
    description:
      'Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return the modified list.\n\n`k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.\n\nYou may not alter the values in the list\'s nodes, only nodes themselves may be changed.',
    examples: [
      'Input: head = [1,2,3,4,5], k = 2\nOutput: [2,1,4,3,5]',
      'Input: head = [1,2,3,4,5], k = 3\nOutput: [3,2,1,4,5]',
    ],
    constraints: [
      'The number of nodes in the list is n.',
      '1 <= k <= n <= 5000',
      '0 <= Node.val <= 1000',
    ],
    starterCode: {
      typescript:
        LIST_HELPERS +
        `// Your solution below\nfunction reverseKGroup(head: ListNode | null, k: number): ListNode | null {\n  // Your solution here\n  \n}`,
      python:
        PYTHON_LIST_HELPERS +
        `# Your solution below\ndef reverse_k_group(head: Optional[ListNode], k: int) -> Optional[ListNode]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      {
        input: 'listToArray(reverseKGroup(buildList([1,2,3,4,5]), 2))',
        expected: '[2,1,4,3,5]',
      },
      {
        input: 'listToArray(reverseKGroup(buildList([1,2,3,4,5]), 3))',
        expected: '[3,2,1,4,5]',
      },
      {
        input: 'listToArray(reverseKGroup(buildList([1,2,3,4,5]), 1))',
        expected: '[1,2,3,4,5]',
      },
    ],
  },
];

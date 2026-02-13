import type { PatternName } from '../../types';
import { TREE_HELPERS, type FullProblem } from './helpers';

export const treesProblems: FullProblem[] = [
  // ═══════════════════════════════════════════
  // Existing tree problems
  // ═══════════════════════════════════════════
  {
    group: 'Trees',
    id: 'tr-1',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    pattern: 'Trees' as PatternName,
    description:
      'Given the `root` of a binary tree, invert the tree, and return its root.\n\nInverting a binary tree means swapping the left and right children of every node.',
    examples: [
      'Input: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]',
      'Input: root = [2,1,3]\nOutput: [2,3,1]',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 100].',
      '-100 <= Node.val <= 100',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction invertTree(root: TreeNode | null): TreeNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'treeToArray(invertTree(buildTree([4,2,7,1,3,6,9])))', expected: '[4,7,2,9,6,3,1]' },
      { input: 'treeToArray(invertTree(buildTree([2,1,3])))', expected: '[2,3,1]' },
      { input: 'treeToArray(invertTree(buildTree([])))', expected: '[]' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-2',
    title: 'Lowest Common Ancestor',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nThe lowest common ancestor is defined as the lowest node in the tree that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).',
    examples: [
      'Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1\nOutput: 3',
      'Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4\nOutput: 5',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [2, 10^5].',
      '-10^9 <= Node.val <= 10^9',
      'All Node.val are unique.',
      'p != q',
      'p and q will exist in the tree.',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const r = buildTree([3,5,1,6,2,0,8,null,null,7,4]); return lowestCommonAncestor(r, findNode(r,5)!, findNode(r,1)!)?.val; })()',
        expected: '3',
      },
      {
        input:
          '(() => { const r = buildTree([3,5,1,6,2,0,8,null,null,7,4]); return lowestCommonAncestor(r, findNode(r,5)!, findNode(r,4)!)?.val; })()',
        expected: '5',
      },
      {
        input:
          '(() => { const r = buildTree([1,2]); return lowestCommonAncestor(r, findNode(r,1)!, findNode(r,2)!)?.val; })()',
        expected: '1',
      },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-3',
    title: 'Serialize and Deserialize BST',
    difficulty: 'Hard',
    pattern: 'Trees' as PatternName,
    description:
      'Design an algorithm to serialize and deserialize a binary search tree. Serialization is the process of converting a data structure into a sequence of bits so that it can be stored or transmitted. Deserialization is the reverse process.\n\nYour `serialize` and `deserialize` functions should be such that `deserialize(serialize(root))` reconstructs the original tree.',
    examples: [
      'Input: root = [2,1,3]\nOutput: [2,1,3]',
      'Input: root = []\nOutput: []',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '0 <= Node.val <= 10^4',
      'The input tree is guaranteed to be a valid binary search tree.',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction serialize(root: TreeNode | null): string {\n  // Your solution here\n  \n}\n\nfunction deserialize(data: string): TreeNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'treeToArray(deserialize(serialize(buildTree([2,1,3]))))', expected: '[2,1,3]' },
      { input: 'treeToArray(deserialize(serialize(buildTree([]))))', expected: '[]' },
      { input: 'treeToArray(deserialize(serialize(buildTree([4,2,5,1,3]))))', expected: '[4,2,5,1,3]' },
    ],
  },

  // ═══════════════════════════════════════════
  // New Blind 75 tree problems
  // ═══════════════════════════════════════════
  {
    group: 'Trees',
    id: 'tr-4',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    pattern: 'Trees' as PatternName,
    description:
      'Given the root of a binary tree, return its maximum depth. Maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: [
      'Input: root = [3,9,20,null,null,15,7]\nOutput: 3',
      'Input: root = [1,null,2]\nOutput: 2',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction maxDepth(root: TreeNode | null): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'maxDepth(buildTree([3,9,20,null,null,15,7]))', expected: '3' },
      { input: 'maxDepth(buildTree([1,null,2]))', expected: '2' },
      { input: 'maxDepth(buildTree([]))', expected: '0' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-5',
    title: 'Same Tree',
    difficulty: 'Easy',
    pattern: 'Trees' as PatternName,
    description:
      'Given the roots of two binary trees p and q, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.',
    examples: [
      'Input: p = [1,2,3], q = [1,2,3]\nOutput: true',
      'Input: p = [1,2], q = [1,null,2]\nOutput: false',
    ],
    constraints: [
      'The number of nodes in both trees is in the range [0, 100].',
      '-10^4 <= Node.val <= 10^4',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isSameTree(buildTree([1,2,3]), buildTree([1,2,3]))', expected: 'true' },
      { input: 'isSameTree(buildTree([1,2]), buildTree([1,null,2]))', expected: 'false' },
      { input: 'isSameTree(buildTree([]), buildTree([]))', expected: 'true' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-6',
    title: 'Subtree of Another Tree',
    difficulty: 'Easy',
    pattern: 'Trees' as PatternName,
    description:
      'Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.',
    examples: [
      'Input: root = [3,4,5,1,2], subRoot = [4,1,2]\nOutput: true',
      'Input: root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]\nOutput: false',
    ],
    constraints: [
      'The number of nodes in the root tree is in the range [1, 2000].',
      'The number of nodes in the subRoot tree is in the range [1, 1000].',
      '-10^4 <= root.val <= 10^4',
      '-10^4 <= subRoot.val <= 10^4',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isSubtree(buildTree([3,4,5,1,2]), buildTree([4,1,2]))', expected: 'true' },
      { input: 'isSubtree(buildTree([3,4,5,1,2,null,null,null,null,0]), buildTree([4,1,2]))', expected: 'false' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-7',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples: [
      'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]',
      'Input: root = [1]\nOutput: [[1]]',
      'Input: root = []\nOutput: []',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction levelOrder(root: TreeNode | null): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'JSON.stringify(levelOrder(buildTree([3,9,20,null,null,15,7])))', expected: '"[[3],[9,20],[15,7]]"' },
      { input: 'JSON.stringify(levelOrder(buildTree([1])))', expected: '"[[1]]"' },
      { input: 'JSON.stringify(levelOrder(buildTree([])))', expected: '"[]"' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-8',
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has: left subtree nodes < node < right subtree nodes, recursively.',
    examples: [
      'Input: root = [2,1,3]\nOutput: true',
      'Input: root = [5,1,4,null,null,3,6]\nOutput: false\nExplanation: The root node\'s value is 5 but its right child\'s value is 4.',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [1, 10^4].',
      '-2^31 <= Node.val <= 2^31 - 1',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction isValidBST(root: TreeNode | null): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isValidBST(buildTree([2,1,3]))', expected: 'true' },
      { input: 'isValidBST(buildTree([5,1,4,null,null,3,6]))', expected: 'false' },
      { input: 'isValidBST(buildTree([1]))', expected: 'true' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-9',
    title: 'Kth Smallest Element in a BST',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
    examples: [
      'Input: root = [3,1,4,null,2], k = 1\nOutput: 1',
      'Input: root = [5,3,6,2,4,null,null,1], k = 3\nOutput: 3',
    ],
    constraints: [
      'The number of nodes in the tree is n.',
      '1 <= k <= n <= 10^4',
      '0 <= Node.val <= 10^4',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction kthSmallest(root: TreeNode | null, k: number): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'kthSmallest(buildTree([3,1,4,null,2]), 1)', expected: '1' },
      { input: 'kthSmallest(buildTree([5,3,6,2,4,null,null,1]), 3)', expected: '3' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-10',
    title: 'Construct Binary Tree from Preorder and Inorder',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.',
    examples: [
      'Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]\nOutput: [3,9,20,null,null,15,7]',
      'Input: preorder = [-1], inorder = [-1]\nOutput: [-1]',
    ],
    constraints: [
      '1 <= preorder.length <= 3000',
      'inorder.length == preorder.length',
      '-3000 <= preorder[i], inorder[i] <= 3000',
      'preorder and inorder consist of unique values.',
      'Each value of inorder also appears in preorder.',
      'preorder is guaranteed to be the preorder traversal of the tree.',
      'inorder is guaranteed to be the inorder traversal of the tree.',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\n// Named buildTreeFromTraversals to avoid conflict with buildTree helper\nfunction buildTreeFromTraversals(preorder: number[], inorder: number[]): TreeNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'treeToArray(buildTreeFromTraversals([3,9,20,15,7],[9,3,15,20,7]))', expected: '[3,9,20,null,null,15,7]' },
      { input: 'treeToArray(buildTreeFromTraversals([-1],[-1]))', expected: '[-1]' },
    ],
  },
  {
    group: 'Trees',
    id: 'tr-11',
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    pattern: 'Trees' as PatternName,
    description:
      'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. The path sum is the sum of the node\'s values in the path. Given the root of a binary tree, return the maximum path sum of any non-empty path.',
    examples: [
      'Input: root = [1,2,3]\nOutput: 6\nExplanation: The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.',
      'Input: root = [-10,9,20,null,null,15,7]\nOutput: 42\nExplanation: The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.',
    ],
    constraints: [
      'The number of nodes in the tree is in the range [1, 3 * 10^4].',
      '-1000 <= Node.val <= 1000',
    ],
    starterCode:
      TREE_HELPERS +
      `// Your solution below\nfunction maxPathSum(root: TreeNode | null): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'maxPathSum(buildTree([1,2,3]))', expected: '6' },
      { input: 'maxPathSum(buildTree([-10,9,20,null,null,15,7]))', expected: '42' },
      { input: 'maxPathSum(buildTree([-3]))', expected: '-3' },
    ],
  },
];

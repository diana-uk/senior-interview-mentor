import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const matrixProblems: FullProblem[] = [
  {
    group: 'Matrix',
    id: 'mx-1',
    title: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    pattern: 'HashMap' as PatternName,
    description:
      'Given an `m x n` integer matrix, if an element is `0`, set its entire row and column to `0`\'s. You must do it in place.\n\nFollow up: A straightforward solution using `O(mn)` space is probably a bad idea. A simple improvement uses `O(m + n)` space, but could you devise a constant space solution?',
    examples: [
      'Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]\nOutput: [[1,0,1],[0,0,0],[1,0,1]]',
      'Input: matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]\nOutput: [[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[0].length',
      '1 <= m, n <= 200',
      '-2^31 <= matrix[i][j] <= 2^31 - 1',
    ],
    starterCode: `function setZeroes(matrix: number[][]): void {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const m = [[1,1,1],[1,0,1],[1,1,1]]; setZeroes(m); return m; })()',
        expected: '[[1,0,1],[0,0,0],[1,0,1]]',
      },
      {
        input:
          '(() => { const m = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]; setZeroes(m); return m; })()',
        expected: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
      },
    ],
  },
  {
    group: 'Matrix',
    id: 'mx-2',
    title: 'Spiral Matrix',
    difficulty: 'Medium',
    pattern: 'HashMap' as PatternName,
    description:
      'Given an `m x n` matrix, return all elements of the matrix in spiral order.',
    examples: [
      'Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]',
      'Input: matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]\nOutput: [1,2,3,4,8,12,11,10,9,5,6,7]',
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[i].length',
      '1 <= m, n <= 10',
      '-100 <= matrix[i][j] <= 100',
    ],
    starterCode: `function spiralOrder(matrix: number[][]): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'spiralOrder([[1,2,3],[4,5,6],[7,8,9]])',
        expected: '[1,2,3,6,9,8,7,4,5]',
      },
      {
        input: 'spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]])',
        expected: '[1,2,3,4,8,12,11,10,9,5,6,7]',
      },
    ],
  },
  {
    group: 'Matrix',
    id: 'mx-3',
    title: 'Rotate Image',
    difficulty: 'Medium',
    pattern: 'HashMap' as PatternName,
    description:
      'You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.',
    examples: [
      'Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]',
      'Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]\nOutput: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]',
    ],
    constraints: [
      'n == matrix.length == matrix[i].length',
      '1 <= n <= 20',
      '-1000 <= matrix[i][j] <= 1000',
    ],
    starterCode: `function rotate(matrix: number[][]): void {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const m = [[1,2,3],[4,5,6],[7,8,9]]; rotate(m); return m; })()',
        expected: '[[7,4,1],[8,5,2],[9,6,3]]',
      },
      {
        input:
          '(() => { const m = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]; rotate(m); return m; })()',
        expected: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]',
      },
    ],
  },
  {
    group: 'Matrix',
    id: 'mx-4',
    title: 'Word Search',
    difficulty: 'Medium',
    pattern: 'Backtracking' as PatternName,
    description:
      'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
    examples: [
      'Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"\nOutput: true',
      'Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"\nOutput: true',
      'Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"\nOutput: false',
    ],
    constraints: [
      'm == board.length',
      'n == board[i].length',
      '1 <= m, n <= 6',
      '1 <= word.length <= 15',
      'board and word consist of only lowercase and uppercase English letters.',
    ],
    starterCode: `function exist(board: string[][], word: string): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          'exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"ABCCED")',
        expected: 'true',
      },
      {
        input:
          'exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"SEE")',
        expected: 'true',
      },
      {
        input:
          'exist([["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]],"ABCB")',
        expected: 'false',
      },
    ],
  },
];

import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const trieProblems: FullProblem[] = [
  {
    group: 'Trie',
    id: 'tri-1',
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    pattern: 'Trees' as PatternName,
    description:
      'A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement the Trie class with: Trie(), insert(word), search(word), startsWith(prefix).',
    examples: [
      'Input:\n["Trie", "insert", "search", "search", "startsWith", "insert", "search"]\n[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]\nOutput: [null, null, true, false, true, null, true]',
    ],
    constraints: [
      '1 <= word.length, prefix.length <= 2000',
      'word and prefix consist only of lowercase English letters.',
      'At most 3 * 10^4 calls in total will be made to insert, search, and startsWith.',
    ],
    starterCode: `class Trie {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  insert(word: string): void {\n    // Your solution here\n  }\n\n  search(word: string): boolean {\n    // Your solution here\n  }\n\n  startsWith(prefix: string): boolean {\n    // Your solution here\n  }\n}`,
    testCases: [
      {
        input:
          '(() => { const t = new Trie(); t.insert("apple"); return t.search("apple"); })()',
        expected: 'true',
      },
      {
        input:
          '(() => { const t = new Trie(); t.insert("apple"); return t.search("app"); })()',
        expected: 'false',
      },
      {
        input:
          '(() => { const t = new Trie(); t.insert("apple"); return t.startsWith("app"); })()',
        expected: 'true',
      },
    ],
  },
  {
    group: 'Trie',
    id: 'tri-2',
    title: 'Word Search II',
    difficulty: 'Hard',
    pattern: 'Backtracking' as PatternName,
    description:
      'Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.',
    examples: [
      'Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]\nOutput: ["eat","oath"]',
      'Input: board = [["a","b"],["c","d"]], words = ["abcb"]\nOutput: []',
    ],
    constraints: [
      'm == board.length',
      'n == board[i].length',
      '1 <= m, n <= 12',
      'board[i][j] is a lowercase English letter.',
      '1 <= words.length <= 3 * 10^4',
      '1 <= words[i].length <= 10',
      'words[i] consists of lowercase English letters.',
      'All the strings of words are unique.',
    ],
    starterCode: `function findWords(board: string[][], words: string[]): string[] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          'findWords([["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]],["oath","pea","eat","rain"]).sort()',
        expected: '["eat","oath"]',
      },
      {
        input:
          'findWords([["a","b"],["c","d"]],["abcb"])',
        expected: '[]',
      },
    ],
  },
];

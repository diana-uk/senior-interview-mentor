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
    starterCode: {
      typescript: `class Trie {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  insert(word: string): void {\n    // Your solution here\n  }\n\n  search(word: string): boolean {\n    // Your solution here\n  }\n\n  startsWith(prefix: string): boolean {\n    // Your solution here\n  }\n}`,
      python: `class Trie:\n    def __init__(self):\n        # Your solution here\n        pass\n\n    def insert(self, word: str) -> None:\n        pass\n\n    def search(self, word: str) -> bool:\n        pass\n\n    def starts_with(self, prefix: str) -> bool:\n        pass`,
    },
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
    starterCode: {
      typescript: `function findWords(board: string[][], words: string[]): string[] {\n  // Your solution here\n  \n}`,
      python: `def find_words(board: list[list[str]], words: list[str]) -> list[str]:\n    # Your solution here\n    pass`,
    },
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
  {
    group: 'Trie',
    id: 'tri-3',
    title: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    pattern: 'Backtracking' as PatternName,
    description:
      'Design a data structure that supports adding new words and finding if a string matches any previously added string.\n\nImplement the `WordDictionary` class:\n- `WordDictionary()` Initializes the object.\n- `addWord(word)` Adds `word` to the data structure, it can be matched later.\n- `search(word)` Returns `true` if there is any string in the data structure that matches `word` or `false` otherwise. `word` may contain dots `\'.\'` where dots can be matched with any letter.',
    examples: [
      'Input:\n["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]\nOutput: [null,null,null,null,false,true,true,true]',
    ],
    constraints: [
      '1 <= word.length <= 25',
      'word in addWord consists of lowercase English letters.',
      'word in search consist of \'.\' or lowercase English letters.',
      'There will be at most 3 dots in word for search queries.',
      'At most 10^4 calls will be made to addWord and search.',
    ],
    starterCode: {
      typescript: `class WordDictionary {\n  constructor() {\n    // Initialize your data structure here\n  }\n\n  addWord(word: string): void {\n    // Your solution here\n  }\n\n  search(word: string): boolean {\n    // Your solution here\n  }\n}`,
      python: `class WordDictionary:\n    def __init__(self):\n        # Your solution here\n        pass\n\n    def add_word(self, word: str) -> None:\n        pass\n\n    def search(self, word: str) -> bool:\n        pass`,
    },
    testCases: [
      {
        input:
          '(() => { const wd = new WordDictionary(); wd.addWord("bad"); wd.addWord("dad"); wd.addWord("mad"); return wd.search("pad"); })()',
        expected: 'false',
      },
      {
        input:
          '(() => { const wd = new WordDictionary(); wd.addWord("bad"); wd.addWord("dad"); wd.addWord("mad"); return wd.search("bad"); })()',
        expected: 'true',
      },
      {
        input:
          '(() => { const wd = new WordDictionary(); wd.addWord("bad"); wd.addWord("dad"); wd.addWord("mad"); return wd.search(".ad"); })()',
        expected: 'true',
      },
    ],
  },
];

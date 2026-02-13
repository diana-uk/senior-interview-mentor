import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const graphsProblems: FullProblem[] = [
  // ═══════════════════════════════════════════
  // EXISTING
  // ═══════════════════════════════════════════
  {
    group: 'Graphs',
    id: 'gr-1',
    title: 'Number of Islands',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      'Input: grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]\nOutput: 1',
      'Input: grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]\nOutput: 3',
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      "grid[i][j] is '0' or '1'.",
    ],
    starterCode: `function numIslands(grid: string[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          'numIslands([["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]])',
        expected: '1',
      },
      {
        input:
          'numIslands([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]])',
        expected: '3',
      },
      { input: 'numIslands([["1"],["0"]])', expected: '1' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-2',
    title: 'Course Schedule',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.',
    examples: [
      'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true\nExplanation: You can take course 0 then course 1.',
      'Input: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false\nExplanation: Cycle detected.',
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2',
      '0 <= ai, bi < numCourses',
      'All pairs are unique.',
    ],
    starterCode: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'canFinish(2, [[1,0]])', expected: 'true' },
      { input: 'canFinish(2, [[1,0],[0,1]])', expected: 'false' },
      { input: 'canFinish(3, [[1,0],[2,1]])', expected: 'true' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-3',
    title: 'Word Ladder',
    difficulty: 'Hard',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:\n- Every adjacent pair of words differs by a single letter.\n- Every `si` for `1 <= i <= k` is in `wordList`.\n\nGiven two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, or `0` if no such sequence exists.',
    examples: [
      'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5\nExplanation: hit \u2192 hot \u2192 dot \u2192 dog \u2192 cog',
      'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]\nOutput: 0',
    ],
    constraints: [
      '1 <= beginWord.length <= 10',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 5000',
      'All words have the same length.',
      'All words consist of lowercase English letters.',
    ],
    starterCode: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'ladderLength("hit", "cog", ["hot","dot","dog","lot","log","cog"])',
        expected: '5',
      },
      {
        input: 'ladderLength("hit", "cog", ["hot","dot","dog","lot","log"])',
        expected: '0',
      },
      { input: 'ladderLength("a", "c", ["a","b","c"])', expected: '2' },
    ],
  },

  // ═══════════════════════════════════════════
  // NEW
  // ═══════════════════════════════════════════
  {
    group: 'Graphs',
    id: 'gr-4',
    title: 'Clone Graph',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a `val` (int) and a list (`neighbors`) of its neighbors.',
    examples: [
      'Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]]\nExplanation: The graph has 4 nodes. Node 1 connects to nodes 2 and 4. Node 2 connects to nodes 1 and 3. The cloned graph should be a deep copy.',
      'Input: adjList = []\nOutput: []\nExplanation: The graph is empty (null node).',
    ],
    constraints: [
      'The number of nodes in the graph is in the range [0, 100].',
      '1 <= Node.val <= 100',
      'Node.val is unique for each node.',
      'There are no repeated edges and no self-loops in the graph.',
      'The graph is connected and all nodes can be visited starting from the given node.',
    ],
    starterCode: `class GNode {\n  val: number;\n  neighbors: GNode[];\n  constructor(val = 0, neighbors: GNode[] = []) {\n    this.val = val;\n    this.neighbors = neighbors;\n  }\n}\n\nfunction cloneGraph(node: GNode | null): GNode | null {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const n1 = new GNode(1); const n2 = new GNode(2); const n3 = new GNode(3); const n4 = new GNode(4); n1.neighbors = [n2,n4]; n2.neighbors = [n1,n3]; n3.neighbors = [n2,n4]; n4.neighbors = [n1,n3]; const c = cloneGraph(n1); return c !== n1 && c!.val === 1 && c!.neighbors.length === 2; })()',
        expected: 'true',
      },
      {
        input: 'cloneGraph(null) === null',
        expected: 'true',
      },
      {
        input:
          '(() => { const n1 = new GNode(1); const c = cloneGraph(n1); return c !== n1 && c!.val === 1 && c!.neighbors.length === 0; })()',
        expected: 'true',
      },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-5',
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      "There is an `m x n` rectangular island that borders both the Pacific Ocean and the Atlantic Ocean. The Pacific ocean touches the island's left and top edges, and the Atlantic ocean touches the island's right and bottom edges.\n\nThe island receives a lot of rain, and the rain water can flow to neighboring cells directly north, south, east, and west if the neighboring cell's height is less than or equal to the current cell's height. Water can flow from any cell adjacent to an ocean into the ocean.\n\nReturn a 2D list of grid coordinates `result` where `result[i] = [ri, ci]` denotes that rain water can flow from cell `(ri, ci)` to both the Pacific and Atlantic oceans.",
    examples: [
      'Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]',
      'Input: heights = [[1]]\nOutput: [[0,0]]',
    ],
    constraints: [
      'm == heights.length',
      'n == heights[r].length',
      '1 <= m, n <= 200',
      '0 <= heights[r][c] <= 10^5',
    ],
    starterCode: `function pacificAtlantic(heights: number[][]): number[][] {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input:
          'JSON.stringify(pacificAtlantic([[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]).sort((a,b) => a[0]-b[0] || a[1]-b[1]))',
        expected: 'JSON.stringify([[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]])',
      },
      {
        input: 'JSON.stringify(pacificAtlantic([[1]]))',
        expected: 'JSON.stringify([[0,0]])',
      },
      {
        input:
          'JSON.stringify(pacificAtlantic([[1,1],[1,1]]).sort((a,b) => a[0]-b[0] || a[1]-b[1]))',
        expected: 'JSON.stringify([[0,0],[0,1],[1,0],[1,1]])',
      },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-6',
    title: 'Number of Connected Components',
    difficulty: 'Medium',
    pattern: 'Union-Find' as PatternName,
    description:
      'You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [ai, bi]` indicates that there is an edge between `ai` and `bi` in the graph. Return the number of connected components in the graph.',
    examples: [
      'Input: n = 5, edges = [[0,1],[1,2],[3,4]]\nOutput: 2',
      'Input: n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]\nOutput: 1',
    ],
    constraints: [
      '1 <= n <= 2000',
      '1 <= edges.length <= 5000',
      'edges[i].length == 2',
      '0 <= ai <= bi < n',
      'ai != bi',
      'There are no repeated edges.',
    ],
    starterCode: `function countComponents(n: number, edges: number[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'countComponents(5, [[0,1],[1,2],[3,4]])', expected: '2' },
      { input: 'countComponents(5, [[0,1],[1,2],[2,3],[3,4]])', expected: '1' },
      { input: 'countComponents(4, [[2,3],[1,2],[1,3]])', expected: '2' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-7',
    title: 'Max Area of Island',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'You are given an `m x n` binary matrix `grid`. An island is a group of `1`\'s (representing land) connected 4-directionally (horizontal or vertical). You may assume all four edges of the grid are surrounded by water.\n\nThe area of an island is the number of cells with a value `1` in the island.\n\nReturn the maximum area of an island in `grid`. If there is no island, return `0`.',
    examples: [
      'Input: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]\nOutput: 6',
      'Input: grid = [[0,0,0,0,0,0,0,0]]\nOutput: 0',
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 50',
      'grid[i][j] is either 0 or 1.',
    ],
    starterCode: `function maxAreaOfIsland(grid: number[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      {
        input: 'maxAreaOfIsland([[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,1,0,0,0]])',
        expected: '3',
      },
      { input: 'maxAreaOfIsland([[0,0,0,0]])', expected: '0' },
      { input: 'maxAreaOfIsland([[1]])', expected: '1' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-8',
    title: 'Walls and Gates',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'You are given an `m x n` grid `rooms` initialized with these three possible values:\n- `-1` — A wall or an obstacle.\n- `0` — A gate.\n- `2147483647` — Infinity means an empty room.\n\nFill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, leave it as `2147483647`.',
    examples: [
      'Input: rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]\nOutput: [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]',
    ],
    constraints: [
      'm == rooms.length',
      'n == rooms[i].length',
      '1 <= m, n <= 250',
      'rooms[i][j] is -1, 0, or 2147483647.',
    ],
    starterCode: `function wallsAndGates(rooms: number[][]): void {\n  // Your solution here (modify rooms in-place)\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const r = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]; wallsAndGates(r); return JSON.stringify(r); })()',
        expected: 'JSON.stringify([[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]])',
      },
      {
        input:
          '(() => { const r = [[-1]]; wallsAndGates(r); return JSON.stringify(r); })()',
        expected: 'JSON.stringify([[-1]])',
      },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-9',
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'You are given an `m x n` `grid` where each cell can have one of three values:\n- `0` representing an empty cell,\n- `1` representing a fresh orange, or\n- `2` representing a rotten orange.\n\nEvery minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.\n\nReturn the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return `-1`.',
    examples: [
      'Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4',
      'Input: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1\nExplanation: The orange in the bottom left corner (row 2, column 0) is never rotten.',
      'Input: grid = [[0,2]]\nOutput: 0',
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 10',
      'grid[i][j] is 0, 1, or 2.',
    ],
    starterCode: `function orangesRotting(grid: number[][]): number {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'orangesRotting([[2,1,1],[1,1,0],[0,1,1]])', expected: '4' },
      { input: 'orangesRotting([[2,1,1],[0,1,1],[1,0,1]])', expected: '-1' },
      { input: 'orangesRotting([[0,2]])', expected: '0' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-10',
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      "Given an `m x n` matrix `board` containing `'X'` and `'O'`, capture all regions that are 4-directionally surrounded by `'X'`.\n\nA region is captured by flipping all `'O'`s into `'X'`s in that surrounded region.\n\nAn `'O'` on the border of the board is not surrounded. Any `'O'` that is connected to an `'O'` on the border is also not surrounded.",
    examples: [
      'Input: board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]\nOutput: [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]',
      'Input: board = [["X"]]\nOutput: [["X"]]',
    ],
    constraints: [
      'm == board.length',
      'n == board[i].length',
      '1 <= m, n <= 200',
      "board[i][j] is 'X' or 'O'.",
    ],
    starterCode: `function solve(board: string[][]): void {\n  // Your solution here (modify board in-place)\n  \n}`,
    testCases: [
      {
        input:
          '(() => { const b = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]; solve(b); return JSON.stringify(b); })()',
        expected: 'JSON.stringify([["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]])',
      },
      {
        input:
          '(() => { const b = [["X"]]; solve(b); return JSON.stringify(b); })()',
        expected: 'JSON.stringify([["X"]])',
      },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-11',
    title: 'Course Schedule II',
    difficulty: 'Medium',
    pattern: 'Topological Sort' as PatternName,
    description:
      'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`.\n\nReturn the ordering of courses you should take to finish all courses. If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.',
    examples: [
      'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: [0,1]',
      'Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,2,1,3]\nExplanation: There are a total of 4 courses. One possible ordering is [0,1,2,3]. Another is [0,2,1,3].',
      'Input: numCourses = 1, prerequisites = []\nOutput: [0]',
    ],
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= numCourses * (numCourses - 1)',
      'prerequisites[i].length == 2',
      '0 <= ai, bi < numCourses',
      'ai != bi',
      'All pairs [ai, bi] are distinct.',
    ],
    starterCode: `function findOrder(numCourses: number, prerequisites: number[][]): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'findOrder(2, [[1,0]])', expected: '[0,1]' },
      { input: 'findOrder(1, [])', expected: '[0]' },
      { input: 'findOrder(2, [[1,0],[0,1]]).length', expected: '0' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-12',
    title: 'Graph Valid Tree',
    difficulty: 'Medium',
    pattern: 'Union-Find' as PatternName,
    description:
      'You have a graph of `n` nodes labeled from `0` to `n - 1`. You are given an integer `n` and a list of `edges` where `edges[i] = [ai, bi]` indicates that there is an undirected edge between nodes `ai` and `bi` in the graph.\n\nReturn `true` if the edges of the given graph make up a valid tree, and `false` otherwise.\n\nA valid tree has exactly `n - 1` edges, is connected, and has no cycles.',
    examples: [
      'Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]\nOutput: true',
      'Input: n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]\nOutput: false',
    ],
    constraints: [
      '1 <= n <= 2000',
      '0 <= edges.length <= 5000',
      'edges[i].length == 2',
      '0 <= ai, bi < n',
      'ai != bi',
      'There are no self-loops or repeated edges.',
    ],
    starterCode: `function validTree(n: number, edges: number[][]): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'validTree(5, [[0,1],[0,2],[0,3],[1,4]])', expected: 'true' },
      { input: 'validTree(5, [[0,1],[1,2],[2,3],[1,3],[1,4]])', expected: 'false' },
      { input: 'validTree(1, [])', expected: 'true' },
    ],
  },
  {
    group: 'Graphs',
    id: 'gr-13',
    title: 'Redundant Connection',
    difficulty: 'Medium',
    pattern: 'Union-Find' as PatternName,
    description:
      'In this problem, a tree is an undirected graph that is connected and has no cycles.\n\nYou are given a graph that started as a tree with `n` nodes labeled from `1` to `n`, with one additional edge added. The added edge has two different vertices chosen from `1` to `n`, and was not an edge that already existed.\n\nThe graph is represented as an array `edges` of length `n` where `edges[i] = [ai, bi]` indicates that there is an edge between nodes `ai` and `bi` in the graph.\n\nReturn an edge that can be removed so that the resulting graph is a tree of `n` nodes. If there are multiple answers, return the answer that occurs last in the input.',
    examples: [
      'Input: edges = [[1,2],[1,3],[2,3]]\nOutput: [2,3]',
      'Input: edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]\nOutput: [1,4]',
    ],
    constraints: [
      'n == edges.length',
      '3 <= n <= 1000',
      'edges[i].length == 2',
      '1 <= ai < bi <= edges.length',
      'ai != bi',
      'There are no repeated edges.',
      'The given graph is connected.',
    ],
    starterCode: `function findRedundantConnection(edges: number[][]): number[] {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'findRedundantConnection([[1,2],[1,3],[2,3]])', expected: '[2,3]' },
      { input: 'findRedundantConnection([[1,2],[2,3],[3,4],[1,4],[1,5]])', expected: '[1,4]' },
    ],
  },
];

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
];

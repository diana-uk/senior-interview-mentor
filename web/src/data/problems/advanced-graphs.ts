import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const advancedGraphsProblems: FullProblem[] = [
  {
    group: 'Advanced Graphs',
    id: 'ag-1',
    title: 'Reconstruct Itinerary',
    difficulty: 'Hard',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'You are given a list of airline `tickets` where `tickets[i] = [fromi, toi]` represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it.\n\nAll of the tickets belong to a man who departs from `"JFK"`, thus, the itinerary must begin with `"JFK"`. If there are multiple valid itineraries, you should return the itinerary that has the smallest lexical order when read as a single string.',
    examples: [
      'Input: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\nOutput: ["JFK","MUC","LHR","SFO","SJC"]',
      'Input: tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]\nOutput: ["JFK","ATL","JFK","SFO","ATL","SFO"]',
    ],
    constraints: [
      '1 <= tickets.length <= 300',
      'tickets[i].length == 2',
      'fromi.length == 3',
      'toi.length == 3',
      'fromi and toi consist of uppercase English letters.',
      'fromi != toi',
    ],
    starterCode: {
      typescript: `function findItinerary(tickets: string[][]): string[] {\n  // Your solution here\n  \n}`,
      python: `def find_itinerary(tickets: list[list[str]]) -> list[str]:\n    # Your solution here\n    pass`,
    },
    testCases: [
      {
        input: 'findItinerary([["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]])',
        expected: '["JFK","MUC","LHR","SFO","SJC"]',
      },
      {
        input: 'findItinerary([["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]])',
        expected: '["JFK","ATL","JFK","SFO","ATL","SFO"]',
      },
    ],
  },
  {
    group: 'Advanced Graphs',
    id: 'ag-2',
    title: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    pattern: 'Greedy' as PatternName,
    description:
      'You are given an array `points` representing integer coordinates of some points on a 2D-plane, where `points[i] = [xi, yi]`.\n\nThe cost of connecting two points `[xi, yi]` and `[xj, yj]` is the manhattan distance between them: `|xi - xj| + |yi - yj|`.\n\nReturn the minimum cost to make all points connected. All points are connected if there is exactly one simple path between any two points.',
    examples: [
      'Input: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20',
      'Input: points = [[3,12],[-2,5],[-4,1]]\nOutput: 18',
    ],
    constraints: [
      '1 <= points.length <= 1000',
      '-10^6 <= xi, yi <= 10^6',
      'All pairs (xi, yi) are distinct.',
    ],
    starterCode: {
      typescript: `function minCostConnectPoints(points: number[][]): number {\n  // Your solution here\n  \n}`,
      python: `def min_cost_connect_points(points: list[list[int]]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]])', expected: '20' },
      { input: 'minCostConnectPoints([[3,12],[-2,5],[-4,1]])', expected: '18' },
      { input: 'minCostConnectPoints([[0,0]])', expected: '0' },
    ],
  },
  {
    group: 'Advanced Graphs',
    id: 'ag-3',
    title: 'Network Delay Time',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'You are given a network of `n` nodes, labeled from `1` to `n`. You are also given `times`, a list of travel times as directed edges `times[i] = (ui, vi, wi)`, where `ui` is the source node, `vi` is the target node, and `wi` is the time it takes for a signal to travel from source to target.\n\nWe will send a signal from a given node `k`. Return the minimum time it takes for all the `n` nodes to receive the signal. If it is impossible for all the `n` nodes to receive the signal, return `-1`.',
    examples: [
      'Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2',
      'Input: times = [[1,2,1]], n = 2, k = 1\nOutput: 1',
      'Input: times = [[1,2,1]], n = 2, k = 2\nOutput: -1',
    ],
    constraints: [
      '1 <= k <= n <= 100',
      '1 <= times.length <= 6000',
      'times[i].length == 3',
      '1 <= ui, vi <= n',
      'ui != vi',
      '0 <= wi <= 100',
      'All the pairs (ui, vi) are unique.',
    ],
    starterCode: {
      typescript: `function networkDelayTime(times: number[][], n: number, k: number): number {\n  // Your solution here\n  \n}`,
      python: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2)', expected: '2' },
      { input: 'networkDelayTime([[1,2,1]], 2, 1)', expected: '1' },
      { input: 'networkDelayTime([[1,2,1]], 2, 2)', expected: '-1' },
    ],
  },
  {
    group: 'Advanced Graphs',
    id: 'ag-4',
    title: 'Swim in Rising Water',
    difficulty: 'Hard',
    pattern: 'Binary Search' as PatternName,
    description:
      'You are given an `n x n` integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point `(i, j)`.\n\nThe rain starts to fall. At time `t`, the depth of the water everywhere is `t`. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most `t`.\n\nYou start at the top left square `(0, 0)`. Return the least time until you can reach the bottom right square `(n - 1, n - 1)`.',
    examples: [
      'Input: grid = [[0,2],[1,3]]\nOutput: 3',
      'Input: grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]\nOutput: 16',
    ],
    constraints: [
      'n == grid.length',
      'n == grid[i].length',
      '1 <= n <= 50',
      '0 <= grid[i][j] < n^2',
      'Each value grid[i][j] is unique.',
    ],
    starterCode: {
      typescript: `function swimInWater(grid: number[][]): number {\n  // Your solution here\n  \n}`,
      python: `def swim_in_water(grid: list[list[int]]) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'swimInWater([[0,2],[1,3]])', expected: '3' },
      { input: 'swimInWater([[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]])', expected: '16' },
      { input: 'swimInWater([[0]])', expected: '0' },
    ],
  },
  {
    group: 'Advanced Graphs',
    id: 'ag-5',
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    pattern: 'Topological Sort' as PatternName,
    description:
      'There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you.\n\nYou are given a list of strings `words` from the alien language\'s dictionary, where the strings in `words` are sorted lexicographically by the rules of this new language.\n\nDerive the order of letters in this language, and return it. If the order is invalid, return an empty string. If there are multiple valid orderings, return any of them.',
    examples: [
      'Input: words = ["wrt","wrf","er","ett","rftt"]\nOutput: "wertf"',
      'Input: words = ["z","x"]\nOutput: "zx"',
      'Input: words = ["z","x","z"]\nOutput: ""\nExplanation: The order is invalid, so return "".',
    ],
    constraints: [
      '1 <= words.length <= 100',
      '1 <= words[i].length <= 100',
      'words[i] consists of only lowercase English letters.',
    ],
    starterCode: {
      typescript: `function alienOrder(words: string[]): string {\n  // Your solution here\n  \n}`,
      python: `def alien_order(words: list[str]) -> str:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'alienOrder(["wrt","wrf","er","ett","rftt"])', expected: '"wertf"' },
      { input: 'alienOrder(["z","x"])', expected: '"zx"' },
      { input: 'alienOrder(["z","x","z"])', expected: '""' },
    ],
  },
  {
    group: 'Advanced Graphs',
    id: 'ag-6',
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    pattern: 'BFS/DFS' as PatternName,
    description:
      'There are `n` cities connected by some number of flights. You are given an array `flights` where `flights[i] = [fromi, toi, pricei]` indicates that there is a flight from city `fromi` to city `toi` with cost `pricei`.\n\nYou are also given three integers `src`, `dst`, and `k`, return the cheapest price from `src` to `dst` with at most `k` stops. If there is no such route, return `-1`.',
    examples: [
      'Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1\nOutput: 700\nExplanation: The optimal path with at most 1 stop from city 0 to 3 is 0 -> 1 -> 3 with cost 100 + 600 = 700.',
      'Input: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1\nOutput: 200',
      'Input: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0\nOutput: 500',
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= flights.length <= (n * (n - 1) / 2)',
      'flights[i].length == 3',
      '0 <= fromi, toi < n',
      'fromi != toi',
      '1 <= pricei <= 10^4',
      '0 <= src, dst, k < n',
      'src != dst',
    ],
    starterCode: {
      typescript: `function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {\n  // Your solution here\n  \n}`,
      python: `def find_cheapest_price(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:\n    # Your solution here\n    pass`,
    },
    testCases: [
      { input: 'findCheapestPrice(4, [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], 0, 3, 1)', expected: '700' },
      { input: 'findCheapestPrice(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1)', expected: '200' },
      { input: 'findCheapestPrice(3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 0)', expected: '500' },
    ],
  },
];

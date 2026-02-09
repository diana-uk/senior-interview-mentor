export type PatternName =
  | "sliding-window"
  | "two-pointers"
  | "hashmap"
  | "prefix-sum"
  | "bfs"
  | "dfs"
  | "topological-sort"
  | "union-find"
  | "binary-search"
  | "heap"
  | "intervals"
  | "greedy"
  | "dp"
  | "backtracking"
  | "tree";

export interface PatternMatch {
  pattern: PatternName;
  confidence: number;
  signals: string[];
}

export interface PatternInfo {
  name: PatternName;
  displayName: string;
  description: string;
  template: string;
  timeComplexity: string;
  spaceComplexity: string;
  problems: string[];
}

const PATTERN_SIGNALS: Record<PatternName, string[]> = {
  "sliding-window": [
    "subarray",
    "substring",
    "consecutive",
    "window",
    "contiguous",
    "longest",
    "shortest",
    "maximum sum subarray",
    "minimum length",
  ],
  "two-pointers": [
    "sorted array",
    "pair",
    "two numbers",
    "palindrome",
    "reverse",
    "container with water",
    "three sum",
    "remove duplicates",
  ],
  hashmap: [
    "frequency",
    "count",
    "duplicate",
    "anagram",
    "unique",
    "first non-repeating",
    "group",
    "isomorphic",
  ],
  "prefix-sum": [
    "range sum",
    "subarray sum",
    "cumulative",
    "sum equals k",
    "continuous subarray",
  ],
  bfs: [
    "shortest path",
    "level order",
    "minimum steps",
    "nearest",
    "layer by layer",
    "queue",
    "unweighted graph",
  ],
  dfs: [
    "all paths",
    "explore",
    "traverse",
    "recursive",
    "stack",
    "depth",
    "connected component",
  ],
  "topological-sort": [
    "dependencies",
    "order",
    "prerequisites",
    "course schedule",
    "build order",
    "directed acyclic",
  ],
  "union-find": [
    "connected",
    "groups",
    "clusters",
    "disjoint",
    "union",
    "find",
    "number of islands",
    "accounts merge",
  ],
  "binary-search": [
    "sorted",
    "search",
    "minimum that satisfies",
    "maximum that satisfies",
    "rotated",
    "peak",
    "capacity",
  ],
  heap: [
    "top k",
    "kth largest",
    "kth smallest",
    "median",
    "stream",
    "priority",
    "merge k",
    "schedule",
  ],
  intervals: [
    "intervals",
    "merge",
    "overlap",
    "meeting rooms",
    "insert interval",
    "non-overlapping",
  ],
  greedy: [
    "maximum",
    "minimum",
    "optimal",
    "scheduling",
    "jump game",
    "gas station",
    "task scheduler",
  ],
  dp: [
    "ways to",
    "number of ways",
    "minimum cost",
    "maximum profit",
    "longest increasing",
    "edit distance",
    "knapsack",
    "coin change",
    "house robber",
  ],
  backtracking: [
    "generate all",
    "subsets",
    "permutations",
    "combinations",
    "valid",
    "n-queens",
    "sudoku",
    "word search",
  ],
  tree: [
    "root",
    "leaf",
    "ancestor",
    "bst",
    "binary tree",
    "inorder",
    "preorder",
    "postorder",
    "height",
    "diameter",
  ],
};

const PATTERN_INFO: Record<PatternName, PatternInfo> = {
  "sliding-window": {
    name: "sliding-window",
    displayName: "Sliding Window",
    description:
      "Maintain a window that slides over data to find optimal subarray/substring.",
    template: `function slidingWindow(arr: any[], k: number): number {
  let left = 0;
  let result = 0;
  let windowState = new Map(); // or Set, or number

  for (let right = 0; right < arr.length; right++) {
    // Expand: add arr[right] to window

    // Shrink: while window is invalid
    while (/* condition */) {
      // remove arr[left] from window
      left++;
    }

    // Update result
    result = Math.max(result, right - left + 1);
  }

  return result;
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(k) or O(1)",
    problems: [
      "Longest Substring Without Repeating Characters",
      "Minimum Window Substring",
      "Maximum Sum Subarray of Size K",
      "Longest Repeating Character Replacement",
    ],
  },
  "two-pointers": {
    name: "two-pointers",
    displayName: "Two Pointers",
    description:
      "Use two pointers moving toward each other or in same direction.",
    template: `function twoPointers(arr: number[]): number[] {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    problems: [
      "Two Sum II (sorted)",
      "Container With Most Water",
      "3Sum",
      "Valid Palindrome",
    ],
  },
  hashmap: {
    name: "hashmap",
    displayName: "HashMap / Counting",
    description: "Use hash map for O(1) lookups, counting, or grouping.",
    template: `function hashMapPattern(arr: any[]): any {
  const map = new Map<any, number>();

  for (const item of arr) {
    map.set(item, (map.get(item) || 0) + 1);
  }

  // Use map for lookups, counting, etc.
  return map;
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    problems: ["Two Sum", "Group Anagrams", "Valid Anagram", "First Unique Character"],
  },
  "prefix-sum": {
    name: "prefix-sum",
    displayName: "Prefix Sum",
    description: "Precompute cumulative sums for O(1) range queries.",
    template: `function prefixSum(nums: number[]): number[] {
  const prefix = [0];

  for (const num of nums) {
    prefix.push(prefix[prefix.length - 1] + num);
  }

  // Range sum [i, j] = prefix[j + 1] - prefix[i]
  return prefix;
}`,
    timeComplexity: "O(n) build, O(1) query",
    spaceComplexity: "O(n)",
    problems: [
      "Range Sum Query",
      "Subarray Sum Equals K",
      "Continuous Subarray Sum",
    ],
  },
  bfs: {
    name: "bfs",
    displayName: "BFS (Breadth-First Search)",
    description: "Level-by-level traversal, optimal for shortest path in unweighted graphs.",
    template: `function bfs(start: Node): number {
  const queue: [Node, number][] = [[start, 0]];
  const visited = new Set<Node>([start]);

  while (queue.length > 0) {
    const [node, distance] = queue.shift()!;

    if (isTarget(node)) {
      return distance;
    }

    for (const neighbor of getNeighbors(node)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
  }

  return -1;
}`,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    problems: [
      "Binary Tree Level Order Traversal",
      "Shortest Path in Binary Matrix",
      "Word Ladder",
      "Rotting Oranges",
    ],
  },
  dfs: {
    name: "dfs",
    displayName: "DFS (Depth-First Search)",
    description: "Explore as deep as possible before backtracking.",
    template: `function dfs(node: Node, visited: Set<Node>): void {
  if (!node || visited.has(node)) return;

  visited.add(node);
  // Process node

  for (const neighbor of getNeighbors(node)) {
    dfs(neighbor, visited);
  }
}`,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V) for recursion stack",
    problems: [
      "Number of Islands",
      "Clone Graph",
      "Path Sum",
      "All Paths From Source to Target",
    ],
  },
  "topological-sort": {
    name: "topological-sort",
    displayName: "Topological Sort",
    description: "Order nodes in DAG so all edges point forward.",
    template: `function topologicalSort(numNodes: number, edges: number[][]): number[] {
  const inDegree = new Array(numNodes).fill(0);
  const graph = new Map<number, number[]>();

  for (const [from, to] of edges) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from)!.push(to);
    inDegree[to]++;
  }

  const queue = [];
  for (let i = 0; i < numNodes; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of (graph.get(node) || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result.length === numNodes ? result : []; // cycle if not all nodes
}`,
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    problems: ["Course Schedule", "Course Schedule II", "Alien Dictionary"],
  },
  "union-find": {
    name: "union-find",
    displayName: "Union-Find (Disjoint Set)",
    description: "Track connected components with near O(1) operations.",
    template: `class UnionFind {
  parent: number[];
  rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false;

    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }
}`,
    timeComplexity: "O(α(n)) ≈ O(1) per operation",
    spaceComplexity: "O(n)",
    problems: ["Number of Provinces", "Redundant Connection", "Accounts Merge"],
  },
  "binary-search": {
    name: "binary-search",
    displayName: "Binary Search",
    description: "Divide and conquer on sorted/monotonic data.",
    template: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // or 'left' for insertion point
}`,
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    problems: [
      "Binary Search",
      "Search in Rotated Sorted Array",
      "Find Peak Element",
      "Koko Eating Bananas",
    ],
  },
  heap: {
    name: "heap",
    displayName: "Heap / Priority Queue",
    description: "Maintain min/max efficiently for top-k or streaming problems.",
    template: `// Using array as min-heap (JS doesn't have built-in heap)
// For production, use a proper heap implementation

class MinHeap {
  heap: number[] = [];

  push(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}`,
    timeComplexity: "O(log n) push/pop, O(n) heapify",
    spaceComplexity: "O(n)",
    problems: [
      "Kth Largest Element",
      "Top K Frequent Elements",
      "Merge K Sorted Lists",
      "Find Median from Data Stream",
    ],
  },
  intervals: {
    name: "intervals",
    displayName: "Intervals",
    description: "Sort by start/end and process overlaps.",
    template: `function mergeIntervals(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const result: number[][] = [];

  for (const interval of intervals) {
    if (result.length === 0 || result[result.length - 1][1] < interval[0]) {
      result.push(interval);
    } else {
      result[result.length - 1][1] = Math.max(
        result[result.length - 1][1],
        interval[1]
      );
    }
  }

  return result;
}`,
    timeComplexity: "O(n log n) for sorting",
    spaceComplexity: "O(n)",
    problems: [
      "Merge Intervals",
      "Insert Interval",
      "Meeting Rooms",
      "Non-overlapping Intervals",
    ],
  },
  greedy: {
    name: "greedy",
    displayName: "Greedy",
    description: "Make locally optimal choice at each step.",
    template: `// Greedy approach varies by problem
// Key insight: prove local optimal leads to global optimal

function greedyTemplate(items: any[]): number {
  // Often sort by some criteria first
  items.sort((a, b) => /* criteria */);

  let result = 0;
  for (const item of items) {
    // Make greedy choice
    if (isValidChoice(item)) {
      result += value(item);
    }
  }

  return result;
}`,
    timeComplexity: "O(n log n) typically",
    spaceComplexity: "O(1) or O(n)",
    problems: ["Jump Game", "Gas Station", "Task Scheduler", "Partition Labels"],
  },
  dp: {
    name: "dp",
    displayName: "Dynamic Programming",
    description: "Break into subproblems, store results, build up solution.",
    template: `// 1D DP template
function dp1D(n: number): number {
  const dp = new Array(n + 1).fill(0);
  dp[0] = baseCase;

  for (let i = 1; i <= n; i++) {
    dp[i] = /* recurrence relation using dp[i-1], dp[i-2], etc. */;
  }

  return dp[n];
}

// 2D DP template
function dp2D(m: number, n: number): number {
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= m; i++) dp[i][0] = baseCase;
  for (let j = 0; j <= n; j++) dp[0][j] = baseCase;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = /* recurrence */;
    }
  }

  return dp[m][n];
}`,
    timeComplexity: "O(n) or O(n²) typically",
    spaceComplexity: "O(n) or O(n²), often optimizable",
    problems: [
      "Climbing Stairs",
      "House Robber",
      "Coin Change",
      "Longest Common Subsequence",
    ],
  },
  backtracking: {
    name: "backtracking",
    displayName: "Backtracking",
    description: "Build candidates incrementally, abandon invalid paths.",
    template: `function backtrack(
  result: any[][],
  current: any[],
  choices: any[],
  start: number
): void {
  // Base case: valid solution
  if (isComplete(current)) {
    result.push([...current]);
    return;
  }

  for (let i = start; i < choices.length; i++) {
    // Skip invalid choices
    if (!isValid(choices[i], current)) continue;

    // Make choice
    current.push(choices[i]);

    // Recurse
    backtrack(result, current, choices, i + 1); // i+1 for combinations, i for reuse

    // Undo choice (backtrack)
    current.pop();
  }
}`,
    timeComplexity: "O(2^n) or O(n!) typically",
    spaceComplexity: "O(n) for recursion stack",
    problems: ["Subsets", "Permutations", "Combination Sum", "N-Queens"],
  },
  tree: {
    name: "tree",
    displayName: "Tree Traversal / Recursion",
    description: "Process trees using recursive structure.",
    template: `interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// DFS traversal template
function dfsTree(node: TreeNode | null): number {
  if (!node) return baseCase;

  const leftResult = dfsTree(node.left);
  const rightResult = dfsTree(node.right);

  // Combine results (varies by problem)
  return combine(node.val, leftResult, rightResult);
}

// Level order (BFS)
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const level: number[] = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(h) for DFS, O(w) for BFS",
    problems: [
      "Maximum Depth of Binary Tree",
      "Validate BST",
      "Lowest Common Ancestor",
      "Serialize and Deserialize Binary Tree",
    ],
  },
};

export class PatternDetector {
  detect(problemDescription: string): PatternMatch[] {
    const normalized = problemDescription.toLowerCase();
    const matches: PatternMatch[] = [];

    for (const [pattern, signals] of Object.entries(PATTERN_SIGNALS)) {
      const foundSignals: string[] = [];
      let score = 0;

      for (const signal of signals) {
        if (normalized.includes(signal.toLowerCase())) {
          foundSignals.push(signal);
          score += 1;
        }
      }

      if (foundSignals.length > 0) {
        const confidence = Math.min(95, (score / signals.length) * 100 + score * 10);
        matches.push({
          pattern: pattern as PatternName,
          confidence: Math.round(confidence),
          signals: foundSignals,
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches.slice(0, 3);
  }

  getInfo(pattern: PatternName): PatternInfo | null {
    return PATTERN_INFO[pattern] || null;
  }

  formatDetectionResult(matches: PatternMatch[]): string {
    if (matches.length === 0) {
      return "No pattern detected. Try providing more details about the problem.";
    }

    const lines = ["\nPATTERN DETECTION", "═".repeat(50)];

    for (const match of matches) {
      const info = PATTERN_INFO[match.pattern];
      lines.push(`\n${info.displayName} (${match.confidence}% confidence)`);
      lines.push(`  Signals: ${match.signals.join(", ")}`);
    }

    return lines.join("\n");
  }

  formatPatternInfo(pattern: PatternName): string {
    const info = PATTERN_INFO[pattern];
    if (!info) return `Unknown pattern: ${pattern}`;

    const lines = [
      `\n${"═".repeat(50)}`,
      `${info.displayName.toUpperCase()}`,
      `${"═".repeat(50)}`,
      "",
      info.description,
      "",
      `Time: ${info.timeComplexity}`,
      `Space: ${info.spaceComplexity}`,
      "",
      "TEMPLATE:",
      "```typescript",
      info.template,
      "```",
      "",
      "PRACTICE PROBLEMS:",
      ...info.problems.map((p) => `  • ${p}`),
    ];

    return lines.join("\n");
  }
}

// CLI entry point
const args = process.argv.slice(2);
const command = args[0] || "help";

const detector = new PatternDetector();

switch (command) {
  case "detect":
    const description = args.slice(1).join(" ");
    if (!description) {
      console.log('Usage: npm run pattern -- detect "problem description"');
    } else {
      const matches = detector.detect(description);
      console.log(detector.formatDetectionResult(matches));
    }
    break;

  case "explain":
    const pattern = args[1] as PatternName;
    if (!pattern) {
      console.log("Usage: npm run pattern -- explain <pattern-name>");
      console.log("\nAvailable patterns:");
      for (const p of Object.keys(PATTERN_INFO)) {
        console.log(`  ${p}`);
      }
    } else {
      console.log(detector.formatPatternInfo(pattern));
    }
    break;

  case "similar":
    const p = args[1] as PatternName;
    const info = detector.getInfo(p);
    if (info) {
      console.log(`\nProblems using ${info.displayName}:`);
      info.problems.forEach((prob) => console.log(`  • ${prob}`));
    } else {
      console.log(`Unknown pattern: ${p}`);
    }
    break;

  default:
    console.log("Pattern Detector");
    console.log("================");
    console.log("\nCommands:");
    console.log('  npm run pattern -- detect "description"  Detect pattern from problem');
    console.log("  npm run pattern -- explain <pattern>     Get pattern template");
    console.log("  npm run pattern -- similar <pattern>     Get similar problems");
}

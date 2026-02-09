# Pattern Detector

Heuristic-based algorithm pattern detection from problem descriptions.

## Purpose
- Identify likely algorithm patterns from problem text
- Provide pattern templates and explanations
- Suggest similar problems for practice

## Supported Patterns

| Pattern | Key Signals |
|---------|-------------|
| Sliding Window | "subarray", "substring", "consecutive", "window" |
| Two Pointers | "sorted", "pair", "two numbers", "palindrome" |
| HashMap | "frequency", "count", "duplicate", "anagram" |
| Prefix Sum | "range sum", "subarray sum", "cumulative" |
| BFS | "shortest path", "level", "minimum steps" |
| DFS | "all paths", "combinations", "permutations" |
| Topological Sort | "dependencies", "order", "prerequisites" |
| Union Find | "connected", "groups", "clusters" |
| Binary Search | "sorted", "minimum/maximum that satisfies" |
| Heap | "top k", "kth largest", "median", "stream" |
| Intervals | "merge", "overlap", "meeting rooms" |
| Greedy | "maximum/minimum", "optimal", "scheduling" |
| DP | "ways to", "minimum cost", "maximum profit" |
| Backtracking | "generate all", "subsets", "valid combinations" |
| Tree | "root", "leaf", "ancestor", "BST" |

## Usage

```bash
npm run pattern -- detect "<problem description>"
npm run pattern -- explain <pattern-name>
npm run pattern -- similar <pattern-name>
```

## Examples

```bash
npm run pattern -- detect "Find the longest substring without repeating characters"
# Output: Sliding Window (85% confidence)

npm run pattern -- explain sliding-window
# Output: Template code and explanation

npm run pattern -- similar sliding-window
# Output: Related LeetCode problems
```

## Detection Algorithm

1. Tokenize problem description
2. Match against keyword signals
3. Calculate confidence scores
4. Return top 1-3 patterns with confidence

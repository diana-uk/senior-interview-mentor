# LeetCode Problem Runner

A TypeScript CLI tool for running and testing LeetCode solutions locally.

## Purpose
- Run solutions against test cases
- Validate output format
- Measure execution time
- Support custom test case files

## Usage

```bash
npm run leetcode -- <solution-file> [test-file]

# Examples
npm run leetcode -- solution.ts
npm run leetcode -- solution.ts tests.json
```

## Solution File Format

```typescript
// solution.ts
export function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

## Test File Format

```json
{
  "functionName": "twoSum",
  "cases": [
    {
      "input": [[2, 7, 11, 15], 9],
      "expected": [0, 1]
    },
    {
      "input": [[3, 2, 4], 6],
      "expected": [1, 2]
    }
  ]
}
```

## Output

```
Running: twoSum
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: ✓ PASS (0.12ms)
  Input: [2,7,11,15], 9
  Expected: [0,1]
  Got: [0,1]

Test 2: ✓ PASS (0.08ms)
  Input: [3,2,4], 6
  Expected: [1,2]
  Got: [1,2]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results: 2/2 passed
Total time: 0.20ms
```

# Rubric Scorer

Evaluates coding interview solutions using a structured rubric.

## Purpose
- Score solutions on 6 dimensions (0-4 scale)
- Provide actionable feedback
- Track improvement over time
- Generate targeted drills

## Rubric Dimensions

### 1. Understanding & Assumptions (0-4)
- 0: No clarification, wrong assumptions
- 1: Minimal clarification
- 2: Asked some questions, basic understanding
- 3: Good clarification, correct assumptions
- 4: Excellent clarification, identified edge cases upfront

### 2. Algorithm Correctness (0-4)
- 0: Wrong approach, doesn't solve problem
- 1: Partially correct, major bugs
- 2: Mostly correct, minor bugs
- 3: Correct algorithm, handles main cases
- 4: Optimal solution, all cases handled

### 3. Complexity Analysis (0-4)
- 0: No analysis or completely wrong
- 1: Wrong complexity stated
- 2: Correct but incomplete analysis
- 3: Correct time and space complexity
- 4: Detailed analysis with justification

### 4. Code Quality (0-4)
- 0: Unreadable, no structure
- 1: Poor naming, hard to follow
- 2: Readable but inconsistent
- 3: Clean, well-structured code
- 4: Production-quality, great abstractions

### 5. Edge Cases & Testing (0-4)
- 0: No consideration of edge cases
- 1: Mentioned 1-2 cases
- 2: Listed several cases, no tests
- 3: Good coverage, basic tests
- 4: Comprehensive cases with test code

### 6. Communication (0-4)
- 0: No explanation
- 1: Unclear, hard to follow
- 2: Basic explanation
- 3: Clear walkthrough
- 4: Excellent articulation, proactive updates

## Usage

```bash
npm run score -- <solution-file>

# Examples
npm run score -- solution.ts
```

## Output

```
RUBRIC SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Understanding     ████░  3/4
Correctness       █████  4/4
Complexity        ███░░  2/4
Code Quality      ████░  3/4
Edge Cases        ██░░░  2/4
Communication     ███░░  2/4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 16/24 (67%)
GRADE: B

TOP ISSUES:
1. Complexity analysis incomplete
2. Missing edge cases for empty input
3. Could improve variable naming

RECOMMENDED DRILLS:
- Practice Big O analysis with 5 problems
- Review edge case checklist before coding
```

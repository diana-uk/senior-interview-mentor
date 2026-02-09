# Mock Interview Session

Simulates realistic coding interview experience with timer and follow-ups.

## Purpose
- Replicate real interview pressure
- Practice time management (25-45 minutes)
- Generate senior-level follow-up questions
- Track performance over sessions

## Interview Flow

### Phase 1: Problem Presentation (2 min)
- Present problem clearly
- Allow clarifying questions

### Phase 2: Approach Discussion (5-8 min)
- User proposes approach
- Interviewer asks probing questions
- Complexity analysis required BEFORE coding

### Phase 3: Implementation (15-25 min)
- Code the solution
- Think aloud
- Interviewer may interrupt for:
  - Clarification
  - Edge case reminders
  - Wrong direction warnings

### Phase 4: Testing (5 min)
- Walk through examples
- Identify edge cases
- Write test cases

### Phase 5: Follow-ups (5-10 min)
- Senior-level questions:
  - "What if input is 100x larger?"
  - "How would you monitor this in production?"
  - "Can you optimize space complexity?"

## Usage

```bash
npm run interview -- [topic] [difficulty]

# Examples
npm run interview                    # Random medium problem
npm run interview -- arrays easy
npm run interview -- graphs hard
npm run interview -- dp medium
```

## Topics

- `arrays` - Array manipulation problems
- `strings` - String processing
- `trees` - Binary trees, BST
- `graphs` - BFS, DFS, shortest path
- `dp` - Dynamic programming
- `design` - System design lite
- `mixed` - Random topic selection

## Difficulty

- `easy` - 20 minutes, foundational patterns
- `medium` - 35 minutes, combination of patterns
- `hard` - 45 minutes, complex optimization

## Follow-up Question Bank

### Scalability
- "What if the input doesn't fit in memory?"
- "How would you parallelize this?"
- "What's the bottleneck?"

### Production Readiness
- "How would you test this thoroughly?"
- "What monitoring would you add?"
- "How do you handle failures?"

### Optimization
- "Can you reduce space complexity?"
- "Is there a way to avoid the sorting step?"
- "Can you do this in one pass?"

## Output

After session, generates:
1. Time breakdown by phase
2. Rubric score
3. Areas for improvement
4. Recommended practice problems

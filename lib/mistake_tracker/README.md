# Mistake Tracker

Tracks coding mistakes and schedules spaced repetition practice.

## Purpose
- Log mistakes by category
- Track frequency and patterns
- Schedule review at optimal intervals
- Generate targeted practice problems

## Mistake Categories

| Category | Description | Example |
|----------|-------------|---------|
| `edge-cases` | Missing boundary conditions | Forgot empty array check |
| `off-by-one` | Index or loop errors | `i <= n` instead of `i < n` |
| `complexity` | Wrong time/space analysis | Said O(n) but it's O(n²) |
| `pattern` | Chose wrong algorithm | Used BFS when DFS was better |
| `syntax` | Language-specific errors | Forgot `await`, wrong types |
| `communication` | Unclear explanation | Couldn't articulate tradeoffs |
| `testing` | Insufficient test cases | Missed negative numbers |

## Spaced Repetition Schedule

Based on SuperMemo SM-2 algorithm:
- First review: 1 day
- Second review: 3 days
- Third review: 7 days
- Fourth review: 14 days
- Fifth review: 30 days

Interval increases with successful practice, resets on failure.

## Usage

```bash
# Log a new mistake
npm run mistakes -- log

# View all mistakes
npm run mistakes -- list

# Get stats by category
npm run mistakes -- stats

# Get problems for due reviews
npm run mistakes -- review

# Clear history
npm run mistakes -- clear
```

## Data Storage

Mistakes are stored in `data/mistakes.json`:

```json
{
  "mistakes": [
    {
      "id": "m_001",
      "category": "edge-cases",
      "description": "Forgot to handle empty array in two sum",
      "problem": "two-sum",
      "timestamp": "2024-01-15T10:30:00Z",
      "nextReview": "2024-01-16T10:30:00Z",
      "interval": 1,
      "easeFactor": 2.5
    }
  ]
}
```

## Integration

The AI mentor automatically logs mistakes during:
- Review mode scoring
- Interview mode evaluation
- Solution debugging sessions

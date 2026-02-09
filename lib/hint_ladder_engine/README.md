# Hint Ladder Engine

Manages progressive hint delivery with commitment gating.

## Purpose
- Enforce the commitment gate before revealing solutions
- Deliver hints in 3 progressive levels
- Track hint usage for scoring

## Hint Levels

### Level 1: Nudge
- Pattern name (e.g., "This is a sliding window problem")
- Key invariant to maintain
- Similar problem comparison

### Level 2: Structure
- Recommended data structure
- High-level steps (3-5 bullets)
- Key insight without full algorithm

### Level 3: Pseudocode
- Detailed pseudocode outline
- Still not full working code
- User must implement themselves

## Commitment Gate Requirements

Before ANY hint is given, user must provide:

1. **Constraints Recap** (1-3 bullets)
   - Input size/type
   - Output format
   - Special conditions

2. **Attempted Approach** (at least 1)
   - What they tried
   - Why it didn't work

## Usage

```bash
npm run hint -- <problem-id> <level>

# Examples
npm run hint -- two-sum 1
npm run hint -- longest-substring 2
```

## Programmatic API

```typescript
import { HintEngine } from "./skills/hint_ladder_engine";

const engine = new HintEngine();

// Check if user can receive hints
const canHint = engine.checkGate(userSubmission);

// Get hint at level
const hint = engine.getHint("two-sum", 2);

// Track hint usage
engine.recordHintUsage("two-sum", 2, userId);
```

export type HintLevel = 1 | 2 | 3;

export interface CommitmentGate {
  constraintsRecap: string[];
  chosenPattern: string;
  approachPlan: string[];
  complexityEstimate: {
    time: string;
    space: string;
  };
  edgeCases: string[];
}

export interface HintRequest {
  problemId: string;
  level: HintLevel;
  gateStatus?: Partial<CommitmentGate>;
}

export interface Hint {
  level: HintLevel;
  content: string;
  category: "nudge" | "structure" | "pseudocode";
}

export interface GateValidation {
  passed: boolean;
  missing: string[];
  feedback: string;
}

// Pattern hints database
const PATTERN_HINTS: Record<string, Record<HintLevel, Hint>> = {
  "two-sum": {
    1: {
      level: 1,
      category: "nudge",
      content:
        "Think about what you need to find for each element. Can you store something that lets you check in O(1)?",
    },
    2: {
      level: 2,
      category: "structure",
      content: `Data structure: HashMap (value → index)

Steps:
1. Iterate through array once
2. For each element, calculate what complement you need
3. Check if complement exists in map
4. If yes, return indices. If no, store current element.`,
    },
    3: {
      level: 3,
      category: "pseudocode",
      content: `function twoSum(nums, target):
    map = new HashMap()

    for i from 0 to nums.length:
        complement = target - nums[i]

        if map.has(complement):
            return [map.get(complement), i]

        map.set(nums[i], i)

    return [] // no solution`,
    },
  },
  "sliding-window": {
    1: {
      level: 1,
      category: "nudge",
      content:
        "When you see 'subarray' or 'substring' with a constraint, think sliding window. What defines when to expand vs shrink?",
    },
    2: {
      level: 2,
      category: "structure",
      content: `Data structure: Two pointers (left, right) + HashMap or Set for tracking

Steps:
1. Initialize left = 0, result variable
2. Expand right pointer, add element to window
3. While window is invalid, shrink from left
4. Update result when window is valid
5. Return result`,
    },
    3: {
      level: 3,
      category: "pseudocode",
      content: `function slidingWindow(input, k):
    left = 0
    windowState = new Map() or Set()
    result = initial value

    for right from 0 to input.length:
        // Expand: add input[right] to window
        add(input[right])

        // Shrink: while window invalid
        while windowInvalid():
            remove(input[left])
            left++

        // Update result
        result = better(result, currentWindow)

    return result`,
    },
  },
};

export class HintEngine {
  private hintUsage: Map<string, HintLevel[]> = new Map();

  validateGate(gate: Partial<CommitmentGate>): GateValidation {
    const missing: string[] = [];

    if (!gate.constraintsRecap || gate.constraintsRecap.length === 0) {
      missing.push("constraints recap (1-3 bullets)");
    }

    if (!gate.chosenPattern) {
      missing.push("chosen pattern (e.g., HashMap, sliding window, BFS)");
    }

    if (!gate.approachPlan || gate.approachPlan.length < 4) {
      missing.push("approach plan (4-8 bullet points)");
    }

    if (!gate.complexityEstimate?.time || !gate.complexityEstimate?.space) {
      missing.push("complexity estimate (time AND space)");
    }

    if (!gate.edgeCases || gate.edgeCases.length < 3) {
      missing.push("edge cases (at least 3)");
    }

    const passed = missing.length === 0;

    let feedback: string;
    if (passed) {
      feedback =
        "✓ Commitment gate passed. You may now receive the full solution.";
    } else {
      feedback = `Before I can show you the solution, please provide:\n${missing.map((m) => `  • ${m}`).join("\n")}`;
    }

    return { passed, missing, feedback };
  }

  getHint(problemId: string, level: HintLevel): Hint | null {
    const problemHints = PATTERN_HINTS[problemId];
    if (problemHints) {
      return problemHints[level] || null;
    }

    // Return generic pattern hint if specific problem not found
    const genericPattern = this.detectPattern(problemId);
    if (genericPattern && PATTERN_HINTS[genericPattern]) {
      return PATTERN_HINTS[genericPattern][level];
    }

    return null;
  }

  recordHintUsage(problemId: string, level: HintLevel): void {
    const existing = this.hintUsage.get(problemId) || [];
    if (!existing.includes(level)) {
      existing.push(level);
      this.hintUsage.set(problemId, existing);
    }
  }

  getHintUsage(problemId: string): HintLevel[] {
    return this.hintUsage.get(problemId) || [];
  }

  calculateHintPenalty(problemId: string): number {
    const usage = this.getHintUsage(problemId);
    // Level 1 = -0.25, Level 2 = -0.5, Level 3 = -1.0
    const penalties: Record<HintLevel, number> = { 1: 0.25, 2: 0.5, 3: 1.0 };
    return usage.reduce((sum, level) => sum + penalties[level], 0);
  }

  private detectPattern(problemId: string): string | null {
    const keywords: Record<string, string[]> = {
      "sliding-window": [
        "substring",
        "subarray",
        "window",
        "consecutive",
        "contiguous",
      ],
      "two-sum": ["sum", "pair", "target", "complement"],
    };

    const normalized = problemId.toLowerCase();
    for (const [pattern, words] of Object.entries(keywords)) {
      if (words.some((w) => normalized.includes(w))) {
        return pattern;
      }
    }
    return null;
  }
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length >= 2) {
  const engine = new HintEngine();
  const problemId = args[0];
  const level = parseInt(args[1]) as HintLevel;

  if (![1, 2, 3].includes(level)) {
    console.error("Hint level must be 1, 2, or 3");
    process.exit(1);
  }

  const hint = engine.getHint(problemId, level);

  if (hint) {
    console.log(`\n${"═".repeat(50)}`);
    console.log(`HINT LEVEL ${level}: ${hint.category.toUpperCase()}`);
    console.log(`${"═".repeat(50)}\n`);
    console.log(hint.content);
    console.log(`\n${"═".repeat(50)}\n`);
  } else {
    console.log(`No hints available for: ${problemId}`);
  }
} else {
  console.log("Usage: npm run hint -- <problem-id> <level>");
  console.log("\nLevels:");
  console.log("  1 - Nudge (pattern/invariant)");
  console.log("  2 - Structure (data structure + steps)");
  console.log("  3 - Pseudocode (detailed outline)");
}

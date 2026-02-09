export interface RubricScore {
  understanding: number;
  correctness: number;
  complexity: number;
  codeQuality: number;
  edgeCases: number;
  communication: number;
}

export interface ScoreResult {
  scores: RubricScore;
  total: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  issues: string[];
  drills: string[];
}

export interface SolutionSubmission {
  code: string;
  explanation?: string;
  complexityAnalysis?: {
    time: string;
    space: string;
    justification?: string;
  };
  edgeCasesListed?: string[];
  testCases?: string[];
}

const DIMENSION_NAMES: Record<keyof RubricScore, string> = {
  understanding: "Understanding",
  correctness: "Correctness",
  complexity: "Complexity",
  codeQuality: "Code Quality",
  edgeCases: "Edge Cases",
  communication: "Communication",
};

const DRILL_SUGGESTIONS: Record<keyof RubricScore, string[]> = {
  understanding: [
    "Practice problem clarification with 5 problems - write down all assumptions",
    "Review the 'REACTO' framework for problem solving",
    "Create a checklist of clarifying questions to ask",
  ],
  correctness: [
    "Trace through your algorithm by hand before coding",
    "Implement 3 problems using TDD approach",
    "Practice identifying off-by-one errors",
  ],
  complexity: [
    "Analyze time complexity of 10 common algorithms",
    "Learn to identify hidden loops (map/filter operations)",
    "Practice space complexity with recursion problems",
  ],
  codeQuality: [
    "Refactor 3 solutions focusing on naming",
    "Extract helper functions in next 5 problems",
    "Review TypeScript best practices guide",
  ],
  edgeCases: [
    "Create edge case checklist: empty, single, duplicates, negative, overflow",
    "Write tests BEFORE implementation for next 3 problems",
    "Review common edge cases for arrays, strings, trees",
  ],
  communication: [
    "Practice thinking aloud while solving",
    "Record yourself explaining a solution",
    "Use structured format: approach → tradeoffs → implementation",
  ],
};

export class RubricScorer {
  private history: ScoreResult[] = [];

  score(submission: SolutionSubmission): RubricScore {
    // This is a heuristic scorer - in practice, the AI mentor
    // would provide these scores based on conversation context
    const scores: RubricScore = {
      understanding: this.scoreUnderstanding(submission),
      correctness: this.scoreCorrectness(submission),
      complexity: this.scoreComplexity(submission),
      codeQuality: this.scoreCodeQuality(submission),
      edgeCases: this.scoreEdgeCases(submission),
      communication: this.scoreCommunication(submission),
    };
    return scores;
  }

  evaluate(scores: RubricScore): ScoreResult {
    const total = Object.values(scores).reduce((sum, s) => sum + s, 0);
    const maxTotal = 24;
    const percentage = Math.round((total / maxTotal) * 100);

    const grade = this.calculateGrade(percentage);
    const issues = this.identifyIssues(scores);
    const drills = this.suggestDrills(scores);

    const result: ScoreResult = {
      scores,
      total,
      maxTotal,
      percentage,
      grade,
      issues,
      drills,
    };

    this.history.push(result);
    return result;
  }

  formatReport(result: ScoreResult): string {
    const lines: string[] = [];

    lines.push("\nRUBRIC SCORE");
    lines.push("━".repeat(45));

    for (const [key, value] of Object.entries(result.scores)) {
      const name = DIMENSION_NAMES[key as keyof RubricScore].padEnd(16);
      const bar = "█".repeat(value) + "░".repeat(4 - value);
      lines.push(`${name} ${bar}  ${value}/4`);
    }

    lines.push("━".repeat(45));
    lines.push(`TOTAL: ${result.total}/${result.maxTotal} (${result.percentage}%)`);
    lines.push(`GRADE: ${result.grade}`);

    if (result.issues.length > 0) {
      lines.push("\nTOP ISSUES:");
      result.issues.forEach((issue, i) => {
        lines.push(`${i + 1}. ${issue}`);
      });
    }

    if (result.drills.length > 0) {
      lines.push("\nRECOMMENDED DRILLS:");
      result.drills.forEach((drill) => {
        lines.push(`• ${drill}`);
      });
    }

    lines.push("");
    return lines.join("\n");
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B+";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C+";
    if (percentage >= 50) return "C";
    return "Needs Improvement";
  }

  private identifyIssues(scores: RubricScore): string[] {
    const issues: string[] = [];
    const entries = Object.entries(scores) as [keyof RubricScore, number][];

    // Sort by score ascending to find weakest areas
    entries.sort((a, b) => a[1] - b[1]);

    for (const [key, value] of entries) {
      if (value <= 2 && issues.length < 3) {
        issues.push(this.getIssueDescription(key, value));
      }
    }

    return issues;
  }

  private getIssueDescription(dimension: keyof RubricScore, score: number): string {
    const descriptions: Record<keyof RubricScore, Record<number, string>> = {
      understanding: {
        0: "No problem clarification - always ask questions first",
        1: "Minimal clarification - dig deeper into constraints",
        2: "Basic understanding - consider non-obvious constraints",
      },
      correctness: {
        0: "Algorithm doesn't solve the problem - revisit approach",
        1: "Major bugs present - trace through with examples",
        2: "Minor bugs - careful with boundary conditions",
      },
      complexity: {
        0: "No complexity analysis provided",
        1: "Complexity analysis incorrect",
        2: "Complexity analysis incomplete - include space",
      },
      codeQuality: {
        0: "Code is unreadable - focus on structure",
        1: "Poor variable naming - use descriptive names",
        2: "Inconsistent style - apply formatting rules",
      },
      edgeCases: {
        0: "No edge cases considered",
        1: "Only 1-2 edge cases - need more coverage",
        2: "Edge cases listed but not tested",
      },
      communication: {
        0: "No explanation provided",
        1: "Explanation unclear - structure your thoughts",
        2: "Basic explanation - walk through more deliberately",
      },
    };

    return descriptions[dimension][score] || `Improve ${dimension}`;
  }

  private suggestDrills(scores: RubricScore): string[] {
    const drills: string[] = [];
    const entries = Object.entries(scores) as [keyof RubricScore, number][];

    for (const [key, value] of entries) {
      if (value <= 2) {
        const suggestions = DRILL_SUGGESTIONS[key];
        if (suggestions.length > 0 && drills.length < 3) {
          drills.push(suggestions[0]);
        }
      }
    }

    return drills;
  }

  // Heuristic scoring functions (simplified)
  private scoreUnderstanding(submission: SolutionSubmission): number {
    if (!submission.explanation) return 1;
    const hasConstraints = /constraint|assume|input|output/i.test(submission.explanation);
    return hasConstraints ? 3 : 2;
  }

  private scoreCorrectness(submission: SolutionSubmission): number {
    // Would need actual test execution - placeholder
    return 3;
  }

  private scoreComplexity(submission: SolutionSubmission): number {
    if (!submission.complexityAnalysis) return 0;
    const { time, space, justification } = submission.complexityAnalysis;
    if (!time || !space) return 1;
    if (!justification) return 2;
    return 3;
  }

  private scoreCodeQuality(submission: SolutionSubmission): number {
    const code = submission.code;
    const hasTypes = /:\s*(number|string|boolean|Array|Map|Set)/i.test(code);
    const hasGoodNames = !/\b[a-z]\b/.test(code.replace(/['"]/g, "")); // No single-letter vars
    const hasComments = /\/\/|\/\*/.test(code);

    let score = 2;
    if (hasTypes) score++;
    if (hasGoodNames || hasComments) score++;
    return Math.min(score, 4);
  }

  private scoreEdgeCases(submission: SolutionSubmission): number {
    const count = submission.edgeCasesListed?.length || 0;
    const hasTests = submission.testCases && submission.testCases.length > 0;

    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (!hasTests) return 2;
    return count >= 5 ? 4 : 3;
  }

  private scoreCommunication(submission: SolutionSubmission): number {
    if (!submission.explanation) return 0;
    const length = submission.explanation.length;
    if (length < 50) return 1;
    if (length < 150) return 2;
    return 3;
  }
}

// CLI entry point
const args = process.argv.slice(2);

if (args.includes("--demo")) {
  const scorer = new RubricScorer();

  // Demo with sample scores
  const demoScores: RubricScore = {
    understanding: 3,
    correctness: 4,
    complexity: 2,
    codeQuality: 3,
    edgeCases: 2,
    communication: 2,
  };

  const result = scorer.evaluate(demoScores);
  console.log(scorer.formatReport(result));
} else {
  console.log("Rubric Scorer");
  console.log("=============");
  console.log("\nUsage: npm run score -- --demo");
  console.log("\nIn practice, the AI mentor provides scores during review mode.");
  console.log("This tool formats and tracks those scores.");
}

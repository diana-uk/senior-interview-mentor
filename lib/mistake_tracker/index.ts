import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export type MistakeCategory =
  | "edge-cases"
  | "off-by-one"
  | "complexity"
  | "pattern"
  | "syntax"
  | "communication"
  | "testing";

export interface Mistake {
  id: string;
  category: MistakeCategory;
  description: string;
  problem?: string;
  timestamp: string;
  nextReview: string;
  interval: number; // days
  easeFactor: number;
  reviewCount: number;
}

export interface MistakeData {
  mistakes: Mistake[];
}

const DATA_PATH = resolve("data/mistakes.json");

const CATEGORY_LABELS: Record<MistakeCategory, string> = {
  "edge-cases": "Edge Cases",
  "off-by-one": "Off-by-One",
  complexity: "Complexity",
  pattern: "Pattern Choice",
  syntax: "Syntax",
  communication: "Communication",
  testing: "Testing",
};

const PRACTICE_PROBLEMS: Record<MistakeCategory, string[]> = {
  "edge-cases": [
    "Two Sum (empty array, single element)",
    "Valid Palindrome (empty string, single char)",
    "Merge Intervals (no intervals, single interval)",
  ],
  "off-by-one": [
    "Binary Search (practice boundaries)",
    "Sliding Window Maximum",
    "Rotate Array",
  ],
  complexity: [
    "Analyze: nested loops with early break",
    "Analyze: recursive Fibonacci",
    "Analyze: BFS on tree vs graph",
  ],
  pattern: [
    "Subarray Sum Equals K (prefix sum vs sliding window)",
    "Word Ladder (BFS vs DFS)",
    "House Robber (greedy vs DP)",
  ],
  syntax: [
    "Implement Promise.all from scratch",
    "TypeScript generics practice",
    "Async/await error handling",
  ],
  communication: [
    "Explain merge sort to a junior dev",
    "Walk through your solution for LRU Cache",
    "Describe tradeoffs of array vs linked list",
  ],
  testing: [
    "Write tests for a string reversal function",
    "Create edge case checklist for tree problems",
    "TDD: implement stack with min/max",
  ],
};

export class MistakeTracker {
  private data: MistakeData;

  constructor() {
    this.data = this.load();
  }

  private load(): MistakeData {
    if (existsSync(DATA_PATH)) {
      const raw = readFileSync(DATA_PATH, "utf-8");
      return JSON.parse(raw);
    }
    return { mistakes: [] };
  }

  private save(): void {
    const dir = dirname(DATA_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(DATA_PATH, JSON.stringify(this.data, null, 2));
  }

  log(category: MistakeCategory, description: string, problem?: string): Mistake {
    const now = new Date();
    const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day

    const mistake: Mistake = {
      id: `m_${Date.now()}`,
      category,
      description,
      problem,
      timestamp: now.toISOString(),
      nextReview: nextReview.toISOString(),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
    };

    this.data.mistakes.push(mistake);
    this.save();
    return mistake;
  }

  list(): Mistake[] {
    return this.data.mistakes;
  }

  getDueForReview(): Mistake[] {
    const now = new Date();
    return this.data.mistakes.filter(
      (m) => new Date(m.nextReview) <= now
    );
  }

  recordReview(id: string, quality: number): void {
    // quality: 0-5 (0-2 = fail, 3-5 = pass)
    const mistake = this.data.mistakes.find((m) => m.id === id);
    if (!mistake) return;

    mistake.reviewCount++;

    if (quality < 3) {
      // Failed - reset interval
      mistake.interval = 1;
    } else {
      // Passed - increase interval using SM-2
      if (mistake.reviewCount === 1) {
        mistake.interval = 1;
      } else if (mistake.reviewCount === 2) {
        mistake.interval = 3;
      } else {
        mistake.interval = Math.round(mistake.interval * mistake.easeFactor);
      }

      // Adjust ease factor
      mistake.easeFactor = Math.max(
        1.3,
        mistake.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
    }

    const now = new Date();
    mistake.nextReview = new Date(
      now.getTime() + mistake.interval * 24 * 60 * 60 * 1000
    ).toISOString();

    this.save();
  }

  getStats(): Record<MistakeCategory, number> {
    const stats = {} as Record<MistakeCategory, number>;
    for (const category of Object.keys(CATEGORY_LABELS) as MistakeCategory[]) {
      stats[category] = 0;
    }
    for (const mistake of this.data.mistakes) {
      stats[mistake.category]++;
    }
    return stats;
  }

  getSuggestedPractice(): { category: MistakeCategory; problems: string[] }[] {
    const stats = this.getStats();
    const sorted = (Object.entries(stats) as [MistakeCategory, number][])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    return sorted.slice(0, 3).map(([category]) => ({
      category,
      problems: PRACTICE_PROBLEMS[category],
    }));
  }

  clear(): void {
    this.data = { mistakes: [] };
    this.save();
  }

  formatList(): string {
    const mistakes = this.list();
    if (mistakes.length === 0) {
      return "No mistakes logged yet. Great job, or start practicing!";
    }

    const lines = ["MISTAKE LOG", "═".repeat(50)];

    for (const m of mistakes) {
      const date = new Date(m.timestamp).toLocaleDateString();
      lines.push(`\n[${m.id}] ${date} - ${CATEGORY_LABELS[m.category]}`);
      lines.push(`  ${m.description}`);
      if (m.problem) lines.push(`  Problem: ${m.problem}`);
      lines.push(`  Next review: ${new Date(m.nextReview).toLocaleDateString()}`);
    }

    return lines.join("\n");
  }

  formatStats(): string {
    const stats = this.getStats();
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    if (total === 0) {
      return "No mistakes logged yet.";
    }

    const lines = ["\nMISTAKE STATS", "═".repeat(40)];

    const sorted = (Object.entries(stats) as [MistakeCategory, number][])
      .sort((a, b) => b[1] - a[1]);

    for (const [category, count] of sorted) {
      const pct = Math.round((count / total) * 100);
      const bar = "█".repeat(Math.ceil(pct / 5)) + "░".repeat(20 - Math.ceil(pct / 5));
      lines.push(`${CATEGORY_LABELS[category].padEnd(15)} ${bar} ${count} (${pct}%)`);
    }

    lines.push(`\nTotal: ${total} mistakes tracked`);

    const suggestions = this.getSuggestedPractice();
    if (suggestions.length > 0) {
      lines.push("\nFOCUS AREAS:");
      for (const { category, problems } of suggestions) {
        lines.push(`\n${CATEGORY_LABELS[category]}:`);
        problems.forEach((p) => lines.push(`  • ${p}`));
      }
    }

    return lines.join("\n");
  }
}

// CLI entry point
const args = process.argv.slice(2);
const command = args[0] || "help";

const tracker = new MistakeTracker();

switch (command) {
  case "log":
    // In practice, this would be interactive
    console.log("Use the AI mentor to log mistakes during sessions.");
    console.log("\nCategories:");
    for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
      console.log(`  ${key.padEnd(15)} - ${label}`);
    }
    break;

  case "list":
    console.log(tracker.formatList());
    break;

  case "stats":
    console.log(tracker.formatStats());
    break;

  case "review":
    const due = tracker.getDueForReview();
    if (due.length === 0) {
      console.log("No reviews due. Check back later!");
    } else {
      console.log(`${due.length} review(s) due:\n`);
      for (const m of due) {
        console.log(`[${m.id}] ${CATEGORY_LABELS[m.category]}: ${m.description}`);
      }
    }
    break;

  case "clear":
    tracker.clear();
    console.log("Mistake history cleared.");
    break;

  default:
    console.log("Mistake Tracker");
    console.log("===============");
    console.log("\nCommands:");
    console.log("  npm run mistakes -- log      Log a new mistake");
    console.log("  npm run mistakes -- list     View all mistakes");
    console.log("  npm run mistakes -- stats    Show statistics");
    console.log("  npm run mistakes -- review   Get due reviews");
    console.log("  npm run mistakes -- clear    Clear history");
}

/**
 * Session Manager
 *
 * Tracks the current problem-solving session state for continuity
 * across conversations. Enables /continue, /recap, and other
 * session-aware commands.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../data/session.json');

// Session mode types
export type SessionMode = 'TEACHER' | 'INTERVIEWER' | 'REVIEWER';

// Commitment gate tracking
export interface CommitmentGate {
  constraintsRecap: boolean;
  chosenPattern: string | null;
  approachPlan: boolean;
  complexityEstimate: boolean;
  edgeCases: boolean;
}

// Interview phase tracking
export type InterviewPhase =
  | 'understanding'
  | 'approach'
  | 'implementation'
  | 'testing'
  | 'followup';

// Full session state
export interface SessionState {
  // Core identification
  problem: string | null;
  mode: SessionMode;
  startedAt: string;
  lastActivityAt: string;

  // Progress tracking
  commitmentGate: CommitmentGate;
  hintLevel: number; // 0-3, 0 = no hints used
  hintsUsed: number[];

  // Interview-specific
  interview?: {
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number; // minutes
    phase: InterviewPhase;
    phaseStartedAt: string;
  };

  // Activity log (last 5 actions)
  activityLog: Array<{
    action: string;
    timestamp: string;
  }>;

  // Problems completed this session
  completedProblems: string[];
}

// Default empty session
function createEmptySession(): SessionState {
  return {
    problem: null,
    mode: 'TEACHER',
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    commitmentGate: {
      constraintsRecap: false,
      chosenPattern: null,
      approachPlan: false,
      complexityEstimate: false,
      edgeCases: false,
    },
    hintLevel: 0,
    hintsUsed: [],
    activityLog: [],
    completedProblems: [],
  };
}

export class SessionManager {
  private state: SessionState;

  constructor() {
    this.state = this.load();
  }

  // Load session from disk
  private load(): SessionState {
    try {
      if (existsSync(DATA_PATH)) {
        const data = readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(data);
      }
    } catch {
      // Return empty session on error
    }
    return createEmptySession();
  }

  // Save session to disk
  private save(): void {
    this.state.lastActivityAt = new Date().toISOString();
    writeFileSync(DATA_PATH, JSON.stringify(this.state, null, 2));
  }

  // Get current session state
  get(): SessionState {
    return this.state;
  }

  // Check if there's an active session
  hasActiveSession(): boolean {
    return this.state.problem !== null;
  }

  // Start a new problem session
  startProblem(problem: string, mode: SessionMode): void {
    this.state = createEmptySession();
    this.state.problem = problem;
    this.state.mode = mode;
    this.state.startedAt = new Date().toISOString();
    this.logActivity(`Started ${problem} in ${mode} mode`);
    this.save();
  }

  // Start interview mode
  startInterview(
    problem: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ): void {
    const timeLimits = { easy: 20, medium: 35, hard: 45 };

    this.state = createEmptySession();
    this.state.problem = problem;
    this.state.mode = 'INTERVIEWER';
    this.state.interview = {
      topic,
      difficulty,
      timeLimit: timeLimits[difficulty],
      phase: 'understanding',
      phaseStartedAt: new Date().toISOString(),
    };
    this.logActivity(`Started interview: ${problem} (${difficulty})`);
    this.save();
  }

  // Update commitment gate
  updateGate(updates: Partial<CommitmentGate>): void {
    this.state.commitmentGate = { ...this.state.commitmentGate, ...updates };
    this.logActivity('Updated commitment gate');
    this.save();
  }

  // Get commitment gate completion count
  getGateProgress(): { completed: number; total: number; missing: string[] } {
    const gate = this.state.commitmentGate;
    const missing: string[] = [];

    if (!gate.constraintsRecap) missing.push('Constraints recap');
    if (!gate.chosenPattern) missing.push('Chosen pattern');
    if (!gate.approachPlan) missing.push('Approach plan');
    if (!gate.complexityEstimate) missing.push('Complexity estimate');
    if (!gate.edgeCases) missing.push('Edge cases');

    return {
      completed: 5 - missing.length,
      total: 5,
      missing,
    };
  }

  // Record hint usage
  useHint(level: number): void {
    this.state.hintLevel = Math.max(this.state.hintLevel, level);
    if (!this.state.hintsUsed.includes(level)) {
      this.state.hintsUsed.push(level);
    }
    this.logActivity(`Used hint level ${level}`);
    this.save();
  }

  // Get next hint level
  getNextHintLevel(): number {
    return Math.min(this.state.hintLevel + 1, 3);
  }

  // Calculate hint penalty
  getHintPenalty(): number {
    const penalties: Record<number, number> = { 1: 0.25, 2: 0.5, 3: 1.0 };
    return this.state.hintsUsed.reduce((sum, level) => sum + (penalties[level] || 0), 0);
  }

  // Update interview phase
  setInterviewPhase(phase: InterviewPhase): void {
    if (this.state.interview) {
      this.state.interview.phase = phase;
      this.state.interview.phaseStartedAt = new Date().toISOString();
      this.logActivity(`Entered ${phase} phase`);
      this.save();
    }
  }

  // Get elapsed time in minutes (for interviews)
  getElapsedMinutes(): number {
    const start = new Date(this.state.startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 60000);
  }

  // Get time remaining (for interviews)
  getTimeRemaining(): number | null {
    if (!this.state.interview) return null;
    return Math.max(0, this.state.interview.timeLimit - this.getElapsedMinutes());
  }

  // Complete current problem
  completeProblem(): void {
    if (this.state.problem) {
      this.state.completedProblems.push(this.state.problem);
      this.logActivity(`Completed ${this.state.problem}`);
    }
    this.state.problem = null;
    this.save();
  }

  // Log activity (keep last 10)
  private logActivity(action: string): void {
    this.state.activityLog.unshift({
      action,
      timestamp: new Date().toISOString(),
    });
    this.state.activityLog = this.state.activityLog.slice(0, 10);
  }

  // Get last activity
  getLastActivity(): string | null {
    return this.state.activityLog[0]?.action || null;
  }

  // Clear session
  clear(): void {
    this.state = createEmptySession();
    this.save();
  }

  // Format session for display
  formatRecap(): string {
    if (!this.state.problem) {
      return 'No active session. Start one with `/solve <problem>` or `/interview`.';
    }

    const gateProgress = this.getGateProgress();
    const gate = this.state.commitmentGate;

    let recap = `## Session Recap\n\n`;
    recap += `**Problem:** ${this.state.problem}\n`;
    recap += `**Mode:** ${this.state.mode}\n`;

    if (this.state.interview) {
      const remaining = this.getTimeRemaining();
      recap += `**Time:** ${this.getElapsedMinutes()} of ${this.state.interview.timeLimit} minutes`;
      if (remaining !== null && remaining <= 5) {
        recap += ` (${remaining} min remaining!)`;
      }
      recap += `\n`;
      recap += `**Phase:** ${this.state.interview.phase}\n`;
    }

    recap += `\n### Commitment Gate (${gateProgress.completed}/5)\n`;
    recap += `- [${gate.constraintsRecap ? 'x' : ' '}] Constraints recap\n`;
    recap += `- [${gate.chosenPattern ? 'x' : ' '}] Chosen pattern${gate.chosenPattern ? `: ${gate.chosenPattern}` : ''}\n`;
    recap += `- [${gate.approachPlan ? 'x' : ' '}] Approach plan\n`;
    recap += `- [${gate.complexityEstimate ? 'x' : ' '}] Complexity estimate\n`;
    recap += `- [${gate.edgeCases ? 'x' : ' '}] Edge cases\n`;

    recap += `\n### Hints\n`;
    recap += `- Level: ${this.state.hintLevel}/3\n`;
    recap += `- Penalty: -${this.getHintPenalty()} points\n`;

    if (this.state.activityLog.length > 0) {
      recap += `\n### Recent Activity\n`;
      this.state.activityLog.slice(0, 5).forEach((log) => {
        recap += `- ${log.action}\n`;
      });
    }

    return recap;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new SessionManager();

  switch (command) {
    case 'status':
    case 'recap':
      console.log(manager.formatRecap());
      break;

    case 'clear':
      manager.clear();
      console.log('Session cleared.');
      break;

    case 'start':
      const problem = args[1] || 'Unknown Problem';
      const mode = (args[2]?.toUpperCase() as SessionMode) || 'TEACHER';
      manager.startProblem(problem, mode);
      console.log(`Started session: ${problem} in ${mode} mode`);
      break;

    case 'hint':
      const level = parseInt(args[1]) || manager.getNextHintLevel();
      manager.useHint(level);
      console.log(`Recorded hint level ${level}. Penalty: -${manager.getHintPenalty()}`);
      break;

    case 'gate':
      const field = args[1];
      const value = args[2];
      if (field === 'pattern' && value) {
        manager.updateGate({ chosenPattern: value });
      } else if (field) {
        manager.updateGate({ [field]: true } as Partial<CommitmentGate>);
      }
      const progress = manager.getGateProgress();
      console.log(`Gate: ${progress.completed}/5 complete`);
      if (progress.missing.length > 0) {
        console.log(`Missing: ${progress.missing.join(', ')}`);
      }
      break;

    case 'complete':
      manager.completeProblem();
      console.log('Problem marked complete.');
      break;

    default:
      console.log(`
Session Manager - Track problem-solving sessions

Commands:
  status, recap  Show current session state
  clear          Clear the session
  start <problem> [mode]  Start a new session
  hint [level]   Record hint usage
  gate <field> [value]  Update commitment gate
  complete       Mark problem as complete

Examples:
  npm run session -- status
  npm run session -- start "Two Sum" TEACHER
  npm run session -- gate pattern "HashMap"
  npm run session -- hint 2
`);
  }
}

main().catch(console.error);

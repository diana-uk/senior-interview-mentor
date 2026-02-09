export type Mode = 'TEACHER' | 'INTERVIEWER' | 'REVIEWER';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type InterviewStage = 'phone' | 'technical' | 'system-design' | 'behavioral' | 'technical-questions';
export type TechnicalFormat = 'leetcode' | 'project';

export type TechnicalQuestionCategory =
  | 'mixed'
  | 'javascript-typescript'
  | 'react-frontend'
  | 'web-performance'
  | 'apis-backend'
  | 'databases'
  | 'distributed-systems'
  | 'security'
  | 'testing-quality'
  | 'behavioral-leadership'
  | 'product-thinking';

export type PatternName =
  | 'Sliding Window'
  | 'Two Pointers'
  | 'HashMap'
  | 'Prefix Sum'
  | 'BFS/DFS'
  | 'Topological Sort'
  | 'Union-Find'
  | 'Binary Search'
  | 'Heap'
  | 'Intervals'
  | 'Greedy'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Trees';

export type TopicName =
  | 'Arrays'
  | 'Strings'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming'
  | 'Binary Search'
  | 'Heap'
  | 'Backtracking'
  | 'Greedy'
  | 'Stack/Queue';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: PatternName;
  description: string;
  examples: string[];
  constraints: string[];
  starterCode: string;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'mentor' | 'user';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatContext {
  mode: Mode;
  currentProblem: {
    title: string;
    difficulty: string;
    pattern: string;
    description: string;
    constraints: string[];
  } | null;
  hintsUsed: number;
  commitmentGateCompleted: number;
  interviewStage: string | null;
  technicalQuestionCategory?: TechnicalQuestionCategory;
}

export interface CommitmentGateItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface HintLevel {
  level: 1 | 2 | 3;
  label: string;
  description: string;
  content: string;
  unlocked: boolean;
  color: string;
}

export interface MistakeEntry {
  id: string;
  pattern: PatternName;
  description: string;
  date: string;
  nextReview: string;
  streak: number;
}

export interface SessionStats {
  problemsSolved: number;
  totalAttempts: number;
  avgScore: number;
  hintsUsed: number;
  streakDays: number;
  rubricScores: {
    category: string;
    score: number;
    maxScore: number;
  }[];
  recentSessions: {
    date: string;
    problem: string;
    score: number;
    mode: Mode;
  }[];
}

export type SystemDesignTopicId =
  | 'url-shortener'
  | 'twitter-timeline'
  | 'notification-system'
  | 'rate-limiter'
  | 'file-storage'
  | 'chat-application'
  | 'custom';

export interface SystemDesignTopic {
  id: SystemDesignTopicId;
  title: string;
  subtitle: string;
  icon: string;
  placeholders: {
    requirements: string;
    api: string;
    data: string;
    architecture: string;
    deepdive: string;
    scaling: string;
  };
}

/* ── System Design Workspace Types ── */

export type SystemDesignPhase =
  | 'overview'
  | 'requirements'
  | 'api'
  | 'data'
  | 'architecture'
  | 'deepdive'
  | 'scaling';

export type PhaseStatus = 'locked' | 'pending' | 'in-progress' | 'completed';

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody: string;
  responseBody: string;
}

export type DbChoice = 'sql' | 'nosql' | 'both' | '';

export interface SystemDesignState {
  active: boolean;
  currentPhase: SystemDesignPhase;
  phaseStatuses: Record<SystemDesignPhase, PhaseStatus>;
  topicTitle: string;
  topicPrompt: string;
  endpoints: Endpoint[];
  schema: string;
  dbChoice: DbChoice;
  dbJustification: string;
}

export type SystemDesignAction =
  | { type: 'INIT'; topicTitle: string; topicPrompt: string }
  | { type: 'SET_PHASE'; phase: SystemDesignPhase }
  | { type: 'SET_PHASE_STATUS'; phase: SystemDesignPhase; status: PhaseStatus }
  | { type: 'UPDATE_ENDPOINTS'; endpoints: Endpoint[] }
  | { type: 'UPDATE_SCHEMA'; schema: string }
  | { type: 'UPDATE_DB_CHOICE'; dbChoice: DbChoice }
  | { type: 'UPDATE_JUSTIFICATION'; justification: string }
  | { type: 'RESET' };

export type EditorTab = 'solution' | 'tests' | 'notes';

export type SidebarPanel = 'interview' | 'problems' | 'mistakes' | 'stats' | null;

export interface AppState {
  mode: Mode;
  currentProblem: Problem | null;
  sidebarPanel: SidebarPanel;
  sidebarOpen: boolean;
  editorTab: EditorTab;
  consoleOpen: boolean;
  interviewModalOpen: boolean;
  commitmentGateOpen: boolean;
  hintsUsed: number;
  timerSeconds: number;
  timerRunning: boolean;
  messages: ChatMessage[];
  editorCode: string;
  testCode: string;
  notes: string;
  testResults: TestCase[];
  commitmentGate: CommitmentGateItem[];
  hints: HintLevel[];
  mobileView: 'chat' | 'editor';
}

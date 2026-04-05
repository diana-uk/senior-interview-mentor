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
  | 'product-thinking'
  | 'custom';

export type PatternName =
  | 'Sliding Window'
  | 'Two Pointers'
  | 'HashMap'
  | 'Prefix Sum'
  | 'Stack'
  | 'Linked List'
  | 'BFS/DFS'
  | 'Topological Sort'
  | 'Union-Find'
  | 'Binary Search'
  | 'Heap'
  | 'Intervals'
  | 'Greedy'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Bit Manipulation'
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

export type SupportedLanguage = 'typescript' | 'javascript' | 'python';

export interface MultiLangCode {
  typescript: string;
  javascript?: string;
  python?: string;
}

export type CompanyTag = 'google' | 'meta' | 'amazon' | 'apple' | 'microsoft' | 'netflix' | 'uber' | 'stripe' | 'airbnb';

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: PatternName;
  description: string;
  examples: string[];
  constraints: string[];
  starterCode: string | MultiLangCode;
  testCases: TestCase[];
  companies?: CompanyTag[];
}

export interface TestCase {
  input: string;
  expected: string;
  actual?: string;
  passed?: boolean;
}

export interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'mentor' | 'user';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface MemoryContext {
  hintStyle: 'analogies' | 'pseudocode' | 'visual' | 'direct';
  detailLevel: 'brief' | 'balanced' | 'detailed';
  solvedProblems: { title: string; pattern: string; difficulty: string }[];
  weakPatterns: { pattern: string; mistakeCount: number; avgScore: number }[];
  strongPatterns: { pattern: string; solveCount: number; avgScore: number }[];
  recentMistakes: { problem: string; description: string }[];
  totalSolved: number;
  currentStreak: number;
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
  language?: SupportedLanguage;
  memory?: MemoryContext;
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
  | 'video-streaming'
  | 'ride-sharing'
  | 'search-engine'
  | 'payment-system'
  | 'news-feed'
  | 'collaborative-editor'
  | 'monitoring-system'
  | 'key-value-store'
  | 'web-crawler'
  | 'proximity-service'
  | 'ticket-booking'
  | 'maps-navigation'
  | 'ad-click-aggregator'
  | 'hotel-reservation'
  | 'custom';

export type SystemComponentType =
  | 'client' | 'load-balancer' | 'api-gateway' | 'service'
  | 'cache' | 'database' | 'queue' | 'cdn' | 'worker' | 'storage'
  | 'dns' | 'firewall' | 'container' | 'stream' | 'third-party' | 'users';

export interface DiagramNodeData {
  label: string;
  componentType: SystemComponentType;
  zoneStyle?: 'vpc' | 'az' | 'cluster';
}

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

/* ── Deep Dive Types ── */

export interface DeepDiveApproach {
  name: string;
  pros: string;
  cons: string;
}

export interface DeepDiveChallenge {
  id: string;
  title: string;
  problem: string;
  approaches: DeepDiveApproach[];
  chosenIndex: number; // -1 = none selected
  justification: string;
  tradeoffs: string;
}

/* ── Scaling Types ── */

export interface CapacityEstimation {
  readQps: string;
  writeQps: string;
  storageDayGb: string;
  storageGrowthTbYr: string;
  bandwidthMbS: string;
  cacheMemGb: string;
}

export type ComputeStrategy = 'horizontal' | 'vertical' | 'both' | '';
export type DbReplication = 'primary-replica' | 'multi-primary' | 'none' | '';
export type DbSharding = 'hash' | 'range' | 'geo' | 'none' | '';
export type CachePattern = 'cache-aside' | 'write-through' | 'write-behind' | 'read-through' | '';
export type EvictionPolicy = 'lru' | 'lfu' | 'ttl' | '';
export type LbAlgorithm = 'round-robin' | 'least-connections' | 'consistent-hash' | 'weighted' | '';

export interface ScalingState {
  capacity: CapacityEstimation;
  computeStrategy: ComputeStrategy;
  computeDetails: string;
  dbReplication: DbReplication;
  dbSharding: DbSharding;
  dbShardKey: string;
  dbDetails: string;
  cachePattern: CachePattern;
  evictionPolicy: EvictionPolicy;
  cacheTtl: string;
  cacheDetails: string;
  lbAlgorithm: LbAlgorithm;
  useCdn: boolean;
  lbDetails: string;
  reliabilityChecks: string[];
  metrics: string[];
  alertingDetails: string;
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
  diagramNodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: DiagramNodeData }>;
  diagramEdges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    animated?: boolean;
    type?: string;
    data?: { edgeStyle?: 'solid' | 'dashed' | 'dotted' };
  }>;
  deepDiveChallenges: DeepDiveChallenge[];
  scaling: ScalingState;
}

export type SystemDesignAction =
  | { type: 'INIT'; topicTitle: string; topicPrompt: string }
  | { type: 'SET_PHASE'; phase: SystemDesignPhase }
  | { type: 'SET_PHASE_STATUS'; phase: SystemDesignPhase; status: PhaseStatus }
  | { type: 'UPDATE_ENDPOINTS'; endpoints: Endpoint[] }
  | { type: 'UPDATE_SCHEMA'; schema: string }
  | { type: 'UPDATE_DB_CHOICE'; dbChoice: DbChoice }
  | { type: 'UPDATE_JUSTIFICATION'; justification: string }
  | { type: 'UPDATE_DIAGRAM'; nodes: SystemDesignState['diagramNodes']; edges: SystemDesignState['diagramEdges'] }
  | { type: 'UPDATE_DEEP_DIVES'; challenges: DeepDiveChallenge[] }
  | { type: 'UPDATE_SCALING'; scaling: ScalingState }
  | { type: 'RESET' };

/* ── Mistake Tracking & Spaced Repetition ── */

export interface MistakeEntryFull {
  id: string;
  pattern: PatternName;
  problemId: string | null;
  problemTitle: string;
  description: string;
  createdAt: string;
  nextReview: string;
  interval: number;       // days until next review
  easeFactor: number;     // SM-2 ease factor (>= 1.3)
  repetitions: number;    // consecutive correct reviews
  streak: number;         // visual streak indicator
}

/* ── Review Rubric ── */

export type RubricDimensionId =
  | 'correctness'
  | 'time-complexity'
  | 'space-complexity'
  | 'code-quality'
  | 'edge-cases'
  | 'communication'
  | 'edge-case-handling'
  | 'time-management';

export interface RubricDimension {
  id: RubricDimensionId;
  label: string;
  description: string;
  score: number;      // 0-4
  maxScore: 4;
}

export interface ReviewResult {
  id: string;
  problemId: string | null;
  problemTitle: string;
  dimensions: RubricDimension[];
  overallScore: number;
  feedback: string;
  improvementPlan: string[];
  createdAt: string;
}

/* ── Statistics & Analytics ── */

export type ProblemStatus = 'unseen' | 'attempted' | 'solved';

export interface ProblemProgress {
  problemId: string;
  status: ProblemStatus;
  attempts: number;
  bestScore: number | null;
  bestTime: number | null;  // seconds
  lastAttempted: string;
  hintsUsed: number;
  code: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  problemId: string | null;
  problemTitle: string;
  mode: Mode;
  duration: number;     // seconds
  hintsUsed: number;
  score: number | null;
  patterns: PatternName[];
}

export interface PatternStrength {
  pattern: PatternName;
  solved: number;
  attempted: number;
  avgScore: number;
  lastPracticed: string | null;
}

export interface StatsData {
  problemsSolved: number;
  totalAttempts: number;
  totalTime: number;        // seconds
  hintsUsed: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  avgScore: number;
  patternStrengths: PatternStrength[];
  sessions: SessionRecord[];
  problemProgress: Record<string, ProblemProgress>;
  reviews: ReviewResult[];
}

export type EditorTab = 'solution' | 'tests' | 'notes';

export type SidebarPanel = 'dashboard' | 'interview' | 'problems' | 'quiz' | 'behavioral' | 'mistakes' | 'stats' | 'achievements' | 'settings' | null;

/* ── Achievements & Leaderboards ── */

export type AchievementCategory = 'milestones' | 'streaks' | 'patterns' | 'speed' | 'mastery';

export type AchievementId =
  | 'first-solve'
  | 'ten-solved'
  | 'twenty-five-solved'
  | 'fifty-solved'
  | 'hundred-solved'
  | 'all-clear'
  | 'streak-3'
  | 'streak-7'
  | 'streak-14'
  | 'streak-30'
  | 'pattern-explorer'
  | 'pattern-master'
  | 'speed-demon'
  | 'lightning-round'
  | 'perfect-score'
  | 'hint-free'
  | 'review-ace';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  unlockedAt?: string;
}

export interface AchievementsData {
  unlocked: Record<AchievementId, string>; // id → ISO date
}

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

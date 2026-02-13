import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import TopNav from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';
import ChatPanel from './components/chat/ChatPanel';
import CommitmentGate from './components/panels/CommitmentGate';
import HintLadder from './components/panels/HintLadder';

const EditorPanel = lazy(() => import('./components/editor/EditorPanel'));
const SystemDesignRouter = lazy(() => import('./components/systemdesign/SystemDesignRouter'));
const InterviewLauncher = lazy(() => import('./components/modals/InterviewLauncher'));
const ReviewRubric = lazy(() => import('./components/ReviewRubric'));
const Landing = lazy(() => import('./components/Landing'));
import { useChat } from './hooks/useChat';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import { executeTests } from './utils/codeExecutor';
import { useSystemDesignState } from './hooks/useSystemDesignState';
import { useMistakeTracker } from './hooks/useMistakeTracker';
import { useStats } from './hooks/useStats';
import { useAdaptiveRecommendation } from './hooks/useAdaptiveRecommendation';
import { problemsById } from './data/problems';
import { getStarterCode, getTestCode } from './utils/problemLanguage';
import { buildMemorySummary } from './utils/memoryBuilder';
import { getSettings } from './components/panels/SettingsPanel';
import type {
  ChatMessage,
  ChatContext,
  CommitmentGateItem,
  ConsoleMessage,
  EditorTab,
  HintLevel,
  InterviewStage,
  Mode,
  PatternName,
  Problem,
  ReviewResult,
  SidebarPanel,
  SupportedLanguage,
  SystemDesignTopicId,
  TechnicalFormat,
  TechnicalQuestionCategory,
  TestCase,
  TopicName,
} from './types';

const defaultProblem: Problem = {
  id: 'hm-1',
  title: 'Two Sum',
  difficulty: 'Easy',
  pattern: 'HashMap',
  description:
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: ['Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]'],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
  starterCode: `function twoSum(nums: number[], target: number): number[] {\n  // Your solution here\n  \n}`,
  testCases: [
    { input: 'twoSum([2,7,11,15], 9)', expected: '[0,1]' },
    { input: 'twoSum([3,2,4], 6)', expected: '[1,2]' },
    { input: 'twoSum([3,3], 6)', expected: '[0,1]' },
  ],
};

const defaultGate: CommitmentGateItem[] = [
  { id: 'constraints', label: 'Constraints Recap', description: 'Summarize the key constraints in 1-3 bullets', completed: false },
  { id: 'pattern', label: 'Chosen Pattern', description: 'Name the algorithm pattern (e.g., HashMap, Sliding Window)', completed: false },
  { id: 'approach', label: 'Approach Plan', description: 'Outline your approach in 4-8 steps', completed: false },
  { id: 'complexity', label: 'Complexity Estimate', description: 'State time and space complexity', completed: false },
  { id: 'edges', label: 'Edge Cases', description: 'List 3-6 edge cases to handle', completed: false },
];

const defaultHints: HintLevel[] = [
  { level: 1, label: 'Nudge', description: 'A small push in the right direction', content: 'Think about what data structure lets you look up values in O(1) time. What if you stored the complement?', unlocked: false, color: 'var(--neon-lime)' },
  { level: 2, label: 'Structure', description: 'Data structure + algorithm steps', content: 'Use a HashMap to store each number\'s index as you iterate. For each number, check if (target - num) exists in the map.', unlocked: false, color: 'var(--neon-amber)' },
  { level: 3, label: 'Pseudocode', description: 'Detailed pseudocode outline', content: '1. Create empty map\n2. For each num at index i:\n   a. complement = target - num\n   b. If complement in map → return [map[complement], i]\n   c. Else → map[num] = i\n3. Return [] (no solution)', unlocked: false, color: 'var(--neon-purple)' },
];

const questionCategories: { id: string; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'javascript-typescript', label: 'JS / TS Core' },
  { id: 'react-frontend', label: 'React / Frontend' },
  { id: 'web-performance', label: 'Web Performance' },
  { id: 'apis-backend', label: 'APIs & Backend' },
  { id: 'databases', label: 'Databases' },
  { id: 'distributed-systems', label: 'Distributed Systems' },
  { id: 'security', label: 'Security' },
  { id: 'testing-quality', label: 'Testing & Quality' },
  { id: 'behavioral-leadership', label: 'Leadership' },
  { id: 'product-thinking', label: 'Product Thinking' },
];

const SYSTEM_DESIGN_STARTER = `## [requirements]

## [api]

## [data]

## [architecture]

## [deepdive]

## [scaling]
`;

const SD_TOPIC_TITLES: Record<Exclude<SystemDesignTopicId, 'custom'>, { title: string; prompt: string }> = {
  'url-shortener': {
    title: 'URL Shortening Service',
    prompt: 'Design a **URL shortening service** like bit.ly.',
  },
  'twitter-timeline': {
    title: 'Social Media Feed / Timeline',
    prompt: 'Design **Twitter\'s home timeline** — how posts are created, fan-out to followers, ranked, and served at scale.',
  },
  'notification-system': {
    title: 'Notification System',
    prompt: 'Design a **notification system** that supports push notifications, email, and SMS across millions of users with prioritization and rate limiting.',
  },
  'rate-limiter': {
    title: 'Distributed Rate Limiter',
    prompt: 'Design a **distributed rate limiter** that can enforce request limits across multiple API servers — consider token bucket, sliding window, and Redis-based approaches.',
  },
  'file-storage': {
    title: 'File Storage System',
    prompt: 'Design a **file storage system** like Dropbox or Google Drive — file upload/download, sync across devices, chunking, deduplication, and sharing.',
  },
  'chat-application': {
    title: 'Real-Time Chat Application',
    prompt: 'Design a **real-time chat application** like WhatsApp or Slack — WebSocket connections, message delivery guarantees, presence, group chats, and message history.',
  },
  'video-streaming': {
    title: 'Video Streaming Platform',
    prompt: 'Design a **video streaming platform** like YouTube or Netflix — video upload & transcoding, adaptive bitrate streaming, content delivery via CDN, recommendation engine, and comment/engagement systems.',
  },
  'ride-sharing': {
    title: 'Ride-Sharing Service',
    prompt: 'Design a **ride-sharing service** like Uber or Lyft — real-time driver matching, location tracking, trip management, surge pricing, ETA calculation, and payment processing.',
  },
  'search-engine': {
    title: 'Web Search Engine',
    prompt: 'Design a **web search engine** like Google — web crawling, indexing, ranking (PageRank), query processing, spelling correction, autocomplete, and serving results at scale.',
  },
  'payment-system': {
    title: 'Payment Processing System',
    prompt: 'Design a **payment processing system** like Stripe or PayPal — transaction processing, idempotency, ledger/double-entry accounting, fraud detection, multi-currency support, and PCI compliance.',
  },
  'news-feed': {
    title: 'Personalized News Feed',
    prompt: 'Design a **personalized news feed** like Facebook\'s — content aggregation, ranking algorithms, fan-out strategies (push vs pull), caching, real-time updates, and content moderation.',
  },
  'collaborative-editor': {
    title: 'Collaborative Document Editor',
    prompt: 'Design a **collaborative document editor** like Google Docs — real-time co-editing with operational transforms or CRDTs, conflict resolution, version history, cursor presence, and offline support.',
  },
  'monitoring-system': {
    title: 'Distributed Monitoring System',
    prompt: 'Design a **distributed monitoring & alerting system** like Datadog or Prometheus — metrics collection, time-series storage, aggregation pipelines, anomaly detection, dashboards, and alert routing.',
  },
  'key-value-store': {
    title: 'Distributed Key-Value Store',
    prompt: 'Design a **distributed key-value store** like DynamoDB or Redis Cluster — partitioning, replication, consistency models (eventual vs strong), conflict resolution, and failure handling.',
  },
  'web-crawler': {
    title: 'Web Crawler',
    prompt: 'Design a **distributed web crawler** — URL frontier management, politeness policies, deduplication, distributed coordination, content extraction, and handling dynamic pages at billions of pages scale.',
  },
  'proximity-service': {
    title: 'Proximity/Location Service',
    prompt: 'Design a **proximity service** like Yelp or Google Places — geospatial indexing (geohash, quadtree), nearby search, location updates, ranking by distance and relevance, and handling dense urban areas.',
  },
  'ticket-booking': {
    title: 'Ticket Booking System',
    prompt: 'Design a **ticket booking system** like Ticketmaster — seat selection with reservation holds, handling high-concurrency flash sales, inventory management, queue/waiting room, payment integration, and preventing overselling.',
  },
  'maps-navigation': {
    title: 'Maps & Navigation System',
    prompt: 'Design a **maps and navigation system** like Google Maps — map tile serving, route calculation (Dijkstra/A*), real-time traffic data, ETA estimation, turn-by-turn navigation, and offline maps.',
  },
  'ad-click-aggregator': {
    title: 'Ad Click Event Aggregator',
    prompt: 'Design an **ad click event aggregation system** — real-time event ingestion at massive scale, stream processing for click counting, deduplication and fraud detection, time-windowed aggregation, and reporting dashboards.',
  },
  'hotel-reservation': {
    title: 'Hotel Reservation System',
    prompt: 'Design a **hotel reservation system** like Booking.com — room inventory management, search with date/location/price filters, booking with double-booking prevention, pricing engine, cancellation policies, and review system.',
  },
};

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'mentor',
    content: `**Welcome to Senior Interview Mentor.**\n\nI've loaded **Two Sum** for you — a classic HashMap problem.\n\n**Problem:** Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to \`target\`.\n\n**Constraints:**\n- \`2 <= nums.length <= 10^4\`\n- Only one valid answer exists\n- Cannot use the same element twice\n\nBefore we dive in, let's work through the **Commitment Gate**. Can you:\n1. Recap the constraints\n2. Identify the pattern\n3. Outline your approach\n\nWhat pattern do you think applies here?`,
    timestamp: new Date(),
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function App() {
  const { restored, restoreMessages, saveSession, clearSession } = useSessionPersistence();
  const initial = restored ? {
    mode: restored.mode,
    currentProblem: restored.currentProblem,
    editorTab: restored.editorTab,
    hintsUsed: restored.hintsUsed,
    timerSeconds: restored.timerSeconds,
    timerRunning: restored.timerRunning,
    editorCode: restored.editorCode,
    testCode: restored.testCode,
    notes: restored.notes,
    commitmentGate: restored.commitmentGate,
    hints: restored.hints,
    interviewStage: restored.interviewStage,
    interviewCategory: restored.interviewCategory,
    sdTopicId: restored.sdTopicId,
    messages: restoreMessages(restored.messages),
  } : null;

  const [showLanding, setShowLanding] = useState(!initial && !localStorage.getItem('sim-skip-landing'));
  const [mode, setMode] = useState<Mode>(initial?.mode ?? 'TEACHER');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(initial?.currentProblem ?? defaultProblem);
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>(initial?.editorTab ?? 'solution');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [commitmentGateOpen, setCommitmentGateOpen] = useState(false);
  const [hintLadderOpen, setHintLadderOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(initial?.hintsUsed ?? 0);
  const [timerSeconds, setTimerSeconds] = useState(initial?.timerSeconds ?? 2700);
  const [timerRunning, setTimerRunning] = useState(initial?.timerRunning ?? false);
  const [editorCode, setEditorCode] = useState(initial?.editorCode ?? defaultProblem.starterCode);
  const [testCode, setTestCode] = useState(initial?.testCode ?? '// Write custom test cases here\nconsole.log(twoSum([2,7,11,15], 9)); // expected: [0,1]');
  const [notes, setNotes] = useState(initial?.notes ?? '// Scratch pad\n// Pattern: HashMap\n// Key insight: store complement');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleMessage[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [commitmentGate, setCommitmentGate] = useState<CommitmentGateItem[]>(initial?.commitmentGate ?? defaultGate);
  const [hints, setHints] = useState<HintLevel[]>(initial?.hints ?? defaultHints);
  const [mobileView, setMobileView] = useState<'chat' | 'editor'>('chat');
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('sim-settings');
    if (saved) {
      try { return JSON.parse(saved).language === 'javascript' ? 'javascript' : 'typescript'; } catch { /* ignore */ }
    }
    return 'typescript';
  });
  const [interviewStage, setInterviewStage] = useState<InterviewStage | null>(initial?.interviewStage ?? null);
  const [interviewCategory, setInterviewCategory] = useState<TechnicalQuestionCategory | null>(initial?.interviewCategory ?? null);
  const [sdTopicId, setSdTopicId] = useState<SystemDesignTopicId | null>(initial?.sdTopicId ?? null);

  const [reviewRubricOpen, setReviewRubricOpen] = useState(false);

  const { sdState, sdDispatch, advancePhase, PHASE_ORDER } = useSystemDesignState(restored?.sdState);
  const isSystemDesignActive = interviewStage === 'system-design' && sdState.active;

  const {
    mistakes, dueForReview, addMistake, reviewMistake, removeMistake,
    getWeakPatterns,
  } = useMistakeTracker();
  const {
    stats, recordProblemAttempt, recordReview,
    updatePatternStrength, getProblemStatus,
  } = useStats();
  const { getNextProblem, getRecommendations, getReadinessScore } = useAdaptiveRecommendation({
    patternStrengths: stats.patternStrengths,
    getProblemStatus,
    weakPatterns: getWeakPatterns(),
  });

  const getContext = useCallback((): ChatContext | undefined => {
    const settings = getSettings();
    const memory = buildMemorySummary(stats, mistakes, settings);
    return {
      mode,
      currentProblem: currentProblem
        ? {
            title: currentProblem.title,
            difficulty: currentProblem.difficulty,
            pattern: currentProblem.pattern,
            description: currentProblem.description,
            constraints: currentProblem.constraints,
          }
        : null,
      hintsUsed,
      commitmentGateCompleted: commitmentGate.filter((i) => i.completed).length,
      interviewStage,
      technicalQuestionCategory: interviewCategory ?? undefined,
      memory,
    };
  }, [mode, currentProblem, hintsUsed, commitmentGate, interviewStage, interviewCategory, stats, mistakes]);

  const handleEditorUpdate = useCallback(
    (starterCode: string, testCode: string) => {
      if (starterCode) setEditorCode(starterCode);
      if (testCode) setTestCode(testCode);
    },
    [],
  );

  const { messages, setMessages, isStreaming, sendMessage, sendSilentMessage, stopStreaming } = useChat({
    initialMessages: initial?.messages ?? initialMessages,
    getContext,
    onEditorUpdate: handleEditorUpdate,
  });

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 0) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Auto-save session to localStorage (debounced, skips while streaming)
  useEffect(() => {
    if (isStreaming) return;
    saveSession({
      mode,
      currentProblem,
      editorTab,
      hintsUsed,
      timerSeconds,
      timerRunning,
      editorCode,
      testCode,
      notes,
      commitmentGate,
      hints,
      interviewStage,
      interviewCategory,
      sdTopicId,
      sdState,
      messages,
    });
  }, [isStreaming, mode, currentProblem, editorTab, hintsUsed, timerSeconds, timerRunning, editorCode, testCode, notes, commitmentGate, hints, interviewStage, interviewCategory, sdTopicId, sdState, messages, saveSession]);

  /** Handle local side effects for slash commands, then send to Claude */
  const handleSendMessage = useCallback((content: string) => {
    // Local side effects for slash commands
    if (content.startsWith('/hint') || content.startsWith('/stuck')) {
      const nextLevel = (hintsUsed + 1) as 1 | 2 | 3;
      if (nextLevel <= 3) {
        setHints((prev) =>
          prev.map((h) => (h.level === nextLevel ? { ...h, unlocked: true } : h))
        );
        setHintsUsed(nextLevel);
        // Auto-log mistake when hint 3 is used (user is deeply stuck)
        if (nextLevel === 3 && currentProblem) {
          addMistake({
            pattern: currentProblem.pattern as PatternName,
            problemId: currentProblem.id,
            problemTitle: currentProblem.title,
            description: `Needed all 3 hints to solve ${currentProblem.title}`,
          });
        }
      }
      setHintLadderOpen(true);
    } else if (content.startsWith('/review')) {
      setMode('REVIEWER');
      setReviewRubricOpen(true);
      // Auto-include code context for AI review
      if (currentProblem && editorCode) {
        const codeContext = `\n\n**My code for ${currentProblem.title}:**\n\`\`\`typescript\n${editorCode}\n\`\`\``;
        sendMessage(content + codeContext);
        return;
      }
    } else if (content.startsWith('/next')) {
      const arg = content.replace('/next', '').trim().toLowerCase();
      const difficulty = arg === 'easy' ? 'Easy' : arg === 'medium' ? 'Medium' : arg === 'hard' ? 'Hard' : undefined;
      const rec = getNextProblem(difficulty as Difficulty | undefined);
      if (rec) {
        const problem = problemsById[rec.id];
        if (problem) {
          setCurrentProblem(problem);
          setEditorCode(getStarterCode(problem, language));
          setTestCode(getTestCode(problem, language));
          setTestResults([]);
          setHintsUsed(0);
          setHints((prev) => prev.map((h) => ({ ...h, unlocked: false, content: '' })));
          setCommitmentGate(defaultGate.map((g) => ({ ...g, completed: false })));
        }
      }
    } else if (content.startsWith('/check')) {
      // Auto-include editor code for approach validation
      if (currentProblem && editorCode) {
        const codeContext = `\n\n**My current code for ${currentProblem.title}:**\n\`\`\`typescript\n${editorCode}\n\`\`\``;
        sendMessage(content + codeContext);
        return;
      }
    } else if (content.startsWith('/continue')) {
      // Enrich with session state so Claude can recap
      const gateStatus = commitmentGate.map((g) => `${g.completed ? '[x]' : '[ ]'} ${g.label}`).join(', ');
      const parts = [
        currentProblem ? `Problem: ${currentProblem.title} (${currentProblem.difficulty}, ${currentProblem.pattern})` : 'No active problem',
        `Mode: ${mode}`,
        `Hints: ${hintsUsed}/3`,
        `Gate: ${gateStatus}`,
        interviewStage ? `Interview: ${interviewStage}` : null,
        timerRunning ? `Timer: ${Math.floor(timerSeconds / 60)}m left` : null,
      ].filter(Boolean).join(' | ');
      sendMessage(`/continue\n\n[Session: ${parts}]`);
      return;
    } else if (content.startsWith('/recap')) {
      // Enrich with detailed session state
      const gateLines = commitmentGate.map((g) => `- [${g.completed ? 'x' : ' '}] ${g.label}`).join('\n');
      const sessionInfo = [
        currentProblem ? `**Problem:** ${currentProblem.title} (${currentProblem.difficulty}, ${currentProblem.pattern})` : '**Problem:** None',
        `**Mode:** ${mode}`,
        `**Hints used:** ${hintsUsed}/3`,
        `**Commitment gate:**\n${gateLines}`,
        interviewStage ? `**Interview stage:** ${interviewStage}` : null,
        timerRunning ? `**Timer:** ${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s remaining` : null,
      ].filter(Boolean).join('\n');
      sendMessage(`/recap\n\n${sessionInfo}`);
      return;
    }

    // Send to Claude API
    sendMessage(content);
  }, [hintsUsed, sendMessage, currentProblem, addMistake, getNextProblem, language, editorCode, mode, commitmentGate, interviewStage, timerRunning, timerSeconds]);

  async function handleRunTests() {
    if (!currentProblem || runningTests) return;
    setRunningTests(true);
    setConsoleOpen(true);

    try {
      const { results, logs } = await executeTests(editorCode, currentProblem.testCases);
      setTestResults(results);
      setConsoleLogs(logs);

      const passed = results.filter((r) => r.passed).length;
      const total = results.length;
      const allPassed = passed === total;

      // Record problem attempt in stats
      recordProblemAttempt({
        problemId: currentProblem.id,
        status: allPassed ? 'solved' : 'attempted',
        score: allPassed ? 4 : null,
        time: null,
        hintsUsed,
        code: editorCode,
      });

      // Update pattern strength
      if (currentProblem.pattern) {
        updatePatternStrength(
          currentProblem.pattern as PatternName,
          allPassed,
          allPassed ? 4 : (passed / total) * 4,
        );
      }

      // Auto-log mistake when tests fail
      if (!allPassed) {
        const failedCount = total - passed;
        addMistake({
          pattern: currentProblem.pattern as PatternName,
          problemId: currentProblem.id,
          problemTitle: currentProblem.title,
          description: `Failed ${failedCount}/${total} test cases`,
        });
      }
    } finally {
      setRunningTests(false);
    }
  }

  function handleToggleGateItem(id: string) {
    setCommitmentGate((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function handleRequestHint(level: 1 | 2 | 3) {
    if (level > hintsUsed + 1) return;
    setHints((prev) =>
      prev.map((h) => (h.level === level ? { ...h, unlocked: true } : h))
    );
    setHintsUsed(Math.max(hintsUsed, level));
  }

  function handleStartInterview(config: {
    stage: InterviewStage;
    format?: TechnicalFormat;
    topic?: TopicName;
    difficulty?: string;
    category?: TechnicalQuestionCategory;
    systemDesignTopic?: SystemDesignTopicId;
    customSystemDesignPrompt?: string;
    customTechnicalPrompt?: string;
  }) {
    clearSession();
    // Set UI state
    setMode('INTERVIEWER');
    setTimerRunning(true);
    setTimerSeconds(2700);
    setHintsUsed(0);
    setHints(defaultHints);
    setCommitmentGate(defaultGate);
    setTestResults([]);
    setConsoleOpen(false);
    setEditorTab('solution');
    setInterviewStage(config.stage);
    setInterviewCategory(config.category ?? null);
    setSdTopicId(config.systemDesignTopic ?? null);

    // Clear messages for fresh interview
    setMessages([]);

    // Reset editor content based on interview type
    if (config.stage === 'system-design') {
      setCurrentProblem(null);
      setEditorCode(SYSTEM_DESIGN_STARTER);
      setNotes('');

      // Initialize system design workspace state
      let sdTitle = 'Custom System Design';
      let sdPrompt = '';
      if (config.systemDesignTopic === 'custom' && config.customSystemDesignPrompt) {
        sdTitle = 'Custom System Design';
        sdPrompt = config.customSystemDesignPrompt;
      } else if (config.systemDesignTopic && config.systemDesignTopic !== 'custom') {
        sdTitle = SD_TOPIC_TITLES[config.systemDesignTopic].title;
        sdPrompt = SD_TOPIC_TITLES[config.systemDesignTopic].prompt;
      } else {
        sdTitle = 'URL Shortening Service';
        sdPrompt = 'Design a URL shortening service like bit.ly.';
      }
      sdDispatch({ type: 'INIT', topicTitle: sdTitle, topicPrompt: sdPrompt });
    } else if (config.stage === 'technical') {
      setCurrentProblem(null); // Will be set by Claude's response
      setEditorCode('// Your solution here\n');
      setTestCode('// Write test cases here');
      setNotes('');
    } else {
      setCurrentProblem(null);
      setEditorCode('// Use this space for notes during the interview\n');
      setTestCode('');
      setNotes('');
    }

    // Build command based on selection
    let command = '';
    if (config.stage === 'technical' && config.format === 'leetcode') {
      command = `/interview technical leetcode ${config.topic ?? 'arrays'} ${config.difficulty ?? 'medium'}`;
    } else if (config.stage === 'technical' && config.format === 'project') {
      command = `/interview technical project`;
    } else if (config.stage === 'system-design') {
      if (config.systemDesignTopic === 'custom' && config.customSystemDesignPrompt) {
        command = `/interview system-design custom: ${config.customSystemDesignPrompt}`;
      } else {
        command = `/interview system-design ${config.systemDesignTopic ?? 'url-shortener'}`;
      }
    } else if (config.stage === 'technical-questions') {
      if (config.category === 'custom' && config.customTechnicalPrompt) {
        command = `/interview technical-questions custom: ${config.customTechnicalPrompt}`;
      } else {
        command = `/interview technical-questions ${config.category ?? 'mixed'}`;
      }
    } else if (config.stage === 'phone') {
      command = `/interview phone`;
    } else if (config.stage === 'behavioral') {
      command = `/interview behavioral`;
    }

    // Send silently - only Claude's response appears in chat
    if (command) {
      console.log('[App] Sending silent command:', command);
      sendSilentMessage(command);
    } else {
      console.warn('[App] No command built for config:', config);
    }
  }

  function handleSelectProblem(id: string) {
    const problem = problemsById[id];
    if (!problem) return;

    // Load full problem data into editor (language-aware)
    setCurrentProblem(problem);
    setEditorCode(getStarterCode(problem, language));
    setTestCode(getTestCode(problem, language));

    // Reset UI state
    setTestResults([]);
    setConsoleOpen(false);
    setHintsUsed(0);
    setHintLadderOpen(false);
    setHints(defaultHints);
    setCommitmentGate(defaultGate);
    setInterviewStage(null);
    setInterviewCategory(null);
    setMode('TEACHER');
    setTimerRunning(false);
    setEditorTab('solution');
    setNotes('');
    sdDispatch({ type: 'RESET' });

    // Close sidebar
    setSidebarPanel(null);

    // Build mentor message from hardcoded problem data (no API call needed)
    const examplesBlock = problem.examples.map((ex) => `\`\`\`\n${ex}\n\`\`\``).join('\n\n');
    const constraintsBlock = problem.constraints.map((c) => `- \`${c}\``).join('\n');

    const mentorContent =
      `**${problem.title}** — ${problem.difficulty} · ${problem.pattern}\n\n` +
      `${problem.description}\n\n` +
      `**Examples:**\n${examplesBlock}\n\n` +
      `**Constraints:**\n${constraintsBlock}\n\n` +
      `---\n\n` +
      `Take a moment to read through the problem. When you're ready, please start by clarifying your understanding and walking me through your initial thoughts.\n\n` +
      `What questions do you have, and how are you thinking about approaching this?`;

    setMessages([
      {
        id: generateId(),
        role: 'mentor' as const,
        content: mentorContent,
        timestamp: new Date(),
      },
    ]);
  }

  const readinessScore = getReadinessScore();
  const gateCompleted = commitmentGate.filter((i) => i.completed).length;
  const progressPercent = readinessScore > 0 ? readinessScore : (currentProblem ? (gateCompleted / commitmentGate.length) * 100 : 0);

  if (showLanding) {
    return (
      <Suspense fallback={null}>
        <Landing onEnterApp={() => {
          localStorage.setItem('sim-skip-landing', '1');
          setShowLanding(false);
        }} />
      </Suspense>
    );
  }

  return (
    <div className="app-shell">
      <TopNav
        mode={mode}
        problem={currentProblem}
        timerSeconds={timerSeconds}
        timerRunning={timerRunning}
        hintsUsed={hintsUsed}
        progressPercent={progressPercent}
      />

      <div className="app-body">
        <Sidebar
          activePanel={sidebarPanel}
          onPanelChange={setSidebarPanel}
          onLaunchInterview={() => setInterviewModalOpen(true)}
          onSelectProblem={handleSelectProblem}
          currentProblemId={currentProblem?.id || null}
          mistakes={mistakes}
          dueForReview={dueForReview}
          onReviewMistake={reviewMistake}
          onRemoveMistake={removeMistake}
          onAddMistake={addMistake}
          stats={stats}
          getProblemStatus={getProblemStatus}
          recommendations={getRecommendations(3)}
        />

        <div className="workspace">
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>Loading...</div>}>
          {isSystemDesignActive ? (
            <SystemDesignRouter
              sdState={sdState}
              sdDispatch={sdDispatch}
              advancePhase={advancePhase}
              phaseOrder={PHASE_ORDER}
              timerSeconds={timerSeconds}
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={stopStreaming}
              chatPanel={
                <ChatPanel
                  mode={mode}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  hidden={false}
                  isStreaming={isStreaming}
                  onStopStreaming={stopStreaming}
                />
              }
              editorPanel={
                <EditorPanel
                  problemId={currentProblem?.id}
                  activeTab={editorTab}
                  onTabChange={setEditorTab}
                  code={editorCode}
                  testCode={testCode}
                  notes={notes}
                  onCodeChange={setEditorCode}
                  onTestCodeChange={setTestCode}
                  onNotesChange={setNotes}
                  onRunTests={handleRunTests}
                  runningTests={runningTests}
                  testResults={testResults}
                  consoleLogs={consoleLogs}
                  consoleOpen={consoleOpen}
                  onToggleConsole={() => setConsoleOpen(!consoleOpen)}
                  hidden={false}
                  interviewStage={interviewStage}
                  systemDesignTopicId={sdTopicId}
                  onSendMessage={handleSendMessage}
                />
              }
            />
          ) : (
            <>
              <ChatPanel
                mode={mode}
                messages={messages}
                onSendMessage={handleSendMessage}
                hidden={mobileView !== 'chat'}
                isStreaming={isStreaming}
                onStopStreaming={stopStreaming}
              />
              <EditorPanel
                problemId={currentProblem?.id}
                activeTab={editorTab}
                onTabChange={setEditorTab}
                code={editorCode}
                testCode={testCode}
                notes={notes}
                onCodeChange={setEditorCode}
                onTestCodeChange={setTestCode}
                onNotesChange={setNotes}
                onRunTests={handleRunTests}
                runningTests={runningTests}
                testResults={testResults}
                consoleLogs={consoleLogs}
                consoleOpen={consoleOpen}
                onToggleConsole={() => setConsoleOpen(!consoleOpen)}
                hidden={mobileView !== 'editor'}
                interviewStage={interviewStage}
                systemDesignTopicId={sdTopicId}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
          </Suspense>
        </div>

        <CommitmentGate
          open={commitmentGateOpen}
          onClose={() => setCommitmentGateOpen(false)}
          items={commitmentGate}
          onToggle={handleToggleGateItem}
        />
      </div>

      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${mobileView === 'chat' ? 'mobile-tab-active' : ''}`}
          onClick={() => setMobileView('chat')}
        >
          Mentor Chat
        </button>
        <button
          className={`mobile-tab ${mobileView === 'editor' ? 'mobile-tab-active' : ''}`}
          onClick={() => setMobileView('editor')}
        >
          Code Editor
        </button>
      </div>

      <Suspense fallback={null}>
        {interviewModalOpen && (
          <InterviewLauncher
            open={interviewModalOpen}
            onClose={() => setInterviewModalOpen(false)}
            onStart={handleStartInterview}
          />
        )}

        {reviewRubricOpen && (
          <ReviewRubric
          problemTitle={currentProblem?.title ?? 'Current Problem'}
          problemId={currentProblem?.id ?? null}
          onSubmit={(review: ReviewResult) => {
            recordReview(review);
            if (currentProblem?.pattern) {
              updatePatternStrength(
                currentProblem.pattern as PatternName,
                review.overallScore >= 3,
                review.overallScore,
              );
            }
          }}
          onClose={() => setReviewRubricOpen(false)}
        />
      )}
      </Suspense>

      {hintsUsed > 0 && hintLadderOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: 60,
            width: 260,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '12px 0',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ padding: '0 12px 8px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Hint Ladder
            <button
              onClick={() => setHintLadderOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
            >
              ×
            </button>
          </div>
          <HintLadder hints={hints} onRequestHint={handleRequestHint} />
        </div>
      )}
    </div>
  );
}

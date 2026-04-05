import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import TopNav from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';
import ChatPanel from './components/chat/ChatPanel';
import WorkspaceSplitter from './components/layout/WorkspaceSplitter';
import CommitmentGate from './components/panels/CommitmentGate';
import HintLadder from './components/panels/HintLadder';
import AuthPage from './components/auth/AuthPage';
import AppSkeleton from './components/AppSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import { useWorkspaceLayout } from './hooks/useWorkspaceLayout';
import { useTimerState } from './hooks/useTimerState';
import { useEditorState } from './hooks/useEditorState';
import { useInterviewSession, DEFAULT_PROBLEM, DEFAULT_GATE, DEFAULT_HINTS } from './hooks/useInterviewSession';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useMetaTags } from './hooks/useMetaTags';
import { logger } from './utils/logger.js';
import { safeGetItem, safeSetItem, safeRemoveItem } from './utils/storage.js';

const EditorPanel = lazy(() => import('./components/editor/EditorPanel'));
const SystemDesignRouter = lazy(() => import('./components/systemdesign/SystemDesignRouter'));
const InterviewLauncher = lazy(() => import('./components/modals/InterviewLauncher'));
const ReviewRubric = lazy(() => import('./components/ReviewRubric'));
const Landing = lazy(() => import('./components/Landing'));
import { useChat } from './hooks/useChat';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import { executeTests, parseTestCode, executeFreeform } from './utils/codeExecutor';
import { useSystemDesignState } from './hooks/useSystemDesignState';
import { useMistakeTracker } from './hooks/useMistakeTracker';
import { useStats } from './hooks/useStats';
import { useAdaptiveRecommendation } from './hooks/useAdaptiveRecommendation';
import { useAchievements } from './hooks/useAchievements';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { problemsById } from './data/problems';
import { getStarterCode, getTestCode } from './utils/problemLanguage';
import { exportSolutionCard } from './utils/solutionCard';
import { buildMemorySummary } from './utils/memoryBuilder';
import { getSettings } from './utils/settings';
import type {
  ChatMessage,
  ChatContext,
  Difficulty,
  InterviewStage,
  Mode,
  PatternName,
  ReviewResult,
  SidebarPanel,
  SupportedLanguage,
  SystemDesignTopicId,
  TechnicalFormat,
  TechnicalQuestionCategory,
  TopicName,
} from './types';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, loading: authLoading, signIn, signUp, signInWithOAuth, signOut, isAuthenticated } = useAuth();
  const subscription = useSubscription(session);
  const [authSkipped, setAuthSkipped] = useState(() => safeGetItem('sim-auth-skipped') === '1');
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; limit: number; plan: string } | null>(null);
  const syncAttempted = useRef(false);

  const handleAuthSkip = useCallback(() => {
    safeSetItem('sim-auth-skipped', '1');
    setAuthSkipped(true);
  }, []);

  useEffect(() => {
    if (!authLoading) { setAuthTimedOut(false); return; }
    const t = setTimeout(() => setAuthTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [authLoading]);

  const handleSync = useCallback(async () => {
    if (!session?.access_token) return;
    setSyncing(true);
    try {
      const statsRaw = safeGetItem('sim-stats');
      const mistakesRaw = safeGetItem('sim-mistakes');
      const sessionsRaw = safeGetItem('sim-sessions');

      const stats = statsRaw ? JSON.parse(statsRaw) : {};
      const mistakesData = mistakesRaw ? JSON.parse(mistakesRaw) : [];
      const sessionsData = sessionsRaw ? JSON.parse(sessionsRaw) : [];

      const payload = {
        progress: stats.problemProgress || {},
        mistakes: Array.isArray(mistakesData) ? mistakesData : [],
        sessions: Array.isArray(sessionsData) ? sessionsData : [],
        reviews: stats.reviews || [],
      };

      const hasData = Object.keys(payload.progress).length > 0
        || payload.mistakes.length > 0
        || payload.sessions.length > 0
        || payload.reviews.length > 0;

      if (!hasData) {
        setSyncToast('No local data to sync');
        setTimeout(() => setSyncToast(''), 3000);
        safeSetItem('sim-synced', '1');
        setSyncing(false);
        return;
      }

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        safeSetItem('sim-synced', '1');
        setSyncToast('Data synced to cloud!');
      } else {
        setSyncToast('Sync failed - try again later');
      }
    } catch {
      setSyncToast('Sync failed - try again later');
    }
    setSyncing(false);
    setTimeout(() => setSyncToast(''), 3000);
  }, [session]);

  // Auto-sync on first login
  useEffect(() => {
    if (isAuthenticated && !safeGetItem('sim-synced') && !syncAttempted.current) {
      syncAttempted.current = true;
      void handleSync();
    }
  }, [isAuthenticated, handleSync]);

  // Clear skip flag when user authenticates
  useEffect(() => {
    if (isAuthenticated && authSkipped) {
      safeRemoveItem('sim-auth-skipped');
      setAuthSkipped(false);
    }
  }, [isAuthenticated, authSkipped]);

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

  const [showLanding, setShowLanding] = useState(!initial && !safeGetItem('sim-skip-landing'));
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>(null);
  const [mobileView, setMobileView] = useState<'chat' | 'editor'>('chat');

  // ── Extracted domain hooks ──
  const timer = useTimerState({
    timerSeconds: initial?.timerSeconds,
    timerRunning: initial?.timerRunning,
  });

  const editor = useEditorState({
    editorCode: initial?.editorCode,
    testCode: initial?.testCode,
    notes: initial?.notes,
    editorTab: initial?.editorTab,
  });

  const interview = useInterviewSession({
    mode: initial?.mode,
    currentProblem: initial?.currentProblem ?? DEFAULT_PROBLEM,
    interviewStage: initial?.interviewStage,
    interviewCategory: initial?.interviewCategory,
    sdTopicId: initial?.sdTopicId,
    hintsUsed: initial?.hintsUsed,
    commitmentGate: initial?.commitmentGate,
    hints: initial?.hints,
  });

  const { sdState, sdDispatch, advancePhase, PHASE_ORDER } = useSystemDesignState(restored?.sdState);
  const isSystemDesignActive = interview.interviewStage === 'system-design' && sdState.active;

  // ── Dynamic SEO: document title + meta description per route ──
  const seoTitle = interview.currentProblem
    ? `${interview.currentProblem.title} — ${interview.currentProblem.pattern}`
    : interview.interviewStage
      ? `${interview.interviewStage.replace(/-/g, ' ')} Interview`
      : sidebarPanel
        ? sidebarPanel.charAt(0).toUpperCase() + sidebarPanel.slice(1)
        : null;
  const seoDescription = interview.currentProblem
    ? `Solve ${interview.currentProblem.title} — ${interview.currentProblem.pattern} pattern (${interview.currentProblem.difficulty}). AI-coached coding interview prep with Socratic teaching.`
    : null;
  useDocumentTitle(seoTitle);
  useMetaTags(seoDescription);

  const {
    mistakes, dueForReview, addMistake, reviewMistake, removeMistake,
    getWeakPatterns,
  } = useMistakeTracker();
  const {
    stats, recordSession, recordProblemAttempt, recordReview,
    updatePatternStrength, getProblemStatus,
  } = useStats();
  const { getNextProblem, getRecommendations, getReadinessScore } = useAdaptiveRecommendation({
    patternStrengths: stats.patternStrengths,
    getProblemStatus,
    weakPatterns: getWeakPatterns(),
  });
  const { achievements, unlockedCount, totalCount, checkAchievements } = useAchievements();
  const dailyChallenge = useDailyChallenge(getProblemStatus);
  const layout = useWorkspaceLayout();
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  // Check achievements when stats change
  useEffect(() => {
    const newlyUnlocked = checkAchievements(stats);
    if (newlyUnlocked.length > 0) {
      const first = newlyUnlocked[0];
      setAchievementToast(`${first.icon} ${first.title} unlocked!`);
      setTimeout(() => setAchievementToast(null), 4000);
    }
  }, [stats, checkAchievements]);

  const getContext = useCallback((): ChatContext | undefined => {
    const settings = getSettings();
    const memory = buildMemorySummary(stats, mistakes, settings);
    return {
      mode: interview.mode,
      currentProblem: interview.currentProblem
        ? {
            title: interview.currentProblem.title,
            difficulty: interview.currentProblem.difficulty,
            pattern: interview.currentProblem.pattern,
            description: interview.currentProblem.description,
            constraints: interview.currentProblem.constraints,
          }
        : null,
      hintsUsed: interview.hintsUsed,
      commitmentGateCompleted: interview.commitmentGate.filter((i) => i.completed).length,
      interviewStage: interview.interviewStage,
      technicalQuestionCategory: interview.interviewCategory ?? undefined,
      language: editor.language,
      memory,
    };
  }, [interview.mode, interview.currentProblem, interview.hintsUsed, interview.commitmentGate, interview.interviewStage, interview.interviewCategory, editor.language, stats, mistakes]);

  const handleEditorUpdate = useCallback(
    (starterCode: string, testCode: string) => {
      if (starterCode) editor.setEditorCode(starterCode);
      if (testCode) editor.setTestCode(testCode);
    },
    [editor.setEditorCode, editor.setTestCode],
  );

  const handleLanguageChange = useCallback((newLang: SupportedLanguage) => {
    editor.handleLanguageChange(newLang, interview.currentProblem);
  }, [editor.handleLanguageChange, interview.currentProblem]);

  const handleRateLimit = useCallback((remaining: number, limit: number, plan: string) => {
    setRateLimitInfo({ remaining, limit, plan });
  }, []);

  const { messages, setMessages, isStreaming, sendMessage, sendSilentMessage, stopStreaming } = useChat({
    initialMessages: initial?.messages ?? initialMessages,
    getContext,
    onEditorUpdate: handleEditorUpdate,
    accessToken: session?.access_token,
    onRateLimit: handleRateLimit,
  });

  // ── Auto-save session to localStorage ──
  // Snapshot ref: always holds latest session data (cheap render-time assignment)
  const sessionSnapshotRef = useRef<Parameters<typeof saveSession>[0]>();
  sessionSnapshotRef.current = {
    mode: interview.mode, currentProblem: interview.currentProblem, editorTab: editor.editorTab,
    hintsUsed: interview.hintsUsed, timerSeconds: timer.timerSeconds,
    timerRunning: timer.timerRunning, editorCode: editor.editorCode, testCode: editor.testCode,
    notes: editor.notes, commitmentGate: interview.commitmentGate,
    hints: interview.hints, interviewStage: interview.interviewStage,
    interviewCategory: interview.interviewCategory, sdTopicId: interview.sdTopicId, sdState, messages,
  };
  const isStreamingRef = useRef(isStreaming);
  isStreamingRef.current = isStreaming;

  // Save immediately on important state transitions (infrequent)
  useEffect(() => {
    if (isStreaming) return;
    saveSession(sessionSnapshotRef.current!);
  }, [isStreaming, interview.mode, interview.currentProblem, editor.editorTab, interview.hintsUsed, interview.interviewStage, interview.interviewCategory, interview.sdTopicId, sdState, interview.commitmentGate, interview.hints, saveSession]);

  // Periodic save for content changes (editorCode, timerSeconds, notes, messages)
  useEffect(() => {
    const id = setInterval(() => {
      if (!isStreamingRef.current && sessionSnapshotRef.current) {
        saveSession(sessionSnapshotRef.current);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [saveSession]);

  // Keyboard shortcuts for panel collapse/expand
  const {
    isChatCollapsed, isEditorCollapsed,
    collapseChat, expandChat, collapseEditor, expandEditor,
  } = layout;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        isChatCollapsed ? expandChat() : collapseChat();
      }
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        isEditorCollapsed ? expandEditor() : collapseEditor();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatCollapsed, isEditorCollapsed, collapseChat, expandChat, collapseEditor, expandEditor]);

  // ── Route sync: URL → state on initial load and popstate ──
  const routeSyncedRef = useRef(false);
  useEffect(() => {
    if (routeSyncedRef.current) return;
    routeSyncedRef.current = true;

    const path = location.pathname;
    const panelMap: Record<string, SidebarPanel> = {
      '/behavioral': 'behavioral',
      '/settings': 'settings',
      '/achievements': 'achievements',
      '/stats': 'stats',
      '/mistakes': 'mistakes',
      '/problems': 'problems',
    };

    if (path.startsWith('/problems/')) {
      const id = path.slice('/problems/'.length);
      if (id && problemsById[id]) {
        // Defer to avoid state-during-render issues
        setTimeout(() => handleSelectProblem(id), 0);
      }
    } else if (panelMap[path]) {
      setSidebarPanel(panelMap[path]);
    }
    // '/' and unknown paths — just show default state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route-aware panel change: update URL when sidebar panel changes
  const handlePanelChange = useCallback((panel: SidebarPanel) => {
    setSidebarPanel(panel);
    if (panel === 'interview') return; // Modal, no URL change
    if (panel === null) {
      // Navigate to current problem or home
      const pid = interview.currentProblem?.id;
      navigate(pid ? `/problems/${pid}` : '/', { replace: true });
    } else {
      navigate(`/${panel}`, { replace: true });
    }
  }, [navigate, interview.currentProblem]);

  /** Handle mode switch from TopNav segmented control */
  const handleModeChange = useCallback((newMode: Mode) => {
    if (newMode === interview.mode) return;

    // Guard: warn if leaving an active interview
    if (interview.mode === 'INTERVIEWER' && timer.timerRunning) {
      const confirmed = window.confirm('End current interview? Your progress will be preserved but the timer will stop.');
      if (!confirmed) return;
      timer.setTimerRunning(false);
    }

    interview.setMode(newMode);

    if (newMode === 'INTERVIEWER') {
      interview.setInterviewModalOpen(true);
    } else if (newMode === 'REVIEWER') {
      interview.setReviewRubricOpen(true);
    } else {
      // TEACHER — reset interview-specific state, but keep system design workspace alive
      if (interview.interviewStage !== 'system-design') {
        interview.setInterviewStage(null);
      }
      interview.setInterviewCategory(null);
    }
  }, [interview, timer]);

  /** Handle local side effects for slash commands, then send to Claude */
  const handleSendMessage = useCallback((content: string) => {
    // Local side effects for slash commands
    if (content.startsWith('/hint') || content.startsWith('/stuck')) {
      const nextLevel = (interview.hintsUsed + 1) as 1 | 2 | 3;
      if (nextLevel <= 3) {
        interview.setHints((prev) =>
          prev.map((h) => (h.level === nextLevel ? { ...h, unlocked: true } : h))
        );
        interview.setHintsUsed(nextLevel);
        // Auto-log mistake when hint 3 is used (user is deeply stuck)
        if (nextLevel === 3 && interview.currentProblem) {
          addMistake({
            pattern: interview.currentProblem.pattern as PatternName,
            problemId: interview.currentProblem.id,
            problemTitle: interview.currentProblem.title,
            description: `Needed all 3 hints to solve ${interview.currentProblem.title}`,
          });
        }
      }
      interview.setHintLadderOpen(true);
    } else if (content.startsWith('/review')) {
      interview.setMode('REVIEWER');
      interview.setReviewRubricOpen(true);
      // Auto-include code context for AI review
      if (interview.currentProblem && editor.editorCode) {
        const codeContext = `\n\n**My code for ${interview.currentProblem.title}:**\n\`\`\`typescript\n${editor.editorCode}\n\`\`\``;
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
          interview.setCurrentProblem(problem);
          editor.setEditorCode(getStarterCode(problem, editor.language));
          editor.setTestCode(getTestCode(problem, editor.language));
          editor.setTestResults([]);
          interview.setHintsUsed(0);
          interview.setHints((prev) => prev.map((h) => ({ ...h, unlocked: false, content: '' })));
          interview.setCommitmentGate(DEFAULT_GATE.map((g) => ({ ...g, completed: false })));
        }
      }
    } else if (content.startsWith('/check')) {
      // Auto-include editor code for approach validation
      if (interview.currentProblem && editor.editorCode) {
        const codeContext = `\n\n**My current code for ${interview.currentProblem.title}:**\n\`\`\`typescript\n${editor.editorCode}\n\`\`\``;
        sendMessage(content + codeContext);
        return;
      }
    } else if (content.startsWith('/continue')) {
      // Enrich with session state so Claude can recap
      const gateStatus = interview.commitmentGate.map((g) => `${g.completed ? '[x]' : '[ ]'} ${g.label}`).join(', ');
      const parts = [
        interview.currentProblem ? `Problem: ${interview.currentProblem.title} (${interview.currentProblem.difficulty}, ${interview.currentProblem.pattern})` : 'No active problem',
        `Mode: ${interview.mode}`,
        `Hints: ${interview.hintsUsed}/3`,
        `Gate: ${gateStatus}`,
        interview.interviewStage ? `Interview: ${interview.interviewStage}` : null,
        timer.timerRunning ? `Timer: ${Math.floor(timer.timerSeconds / 60)}m left` : null,
      ].filter(Boolean).join(' | ');
      sendMessage(`/continue\n\n[Session: ${parts}]`);
      return;
    } else if (content.startsWith('/recap')) {
      // Enrich with detailed session state
      const gateLines = interview.commitmentGate.map((g) => `- [${g.completed ? 'x' : ' '}] ${g.label}`).join('\n');
      const sessionInfo = [
        interview.currentProblem ? `**Problem:** ${interview.currentProblem.title} (${interview.currentProblem.difficulty}, ${interview.currentProblem.pattern})` : '**Problem:** None',
        `**Mode:** ${interview.mode}`,
        `**Hints used:** ${interview.hintsUsed}/3`,
        `**Commitment gate:**\n${gateLines}`,
        interview.interviewStage ? `**Interview stage:** ${interview.interviewStage}` : null,
        timer.timerRunning ? `**Timer:** ${Math.floor(timer.timerSeconds / 60)}m ${timer.timerSeconds % 60}s remaining` : null,
      ].filter(Boolean).join('\n');
      sendMessage(`/recap\n\n${sessionInfo}`);
      return;
    }

    // Send to Claude API
    sendMessage(content);
  }, [interview, editor, timer, sendMessage, addMistake, getNextProblem]);

  const getProblemProgress = useCallback((id: string) => {
    const p = stats.problemProgress[id];
    if (!p) return null;
    return { bestScore: p.bestScore, bestTime: p.bestTime, hintsUsed: p.hintsUsed, attempts: p.attempts };
  }, [stats.problemProgress]);

  const handleShareSolution = useCallback(() => {
    if (!interview.currentProblem) return;
    exportSolutionCard({
      problemTitle: interview.currentProblem.title,
      difficulty: interview.currentProblem.difficulty,
      pattern: interview.currentProblem.pattern,
      timeComplexity: '—',
      spaceComplexity: '—',
      code: editor.editorCode,
      timeSeconds: timer.timerSeconds,
      hintsUsed: interview.hintsUsed,
      score: null,
    });
  }, [interview.currentProblem, editor.editorCode, timer.timerSeconds, interview.hintsUsed]);

  const handleClearConsole = useCallback(() => {
    editor.setTestResults([]);
    editor.setConsoleLogs([]);
  }, [editor]);

  async function handleRunTests() {
    if (editor.runningTests) return;
    editor.setRunningTests(true);
    editor.setConsoleOpen(true);

    try {
      if (interview.currentProblem) {
        // Check if Tests tab content matches the current problem.
        // They can diverge when AI overwrites tests via /solve, user edits
        // the Tests tab, or session restore races.
        const expectedTestCode = getTestCode(interview.currentProblem, editor.language);
        const testsMatch = editor.testCode.trim() === expectedTestCode.trim();

        if (!testsMatch) {
          // Tests tab has diverged — run what the user actually sees
          const parsedTests = parseTestCode(editor.testCode);
          if (parsedTests.length > 0) {
            const { results, logs } = await executeTests(editor.editorCode, parsedTests, editor.language);
            editor.setTestResults(results);
            editor.setConsoleLogs(logs);
          } else {
            const { logs } = await executeFreeform(editor.editorCode, editor.testCode, editor.language);
            editor.setTestResults([]);
            editor.setConsoleLogs(logs);
          }
        } else {
          // Tests match — use structured test cases (fast path)
          const { results, logs } = await executeTests(editor.editorCode, interview.currentProblem.testCases, editor.language);
          editor.setTestResults(results);
          editor.setConsoleLogs(logs);

          const passed = results.filter((r) => r.passed).length;
          const total = results.length;
          const allPassed = passed === total;

          recordProblemAttempt({
            problemId: interview.currentProblem.id,
            status: allPassed ? 'solved' : 'attempted',
            score: allPassed ? 4 : null,
            time: null,
            hintsUsed: interview.hintsUsed,
            code: editor.editorCode,
          });

          if (interview.currentProblem.pattern) {
            updatePatternStrength(
              interview.currentProblem.pattern as PatternName,
              allPassed,
              allPassed ? 4 : (passed / total) * 4,
            );
          }

          const defaultSeconds = getSettings().timerDefaultMinutes * 60;
          const elapsed = timer.timerRunning ? Math.max(0, defaultSeconds - timer.timerSeconds) : 0;
          recordSession({
            problemId: interview.currentProblem.id,
            problemTitle: interview.currentProblem.title,
            mode: interview.mode,
            duration: elapsed,
            hintsUsed: interview.hintsUsed,
            score: allPassed ? 4 : (passed / total) * 4,
            patterns: interview.currentProblem.pattern
              ? [interview.currentProblem.pattern as PatternName]
              : [],
          });

          if (!allPassed) {
            const failedCount = total - passed;
            addMistake({
              pattern: interview.currentProblem.pattern as PatternName,
              problemId: interview.currentProblem.id,
              problemTitle: interview.currentProblem.title,
              description: `Failed ${failedCount}/${total} test cases`,
            });
          }
        }
      } else {
        // Custom/AI-generated problem — parse test code from Tests tab
        const parsedTests = parseTestCode(editor.testCode);
        if (parsedTests.length > 0) {
          const { results, logs } = await executeTests(editor.editorCode, parsedTests, editor.language);
          editor.setTestResults(results);
          editor.setConsoleLogs(logs);
        } else {
          // No parseable tests — run freeform (solution + test code concatenated)
          const { logs } = await executeFreeform(editor.editorCode, editor.testCode, editor.language);
          editor.setTestResults([]);
          editor.setConsoleLogs(logs);
        }
      }
    } finally {
      editor.setRunningTests(false);
    }
  }

  function handleToggleGateItem(id: string) {
    interview.setCommitmentGate((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }

  function handleRequestHint(level: 1 | 2 | 3) {
    if (level > interview.hintsUsed + 1) return;
    interview.setHints((prev) =>
      prev.map((h) => (h.level === level ? { ...h, unlocked: true } : h))
    );
    interview.setHintsUsed(Math.max(interview.hintsUsed, level));
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
    interview.setMode('INTERVIEWER');
    timer.setTimerRunning(true);
    timer.setTimerSeconds(2700);
    interview.setHintsUsed(0);
    interview.setHints(DEFAULT_HINTS);
    interview.setCommitmentGate(DEFAULT_GATE);
    editor.setTestResults([]);
    editor.setConsoleOpen(false);
    editor.setEditorTab('solution');
    interview.setInterviewStage(config.stage);
    interview.setInterviewCategory(config.category ?? null);
    interview.setSdTopicId(config.systemDesignTopic ?? null);

    // Clear messages for fresh interview
    setMessages([]);

    // Reset editor content based on interview type
    if (config.stage === 'system-design') {
      interview.setCurrentProblem(null);
      editor.setEditorCode(SYSTEM_DESIGN_STARTER);
      editor.setNotes('');

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
      interview.setCurrentProblem(null); // Will be set by Claude's response
      editor.setEditorCode('// Your solution here\n');
      editor.setTestCode('// Write test cases here');
      editor.setNotes('');
    } else {
      interview.setCurrentProblem(null);
      editor.setEditorCode('// Use this space for notes during the interview\n');
      editor.setTestCode('');
      editor.setNotes('');
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
      logger.log('[App] Sending silent command:', command);
      sendSilentMessage(command);
    } else {
      logger.warn('[App] No command built for config:', config);
    }
  }

  function handleSelectProblem(id: string) {
    const problem = problemsById[id];
    if (!problem) return;

    // Load full problem data into editor (language-aware)
    interview.setCurrentProblem(problem);
    editor.setEditorCode(getStarterCode(problem, editor.language));
    editor.setTestCode(getTestCode(problem, editor.language));

    // Reset UI state
    editor.setTestResults([]);
    editor.setConsoleOpen(false);
    interview.setHintsUsed(0);
    interview.setHintLadderOpen(false);
    interview.setHints(DEFAULT_HINTS);
    interview.setCommitmentGate(DEFAULT_GATE);
    interview.setInterviewStage(null);
    interview.setInterviewCategory(null);
    interview.setMode('TEACHER');
    timer.setTimerRunning(false);
    editor.setEditorTab('solution');
    editor.setNotes('');
    sdDispatch({ type: 'RESET' });

    // Close sidebar and update URL
    setSidebarPanel(null);
    navigate(`/problems/${id}`);

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
  const gateCompleted = interview.commitmentGate.filter((i) => i.completed).length;
  const progressPercent = readinessScore > 0 ? readinessScore : (interview.currentProblem ? (gateCompleted / interview.commitmentGate.length) * 100 : 0);

  if (showLanding) {
    return (
      <ErrorBoundary name="Landing">
      <Suspense fallback={null}>
        <Landing
          onEnterApp={() => {
            safeSetItem('sim-skip-landing', '1');
            setShowLanding(false);
          }}
          onCheckout={subscription.checkout}
          isAuthenticated={isAuthenticated}
        />
      </Suspense>
      </ErrorBoundary>
    );
  }

  if (authLoading) {
    if (authTimedOut) {
      return (
        <div className="auth-error-banner">
          <div className="auth-error-banner__icon">⚠</div>
          <div className="auth-error-banner__title">Could not connect</div>
          <div>Working in offline mode — your progress is saved locally.</div>
          <div className="auth-error-banner__actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Retry</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAuthSkip}>Continue</button>
          </div>
        </div>
      );
    }
    return <AppSkeleton />;
  }

  if (!isAuthenticated && !authSkipped) {
    return (
      <AuthPage
        onSignIn={signIn}
        onSignUp={signUp}
        onOAuth={signInWithOAuth}
        onSkip={handleAuthSkip}
      />
    );
  }

  return (
    <div className="app-shell">
      {syncToast && <div className="sync-toast">{syncToast}</div>}
      {achievementToast && (
        <div className="sync-toast" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(163,255,0,0.1))', borderColor: 'var(--neon-cyan)' }}>
          {achievementToast}
        </div>
      )}
      <TopNav
        mode={interview.mode}
        problem={interview.currentProblem}
        timerSeconds={timer.timerSeconds}
        timerRunning={timer.timerRunning}
        hintsUsed={interview.hintsUsed}
        progressPercent={progressPercent}
        user={user}
        onSignOut={signOut}
        onSync={handleSync}
        syncing={syncing}
        plan={subscription.plan}
        onManageSubscription={subscription.manage}
        onModeChange={handleModeChange}
      />

      <div className="app-body">
        <Sidebar
          activePanel={sidebarPanel}
          onPanelChange={handlePanelChange}
          onLaunchInterview={() => interview.setInterviewModalOpen(true)}
          onSelectProblem={handleSelectProblem}
          currentProblemId={interview.currentProblem?.id || null}
          mistakes={mistakes}
          dueForReview={dueForReview}
          onReviewMistake={reviewMistake}
          onRemoveMistake={removeMistake}
          onAddMistake={addMistake}
          stats={stats}
          getProblemStatus={getProblemStatus}
          recommendations={getRecommendations(3)}
          dailyChallenge={dailyChallenge}
          achievements={achievements}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
          getProblemProgress={getProblemProgress}
        />

        <div
          className={`workspace${layout.isChatCollapsed ? ' workspace-chat-collapsed' : ''}${layout.isEditorCollapsed ? ' workspace-editor-collapsed' : ''}`}
          style={{ '--chat-width': layout.isChatCollapsed ? '0%' : layout.isEditorCollapsed ? '100%' : `${layout.chatWidthPercent}%` } as React.CSSProperties}
        >
          <ErrorBoundary name="Workspace">
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>Loading...</div>}>
          {isSystemDesignActive ? (
            <SystemDesignRouter
              sdState={sdState}
              sdDispatch={sdDispatch}
              advancePhase={advancePhase}
              phaseOrder={PHASE_ORDER}
              timerSeconds={timer.timerSeconds}
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={stopStreaming}
              chatPanel={
                <ChatPanel
                  mode={interview.mode}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  hidden={false}
                  isStreaming={isStreaming}
                  onStopStreaming={stopStreaming}
                  rateLimitInfo={rateLimitInfo}
                  onUpgrade={() => handlePanelChange('settings')}
                />
              }
              editorPanel={
                <EditorPanel
                  problemId={interview.currentProblem?.id}
                  activeTab={editor.editorTab}
                  onTabChange={editor.setEditorTab}
                  code={editor.editorCode}
                  testCode={editor.testCode}
                  notes={editor.notes}
                  onCodeChange={editor.setEditorCode}
                  onTestCodeChange={editor.setTestCode}
                  onNotesChange={editor.setNotes}
                  onRunTests={handleRunTests}
                  runningTests={editor.runningTests}
                  testResults={editor.testResults}
                  consoleLogs={editor.consoleLogs}
                  consoleOpen={editor.consoleOpen}
                  onToggleConsole={() => editor.setConsoleOpen(!editor.consoleOpen)}
                  hidden={false}
                  interviewStage={interview.interviewStage}
                  systemDesignTopicId={interview.sdTopicId}
                  onSendMessage={handleSendMessage}
                  onLanguageChange={handleLanguageChange}
                  onShareSolution={handleShareSolution}
                  onClearConsole={handleClearConsole}
                />
              }
            />
          ) : (
            <>
              {layout.isChatCollapsed && (
                <button
                  type="button"
                  className="panel-expand-bar"
                  onClick={layout.expandChat}
                  aria-label="Expand chat panel"
                >
                  <ChevronRight size={14} className="panel-expand-bar-icon" aria-hidden="true" />
                  <span className="panel-expand-bar-label">Chat</span>
                </button>
              )}
              <ChatPanel
                mode={interview.mode}
                messages={messages}
                onSendMessage={handleSendMessage}
                hidden={mobileView !== 'chat'}
                isStreaming={isStreaming}
                onStopStreaming={stopStreaming}
                rateLimitInfo={rateLimitInfo}
                onUpgrade={() => handlePanelChange('settings')}
              />
              {!layout.isChatCollapsed && !layout.isEditorCollapsed && (
                <WorkspaceSplitter
                  chatWidthPercent={layout.chatWidthPercent}
                  isSwapped={layout.isSwapped}
                  onResize={layout.setChatWidth}
                  onCollapseChat={layout.collapseChat}
                  onCollapseEditor={layout.collapseEditor}
                  onReset={layout.resetLayout}
                  minPercent={layout.MIN_PERCENT}
                  maxPercent={layout.MAX_PERCENT}
                />
              )}
              <EditorPanel
                problemId={interview.currentProblem?.id}
                activeTab={editor.editorTab}
                onTabChange={editor.setEditorTab}
                code={editor.editorCode}
                testCode={editor.testCode}
                notes={editor.notes}
                onCodeChange={editor.setEditorCode}
                onTestCodeChange={editor.setTestCode}
                onNotesChange={editor.setNotes}
                onRunTests={handleRunTests}
                runningTests={editor.runningTests}
                testResults={editor.testResults}
                consoleLogs={editor.consoleLogs}
                consoleOpen={editor.consoleOpen}
                onToggleConsole={() => editor.setConsoleOpen(!editor.consoleOpen)}
                hidden={mobileView !== 'editor'}
                interviewStage={interview.interviewStage}
                systemDesignTopicId={interview.sdTopicId}
                onSendMessage={handleSendMessage}
                onLanguageChange={handleLanguageChange}
                onShareSolution={handleShareSolution}
                onClearConsole={handleClearConsole}
              />
              {layout.isEditorCollapsed && (
                <button
                  type="button"
                  className="panel-expand-bar"
                  onClick={layout.expandEditor}
                  aria-label="Expand editor panel"
                >
                  <ChevronLeft size={14} className="panel-expand-bar-icon" aria-hidden="true" />
                  <span className="panel-expand-bar-label">Editor</span>
                </button>
              )}
            </>
          )}
          </Suspense>
          </ErrorBoundary>
        </div>

        <CommitmentGate
          open={interview.commitmentGateOpen}
          onClose={() => interview.setCommitmentGateOpen(false)}
          items={interview.commitmentGate}
          onToggle={handleToggleGateItem}
        />
      </div>

      <div className="mobile-tabs">
        <button
          type="button"
          className={`mobile-tab ${mobileView === 'chat' ? 'mobile-tab-active' : ''}`}
          onClick={() => setMobileView('chat')}
        >
          Mentor Chat
        </button>
        <button
          type="button"
          className={`mobile-tab ${mobileView === 'editor' ? 'mobile-tab-active' : ''}`}
          onClick={() => setMobileView('editor')}
        >
          Code Editor
        </button>
      </div>

      <ErrorBoundary name="Modals">
      <Suspense fallback={null}>
        {interview.interviewModalOpen && (
          <InterviewLauncher
            open={interview.interviewModalOpen}
            onClose={() => interview.setInterviewModalOpen(false)}
            onStart={handleStartInterview}
          />
        )}

        {interview.reviewRubricOpen && (
          <ReviewRubric
          problemTitle={interview.currentProblem?.title ?? 'Current Problem'}
          problemId={interview.currentProblem?.id ?? null}
          onSubmit={(review: ReviewResult) => {
            recordReview(review);
            if (interview.currentProblem?.pattern) {
              updatePatternStrength(
                interview.currentProblem.pattern as PatternName,
                review.overallScore >= 3,
                review.overallScore,
              );
            }
          }}
          onClose={() => interview.setReviewRubricOpen(false)}
        />
      )}
      </Suspense>
      </ErrorBoundary>

      {interview.hintsUsed > 0 && interview.hintLadderOpen && (
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
              type="button"
              onClick={() => interview.setHintLadderOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
              aria-label="Close hint ladder"
            >
              ×
            </button>
          </div>
          <HintLadder hints={interview.hints} onRequestHint={handleRequestHint} />
        </div>
      )}
    </div>
  );
}

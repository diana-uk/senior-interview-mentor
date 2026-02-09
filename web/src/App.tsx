import { useState, useEffect, useCallback } from 'react';
import TopNav from './components/layout/TopNav';
import Sidebar from './components/layout/Sidebar';
import ChatPanel from './components/chat/ChatPanel';
import EditorPanel from './components/editor/EditorPanel';
import InterviewLauncher from './components/modals/InterviewLauncher';
import CommitmentGate from './components/panels/CommitmentGate';
import HintLadder from './components/panels/HintLadder';
import SystemDesignRouter from './components/systemdesign/SystemDesignRouter';
import { useChat } from './hooks/useChat';
import { useSystemDesignState } from './hooks/useSystemDesignState';
import type {
  ChatMessage,
  ChatContext,
  CommitmentGateItem,
  EditorTab,
  HintLevel,
  InterviewStage,
  Mode,
  Problem,
  SidebarPanel,
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
  { level: 1, label: 'Nudge', description: 'A small push in the right direction', content: 'Think about what data structure lets you look up values in O(1) time. What if you stored the complement?', unlocked: false, color: 'var(--accent-green)' },
  { level: 2, label: 'Structure', description: 'Data structure + algorithm steps', content: 'Use a HashMap to store each number\'s index as you iterate. For each number, check if (target - num) exists in the map.', unlocked: false, color: 'var(--accent-orange)' },
  { level: 3, label: 'Pseudocode', description: 'Detailed pseudocode outline', content: '1. Create empty map\n2. For each num at index i:\n   a. complement = target - num\n   b. If complement in map → return [map[complement], i]\n   c. Else → map[num] = i\n3. Return [] (no solution)', unlocked: false, color: 'var(--accent-purple)' },
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

/** Actually execute user code against test cases */
function executeTests(code: string, testCases: TestCase[]): TestCase[] {
  return testCases.map((tc) => {
    try {
      // Build a function that defines the user's code then calls the test input
      const wrappedCode = `
        ${code}
        return JSON.stringify(${tc.input});
      `;
      const fn = new Function(wrappedCode);
      const actualRaw = fn();
      const actual = String(actualRaw);

      // Normalize comparison: sort arrays for order-independent matching
      let passed = false;
      try {
        const expectedParsed = JSON.parse(tc.expected);
        const actualParsed = JSON.parse(actual);
        if (Array.isArray(expectedParsed) && Array.isArray(actualParsed)) {
          passed =
            JSON.stringify([...expectedParsed].sort()) ===
            JSON.stringify([...actualParsed].sort());
        } else {
          passed = JSON.stringify(expectedParsed) === JSON.stringify(actualParsed);
        }
      } catch {
        passed = actual.replace(/\s/g, '') === tc.expected.replace(/\s/g, '');
      }

      return { ...tc, actual, passed };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Runtime error';
      return { ...tc, actual: `Error: ${msg}`, passed: false };
    }
  });
}

export default function App() {
  const [mode, setMode] = useState<Mode>('TEACHER');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(defaultProblem);
  const [sidebarPanel, setSidebarPanel] = useState<SidebarPanel>(null);
  const [editorTab, setEditorTab] = useState<EditorTab>('solution');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [commitmentGateOpen, setCommitmentGateOpen] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(2700);
  const [timerRunning, setTimerRunning] = useState(false);
  const [editorCode, setEditorCode] = useState(defaultProblem.starterCode);
  const [testCode, setTestCode] = useState('// Write custom test cases here\nconsole.log(twoSum([2,7,11,15], 9)); // expected: [0,1]');
  const [notes, setNotes] = useState('// Scratch pad\n// Pattern: HashMap\n// Key insight: store complement');
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [commitmentGate, setCommitmentGate] = useState<CommitmentGateItem[]>(defaultGate);
  const [hints, setHints] = useState<HintLevel[]>(defaultHints);
  const [mobileView, setMobileView] = useState<'chat' | 'editor'>('chat');
  const [interviewStage, setInterviewStage] = useState<InterviewStage | null>(null);
  const [interviewCategory, setInterviewCategory] = useState<TechnicalQuestionCategory | null>(null);
  const [sdTopicId, setSdTopicId] = useState<SystemDesignTopicId | null>(null);

  const { sdState, sdDispatch, advancePhase, PHASE_ORDER } = useSystemDesignState();
  const isSystemDesignActive = interviewStage === 'system-design' && sdState.active;

  const getContext = useCallback((): ChatContext | undefined => {
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
    };
  }, [mode, currentProblem, hintsUsed, commitmentGate, interviewStage, interviewCategory]);

  const { messages, setMessages, isStreaming, sendMessage, stopStreaming } = useChat({
    initialMessages,
    getContext,
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

  /** Handle local side effects for slash commands, then send to Claude */
  const handleSendMessage = useCallback((content: string) => {
    // Local side effects for slash commands
    if (content.startsWith('/hint')) {
      const nextLevel = (hintsUsed + 1) as 1 | 2 | 3;
      if (nextLevel <= 3) {
        setHints((prev) =>
          prev.map((h) => (h.level === nextLevel ? { ...h, unlocked: true } : h))
        );
        setHintsUsed(nextLevel);
      }
    } else if (content.startsWith('/stuck')) {
      const nextLevel = (hintsUsed + 1) as 1 | 2 | 3;
      if (nextLevel <= 3) {
        setHints((prev) =>
          prev.map((h) => (h.level === nextLevel ? { ...h, unlocked: true } : h))
        );
        setHintsUsed(nextLevel);
      }
    } else if (content.startsWith('/solve')) {
      setCommitmentGateOpen(true);
    } else if (content.startsWith('/review')) {
      setMode('REVIEWER');
    }

    // Send to Claude API
    sendMessage(content);
  }, [hintsUsed, sendMessage]);

  function handleRunTests() {
    if (!currentProblem) return;
    const results = executeTests(editorCode, currentProblem.testCases);
    setTestResults(results);
    setConsoleOpen(true);
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
  }) {
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
      setCurrentProblem(defaultProblem);
      setEditorCode(defaultProblem.starterCode);
      setTestCode('// Write custom test cases here');
      setNotes('');
    } else {
      setCurrentProblem(null);
      setEditorCode('// Use this space for notes during the interview\n');
      setTestCode('');
      setNotes('');
    }

    const categoryLabel = config.category
      ? questionCategories.find((c) => c.id === config.category)?.label ?? config.category
      : 'Mixed';

    // Build system design prompt dynamically
    let sdPromptText = '';
    if (config.stage === 'system-design') {
      if (config.systemDesignTopic === 'custom' && config.customSystemDesignPrompt) {
        sdPromptText = config.customSystemDesignPrompt;
      } else if (config.systemDesignTopic && config.systemDesignTopic !== 'custom') {
        sdPromptText = SD_TOPIC_TITLES[config.systemDesignTopic].prompt;
      } else {
        sdPromptText = 'Design a **URL shortening service** like bit.ly.';
      }
    }

    const msg: ChatMessage = {
      id: generateId(),
      role: 'mentor',
      content: config.stage === 'technical'
        ? `**Interview Started — Technical Coding**\n\nTimer is running: **45 minutes**.\n\nFormat: **${config.format === 'leetcode' ? 'LeetCode / Algorithms' : 'Project-based'}**${config.topic ? `\nTopic: **${config.topic}**` : ''}${config.difficulty ? `\nDifficulty: **${config.difficulty}**` : ''}\n\nLet's begin. Read the problem carefully and start by clarifying any questions about constraints.`
        : config.stage === 'system-design'
        ? `**Interview Started — System Design**\n\nTimer is running: **45 minutes**.\n\n${sdPromptText}\n\nThe right panel has a **structured design workspace** with 6 sections:\n1. **Requirements & Scope** — Start here. Clarify functional and non-functional requirements.\n2. **API Design** — Define your endpoints and contracts.\n3. **Data Model** — Schema, storage choice, indexing.\n4. **High-Level Architecture** — Describe components and data flow in text.\n5. **Deep Dives** — Pick 2-3 areas to explore tradeoffs.\n6. **Scaling & Reliability** — How does it handle 100x traffic?\n\nFill out each section in the design workspace. Write in plain text — describe components, data flow, and tradeoffs.\n\nStart by clarifying the **requirements**. What questions would you ask the interviewer?`
        : config.stage === 'behavioral'
        ? `**Interview Started — Behavioral**\n\nTimer is running: **45 minutes**.\n\nTell me about a time you had to make a difficult technical decision under time pressure.\n\nUse the **STAR format**:\n- **Situation**: Set the context\n- **Task**: What was your responsibility?\n- **Action**: What did you do?\n- **Result**: What was the outcome?\n\nYou can use the editor panel on the right to draft your notes.`
        : config.stage === 'technical-questions'
        ? `**Interview Started — Technical Questions**\n\nTimer is running: **45 minutes**.\n\nCategory: **${categoryLabel}**\n\nThis is a conceptual interview — no coding required. I'll ask you a series of knowledge-based questions about **${categoryLabel.toLowerCase()}** topics.\n\nFor each question:\n- Think out loud and explain your reasoning\n- Discuss tradeoffs, not just definitions\n- Give real-world examples when possible\n- Ask clarifying questions if needed\n\nUse the editor to jot notes if it helps.\n\nLet's begin with the first question.`
        : `**Interview Started — Phone Screen**\n\nTimer is running: **45 minutes**.\n\nLet's start with a brief introduction. Tell me about your background and a recent project you're proud of.\n\nI'll follow up with a mix of:\n- Technical knowledge questions\n- Light coding problems\n- Behavioral questions\n\nUse the editor to take notes or write code snippets as needed.`,
      timestamp: new Date(),
    };
    setMessages([msg]);
  }

  function handleSelectProblem(_id: string) {
    setCurrentProblem(defaultProblem);
    setEditorCode(defaultProblem.starterCode);
    setTestCode('// Write custom test cases here\nconsole.log(twoSum([2,7,11,15], 9)); // expected: [0,1]');
    setTestResults([]);
    setConsoleOpen(false);
    setHintsUsed(0);
    setHints(defaultHints);
    setCommitmentGate(defaultGate);
    setInterviewStage(null);
    setInterviewCategory(null);
    setMode('TEACHER');
    setTimerRunning(false);
    setEditorTab('solution');
    sdDispatch({ type: 'RESET' });
    setMessages([
      {
        id: generateId(),
        role: 'mentor',
        content: `**Loaded: ${defaultProblem.title}** (${defaultProblem.difficulty})\n\n${defaultProblem.description}\n\n**Examples:**\n\`\`\`\n${defaultProblem.examples[0]}\n\`\`\`\n\n**Constraints:**\n${defaultProblem.constraints.map((c) => `- \`${c}\``).join('\n')}\n\nStart by recapping the constraints and identifying the pattern.`,
        timestamp: new Date(),
      },
    ]);
    setSidebarPanel(null);
  }

  const gateCompleted = commitmentGate.filter((i) => i.completed).length;
  const progressPercent = currentProblem ? (gateCompleted / commitmentGate.length) * 100 : 0;

  return (
    <div className="app">
      <TopNav
        mode={mode}
        problem={currentProblem}
        timerSeconds={timerSeconds}
        timerRunning={timerRunning}
        hintsUsed={hintsUsed}
        progressPercent={progressPercent}
      />

      <div className="main-content">
        <Sidebar
          activePanel={sidebarPanel}
          onPanelChange={setSidebarPanel}
          onLaunchInterview={() => setInterviewModalOpen(true)}
          onSelectProblem={handleSelectProblem}
          currentProblemId={currentProblem?.id || null}
        />

        <div className="workspace">
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
                  activeTab={editorTab}
                  onTabChange={setEditorTab}
                  code={editorCode}
                  testCode={testCode}
                  notes={notes}
                  onCodeChange={setEditorCode}
                  onTestCodeChange={setTestCode}
                  onNotesChange={setNotes}
                  onRunTests={handleRunTests}
                  testResults={testResults}
                  consoleOpen={consoleOpen}
                  onToggleConsole={() => setConsoleOpen(!consoleOpen)}
                  hidden={false}
                  interviewStage={interviewStage}
                  systemDesignTopicId={sdTopicId}
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
                activeTab={editorTab}
                onTabChange={setEditorTab}
                code={editorCode}
                testCode={testCode}
                notes={notes}
                onCodeChange={setEditorCode}
                onTestCodeChange={setTestCode}
                onNotesChange={setNotes}
                onRunTests={handleRunTests}
                testResults={testResults}
                consoleOpen={consoleOpen}
                onToggleConsole={() => setConsoleOpen(!consoleOpen)}
                hidden={mobileView !== 'editor'}
                interviewStage={interviewStage}
                systemDesignTopicId={sdTopicId}
              />
            </>
          )}
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
          className={`mobile-tab ${mobileView === 'chat' ? 'mobile-tab--active' : ''}`}
          onClick={() => setMobileView('chat')}
        >
          Mentor Chat
        </button>
        <button
          className={`mobile-tab ${mobileView === 'editor' ? 'mobile-tab--active' : ''}`}
          onClick={() => setMobileView('editor')}
        >
          Code Editor
        </button>
      </div>

      <InterviewLauncher
        open={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        onStart={handleStartInterview}
      />

      {hintsUsed > 0 && sidebarPanel === null && !commitmentGateOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            left: 60,
            width: 260,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 0',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ padding: '0 12px 8px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Hint Ladder
          </div>
          <HintLadder hints={hints} onRequestHint={handleRequestHint} />
        </div>
      )}
    </div>
  );
}

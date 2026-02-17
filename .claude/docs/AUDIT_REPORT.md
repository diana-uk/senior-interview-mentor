# Senior Interview Mentor — Comprehensive Audit Report

> **Audit Date:** 2026-02-17  
> **Auditor:** Claude (automated static + runtime analysis)  
> **Scope:** Full codebase — App.tsx, useChat.ts, api.ts, ChatPanel.tsx, Sidebar.tsx, TopNav.tsx, StatsPanel.tsx, AchievementsPanel.tsx, MistakesPanel.tsx, VoiceButton.tsx, codeExecutor.ts, useStats.ts, useSubscription.ts, useSessionPersistence.ts, all custom hooks  
> **Total Issues Found:** 28

---

## Table of Contents

- [Summary](#summary)
- [Critical](#critical)
- [High](#high)
- [Medium](#medium)
- [Low](#low)
- [Prioritized Implementation Order](#prioritized-implementation-order)

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 5 |
| 🟠 High | 6 |
| 🟡 Medium | 11 |
| 🟢 Low | 6 |
| **Total** | **28** |

---

## Critical

---

### #1 — `useCallback` Stale Closures — State Never Updates

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` lines 203, 450 |
| **Severity** | 🔴 Critical |

**Steps to Reproduce**
1. Use `handleSync` (line 203) or the message-dispatch callback (line 450) after any state has changed.
2. Observe stale state being read inside the callback.

**Expected:** Callbacks always reference the latest state.  
**Actual:** Callbacks are frozen at creation time, reading outdated values.

**Root Cause:** Two `useCallback` calls have **no dependency array at all** (not even `[]`). Without a deps array the callback is never memoized *and* captures a stale closure.

```ts
// ❌ CURRENT — no deps array, async, reads/sets state
const handleSync = useCallback(async () => {
  // reads isAuthenticated, stats — all stale
}, );  // ← missing [] entirely

// ✅ FIX
const handleSync = useCallback(async () => {
  // ...
}, [isAuthenticated, stats /*, all referenced state */]);
```

```ts
// ❌ CURRENT — line 450, no deps array, sets messages
const wrappedCallback = useCallback((msgs) => {
  setMessages(msgs);
}, );  // ← missing

// ✅ FIX
const wrappedCallback = useCallback((msgs) => {
  setMessages(msgs);
}, [/* explicit dependencies */]);
```

---

### #2 — `avgScore === 0` Renders as `"—"` (Falsy Zero Bug)

| Field | Value |
|-------|-------|
| **Location** | `StatsPanel.tsx` line 236 |
| **Severity** | 🔴 Critical |

**Steps to Reproduce**
1. Open the Statistics panel with 0 solved problems.
2. Observe "AVG SCORE" shows `—` even though `stats.avgScore` is `0`.

**Expected:** `0.0` when value is zero (no sessions yet).  
**Actual:** Shows `—` (em dash) — misleads users into thinking there is no data field.

**Root Cause:** Ternary uses JavaScript falsy evaluation — `0` is falsy.

```tsx
// ❌ CURRENT — 0 is falsy, always shows "—"
{stats.avgScore ? stats.avgScore.toFixed(1) : '—'}

// ✅ FIX
{stats.avgScore != null && stats.totalAttempts > 0
  ? stats.avgScore.toFixed(1)
  : '—'}
```

---

### #3 — Division by Zero in `useStats` — `NaN`/`Infinity` Corrupts Persisted Stats

| Field | Value |
|-------|-------|
| **Location** | `useStats.ts` lines 178–179, 250 |
| **Severity** | 🔴 Critical |

**Steps to Reproduce**
1. Call `recordSession()` when `problemsSolved === 0` or `attempted === 0`.
2. The `avgScore` calculation divides by the count without a zero guard.

**Expected:** Safe fallback to `0` or prior value.  
**Actual:** Produces `NaN` or `Infinity`, which gets serialised into localStorage and corrupts all derived statistics.

**Root Cause:**

```ts
// ❌ CURRENT (lines 178–179)
updated.avgScore =
  (updated.avgScore * updated.problemsSolved + params.score!) / (updated.problemsSolved + 1);
// If params.score is undefined → NaN

// ❌ CURRENT (line 250)
const newAvg = (ps.avgScore * ps.attempted + score) / newAttempted;
// newAttempted can theoretically be 0

// ✅ FIX — guard all divisions
const newAttempted = (ps.attempted ?? 0) + 1;
const newAvg = newAttempted > 0
  ? ((ps.avgScore ?? 0) * (ps.attempted ?? 0) + score) / newAttempted
  : 0;
updated.avgScore = Number.isFinite(newAvg) ? Math.round(newAvg * 10) / 10 : 0;
```

---

### #4 — No Error Boundary — Any Render Error Crashes the Entire App

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` root — no `ErrorBoundary` anywhere in the codebase |
| **Severity** | 🔴 Critical |

**Steps to Reproduce**
1. Trigger any unhandled render-time exception (null dereference, malformed API response, etc.).
2. The entire app unmounts with a blank screen and no recovery path.

**Expected:** Fallback UI; unaffected panels remain usable.  
**Actual:** Total app crash.

**Root Cause:** Zero `ErrorBoundary` components found.

```tsx
// ✅ FIX — create src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="error-fallback" role="alert">
          <h2>Something went wrong.</h2>
          <p>{this.state.error.message}</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ WRAP in App.tsx
<ErrorBoundary fallback={<ChatErrorFallback />}>
  <ChatPanel {...chatProps} />
</ErrorBoundary>
<ErrorBoundary fallback={<EditorErrorFallback />}>
  <EditorPanel {...editorProps} />
</ErrorBoundary>
```

---

### #5 — `ReadableStream` Reader Never Released on Abort/Error (Memory Leak)

| Field | Value |
|-------|-------|
| **Location** | `api.ts` — `streamChat()` function |
| **Severity** | 🔴 Critical |

**Steps to Reproduce**
1. Start a streaming response.
2. Abort it via the stop button or via timeout.
3. The `ReadableStreamDefaultReader` lock is never released → subsequent reads fail, memory leaks.

**Expected:** `reader.releaseLock()` called in every exit path.  
**Actual:** No `releaseLock()` anywhere in the function.

**Root Cause:**

```ts
// ❌ CURRENT
const reader = response.body!.getReader();
// ... loop reading ...
// No reader.releaseLock() on abort or catch path

// ✅ FIX — use try/finally
const reader = response.body!.getReader();
try {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // process chunk...
  }
} catch (e) {
  if ((e as Error).name !== 'AbortError') throw e;
} finally {
  reader.releaseLock();  // ← always release
  clearTimeout(timeout);
}
```

---

## High

---

### #6 — `VoiceButton` Has No SpeechRecognition Cleanup (Event Listener Leak)

| Field | Value |
|-------|-------|
| **Location** | `VoiceButton.tsx` |
| **Severity** | 🟠 High |

**Steps to Reproduce**
1. Click the voice button to start recognition.
2. Unmount the component (switch panel or navigate away).
3. `SpeechRecognition` continues firing events — memory/CPU leak.

**Expected:** `recognition.abort()` and all event handlers cleared on unmount.  
**Actual:** No cleanup code exists at all.

```ts
// ✅ FIX — add useEffect cleanup
useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = handleResult;
  recognition.onerror = handleError;

  recognitionRef.current = recognition;

  return () => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  };
}, []);
```

Also add `NotAllowedError` / `NotFoundError` handling in `onerror`.

---

### #7 — Massive 18-Dep `useEffect` Fires on Every Keystroke

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` line 414 |
| **Severity** | 🟠 High |

**Steps to Reproduce**
1. Type any character in the editor or notes field.
2. The autosave `useEffect` re-runs with 18 dependencies, calling `saveSession` on every keystroke.

**Expected:** Debounced save — fires at most once per second of inactivity.  
**Actual:** Effect runs on every state change including `timerSeconds` (every 1 second tick).

**Root Cause:** `[isStreaming, mode, currentProblem, editorTab, hintsUsed, timerSeconds, timerRunning, editorCode, testCode, notes, commitmentGate, hints, interviewStage, interviewCategory, sdTopicId, sdState, messages, saveSession]`

```ts
// ✅ FIX — split into two effects + debounce content saves
const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

// Effect 1: debounced content autosave
useEffect(() => {
  clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    saveSession({ editorCode, testCode, notes, messages });
  }, 1000);
  return () => clearTimeout(saveTimeoutRef.current);
}, [editorCode, testCode, notes, messages]); // content only

// Effect 2: immediate state transitions
useEffect(() => {
  saveSession({ mode, interviewStage, currentProblem });
}, [mode, interviewStage, currentProblem]);
```

---

### #8 — Duplicate `sendMessage` Logic in `useChat`

| Field | Value |
|-------|-------|
| **Location** | `useChat.ts` lines 41–134 and 140–218 |
| **Severity** | 🟠 High |

**Steps to Reproduce**
1. Read `useChat.ts` — two nearly identical `sendMessage` implementations exist back-to-back.

**Expected:** Single, unified `sendMessage` function.  
**Actual:** ~75 lines of duplicated streaming logic with slightly diverging error handling — any bug fix must be applied twice.

**Root Cause:** Incomplete refactor left the original implementation in place alongside the new one.

```ts
// ✅ FIX — extract shared logic into private helper
async function _doSend(
  payload: ChatPayload,
  abortController: AbortController,
  opts: SendOptions
): Promise<void> {
  // shared streaming logic here
}

// Single exported sendMessage
const sendMessage = useCallback(async (content: string) => {
  if (isStreaming) return;
  await _doSend({ content, context }, abortRef.current!, { ... });
}, [isStreaming, getContext, ...]);

// Delete the duplicate implementation entirely
```

---

### #9 — `localStorage` Writes Without `try/catch` — Quota Errors Kill Sessions

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` lines 210, 246; `useStats.ts` |
| **Severity** | 🟠 High |

**Steps to Reproduce**
1. Fill localStorage to capacity (common on iOS Safari private mode — 5 MB limit).
2. Any `localStorage.setItem()` call throws `QuotaExceededError`.
3. Uncaught exception propagates and crashes the component.

**Expected:** Graceful degradation with user notification; session not lost.  
**Actual:** Unhandled exception, potential data loss.

```ts
// ✅ FIX — create a safe wrapper (src/utils/storage.ts)
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[storage] Quota exceeded — consider pruning old sessions.');
      // TODO: emit a user-visible toast notification
    }
    return false;
  }
}

// Replace every bare localStorage.setItem() call with safeSetItem()
```

---

### #10 — Debug Code (`oo_oo` Markers) Left in Production Bundles

| Field | Value |
|-------|-------|
| **Location** | `useChat.ts` lines 145, 147, 223; `api.ts` lines 28, 144; `useSubscription.ts` line 99 |
| **Severity** | 🟠 High |

**Steps to Reproduce:** View the compiled bundle — debug instrumentation from console-ninja / a profiling tool is present.

**Expected:** Clean production output.  
**Actual:** `/* eslint-disable */console.log(...oo_oo(`...`))` at multiple call sites; also `/* istanbul ignore next *//* c8 ignore start */` markers.

```bash
# ✅ FIX — find and remove all occurrences
grep -rn "oo_oo" src/
grep -rn "c8 ignore" src/
```

Replace ad-hoc `console.log` calls with a dev-only logger:

```ts
// src/utils/logger.ts
const isDev = import.meta.env.DEV;
export const log = isDev ? console.log.bind(console, '[dev]') : () => {};
export const warn = isDev ? console.warn.bind(console, '[dev]') : () => {};
export const error = console.error.bind(console); // always keep real errors
```

---

### #11 — God Component: `App.tsx` Manages Everything (993 lines, 16 useState, 5 useEffect)

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` entire file |
| **Severity** | 🟠 High |

**Root Cause:** App.tsx simultaneously manages auth, session persistence, timer, hints, interview state, code execution, system design, achievements, and stats — 34 state nodes visible in the React fiber tree.

**Fix:** Extract domain-specific hooks to co-locate state with its effects and handlers:

```ts
// src/hooks/useInterviewSession.ts
export function useInterviewSession() {
  const [mode, setMode] = useState<Mode>('MENTOR');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [interviewStage, setInterviewStage] = useState<Stage>('intro');
  const [hints, setHints] = useState<Hint[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  // co-located effects...
  return { mode, currentProblem, interviewStage, hints, hintsUsed, ... };
}

// src/hooks/useTimerState.ts
export function useTimerState(defaultMinutes: number) {
  const [timerSeconds, setTimerSeconds] = useState(defaultMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  useEffect(() => { /* setInterval logic */ }, [timerRunning]);
  return { timerSeconds, timerRunning, startTimer, stopTimer, resetTimer };
}

// src/hooks/useEditorState.ts
export function useEditorState(problemId: string) {
  const [editorCode, setEditorCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [notes, setNotes] = useState('');
  return { editorCode, testCode, notes, ... };
}
```

---

## Medium

---

### #12 — All 26 Buttons Missing `type="button"` — Implicit Form Submit Risk

| Field | Value |
|-------|-------|
| **Location** | Every `<button>` element across the entire app |
| **Severity** | 🟡 Medium |

**Root Cause:** HTML spec: a `<button>` without `type` defaults to `type="submit"`. If any button is ever inside a `<form>`, clicking it will submit the form.

```tsx
// ❌ CURRENT (every button in the codebase)
<button onClick={handler}>Click me</button>

// ✅ FIX — add type="button" to every non-submit button
<button type="button" onClick={handler}>Click me</button>
```

ESLint rule to enforce this going forward:
```json
// .eslintrc
{ "rules": { "react/button-has-type": "error" } }
```

---

### #13 — Icon-Only Buttons Have No Accessible Name

| Field | Value |
|-------|-------|
| **Location** | Sidebar nav (7 buttons), Send button, Stop button, Voice button = 9 total |
| **Severity** | 🟡 Medium |

**Steps to Reproduce:** Navigate with a screen reader — icon buttons are announced as unlabelled.

**Expected:** Screen reader announces purpose of each button.  
**Actual:** `title` attribute present on sidebar buttons only — `title` is not reliably announced; all other icon buttons have zero accessible name.

```tsx
// ✅ FIX — add aria-label to every icon-only button
<button type="button" aria-label="Problems list" title="problems" onClick={...}>
  <List size={20} aria-hidden="true" />
</button>

<button type="button" aria-label="Send message" onClick={handleSend}>
  <Send size={16} aria-hidden="true" />
</button>

<button type="button" aria-label={isListening ? 'Stop recording' : 'Start voice input'}>
  <Mic size={16} aria-hidden="true" />
</button>

<button type="button" aria-label="Stop AI response">
  <Square size={16} aria-hidden="true" />
</button>
```

---

### #14 — Difficulty Filter Buttons Missing `aria-pressed` (Selected State Invisible to AT)

| Field | Value |
|-------|-------|
| **Location** | Problems panel — All / Easy / Medium / Hard filter buttons |
| **Severity** | 🟡 Medium |

**Root Cause:** Active state is communicated only via CSS class change (`badge-secondary` → `badge-easy`) with no ARIA state attribute.

```tsx
// ✅ FIX
{(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
  <button
    key={d}
    type="button"
    aria-pressed={selectedDifficulty === d.toLowerCase()}
    onClick={() => setSelectedDifficulty(d.toLowerCase())}
    className={`badge ${selectedDifficulty === d.toLowerCase() ? `badge-${d.toLowerCase()}` : 'badge-secondary'}`}
  >
    {d}
  </button>
))}
```

---

### #15 — ON/OFF Toggle Buttons Missing `aria-pressed` / `role="switch"`

| Field | Value |
|-------|-------|
| **Location** | Settings panel — Auto-save, Sound, Notifications, and 2 other toggles |
| **Severity** | 🟡 Medium |

```tsx
// ✅ FIX
<button
  type="button"
  role="switch"
  aria-checked={isEnabled}
  aria-label="Auto-save session"
  onClick={() => setIsEnabled((v) => !v)}
  className={`toggle ${isEnabled ? 'toggle-on' : 'toggle-off'}`}
>
  {isEnabled ? 'ON' : 'OFF'}
</button>
```

---

### #16 — Range Sliders Have No Accessible Labels or ARIA Value Attributes

| Field | Value |
|-------|-------|
| **Location** | Settings panel — Font Size slider (10–24px), Timer slider (15–90 min) |
| **Severity** | 🟡 Medium |

**Steps to Reproduce:** Navigate slider with screen reader — value is not announced, purpose unknown.

```tsx
// ✅ FIX
<label htmlFor="font-size-slider">
  Font Size: <strong>{fontSize}px</strong>
</label>
<input
  id="font-size-slider"
  type="range"
  min={10}
  max={24}
  step={1}
  value={fontSize}
  aria-label="Editor font size"
  aria-valuemin={10}
  aria-valuemax={24}
  aria-valuenow={fontSize}
  aria-valuetext={`${fontSize} pixels`}
  onChange={(e) => setFontSize(Number(e.target.value))}
/>

<label htmlFor="timer-slider">
  Timer Default: <strong>{timerMinutes} min</strong>
</label>
<input
  id="timer-slider"
  type="range"
  min={15}
  max={90}
  step={5}
  value={timerMinutes}
  aria-label="Default timer duration"
  aria-valuetext={`${timerMinutes} minutes`}
  onChange={(e) => setTimerMinutes(Number(e.target.value))}
/>
```

---

### #17 — Language Toggle in Settings Has No Active-State Indication for AT

| Field | Value |
|-------|-------|
| **Location** | Settings panel — TypeScript / JavaScript / Python selector |
| **Severity** | 🟡 Medium |

```tsx
// ✅ FIX — add role="group" and aria-pressed
<div role="group" aria-label="Code language preference">
  {(['TypeScript', 'JavaScript', 'Python'] as const).map((lang) => (
    <button
      key={lang}
      type="button"
      aria-pressed={settings.language === lang.toLowerCase()}
      onClick={() => updateSetting('language', lang.toLowerCase())}
      className={`lang-btn ${settings.language === lang.toLowerCase() ? 'lang-btn--active' : ''}`}
    >
      {lang}
    </button>
  ))}
</div>
```

---

### #18 — Missing `key` Props in `.map()` — React Reconciliation Bugs

| Field | Value |
|-------|-------|
| **Location** | `ChatPanel.tsx` (3 maps), `AchievementsPanel.tsx` (4 maps), `MistakesPanel.tsx` (2 maps), `App.tsx` (multiple) |
| **Severity** | 🟡 Medium |

**Steps to Reproduce:** Add/remove items from any of these lists — wrong items animate, state is applied to incorrect elements.

```tsx
// ❌ CURRENT — no key prop
{messages.map((msg) => <ChatMessageItem message={msg} />)}

// ✅ FIX — always use stable unique IDs, never array index
{messages.map((msg) => (
  <ChatMessageItem key={msg.id} message={msg} isNew={msg.id === latestId} />
))}

{achievements.map((a) => (
  <AchievementCard key={a.id} achievement={a} />
))}

{/* If no id field exists, add one at creation time: */}
const newMessage = { id: crypto.randomUUID(), content, role, timestamp: Date.now() };
```

---

### #19 — No `aria-live` Region for Chat Messages

| Field | Value |
|-------|-------|
| **Location** | `ChatPanel.tsx` — message list container |
| **Severity** | 🟡 Medium |

**Expected:** New AI messages automatically announced by screen readers.  
**Actual:** Chat message list has no `aria-live` attribute — AT users cannot perceive new messages.

```tsx
// ✅ FIX
<div
  ref={messagesEndRef}
  className="messages-list"
  role="log"
  aria-live="polite"
  aria-label="Mentor chat conversation"
  aria-relevant="additions text"
>
  {messages.map((msg) => (
    <ChatMessageItem key={msg.id} message={msg} />
  ))}
</div>
```

---

### #20 — Delete Mistake Has No Undo

| Field | Value |
|-------|-------|
| **Location** | `MistakesPanel.tsx` — trash icon button |
| **Severity** | 🟡 Medium |

**Steps to Reproduce:** Click trash icon on a mistake → immediately and permanently deleted, no recovery.

```ts
// ✅ FIX — soft-delete with timed undo toast
const handleRemoveMistake = (id: string) => {
  const removed = mistakes.find((m) => m.id === id);
  onRemoveMistake(id); // optimistic removal
  showToast({
    message: `Mistake "${removed?.title}" removed`,
    action: {
      label: 'Undo',
      onClick: () => onAddMistake(removed!),
    },
    duration: 5000,
  });
};
```

---

### #21 — Empty State Missing from Problems Panel When Filters Return Nothing

| Field | Value |
|-------|-------|
| **Location** | `Sidebar.tsx` — Problems list |
| **Severity** | 🟡 Medium |

**Steps to Reproduce:** Select "Hard" + a niche pattern → list renders empty with no feedback.

```tsx
// ✅ FIX
{filteredProblems.length === 0 ? (
  <div className="empty-state" role="status">
    <p>No problems match your filters.</p>
    <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
      Clear filters
    </button>
  </div>
) : (
  filteredProblems.map((p) => <ProblemRow key={p.id} problem={p} />)
)}
```

---

### #22 — Search Input in Problems Panel Has No `<label>` or `aria-label`

| Field | Value |
|-------|-------|
| **Location** | `Sidebar.tsx` — "Search problems..." input |
| **Severity** | 🟡 Medium |

```tsx
// ✅ FIX
<label htmlFor="problem-search" className="sr-only">Search problems</label>
<input
  id="problem-search"
  type="search"
  aria-label="Search problems"
  placeholder="Search problems..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

---

## Low

---

### #23 — `console.log` / `console.error` Left in Production Code

| Field | Value |
|-------|-------|
| **Location** | `useChat.ts` (3), `api.ts` (4), `useSubscription.ts` (2) |
| **Severity** | 🟢 Low |

```ts
// ✅ FIX — use a dev-only logger (see Issue #10 fix above)
import { log, error } from '../utils/logger';
```

---

### #24 — No `useMemo` Anywhere — Expensive Computations Re-run on Every Render

| Field | Value |
|-------|-------|
| **Location** | `StatsPanel.tsx`, `AchievementsPanel.tsx`, `useAdaptiveRecommendation.ts` |
| **Severity** | 🟢 Low |

```ts
// ✅ FIX — memoize derived data
// StatsPanel.tsx
const sortedPatterns = useMemo(
  () => [...practiedPatterns].sort((a, b) => b.avgScore - a.avgScore),
  [practiedPatterns]
);

// AchievementsPanel.tsx
const [unlockedAchievements, lockedAchievements] = useMemo(
  () => [achievements.filter((a) => a.unlocked), achievements.filter((a) => !a.unlocked)],
  [achievements]
);

// useAdaptiveRecommendation.ts
const recommendations = useMemo(
  () => computeRecommendations(stats, mistakes, problemHistory),
  [stats, mistakes, problemHistory]
);
```

---

### #25 — No Request Timeout on `fetch` Calls in `useSubscription`

| Field | Value |
|-------|-------|
| **Location** | `useSubscription.ts` — 3 fetch calls |
| **Severity** | 🟢 Low |

```ts
// ✅ FIX — add AbortSignal.timeout() (modern) or manual controller
const res = await fetch('/api/subscription', {
  signal: AbortSignal.timeout(10_000), // 10 s
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

---

### #26 — `VoiceButton` Does Not Check Browser Support Before Instantiating `SpeechRecognition`

| Field | Value |
|-------|-------|
| **Location** | `VoiceButton.tsx` |
| **Severity** | 🟢 Low |

```tsx
// ✅ FIX
const SpeechRecognitionAPI =
  window.SpeechRecognition || (window as any).webkitSpeechRecognition;

if (!SpeechRecognitionAPI) {
  return (
    <button
      type="button"
      disabled
      aria-label="Voice input (not supported in this browser)"
      title="Voice input requires Chrome or Edge"
      className="voice-btn voice-btn--unsupported"
    >
      <MicOff size={16} aria-hidden="true" />
    </button>
  );
}
```

---

### #27 — No React Router — Deep Linking and Browser Navigation Impossible

| Field | Value |
|-------|-------|
| **Location** | `App.tsx` — no routing library detected |
| **Severity** | 🟢 Low |

**Impact:** Users cannot share a URL to a specific problem, browser back/forward buttons don't work for panel switches.

```bash
npm install react-router-dom
```

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppShell />} />
    <Route path="/problems/:problemId" element={<AppShell />} />
    <Route path="/behavioral" element={<AppShell mode="behavioral" />} />
    <Route path="/system-design" element={<AppShell mode="system-design" />} />
  </Routes>
</BrowserRouter>
```

---

### #28 — `TopNav` Has No Responsive Adaptation for Small Screens

| Field | Value |
|-------|-------|
| **Location** | `TopNav.tsx` |
| **Severity** | 🟢 Low |

**Steps to Reproduce:** Resize window to ≤ 400px — timer, problem title, and hint counter all overflow or collide.

```tsx
// ✅ FIX — abbreviate content on small viewports
<span className="timer-display hidden sm:inline">{formatTime(timerSeconds)}</span>
<span className="timer-display sm:hidden">{Math.ceil(timerSeconds / 60)}m</span>

<span className="problem-title hidden md:inline">{problem?.title}</span>

// Or add CSS:
@media (max-width: 480px) {
  .topnav-problem-title { display: none; }
  .topnav-hints-label { display: none; }
}
```

---

## Prioritized Implementation Order

| # | Issue | File | Effort | Impact |
|---|-------|------|--------|--------|
| 1 | Add `ErrorBoundary` | New file + App.tsx | 1 h | Prevents total crash |
| 2 | Fix `avgScore` falsy zero | StatsPanel.tsx:236 | 15 min | Data accuracy |
| 3 | Fix division by zero | useStats.ts:178, 250 | 30 min | Data integrity |
| 4 | Release `ReadableStream` lock | api.ts | 30 min | Memory leak |
| 5 | Fix stale `useCallback` closures | App.tsx:203, 450 | 1 h | Correctness |
| 6 | Wrap `localStorage` in `try/catch` | App.tsx, useStats.ts | 1 h | Reliability |
| 7 | Remove `oo_oo` debug code | useChat, api, useSub | 30 min | Code quality |
| 8 | Deduplicate `sendMessage` | useChat.ts | 2 h | Maintainability |
| 9 | Add `type="button"` to all buttons | All components | 30 min | Correctness |
| 10 | Add `aria-label` to icon buttons | All components | 1 h | Accessibility |
| 11 | Add `aria-pressed` to filter/toggle buttons | Sidebar, Settings | 1 h | Accessibility |
| 12 | Fix `aria-live` on chat | ChatPanel.tsx | 30 min | Accessibility |
| 13 | Fix range slider labels | Settings panel | 1 h | Accessibility |
| 14 | Add `key` props to all maps | All panels | 1 h | React correctness |
| 15 | Add VoiceButton cleanup | VoiceButton.tsx | 1 h | Memory leak |
| 16 | Debounce the mega-useEffect | App.tsx:414 | 2 h | Performance |
| 17 | Add `useMemo` for derived data | Stats, Achievements | 2 h | Performance |
| 18 | Add empty state to Problems panel | Sidebar.tsx | 30 min | UX |
| 19 | Add Undo to mistake deletion | MistakesPanel.tsx | 1 h | UX |
| 20 | Add request timeouts to useSubscription | useSubscription.ts | 30 min | Reliability |
| 21 | Add browser support check to VoiceButton | VoiceButton.tsx | 15 min | Robustness |
| 22 | Extract God Component (App.tsx) | App.tsx + new hooks | 1 week | Architecture |
| 23 | Add React Router | App.tsx | 1 day | UX / shareability |

---

*Generated by automated static analysis + live DOM runtime audit on 2026-02-17.*

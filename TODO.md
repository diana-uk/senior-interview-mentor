# Senior Interview Mentor — TODO

---

## Audit Report Fixes (2026-02-17)

> Source: `.claude/docs/AUDIT_REPORT.md` — 28 issues found via automated static + runtime analysis.
> Grouped into 19 actionable work items below. Each links to a Jira story.

### Critical

- [ ] **[SIM-56](https://diana-dev.atlassian.net/browse/SIM-56)** — Fix stale `useCallback` closures in App.tsx *(Audit #1)*
  - `App.tsx` lines 203, 450: `useCallback` with no dependency array causes stale state reads
  - Add proper dependency arrays to `handleSync` and message-dispatch callbacks
  - Files: `App.tsx`

- [x] **[SIM-57](https://diana-dev.atlassian.net/browse/SIM-57)** — Fix falsy zero bug and division-by-zero in stats *(Audit #2, #3)* ✅
  - `StatsPanel.tsx:236`: `avgScore === 0` renders as "—" due to falsy evaluation
  - `useStats.ts:178-179, 250`: division by zero produces `NaN`/`Infinity`, corrupts localStorage
  - Guard all divisions, use `!= null` checks instead of truthiness
  - Files: `StatsPanel.tsx`, `useStats.ts`

- [x] **[SIM-58](https://diana-dev.atlassian.net/browse/SIM-58)** — Add ErrorBoundary components *(Audit #4)* ✅
  - Zero `ErrorBoundary` components in the app — any render error crashes everything
  - Create `ErrorBoundary.tsx`, wrap ChatPanel, EditorPanel, and other major sections
  - Files: new `ErrorBoundary.tsx`, `App.tsx`

- [x] **[SIM-59](https://diana-dev.atlassian.net/browse/SIM-59)** — ~~Fix ReadableStream reader memory leak in api.ts~~ *(Audit #5)* ✅ Already fixed in current code

### High

- [ ] **[SIM-60](https://diana-dev.atlassian.net/browse/SIM-60)** — Fix VoiceButton cleanup and browser support *(Audit #6, #26)*
  - No `SpeechRecognition` cleanup on unmount — event listener leak
  - No browser support check before instantiation
  - Add `useEffect` cleanup with `recognition.abort()`, add graceful fallback UI
  - Files: `VoiceButton.tsx`

- [ ] **[SIM-61](https://diana-dev.atlassian.net/browse/SIM-61)** — Debounce 18-dep autosave useEffect *(Audit #7)*
  - `App.tsx:414`: useEffect with 18 deps fires on every keystroke and timer tick
  - Split into debounced content save (1s) + immediate state transition effect
  - Files: `App.tsx`

- [ ] **[SIM-62](https://diana-dev.atlassian.net/browse/SIM-62)** — Deduplicate sendMessage in useChat *(Audit #8)*
  - Two nearly identical `sendMessage` implementations (lines 41–134 and 140–218)
  - Extract shared streaming logic into private helper, delete duplicate
  - Files: `useChat.ts`

- [ ] **[SIM-63](https://diana-dev.atlassian.net/browse/SIM-63)** — Safe localStorage wrapper with try/catch *(Audit #9)*
  - Bare `localStorage.setItem()` calls crash on `QuotaExceededError` (iOS Safari private mode)
  - Create `safeSetItem()` utility, replace all bare calls
  - Files: new `utils/storage.ts`, `App.tsx`, `useStats.ts`, all hooks using localStorage

- [ ] **[SIM-64](https://diana-dev.atlassian.net/browse/SIM-64)** — Remove debug code and add dev-only logger *(Audit #10, #23)*
  - `oo_oo` console-ninja markers in `useChat.ts`, `api.ts`, `useSubscription.ts`
  - 9+ bare `console.log`/`console.error` calls in production code
  - Create `utils/logger.ts` with dev-only logging, strip all debug instrumentation
  - Files: `useChat.ts`, `api.ts`, `useSubscription.ts`, new `utils/logger.ts`

- [ ] **[SIM-65](https://diana-dev.atlassian.net/browse/SIM-65)** — Extract God Component App.tsx into domain hooks *(Audit #11)*
  - 993 lines, 16 useState, 5 useEffect — manages everything
  - Extract `useInterviewSession`, `useTimerState`, `useEditorState` hooks
  - Files: `App.tsx`, new hooks in `hooks/`

### Medium — Accessibility

- [ ] **[SIM-66](https://diana-dev.atlassian.net/browse/SIM-66)** — Accessibility: button types, labels, ARIA states *(Audit #12–17, #22)*
  - 26 buttons missing `type="button"` — implicit form submit risk
  - 9 icon-only buttons with no accessible name
  - Filter buttons missing `aria-pressed`
  - Toggle buttons missing `role="switch"` / `aria-checked`
  - Range sliders missing labels and ARIA value attributes
  - Language toggle missing active-state indication for AT
  - Search input missing `<label>` / `aria-label`
  - Add ESLint rule `react/button-has-type`
  - Files: all component files with buttons, `Sidebar.tsx`, `SettingsPanel.tsx`

- [ ] **[SIM-67](https://diana-dev.atlassian.net/browse/SIM-67)** — Fix missing `key` props in .map() calls *(Audit #18)*
  - `ChatPanel.tsx` (3 maps), `AchievementsPanel.tsx` (4 maps), `MistakesPanel.tsx` (2 maps)
  - Use stable unique IDs (not array index); add `crypto.randomUUID()` at creation time
  - Files: `ChatPanel.tsx`, `AchievementsPanel.tsx`, `MistakesPanel.tsx`, `App.tsx`

- [ ] **[SIM-68](https://diana-dev.atlassian.net/browse/SIM-68)** — Add aria-live region for chat messages *(Audit #19)*
  - Chat message list has no `aria-live` — AT users cannot perceive new messages
  - Add `role="log"`, `aria-live="polite"`, `aria-relevant="additions text"`
  - Files: `ChatPanel.tsx`

### Medium — UX

- [ ] **[SIM-69](https://diana-dev.atlassian.net/browse/SIM-69)** — Add undo for mistake deletion *(Audit #20)*
  - Trash icon permanently deletes with no recovery path
  - Implement soft-delete with timed undo toast (5s)
  - Files: `MistakesPanel.tsx`

- [ ] **[SIM-70](https://diana-dev.atlassian.net/browse/SIM-70)** — Add empty state for filtered problems list *(Audit #21)*
  - Selecting restrictive filters shows blank list with no feedback
  - Add "No problems match" message with clear-filters button
  - Files: `Sidebar.tsx`

### Low

- [ ] **[SIM-71](https://diana-dev.atlassian.net/browse/SIM-71)** — Add useMemo for expensive computations *(Audit #24)*
  - `StatsPanel.tsx`: sorted patterns recomputed every render
  - `AchievementsPanel.tsx`: achievement filtering recomputed every render
  - `useAdaptiveRecommendation.ts`: recommendations recomputed every render
  - Files: `StatsPanel.tsx`, `AchievementsPanel.tsx`, `useAdaptiveRecommendation.ts`

- [ ] **[SIM-72](https://diana-dev.atlassian.net/browse/SIM-72)** — Add request timeouts to useSubscription *(Audit #25)*
  - 3 fetch calls with no timeout — can hang indefinitely
  - Add `AbortSignal.timeout(10_000)` to all fetch calls
  - Files: `useSubscription.ts`

- [ ] **[SIM-73](https://diana-dev.atlassian.net/browse/SIM-73)** — Add React Router for deep linking *(Audit #27)*
  - No routing — browser back/forward broken, URLs not shareable
  - Install `react-router-dom`, add routes for problems, behavioral, system-design
  - Files: `App.tsx`, `package.json`

- [ ] **[SIM-74](https://diana-dev.atlassian.net/browse/SIM-74)** — TopNav responsive adaptation for small screens *(Audit #28)*
  - Timer, problem title, hint counter overflow at <= 400px
  - Add media query breakpoints to abbreviate/hide elements
  - Files: `TopNav.tsx`, CSS

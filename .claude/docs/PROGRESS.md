# Senior Interview Mentor — Progress Log

> Tracks what was done, when, and the current project state.

---

## Current State (2026-02-15)

**Build:** Passing (TypeScript clean, 0 lint errors, 115 tests green, Vite build ~1,266 KB main + lazy chunks)
**Branch:** `main`
**Node:** v20.10.0

### Quick Stats
| Metric | Value |
|--------|-------|
| Problems | 150 across 20 patterns |
| System Design Topics | 20 + custom |
| Behavioral Questions | 102 across 8 categories |
| Achievements | 17 across 5 categories |
| Test Count | 115 (8 test files) |
| Bundle Size (main) | ~1,266 KB |
| Lazy Chunks | 9 (EditorPanel, SystemDesignRouter, InterviewLauncher, ReviewRubric, Landing, vendor-react, vendor-monaco, vendor-icons, vendor-katex) |
| Multi-lang Problems | 150 (all have TypeScript + Python starters) |
| Auth | Supabase (email/password + Google/GitHub OAuth) |
| Payments | Stripe (checkout, webhooks, portal, subscription management) |
| Monitoring | Sentry (frontend + backend) + PostHog analytics |

---

## Session Log

### 2026-02-15 — Session 13

**Focus:** Lint cleanup + Achievement tests

| Task | What was done |
|------|---------------|
| Lint Cleanup | Fixed all 24 ESLint errors + 1 warning across 15 files. Key fixes: React Compiler compliance (useState over useRef in render, useMemo for derived values, queueMicrotask/setTimeout for effect setState), extracted `getSettings` to `utils/settings.ts` for fast refresh, replaced direct prop mutations with `useReactFlow().setNodes()`. |
| Achievement Tests | Created `useAchievements.test.ts` with 21 tests covering all 17 achievement conditions, localStorage persistence, reset, and newly-unlocked filtering. Test count: 94 → 115. |

**Files created (2):**
- `web/src/utils/settings.ts` — Extracted settings types/functions from SettingsPanel
- `web/src/hooks/__tests__/useAchievements.test.ts` — 21 tests

**Files modified (18):**
- `web/src/App.tsx` — Updated `getSettings` import path
- `web/src/components/billing/PricingPage.tsx` — Removed unused `isAuthenticated`
- `web/src/components/billing/SubscriptionBanner.tsx` — `useMemo` + `useState(Date.now)` for purity
- `web/src/components/chat/VoiceButton.tsx` — `useMemo`-derived filler count (no setState in effect)
- `web/src/components/editor/SystemDesignEditor.tsx` — `useState` replaces `useRef` for render-accessed value
- `web/src/components/panels/BehavioralPanel.tsx` — Removed unused interface
- `web/src/components/panels/SettingsPanel.tsx` — Imports from `utils/settings`
- `web/src/components/systemdesign/ArchitectureWorkspace.tsx` — `useMemo` node sync
- `web/src/components/systemdesign/MentorPanel.tsx` — eslint-disable for callback param
- `web/src/components/systemdesign/architecture/SystemNode.tsx` — `useReactFlow` for label commit
- `web/src/data/problems/index.ts` — `void group` pattern for unused destructure
- `web/src/hooks/useAdaptiveRecommendation.ts` — Removed unused import
- `web/src/hooks/useCodeAnalysis.ts` — `queueMicrotask` for effect setState
- `web/src/hooks/useSessionPersistence.ts` — `useState` lazy init replaces `useRef`
- `web/src/hooks/useSubscription.ts` — `setTimeout` wrapper for effect fetch
- `web/src/utils/executor.worker.ts` — Removed unused eslint-disable
- `web/src/utils/memoryBuilder.ts` — Updated settings import path
- `web/src/utils/problemLanguage.ts` — Removed unused import
- `web/src/utils/stripTypes.ts` — Fixed useless regex escapes

---

### 2026-02-14 — Session 12

**Focus:** Achievements system, activity heatmap, shareable profile card (Jira SIM-37)

| Task | What was done |
|------|---------------|
| Achievement System | Created `useAchievements.ts` hook with 17 achievements across 5 categories (milestones, streaks, patterns, performance, quality). SM-2-style unlock tracking with localStorage persistence. |
| Achievements Panel | Built `AchievementsPanel.tsx` with badge grid, 365-day activity heatmap (GitHub-style), personal records (fastest solve, highest streak, etc.), and trophy sidebar integration. |
| Shareable Profile Card | Created `profileCard.ts` with Canvas-rendered PNG export. Shows avatar, username, stats, achievement count. Download or share via Web Share API. |

**Files created (3):**
- `web/src/hooks/useAchievements.ts`
- `web/src/components/panels/AchievementsPanel.tsx`
- `web/src/utils/profileCard.ts`

**Jira:** SIM-37 → **Done**

---

### 2026-02-14 — Session 11

**Focus:** SEO meta tags + Stripe payment integration (Jira SIM-45, SIM-35)

| Task | What was done |
|------|---------------|
| SEO (SIM-45) | Added meta tags, Open Graph, Twitter Cards, JSON-LD structured data to `index.html`. Semantic HTML landmarks. |
| Stripe (SIM-35) | Full payment integration: Stripe Checkout sessions, webhook handler (invoice.paid, subscription events), customer portal, `useSubscription` hook, `PricingPage` with monthly/yearly toggle, `SubscriptionBanner` for upgrade prompts. Tier config in `config/tiers.ts`. |

**Files created (7):**
- `web/server/services/stripe.ts`
- `web/server/routes/billing.ts`
- `web/src/hooks/useSubscription.ts`
- `web/src/components/billing/PricingPage.tsx`
- `web/src/components/billing/SubscriptionBanner.tsx`
- `web/src/config/tiers.ts`

**Jira:** SIM-45, SIM-35 → **Done**

---

### 2026-02-14 — Session 10

**Focus:** Monitoring and observability (Jira SIM-43)

| Task | What was done |
|------|---------------|
| Sentry | Frontend + backend error tracking with Sentry. Browser SDK with React error boundary integration. Server SDK with Express request handler. |
| PostHog | Product analytics with event tracking. Analytics facade for consistent event naming. |
| Request Logger | Structured JSON request logging middleware with response time tracking. |
| Health Endpoint | Enhanced `/health` with uptime, memory usage, version info. |

**Files created (5):**
- `web/src/lib/sentry.ts`
- `web/src/lib/posthog.ts`
- `web/src/lib/analytics.ts`
- `web/server/lib/sentry.ts`
- `web/server/middleware/requestLogger.ts`

**Jira:** SIM-43 → **Done**

---

### 2026-02-14 — Session 9

**Focus:** Deployment configs (Jira SIM-40)

| Task | What was done |
|------|---------------|
| Docker | Dockerfile + docker-compose.yml for containerized deployment. |
| Vercel | `vercel.json` config for frontend SPA deployment. |
| Railway | `railway.json` config for backend deployment. |
| SDK Fallback | Created `claudeSdk.ts` (Anthropic SDK backend) + `ai.ts` facade that auto-selects CLI vs SDK based on `ANTHROPIC_API_KEY` env var. |

**Jira:** SIM-40 → **Done**

---

### 2026-02-13 — Session 8

**Focus:** Supabase Auth + Voice/Audio + Multi-lang + Architecture diagrams (Jira SIM-19, SIM-26, SIM-27, SIM-28, SIM-25)

| Task | What was done |
|------|---------------|
| Auth (SIM-19) | Supabase Auth with email/password + Google/GitHub OAuth. JWT verification middleware (requireAuth + optionalAuth). Auto-sync localStorage→DB on first login. Profile dropdown. "Skip" option for anonymous use. |
| Voice (SIM-26) | Web Speech API speech-to-text via `useSpeechRecognition` hook. Filler word detection (15 patterns). VoiceButton with recording pulse and filler badge. AI communication evaluation. |
| Multi-lang (SIM-27) | Python via Pyodide CDN (~10MB WASM, lazy). All 150 problems with Python starters. `pyodideExecutor.ts` + `pythonTestAdapter.ts`. Language-aware AI responses. |
| Architecture (SIM-28) | React Flow drag-and-drop canvas. Component palette (12 system components). AI validation. PNG export via `diagramSerializer.ts`. |
| Memory (SIM-25) | `memoryBuilder.ts` compiles stats/mistakes/settings into prompt context. Configurable hint style and detail level. |

**Jira:** SIM-19, SIM-26, SIM-27, SIM-28, SIM-25 → **Done**

---

### 2026-02-13 — Session 7

**Focus:** Slash command wiring + STAR story bank (Jira SIM-15, SIM-31)

| Task | What was done |
|------|---------------|
| Wire Slash Commands (SIM-15) | Wired `/check`, `/continue`, `/recap` commands in `handleSendMessage`. `/check` auto-includes editor code context for approach validation. `/continue` enriches message with session state (problem, mode, hints, gate, timer). `/recap` sends detailed session state with commitment gate checklist. `/pattern` works via existing passthrough to Claude skill file. |
| STAR Story Bank (SIM-31) | Added localStorage-backed story bank to BehavioralPanel. `StoryEntry` type with full STAR fields + timestamps. Save/Update button in practice view. Auto-loads saved story when revisiting a question. "My Stories" view with category grouping, edit, and delete. BookOpen icon on browse questions that have saved stories. |

**Jira:** SIM-15, SIM-31 → **Done**

---

### 2026-02-13 — Session 6

**Focus:** Claude CLI restoration + Visualizations (Jira SIM-12, SIM-13)

| Task | What was done |
|------|---------------|
| Claude CLI Restore | Reverted from `@anthropic-ai/sdk` to Claude CLI subprocess (`claude -p --output-format stream-json`). CLI authenticates via `claude login` (no API key needed). Restored `simulateStream()` for word-by-word typing effect. Kept `extractEditorBlocks()` for `/solve` code extraction. |
| Client Timeout | Added 90s client-side timeout via `AbortSignal.any()` in `api.ts` so UI never hangs forever. |
| Weakness Heat Map (SIM-12) | Added grid visualization to MistakesPanel showing all 14 patterns. Color-coded cells (red=many mistakes, amber=moderate, lime=few, neutral=none). Shows per-pattern mistake count + overdue review count. Clickable cells expand pattern group. |
| Activity Chart (SIM-13) | Added SVG bar chart to StatsPanel showing problems solved per day for last 30 days. Neon cyan bars with opacity proportional to activity. |
| Radar Chart (SIM-13) | Added SVG spider/radar chart showing pattern strengths. Neon cyan polygon with data points. Color-coded labels by score. Requires 3+ patterns to render. |

**Jira:** SIM-12, SIM-13 → **Done**

---

### 2026-02-13 — Session 5

**Focus:** Database Layer via Supabase — PostgreSQL schema, query layer, REST API (Jira SIM-20)

| Task | What was done |
|------|---------------|
| PostgreSQL Schema | Created `server/db/schema.sql` with 7 tables. RLS policies. Auto-create profile trigger. Indexes. `updated_at` triggers. |
| Supabase Client | Singleton admin client with graceful fallback. |
| TypeScript Types | Full `Database` interface with Row/Insert/Update variants. |
| Query Layer | 18 query functions covering all CRUD + bulk sync. |
| REST API | 10 endpoints for progress, sessions, mistakes, reviews, streak, sync. |

**Jira:** SIM-20 → **Done**

---

### 2026-02-13 — Session 4

**Focus:** Problem Data Architecture — Markdown/LaTeX + Multi-language starter code (Jira SIM-18)

| Task | What was done |
|------|---------------|
| LaTeX in Chat | `remark-math` + `rehype-katex` for inline/block math. |
| Multi-Language Types | `SupportedLanguage`, `MultiLangCode` types. `problemLanguage.ts` utility. |
| Tests | `problemLanguage.test.ts` with 16 tests. Total: 67 tests across 5 files. |
| Jira Board | Populated full board (SIM-1 through SIM-49): 11 Epics, 38 Stories. |

**Jira:** SIM-18 → **Done**

---

### 2026-02-13 — Session 3

**Focus:** System design expansion, testing, settings, landing page

| Task | What was done |
|------|---------------|
| System Design Library | Expanded from 6 to 20 problems. |
| Testing Infrastructure | Vitest v4 + jsdom v25. 51 tests across 4 files. |
| Settings Panel | Language, font size, timer, auto-save, export, reset. |
| Landing Page | Hero, features, comparison table, pricing tiers. Lazy-loaded. |

---

### 2026-02-13 — Session 2

**Focus:** Web Worker execution, recommendations, code splitting, behavioral module, CI/CD

| Task | What was done |
|------|---------------|
| Web Worker Execution | Sandboxed executor with 10s timeout. |
| Adaptive Recommendations | Pattern urgency scoring, readiness score. |
| Code Splitting | React.lazy + Vite manualChunks. |
| Behavioral Module | 102 questions, 8 categories, STAR form. |
| CI/CD | GitHub Actions pipeline. |

---

### 2026-02-13 — Session 1

**Focus:** Complete Phase 1 MVP and Phase 2 problem expansion

| Task | What was done |
|------|---------------|
| Mistake Tracker | SM-2 spaced repetition, localStorage persistence. |
| Statistics | Pattern strength tracking, session history. |
| Review Rubric | 6-dimension scoring (0-4 scale). |
| Session Persistence | Auto-save to localStorage (debounced). |
| Problem Library | Expanded to 77 problems across 16 patterns. |
| Anthropic SDK | Replaced CLI with SDK (later reverted in Session 6). |

---

## Architecture Overview

```
web/
├── src/
│   ├── components/
│   │   ├── auth/           # AuthPage, ProfileDropdown
│   │   ├── billing/        # PricingPage, SubscriptionBanner
│   │   ├── chat/           # ChatPanel, ChatMessage, VoiceButton
│   │   ├── editor/         # EditorPanel (Monaco), SystemDesignEditor
│   │   ├── layout/         # TopNav, Sidebar
│   │   ├── modals/         # InterviewLauncher
│   │   ├── panels/         # ProblemList, MistakesPanel, StatsPanel, BehavioralPanel, SettingsPanel, AchievementsPanel, CommitmentGate, HintLadder
│   │   ├── systemdesign/   # SystemDesignRouter, PhaseNav, ArchitectureWorkspace, architecture/
│   │   ├── Landing.tsx     # Marketing landing page
│   │   └── ReviewRubric.tsx
│   ├── config/             # tiers.ts (pricing tiers)
│   ├── data/
│   │   ├── problems/       # 20 pattern files + helpers.ts + index.ts (150 problems)
│   │   └── behavioral.ts   # 102 behavioral questions
│   ├── hooks/
│   │   ├── useAchievements.ts
│   │   ├── useAdaptiveRecommendation.ts
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useCodeAnalysis.ts
│   │   ├── useMistakeTracker.ts
│   │   ├── useSessionPersistence.ts
│   │   ├── useSessionStorage.ts
│   │   ├── useSpeechRecognition.ts
│   │   ├── useStats.ts
│   │   ├── useSubscription.ts
│   │   └── useSystemDesignState.ts
│   ├── lib/
│   │   ├── analytics.ts    # Event tracking facade
│   │   ├── posthog.ts      # PostHog analytics
│   │   ├── sentry.ts       # Frontend Sentry
│   │   └── supabase.ts     # Browser Supabase client
│   ├── utils/
│   │   ├── codeExecutor.ts + executor.worker.ts
│   │   ├── fillerDetector.ts
│   │   ├── memoryBuilder.ts
│   │   ├── problemLanguage.ts
│   │   ├── profileCard.ts
│   │   ├── pyodideExecutor.ts
│   │   ├── pythonTestAdapter.ts
│   │   ├── settings.ts
│   │   └── stripTypes.ts
│   ├── design-system/      # tokens.css, layout.css, components.css
│   ├── services/           # api.ts
│   ├── types/              # index.ts
│   └── App.tsx
├── server/
│   ├── db/                 # schema.sql, client.ts, types.ts, queries.ts, index.ts
│   ├── lib/                # sentry.ts
│   ├── middleware/          # auth.ts, requestLogger.ts, validate.ts
│   ├── routes/             # chat.ts, auth.ts, billing.ts, progress.ts
│   └── services/           # claude.ts, claudeSdk.ts, ai.ts, stripe.ts
├── vitest.config.ts
└── package.json
```

---

## Remaining Priority Order

1. **Tier enforcement** — Wire Stripe plans to actual usage limits (free: 5/day, premium: unlimited)
2. **Wire frontend to DB** — Switch from localStorage to API when Supabase configured
3. **More tests** — Component tests, API integration tests, E2E tests
4. **Learning paths** — Guided problem sequences (Blind 75 Sprint, Pattern Mastery)
5. **Daily Challenge** — AI-selected problem per day
6. **Communication scoring** — STAR compliance, conciseness, impact metrics
7. **Real-time code analysis** — Debounced editor analysis, anti-pattern detection
8. **Community** — Leaderboards, study groups, solution sharing
9. **B2B** — Team accounts, admin dashboard

# Senior Interview Mentor — Progress Log

> Tracks what was done, when, and the current project state.

---

## Current State (2026-02-13)

**Build:** Passing (TypeScript clean, 67 tests green, Vite build ~1,150 KB main + 9 lazy chunks)
**Branch:** `main`
**Node:** v20.10.0

### Quick Stats
| Metric | Value |
|--------|-------|
| Problems | 77 across 16 patterns |
| System Design Topics | 20 + custom |
| Behavioral Questions | 102 across 8 categories |
| Test Count | 67 (5 test files) |
| Bundle Size (main) | ~1,150 KB |
| Lazy Chunks | 9 (EditorPanel, SystemDesignRouter, InterviewLauncher, ReviewRubric, Landing, vendor-react, vendor-monaco, vendor-icons, vendor-katex) |
| Multi-lang Problems | 3 (Two Sum, Search in Rotated Array, Climbing Stairs) |

---

## Session Log

### 2026-02-13 — Session 7

**Focus:** Slash command wiring + STAR story bank (Jira SIM-15, SIM-31)

| Task | What was done |
|------|---------------|
| Wire Slash Commands (SIM-15) | Wired `/check`, `/continue`, `/recap` commands in `handleSendMessage`. `/check` auto-includes editor code context for approach validation. `/continue` enriches message with session state (problem, mode, hints, gate, timer). `/recap` sends detailed session state with commitment gate checklist. `/pattern` works via existing passthrough to Claude skill file. |
| STAR Story Bank (SIM-31) | Added localStorage-backed story bank to BehavioralPanel. `StoryEntry` type with full STAR fields + timestamps. Save/Update button in practice view. Auto-loads saved story when revisiting a question. "My Stories" view with category grouping, edit, and delete. BookOpen icon on browse questions that have saved stories. |

**Files modified (2):**
- `web/src/App.tsx` — Added `/check`, `/continue`, `/recap` handling in `handleSendMessage` with enriched context
- `web/src/components/panels/BehavioralPanel.tsx` — Story bank: `StoryEntry` type, localStorage CRUD, stories view, save button, auto-load, saved indicators

**Jira transitions:**
- SIM-15 (Wire Slash Commands): In Progress → **Done**
- SIM-31 (STAR Method Coach): In Progress → **Done**

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

**Files modified (6):**
- `web/server/services/claude.ts` — Full rewrite: CLI subprocess replaces Anthropic SDK
- `web/server/routes/chat.ts` — Restored `simulateStream()`, kept `extractEditorBlocks()`
- `web/src/services/api.ts` — Added 90s client-side timeout
- `web/server/index.ts` — Removed API key log line
- `web/src/components/panels/MistakesPanel.tsx` — Added weakness heat map grid
- `web/src/components/panels/StatsPanel.tsx` — Added ActivityChart + RadarChart (pure SVG)

**Jira transitions:**
- SIM-12 (Mistake Tracking): In Progress → **Done**
- SIM-13 (Statistics Dashboard): In Progress → **Done**

---

### 2026-02-13 — Session 5

**Focus:** Database Layer via Supabase — PostgreSQL schema, query layer, REST API (Jira SIM-20)

| Task | What was done |
|------|---------------|
| PostgreSQL Schema | Created `server/db/schema.sql` with 7 tables: `profiles`, `problem_progress`, `sessions`, `mistakes`, `reviews`, `streaks`, `subscriptions`. RLS policies for per-user isolation. Auto-create profile trigger. Indexes on user_id, problem_id, created_at, next_review. `updated_at` triggers for profiles and subscriptions. |
| Supabase Client | Created `server/db/client.ts` with singleton admin client using service role key. Graceful fallback: `isSupabaseConfigured()` check so app works without DB. |
| TypeScript Types | Created `server/db/types.ts` with full `Database` interface. Row/Insert/Update variants for all 7 tables. Strict typing for enums (status, mode, plan). |
| Query Layer | Created `server/db/queries.ts` with 18 query functions: profile CRUD, progress upsert, session create/list, mistakes CRUD + due filter, reviews create/list, streak management with consecutive-day logic, bulk sync from localStorage. |
| REST API | Created `server/routes/progress.ts` with 10 endpoints: `GET/POST /progress`, `GET/POST /sessions`, `GET/POST/PATCH/DELETE /mistakes`, `GET/POST /reviews`, `GET /streak`, `POST /sync`. `requireUser` middleware validates Supabase + X-User-Id header. |
| Server Wiring | Wired `progressRouter` into Express app. Added Supabase status log on startup. Updated `.env.example` with Supabase env vars. |

**Files created (6):**
- `web/server/db/schema.sql` — Complete PostgreSQL schema (7 tables, RLS, triggers, indexes)
- `web/server/db/client.ts` — Supabase admin client with fallback check
- `web/server/db/types.ts` — Full TypeScript types for all DB tables
- `web/server/db/queries.ts` — 18 CRUD query functions + bulk sync
- `web/server/db/index.ts` — Barrel export
- `web/server/routes/progress.ts` — REST API with 10 endpoints

**Files modified (2):**
- `web/server/index.ts` — Wired progressRouter, Supabase status log
- `.env.example` — Added SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

**Key decisions:**
- Service role key bypasses RLS for server-side operations
- X-User-Id header as auth placeholder until SIM-19 (Auth) is wired
- Bulk sync endpoint enables one-time localStorage → DB migration
- App degrades gracefully without Supabase (returns 503 on DB endpoints, rest works fine)

---

### 2026-02-13 — Session 4

**Focus:** Problem Data Architecture — Markdown/LaTeX support + Multi-language starter code (Jira SIM-18)

| Task | What was done |
|------|---------------|
| LaTeX in Chat | Added `remark-math` + `rehype-katex` to ChatMessage.tsx. Inline `$...$` and block `$$...$$` math now renders in chat. KaTeX CSS + fonts auto-loaded. |
| Vendor Chunking | Moved KaTeX into `vendor-katex` chunk (299 KB). Main bundle actually dropped from 1,156 → 1,134 KB. |
| Multi-Language Types | Added `SupportedLanguage`, `MultiLangCode` types to `types/index.ts`. `starterCode` now accepts `string \| MultiLangCode` (backward compatible). |
| Language Utility | Created `utils/problemLanguage.ts` with: `getStarterCode()`, `getTestCode()`, `hasLanguageSupport()`, `getAvailableLanguages()`. Auto-strips types for JS fallback. Python test code converts `null`→`None`, `true`→`True`. |
| App.tsx Integration | Added `language` state (reads from settings localStorage). `handleSelectProblem` and `/next` command now use `getStarterCode(problem, language)` and `getTestCode(problem, language)`. |
| Example Problems | Added explicit TypeScript + JavaScript + Python starter code to 3 problems: Two Sum (hm-1), Search in Rotated Array (bs-1), Climbing Stairs (dp-1). |
| Tests | Created `problemLanguage.test.ts` with **16 tests** covering all utility functions. Total: **67 tests** across 5 files. |
| Jira Board | Populated full Jira board (SIM-1 through SIM-49): 11 Epics, 38 Stories. Set correct statuses (4 Done, 12 In Progress, 22 To Do). Created `.claude/jira-config.json`. |

**Files created (2):**
- `web/src/utils/problemLanguage.ts`
- `web/src/utils/__tests__/problemLanguage.test.ts`

**Files modified (7):**
- `web/src/types/index.ts` — Added `SupportedLanguage`, `MultiLangCode` types, updated `Problem.starterCode` to union
- `web/src/App.tsx` — Added `language` state, imported `getStarterCode`/`getTestCode`, language-aware problem loading
- `web/src/components/chat/ChatMessage.tsx` — Added remark-math + rehype-katex plugins, KaTeX CSS import
- `web/vite.config.ts` — Added `vendor-katex` manual chunk
- `web/src/data/problems/hashmap.ts` — Two Sum: multi-lang starterCode
- `web/src/data/problems/binary-search.ts` — Search in Rotated Array: multi-lang starterCode
- `web/src/data/problems/dynamic-programming.ts` — Climbing Stairs: multi-lang starterCode

---

### 2026-02-13 — Session 3

**Focus:** System design expansion, testing, settings, landing page

| Task | What was done |
|------|---------------|
| System Design Library | Expanded from 6 to **20 problems** (+custom). Added: Video Streaming, Ride Sharing, Search Engine, Payment System, News Feed, Collaborative Editor, Monitoring System, Key-Value Store, Web Crawler, Proximity Service, Ticket Booking, Maps & Navigation, Ad Click Aggregator, Hotel Reservation |
| Testing Infrastructure | Set up Vitest v4 + jsdom v25 + @testing-library/react. Wrote **51 tests** across 4 files: `stripTypes.test.ts` (13), `codeExecutor.test.ts` (12), `useSystemDesignState.test.ts` (14), `useMistakeTracker.test.ts` (12). Added test step to CI. |
| Settings Panel | Created `SettingsPanel.tsx` with: language preference, editor font size slider, auto-save toggle, timer toggle + duration, sound effects toggle, data export (JSON), data reset. Wired into sidebar. |
| Landing Page | Created `Landing.tsx` with: hero section, 6 feature cards, "How it works" 4-step flow, competitor comparison table (vs LeetCode, AlgoExpert, NeetCode, Interviewing.io), 3 pricing tiers (Free/$19/$29). Lazy-loaded, shown on first visit. |

**Files created (7):**
- `web/vitest.config.ts`
- `web/src/utils/__tests__/stripTypes.test.ts`
- `web/src/utils/__tests__/codeExecutor.test.ts`
- `web/src/hooks/__tests__/useSystemDesignState.test.ts`
- `web/src/hooks/__tests__/useMistakeTracker.test.ts`
- `web/src/components/panels/SettingsPanel.tsx`
- `web/src/components/Landing.tsx`

**Files modified (7):**
- `web/src/types/index.ts` — 14 new SystemDesignTopicId values, 'settings' in SidebarPanel
- `web/src/App.tsx` — SD_TOPIC_TITLES expanded, Landing integration, showLanding state
- `web/src/components/modals/InterviewLauncher.tsx` — 15 new system design entries
- `web/src/components/layout/Sidebar.tsx` — Settings panel wiring
- `web/package.json` — test scripts, jsdom v25
- `.github/workflows/ci.yml` — test step added

---

### 2026-02-13 — Session 2

**Focus:** Web Worker execution, recommendations, code splitting, behavioral module, CI/CD

| Task | What was done |
|------|---------------|
| Web Worker Execution | Replaced `new Function()` with sandboxed Web Worker (`executor.worker.ts` + `codeExecutor.ts`). 10s timeout per test case. |
| Adaptive Recommendations | Created `useAdaptiveRecommendation.ts` with pattern urgency scoring, readiness score (0-100), `/next` command wired. |
| Problem Search | Added recommended problems section to ProblemList with reasons, search/filter already existed. |
| Solution Comparison | `/review` command auto-includes editor code in message to Claude. |
| Code Splitting | React.lazy for 4 heavy components. Vite manualChunks for vendor bundles. Main bundle reduced ~100KB. |
| Behavioral Module | Created `behavioral.ts` (102 questions, 8 categories, Amazon LP mapping). Created `BehavioralPanel.tsx` (search, filters, STAR form, AI feedback). |
| CI/CD | Created `.github/workflows/ci.yml` — lint, typecheck, build, bundle size check. |

---

### 2026-02-13 — Session 1

**Focus:** Complete Phase 1 MVP and Phase 2 problem expansion

| Task | What was done |
|------|---------------|
| Mistake Tracker | Created `useMistakeTracker.ts` with SM-2 spaced repetition, localStorage persistence, `MistakesPanel.tsx` UI |
| Statistics | Created `useStats.ts` with pattern strength tracking, `StatsPanel.tsx` with session history and pattern breakdown |
| Review Rubric | Created `ReviewRubric.tsx` with 6-dimension scoring (0-4 scale), improvement plan generation |
| Session Persistence | Created `useSessionPersistence.ts` with auto-save to localStorage (debounced) |
| Problem Library | Expanded from ~20 to **77 problems** across 16 pattern categories. Split into per-pattern files. |
| Anthropic SDK | Replaced Claude CLI subprocess with `@anthropic-ai/sdk`. True SSE streaming. Model selection (Haiku/Sonnet). |
| App Integration | Wired all hooks into App.tsx: mistake tracker, stats, adaptive recommendations, session persistence |

---

## Architecture Overview

```
web/
├── src/
│   ├── components/
│   │   ├── chat/          # ChatPanel, ChatMessage
│   │   ├── editor/        # EditorPanel (Monaco)
│   │   ├── layout/        # TopNav, Sidebar
│   │   ├── modals/        # InterviewLauncher
│   │   ├── panels/        # ProblemList, MistakesPanel, StatsPanel, BehavioralPanel, SettingsPanel, CommitmentGate, HintLadder
│   │   ├── systemdesign/  # SystemDesignRouter, PhaseNav, phase components
│   │   ├── Landing.tsx    # Marketing landing page
│   │   └── ReviewRubric.tsx
│   ├── data/
│   │   ├── problems/      # 16 pattern files + index.ts (77 problems)
│   │   └── behavioral.ts  # 102 behavioral questions
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSystemDesignState.ts
│   │   ├── useMistakeTracker.ts
│   │   ├── useStats.ts
│   │   ├── useAdaptiveRecommendation.ts
│   │   ├── useSessionPersistence.ts
│   │   └── useSessionStorage.ts
│   ├── utils/
│   │   ├── stripTypes.ts
│   │   ├── codeExecutor.ts
│   │   ├── problemLanguage.ts  # Multi-language starter code utilities
│   │   └── executor.worker.ts
│   ├── design-system/     # tokens.css, layout.css, components.css
│   ├── services/          # api.ts
│   ├── types/             # index.ts
│   └── App.tsx
├── server/
│   ├── db/                # schema.sql, client.ts, types.ts, queries.ts, index.ts
│   ├── services/          # claude.ts (CLI subprocess)
│   ├── routes/            # chat.ts (SSE streaming), progress.ts (REST API)
│   └── middleware/        # validate.ts
├── vitest.config.ts
└── package.json
```

---

## Remaining Priority Order

1. **Auth** — Supabase auth (email/password, OAuth), JWT middleware, protected routes
2. **Wire frontend to DB** — Switch from localStorage to API when Supabase configured
3. **More tests** — Component tests, API integration tests, increase coverage
4. **More problems** — Complete NeetCode 150 (~73 more problems)
5. **Payment system** — Stripe integration, tier enforcement
6. **Deployment** — Docker, Vercel + Railway, custom domain
7. **AI enhancements** — Real-time code analysis, conversation memory, voice mode
8. **Community** — Leaderboards, achievements, profiles
9. **B2B** — Team accounts, admin dashboard

# Senior Interview Mentor — TODO

> Last updated: 2026-02-15

## Legend
- [x] Completed
- [ ] Not started
- [~] Partially done

---

## Phase 1: Complete the MVP

### 1.1 Mistake Tracking & Spaced Repetition
- [x] Implement `MistakeEntryFull` storage (pattern, problem, description, date, next review)
- [x] Build SM-2 spaced repetition algorithm (`useMistakeTracker.ts`)
- [x] Wire MistakesPanel to display tracked mistakes grouped by pattern
- [x] Auto-log mistakes when user fails test cases or needs Hint 3
- [x] `/mistakes` command: list, add, review, clear actions
- [x] Weakness heat map visualization in MistakesDashboard — color-coded grid, per-pattern counts

### 1.2 Statistics & Analytics Dashboard
- [x] Implement stats collection (problems solved, time spent, hints used, scores) — `useStats.ts`
- [x] Build StatsPanel with pattern strength display and streak tracking
- [x] Track rubric scores from REVIEWER mode
- [x] Session history with review capability
- [x] Progress ring in TopNav wired to readiness score
- [x] Charts — SVG activity bar chart (30-day) + pattern strength radar chart

### 1.3 REVIEWER Mode (Code Review with Rubric)
- [x] Build rubric scoring UI (6 dimensions, 0-4 scale) — `ReviewRubric.tsx`
- [x] Display scored rubric card after review
- [x] Generate improvement plan from weak dimensions
- [x] Store review history for progress tracking

### 1.4 Wire Remaining Slash Commands
- [x] `/next [difficulty]` — recommend next problem based on weakness patterns
- [x] `/review` — auto-includes editor code context
- [x] `/check [thinking]` — quick validation of current approach (auto-includes editor code)
- [x] `/continue` — restore session from persistence (enriched with session state)
- [x] `/recap` — show current session state summary with commitment gate checklist
- [ ] `/pattern <name> [action]` — pattern drill/explain with practice problems

### 1.5 Problem Search & Filtering
- [x] Add search bar to ProblemList (by title, pattern, difficulty)
- [x] Filter chips: Easy/Medium/Hard, pattern tags
- [x] Sort by: difficulty, recently attempted, recommended
- [x] Mark completed/attempted problems with status icons
- [x] Recommended problems section with reasons

---

## Phase 2: Problem Library Expansion

### 2.1 Curated Problem Sets
- [x] 150 problems across 20 pattern categories (NeetCode 150 coverage)
- [x] Each problem has: description, examples, constraints, starter code, test cases, pattern tags, difficulty
- [x] All 150 problems have TypeScript + Python starters (`MultiLangCode` format)
- [ ] Learning paths: "Blind 75 Sprint", "Pattern Mastery", "Company Prep", "Beginner to Senior"

### 2.2 Problem Data Architecture
- [x] Problems split into per-pattern files under `web/src/data/problems/` (20 files)
- [x] Pattern-based organization with index exports
- [x] Markdown-based problem descriptions (support LaTeX for math) — remark-math + rehype-katex in ChatMessage
- [x] Support multiple languages (TypeScript, JavaScript, Python) per problem — `MultiLangCode` type, `problemLanguage.ts` utility

---

## Phase 3: User System & Persistence

### 3.1 Authentication
- [x] Implement auth with Supabase (Email/password, Google OAuth, GitHub OAuth) — `useAuth.ts`, `AuthPage.tsx`
- [x] JWT token management (access + refresh tokens) — Supabase handles tokens
- [x] Protected routes and API middleware — `server/middleware/auth.ts` (requireAuth + optionalAuth)
- [x] Profile dropdown (avatar, email, sign out) — `ProfileDropdown.tsx`
- [x] "Skip" option for localStorage-only mode (app works without auth)
- [x] Auto-sync localStorage to Supabase on first login — `/api/auth/sync`

### 3.2 Database (PostgreSQL via Supabase)
- [x] Schema design (profiles, problem_progress, sessions, mistakes, reviews, streaks, subscriptions) — `server/db/schema.sql`
- [x] Supabase client with graceful fallback when not configured — `server/db/client.ts`
- [x] Full TypeScript types for all DB tables (Row/Insert/Update variants) — `server/db/types.ts`
- [x] Complete CRUD query layer (18 functions) — `server/db/queries.ts`
- [x] REST API with 10 endpoints (progress, sessions, mistakes, reviews, streak, sync) — `server/routes/progress.ts`
- [x] Bulk sync endpoint for one-time localStorage → DB migration
- [ ] Wire frontend to use API when Supabase is configured (currently localStorage only)
- [ ] Keep localStorage as offline cache, sync to DB when online

### 3.3 Settings & Preferences
- [x] Settings panel: language, editor font size, timer, auto-save, sound — `SettingsPanel.tsx`
- [x] Export data as JSON backup
- [x] Reset all data with confirmation
- [x] AI memory preferences (hint style, detail level) — integrated into settings
- [ ] Notification preferences (daily reminders, streak alerts)

---

## Phase 4: AI Features

### 4.1 Adaptive Problem Recommendation Engine
- [x] Track user performance per pattern
- [x] Weighted recommendation algorithm (urgency scoring)
- [x] Readiness score (0-100) across patterns
- [ ] "Daily Challenge" — 1 AI-selected problem per day
- [ ] "Interview Ready Score" per company/level

### 4.2 Real-Time Code Analysis
- [ ] Debounced code analysis on editor changes
- [ ] Detect common anti-patterns (nested loops, wrong data structure)
- [ ] Subtle inline hints (non-intrusive)
- [ ] Complexity estimation from code structure

### 4.3 AI-Powered Solution Comparison
- [x] `/review` auto-includes editor code in message to Claude
- [ ] Visual diff: user approach vs optimal approach
- [ ] Time/space complexity comparison
- [ ] Pattern identification display

### 4.4 Conversation Memory & Personalization
- [x] AI remembers user's learning style across sessions — `memoryBuilder.ts`
- [x] References past problems in coaching — stats/mistakes compiled into prompt context
- [x] Tracks and addresses recurring mistakes — spaced repetition data in memory context
- [x] Configurable hint style and detail level — settings panel integration

### 4.5 Voice/Audio Interview Mode
- [x] Browser speech-to-text for "thinking out loud" practice — `useSpeechRecognition.ts`
- [x] Filler word detection (15 patterns, rate calculation) — `fillerDetector.ts`
- [x] Voice button with recording pulse and filler badge — `VoiceButton.tsx`
- [x] AI communication evaluation — filler reports sent to AI for feedback

### 4.6 Multi-Language Support
- [x] Python execution support — Pyodide CDN (~10MB WASM, lazy on first use)
- [x] Language-specific starter code per problem (all 150 have TS + Python)
- [x] Pyodide for browser-based Python execution — `pyodideExecutor.ts`
- [x] Python test adapter (JS→Python input conversion) — `pythonTestAdapter.ts`
- [x] Language-aware AI responses

---

## Phase 5: System Design Excellence

### 5.1 Interactive Architecture Diagrams
- [x] Drag-and-drop system component canvas (React Flow) — `ArchitectureWorkspace.tsx`
- [x] Pre-built component library (Load Balancer, Cache, DB, Queue, CDN, etc.) — `ComponentPalette.tsx`
- [x] AI validates architecture — validation via chat
- [x] Export diagrams as PNG — `diagramSerializer.ts`

### 5.2 Expanded System Design Library
- [x] 20 system design problems (expanded from 6)
  - URL Shortener, Social Media Feed, Notification System, Rate Limiter, File Storage, Chat
  - Video Streaming, Ride Sharing, Search Engine, Payment System, News Feed
  - Collaborative Editor, Monitoring System, Key-Value Store, Web Crawler
  - Proximity Service, Ticket Booking, Maps & Navigation, Ad Click Aggregator, Hotel Reservation
- [x] Each with detailed AI prompt and design considerations

### 5.3 System Design Evaluation
- [ ] Structured rubric for system design
- [ ] AI evaluates each phase independently
- [ ] Comparison with reference architecture

---

## Phase 6: Behavioral Interview Module

### 6.1 STAR Method Coach
- [x] Structured STAR entry form (Situation, Task, Action, Result)
- [x] AI evaluates responses via chat
- [x] Story bank: save and organize behavioral stories by category — localStorage-backed, auto-load on revisit

### 6.2 Behavioral Question Library
- [x] 102 questions across 8 categories
- [x] Company-specific tags (Amazon LP, Google, Meta, Apple, Microsoft)
- [x] Seniority levels: New Grad, Mid-Level, Senior, Staff+
- [x] Follow-up questions and tips per question

### 6.3 Communication Scoring
- [ ] Evaluate STAR compliance scoring
- [ ] Score: Conciseness, Impact, Technical Depth, Self-Awareness
- [ ] Flag red flags: blaming others, vagueness, no metrics

---

## Phase 7: Monetization & Payment System

### 7.1 Tier Structure
- [x] Pricing tiers defined: Free, Premium ($19/mo), Pro ($29/mo) — `config/tiers.ts`
- [x] Pricing page with monthly/yearly toggle — `PricingPage.tsx`
- [x] Subscription banner (upgrade/trial/past_due prompts) — `SubscriptionBanner.tsx`
- [ ] Enforce tier limits (free: 5 messages/day, premium: unlimited)

### 7.2 Payment Integration
- [x] Stripe Checkout integration — `server/services/stripe.ts`
- [x] Webhook handling (invoice.paid, subscription updates) — `server/routes/billing.ts`
- [x] Customer portal for subscription management
- [x] Subscription state hook — `useSubscription.ts`
- [ ] Free trial (7 days)
- [ ] Referral program

### 7.3 Usage Tracking & Limits
- [ ] Rate limiting per tier
- [ ] Usage dashboard
- [ ] Soft upgrade prompts

---

## Phase 8: Community & Social Features

- [ ] Weekly/monthly leaderboards
- [ ] Study groups (5-10 people)
- [ ] Solution sharing after solving
- [x] Achievement system and badges — 17 achievements across 5 categories, `useAchievements.ts`
- [x] Shareable profile card (PNG export) — `profileCard.ts`
- [x] Activity heatmap (365-day GitHub-style) — `AchievementsPanel.tsx`
- [x] Personal records tracking — fastest solve, highest streak, etc.
- [x] Trophy sidebar panel — achievement badge display

---

## Phase 9: Production Infrastructure

### 9.1 Secure Code Execution
- [x] Web Worker sandboxed execution with 10s timeout
- [x] Replaced `new Function()` eval with worker isolation
- [x] Python execution via Pyodide Web Worker — `pyodideExecutor.ts`
- [ ] Server-side sandboxed containers (Docker/Firecracker) for production

### 9.2 Deployment
- [x] Containerize with Docker — `Dockerfile` + `docker-compose.yml`
- [x] Vercel config for frontend — `vercel.json`
- [x] Railway config for backend — `railway.json`
- [x] Anthropic SDK fallback for production (no CLI dependency)
- [x] Static file serving support
- [ ] HTTPS, custom domain setup

### 9.3 CI/CD Pipeline
- [x] GitHub Actions: lint, test, typecheck, build, bundle size check
- [ ] Auto-deploy on merge to main
- [ ] Preview deployments for PRs
- [ ] Branch protection rules

### 9.4 AI Backend
- [x] Claude CLI subprocess (`claude -p --output-format stream-json`) — `server/services/claude.ts`
- [x] Anthropic SDK fallback — `server/services/claudeSdk.ts`
- [x] AI facade (auto-selects CLI vs SDK based on ANTHROPIC_API_KEY) — `server/services/ai.ts`
- [x] SSE streaming with editor block extraction — `server/routes/chat.ts`
- [x] Token usage tracking
- [ ] Model selection per request type (Haiku for hints, Sonnet for standard)

### 9.5 Monitoring & Observability
- [x] Error tracking — Sentry (frontend + backend) — `lib/sentry.ts`
- [x] Analytics — PostHog product analytics — `lib/posthog.ts`, `lib/analytics.ts`
- [x] Request logging — structured JSON middleware — `server/middleware/requestLogger.ts`
- [x] Enhanced health endpoint
- [ ] AI cost monitoring (tokens per user)

### 9.6 Testing
- [x] Vitest setup with jsdom v25 + @testing-library/react
- [x] Unit tests: stripTypes (13), codeExecutor (12), useSystemDesignState (14), useMistakeTracker (12), problemLanguage (16), useCodeAnalysis (26), useAchievements (21) — **115 tests, 8 files**
- [ ] Component tests for critical UI flows
- [ ] API integration tests
- [ ] E2E tests (Playwright): signup → solve → review, interview flow, system design flow
- [ ] Target: 80%+ coverage on business logic

### 9.7 Performance & SEO
- [x] Code splitting (lazy load editor, system design, interview launcher, review rubric, landing)
- [x] Vendor chunk splitting (react, monaco, icons, katex)
- [x] SEO: meta tags, Open Graph, Twitter Cards, JSON-LD structured data — `index.html`
- [x] Semantic HTML landmarks
- [ ] Image optimization and CDN
- [ ] SSR or static generation for marketing pages
- [ ] Lighthouse score > 90

---

## Phase 10: Landing Page & Marketing

### 10.1 Marketing Pages
- [x] Landing page with hero, features, comparison table, pricing tiers
- [x] Pricing page with monthly/yearly toggle — `PricingPage.tsx`
- [ ] About page (mission, team)
- [ ] Blog (SEO content)
- [ ] Public problem pages as SEO content

### 10.2 SEO Strategy
- [ ] Target keywords: "coding interview prep", "leetcode alternative", "AI interview coach"
- [ ] Blog content pipeline
- [ ] Public problem pages indexed by Google

---

## Phase 11: B2B / Enterprise (Future)

- [ ] Team/organization accounts
- [ ] Admin dashboard
- [ ] Custom problem sets
- [ ] White-label option
- [ ] SSO integration
- [ ] University partnerships and student discounts

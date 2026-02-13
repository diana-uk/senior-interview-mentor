# Senior Interview Mentor — TODO

> Last updated: 2026-02-13

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
- [ ] Weakness heat map visualization in MistakesDashboard

### 1.2 Statistics & Analytics Dashboard
- [x] Implement stats collection (problems solved, time spent, hints used, scores) — `useStats.ts`
- [x] Build StatsPanel with pattern strength display and streak tracking
- [x] Track rubric scores from REVIEWER mode
- [x] Session history with review capability
- [x] Progress ring in TopNav wired to readiness score
- [ ] Charts (problems/day line chart, pattern strength radar chart)

### 1.3 REVIEWER Mode (Code Review with Rubric)
- [x] Build rubric scoring UI (6 dimensions, 0-4 scale) — `ReviewRubric.tsx`
- [x] Display scored rubric card after review
- [x] Generate improvement plan from weak dimensions
- [x] Store review history for progress tracking

### 1.4 Wire Remaining Slash Commands
- [x] `/next [difficulty]` — recommend next problem based on weakness patterns
- [x] `/review` — auto-includes editor code context
- [ ] `/pattern <name> [action]` — pattern drill/explain with practice problems
- [ ] `/check [thinking]` — quick validation of current approach
- [ ] `/continue` — restore session from persistence (partially working via auto-restore)
- [ ] `/recap` — show current session state summary

### 1.5 Problem Search & Filtering
- [x] Add search bar to ProblemList (by title, pattern, difficulty)
- [x] Filter chips: Easy/Medium/Hard, pattern tags
- [x] Sort by: difficulty, recently attempted, recommended
- [x] Mark completed/attempted problems with status icons
- [x] Recommended problems section with reasons

---

## Phase 2: Problem Library Expansion

### 2.1 Curated Problem Sets
- [x] 77 problems across 16 pattern categories (Blind 75+ coverage)
- [x] Each problem has: description, examples, constraints, starter code, test cases, pattern tags, difficulty
- [ ] Complete remaining NeetCode 150 problems (~73 more)
- [ ] Learning paths: "Blind 75 Sprint", "Pattern Mastery", "Company Prep", "Beginner to Senior"

### 2.2 Problem Data Architecture
- [x] Problems split into per-pattern files under `web/src/data/problems/`
- [x] Pattern-based organization with index exports
- [x] Markdown-based problem descriptions (support LaTeX for math) — remark-math + rehype-katex in ChatMessage
- [x] Support multiple languages (TypeScript, JavaScript, Python) per problem — `MultiLangCode` type, `problemLanguage.ts` utility

---

## Phase 3: User System & Persistence

### 3.1 Authentication
- [ ] Implement auth with Supabase (Email/password, Google OAuth, GitHub OAuth)
- [ ] JWT token management (access + refresh tokens)
- [ ] Protected routes and API middleware
- [ ] User profile page (avatar, bio, target companies, current level)

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
- [x] Settings panel: language, editor font size, timer, auto-save, sound
- [x] Export data as JSON backup
- [x] Reset all data with confirmation
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
- [ ] AI remembers user's learning style across sessions
- [ ] References past problems in coaching
- [ ] Tracks and addresses recurring mistakes

### 4.5 Voice/Audio Interview Mode
- [ ] Browser speech-to-text for "thinking out loud" practice
- [ ] Filler word detection
- [ ] Communication score in rubric

### 4.6 Multi-Language Support
- [ ] Python and JavaScript execution support
- [ ] Language-specific starter code per problem
- [ ] Pyodide for browser-based Python execution

---

## Phase 5: System Design Excellence

### 5.1 Interactive Architecture Diagrams
- [ ] Drag-and-drop system component canvas (React Flow or Excalidraw)
- [ ] Pre-built component library (Load Balancer, Cache, DB, Queue, CDN, etc.)
- [ ] AI validates architecture
- [ ] Export diagrams as images

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
- [ ] Story bank: save and organize behavioral stories by category

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
- [ ] Free tier: 5 problems/day, 3 AI messages/problem
- [ ] Premium ($19/mo): Unlimited everything
- [ ] Pro ($29/mo): Company-specific prep, analytics, resume review

### 7.2 Payment Integration
- [ ] Stripe integration (subscriptions + webhooks)
- [ ] Subscription management page
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
- [ ] Achievement system and badges
- [ ] Public profile with stats
- [ ] Activity heatmap (GitHub-style)

---

## Phase 9: Production Infrastructure

### 9.1 Secure Code Execution
- [x] Web Worker sandboxed execution with 10s timeout
- [x] Replaced `new Function()` eval with worker isolation
- [ ] Server-side sandboxed containers (Docker/Firecracker) for production
- [ ] Multi-language execution (Python via Pyodide)

### 9.2 Deployment
- [ ] Containerize with Docker (frontend + backend)
- [ ] Deploy: Frontend to Vercel, Backend to Railway, DB to Supabase
- [ ] Environment configuration (prod, staging, dev)
- [ ] HTTPS, custom domain setup

### 9.3 CI/CD Pipeline
- [x] GitHub Actions: lint, test, typecheck, build, bundle size check
- [ ] Auto-deploy on merge to main
- [ ] Preview deployments for PRs
- [ ] Branch protection rules

### 9.4 Replace Claude CLI with Direct API
- [x] Anthropic SDK (`@anthropic-ai/sdk`) with streaming
- [x] Token usage tracking
- [x] Model selection (Haiku for hints, Sonnet for standard)
- [ ] Fallback handling (rate limits, retries)

### 9.5 Monitoring & Observability
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog or Mixpanel)
- [ ] Server monitoring (uptime, response times)
- [ ] AI cost monitoring (tokens per user)

### 9.6 Testing
- [x] Vitest setup with jsdom + @testing-library/react
- [x] Unit tests: stripTypes (13), codeExecutor (12), useSystemDesignState (14), useMistakeTracker (12)
- [ ] Component tests for critical UI flows
- [ ] API integration tests
- [ ] E2E tests (Playwright): signup → solve → review, interview flow, system design flow
- [ ] Target: 80%+ coverage on business logic

### 9.7 Performance & SEO
- [x] Code splitting (lazy load editor, system design, interview launcher, review rubric, landing)
- [x] Vendor chunk splitting (react, monaco, icons)
- [ ] Image optimization and CDN
- [ ] SSR or static generation for marketing pages
- [ ] SEO: meta tags, Open Graph, structured data
- [ ] Lighthouse score > 90

---

## Phase 10: Landing Page & Marketing

### 10.1 Marketing Pages
- [x] Landing page with hero, features, comparison table, pricing tiers
- [ ] Separate pricing page with annual toggle
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

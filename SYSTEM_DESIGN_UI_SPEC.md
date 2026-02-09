# System Design Interview Workspace — Full UI/UX Specification

## What This Feature Is

A **guided system design interview simulator** inside a coding interview prep app. The user picks a system design topic (e.g., "Design a URL shortener"), and the app walks them through **6 structured phases** with a dedicated workspace for each, while an AI mentor provides real-time feedback in a side chat panel.

The app uses a **dark theme** (GitHub-style).

---

## The 7 Screens (in order)

---

### SCREEN 1: Plan Overview (Landing Page)

**When shown:** Immediately after the user launches a system design interview.

**Purpose:** Show the problem statement and a roadmap of all 6 phases so the user knows what's ahead.

**Layout:** Single full-page scrollable view, centered content (max-width ~740px).

**Elements:**

| Element | Details |
|---------|---------|
| **Hero card** | Large card at top with: architecture icon, topic title (e.g., "URL Shortening Service"), problem prompt text, countdown timer (45:00), progress counter ("0/6 phases") |
| **Roadmap section** | Header "Design Roadmap" with a horizontal progress bar (0% initially) |
| **6 phase cards** | Vertical timeline with connecting dots/lines. Each card shows: numbered dot, phase icon, phase title, 1-line description, status badge |
| **CTA button** | Full-width "Begin Requirements Phase" button at bottom |

**Phase cards and their data:**

| # | Title | Icon | Description | Initial Status |
|---|-------|------|-------------|----------------|
| 1 | Requirements & Scope | checklist | Clarify functional and non-functional requirements. Define scope, estimate scale, identify constraints. | "Start Here" (blue, pulsing) |
| 2 | API Design | api | Define REST endpoints, request/response contracts, status codes, error handling. | "Upcoming" |
| 3 | Data Model & Storage | database | Design schemas, choose databases, plan indexing and partitioning. | "Upcoming" |
| 4 | High-Level Architecture | account_tree | Describe components, services, data flow, inter-service communication. | "Locked" |
| 5 | Deep Dives | search | Pick 2-3 critical components to explore: caching, queues, consistency. | "Locked" |
| 6 | Scaling & Reliability | trending_up | Horizontal scaling, load balancing, CDN, monitoring, failure modes. | "Locked" |

**Status badge types:**

- **Done** — green background, green text
- **Active** — blue background, blue text, pulsing animation
- **Start Here** — blue with glow effect, pulsing
- **Upcoming** — gray background, gray text
- **Locked** — dimmed, gray, reduced opacity

**Each phase has a unique accent color:** blue, green, orange, purple, pink, yellow.

**User action:** Click "Begin Requirements Phase" → transitions to Screen 2.

---

### SCREEN 2: Requirements Phase (Text Editor)

**Layout:** 3-column: `[Phase Sidebar | Chat Panel | Code Editor]`

This is a **text-based phase** — the user discusses requirements with the AI mentor in the chat panel and can take notes in the code editor.

**Left column — Phase Progress Sidebar (210px):**

- Countdown timer (green, monospace, e.g., "44:32")
- Progress bar ("1/6 completed")
- 6 clickable phase steps (vertical list), each showing: indicator icon + number + label
- Current phase highlighted in blue
- Completed phases show green checkmark
- Locked phases are grayed out and unclickable

**Center column — Chat Panel (40% width):**

- The existing app's chat interface (mentor messages, user input, slash commands)
- Shows the initial system design prompt and instructions
- User types questions, mentor responds with guidance

**Right column — Code Editor (60% width):**

- The existing app's code editor with tabs (Solution/Tests/Notes)
- Pre-loaded with a system design template:

```
## [requirements]

## [api]

## [data]

## [architecture]

## [deepdive]

## [scaling]
```

- User fills in notes as they discuss with mentor

**User action:** Click "Next Step" (or click "API Design" in sidebar) → transitions to Screen 3.

---

### SCREEN 3: API Contract Workspace

**Layout:** 4-column: `[Phase Sidebar | Endpoint List | Endpoint Editor | Mentor Chat]`

**Left — Phase Sidebar (210px):** Same as Screen 2, but "API Design" is now active.

#### Endpoint List Panel (250px)

- Header: "Endpoints" title + count badge (e.g., "3") + blue "+ Add" button
- Scrollable list of endpoints, each showing:
  - Color-coded HTTP method badge (GET=blue, POST=green, PUT=orange, PATCH=purple, DELETE=red)
  - Path text in monospace (e.g., `/api/v1/users/:id`)
  - Delete button (trash icon, appears on hover)
- Active endpoint is highlighted with blue border

#### Endpoint Editor (flex, fills remaining space)

**When an endpoint is selected:**

- **Toolbar row:** Method dropdown (GET/POST/PUT/PATCH/DELETE) + Path input field
- **Description field:** Text input "What does this endpoint do?"
- **Two side-by-side textareas:** Request Body (JSON) | Response Body (JSON), monospace font
- **Bottom action bar:** "Next Step: Data Model →" button (right-aligned)

**When no endpoints exist (empty state):**

- Centered layout with:
  - Large API icon in a glowing blue container
  - Title: "Design Your API"
  - Description: "Define the endpoints your system needs. Start with the core operations."
  - **Quick add section:** 3 template buttons:
    - `POST /api/v1/resource` — "Create a new resource"
    - `GET /api/v1/resource/:id` — "Get resource by ID"
    - `GET /api/v1/resources` — "List resources (paginated)"
  - Each template button shows method badge + path, clicking it creates the endpoint

#### Right — Mentor Panel (340px)

- Header: "Mentor" title + "INTERVIEWER" badge (red)
- Scrollable message area showing AI conversation
- Input area: auto-growing textarea + send button (blue) or stop button (red when streaming)
- User can ask the mentor questions about API design while building endpoints

**User actions:**

- Add/remove/edit endpoints
- Click quick templates to scaffold common patterns
- Chat with mentor for feedback
- Click "Next Step" → transitions to Screen 4

---

### SCREEN 4: Data Model Workspace

**Layout:** 3-column: `[Phase Sidebar | Schema + DB Choice Editor | Mentor Chat]`

**Left — Phase Sidebar (210px):** "Data Model" is now active.

**Main Editor area (flex):** Scrollable, contains two card sections:

#### Card 1 — Schema Design

- Header: database icon + "Schema Design" title
- Hint text: "Define your tables/collections, fields, types, and relationships. Use plain text or pseudo-SQL."
- Large monospace textarea with SQL placeholder:

```sql
-- Example:
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Card 2 — Database Choice

- Header: storage icon + "Database Choice" title
- 3 radio card options (stacked vertically):

| Option | Label | Description |
|--------|-------|-------------|
| sql | SQL (Relational) | PostgreSQL, MySQL — strong consistency, joins, ACID |
| nosql | NoSQL (Document/KV) | MongoDB, DynamoDB, Redis — flexible schema, horizontal scale |
| both | Polyglot Persistence | Use multiple databases for different access patterns |

- Selected option has blue border highlight
- **Justification textarea:** "Why did you choose this database? What tradeoffs are you making?"
- **Bottom action:** "Next Step: Architecture →" button

**Right — Mentor Panel (340px):** Same as Screen 3.

**User actions:**

- Write schema in textarea
- Select database type
- Write justification
- Chat with mentor
- Click "Next Step" → transitions to Screen 5

---

### SCREENS 5, 6, 7: Architecture / Deep Dives / Scaling

**Layout:** Same as Screen 2: `[Phase Sidebar | Chat Panel | Code Editor]`

These are **text-based phases** — the user discusses the topic with the AI mentor and writes notes/diagrams in the editor. No specialized workspace UI.

- **Architecture:** User describes components, services, data flow in text
- **Deep Dives:** User picks 2-3 areas and explores tradeoffs
- **Scaling:** User discusses horizontal scaling, load balancing, failure modes

Each phase uses the same chat + editor layout, just with different phase highlighted in the sidebar.

---

## State Machine & Phase Transitions

```
overview → requirements → api → data → architecture → deepdive → scaling
```

- Phases unlock progressively: completing one phase unlocks the next
- Users can click back to completed phases in the sidebar
- The "Next Step" button always advances to the next phase
- Moving forward auto-marks the current phase as "completed"

**Phase status types:**

| Status | Visual | Behavior |
|--------|--------|----------|
| `locked` | Grayed out, lock icon, reduced opacity | Cannot click |
| `pending` | Normal text, circle icon | Clickable |
| `in-progress` | Blue highlight, chevron icon | Currently active |
| `completed` | Green text, checkmark icon | Clickable (revisit) |

**On interview start (INIT):**

| Phase | Initial Status |
|-------|---------------|
| overview | in-progress |
| requirements | pending |
| api | pending |
| data | pending |
| architecture | locked |
| deepdive | locked |
| scaling | locked |

---

## Shared Components

### Phase Progress Sidebar

Used on **ALL screens except the overview**. 210px wide, dark background.

- Countdown timer (green monospace digits)
- Progress bar with label "X/6 completed"
- 6 clickable phase steps (vertical list)
- Indicator icons change based on status (check, lock, chevron, circle)
- Active phase has blue highlight background and border

### Mentor Panel

Used on **API and Data workspaces** (Screens 3-4). 340px wide, right side.

- Header: "Mentor" title + red "INTERVIEWER" badge
- Scrollable message area with chat bubbles
- Streaming indicator (3 pulsing dots) when AI is responding
- Auto-growing textarea input (max 100px height)
- Send button (blue gradient) — disabled when empty
- Stop button (red) — shown only while AI is streaming
- Enter to send, Shift+Enter for new line

### Text Phase Layout

Used for **Requirements, Architecture, Deep Dives, Scaling** (Screens 2, 5-7).

- Phase Sidebar on the left
- Existing Chat Panel (40% width) in the center
- Existing Code Editor (60% width) on the right
- These are the same components used outside system design mode, just wrapped with the phase sidebar

---

## Available System Design Topics

Users pick one of these when launching the interview:

| ID | Title | Prompt |
|----|-------|--------|
| url-shortener | URL Shortening Service | Design a URL shortening service like bit.ly. |
| twitter-timeline | Social Media Feed / Timeline | Design Twitter's home timeline — how posts are created, fan-out to followers, ranked, and served at scale. |
| notification-system | Notification System | Design a notification system that supports push notifications, email, and SMS across millions of users with prioritization and rate limiting. |
| rate-limiter | Distributed Rate Limiter | Design a distributed rate limiter that can enforce request limits across multiple API servers — consider token bucket, sliding window, and Redis-based approaches. |
| file-storage | File Storage System | Design a file storage system like Dropbox or Google Drive — file upload/download, sync across devices, chunking, deduplication, and sharing. |
| chat-application | Real-Time Chat Application | Design a real-time chat application like WhatsApp or Slack — WebSocket connections, message delivery guarantees, presence, group chats, and message history. |
| custom | Custom | User enters their own prompt. |

---

## Design System Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0d1117` | Main background |
| `--bg-secondary` | `#161b22` | Card/surface backgrounds |
| `--bg-tertiary` | `#21262d` | Inputs, hover states |
| `--text-primary` | `#e6edf3` | Main text |
| `--text-secondary` | `#8b949e` | Muted/secondary text |
| `--accent-blue` | `#58a6ff` | Primary actions, active states, GET method |
| `--accent-green` | `#3fb950` | Success, completed, timer, POST method |
| `--accent-purple` | `#a371f7` | PATCH method, decorative accents |
| `--accent-orange` | `#d29922` | PUT method, warnings, data phase accent |
| `--accent-red` | `#f85149` | DELETE method, stop button, destructive actions |
| `--border` | `#30363d` | All borders |
| `--font-sans` | `Inter` | UI text |
| `--font-mono` | `Fira Code` | Code, paths, timer, JSON textareas |

---

## Icon Systems

- **Material Symbols Outlined** (Google Fonts CDN) — for phase icons: `checklist`, `api`, `database`, `account_tree`, `search`, `trending_up`, `timer`, `storage`, `architecture`, `map`
- **Lucide React** — for UI icons: `Plus`, `Trash2`, `ArrowRight`, `Zap`, `Check`, `Lock`, `Circle`, `ChevronRight`, `Send`, `Square`, `Clock`

---

## Key Interaction Patterns

1. **Progressive disclosure:** Phases unlock as the user advances, preventing overwhelm
2. **Always-available mentor:** AI chat is accessible on every screen for real-time guidance
3. **Structured → freeform:** API and Data phases have structured inputs (forms, dropdowns, radio cards); other phases are freeform text editors
4. **Quick templates:** Empty states provide one-click scaffolding to reduce blank-page paralysis
5. **Visual progress:** Timer + progress bar + phase badges create urgency and momentum
6. **Non-destructive navigation:** Users can go back to any completed phase without losing work
7. **Contextual layout switching:** The app layout changes based on what the current phase needs — full-page overview, 3-column text editing, or 4-column structured workspace

---

## User Flow Summary

```
1. User clicks "Start Interview" → picks "System Design" → picks topic
2. SCREEN 1 (Overview): Sees problem statement + 6-phase roadmap → clicks "Begin"
3. SCREEN 2 (Requirements): Discusses requirements with mentor in chat, takes notes → clicks "Next"
4. SCREEN 3 (API Design): Builds endpoints in structured editor, asks mentor for feedback → clicks "Next"
5. SCREEN 4 (Data Model): Writes schema, picks database, justifies choice → clicks "Next"
6. SCREEN 5 (Architecture): Describes system components in text editor with mentor guidance → clicks "Next"
7. SCREEN 6 (Deep Dives): Explores 2-3 critical areas in depth → clicks "Next"
8. SCREEN 7 (Scaling): Discusses scaling strategy, failure modes, SLAs → Done
```

Throughout the entire flow, a **45-minute countdown timer** is visible, simulating real interview pressure.

---

## Technical Context

- **Framework:** React 18 + TypeScript + Vite
- **State management:** `useReducer` hook with action dispatching
- **Styling:** Plain CSS with BEM-like class naming (`sd-overview__hero-title`, `phase-sidebar__step--active`)
- **No component library** — all custom components
- **The system design workspace replaces the normal 2-panel layout** (chat + editor) when active

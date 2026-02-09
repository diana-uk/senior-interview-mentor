# System Design Workspaces — Design Specification

> **Stitch source**: `stitch_interview_launcher_modal (6)/stitch_interview_launcher_modal/`
> **Contains 5 screens** across the full system design interview flow

---

## 1. Flow Overview

The system design interview is a multi-step experience with 5 distinct screens:

```
InterviewLauncher
  → [1] Plan Overview (empty)          — full-page roadmap, 0/6 phases
  → [2] Plan Overview (in-progress)    — roadmap with progress, N/6 phases
  → [3] API Contract Workspace         — Postman-like API editor (Step 2)
  → [4] Data Model Workspace           — SQL schema + DB choice editor (Step 3)
  → [5] Whiteboard Workspace           — Visual architecture diagram canvas (Step 4)
```

Steps 1 & 2 are the **same component** in different states (`SystemDesignPlanOverview`).
Steps 3-5 are **separate workspace components** that replace the current `SystemDesignEditor` for their respective phases.

### Navigation Model

The user progresses linearly through the 6 system design phases. Each workspace screen has:
- A **left sidebar** showing progress across all phases
- A **center editor** specific to the current phase
- A **right AI mentor panel** for chat
- A **header** with timer, breadcrumbs, and session controls

Phases are:
1. Requirements & Scope → text editor (existing `SystemDesignEditor` section)
2. API Design → **API Contract Workspace** (screen 3)
3. Data Model & Storage → **Data Model Workspace** (screen 4)
4. High-Level Architecture → **Whiteboard Workspace** (screen 5)
5. Deep Dives & Bottlenecks → text editor
6. Scaling & Reliability → text editor

---

## 2. Screen Inventory

| # | Screen | Folder | Component Name | New? |
|---|--------|--------|----------------|------|
| 1 | Plan Overview (empty) | `system_design_plan_overview_1/` | `SystemDesignPlanOverview` | Covered in earlier spec |
| 2 | Plan Overview (progress) | `system_design_plan_overview_2/` | `SystemDesignPlanOverview` | Covered in earlier spec |
| 3 | API Contract Workspace | `api_contract_design_workspace/` | `ApiContractWorkspace` | **YES** |
| 4 | Data Model Workspace | `data_model_definition_workspace/` | `DataModelWorkspace` | **YES** |
| 5 | Whiteboard Workspace | `system_design_whiteboard_workspace/` | `WhiteboardWorkspace` | **YES** |

---

## 3. API Contract Workspace (Screen 3)

### 3a. Component

```
File: web/src/components/editor/ApiContractWorkspace.tsx
CSS:  New section in App.css under /* ── API Contract Workspace ── */
```

### 3b. Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER (64px): Logo | Session Active: 14:02 | Settings | Avatar   │
├────────────┬──────────────────────────────────────────┬─────────────┤
│  SIDEBAR   │  CENTER PANEL                            │  MENTOR     │
│  (256px)   ├──────────┬───────────────────────────────┤  (320px)    │
│            │ Endpoint │  Editor Area                  │             │
│ Interview  │ List     │  [Toolbar: POST url Test Save]│  AI Chat    │
│ Phases     │ (256px)  │  [Tabs: Params|Auth|Body|Hdr] │             │
│            │          │  [Description input]          │             │
│ 1.Reqs ✓   │ POST /v1 │  [Request JSON code block]    │  Messages   │
│ 2.API ●    │ GET /v1  │  [Response JSON code block]   │             │
│ 3.Data 🔒  │ DEL /v1  │                               │             │
│ 4.Scale 🔒 │          │                               │  Input      │
│            │          ├───────────────────────────────┤             │
│ [Timer]    │          │ COMMITMENT GATE (bottom bar)  │             │
├────────────┴──────────┴───────────────────────────────┴─────────────┤
```

### 3c. Props Interface

```ts
interface ApiContractWorkspaceProps {
  topicId: SystemDesignTopicId;
  endpoints: Endpoint[];
  onEndpointsChange: (endpoints: Endpoint[]) => void;
  activeEndpointIndex: number;
  onSelectEndpoint: (index: number) => void;
  timerSeconds: number;
  completedPhases: string[];  // ids of completed phases
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onCommitApi: () => void;
  commitmentChecks: { id: string; label: string; checked: boolean }[];
  onToggleCheck: (id: string) => void;
}

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requestBody: string;   // JSON string
  responseBody: string;  // JSON string
  responseStatus: string;
}
```

### 3d. Key UI Elements

**HTTP Method Badges:**
| Method | Background | Text Color |
|--------|-----------|------------|
| POST | `rgba(88,166,255,0.2)` | `var(--accent-blue)` |
| GET | `rgba(63,185,80,0.15)` | `var(--accent-green)` |
| PUT | `rgba(210,153,34,0.15)` | `var(--accent-orange)` |
| DELETE | `rgba(248,81,73,0.15)` | `var(--accent-red)` |

Badge: `font-size: 10px`, `font-weight: 700`, `padding: 2px 6px`, `border-radius: 4px`

**Code Blocks:**
- Background: `var(--bg-primary)`
- Border: `1px solid var(--border)`
- Line numbers gutter: 32px wide, `var(--bg-secondary)` bg, `var(--text-secondary)` text, right-aligned
- Font: `var(--font-mono)`, `13px`
- JSON syntax colors: keys `#79c0ff`, strings `#a5d6ff`, braces `#e3b341` (yellow)

**Editor Tabs:**
- Inactive: `color: var(--text-secondary)`, `border-bottom: 2px solid transparent`
- Active: `color: var(--text-primary)`, `border-bottom: 2px solid var(--accent-blue)`, font-weight 500
- Active dot: small `var(--accent-blue)` dot after label

**Commitment Gate Bar:**
- Full-width, `bg: var(--bg-secondary)`, `border-top: 1px solid var(--border)`
- Checkboxes: 16x16px, border `var(--text-secondary)`, checked fills with `var(--accent-blue)`
- "Commit API" button: `var(--accent-blue)` bg, white text, bold, `box-shadow: 0 4px 12px rgba(88,166,255,0.2)`

### 3e. CSS Class Prefix: `sd-api__`

---

## 4. Data Model Workspace (Screen 4)

### 4a. Component

```
File: web/src/components/editor/DataModelWorkspace.tsx
CSS:  New section in App.css under /* ── Data Model Workspace ── */
```

### 4b. Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Step 3 of 5 [====40%====] | Timer | Settings | End │
├────────────┬──────────────────────────────────────────┬─────────────┤
│  SIDEBAR   │  TOP PANE: Schema Editor (~60%)          │  MENTOR     │
│  (256px)   │  [schema icon] Schema Definition  [SQL]  │  (340px)    │
│            │  ┌──────────────────────────────────┐    │             │
│ Progress   │  │ 1│ // Define tables...           │    │  AI Chat    │
│ Tracking   │  │ 2│                               │    │             │
│            │  │ 3│ CREATE TABLE urls (            │    │  Messages   │
│ 1.Reqs ✓   │  │ 4│   id BIGINT PRIMARY KEY,      │    │             │
│ 2.API ✓    │  │ ..│  ...                          │    │             │
│ 3.Data ●   │  └──────────────────────────────────┘    │             │
│ 4.HLD ○    │  ─── resize handle ───                   │             │
│ 5.Deep ○   │  BOTTOM PANE: DB Choices (~40%)          │             │
│            │  [dns icon] Database Choices              │             │
│            │  PRIMARY STORE TYPE:                      │             │
│ [Pro Tip]  │  ( ) RDBMS (SQL)  (●) NoSQL              │  Input      │
│            │  JUSTIFICATION: [textarea]                │             │
│            │  [Save Draft] [Next Step →]               │             │
├────────────┴──────────────────────────────────────────┴─────────────┤
```

### 4c. Props Interface

```ts
interface DataModelWorkspaceProps {
  topicId: SystemDesignTopicId;
  schema: string;                // SQL/text content
  onSchemaChange: (val: string) => void;
  dbChoice: 'sql' | 'nosql';
  onDbChoiceChange: (choice: 'sql' | 'nosql') => void;
  justification: string;
  onJustificationChange: (val: string) => void;
  currentStep: number;           // e.g. 3
  totalSteps: number;            // e.g. 5
  completedPhases: string[];
  timerSeconds: number;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onSaveDraft: () => void;
  onNextStep: () => void;
}
```

### 4d. Key UI Elements

**Header Progress Bar:**
- Centered in header, max-width ~480px
- Label: "Step X of Y" left, "N% Complete" right, both mono, `var(--text-secondary)`
- Track: 6px, `var(--bg-primary)` bg, `var(--accent-blue)` fill, rounded

**Schema Editor:**
- Line numbers gutter: 40px, `var(--bg-secondary)` at 50% opacity, right-aligned numbers
- Textarea: `var(--bg-primary)` bg, `var(--font-mono)`, `13px`, `line-height: 1.7`
- Spellcheck disabled

**DB Choice Radio Buttons:**
- Unselected: `var(--bg-primary)` bg, `var(--border)` border, white text
- Selected: `rgba(88,166,255,0.1)` bg, `var(--accent-blue)` border, white text
- Each 160px wide, `padding: 12px`, `border-radius: 8px`

**Resize Handle:**
- 4px tall, `var(--border)` bg, `hover: var(--accent-blue)`, `cursor: row-resize`

**Footer Actions:**
- "Save Draft": ghost button, `var(--text-secondary)`, hover white
- "Next Step →": `var(--accent-blue)` bg, white text, bold, with `arrow_forward` icon

### 4e. CSS Class Prefix: `sd-data__`

---

## 5. Whiteboard Workspace (Screen 5)

### 5a. Component

```
File: web/src/components/editor/WhiteboardWorkspace.tsx
CSS:  New section in App.css under /* ── Whiteboard Workspace ── */
```

### 5b. Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Workspace / URL Shortener / HARD | Timer | Finish  │
├──────┬─────────┬──────────────────────────────────────┬─────────────┤
│TOOLS │ PLAN    │  CANVAS                              │  MENTOR     │
│(64px)│ (288px) │  (flex-1)                             │  (400px)    │
│      │         │                                      │             │
│ ▸    │ 1. ✓   │  ┌─────────┐    ┌──────────┐         │ [MENTOR]    │
│ □    │ 2. ✓   │  │ CLIENT  │───▸│   LOAD   │         │ Analyzed    │
│ ○    │ 3. ✓   │  │  APPS   │    │ BALANCER │         │ your arch.  │
│ ↗    │ 4. ● ←  │  └─────────┘    └────┬─────┘         │             │
│ Tt   │ 5. 🔒  │       ┌───────────┐   │              │ Follow-up:  │
│ ☁    │ 6. 🔒  │       │API GATEWAY│◀──┘              │ ...         │
│ ⊡    │         │       └─────┬─────┘                  │             │
│      │ [50%]   │       ┌─────┴─────┐                  │ [YOU]       │
│ ?    │         │       │REDIS CLSTR │                  │ ...         │
│      │         │       └───────────┘                  │             │
│      │         │  ┌─ APP SERVERS ─────────┐           │ $ input     │
│      │         │  │ URL Svc | Analytics   │           │             │
│      │         │  │ Key Gen Svc           │           │             │
│      │         │  └───────────────────────┘           │             │
│      │         │                                      │             │
│      │         │  [− 85% + | ↩ ↪ | Snap to Grid ●]   │             │
├──────┴─────────┴──────────────────────────────────────┴─────────────┤
```

### 5c. Props Interface

```ts
interface WhiteboardWorkspaceProps {
  topicId: SystemDesignTopicId;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  onNodesChange: (nodes: DiagramNode[]) => void;
  onConnectionsChange: (connections: DiagramConnection[]) => void;
  selectedTool: WhiteboardTool;
  onToolChange: (tool: WhiteboardTool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  snapToGrid: boolean;
  onSnapToggle: () => void;
  completedPhases: string[];
  timerSeconds: number;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onFinishInterview: () => void;
}

type WhiteboardTool = 'select' | 'rectangle' | 'circle' | 'connector' | 'text' | 'cloud' | 'database';

interface DiagramNode {
  id: string;
  type: 'box' | 'group' | 'database' | 'cloud';
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon?: string;
  iconColor?: string;
  borderStyle?: 'solid' | 'dashed';
  selected?: boolean;
  children?: DiagramNode[];  // for group containers
}

interface DiagramConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style?: 'solid' | 'dashed';
}
```

### 5d. Key UI Elements

**Tools Sidebar:**
- 64px wide, `var(--bg-primary)` bg, centered buttons
- Active tool: `var(--accent-blue)` bg, dark text
- Inactive tool: `#8da6ce` text, `hover: rgba(255,255,255,0.05)` bg
- Each button: `40x40px`, `border-radius: 8px`

**Canvas Grid Background:**
```css
.sd-wb__canvas {
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
  cursor: crosshair;
}
```

**Diagram Nodes:**
- Default box: `var(--border)` border 2px, `var(--bg-secondary)` bg, centered icon + label
- Selected/active box: `var(--accent-blue)` border, glow shadow, 4 corner resize handles (small blue squares)
- Group container: dashed border, `rounded-xl`, semi-transparent bg, label positioned above
- Database node: dashed border, redis/db icon

**Bottom Toolbar (floating):**
- `position: absolute`, `bottom: 32px`, `left: 50%`, `transform: translateX(-50%)`
- `var(--bg-secondary)` bg, `var(--border)` border, `border-radius: 12px`, `box-shadow` large
- Sections separated by `1px var(--border)` vertical dividers
- Toggle switch: `32x16px`, `var(--accent-blue)` bg when active, dark knob

**Terminal-style Mentor Chat:**
- `var(--font-mono)`, `13px`
- [MENTOR] label: `var(--accent-blue)`, bold, with horizontal line
- Message blocks: `var(--bg-secondary)` at 30% opacity bg, `var(--accent-blue)` left-border 2px
- [YOU] label: `#8da6ce`, dimmed
- Input has `$` prompt symbol in `var(--accent-blue)`, blinking cursor animation

### 5e. CSS Class Prefix: `sd-wb__`

---

## 6. Shared Patterns Across All Workspaces

### Phase Progress Sidebar

All 3 workspace screens have a left sidebar showing phase progress. The step states are:

| State | Icon | Text Style | Background |
|-------|------|-----------|------------|
| COMPLETED | `check_circle` (green) | Strikethrough, 60% opacity | transparent |
| ACTIVE | `api`/`edit_note`/`radio_button_checked` (blue) | Bold white, "In Progress" sub-label | `rgba(88,166,255,0.1)`, blue left-border 2px |
| PENDING | `radio_button_unchecked` | Muted text | transparent |
| LOCKED | `lock` | Muted text, 50% opacity | transparent |

### AI Mentor Panel

Right panel shared across all workspaces. Two visual variants:

1. **Chat style** (API & Data Model): Rounded bubbles, avatar icons, timestamps
2. **Terminal style** (Whiteboard): Mono font, `$` prompt, `[MENTOR]`/`[YOU]` labels, left-border accent

Both share: send button, input field, scrollable message area.

### Timer Display

Consistent across all screens:
- Mono font, `var(--text-primary)` text
- Inside a bordered pill: `var(--bg-primary)` bg, `var(--border)` border, `border-radius: 8px`
- Clock icon in `var(--accent-blue)`

---

## 7. Integration with App.tsx

### New State Variables

```ts
const [sdPhase, setSdPhase] = useState<'overview' | 'requirements' | 'api' | 'data' | 'architecture' | 'deepdive' | 'scaling'>('overview');
```

### Conditional Rendering

When `interviewStage === 'system-design'`, render based on `sdPhase`:

```tsx
{interviewStage === 'system-design' && sdPhase === 'overview' && (
  <SystemDesignPlanOverview ... />
)}
{interviewStage === 'system-design' && sdPhase === 'api' && (
  <ApiContractWorkspace ... />
)}
{interviewStage === 'system-design' && sdPhase === 'data' && (
  <DataModelWorkspace ... />
)}
{interviewStage === 'system-design' && sdPhase === 'architecture' && (
  <WhiteboardWorkspace ... />
)}
{interviewStage === 'system-design' && ['requirements', 'deepdive', 'scaling'].includes(sdPhase) && (
  // Existing workspace with SystemDesignEditor focused on that section
)}
```

### Phase Transitions

- "Next Step" / "Commit API" buttons advance `sdPhase` to the next phase
- Plan Overview step cards click to jump to that phase (if unlocked)
- Left sidebar in workspaces allows clicking completed phases to review them

---

## 8. Implementation Priority

1. **Plan Overview** (screens 1-2) — simplest, standalone full-page view
2. **Data Model Workspace** (screen 4) — familiar split-pane editor pattern
3. **API Contract Workspace** (screen 3) — multi-column editor with endpoint management
4. **Whiteboard Workspace** (screen 5) — most complex, requires canvas/drag-drop logic

---

## 9. Reference Files

| Screen | Screenshot | Stitch HTML | Reference Implementation |
|--------|-----------|-------------|-------------------------|
| Plan Overview (empty) | `system_design_plan_overview_1/screen.png` | `system_design_plan_overview_1/code.html` | See earlier spec in folders (4)/(5) |
| Plan Overview (progress) | `system_design_plan_overview_2/screen.png` | `system_design_plan_overview_2/code.html` | See earlier spec in folders (4)/(5) |
| API Contract Workspace | `api_contract_design_workspace/screen.png` | `api_contract_design_workspace/code.html` | `api_contract_design_workspace/reference-implementation.html` |
| Data Model Workspace | `data_model_definition_workspace/screen.png` | `data_model_definition_workspace/code.html` | `data_model_definition_workspace/reference-implementation.html` |
| Whiteboard Workspace | `system_design_whiteboard_workspace/screen.png` | `system_design_whiteboard_workspace/code.html` | `system_design_whiteboard_workspace/reference-implementation.html` |

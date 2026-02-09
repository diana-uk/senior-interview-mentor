but # System Design Plan Overview — Design Specification

> **Stitch source**: `stitch_interview_launcher_modal (4)/` (empty state) and `stitch_interview_launcher_modal (5)/` (partial progress state)
> **Component**: `SystemDesignPlanOverview`
> **Location**: `web/src/components/modals/SystemDesignPlanOverview.tsx`
> **CSS**: Add to `web/src/App.css` under a new `/* ── System Design Plan Overview ── */` section

---

## 1. Purpose & Flow

This is a **full-screen intermediary view** that appears **after** the user selects a system design topic in the `InterviewLauncher` modal and **before** they enter the workspace (Chat + `SystemDesignEditor`).

### Current flow

```
InterviewLauncher (pick "System Design" → pick topic) → Workspace immediately
```

### New flow

```
InterviewLauncher (pick "System Design" → pick topic) → SystemDesignPlanOverview → Workspace
```

The overview acts as a "mission briefing" — it presents the 6 structured design phases as a visual roadmap so the user understands the full journey before starting. Clicking **"Start Designing"** transitions into the workspace.

When the user returns to this view mid-session (via a sidebar button or back action), completed sections show green checkmarks and the CTA says **"Continue Designing"**.

---

## 2. Integration Points

### App.tsx changes

Add a new state variable:

```ts
const [showSdOverview, setShowSdOverview] = useState(false);
```

In `handleStartInterview`, when `config.stage === 'system-design'`:

- Set all the existing state (mode, timer, sdTopicId, etc.) as before
- Set `showSdOverview = true` instead of immediately showing the workspace
- Do NOT send the initial mentor chat message yet

When the user clicks "Start Designing" in the overview:

- Set `showSdOverview = false`
- Send the initial system design chat message (the one currently in `handleStartInterview`)

### Rendering

In `App.tsx`, render conditionally:

```tsx
{
  showSdOverview && sdTopicId && (
    <SystemDesignPlanOverview
      topicId={sdTopicId}
      customPrompt={customSystemDesignPrompt}
      sectionContents={parsedEditorSections}
      onStartDesigning={() => {
        setShowSdOverview(false);
        // send initial mentor message here
      }}
      onBack={() => {
        setShowSdOverview(false);
        setInterviewModalOpen(true); // return to launcher
      }}
    />
  );
}
```

When `showSdOverview` is true, it renders **on top of** (or **instead of**) the workspace as a full-screen overlay/page.

---

## 3. Props Interface

```ts
interface SystemDesignPlanOverviewProps {
  topicId: SystemDesignTopicId;
  customPrompt?: string; // only when topicId === 'custom'
  sectionContents: Record<string, string>; // parsed current editor sections
  onStartDesigning: () => void; // CTA click
  onBack: () => void; // back to launcher
}
```

---

## 4. Data: Topic Metadata

Reuse the existing `SD_TOPIC_TITLES` map from `App.tsx` for the title. Add descriptions for the banner:

```ts
const SD_TOPIC_META: Record<
  Exclude<SystemDesignTopicId, "custom">,
  {
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    duration: string;
  }
> = {
  "url-shortener": {
    title: "URL Shortener",
    description:
      "Design a highly scalable service like Bit.ly. Focus on unique ID generation, high read throughput, and database sharding strategies.",
    difficulty: "Hard",
    duration: "45 mins",
  },
  "twitter-timeline": {
    title: "Social Media Feed",
    description:
      "Design Twitter's home timeline — fan-out strategies, ranking algorithms, and caching at scale.",
    difficulty: "Hard",
    duration: "45 mins",
  },
  "notification-system": {
    title: "Notification System",
    description:
      "Multi-channel notifications — push, email, SMS with prioritization and rate limiting.",
    difficulty: "Hard",
    duration: "45 mins",
  },
  "rate-limiter": {
    title: "Rate Limiter",
    description:
      "Distributed rate limiting — token bucket, sliding window, Redis-based approaches.",
    difficulty: "Medium",
    duration: "45 mins",
  },
  "file-storage": {
    title: "File Storage",
    description:
      "Design Dropbox/Google Drive — upload, sync, chunking, dedup at scale.",
    difficulty: "Hard",
    duration: "45 mins",
  },
  "chat-application": {
    title: "Real-Time Chat",
    description:
      "Design WhatsApp/Slack — WebSockets, presence, message delivery guarantees.",
    difficulty: "Hard",
    duration: "45 mins",
  },
};
```

---

## 5. Data: The 6 Steps

Reuse the same step definitions from `SystemDesignEditor.tsx`:

```ts
const SD_STEPS = [
  {
    id: "requirements",
    step: 1,
    icon: "checklist",
    title: "Requirements & Scope",
    description:
      "Define functional & non-functional goals. Establish traffic estimates.",
  },
  {
    id: "api",
    step: 2,
    icon: "api",
    title: "API Design",
    description:
      "Outline REST/RPC endpoints, request parameters, and response structures.",
  },
  {
    id: "data",
    step: 3,
    icon: "database",
    title: "Data Model & Storage",
    description:
      "Design schema relationships and select SQL vs NoSQL based on access patterns.",
  },
  {
    id: "architecture",
    step: 4,
    icon: "account_tree",
    title: "High-Level Architecture",
    description:
      "Diagram microservices, load balancers, and how components interact.",
  },
  {
    id: "deepdive",
    step: 5,
    icon: "bolt",
    title: "Deep Dives & Bottlenecks",
    description:
      "Identify Single Points of Failure (SPOFs), race conditions, and latency issues.",
  },
  {
    id: "scaling",
    step: 6,
    icon: "monitoring",
    title: "Scaling & Reliability",
    description:
      "Implement sharding, caching strategies, and replication for scale.",
  },
];
```

---

## 6. Visual Anatomy

The view is a **full-screen page** (not a modal) on `--bg-primary` (#0d1117) background. Content is centered, max-width 960px. No sidebar or workspace visible.

### 6a. Header Banner Card

```
┌─────────────────────────────────────────────────────────────┐
│  [HARD badge]  [clock icon] 45 mins                         │
│                                                             │
│  System Design Challenge: URL Shortener    [View Reqs →]   │
│                                                             │
│  Design a highly scalable service like Bit.ly...            │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**

- Container: `border: 1px solid var(--accent-blue)`, `background: rgba(88,166,255,0.06)`, `border-radius: 12px`, `padding: 24px 32px`
- Decorative glow: absolute-positioned 256px circle, `bg: rgba(88,166,255,0.1)`, `blur: 48px`, positioned top-right, `pointer-events: none`
- Difficulty badge: `background: rgba(248,81,73,0.2)`, `color: #f85149`, `border: 1px solid rgba(248,81,73,0.4)`, `border-radius: 9999px`, `padding: 4px 12px`, `font-size: 11px`, `font-weight: 700`, `text-transform: uppercase`
  - For Medium: use `--accent-orange` equivalents
  - For Easy: use `--accent-green` equivalents
- Duration: `color: var(--text-secondary)`, `font-size: 13px`, with `schedule` Material icon at 16px
- Title: `color: var(--text-primary)`, `font-size: 24px` (desktop 28px), `font-weight: 700`
- Description: `color: var(--text-secondary)`, `font-size: 14px`, `max-width: 560px`
- "View Requirements" button: `background: var(--bg-tertiary)`, `border: 1px solid var(--border)`, `border-radius: 8px`, `color: white`, `font-weight: 700`, `font-size: 13px`, hover: `border-color: var(--accent-blue)`, `color: var(--accent-blue)`

### 6b. Progress Section

```
Mission Roadmap                                    0/6 phases ready
[━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]
```

**Styling:**

- "Mission Roadmap": `color: var(--text-primary)`, `font-size: 17px`, `font-weight: 700`
- Counter text: `color: var(--accent-green)`, `font-size: 13px`, `font-weight: 500`
- Progress track: `height: 6px`, `background: var(--bg-tertiary)`, `border-radius: 9999px`
- Progress fill: `height: 6px`, `background: var(--accent-green)`, `border-radius: 9999px`, `box-shadow: 0 0 10px rgba(63,185,80,0.5)`, `transition: width 0.5s ease`
- Width calculation: `(completedCount / 6) * 100%`, minimum 2% so the green dot is visible even at 0

### 6c. Steps Grid

2-column grid on desktop, single column on mobile.

```
┌──────────────────────┐  ┌──────────────────────┐
│  [icon]    STEP 01   │  │  [icon]    STEP 02   │
│                      │  │                      │
│  Requirements &      │  │  API Design          │
│  Scope               │  │                      │
│  Define functional   │  │  Outline REST/RPC    │
│  & non-functional... │  │  endpoints, request  │
└──────────────────────┘  └──────────────────────┘
┌──────────────────────┐  ┌──────────────────────┐
│  ...Step 3...        │  │  ...Step 4...        │
└──────────────────────┘  └──────────────────────┘
┌──────────────────────┐  ┌──────────────────────┐
│  ...Step 5...        │  │  ...Step 6...        │
└──────────────────────┘  └──────────────────────┘
```

**Grid:** `display: grid`, `grid-template-columns: 1fr 1fr` (desktop), `1fr` (mobile), `gap: 24px`

### 6d. Step Card — 3 Visual States

Each card derives its state from `sectionContents[step.id]`:

#### State: PENDING (section empty, not the next one to work on)

- Border: `1px solid var(--border)` (#30363d)
- Background: `var(--bg-secondary)` (#161b22)
- Icon container: `40x40px`, `border-radius: 8px`, `background: #1f242c`, `color: var(--text-secondary)`
- Step label (top-right): `"STEP 0X"`, `font-family: monospace`, `font-size: 11px`, `color: var(--text-secondary)`, `opacity: 0.5`
- Title: `color: var(--text-secondary)` (dimmed), `font-size: 17px`, `font-weight: 700`
- Description: `color: var(--text-secondary)`, `font-size: 13px`, `opacity: 0.7`
- Hover: `border-color: var(--text-secondary)`

#### State: IN_PROGRESS (first empty section — the "current" one)

- Border: `1px solid var(--accent-blue)` (#58a6ff)
- Background: `var(--bg-secondary)` (#161b22)
- Box-shadow: `0 0 15px rgba(88,166,255,0.1)`
- Icon container: `background: rgba(88,166,255,0.1)`, `color: var(--accent-blue)`
- Icon: `circle` (filled blue dot — Material Symbols `circle`)
- Step label: `"IN PROGRESS"`, `color: var(--accent-blue)`, `font-weight: 700`, `animation: pulse` (subtle)
- Title: `color: var(--accent-blue)`, `font-size: 17px`, `font-weight: 700`
- Description: `color: #c9d1d9` (slightly brighter than secondary)

#### State: COMPLETED (section has content)

- Border: `1px solid rgba(63,185,80,0.3)`
- Background: `rgba(63,185,80,0.1)`
- Icon container: `background: rgba(63,185,80,0.2)`, `color: var(--accent-green)`
- Icon: `check_circle` (Material Symbols)
- Step label: `"COMPLETED"`, `color: var(--accent-green)`, `font-weight: 700`
- Title: `color: var(--text-primary)` (full white), hover: `color: var(--accent-green)`
- Description: `color: #c9d1d9`

#### Shared card styling (all states):

- `border-radius: 12px`
- `padding: 20px`
- `cursor: pointer`
- `transition: all 0.2s ease`
- `display: flex`, `flex-direction: column`, `gap: 16px`
- Top row: `display: flex`, `justify-content: space-between`, `align-items: flex-start`

### 6e. CTA Button (sticky bottom)

```
          [ rocket_launch  Start Designing ]
```

**Styling:**

- Sticky: `position: sticky`, `bottom: 16px`, `z-index: 40`
- Container: `display: flex`, `justify-content: center`, `margin-top: 16px`
- Button: `background: var(--accent-blue)`, `color: #0f1924` (dark text on blue bg), `font-weight: 700`, `font-size: 15px`
- Padding: `16px 32px`, `border-radius: 12px`
- Shadow: `box-shadow: 0 0 20px rgba(88,166,255,0.4)`
- Hover: `transform: scale(1.05)`, `box-shadow: 0 0 30px rgba(88,166,255,0.6)`
- Active: `transform: scale(0.95)`
- Icon: `rocket_launch` Material Symbol, `font-size: 18px`, to the left of text
- Gap between icon and text: `12px`
- Text: **"Start Designing"** when 0 sections filled, **"Continue Designing"** when >= 1 section filled

---

## 7. State Logic

```ts
function getStepStatus(
  stepId: string,
  sectionContents: Record<string, string>,
  allSteps: typeof SD_STEPS,
) {
  const content = (sectionContents[stepId] || "").trim();
  if (content.length > 0) return "completed";

  // Find the first empty section — that's the "in progress" one
  const firstEmptyStep = allSteps.find(
    (s) => !(sectionContents[s.id] || "").trim(),
  );
  if (firstEmptyStep && firstEmptyStep.id === stepId) return "in_progress";

  return "pending";
}
```

Progress counter:

```ts
const completedCount = SD_STEPS.filter(
  (s) => (sectionContents[s.id] || "").trim().length > 0,
).length;
```

---

## 8. CSS Class Naming Convention

Follow the existing BEM pattern used throughout the app:

```
.sd-overview                          — full-screen container
.sd-overview__content                 — centered max-width wrapper

.sd-overview-banner                   — header banner card
.sd-overview-banner__badges           — difficulty + duration row
.sd-overview-banner__title            — h1 title
.sd-overview-banner__desc             — description text
.sd-overview-banner__glow             — decorative blur circle
.sd-overview-banner__action           — "View Requirements" button

.sd-overview-progress                 — progress section wrapper
.sd-overview-progress__label          — "Mission Roadmap" heading
.sd-overview-progress__counter        — "X/6 phases ready" text
.sd-overview-progress__track          — progress bar track
.sd-overview-progress__fill           — progress bar fill

.sd-overview-grid                     — 2-column step grid

.sd-overview-card                     — individual step card
.sd-overview-card--pending            — pending state modifier
.sd-overview-card--in-progress        — current step modifier
.sd-overview-card--completed          — completed state modifier
.sd-overview-card__top                — icon + step label row
.sd-overview-card__icon               — 40x40 icon container
.sd-overview-card__step-label         — "STEP 01" / "COMPLETED" / "IN PROGRESS"
.sd-overview-card__title              — step title
.sd-overview-card__desc               — step description

.sd-overview-cta                      — sticky bottom CTA wrapper
.sd-overview-cta__btn                 — the actual button
```

---

## 9. Responsive Behavior

| Breakpoint        | Behavior                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Desktop (>=768px) | 2-column grid, horizontal banner layout (title left, button right), `padding: 48px` on main                |
| Mobile (<768px)   | 1-column grid, stacked banner (title on top, button below), `padding: 16px` on main, CTA button full-width |

---

## 10. Animations

- Progress bar fill: `transition: width 0.5s ease`
- Card hover: `transition: all 0.2s ease` (border color, shadow)
- "IN PROGRESS" label: `animation: pulse 2s ease-in-out infinite` (use existing CSS `@keyframes pulse` or add: `opacity` oscillates between `1` and `0.5`)
- CTA hover: `transition: transform 0.15s ease, box-shadow 0.15s ease`
- CTA active: `transform: scale(0.95)`

---

## 11. Edge Cases

1. **Custom topic (topicId === 'custom')**: Use the `customPrompt` prop as description. Title becomes "Custom System Design". Difficulty badge hidden or defaults to "Medium".
2. **All 6 completed**: Progress bar full green, all cards show COMPLETED, CTA still says "Continue Designing". No card shows IN_PROGRESS.
3. **Non-sequential completion**: A user might fill section 3 before section 1. The "IN PROGRESS" state should still go to the first empty section by order, not by recency.

---

## 12. Accessibility

- Step cards should be `role="button"` with `tabIndex={0}` and `onKeyDown` for Enter/Space
- Progress bar should use `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="6"`
- CTA button: auto-focus on mount for keyboard users
- All Material icons should have `aria-hidden="true"` (decorative)

---

## 13. Reference Screenshots

| State         | File                                             |
| ------------- | ------------------------------------------------ |
| Empty (0/6)   | `stitch_interview_launcher_modal (4)/screen.png` |
| Partial (3/6) | `stitch_interview_launcher_modal (5)/screen.png` |

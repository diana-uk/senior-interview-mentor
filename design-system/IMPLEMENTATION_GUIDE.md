# Implementation Guide - Senior Interview Mentor Design System

This guide helps you implement the "Neo-Terminal Elite" design system in your React application.

## Quick Start

### 1. Install Fonts

Add to your `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 2. Replace CSS Files

Replace your existing CSS with the design system files in this order:

```css
/* In your main CSS entry point */
@import './design-system/tokens.css';
@import './design-system/components.css';
@import './design-system/layout.css';
@import './design-system/animations.css';
```

Or copy the contents to your existing CSS files.

### 3. Update Component Classes

Below is a mapping from common component patterns to the new CSS classes.

---

## Component Class Mapping

### App Shell

```jsx
// Old
<div className="app">

// New
<div className="app-shell">
  <nav className="topnav">...</nav>
  <div className="app-body">
    <aside className="sidebar">...</aside>
    <main className="workspace">...</main>
  </div>
</div>
```

### Top Navigation

```jsx
<nav className="topnav">
  <div className="topnav-left">
    <div className="topnav-brand">
      <div className="topnav-logo">SM</div>
      <span className="topnav-title">Senior Mentor</span>
    </div>
    <div className="topnav-breadcrumb">
      <span className="topnav-breadcrumb-item">Problems</span>
      <span className="topnav-breadcrumb-sep">/</span>
      <span className="topnav-breadcrumb-current">Two Sum</span>
    </div>
  </div>

  <div className="topnav-center">
    <div className="interview-timer">
      <span className="interview-timer-icon">⏱</span>
      <span className="interview-timer-value interview-timer-safe">42:15</span>
    </div>
  </div>

  <div className="topnav-right">
    <div className="hints-badge">
      <span className="hints-badge-icon">💡</span>
      <span className="hints-badge-count">1</span>
    </div>
    <span className="badge badge-pulse badge-teacher">Teacher</span>
  </div>
</nav>
```

### Sidebar

```jsx
<aside className="sidebar">
  <nav className="sidebar-nav">
    <button className="sidebar-nav-item sidebar-nav-item-active">
      <Icon />
    </button>
    <button className="sidebar-nav-item">
      <Icon />
    </button>
  </nav>
  <div className="sidebar-footer">
    <button className="sidebar-nav-item">
      <SettingsIcon />
    </button>
  </div>
</aside>

{/* Expandable Panel */}
<div className="sidebar-panel">
  <div className="sidebar-panel-header">
    <span className="sidebar-panel-title">Problems</span>
    <button className="sidebar-panel-close">×</button>
  </div>
  <div className="sidebar-panel-content">
    {/* Content */}
  </div>
</div>
```

### Buttons

```jsx
// Primary (glowing cyan)
<button className="btn btn-primary">Start Interview</button>

// Secondary (ghost)
<button className="btn btn-secondary">Cancel</button>

// Danger
<button className="btn btn-danger">End Session</button>

// Success
<button className="btn btn-success">Run Tests</button>

// Ghost (minimal)
<button className="btn btn-ghost">View All</button>

// Sizes
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary btn-lg">Large</button>

// Icon button
<button className="btn btn-icon btn-ghost">
  <Icon />
</button>
```

### Badges

```jsx
// Difficulty
<span className="badge badge-easy">Easy</span>
<span className="badge badge-medium">Medium</span>
<span className="badge badge-hard">Hard</span>

// Mode (with pulse animation)
<span className="badge badge-pulse badge-teacher">Teacher</span>
<span className="badge badge-pulse badge-interviewer">Interviewer</span>
<span className="badge badge-pulse badge-reviewer">Reviewer</span>
```

### Cards

```jsx
<div className="card">
  <div className="card-header">
    <h2 className="card-title">Card Title</h2>
    <button className="btn btn-ghost btn-sm">Action</button>
  </div>
  <div className="card-body">
    {/* Content */}
  </div>
  <div className="card-footer">
    {/* Footer */}
  </div>
</div>

// Interactive card (hover lift)
<div className="card card-interactive">...</div>
```

### Chat Panel

```jsx
<div className="chat-panel">
  <div className="chat-header">
    <div className="chat-header-left">
      <div className="avatar avatar-sm avatar-mentor">AI</div>
      <span className="chat-header-label">Senior Mentor</span>
    </div>
  </div>

  <div className="chat-messages">
    {/* Mentor message */}
    <div className="message message-mentor message-enter">
      <div className="message-header">
        <div className="avatar avatar-sm avatar-mentor">AI</div>
        <span className="message-time">Just now</span>
      </div>
      <div className="message-content">
        <p>Message content...</p>
      </div>
    </div>

    {/* User message */}
    <div className="message message-user message-enter">
      <div className="message-header">
        <div className="avatar avatar-sm avatar-user">DK</div>
        <span className="message-time">Just now</span>
      </div>
      <div className="message-content">
        <p>User response...</p>
      </div>
    </div>
  </div>

  <div className="chat-input-area">
    <div className="chat-quick-actions">
      <button className="chat-quick-action">/hint</button>
      <button className="chat-quick-action">/run</button>
    </div>
    <div className="chat-input-wrapper">
      <textarea className="chat-input" placeholder="Type..." />
      <button className="chat-send-btn">
        <SendIcon />
      </button>
    </div>
  </div>
</div>
```

### Editor Panel

```jsx
<div className="editor-panel">
  <div className="editor-header">
    <div className="editor-tabs">
      <button className="editor-tab editor-tab-active">Solution</button>
      <button className="editor-tab">Tests</button>
      <button className="editor-tab">Notes</button>
    </div>
    <div className="editor-actions">
      <button className="btn btn-success btn-sm">Run Tests</button>
    </div>
  </div>

  <div className="editor-content">
    <div className="editor-line-numbers">1<br/>2<br/>3</div>
    <textarea className="editor-textarea" />
  </div>

  {/* Test Results */}
  <div className="test-panel">
    <div className="test-panel-header">
      <div className="test-panel-title">Test Results</div>
      <span className="test-panel-status test-panel-status-pass">3/3 Passed</span>
    </div>
    <div className="test-panel-body">
      <div className="test-case test-case-pass">
        <span className="test-case-icon">✓</span>
        <div className="test-case-content">...</div>
      </div>
    </div>
  </div>
</div>
```

### Progress Indicators

```jsx
// Progress Bar
<div className="progress-bar">
  <div className="progress-bar-fill" style={{ width: '75%' }} />
</div>

// With variants
<div className="progress-bar">
  <div className="progress-bar-fill progress-bar-fill-success" />
</div>

// Progress Ring (SVG)
<div className="progress-ring">
  <svg viewBox="0 0 40 40">
    <circle className="progress-ring-bg" cx="20" cy="20" r="16" />
    <circle
      className="progress-ring-fill"
      cx="20" cy="20" r="16"
      strokeDasharray="100"
      strokeDashoffset="25"
    />
  </svg>
  <span className="progress-ring-text">75%</span>
</div>
```

### Avatars

```jsx
// Sizes
<div className="avatar avatar-sm avatar-mentor">AI</div>
<div className="avatar avatar-md avatar-user">DK</div>
<div className="avatar avatar-lg avatar-mentor">AI</div>
```

### Modals

```jsx
<div className="modal-backdrop">
  <div className="modal">
    <div className="modal-header">
      <h2 className="modal-title">Modal Title</h2>
      <button className="modal-close">×</button>
    </div>
    <div className="modal-body">
      {/* Content */}
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

---

## Animation Classes

### Entry Animations

```jsx
// Staggered reveal (add to children)
<div className="stagger-enter stagger-1" />
<div className="stagger-enter stagger-2" />
<div className="stagger-enter stagger-3" />

// Message slide in
<div className="message message-enter" />

// Page transition
<div className="page-enter page-enter-active" />
```

### Interactive Animations

```jsx
// Card lift on hover
<div className="card card-hover-lift" />

// Card shine effect
<div className="card card-shine" />

// Button glow pulse
<button className="btn btn-primary btn-glow-pulse" />

// Neon breathe
<span className="neon-breathe">Glowing Text</span>
```

### Timer States

```jsx
// Safe (green)
<span className="interview-timer-value interview-timer-safe">42:15</span>

// Warning (amber, pulsing)
<span className="interview-timer-value interview-timer-warning">10:00</span>

// Danger (red, fast pulse)
<span className="interview-timer-value interview-timer-danger">02:30</span>
```

---

## Color Variables

Use these CSS variables for consistent theming:

```css
/* Primary Actions */
var(--neon-cyan)        /* #00f0ff */
var(--neon-cyan-subtle) /* rgba(0, 240, 255, 0.1) */

/* Success */
var(--neon-lime)        /* #a3ff00 */

/* Warning */
var(--neon-amber)       /* #ffaa00 */

/* Danger */
var(--neon-red)         /* #ff3366 */

/* Accent */
var(--neon-magenta)     /* #ff00aa */
var(--neon-purple)      /* #9966ff */

/* Backgrounds */
var(--bg-abyss)         /* Primary background */
var(--bg-surface)       /* Card/panel backgrounds */
var(--bg-elevated)      /* Elevated elements */
var(--bg-overlay)       /* Hover states, overlays */

/* Text */
var(--text-bright)      /* White, headings */
var(--text-primary)     /* Main body text */
var(--text-secondary)   /* Descriptions */
var(--text-muted)       /* Labels, hints */
```

---

## Typography Classes

```jsx
// Use font-display for headings
<h1 style={{ fontFamily: 'var(--font-display)' }}>Heading</h1>

// Use font-mono for code
<code style={{ fontFamily: 'var(--font-mono)' }}>code</code>

// Inline code styling
<code className="code-inline">twoSum()</code>
```

---

## Responsive Breakpoints

The design system includes responsive styles:

- **Desktop**: Full layout with sidebar
- **Tablet** (≤1024px): Stacked panels
- **Mobile** (≤768px): Collapsed sidebar, single panel view

---

## Tips for Migration

1. **Start with tokens.css** - This sets all CSS variables
2. **Replace layout classes first** - app-shell, sidebar, workspace
3. **Update component classes** - buttons, badges, cards
4. **Add animations last** - entry animations, hover effects
5. **Test dark mode** - The design is dark-mode only

---

## Files Reference

| File | Purpose |
|------|---------|
| `tokens.css` | Colors, typography, spacing, shadows |
| `components.css` | Buttons, badges, cards, inputs, progress |
| `layout.css` | App shell, sidebar, panels, chat, editor |
| `animations.css` | Transitions, keyframes, micro-interactions |
| `pages/*.html` | Prototype pages for reference |

---

## Need Help?

Open the HTML prototype files in a browser to see the complete design in action:

- `pages/dashboard.html` - Dashboard with stats, patterns, recommendations
- `pages/workspace.html` - Problem-solving interface with hints
- `pages/interview.html` - Mock interview mode with timer
- `pages/patterns.html` - Algorithm pattern library

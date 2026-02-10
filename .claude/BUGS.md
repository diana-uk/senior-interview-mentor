# Bug Report - Senior Interview Mentor

This document lists all bugs found during Playwright testing of the web application.

---

## BUG-001: Material Symbols Icons Not Rendering (HIGH PRIORITY)

**Status:** FIXED
**Severity:** High
**Component:** Global / CSS

### Description
All Material Symbols icons throughout the app display as plain text (e.g., "terminal", "call", "architecture", "check_circle", "chevron_right") instead of rendering as actual icons.

### Root Cause
The CSS class `.material-symbols-outlined` in `web/src/index.css` is missing the required `font-family` property. The class only defines `font-variation-settings` but doesn't specify the font family.

### Affected Areas
- Interview Launcher modal (all stage icons, format radio buttons, topic icons)
- System Design workspace (phase icons, section icons)
- System Design roadmap view (step icons)
- Top navigation breadcrumb separators
- Various buttons and indicators throughout the app

### Screenshots
- `/.playwright-mcp/interview-modal.png`
- `/.playwright-mcp/system-design-options.png`
- `/.playwright-mcp/system-design-started.png`

### Fix
In `web/src/index.css`, update the `.material-symbols-outlined` class:

```css
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

---

## BUG-002: Settings Panel Not Implemented

**Status:** Open
**Severity:** Medium
**Component:** Sidebar / Settings

### Description
Clicking the Settings button in the sidebar marks it as active (visual highlight) but does not open any settings panel or modal. The feature appears to be unimplemented.

### Steps to Reproduce
1. Open the app
2. Click the Settings button (gear icon) at the bottom of the sidebar
3. Observe: Button becomes active but nothing happens

### Expected Behavior
A settings panel should open allowing users to configure app preferences.

### Screenshot
- `/.playwright-mcp/settings-clicked.png`

---

## BUG-003: Raw Markdown in System Design Description

**Status:** Open
**Severity:** Low
**Component:** System Design / Overview

### Description
In the System Design interview overview, the problem description shows raw markdown syntax instead of rendered text. For example:

**Actual:** `Design a **URL shortening service** like bit.ly`
**Expected:** `Design a URL shortening service like bit.ly` (with bold formatting)

### Steps to Reproduce
1. Click Interview button
2. Select "System Design"
3. Select any design problem (e.g., URL Shortener)
4. Click "Start Interview"
5. Observe the problem description in the header

### Fix
Use a markdown renderer (e.g., react-markdown which is already a dependency) or parse the markdown manually for the description field.

### Screenshot
- `/.playwright-mcp/system-design-bugs-003-004.png`

---

## BUG-004: Top Nav Shows Placeholder After Starting System Design

**Status:** Open
**Severity:** Low
**Component:** TopNav

### Description
After starting a System Design interview, the top navigation still shows "Select a problem to begin" instead of displaying the actual problem name (e.g., "URL Shortener").

### Steps to Reproduce
1. Start a System Design interview with "URL Shortener"
2. Observe the top nav - it shows "Select a problem to begin"

### Expected Behavior
Top nav should show the problem name: "URL Shortener" or "URL Shortening Service"

### Screenshot
- `/.playwright-mcp/system-design-bugs-003-004.png`

---

## BUG-005: Stats Panel Remains Open When Changing Views

**Status:** Open
**Severity:** Low
**Component:** Sidebar / Panel Management

### Description
When the Statistics panel is open and you start an interview, the Statistics panel remains visible in the left column instead of being replaced by the interview-appropriate panel.

### Steps to Reproduce
1. Click "stats" button to open Statistics panel
2. Click "interview" button and start an interview
3. Observe: Statistics panel is still showing on the left

### Expected Behavior
The Statistics panel should close or be replaced with relevant interview context when an interview is started.

### Screenshot
- `/.playwright-mcp/stats-panel-during-interview.png`

---

## BUG-006: System Design Textarea Cursor Jumping

**Status:** FIXED
**Severity:** High
**Component:** System Design / Editor

### Description
When typing in the System Design workspace textareas, the cursor would jump to a new line after every character typed, making the input unusable.

### Root Cause
The `handleSectionChange` function in `SystemDesignEditor.tsx` was re-parsing and re-serializing the entire value on every keystroke, causing a full React re-render that reset cursor position.

### Fix
Implemented local state (`localSections`) for immediate textarea updates with a 300ms debounced sync to the parent component. This prevents re-renders during typing.

### Screenshot
- `/.playwright-mcp/system-design-fixes-verified.png`

---

## BUG-007: System Design Shows All Sections at Once

**Status:** FIXED
**Severity:** Medium
**Component:** System Design / Editor

### Description
All 6 design sections were visible and editable at once, rather than revealing progressively as the user completes each section.

### Expected Behavior
Sections should unlock one at a time as the previous section is filled out, guiding the user through the design process.

### Fix
Implemented progressive section reveal:
- Only unlocked sections are expanded and editable
- Locked sections show a "Complete previous section" message with lock icon
- A section unlocks when the previous section has content

### Screenshot
- `/.playwright-mcp/system-design-fixes-verified.png`

---

## BUG-008: No Way to Submit System Design Sections for Review

**Status:** FIXED
**Severity:** Medium
**Component:** System Design / Editor

### Description
Users had no way to submit their work in each System Design section to the AI mentor for feedback and review.

### Fix
Added a "Submit for Review" button to each section that:
- Appears when the section has content
- Sends the section title and content to the chat
- Requests feedback from the mentor

### Screenshot
- `/.playwright-mcp/system-design-fixes-verified.png`

---

## Summary

| Bug ID | Title | Severity | Status | Component |
|--------|-------|----------|--------|-----------|
| BUG-001 | Material Symbols Icons Not Rendering | High | FIXED | Global/CSS |
| BUG-002 | Settings Panel Not Implemented | Medium | Open | Sidebar |
| BUG-003 | Raw Markdown in System Design Description | Low | Open | System Design |
| BUG-004 | Top Nav Shows Placeholder | Low | Open | TopNav |
| BUG-005 | Stats Panel Remains Open | Low | Open | Sidebar |
| BUG-006 | System Design Textarea Cursor Jumping | High | FIXED | System Design |
| BUG-007 | System Design Shows All Sections at Once | Medium | FIXED | System Design |
| BUG-008 | No Way to Submit Sections for Review | Medium | FIXED | System Design |

---

## Testing Notes

- **Initial Test Date:** 2026-02-09
- **Re-verification Date:** 2026-02-10
- **Test Method:** Playwright MCP browser automation
- **Browser:** Chromium (via Playwright)
- **App URL:** http://localhost:5173
- **No console errors were detected during testing**

### Re-verification Summary (2026-02-10)
All bugs were re-tested using Playwright automation:
- **BUG-001**: Confirmed FIXED - Icons render correctly (screenshot: `interview-modal-icons-bug.png`)
- **BUG-002**: Confirmed OPEN - Settings button shows active state but no panel opens
- **BUG-003**: Confirmed OPEN - Raw markdown `**text**` visible in System Design description
- **BUG-004**: Confirmed OPEN - TopNav shows "Select a problem to begin" during active interview
- **BUG-005**: Confirmed OPEN - Stats panel overlaps with interview workspace (screenshot: `stats-panel-during-interview.png`)
- **BUG-006**: Confirmed FIXED - Text entry works without cursor jumping
- **BUG-007**: Confirmed FIXED - Progressive section unlock working correctly
- **BUG-008**: Confirmed FIXED - Submit for Review button appears and enables with content

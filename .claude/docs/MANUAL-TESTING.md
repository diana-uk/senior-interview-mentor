# Manual Testing Guide - Senior Interview Mentor

> 77 Jira tasks completed, never manually tested. This document covers every user-facing feature grouped by area, with exact steps to verify each one.

---

## Prerequisites

1. Run `cd web && npm run dev` (starts both Vite client + Express server)
2. Verify server health: `curl http://localhost:3001/api/health` returns `{"status":"ok"}`
3. Open the app at `http://localhost:5173` (or 5174 if 5173 is busy)
4. Have Chrome/Edge ready (needed for voice features)

---

## 1. Landing Page (SIM-46)

| # | What to test | How to do it |
|---|-------------|-------------|
| 1.1 | Page renders | Open the app URL -- you should see a marketing landing page with hero section, not the workspace |
| 1.2 | Feature cards | Scroll down -- 6 feature cards with icons and descriptions should be visible |
| 1.3 | Comparison table | Scroll further -- table comparing vs LeetCode, AlgoExpert, NeetCode |
| 1.4 | Pricing tiers | 3 tiers visible: Free / Premium / Pro with feature lists |
| 1.5 | Monthly/Yearly toggle | Click the toggle -- prices should change (yearly shows discount) |
| 1.6 | CTA buttons | "Get Started" / "Start Free Trial" buttons visible and clickable |
| 1.7 | Lazy loading | Check browser Network tab -- Landing chunk loads separately from main bundle |

---

## 2. Authentication (SIM-19)

| # | What to test | How to do it |
|---|-------------|-------------|
| 2.1 | Auth page loads | Click "Get Started" on landing -- should see login/signup form |
| 2.2 | Skip button | Click "Skip" -- should enter the app without an account, using localStorage only |
| 2.3 | Email signup | Enter email + password, click Sign Up -- account created, enters app |
| 2.4 | Email login | Sign out, then sign in with same credentials -- should work |
| 2.5 | Google OAuth | Click "Continue with Google" -- Google popup, then redirected back logged in |
| 2.6 | GitHub OAuth | Click "Continue with GitHub" -- GitHub popup, then redirected back logged in |
| 2.7 | Auth errors | Try wrong password -- error message should display clearly |
| 2.8 | Profile dropdown | When logged in, top-right shows avatar/email -- click to see dropdown |
| 2.9 | Sign out | Click "Sign Out" in dropdown -- returns to auth page |
| 2.10 | Session persistence | Log in, refresh page -- should still be logged in |
| 2.11 | Auto-sync on first login | Sign up fresh, solve a problem first as guest, then sign up -- toast should show "Syncing data..." |

> **Note**: OAuth requires Supabase provider config. If not configured, buttons may error -- that's expected for local dev without env vars.

---

## 3. Top Navigation (SIM-74, SIM-57)

| # | What to test | How to do it |
|---|-------------|-------------|
| 3.1 | Logo and title | "Senior Interview Mentor" visible on left side |
| 3.2 | Problem breadcrumb | Load a problem -- its title appears in the nav |
| 3.3 | Difficulty badge | Badge next to title shows Easy (green) / Medium (yellow) / Hard (red) |
| 3.4 | Mode badge | Shows TEACHER by default, changes when you start interview or review |
| 3.5 | Progress indicator | Circle/bar shows commitment gate or readiness progress |
| 3.6 | Timer | Start an interview -- timer shows MM:SS counting down |
| 3.7 | Timer colors | Watch timer: GREEN (>10min) -> YELLOW (2-10min) -> RED (<2min) |
| 3.8 | Responsive (small screen) | Resize browser to <400px width -- timer/title should abbreviate or hide, not overflow |

---

## 4. Sidebar Navigation

| # | What to test | How to do it |
|---|-------------|-------------|
| 4.1 | Interview button | Click -- opens InterviewLauncher modal |
| 4.2 | Problems button | Click -- opens problem list panel on the side |
| 4.3 | Behavioral button | Click -- opens behavioral questions panel |
| 4.4 | Mistakes button | Click -- opens mistake tracker panel |
| 4.5 | Stats button | Click -- opens statistics panel |
| 4.6 | Achievements button | Click -- opens achievements panel |
| 4.7 | Settings button | Click -- opens settings panel |
| 4.8 | Panel exclusivity | Click Problems, then Stats -- only Stats should be open, Problems closes |
| 4.9 | Close panel | Click X or click the same sidebar button again -- panel closes |

---

## 5. Problem List & Search (SIM-16, SIM-70)

| # | What to test | How to do it |
|---|-------------|-------------|
| 5.1 | All 150 problems | Open Problems panel -- scroll through, problems organized by 20 pattern categories |
| 5.2 | Search | Type "two sum" in search bar -- filters to matching problems |
| 5.3 | Filter by pattern | Click filter button, select "Sliding Window" -- only sliding window problems shown |
| 5.4 | Filter by difficulty | Select "Hard" -- only hard problems shown |
| 5.5 | Combined filters | Search "tree" + filter "Medium" -- both applied simultaneously |
| 5.6 | Empty state | Apply very restrictive filters (e.g., search "xyznonexistent") -- should show "No problems match your filters" with a clear-filters button |
| 5.7 | Clear filters | Click clear-filters button -- all problems visible again |
| 5.8 | Status icons | Solve a problem, return to list -- should show completed icon next to it |
| 5.9 | Click to load | Click any problem -- loads in editor, chat shows problem description |

---

## 6. Problem Loading & Deep Linking (SIM-73)

| # | What to test | How to do it |
|---|-------------|-------------|
| 6.1 | Load problem | Click "Two Sum" in list -- editor shows starter code, chat shows problem description |
| 6.2 | URL updates | After loading, browser URL should change to `/problems/two-sum` (or similar ID) |
| 6.3 | Direct URL | Copy the URL, open in new tab -- same problem should load directly |
| 6.4 | Share URL | Copy URL, paste in incognito window -- problem loads (may need to skip auth) |
| 6.5 | Back/Forward | Load problem A, then problem B, press browser Back -- goes back to problem A |
| 6.6 | Starter code | Editor shows function signature with types, empty body with `// Your solution here` |
| 6.7 | Test code | Click "Tests" tab -- should show 3+ test cases with console.log |
| 6.8 | State reset | Loading new problem resets: hints (locked), commitment gate (unchecked) |
| 6.9 | Panel URLs | Navigate to `/settings`, `/behavioral`, `/achievements`, `/stats`, `/mistakes` -- each should open correct panel |
| 6.10 | Invalid URL | Go to `/problems/nonexistent-id` -- should show fallback or redirect, not crash |

---

## 7. Editor Panel (SIM-27, SIM-39)

| # | What to test | How to do it |
|---|-------------|-------------|
| 7.1 | Solution tab | Selected by default, shows Monaco editor with starter code |
| 7.2 | Tests tab | Click -- shows test code |
| 7.3 | Notes tab | Click -- shows editable scratch notes area |
| 7.4 | Syntax highlighting | TypeScript code should have colored keywords, strings, types |
| 7.5 | Code editing | Type code -- changes appear, no lag |
| 7.6 | Language: TypeScript | Select TypeScript -- starter code has type annotations |
| 7.7 | Language: JavaScript | Switch to JavaScript -- starter code updates (no type annotations) |
| 7.8 | Language: Python | Switch to Python -- starter code updates to `def two_sum(nums: list[int]...)` style |
| 7.9 | Pyodide loading | First Python selection -- brief loading indicator while Pyodide WASM loads (~2-3s) |
| 7.10 | Run Tests (TS/JS) | Write solution, click "Run Tests" -- results appear in console |
| 7.11 | Run Tests (Python) | Write Python solution, click "Run Tests" -- executes via Pyodide worker |
| 7.12 | Test pass | Correct solution -- green checkmarks, "All tests passed" |
| 7.13 | Test fail | Wrong solution -- red X with actual vs expected output |
| 7.14 | Execution timeout | Write `while(true){}`, run -- should timeout at 10s with error message |
| 7.15 | Runtime error | Write `null.foo`, run -- error message shown in console |
| 7.16 | Console toggle | Click console toggle -- show/hide test output area |
| 7.17 | Font size | Change font size in Settings -- editor text size updates |

---

## 8. Chat Panel & AI Interaction (SIM-25, SIM-62, SIM-59)

| # | What to test | How to do it |
|---|-------------|-------------|
| 8.1 | Send message | Type "What pattern should I use for Two Sum?" and press Enter |
| 8.2 | Streaming response | AI response should appear word-by-word (streaming), not all at once |
| 8.3 | Markdown rendering | Response should render bold, italic, code blocks, lists properly |
| 8.4 | Code blocks | Code in response should have syntax highlighting and copy button |
| 8.5 | Auto-scroll | Long responses -- chat should auto-scroll to keep latest text visible |
| 8.6 | Multiple turns | Send 3-4 messages back and forth -- conversation flows naturally |
| 8.7 | Shift+Enter | Shift+Enter in input -- adds newline instead of sending |
| 8.8 | Stop button | While AI is streaming, click Stop -- response stops, no crash |
| 8.9 | Memory/context | Mention a preference ("I prefer verbose explanations"), then ask a question -- AI should adapt |
| 8.10 | Error handling | Stop the server, try sending a message -- should show "Server error" message, not crash |

---

## 9. Slash Commands (SIM-15, SIM-55)

| # | What to test | How to do it |
|---|-------------|-------------|
| 9.1 | Quick-action buttons | Below chat input, buttons for `/hint`, `/next`, `/pattern`, `/mistakes`, `/continue` should be visible |
| 9.2 | `/hint` | Click /hint button or type `/hint` -- hint panel opens, first hint unlocked |
| 9.3 | `/hint` level 2 | Click /hint again -- second hint unlocks (structure/data structure) |
| 9.4 | `/hint` level 3 | Click /hint third time -- pseudocode hint unlocks, mistake auto-logged |
| 9.5 | `/stuck` | Type `/stuck` -- same as /hint, auto-advances to next level |
| 9.6 | `/review` | Type `/review` -- switches to REVIEWER mode, rubric modal opens |
| 9.7 | `/check` | Type `/check I'm thinking of using a hashmap` -- AI validates your approach |
| 9.8 | `/next` | Type `/next` -- loads next recommended problem based on weaknesses |
| 9.9 | `/next hard` | Type `/next hard` -- loads a hard problem recommendation |
| 9.10 | `/pattern sliding-window` | Type it -- AI explains the sliding window pattern |
| 9.11 | `/mistakes` | Type it -- shows recent mistakes for review |
| 9.12 | `/continue` | Type it -- resumes session with state recap |
| 9.13 | `/recap` | Type it -- shows current session state (problem, hints used, gate progress) |

---

## 10. Commitment Gate

| # | What to test | How to do it |
|---|-------------|-------------|
| 10.1 | Gate visible | Load a problem -- gate should be visible (or accessible via UI) showing 5 items |
| 10.2 | Five items | Constraints recap, Chosen pattern, Approach plan, Complexity estimate, Edge cases |
| 10.3 | Toggle checkboxes | Click each checkbox -- toggles on/off |
| 10.4 | Progress tracking | Check 3/5 items -- progress indicator should show 60% |
| 10.5 | Persistence | Check items, switch tabs, come back -- checkboxes still checked |

---

## 11. Hint Ladder

| # | What to test | How to do it |
|---|-------------|-------------|
| 11.1 | Panel appears | Use `/hint` -- floating hint panel appears |
| 11.2 | Three levels | Shows: Level 1 (Nudge), Level 2 (Structure), Level 3 (Pseudocode) |
| 11.3 | Progressive unlock | Only current level visible, others grayed/locked |
| 11.4 | Close button | X button hides the hint panel |
| 11.5 | Reset on new problem | Load different problem -- hints reset to all locked |
| 11.6 | Auto-log mistake | Using hint level 3 auto-creates entry in Mistakes panel |

---

## 12. Interview Launcher (SIM-26)

| # | What to test | How to do it |
|---|-------------|-------------|
| 12.1 | Modal opens | Click Interview button in sidebar -- modal with 5 stages appears |
| 12.2 | Technical Coding | Select Technical -- choose topic (arrays, trees, etc.) + difficulty (Easy/Medium/Hard) |
| 12.3 | Phone Screen | Select Phone Screen -- shows "Start Interview" button |
| 12.4 | System Design | Select System Design -- shows 20 topic cards to pick from |
| 12.5 | Custom System Design | "Custom System Design" option -- accepts text prompt |
| 12.6 | Behavioral | Select Behavioral -- shows "Start Interview" button |
| 12.7 | Technical Q&A | Select -- shows 11 category options (JS/TS, React, APIs, etc.) |
| 12.8 | Custom Q&A topic | "Custom Topic" option -- accepts text prompt |
| 12.9 | Start interview | Click "Start Interview" -- timer starts (45 min), mode switches to INTERVIEWER |
| 12.10 | First question | After starting, Claude sends the first interview question |
| 12.11 | Interview pressure | In INTERVIEWER mode, AI gives minimal hints, evaluates like a real interviewer |

---

## 13. Behavioral Interview (SIM-31, SIM-32, SIM-33)

| # | What to test | How to do it |
|---|-------------|-------------|
| 13.1 | 102 questions | Open Behavioral panel -- scroll through questions organized by 8 categories |
| 13.2 | Categories | Leadership, Conflict, Teamwork, Failure, Innovation, etc. |
| 13.3 | Search | Type "leadership" -- filters to matching questions |
| 13.4 | Company filter | Filter by Amazon / Google / Meta -- company-tagged questions shown |
| 13.5 | Level filter | Filter by seniority level -- relevant questions shown |
| 13.6 | Shuffle | Click Shuffle button -- random question displayed |
| 13.7 | Start STAR practice | Click a question -- STAR entry form appears |
| 13.8 | STAR fields | 4 text areas: Situation, Task, Action, Result |
| 13.9 | Save story | Fill all 4 fields, click "Save Story" -- saved to localStorage |
| 13.10 | Red flags | Type passive voice ("mistakes were made") -- red flag warning appears |
| 13.11 | Communication scoring | After saving, see 4-dimension score (Conciseness, Impact, Technical Depth, Self-Awareness) |
| 13.12 | Score colors | Red (0-1) / Amber (2) / Lime (3) / Cyan (4) |
| 13.13 | Saved stories persist | Refresh page, reopen Behavioral -- saved stories still there |

---

## 14. System Design (SIM-28, SIM-29, SIM-56)

| # | What to test | How to do it |
|---|-------------|-------------|
| 14.1 | Enter System Design | Start a System Design interview from launcher |
| 14.2 | Workspace layout | 3 areas: phases sidebar, diagram canvas, chat |
| 14.3 | 7 phases | Requirements, API Contract, Data Model, Architecture, Deepdive, Scaling, Review |
| 14.4 | Phase navigation | Click different phases -- current phase highlighted |
| 14.5 | Component palette | Left side shows draggable components (Database, Cache, Queue, API Gateway, etc.) |
| 14.6 | Drag to create | Drag a "Database" component from palette onto canvas -- node appears |
| 14.7 | Move nodes | Drag existing nodes around the canvas |
| 14.8 | Edit node | Click a node -- edit form appears (change label, properties) |
| 14.9 | Connect nodes | Drag from one node's handle to another -- edge created |
| 14.10 | Edge types | Select edge, change type: sync/async, REST/gRPC, pub-sub |
| 14.11 | Edge labels | Edges show labels (connection type) |
| 14.12 | Delete edge | Select edge, press Delete or use toolbar -- edge removed |
| 14.13 | Auto Layout | Click "Auto Layout" button -- nodes arranged hierarchically via dagre |
| 14.14 | Undo | Click Undo or Ctrl+Z -- last action reverted |
| 14.15 | Redo | Click Redo or Ctrl+Y -- action restored |
| 14.16 | Edge keyboard shortcuts | With edge selected: 1=sync, 2=async, 3=bidirectional, L=add label |
| 14.17 | Export PNG | Click "Export PNG" -- downloads diagram as image file |
| 14.18 | Clear Canvas | Click "Clear" -- confirmation prompt, then all nodes removed |
| 14.19 | AI feedback | Ask AI about your diagram in chat -- should understand the architecture |
| 14.20 | State persistence | Refresh page -- diagram state restored from session storage |

---

## 15. Code Review / Reviewer Mode (SIM-14, SIM-24)

| # | What to test | How to do it |
|---|-------------|-------------|
| 15.1 | Enter review mode | Type `/review` in chat or write code then ask for review |
| 15.2 | Rubric modal | 6-dimension rubric opens: Correctness, Time Complexity, Space Complexity, Code Quality, Edge Cases, Communication |
| 15.3 | Score each dimension | Click 0-4 for each dimension -- all must be scored |
| 15.4 | Submit review | Click Submit -- review recorded to stats |
| 15.5 | Improvement plan | After submit, see actionable suggestions for weak dimensions |
| 15.6 | Auto-include code | `/review` should automatically include your current editor code in the AI prompt |
| 15.7 | Stats update | Check Stats panel -- pattern strength updated based on review score |

---

## 16. Statistics (SIM-13, SIM-57)

| # | What to test | How to do it |
|---|-------------|-------------|
| 16.1 | Stats panel | Open Stats panel -- shows solved count, attempts, success rate |
| 16.2 | Pattern breakdown | Each algorithm pattern shows strength bar |
| 16.3 | Zero handling | Before solving anything -- stats show 0 or "--", not NaN or Infinity |
| 16.4 | After solving | Solve a problem -- solved count increments, pattern strength updates |
| 16.5 | Success rate | Solve 2 out of 3 attempts -- should show ~67% |
| 16.6 | Streak tracking | Solve problems on consecutive days -- streak counter increments |

---

## 17. Mistake Tracker (SIM-12, SIM-69)

| # | What to test | How to do it |
|---|-------------|-------------|
| 17.1 | Auto-log on fail | Run tests that fail -- mistake entry auto-created |
| 17.2 | Auto-log on hint 3 | Use all 3 hints -- mistake entry auto-created |
| 17.3 | Mistake entry | Shows: pattern, problem title, date, description |
| 17.4 | Due for Review | After time passes, mistakes appear in "Due for Review" section |
| 17.5 | SM-2 intervals | Review windows: <1d, 1-3d, 3-7d, etc. |
| 17.6 | Review flow | Click "Review" on a due mistake -- evaluation form appears |
| 17.7 | Score quality | Rate confidence 0-4 -- updates SM-2 schedule |
| 17.8 | Delete with undo | Click trash icon on a mistake -- "Undo" toast appears for 5 seconds |
| 17.9 | Undo works | Click "Undo" in toast -- mistake restored |
| 17.10 | Undo expires | Wait 5 seconds without clicking Undo -- mistake permanently deleted |

---

## 18. Achievements (SIM-37)

| # | What to test | How to do it |
|---|-------------|-------------|
| 18.1 | Panel layout | Open Achievements -- shows total unlocked count (X / 17) |
| 18.2 | 5 categories | Milestones, Streaks, Patterns, Speed, Mastery |
| 18.3 | Achievement badges | Each achievement has icon, name, and locked/unlocked status |
| 18.4 | Unlock toast | Solve a problem for the first time -- toast notification with achievement icon |
| 18.5 | Toast auto-dismiss | Toast disappears after ~4 seconds |
| 18.6 | Activity heatmap | 365-day grid (GitHub-style) showing daily activity |
| 18.7 | Heatmap hover | Hover over a cell -- tooltip shows date + session count |
| 18.8 | Heatmap colors | More activity = darker/brighter color |
| 18.9 | Personal records | Best time, most problems in one day, longest streak |
| 18.10 | Export profile card | Click "Export Profile Card" -- downloads a PNG with stats/achievements |
| 18.11 | PNG contents | Exported image includes achievement badges, stats, heatmap |

---

## 19. Settings (SIM-21)

| # | What to test | How to do it |
|---|-------------|-------------|
| 19.1 | Language selector | 3 buttons: TypeScript / JavaScript / Python -- current highlighted |
| 19.2 | Language change | Switch language -- editor starter code updates to match |
| 19.3 | Font size slider | Drag slider (10px - 24px) -- Monaco editor font changes live |
| 19.4 | Auto-save toggle | Toggle on/off -- controls whether code auto-saves |
| 19.5 | Timer toggle | Toggle show/hide timer |
| 19.6 | Default timer duration | Slider 15-60 mins -- sets initial interview timer |
| 19.7 | Persistence | Change settings, refresh page -- all settings preserved |
| 19.8 | Export Data | Click "Export Data" -- downloads JSON file with all stats/mistakes/sessions |
| 19.9 | Export filename | File named with timestamp (e.g., `sim-export-2026-02-21.json`) |
| 19.10 | Reset All Data | Click "Reset All Data" -- confirmation warning appears |
| 19.11 | Reset confirms | After confirming -- all localStorage cleared, app returns to initial state |

---

## 20. Workspace Layout (SIM-77)

| # | What to test | How to do it |
|---|-------------|-------------|
| 20.1 | Draggable splitter | Grab the vertical divider between chat and editor -- drag left/right to resize |
| 20.2 | Resize cursor | Hover over splitter -- cursor changes to resize icon |
| 20.3 | Collapse chat | Drag splitter all the way left -- chat panel collapses |
| 20.4 | Collapse editor | Drag splitter all the way right -- editor panel collapses |
| 20.5 | Expand bar | When collapsed, an expand bar appears -- click to restore |
| 20.6 | Double-click reset | Double-click the splitter -- resets to 50/50 split |
| 20.7 | Keyboard: Ctrl+[ | Press Ctrl+[ -- collapses/expands chat panel |
| 20.8 | Keyboard: Ctrl+] | Press Ctrl+] -- collapses/expands editor panel |
| 20.9 | Layout persistence | Resize to 30/70, refresh page -- same ratio preserved |
| 20.10 | Mobile view | Resize browser to mobile width -- tabs at bottom ("Mentor Chat" / "Code Editor") |
| 20.11 | Mobile tabs | On mobile, tap tabs -- switches between chat and editor (one visible at a time) |
| 20.12 | Splitter hidden mobile | On mobile width -- splitter not visible |

---

## 21. Voice Features (SIM-26, SIM-60)

> **Requires Chrome or Edge** (Web Speech API)

| # | What to test | How to do it |
|---|-------------|-------------|
| 21.1 | Mic button | Microphone icon visible in chat input area |
| 21.2 | Start recording | Click mic -- starts recording, button shows pulse animation |
| 21.3 | Transcript | Speak -- your words appear in the text input field |
| 21.4 | Stop recording | Click mic again -- recording stops |
| 21.5 | Filler detection | Say "um, so, like, basically" -- filler badge appears showing counts |
| 21.6 | Filler percentage | Badge shows % of filler words vs total words |
| 21.7 | Unsupported browser | Open in Firefox/Safari -- mic button should be disabled or show warning |
| 21.8 | Cleanup on unmount | Navigate away while recording -- no errors, recording stops cleanly |

---

## 22. Billing & Subscriptions (SIM-35, SIM-51)

> **Requires Stripe env vars configured** for full testing

| # | What to test | How to do it |
|---|-------------|-------------|
| 22.1 | Free tier banner | Without subscription, see upgrade banner |
| 22.2 | Message limit | Free tier: send 10 AI messages -- 11th should be blocked with limit error |
| 22.3 | Remaining counter | UI shows "X messages remaining today" as you approach limit |
| 22.4 | Rate limit headers | Check browser DevTools Network tab -- responses include `X-RateLimit-Remaining` |
| 22.5 | Pricing page | Navigate to pricing -- Monthly/Yearly toggle, 3 tiers with features |
| 22.6 | Stripe checkout | Click "Upgrade" -- redirects to Stripe checkout page |
| 22.7 | Successful payment | Complete payment -- subscription active, banner gone, unlimited messages |
| 22.8 | Manage subscription | Click "Manage Subscription" -- opens Stripe customer portal |

> **Without Stripe env vars**: Billing features will be disabled. You should see "Stripe: not configured" in server logs and billing routes will return errors gracefully.

---

## 23. Adaptive Recommendations (SIM-22)

| # | What to test | How to do it |
|---|-------------|-------------|
| 23.1 | `/next` command | Type `/next` -- AI recommends a problem based on your weakness patterns |
| 23.2 | Weakness-based | After failing Array problems, `/next` should suggest more Array problems |
| 23.3 | Difficulty filter | `/next hard` -- recommends a Hard problem |
| 23.4 | Readiness score | Stats panel shows overall readiness score combining pattern strengths |
| 23.5 | Recommended section | Problem list shows "Recommended" section at top |

---

## 24. Real-Time Code Analysis (SIM-23)

| # | What to test | How to do it |
|---|-------------|-------------|
| 24.1 | Auto-analysis triggers | Write code in editor, pause typing -- after debounce delay, AI analyzes your code |
| 24.2 | Anti-pattern detection | Write a nested loop where a hashmap would work -- AI should flag it |
| 24.3 | Inline hints | AI suggestions appear as hints related to your current code, not just chat |
| 24.4 | Debounce timing | Type continuously -- analysis does NOT fire on every keystroke, only after you pause |
| 24.5 | No interference | Analysis running in background shouldn't block typing or other interactions |

---

## 25. System Design Evaluation Rubric (SIM-30)

| # | What to test | How to do it |
|---|-------------|-------------|
| 25.1 | Rubric appears | Complete a system design session, ask for evaluation -- structured rubric shown |
| 25.2 | 6 dimensions | Scalability, Reliability, Data Model, API Design, Trade-offs, Communication |
| 25.3 | Scored 0-4 | Each dimension scored with clear criteria per level |
| 25.4 | Feedback per dimension | Each dimension has specific feedback on what was good/missing |
| 25.5 | Overall score | Combined score calculated from all dimensions |

---

## 26. SEO & Meta Tags (SIM-45)

| # | What to test | How to do it |
|---|-------------|-------------|
| 26.1 | Page title | Check browser tab -- should show meaningful title, not just "Vite + React" |
| 26.2 | Meta description | View page source (Ctrl+U) -- `<meta name="description">` present with real description |
| 26.3 | Open Graph tags | View source -- `og:title`, `og:description`, `og:image` tags present |
| 26.4 | Twitter Cards | View source -- `twitter:card`, `twitter:title`, `twitter:description` present |
| 26.5 | JSON-LD | View source -- `<script type="application/ld+json">` with structured data |
| 26.6 | Semantic HTML | Inspect DOM -- uses `<main>`, `<nav>`, `<section>`, `<article>` appropriately |

---

## 27. Error Handling (SIM-58, SIM-63, SIM-59)

| # | What to test | How to do it |
|---|-------------|-------------|
| 27.1 | ErrorBoundary | If a component crashes, should show error UI (not white screen) |
| 27.2 | Network error | Stop the server, send message -- "Server error" shown, not app crash |
| 27.3 | localStorage full | Fill localStorage to quota, try saving -- no crash (safe wrapper handles it) |
| 27.4 | Stream abort | Click Stop while AI is streaming -- reader released cleanly, no memory leak |
| 27.5 | Invalid problem | Navigate to `/problems/fake-id` -- should handle gracefully |

---

## 28. Accessibility (SIM-66, SIM-67, SIM-68)

| # | What to test | How to do it |
|---|-------------|-------------|
| 28.1 | Button types | Inspect any button in DevTools -- should have `type="button"` |
| 28.2 | Icon-only labels | Hover over icon-only buttons -- tooltip shows label (aria-label set) |
| 28.3 | Toggle states | Toggle switches have `role="switch"` and `aria-checked` in DOM |
| 28.4 | Slider labels | Font size / timer sliders have associated labels |
| 28.5 | Chat aria-live | Inspect chat message list -- has `role="log"` and `aria-live="polite"` |
| 28.6 | Keyboard nav | Tab through the app -- all interactive elements focusable and operable |
| 28.7 | Escape closes modals | Open any modal, press Escape -- modal closes |
| 28.8 | Key props | Open DevTools Console -- no "missing key prop" React warnings |

---

## 29. Performance (SIM-45, SIM-71, SIM-61)

| # | What to test | How to do it |
|---|-------------|-------------|
| 29.1 | Initial load | App loads in < 3 seconds (check DevTools Performance) |
| 29.2 | Code splitting | Network tab shows separate chunks for Monaco, React Flow, etc. |
| 29.3 | Lazy loading | EditorPanel, SystemDesignRouter, InterviewLauncher load on demand |
| 29.4 | Debounced autosave | Type quickly in editor -- no lag, saves are debounced (not on every keystroke) |
| 29.5 | Memoized computations | Open Stats with many entries -- no perceptible lag |
| 29.6 | Test execution speed | Simple test run completes in < 100ms |

---

## 30. Persistence & Session (SIM-56, SIM-63)

| # | What to test | How to do it |
|---|-------------|-------------|
| 30.1 | Code survives refresh | Write code in editor, refresh page -- code still there |
| 30.2 | Problem survives refresh | Load a problem, refresh -- same problem loaded |
| 30.3 | Session state | Check items in gate, use hints, refresh -- all state preserved |
| 30.4 | Settings survive | Change language + font size, refresh -- settings preserved |
| 30.5 | Stats survive | Solve problems, refresh -- stats still accumulated |
| 30.6 | Achievements survive | Unlock achievement, refresh -- still unlocked |
| 30.7 | Multi-problem | Solve problem A, switch to B, switch back to A -- A's code/state restored |

---

## 31. Monitoring (SIM-43, SIM-64)

| # | What to test | How to do it |
|---|-------------|-------------|
| 31.1 | Dev logging | Open browser console -- `logger.log()` outputs appear |
| 31.2 | No prod logging | Set `NODE_ENV=production`, rebuild -- `logger.log()` should be silent |
| 31.3 | Error always logged | `logger.error()` outputs in both dev and prod |
| 31.4 | Request logging | Check server terminal -- each API request logged with method, path, status, duration |
| 31.5 | Health endpoint | `GET /api/health` -- returns uptime, memory, AI backend, node version |
| 31.6 | No debug artifacts | Search browser console for `oo_oo` markers -- should be zero |

---

## Quick Smoke Test (5 minutes)

Run through these 10 steps to verify the app basically works:

1. **Open app** -- landing page renders
2. **Skip auth** -- enter workspace
3. **Load problem** -- click "Two Sum" in problems list
4. **Write code** -- type a solution in the editor
5. **Run tests** -- click Run, see pass/fail results
6. **Chat** -- send "what pattern is this?" -- get streaming response
7. **Hint** -- click `/hint` -- hint panel opens with first hint
8. **Settings** -- change font size -- editor updates
9. **Resize workspace** -- drag splitter left/right
10. **Refresh** -- everything persisted

---

## Known Limitations for Local Dev

- **OAuth** requires Supabase provider configuration (Google/GitHub)
- **Stripe billing** requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` env vars
- **Sentry/PostHog** require DSN/API keys -- features degrade gracefully without them
- **Voice** only works in Chrome/Edge (Web Speech API)
- **Python** execution requires CDN access for Pyodide (~10MB WASM download on first use)
- **AI chat** requires Claude CLI installed and authenticated (`claude login`)

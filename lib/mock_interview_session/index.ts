export type Topic = "arrays" | "strings" | "trees" | "graphs" | "dp" | "design" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionCategory =
  | "mixed"
  | "javascript-typescript"
  | "react-frontend"
  | "web-performance"
  | "apis-backend"
  | "databases"
  | "distributed-systems"
  | "security"
  | "testing-quality"
  | "behavioral-leadership"
  | "product-thinking";

export interface TechnicalQuestion {
  id: string;
  title: string;
  category: Exclude<QuestionCategory, "mixed">;
  seniorPerspective: string;
  listeningPoints: string[];
  tradeoffs: string[];
  redFlags: string[];
  followUps: string[];
}

export interface InterviewProblem {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  difficulty: Difficulty;
  timeMinutes: number;
  followUps: string[];
  hints: string[];
}

export interface SessionConfig {
  topic: Topic;
  difficulty: Difficulty;
  timeLimit: number; // minutes
}

export interface SessionPhase {
  name: string;
  durationMinutes: number;
  instructions: string;
}

const PROBLEMS: InterviewProblem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9`,
    topic: "arrays",
    difficulty: "easy",
    timeMinutes: 20,
    followUps: [
      "What if there are multiple valid pairs?",
      "Can you solve it without extra space?",
      "What if the array is sorted?",
    ],
    hints: [
      "What do you need to find for each element?",
      "Can a hash map help with lookups?",
    ],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) - Initialize with positive capacity
- int get(int key) - Return value if key exists, else -1
- void put(int key, int value) - Update or add key-value pair

Both operations must run in O(1) average time complexity.

Example:
LRUCache cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);    // returns 1
cache.put(3, 3); // evicts key 2
cache.get(2);    // returns -1`,
    topic: "design",
    difficulty: "medium",
    timeMinutes: 35,
    followUps: [
      "How would you make this thread-safe?",
      "What if you need to support TTL (time-to-live)?",
      "How would you implement this for a distributed system?",
    ],
    hints: [
      "What data structure gives O(1) lookup?",
      "How do you track recency order efficiently?",
      "Consider combining a hash map with a linked list.",
    ],
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    description: `Given two words (beginWord and endWord), and a dictionary's word list, find the length of shortest transformation sequence from beginWord to endWord, such that:

1. Only one letter can be changed at a time.
2. Each transformed word must exist in the word list.

Return 0 if there is no such transformation sequence.

Example:
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
Explanation: hit -> hot -> dot -> dog -> cog`,
    topic: "graphs",
    difficulty: "hard",
    timeMinutes: 45,
    followUps: [
      "Can you return the actual path, not just length?",
      "What if you need all shortest paths?",
      "How would you optimize for a very large dictionary?",
    ],
    hints: [
      "Think of words as nodes in a graph.",
      "What type of search finds shortest path in unweighted graph?",
      "How do you efficiently find neighboring words?",
    ],
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].`,
    topic: "arrays",
    difficulty: "medium",
    timeMinutes: 30,
    followUps: [
      "What if intervals are coming in as a stream?",
      "How would you handle inserting a new interval?",
      "Can you do this without sorting?",
    ],
    hints: [
      "What if you process intervals in a specific order?",
      "When do two intervals overlap?",
    ],
  },
  {
    id: "coin-change",
    title: "Coin Change",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.

Example:
Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1`,
    topic: "dp",
    difficulty: "medium",
    timeMinutes: 35,
    followUps: [
      "Can you return the actual coins used?",
      "What if each coin can only be used once?",
      "How does this relate to the knapsack problem?",
    ],
    hints: [
      "Can you break this into smaller subproblems?",
      "What's the minimum coins needed for amount 0? 1? 2?",
      "Think about the recurrence relation.",
    ],
  },
];

const FOLLOW_UP_BANK = {
  scalability: [
    "What if the input is 100x larger?",
    "How would you parallelize this algorithm?",
    "What's the bottleneck in your solution?",
    "What if the data doesn't fit in memory?",
  ],
  production: [
    "How would you test this thoroughly?",
    "What monitoring or logging would you add?",
    "How do you handle malformed input?",
    "What could go wrong in production?",
  ],
  optimization: [
    "Can you reduce the space complexity?",
    "Is there a way to do this in one pass?",
    "What's the best possible time complexity?",
    "Are there any preprocessing steps that could help?",
  ],
  tradeoffs: [
    "What are the tradeoffs of your approach?",
    "Why did you choose this data structure?",
    "When would a different approach be better?",
    "What assumptions are you making?",
  ],
};

const PHASES: SessionPhase[] = [
  {
    name: "Problem Understanding",
    durationMinutes: 3,
    instructions: "Read the problem. Ask clarifying questions about constraints and edge cases.",
  },
  {
    name: "Approach Discussion",
    durationMinutes: 7,
    instructions:
      "Explain your approach. State time/space complexity BEFORE coding. Identify the algorithm pattern.",
  },
  {
    name: "Implementation",
    durationMinutes: 20,
    instructions: "Write clean, working code. Think aloud. Handle edge cases.",
  },
  {
    name: "Testing",
    durationMinutes: 5,
    instructions: "Walk through your code with examples. Identify and fix bugs.",
  },
  {
    name: "Follow-up Discussion",
    durationMinutes: 5,
    instructions: "Answer senior-level follow-up questions about scalability and production.",
  },
];

export class MockInterviewSession {
  private config: SessionConfig;
  private problem: InterviewProblem | null = null;
  private startTime: Date | null = null;

  constructor(topic: Topic = "mixed", difficulty: Difficulty = "medium") {
    this.config = {
      topic,
      difficulty,
      timeLimit: this.getTimeLimit(difficulty),
    };
  }

  private getTimeLimit(difficulty: Difficulty): number {
    const limits: Record<Difficulty, number> = {
      easy: 20,
      medium: 35,
      hard: 45,
    };
    return limits[difficulty];
  }

  selectProblem(): InterviewProblem {
    let candidates = PROBLEMS.filter((p) => p.difficulty === this.config.difficulty);

    if (this.config.topic !== "mixed") {
      candidates = candidates.filter((p) => p.topic === this.config.topic);
    }

    if (candidates.length === 0) {
      candidates = PROBLEMS.filter((p) => p.difficulty === this.config.difficulty);
    }

    this.problem = candidates[Math.floor(Math.random() * candidates.length)];
    return this.problem;
  }

  start(): void {
    this.startTime = new Date();
  }

  getElapsedMinutes(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime.getTime()) / 60000);
  }

  getCurrentPhase(): SessionPhase | null {
    const elapsed = this.getElapsedMinutes();
    let cumulative = 0;

    for (const phase of PHASES) {
      cumulative += phase.durationMinutes;
      if (elapsed < cumulative) {
        return phase;
      }
    }

    return null; // Session complete
  }

  getRandomFollowUp(category?: keyof typeof FOLLOW_UP_BANK): string {
    const categories = category
      ? [category]
      : (Object.keys(FOLLOW_UP_BANK) as (keyof typeof FOLLOW_UP_BANK)[]);

    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = FOLLOW_UP_BANK[selectedCategory];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  formatProblem(): string {
    if (!this.problem) return "No problem selected. Run selectProblem() first.";

    const lines = [
      `\n${"═".repeat(60)}`,
      `MOCK INTERVIEW - ${this.config.difficulty.toUpperCase()}`,
      `${"═".repeat(60)}`,
      "",
      `📋 ${this.problem.title}`,
      `   Topic: ${this.problem.topic} | Time: ${this.problem.timeMinutes} minutes`,
      "",
      "─".repeat(60),
      "",
      this.problem.description,
      "",
      "─".repeat(60),
      "",
      "INSTRUCTIONS:",
      "1. Ask clarifying questions",
      "2. Discuss your approach and complexity BEFORE coding",
      "3. Implement the solution",
      "4. Test with examples and edge cases",
      "",
      `⏱️  Time limit: ${this.problem.timeMinutes} minutes`,
      `${"═".repeat(60)}`,
    ];

    return lines.join("\n");
  }

  formatPhaseGuide(): string {
    const lines = ["\nINTERVIEW PHASES", "═".repeat(40)];

    let cumulative = 0;
    for (const phase of PHASES) {
      lines.push(`\n${phase.name} (${phase.durationMinutes} min)`);
      lines.push(`  ${phase.instructions}`);
      cumulative += phase.durationMinutes;
    }

    lines.push(`\nTotal: ${cumulative} minutes`);
    return lines.join("\n");
  }
}

// ── Technical Questions Bank ─────────────────────────────────────────────────

const TECHNICAL_QUESTIONS: TechnicalQuestion[] = [
  // ── JavaScript & TypeScript Core (12) ──────────────────────────────────────
  {
    id: "js-1",
    title: "Explain the JavaScript event loop and how it handles microtasks vs macrotasks.",
    category: "javascript-typescript",
    seniorPerspective: "Senior engineers must understand concurrency primitives to debug async timing issues.",
    listeningPoints: ["Call stack", "Task queue vs microtask queue", "Promise resolution ordering", "requestAnimationFrame timing"],
    tradeoffs: ["setTimeout(0) vs queueMicrotask vs Promise.resolve().then"],
    redFlags: ["Confuses single-threaded with synchronous", "Cannot explain Promise ordering"],
    followUps: ["How does this affect React state batching?", "What happens if a microtask queues another microtask infinitely?"],
  },
  {
    id: "js-2",
    title: "What are closures, and how do they affect memory management?",
    category: "javascript-typescript",
    seniorPerspective: "Closures are foundational — seniors should discuss both power and pitfalls.",
    listeningPoints: ["Lexical scope capture", "Function factories", "Private state patterns", "Memory leak potential"],
    tradeoffs: ["Encapsulation vs memory overhead", "Closure vs class for stateful logic"],
    redFlags: ["Cannot give a concrete example", "Unaware of memory implications"],
    followUps: ["How do closures interact with garbage collection?", "Show a closure-based memory leak and how to fix it."],
  },
  {
    id: "js-3",
    title: "Compare TypeScript's structural typing with nominal typing. What are the trade-offs?",
    category: "javascript-typescript",
    seniorPerspective: "Type system design choices affect API safety and developer experience.",
    listeningPoints: ["Duck typing", "Structural compatibility", "Branded types workaround", "Declaration merging"],
    tradeoffs: ["Flexibility vs accidental compatibility", "Ergonomics vs strictness"],
    redFlags: ["Thinks TS is nominally typed", "Cannot explain when structural typing causes bugs"],
    followUps: ["How would you implement branded types for UserId vs OrderId?", "When does structural typing bite you in practice?"],
  },
  {
    id: "js-4",
    title: "Explain prototypal inheritance and how it differs from classical OOP.",
    category: "javascript-typescript",
    seniorPerspective: "Understanding JS's object model is essential for debugging and library authoring.",
    listeningPoints: ["Prototype chain", "Object.create vs class syntax", "__proto__ vs prototype", "Delegation pattern"],
    tradeoffs: ["Prototypal flexibility vs classical predictability", "class sugar vs raw prototypes"],
    redFlags: ["Cannot explain prototype chain", "Thinks class keyword changes the inheritance model"],
    followUps: ["How does this affect performance in V8?", "When would you prefer composition over prototypal inheritance?"],
  },
  {
    id: "js-5",
    title: "What is the difference between var, let, and const? Explain hoisting and TDZ.",
    category: "javascript-typescript",
    seniorPerspective: "Scoping semantics are critical for avoiding subtle bugs in complex codebases.",
    listeningPoints: ["Function scope vs block scope", "Temporal Dead Zone", "Hoisting behavior differences", "const immutability misconception"],
    tradeoffs: ["const-by-default discipline vs flexibility"],
    redFlags: ["Says const makes values immutable", "Cannot explain TDZ"],
    followUps: ["Why does const with an object still allow mutation?", "How does hoisting affect debugging?"],
  },
  {
    id: "js-6",
    title: "How do JavaScript modules work? Compare CommonJS, ESM, and their interop challenges.",
    category: "javascript-typescript",
    seniorPerspective: "Module systems affect bundling, tree-shaking, and deployment architecture.",
    listeningPoints: ["Static vs dynamic imports", "Tree-shaking requirements", "require vs import semantics", "Dual package hazard"],
    tradeoffs: ["CJS compatibility vs ESM performance", "Dynamic require flexibility vs static analysis"],
    redFlags: ["Cannot differentiate CJS and ESM", "Unaware of interop issues"],
    followUps: ["How does tree-shaking rely on ESM?", "What problems arise with dual CJS/ESM packages?"],
  },
  {
    id: "js-7",
    title: "Explain async/await, Promise chaining, and error handling strategies.",
    category: "javascript-typescript",
    seniorPerspective: "Async control flow is where most production bugs hide.",
    listeningPoints: ["Promise states", "Error propagation", "Promise.all vs allSettled vs race", "Unhandled rejection handling"],
    tradeoffs: ["Sequential vs parallel execution", "try/catch vs .catch chaining"],
    redFlags: ["Cannot explain unhandled rejections", "Misunderstands await in loops"],
    followUps: ["What happens with await inside a forEach?", "How would you implement a retry with exponential backoff?"],
  },
  {
    id: "js-8",
    title: "What are WeakMap and WeakSet? When would you use them?",
    category: "javascript-typescript",
    seniorPerspective: "Weak references are key to advanced patterns like caching and metadata attachment.",
    listeningPoints: ["Weak references and GC", "Non-enumerable keys", "Use cases: private data, DOM metadata, caching"],
    tradeoffs: ["WeakMap vs Map for object metadata", "Memory safety vs debuggability"],
    redFlags: ["Cannot explain weak reference semantics", "Confuses with regular Map"],
    followUps: ["How would you use WeakMap to avoid memory leaks in a DOM framework?", "Why can't you iterate a WeakMap?"],
  },
  {
    id: "js-9",
    title: "Explain TypeScript generics. How do conditional types and mapped types work?",
    category: "javascript-typescript",
    seniorPerspective: "Advanced type-level programming is a senior TS skill for building type-safe libraries.",
    listeningPoints: ["Generic constraints", "infer keyword", "Distributive conditional types", "Template literal types"],
    tradeoffs: ["Type complexity vs runtime simplicity", "Any/unknown escape hatches vs strict generics"],
    redFlags: ["Cannot write a basic generic function", "Overuses 'any' instead of generics"],
    followUps: ["Implement a DeepPartial type.", "When do conditional types distribute and when don't they?"],
  },
  {
    id: "js-10",
    title: "How does garbage collection work in V8? What causes memory leaks in JS?",
    category: "javascript-typescript",
    seniorPerspective: "Memory management knowledge separates seniors from juniors in production debugging.",
    listeningPoints: ["Mark-and-sweep", "Generational GC", "Common leak sources: closures, event listeners, detached DOM"],
    tradeoffs: ["GC pauses vs memory pressure", "Manual cleanup vs relying on GC"],
    redFlags: ["Thinks JS has no memory issues", "Cannot name a common leak pattern"],
    followUps: ["How would you use Chrome DevTools to find a memory leak?", "What's the difference between shallow and retained size?"],
  },
  {
    id: "js-11",
    title: "What are Proxy and Reflect? Describe real-world use cases.",
    category: "javascript-typescript",
    seniorPerspective: "Meta-programming with Proxy powers reactive systems and validation layers.",
    listeningPoints: ["Trap handlers", "Reflect API symmetry", "Use cases: reactive state, validation, logging", "Performance implications"],
    tradeoffs: ["Proxy transparency vs debugging difficulty", "Performance cost vs flexibility"],
    redFlags: ["Cannot name a trap handler", "Unaware of performance overhead"],
    followUps: ["How does Vue 3 use Proxy for reactivity?", "What are the limitations of Proxy?"],
  },
  {
    id: "js-12",
    title: "Explain the 'this' keyword in JavaScript across different contexts.",
    category: "javascript-typescript",
    seniorPerspective: "Misunderstanding 'this' causes countless bugs — seniors must have this cold.",
    listeningPoints: ["Global, method, constructor, arrow function contexts", "bind/call/apply", "Implicit vs explicit binding"],
    tradeoffs: ["Arrow functions vs regular functions for methods", "Class methods vs standalone functions"],
    redFlags: ["Cannot explain arrow function 'this' behavior", "Confuses binding rules"],
    followUps: ["Why do React class components need bind in constructors?", "What does 'this' refer to in a callback passed to setTimeout?"],
  },

  // ── React / Frontend Architecture (12) ─────────────────────────────────────
  {
    id: "react-1",
    title: "How does React's reconciliation algorithm work? What is the fiber architecture?",
    category: "react-frontend",
    seniorPerspective: "Understanding reconciliation is crucial for debugging performance issues.",
    listeningPoints: ["Virtual DOM diffing", "Fiber nodes as units of work", "Concurrent rendering", "Priority-based scheduling"],
    tradeoffs: ["Virtual DOM overhead vs direct DOM manipulation", "Concurrent mode benefits vs complexity"],
    redFlags: ["Thinks React directly manipulates DOM", "Cannot explain keys' role in reconciliation"],
    followUps: ["How do keys affect reconciliation performance?", "What problems does concurrent rendering solve?"],
  },
  {
    id: "react-2",
    title: "Compare state management approaches: useState, useReducer, Context, Zustand, Redux.",
    category: "react-frontend",
    seniorPerspective: "Choosing the right state tool for the right scope is an architectural decision.",
    listeningPoints: ["Local vs global state", "Render optimization", "Boilerplate vs flexibility", "Server state vs client state"],
    tradeoffs: ["Context re-render cost vs simplicity", "Redux predictability vs verbosity"],
    redFlags: ["Uses global state for everything", "Unaware of Context re-render issues"],
    followUps: ["When would you use React Query instead of Redux?", "How does Zustand avoid Context re-render problems?"],
  },
  {
    id: "react-3",
    title: "What are React Server Components and how do they change the rendering model?",
    category: "react-frontend",
    seniorPerspective: "RSC represents a paradigm shift — seniors must understand the new mental model.",
    listeningPoints: ["Server vs client component boundaries", "Zero bundle size for server components", "Streaming and Suspense", "Data fetching at component level"],
    tradeoffs: ["Reduced client JS vs increased complexity", "Caching behavior differences", "Framework lock-in"],
    redFlags: ["Confuses SSR with RSC", "Cannot explain the 'use client' boundary"],
    followUps: ["How do RSCs handle interactivity?", "What cannot be a server component?"],
  },
  {
    id: "react-4",
    title: "Explain React's hooks rules and why they exist. What happens if you break them?",
    category: "react-frontend",
    seniorPerspective: "Hook rules stem from how React tracks state — understanding the 'why' prevents bugs.",
    listeningPoints: ["Call order dependency", "Linked list of hooks per fiber", "Conditional hook pitfalls", "Custom hook composition"],
    tradeoffs: ["Simplicity of rules vs flexibility", "Hooks vs render props vs HOCs"],
    redFlags: ["Cannot explain WHY hooks must be called in order", "Uses hooks inside conditions"],
    followUps: ["How would you share logic between components without hooks?", "Design a custom hook for debounced search."],
  },
  {
    id: "react-5",
    title: "How do you optimize React rendering performance?",
    category: "react-frontend",
    seniorPerspective: "Performance optimization requires understanding the render cycle deeply.",
    listeningPoints: ["React.memo", "useMemo/useCallback", "Virtualization", "Code splitting", "Profiler usage"],
    tradeoffs: ["Memoization cost vs re-render cost", "Premature optimization vs measured improvement"],
    redFlags: ["Wraps everything in useMemo", "Cannot use React Profiler"],
    followUps: ["When does React.memo hurt performance?", "How would you profile a slow component?"],
  },
  {
    id: "react-6",
    title: "Compare CSR, SSR, SSG, and ISR. When would you use each?",
    category: "react-frontend",
    seniorPerspective: "Rendering strategy choice has major implications for UX, SEO, and infrastructure.",
    listeningPoints: ["TTFB vs TTI tradeoffs", "SEO requirements", "Dynamic vs static content", "Edge rendering"],
    tradeoffs: ["SSR latency vs CSR flexibility", "SSG staleness vs freshness", "ISR revalidation complexity"],
    redFlags: ["Cannot explain when SSR is needed", "Thinks SSG works for all content"],
    followUps: ["How does streaming SSR improve perceived performance?", "What infrastructure does ISR require?"],
  },
  {
    id: "react-7",
    title: "How would you architect a micro-frontend system?",
    category: "react-frontend",
    seniorPerspective: "Micro-frontends solve organizational scaling but add technical complexity.",
    listeningPoints: ["Module federation", "Independent deployment", "Shared dependencies", "Routing integration"],
    tradeoffs: ["Team autonomy vs consistency", "Performance overhead vs independence", "Shared state challenges"],
    redFlags: ["Cannot articulate when micro-frontends are appropriate", "Ignores the downsides"],
    followUps: ["How do you handle shared authentication?", "What problems does Module Federation solve?"],
  },
  {
    id: "react-8",
    title: "Explain the component composition pattern and when to prefer it over prop drilling.",
    category: "react-frontend",
    seniorPerspective: "Good composition is the hallmark of maintainable React code.",
    listeningPoints: ["Children pattern", "Render props", "Compound components", "Slot pattern", "Inversion of control"],
    tradeoffs: ["Composition flexibility vs explicit props", "Discoverability vs power"],
    redFlags: ["Prop drills 5+ levels without considering alternatives", "Cannot explain compound component pattern"],
    followUps: ["Design a compound component API for a Tabs component.", "When is prop drilling actually fine?"],
  },
  {
    id: "react-9",
    title: "How do you handle forms in React? Compare controlled, uncontrolled, and form libraries.",
    category: "react-frontend",
    seniorPerspective: "Form handling at scale is a real architectural challenge in frontend apps.",
    listeningPoints: ["Controlled vs uncontrolled inputs", "React Hook Form vs Formik", "Validation strategies", "Performance with many fields"],
    tradeoffs: ["Controlled precision vs uncontrolled performance", "Library lock-in vs custom solution"],
    redFlags: ["Re-renders entire form on every keystroke without awareness", "No validation strategy"],
    followUps: ["How does React Hook Form avoid unnecessary re-renders?", "How would you build a dynamic form builder?"],
  },
  {
    id: "react-10",
    title: "What is Suspense and how does it work with data fetching and code splitting?",
    category: "react-frontend",
    seniorPerspective: "Suspense unifies loading states — understanding it is key for modern React.",
    listeningPoints: ["Suspense boundaries", "React.lazy for code splitting", "Data fetching integration", "Error boundaries pairing"],
    tradeoffs: ["Granular vs coarse loading states", "Waterfall vs parallel fetching"],
    redFlags: ["Only knows Suspense for lazy loading", "Cannot explain the boundary concept"],
    followUps: ["How do nested Suspense boundaries compose?", "What's the render-as-you-fetch pattern?"],
  },
  {
    id: "react-11",
    title: "How do you implement accessible (a11y) React components?",
    category: "react-frontend",
    seniorPerspective: "Accessibility is a quality and legal requirement — seniors must champion it.",
    listeningPoints: ["ARIA attributes", "Keyboard navigation", "Focus management", "Screen reader testing", "Semantic HTML"],
    tradeoffs: ["Custom components vs native elements", "a11y testing automation vs manual testing"],
    redFlags: ["Treats accessibility as optional", "Uses div for everything"],
    followUps: ["How would you make a custom dropdown accessible?", "What tools do you use for a11y auditing?"],
  },
  {
    id: "react-12",
    title: "Explain the trade-offs between CSS-in-JS, CSS Modules, Tailwind, and vanilla CSS.",
    category: "react-frontend",
    seniorPerspective: "Styling architecture affects performance, DX, and maintainability at scale.",
    listeningPoints: ["Runtime vs build-time CSS", "Specificity management", "Bundle size impact", "Co-location benefits"],
    tradeoffs: ["CSS-in-JS runtime cost vs colocation", "Tailwind utility classes vs semantic CSS", "CSS Modules scoping vs flexibility"],
    redFlags: ["No opinion on styling approach", "Unaware of CSS-in-JS runtime cost"],
    followUps: ["Why are some teams moving away from runtime CSS-in-JS?", "How does Tailwind affect bundle size?"],
  },

  // ── Web Performance (12) ───────────────────────────────────────────────────
  {
    id: "perf-1",
    title: "Explain Core Web Vitals (LCP, FID/INP, CLS). How do you optimize each?",
    category: "web-performance",
    seniorPerspective: "CWV directly affect search ranking and user experience metrics.",
    listeningPoints: ["LCP optimization strategies", "INP vs FID", "Layout shift causes", "Measurement tools"],
    tradeoffs: ["LCP speed vs content richness", "Third-party scripts vs performance"],
    redFlags: ["Cannot name the three CWVs", "No experience measuring them"],
    followUps: ["How do you diagnose a poor INP score?", "What causes layout shifts from web fonts?"],
  },
  {
    id: "perf-2",
    title: "How does the browser render a page? Walk through the critical rendering path.",
    category: "web-performance",
    seniorPerspective: "Understanding the rendering pipeline is the foundation of all web performance work.",
    listeningPoints: ["HTML parsing → DOM", "CSS parsing → CSSOM", "Render tree", "Layout → Paint → Composite", "Reflow triggers"],
    tradeoffs: ["Render-blocking resources vs above-the-fold speed", "Async vs defer for scripts"],
    redFlags: ["Cannot describe the rendering pipeline", "Doesn't know what triggers reflow"],
    followUps: ["What's the difference between reflow and repaint?", "How does GPU compositing improve animation performance?"],
  },
  {
    id: "perf-3",
    title: "What strategies would you use to optimize JavaScript bundle size?",
    category: "web-performance",
    seniorPerspective: "Bundle size directly impacts load time and is a key lever for performance.",
    listeningPoints: ["Code splitting", "Tree shaking", "Dynamic imports", "Bundle analysis tools", "Dependency audit"],
    tradeoffs: ["Granular splitting vs request overhead", "Vendor chunk caching vs freshness"],
    redFlags: ["No experience with bundle analysis", "Ships everything in one bundle"],
    followUps: ["How do you set up route-based code splitting?", "What prevents tree shaking from working?"],
  },
  {
    id: "perf-4",
    title: "Explain caching strategies: HTTP cache, service workers, CDN, and application cache.",
    category: "web-performance",
    seniorPerspective: "Caching is the single most impactful performance optimization.",
    listeningPoints: ["Cache-Control headers", "ETag/If-None-Match", "Service worker cache strategies", "CDN edge caching", "Stale-while-revalidate"],
    tradeoffs: ["Cache freshness vs speed", "CDN cost vs latency reduction"],
    redFlags: ["Cannot explain Cache-Control directives", "No mention of cache invalidation challenges"],
    followUps: ["How do you handle cache invalidation for a deploy?", "When would you use stale-while-revalidate?"],
  },
  {
    id: "perf-5",
    title: "How do you optimize images and media for web performance?",
    category: "web-performance",
    seniorPerspective: "Images are often the largest payload — optimization has outsized impact.",
    listeningPoints: ["Modern formats (WebP, AVIF)", "Responsive images (srcset)", "Lazy loading", "CDN image optimization", "Blur-up placeholders"],
    tradeoffs: ["Format support vs compression", "Quality vs file size", "Lazy loading vs LCP"],
    redFlags: ["Serves unoptimized PNGs", "No awareness of modern formats"],
    followUps: ["How does responsive images with srcset work?", "When does lazy loading hurt LCP?"],
  },
  {
    id: "perf-6",
    title: "What is virtual scrolling and when should you use it?",
    category: "web-performance",
    seniorPerspective: "Rendering large lists is a common performance bottleneck in data-heavy apps.",
    listeningPoints: ["Windowing concept", "Libraries (react-window, tanstack-virtual)", "DOM node recycling", "Variable height handling"],
    tradeoffs: ["Implementation complexity vs performance gain", "Accessibility challenges", "Search/find limitations"],
    redFlags: ["Renders 10,000 DOM nodes without concern", "Unaware of windowing libraries"],
    followUps: ["How do you handle variable-height items?", "What accessibility issues does virtualization introduce?"],
  },
  {
    id: "perf-7",
    title: "Explain resource hints: preload, prefetch, preconnect, dns-prefetch.",
    category: "web-performance",
    seniorPerspective: "Resource hints let you control the browser's fetch priority for critical resources.",
    listeningPoints: ["preload for critical resources", "prefetch for next navigation", "preconnect for third-party origins", "fetchpriority attribute"],
    tradeoffs: ["Over-preloading wastes bandwidth", "Prefetch accuracy vs wasted resources"],
    redFlags: ["Cannot differentiate preload from prefetch", "Never uses resource hints"],
    followUps: ["When does preloading a font help vs hurt?", "How do you decide what to prefetch?"],
  },
  {
    id: "perf-8",
    title: "How do you measure and monitor frontend performance in production?",
    category: "web-performance",
    seniorPerspective: "Lab metrics matter, but real user monitoring reveals the actual experience.",
    listeningPoints: ["RUM vs synthetic monitoring", "Performance Observer API", "p50/p75/p99 percentiles", "Lighthouse CI"],
    tradeoffs: ["RUM sampling rate vs data accuracy", "Monitoring overhead vs visibility"],
    redFlags: ["Only measures in local dev tools", "No production monitoring strategy"],
    followUps: ["How do you set up performance budgets?", "What's the difference between lab and field data?"],
  },
  {
    id: "perf-9",
    title: "What causes long tasks and how do you break them up?",
    category: "web-performance",
    seniorPerspective: "Long tasks block the main thread and directly degrade interactivity (INP).",
    listeningPoints: ["50ms threshold", "Task scheduling with scheduler.yield", "requestIdleCallback", "Web Workers for heavy computation"],
    tradeoffs: ["Task splitting overhead vs responsiveness", "Worker thread communication cost"],
    redFlags: ["Runs heavy computation synchronously", "Unaware of main thread blocking"],
    followUps: ["How does scheduler.yield improve INP?", "When would you use a Web Worker?"],
  },
  {
    id: "perf-10",
    title: "Explain how HTTP/2 and HTTP/3 improve web performance over HTTP/1.1.",
    category: "web-performance",
    seniorPerspective: "Protocol-level improvements have broad impact without code changes.",
    listeningPoints: ["Multiplexing", "Header compression (HPACK)", "Server push", "QUIC (HTTP/3)", "Connection coalescing"],
    tradeoffs: ["HTTP/2 head-of-line blocking vs HTTP/3 QUIC", "Server push usefulness in practice"],
    redFlags: ["Cannot explain multiplexing", "Unaware of HTTP/2 benefits"],
    followUps: ["Why was HTTP/2 server push removed from Chrome?", "How does QUIC handle packet loss differently?"],
  },
  {
    id: "perf-11",
    title: "How do you optimize web font loading?",
    category: "web-performance",
    seniorPerspective: "Fonts are render-blocking and cause layout shifts — a common performance blind spot.",
    listeningPoints: ["font-display strategies", "Subsetting", "Preloading critical fonts", "Variable fonts", "System font stack fallback"],
    tradeoffs: ["FOUT vs FOIT vs FOFT", "Custom fonts vs system fonts", "Subset size vs character coverage"],
    redFlags: ["Loads 5+ font weights without subsetting", "No font-display strategy"],
    followUps: ["When would you use font-display: optional vs swap?", "How do variable fonts reduce total payload?"],
  },
  {
    id: "perf-12",
    title: "What is the difference between debouncing and throttling? When do you use each?",
    category: "web-performance",
    seniorPerspective: "Rate limiting user-triggered events is basic but critical for performance.",
    listeningPoints: ["Debounce delays until inactivity", "Throttle caps frequency", "Use cases: search input vs scroll handler", "Leading vs trailing edge"],
    tradeoffs: ["Responsiveness vs CPU usage", "Leading edge for instant feedback"],
    redFlags: ["Confuses debounce and throttle", "Cannot describe a use case for each"],
    followUps: ["Implement a debounce function.", "When would you use leading-edge throttle?"],
  },

  // ── APIs & Backend (12) ────────────────────────────────────────────────────
  {
    id: "api-1",
    title: "Compare REST, GraphQL, and gRPC. When would you choose each?",
    category: "apis-backend",
    seniorPerspective: "API paradigm choice has long-term implications for frontend-backend coupling.",
    listeningPoints: ["REST resource model", "GraphQL query flexibility", "gRPC performance and type safety", "Over/under-fetching"],
    tradeoffs: ["REST simplicity vs GraphQL flexibility", "gRPC performance vs browser support", "Caching differences"],
    redFlags: ["Cannot articulate tradeoffs between paradigms", "Uses one approach for everything"],
    followUps: ["How does caching differ between REST and GraphQL?", "When does gRPC make sense in a web app?"],
  },
  {
    id: "api-2",
    title: "How do you design a RESTful API? What makes a good API contract?",
    category: "apis-backend",
    seniorPerspective: "API design is user experience for developers — it must be intentional.",
    listeningPoints: ["Resource naming conventions", "HTTP methods semantics", "Status codes", "Pagination", "Versioning", "HATEOAS"],
    tradeoffs: ["URL versioning vs header versioning", "Nested resources vs flat", "Pagination: cursor vs offset"],
    redFlags: ["Uses POST for everything", "Inconsistent naming or status codes"],
    followUps: ["How would you handle breaking changes?", "Design the API for a todo list app."],
  },
  {
    id: "api-3",
    title: "Explain authentication and authorization: JWT, OAuth 2.0, sessions, API keys.",
    category: "apis-backend",
    seniorPerspective: "Auth is security-critical and affects architecture across the stack.",
    listeningPoints: ["JWT structure and stateless auth", "OAuth 2.0 flows", "Session vs token tradeoffs", "Refresh token rotation"],
    tradeoffs: ["JWT statelessness vs revocation difficulty", "Session scalability vs simplicity", "OAuth complexity vs security"],
    redFlags: ["Stores JWT in localStorage without concern", "Cannot explain OAuth flow"],
    followUps: ["How do you handle JWT revocation?", "When would you use sessions over JWTs?"],
  },
  {
    id: "api-4",
    title: "How do you implement rate limiting? Compare algorithms and strategies.",
    category: "apis-backend",
    seniorPerspective: "Rate limiting protects services from abuse and cascade failures.",
    listeningPoints: ["Token bucket", "Sliding window", "Fixed window", "Distributed rate limiting", "Client-side vs server-side"],
    tradeoffs: ["Accuracy vs memory usage", "Per-user vs per-IP vs per-endpoint", "Distributed consistency"],
    redFlags: ["Only knows fixed window", "No distributed rate limiting awareness"],
    followUps: ["How would you implement rate limiting across multiple servers?", "What HTTP headers should rate-limited APIs return?"],
  },
  {
    id: "api-5",
    title: "What are WebSockets and Server-Sent Events? When would you use each?",
    category: "apis-backend",
    seniorPerspective: "Real-time communication is increasingly expected — choosing the right approach matters.",
    listeningPoints: ["Full-duplex vs unidirectional", "Connection lifecycle", "Reconnection handling", "Scaling challenges"],
    tradeoffs: ["WebSocket flexibility vs SSE simplicity", "Polling fallback vs connection cost", "Infrastructure requirements"],
    redFlags: ["Uses polling when real-time is needed", "Cannot explain WebSocket handshake"],
    followUps: ["How do you scale WebSocket connections across servers?", "When is long polling still appropriate?"],
  },
  {
    id: "api-6",
    title: "How do you handle errors in an API? Design a consistent error response format.",
    category: "apis-backend",
    seniorPerspective: "Error handling defines the developer experience and debuggability of an API.",
    listeningPoints: ["Consistent error schema", "HTTP status code semantics", "Error codes vs messages", "Operational vs client errors"],
    tradeoffs: ["Detailed errors vs security information leakage", "Machine-readable codes vs human messages"],
    redFlags: ["Returns 200 for errors", "No consistent error format"],
    followUps: ["How would you handle validation errors for complex forms?", "Should you expose stack traces in production?"],
  },
  {
    id: "api-7",
    title: "Explain middleware patterns in Node.js frameworks (Express, Koa, Fastify).",
    category: "apis-backend",
    seniorPerspective: "Middleware architecture affects request processing, error handling, and testability.",
    listeningPoints: ["Request pipeline", "next() propagation", "Error middleware", "Onion model (Koa)", "Plugin system (Fastify)"],
    tradeoffs: ["Express flexibility vs Fastify performance", "Middleware order sensitivity", "Global vs route-specific middleware"],
    redFlags: ["Cannot explain middleware execution order", "No error handling middleware"],
    followUps: ["How does Fastify's plugin system differ from Express middleware?", "Design a middleware for request logging."],
  },
  {
    id: "api-8",
    title: "How would you implement API versioning and handle backward compatibility?",
    category: "apis-backend",
    seniorPerspective: "Versioning strategy determines how painful breaking changes are for consumers.",
    listeningPoints: ["URL path vs header vs query parameter versioning", "Additive changes", "Deprecation strategy", "Consumer migration"],
    tradeoffs: ["URL versioning simplicity vs header versioning flexibility", "Supporting old versions vs moving fast"],
    redFlags: ["No versioning strategy", "Breaks APIs without notice"],
    followUps: ["How long should you support deprecated API versions?", "What's an additive-only change policy?"],
  },
  {
    id: "api-9",
    title: "Explain idempotency in APIs. Why does it matter and how do you implement it?",
    category: "apis-backend",
    seniorPerspective: "Idempotency prevents duplicate operations and is critical for reliable systems.",
    listeningPoints: ["Idempotency keys", "Safe vs unsafe HTTP methods", "Retry safety", "Database-level guarantees"],
    tradeoffs: ["Implementation complexity vs reliability", "Key storage overhead vs safety"],
    redFlags: ["POST endpoints that create duplicates on retry", "Cannot define idempotency"],
    followUps: ["How would you implement idempotency for a payment API?", "Which HTTP methods are inherently idempotent?"],
  },
  {
    id: "api-10",
    title: "What is an API gateway? When do you need one?",
    category: "apis-backend",
    seniorPerspective: "API gateways are a key architectural component in microservice systems.",
    listeningPoints: ["Request routing", "Authentication offloading", "Rate limiting", "Request transformation", "Service discovery"],
    tradeoffs: ["Single point of failure vs centralized control", "Latency overhead vs operational simplicity"],
    redFlags: ["Cannot explain when a gateway is needed", "Confuses with load balancer"],
    followUps: ["How does an API gateway differ from a reverse proxy?", "What are the risks of a gateway becoming a bottleneck?"],
  },
  {
    id: "api-11",
    title: "How do you implement pagination? Compare cursor, offset, and keyset pagination.",
    category: "apis-backend",
    seniorPerspective: "Pagination strategy affects database performance and client complexity.",
    listeningPoints: ["Offset simplicity vs cursor efficiency", "Keyset pagination for large datasets", "Total count cost", "Consistency during pagination"],
    tradeoffs: ["Offset skip cost vs cursor statefulness", "Client simplicity vs server performance"],
    redFlags: ["Only knows LIMIT/OFFSET", "Unaware of offset pagination issues at scale"],
    followUps: ["Why does offset pagination degrade at high page numbers?", "How does Relay cursor pagination work?"],
  },
  {
    id: "api-12",
    title: "What is CORS and how does it work? How do you configure it securely?",
    category: "apis-backend",
    seniorPerspective: "CORS misconfigurations are a common security vulnerability.",
    listeningPoints: ["Same-origin policy", "Preflight requests", "Access-Control headers", "Credentialed requests"],
    tradeoffs: ["Permissive CORS for DX vs restrictive for security", "Preflight caching vs security freshness"],
    redFlags: ["Sets Access-Control-Allow-Origin: *", "Cannot explain preflight requests"],
    followUps: ["Why shouldn't you use wildcard origin with credentials?", "How do you debug CORS issues?"],
  },

  // ── Databases & Data Modeling (12) ─────────────────────────────────────────
  {
    id: "db-1",
    title: "Compare SQL and NoSQL databases. When would you choose each?",
    category: "databases",
    seniorPerspective: "Database choice is one of the most consequential architectural decisions.",
    listeningPoints: ["ACID vs BASE", "Schema flexibility", "Query patterns", "Scaling models", "Specific engines"],
    tradeoffs: ["SQL consistency vs NoSQL flexibility", "Vertical vs horizontal scaling", "Join performance vs denormalization"],
    redFlags: ["Uses one type for everything", "Cannot explain CAP theorem"],
    followUps: ["When would you use both SQL and NoSQL in the same system?", "How does DynamoDB's key design affect query patterns?"],
  },
  {
    id: "db-2",
    title: "Explain database indexing. How do B-tree and hash indexes work?",
    category: "databases",
    seniorPerspective: "Index strategy makes or breaks database performance at scale.",
    listeningPoints: ["B-tree structure and range queries", "Hash index for equality lookups", "Composite indexes and column order", "Covering indexes"],
    tradeoffs: ["Index write overhead vs read speed", "Index size vs query performance", "Too many vs too few indexes"],
    redFlags: ["Creates indexes randomly", "Cannot explain composite index column order"],
    followUps: ["How does column order matter in a composite index?", "What is a covering index and when does it help?"],
  },
  {
    id: "db-3",
    title: "What are database transactions and isolation levels? Explain ACID properties.",
    category: "databases",
    seniorPerspective: "Transaction semantics are critical for data integrity in concurrent systems.",
    listeningPoints: ["Atomicity, Consistency, Isolation, Durability", "Read committed vs serializable", "Phantom reads, dirty reads", "Optimistic vs pessimistic locking"],
    tradeoffs: ["Higher isolation vs lower throughput", "Optimistic locking for reads vs pessimistic for writes"],
    redFlags: ["Cannot name isolation levels", "Unaware of concurrent access issues"],
    followUps: ["When would you use serializable isolation?", "How does optimistic locking work with version columns?"],
  },
  {
    id: "db-4",
    title: "How do you design a schema for a social media application?",
    category: "databases",
    seniorPerspective: "Data modeling for social graphs reveals understanding of query patterns and scale.",
    listeningPoints: ["User, post, follow relationships", "Fan-out on write vs read", "Denormalization for feeds", "Sharding strategy"],
    tradeoffs: ["Normalized purity vs query performance", "Write amplification vs read speed"],
    redFlags: ["Over-normalizes without considering read patterns", "No sharding consideration"],
    followUps: ["How would you shard the users table?", "Explain fan-out on write for a news feed."],
  },
  {
    id: "db-5",
    title: "Explain database sharding strategies and their tradeoffs.",
    category: "databases",
    seniorPerspective: "Sharding is how databases scale horizontally — wrong choices are expensive to fix.",
    listeningPoints: ["Hash-based vs range-based partitioning", "Shard key selection", "Cross-shard queries", "Rebalancing"],
    tradeoffs: ["Hash distribution vs range query support", "Hotspot risk", "Cross-shard join complexity"],
    redFlags: ["Cannot explain shard key selection criteria", "Unaware of cross-shard query issues"],
    followUps: ["What happens when you choose a bad shard key?", "How do you handle cross-shard transactions?"],
  },
  {
    id: "db-6",
    title: "What is database replication? Compare leader-follower, multi-leader, and leaderless.",
    category: "databases",
    seniorPerspective: "Replication topology affects consistency, availability, and latency.",
    listeningPoints: ["Leader-follower simplicity", "Multi-leader for multi-region", "Leaderless quorum reads/writes", "Replication lag"],
    tradeoffs: ["Consistency vs availability", "Replication lag vs read scalability", "Conflict resolution complexity"],
    redFlags: ["Cannot explain replication lag consequences", "Unaware of conflict resolution needs"],
    followUps: ["How do you handle replication lag in a user-facing feature?", "What conflict resolution strategy would you use for multi-leader?"],
  },
  {
    id: "db-7",
    title: "How do you optimize slow database queries?",
    category: "databases",
    seniorPerspective: "Query optimization is a daily skill for any engineer working with databases.",
    listeningPoints: ["EXPLAIN/ANALYZE", "Index usage", "Query rewriting", "N+1 detection", "Connection pooling"],
    tradeoffs: ["Query complexity vs index overhead", "Denormalization vs maintenance cost"],
    redFlags: ["Never uses EXPLAIN", "Adds indexes without analysis"],
    followUps: ["Walk me through reading an EXPLAIN plan.", "How do you detect and fix N+1 queries?"],
  },
  {
    id: "db-8",
    title: "Explain the CAP theorem and how it applies to real databases.",
    category: "databases",
    seniorPerspective: "CAP understanding guides distributed database selection and configuration.",
    listeningPoints: ["Consistency, Availability, Partition tolerance", "CP vs AP systems", "Real-world examples (Postgres=CP, Cassandra=AP)", "PACELC extension"],
    tradeoffs: ["Strong consistency vs availability during partitions", "Eventual consistency complexity"],
    redFlags: ["Misquotes CAP as choosing 2 of 3 literally", "Cannot map real databases to CAP"],
    followUps: ["Is MongoDB CP or AP?", "What does PACELC add to the CAP model?"],
  },
  {
    id: "db-9",
    title: "What are migrations and how do you manage schema changes safely?",
    category: "databases",
    seniorPerspective: "Schema migrations in production are one of the riskiest operations teams do.",
    listeningPoints: ["Versioned migrations", "Backward compatibility", "Zero-downtime migrations", "Expand/contract pattern"],
    tradeoffs: ["Migration speed vs safety", "Forward-only vs reversible migrations"],
    redFlags: ["Runs ALTER TABLE on production without a plan", "No migration tooling"],
    followUps: ["How do you add a non-nullable column without downtime?", "What's the expand/contract migration pattern?"],
  },
  {
    id: "db-10",
    title: "When and how would you use Redis? What data structures does it offer?",
    category: "databases",
    seniorPerspective: "Redis is ubiquitous — knowing its data structures unlocks powerful patterns.",
    listeningPoints: ["Strings, hashes, lists, sets, sorted sets", "Use cases: caching, sessions, rate limiting, pub/sub", "Persistence (RDB, AOF)", "Cluster mode"],
    tradeoffs: ["Memory cost vs speed", "Persistence overhead vs durability", "Single-threaded model implications"],
    redFlags: ["Only uses Redis as a key-value cache", "Unaware of persistence options"],
    followUps: ["How would you implement a leaderboard with Redis?", "What happens when Redis runs out of memory?"],
  },
  {
    id: "db-11",
    title: "Explain connection pooling and why it matters.",
    category: "databases",
    seniorPerspective: "Connection management is a common source of production outages.",
    listeningPoints: ["Connection overhead", "Pool sizing", "Connection lifecycle", "PgBouncer / ProxySQL"],
    tradeoffs: ["Pool size vs memory usage", "Connection sharing vs isolation"],
    redFlags: ["Opens new connections per request", "Cannot explain why pooling matters"],
    followUps: ["How do you size a connection pool?", "What happens when the pool is exhausted?"],
  },
  {
    id: "db-12",
    title: "What is event sourcing and CQRS? When would you use them?",
    category: "databases",
    seniorPerspective: "Event sourcing and CQRS solve specific problems but add significant complexity.",
    listeningPoints: ["Event log as source of truth", "Read/write model separation", "Event replay", "Eventual consistency"],
    tradeoffs: ["Audit trail vs complexity", "Read optimization vs data duplication", "Event schema evolution"],
    redFlags: ["Wants to use event sourcing for everything", "Cannot explain the eventual consistency challenge"],
    followUps: ["How do you handle event schema versioning?", "When is CQRS overkill?"],
  },

  // ── Distributed Systems (12) ───────────────────────────────────────────────
  {
    id: "dist-1",
    title: "What happens when you type a URL into a browser? Walk through the entire flow.",
    category: "distributed-systems",
    seniorPerspective: "This classic question reveals depth of understanding across the entire stack.",
    listeningPoints: ["DNS resolution", "TCP/TLS handshake", "HTTP request/response", "Browser rendering", "CDN/proxy layers"],
    tradeoffs: ["Connection reuse vs fresh connections", "DNS caching vs staleness"],
    redFlags: ["Skips major steps", "Cannot explain TLS handshake"],
    followUps: ["How does HTTP/2 change this flow?", "What role does a CDN play?"],
  },
  {
    id: "dist-2",
    title: "Explain load balancing algorithms and strategies.",
    category: "distributed-systems",
    seniorPerspective: "Load balancing is fundamental to running reliable distributed services.",
    listeningPoints: ["Round robin, least connections, weighted", "L4 vs L7 load balancing", "Health checks", "Session affinity"],
    tradeoffs: ["Simplicity (round robin) vs intelligence (least connections)", "Session affinity vs even distribution"],
    redFlags: ["Only knows round robin", "Cannot explain L4 vs L7 difference"],
    followUps: ["When does session affinity cause problems?", "How do you handle a backend server failing?"],
  },
  {
    id: "dist-3",
    title: "How do message queues work? Compare Kafka, RabbitMQ, and SQS.",
    category: "distributed-systems",
    seniorPerspective: "Async messaging is the backbone of decoupled, resilient architectures.",
    listeningPoints: ["Producer/consumer model", "At-least-once vs exactly-once", "Ordering guarantees", "Dead letter queues", "Partitioning"],
    tradeoffs: ["Kafka throughput vs RabbitMQ routing", "SQS simplicity vs Kafka features", "Ordering vs parallelism"],
    redFlags: ["Cannot explain delivery guarantees", "No experience with any queue system"],
    followUps: ["How does Kafka maintain ordering within a partition?", "When would you use a dead letter queue?"],
  },
  {
    id: "dist-4",
    title: "Explain the Circuit Breaker pattern and other resilience patterns.",
    category: "distributed-systems",
    seniorPerspective: "Resilience patterns prevent cascading failures in distributed systems.",
    listeningPoints: ["Circuit breaker states (closed/open/half-open)", "Retry with backoff", "Bulkhead", "Timeout", "Fallback"],
    tradeoffs: ["Fast failure vs retry success", "Bulkhead isolation vs resource efficiency"],
    redFlags: ["Retries infinitely without backoff", "No failure handling strategy"],
    followUps: ["How do you configure circuit breaker thresholds?", "What's the difference between bulkhead and circuit breaker?"],
  },
  {
    id: "dist-5",
    title: "What is eventual consistency and how do you design for it?",
    category: "distributed-systems",
    seniorPerspective: "Eventual consistency is unavoidable in distributed systems — seniors must embrace it.",
    listeningPoints: ["Strong vs eventual vs causal consistency", "Conflict resolution", "Read-your-writes pattern", "Anti-entropy"],
    tradeoffs: ["Consistency vs latency", "User experience with stale data vs system complexity"],
    redFlags: ["Assumes strong consistency everywhere", "Cannot give a real-world example"],
    followUps: ["How would you show a user their own writes immediately?", "What conflict resolution strategy would you use for a shopping cart?"],
  },
  {
    id: "dist-6",
    title: "How do microservices communicate? Compare sync and async patterns.",
    category: "distributed-systems",
    seniorPerspective: "Communication patterns define coupling, latency, and failure modes in microservices.",
    listeningPoints: ["REST/gRPC sync calls", "Event-driven async", "Saga pattern", "Choreography vs orchestration"],
    tradeoffs: ["Sync simplicity vs async resilience", "Choreography flexibility vs orchestration visibility"],
    redFlags: ["All sync calls without considering failure modes", "No distributed transaction strategy"],
    followUps: ["When would you use the saga pattern?", "How do you trace requests across microservices?"],
  },
  {
    id: "dist-7",
    title: "Explain distributed caching: strategies, invalidation, and consistency.",
    category: "distributed-systems",
    seniorPerspective: "Caching at the distributed level introduces consistency challenges beyond single-node.",
    listeningPoints: ["Cache-aside, read-through, write-through, write-behind", "Invalidation strategies", "Cache stampede prevention", "Consistent hashing"],
    tradeoffs: ["Write-through consistency vs latency", "Cache-aside simplicity vs stale data risk"],
    redFlags: ["No invalidation strategy", "Unaware of cache stampede"],
    followUps: ["How do you prevent a cache stampede after expiration?", "When would you use write-behind caching?"],
  },
  {
    id: "dist-8",
    title: "What is observability? Compare logging, metrics, and distributed tracing.",
    category: "distributed-systems",
    seniorPerspective: "Observability is how you understand and debug production systems.",
    listeningPoints: ["Three pillars: logs, metrics, traces", "Structured logging", "Trace propagation (OpenTelemetry)", "SLIs/SLOs/SLAs"],
    tradeoffs: ["Observability cost vs debugging speed", "Log volume vs searchability", "Sampling strategies"],
    redFlags: ["Only uses console.log for debugging", "No metrics or tracing awareness"],
    followUps: ["How would you set up SLOs for an API?", "What's the difference between an SLI and an SLO?"],
  },
  {
    id: "dist-9",
    title: "How do you implement service discovery in a microservice architecture?",
    category: "distributed-systems",
    seniorPerspective: "Service discovery is essential plumbing for dynamic microservice environments.",
    listeningPoints: ["Client-side vs server-side discovery", "DNS-based vs registry-based", "Health checking", "Kubernetes service model"],
    tradeoffs: ["DNS simplicity vs registry features", "Client-side flexibility vs server-side simplicity"],
    redFlags: ["Hard-codes service URLs", "No awareness of dynamic environments"],
    followUps: ["How does Kubernetes handle service discovery?", "What happens when a service instance becomes unhealthy?"],
  },
  {
    id: "dist-10",
    title: "Explain consensus algorithms. What is Raft and why does it matter?",
    category: "distributed-systems",
    seniorPerspective: "Consensus underpins leader election, distributed locks, and replicated state machines.",
    listeningPoints: ["Leader election", "Log replication", "Safety guarantees", "Raft vs Paxos simplicity", "Practical usage (etcd, Consul)"],
    tradeoffs: ["Safety vs liveness", "Performance vs consistency guarantees"],
    redFlags: ["Cannot explain why consensus is needed", "No awareness of practical implementations"],
    followUps: ["What happens during a Raft leader election?", "Where is consensus used in Kubernetes?"],
  },
  {
    id: "dist-11",
    title: "How do you deploy software safely? Explain blue-green, canary, and rolling deploys.",
    category: "distributed-systems",
    seniorPerspective: "Deployment strategy directly affects reliability and incident frequency.",
    listeningPoints: ["Blue-green zero-downtime switch", "Canary gradual rollout", "Rolling deploy mechanics", "Feature flags as deployment decoupling"],
    tradeoffs: ["Blue-green cost vs simplicity", "Canary complexity vs safety", "Feature flag tech debt"],
    redFlags: ["Deploys everything at once to production", "No rollback plan"],
    followUps: ["How do you handle database migrations during blue-green deploys?", "What metrics do you watch during a canary rollout?"],
  },
  {
    id: "dist-12",
    title: "What is a CDN and how does it work? When would you NOT use one?",
    category: "distributed-systems",
    seniorPerspective: "CDN architecture knowledge is essential for global-scale applications.",
    listeningPoints: ["Edge caching", "Origin pull vs push", "Cache invalidation", "Edge computing", "Dynamic content at edge"],
    tradeoffs: ["CDN cost vs latency improvement", "Cache hit ratio vs freshness", "Vendor lock-in"],
    redFlags: ["Cannot explain how CDN caching works", "Thinks CDN is only for static assets"],
    followUps: ["When would a CDN hurt rather than help?", "How do you handle cache invalidation with a CDN?"],
  },

  // ── Security (12) ──────────────────────────────────────────────────────────
  {
    id: "sec-1",
    title: "Explain XSS (Cross-Site Scripting). What types exist and how do you prevent them?",
    category: "security",
    seniorPerspective: "XSS is the most common web vulnerability — seniors must prevent it systematically.",
    listeningPoints: ["Stored vs reflected vs DOM-based XSS", "Output encoding", "Content Security Policy", "Framework auto-escaping"],
    tradeoffs: ["CSP strictness vs third-party compatibility", "Auto-escaping vs raw HTML needs"],
    redFlags: ["Uses dangerouslySetInnerHTML without sanitization", "No CSP awareness"],
    followUps: ["How does React prevent XSS by default?", "Write a CSP header for a typical web app."],
  },
  {
    id: "sec-2",
    title: "What is CSRF and how do you protect against it?",
    category: "security",
    seniorPerspective: "CSRF attacks exploit trust in authenticated sessions — prevention is architectural.",
    listeningPoints: ["Attack mechanism", "CSRF tokens", "SameSite cookies", "Double-submit cookie pattern"],
    tradeoffs: ["Token complexity vs SameSite simplicity", "Stateful tokens vs double-submit"],
    redFlags: ["No CSRF protection on state-changing endpoints", "Relies solely on CORS"],
    followUps: ["Why doesn't CORS alone prevent CSRF?", "How does SameSite=Lax differ from Strict?"],
  },
  {
    id: "sec-3",
    title: "How do you store passwords securely?",
    category: "security",
    seniorPerspective: "Password storage done wrong leads to catastrophic breaches.",
    listeningPoints: ["bcrypt/scrypt/argon2", "Salt purpose", "Work factor tuning", "Never storing plaintext or MD5/SHA"],
    tradeoffs: ["Work factor: security vs login latency", "argon2 memory cost vs server resources"],
    redFlags: ["Uses MD5 or SHA for passwords", "No salt", "Stores plaintext"],
    followUps: ["Why is bcrypt better than SHA-256 with a salt?", "How do you choose the right work factor?"],
  },
  {
    id: "sec-4",
    title: "Explain SQL injection and how to prevent it.",
    category: "security",
    seniorPerspective: "SQL injection is preventable but still appears in real applications.",
    listeningPoints: ["Parameterized queries", "ORM protections", "Input validation", "Least privilege database users"],
    tradeoffs: ["ORM convenience vs raw query flexibility", "Stored procedures vs application-level prevention"],
    redFlags: ["Concatenates user input into SQL strings", "Relies on input validation alone"],
    followUps: ["Can an ORM still be vulnerable to injection?", "What is a second-order SQL injection?"],
  },
  {
    id: "sec-5",
    title: "What is the principle of least privilege and how do you apply it?",
    category: "security",
    seniorPerspective: "Least privilege limits blast radius — it's a fundamental security design principle.",
    listeningPoints: ["Scoped permissions", "Service accounts", "IAM policies", "Database user roles", "API key scoping"],
    tradeoffs: ["Granularity vs management complexity", "Developer convenience vs security posture"],
    redFlags: ["Uses root/admin credentials in applications", "No permission scoping"],
    followUps: ["How would you implement least privilege for a microservice?", "What's the blast radius if a service is compromised?"],
  },
  {
    id: "sec-6",
    title: "How does HTTPS work? Explain the TLS handshake.",
    category: "security",
    seniorPerspective: "TLS is the foundation of web security — seniors should understand the mechanics.",
    listeningPoints: ["Certificate verification", "Key exchange", "Symmetric vs asymmetric encryption", "Certificate pinning", "HSTS"],
    tradeoffs: ["Certificate pinning security vs operational overhead", "TLS termination at load balancer vs end-to-end"],
    redFlags: ["Cannot explain why HTTPS is needed", "Disables certificate verification"],
    followUps: ["What is certificate transparency?", "When would you use mTLS?"],
  },
  {
    id: "sec-7",
    title: "What is Content Security Policy (CSP) and how do you configure it?",
    category: "security",
    seniorPerspective: "CSP is a critical defense-in-depth layer against XSS and data exfiltration.",
    listeningPoints: ["Directive types (script-src, style-src, etc.)", "Nonce vs hash approaches", "Report-only mode", "Strict CSP"],
    tradeoffs: ["Strict CSP vs third-party script compatibility", "Report-only rollout vs immediate enforcement"],
    redFlags: ["Sets unsafe-inline everywhere", "No CSP at all"],
    followUps: ["How would you deploy CSP in a large existing application?", "What's a strict CSP and why is it recommended?"],
  },
  {
    id: "sec-8",
    title: "How do you handle secrets management in applications?",
    category: "security",
    seniorPerspective: "Leaked secrets are one of the most common security incidents.",
    listeningPoints: ["Environment variables", "Vault/secret managers", "Rotation policies", "CI/CD secret injection", "Never in source control"],
    tradeoffs: ["Vault complexity vs env var simplicity", "Secret rotation frequency vs operational burden"],
    redFlags: ["Commits secrets to git", "Hard-codes credentials"],
    followUps: ["How do you handle secret rotation without downtime?", "What happens if a secret is accidentally committed?"],
  },
  {
    id: "sec-9",
    title: "Explain the OWASP Top 10. Which vulnerabilities are most relevant today?",
    category: "security",
    seniorPerspective: "OWASP Top 10 is the minimum security knowledge for any web developer.",
    listeningPoints: ["Injection", "Broken authentication", "Sensitive data exposure", "Security misconfiguration", "SSRF"],
    tradeoffs: ["Security investment vs development speed", "Automated scanning vs manual review"],
    redFlags: ["Cannot name more than 2-3 OWASP items", "No security testing in CI/CD"],
    followUps: ["How would you add security scanning to your CI/CD pipeline?", "What's the most overlooked vulnerability in modern apps?"],
  },
  {
    id: "sec-10",
    title: "What is SSRF (Server-Side Request Forgery) and how do you prevent it?",
    category: "security",
    seniorPerspective: "SSRF is increasingly common as applications integrate more services.",
    listeningPoints: ["Attack mechanism (internal network access)", "URL validation", "Allowlisting", "Network segmentation", "Cloud metadata attacks"],
    tradeoffs: ["Allowlist strictness vs feature flexibility", "Network segmentation cost vs protection"],
    redFlags: ["Fetches arbitrary user-provided URLs", "No internal network protection"],
    followUps: ["How can SSRF access cloud metadata endpoints?", "What's the most secure way to handle user-provided URLs?"],
  },
  {
    id: "sec-11",
    title: "How do you implement secure session management?",
    category: "security",
    seniorPerspective: "Session management vulnerabilities enable account takeover.",
    listeningPoints: ["Session ID entropy", "HttpOnly and Secure cookie flags", "Session fixation prevention", "Absolute and idle timeouts"],
    tradeoffs: ["Short timeouts (security) vs long timeouts (UX)", "Server-side vs client-side sessions"],
    redFlags: ["Predictable session IDs", "No HttpOnly flag", "No session expiration"],
    followUps: ["How do you handle session invalidation across devices?", "What is session fixation and how do you prevent it?"],
  },
  {
    id: "sec-12",
    title: "What is supply chain security for npm packages? How do you mitigate risks?",
    category: "security",
    seniorPerspective: "Dependency security is a growing attack vector in the JavaScript ecosystem.",
    listeningPoints: ["Lockfile importance", "npm audit", "Dependency review", "Typosquatting", "Subdependency risks"],
    tradeoffs: ["Pinning versions vs getting security patches", "Private registry cost vs security"],
    redFlags: ["Never audits dependencies", "Installs packages without review"],
    followUps: ["How would you handle a compromised npm package?", "What tools help with supply chain security?"],
  },

  // ── Testing & Quality (12) ─────────────────────────────────────────────────
  {
    id: "test-1",
    title: "Explain the testing pyramid. How do you balance unit, integration, and e2e tests?",
    category: "testing-quality",
    seniorPerspective: "Test strategy determines confidence level and development velocity.",
    listeningPoints: ["Pyramid layers", "Cost and speed tradeoffs", "What each level catches", "Testing trophy alternative"],
    tradeoffs: ["Unit test speed vs integration test confidence", "E2E coverage vs maintenance cost"],
    redFlags: ["Only writes e2e tests", "No testing strategy"],
    followUps: ["When would you prefer the testing trophy over the pyramid?", "What does each test level catch that others miss?"],
  },
  {
    id: "test-2",
    title: "How do you test React components effectively?",
    category: "testing-quality",
    seniorPerspective: "Component testing strategy affects refactoring confidence and development speed.",
    listeningPoints: ["Testing Library philosophy", "Testing behavior vs implementation", "User event simulation", "Async testing patterns"],
    tradeoffs: ["Shallow rendering vs full rendering", "Snapshot tests vs assertion tests"],
    redFlags: ["Tests implementation details", "Uses enzyme's shallow render for everything"],
    followUps: ["Why does Testing Library discourage testing implementation details?", "How do you test a component with async data fetching?"],
  },
  {
    id: "test-3",
    title: "What is TDD? When do you use it and when don't you?",
    category: "testing-quality",
    seniorPerspective: "TDD is a tool, not a religion — knowing when to apply it shows maturity.",
    listeningPoints: ["Red-green-refactor cycle", "Design benefits", "When TDD helps most (algorithms, business logic)", "When to skip it"],
    tradeoffs: ["TDD upfront cost vs long-term quality", "Strict TDD vs test-after for exploratory work"],
    redFlags: ["Dogmatic about always/never using TDD", "Has never tried TDD"],
    followUps: ["Walk me through TDD for a simple function.", "When does TDD slow you down?"],
  },
  {
    id: "test-4",
    title: "How do you mock dependencies in tests? What are the pitfalls?",
    category: "testing-quality",
    seniorPerspective: "Mocking strategy affects test reliability and refactoring safety.",
    listeningPoints: ["Mock, stub, spy differences", "Dependency injection", "Over-mocking risks", "MSW for API mocking"],
    tradeoffs: ["Mock isolation vs integration confidence", "Mock maintenance burden vs test speed"],
    redFlags: ["Mocks everything including the unit under test", "Tests pass but app breaks"],
    followUps: ["When should you use a real dependency instead of a mock?", "How does MSW differ from mocking fetch directly?"],
  },
  {
    id: "test-5",
    title: "How do you implement CI/CD? What does a good pipeline look like?",
    category: "testing-quality",
    seniorPerspective: "CI/CD quality directly affects team velocity and production reliability.",
    listeningPoints: ["Build → lint → test → deploy stages", "Parallelization", "Caching strategies", "Environment promotion", "Rollback automation"],
    tradeoffs: ["Pipeline speed vs thoroughness", "Trunk-based vs feature branch workflows"],
    redFlags: ["No automated testing in pipeline", "Manual deployment process"],
    followUps: ["How do you keep CI/CD pipelines fast?", "What's your rollback strategy if a deploy fails?"],
  },
  {
    id: "test-6",
    title: "What is code coverage? Is 100% coverage a good goal?",
    category: "testing-quality",
    seniorPerspective: "Coverage is a metric, not a goal — seniors understand the nuance.",
    listeningPoints: ["Line vs branch vs path coverage", "Coverage as a floor, not a target", "Meaningful tests vs coverage gaming"],
    tradeoffs: ["Coverage targets vs test quality", "Diminishing returns at high percentages"],
    redFlags: ["Treats 100% coverage as mandatory", "Uses coverage as sole quality metric"],
    followUps: ["What's the difference between line and branch coverage?", "How can you have 100% coverage but still have bugs?"],
  },
  {
    id: "test-7",
    title: "How do you test error handling and edge cases systematically?",
    category: "testing-quality",
    seniorPerspective: "Edge case testing prevents the bugs that reach production.",
    listeningPoints: ["Boundary value analysis", "Error path testing", "Property-based testing", "Chaos engineering principles"],
    tradeoffs: ["Exhaustive edge case testing vs diminishing returns", "Property-based test complexity vs coverage"],
    redFlags: ["Only tests happy path", "No error handling tests"],
    followUps: ["How would you use property-based testing?", "Give me 5 edge cases for a string parsing function."],
  },
  {
    id: "test-8",
    title: "Explain end-to-end testing strategies. Compare Playwright, Cypress, and Selenium.",
    category: "testing-quality",
    seniorPerspective: "E2E tests provide the highest confidence but are expensive to maintain.",
    listeningPoints: ["Browser automation", "Flaky test mitigation", "Test data management", "Parallel execution", "Visual regression"],
    tradeoffs: ["Cypress DX vs Playwright multi-browser", "Selenium flexibility vs modern tool speed"],
    redFlags: ["E2E tests are flaky and ignored", "No e2e tests at all"],
    followUps: ["How do you reduce e2e test flakiness?", "When would you use visual regression testing?"],
  },
  {
    id: "test-9",
    title: "What is contract testing and when would you use it?",
    category: "testing-quality",
    seniorPerspective: "Contract testing prevents integration failures in microservice architectures.",
    listeningPoints: ["Consumer-driven contracts", "Pact framework", "Provider verification", "Schema validation"],
    tradeoffs: ["Contract test maintenance vs integration test alternatives", "Strict contracts vs flexibility"],
    redFlags: ["No integration testing strategy for microservices", "Relies only on e2e for service integration"],
    followUps: ["How does Pact work?", "When is contract testing better than integration testing?"],
  },
  {
    id: "test-10",
    title: "How do you handle flaky tests in a CI pipeline?",
    category: "testing-quality",
    seniorPerspective: "Flaky tests erode team confidence and slow delivery — fixing them is high-impact.",
    listeningPoints: ["Root causes (timing, shared state, external deps)", "Quarantine strategy", "Retry policies", "Deterministic test design"],
    tradeoffs: ["Retry tolerance vs test quality", "Quarantine convenience vs tech debt accumulation"],
    redFlags: ["Ignores flaky tests", "Retries everything without investigation"],
    followUps: ["What's your process for debugging a flaky test?", "How do you prevent tests from depending on execution order?"],
  },
  {
    id: "test-11",
    title: "What is static analysis? How do linting and type checking improve code quality?",
    category: "testing-quality",
    seniorPerspective: "Static analysis catches entire categories of bugs before runtime.",
    listeningPoints: ["ESLint rule categories", "TypeScript strict mode", "Custom lint rules", "Pre-commit hooks"],
    tradeoffs: ["Strict rules vs developer friction", "Custom rules maintenance vs coverage"],
    redFlags: ["Disables linting rules instead of fixing code", "No TypeScript strict mode"],
    followUps: ["What ESLint rules have caught the most bugs for you?", "How does TypeScript strict mode prevent bugs?"],
  },
  {
    id: "test-12",
    title: "How do you approach code review? What makes a good review?",
    category: "testing-quality",
    seniorPerspective: "Code review is the primary quality gate and knowledge sharing mechanism.",
    listeningPoints: ["Review priorities (correctness, design, style)", "Constructive feedback", "Reviewing for maintainability", "Automation vs human review"],
    tradeoffs: ["Thorough review vs velocity", "Strict standards vs team morale"],
    redFlags: ["LGTM without reading", "Only checks style, not logic"],
    followUps: ["What's the most impactful thing to look for in a code review?", "How do you handle disagreements in code review?"],
  },

  // ── Behavioral / Leadership (12) ───────────────────────────────────────────
  {
    id: "lead-1",
    title: "Tell me about a time you had to make a technical decision with incomplete information.",
    category: "behavioral-leadership",
    seniorPerspective: "Seniors must make progress with ambiguity — this reveals decision-making maturity.",
    listeningPoints: ["How they gathered what info they could", "Framework for decision-making", "How they communicated uncertainty", "Outcome and learnings"],
    tradeoffs: ["Speed of decision vs information completeness", "Reversible vs irreversible decisions"],
    redFlags: ["Paralyzed by ambiguity", "Makes decisions without any analysis"],
    followUps: ["How did you communicate the risk to stakeholders?", "What would you do differently?"],
  },
  {
    id: "lead-2",
    title: "How do you handle disagreements on technical approach with your team?",
    category: "behavioral-leadership",
    seniorPerspective: "Healthy conflict resolution is essential for senior engineers.",
    listeningPoints: ["Active listening", "Data-driven arguments", "Disagree-and-commit", "When to escalate"],
    tradeoffs: ["Conviction vs flexibility", "Consensus vs decision speed"],
    redFlags: ["Always defers to authority", "Cannot compromise", "Makes it personal"],
    followUps: ["Give me a specific example.", "What if the team chose the wrong approach — what did you do?"],
  },
  {
    id: "lead-3",
    title: "How do you mentor junior engineers effectively?",
    category: "behavioral-leadership",
    seniorPerspective: "Mentorship is a force multiplier — how seniors approach it reveals leadership style.",
    listeningPoints: ["Teaching vs doing for them", "Creating growth opportunities", "Feedback delivery", "Adjusting to mentee's level"],
    tradeoffs: ["Time investment vs team velocity", "Guidance depth vs independence"],
    redFlags: ["Doesn't mentor", "Just gives answers instead of teaching", "Impatient with questions"],
    followUps: ["How do you know when to step in vs let them struggle?", "Give an example of a successful mentorship outcome."],
  },
  {
    id: "lead-4",
    title: "Describe a situation where you had to push back on a product requirement.",
    category: "behavioral-leadership",
    seniorPerspective: "Seniors must advocate for technical concerns while respecting business needs.",
    listeningPoints: ["How they framed the concern", "Data or evidence used", "Alternative proposals", "Outcome"],
    tradeoffs: ["Technical debt acceptance vs feature delay", "Relationship preservation vs technical integrity"],
    redFlags: ["Never pushes back", "Pushes back without alternatives"],
    followUps: ["How did the PM/stakeholder respond?", "What would you have done if they insisted?"],
  },
  {
    id: "lead-5",
    title: "How do you handle being on-call and production incidents?",
    category: "behavioral-leadership",
    seniorPerspective: "Incident response reveals composure, systematic thinking, and operational maturity.",
    listeningPoints: ["Incident response process", "Communication during incidents", "Postmortem culture", "Prevention strategies"],
    tradeoffs: ["Speed of mitigation vs root cause investigation", "Individual heroics vs team process"],
    redFlags: ["No incident response experience", "Blames others during incidents"],
    followUps: ["Walk me through a recent incident you handled.", "How do you write a good postmortem?"],
  },
  {
    id: "lead-6",
    title: "How do you prioritize technical debt vs feature work?",
    category: "behavioral-leadership",
    seniorPerspective: "Balancing tech debt and features is a core senior engineering responsibility.",
    listeningPoints: ["Quantifying tech debt impact", "Making the case to stakeholders", "Incremental vs big-bang refactoring", "Boy Scout Rule"],
    tradeoffs: ["Short-term velocity vs long-term maintainability", "Perfect code vs shipping"],
    redFlags: ["Ignores tech debt entirely", "Wants to rewrite everything"],
    followUps: ["How do you convince a PM to invest in tech debt?", "Give an example of tech debt that became critical."],
  },
  {
    id: "lead-7",
    title: "Tell me about a project you led from inception to delivery.",
    category: "behavioral-leadership",
    seniorPerspective: "End-to-end project ownership demonstrates senior-level accountability.",
    listeningPoints: ["Scoping and planning", "Stakeholder management", "Risk mitigation", "Team coordination", "Delivery and retrospective"],
    tradeoffs: ["Scope vs timeline", "Quality vs speed"],
    redFlags: ["Cannot describe their specific leadership role", "No mention of risks or challenges"],
    followUps: ["What was the biggest risk and how did you mitigate it?", "What would you do differently next time?"],
  },
  {
    id: "lead-8",
    title: "How do you approach estimating work? How accurate are your estimates?",
    category: "behavioral-leadership",
    seniorPerspective: "Estimation skill affects planning, trust, and delivery predictability.",
    listeningPoints: ["Estimation techniques", "Uncertainty communication", "Buffer for unknowns", "Tracking accuracy over time"],
    tradeoffs: ["Padding estimates vs aggressive targets", "Detailed breakdown vs rough sizing"],
    redFlags: ["Always optimistic estimates", "Never tracks accuracy"],
    followUps: ["How do you handle pressure to give lower estimates?", "What do you do when you realize an estimate is wrong?"],
  },
  {
    id: "lead-9",
    title: "How do you give and receive constructive feedback?",
    category: "behavioral-leadership",
    seniorPerspective: "Feedback is how teams improve — skilled feedback delivery is a leadership requirement.",
    listeningPoints: ["Specific, actionable feedback", "Timely delivery", "Receiving feedback gracefully", "SBI (Situation-Behavior-Impact) model"],
    tradeoffs: ["Directness vs sensitivity", "Public recognition vs private correction"],
    redFlags: ["Avoids giving hard feedback", "Defensive when receiving feedback"],
    followUps: ["Give me an example of difficult feedback you gave.", "How did you act on feedback you disagreed with?"],
  },
  {
    id: "lead-10",
    title: "How do you onboard onto a new codebase or team?",
    category: "behavioral-leadership",
    seniorPerspective: "Onboarding efficiency shows learning ability and systematic thinking.",
    listeningPoints: ["Reading code vs asking questions balance", "Small wins early", "Documentation of learnings", "Relationship building"],
    tradeoffs: ["Speed vs depth of understanding", "Asking questions vs self-discovery"],
    redFlags: ["Waits to be told everything", "Immediately tries to change everything"],
    followUps: ["What's the first thing you do in a new codebase?", "How long before you feel productive?"],
  },
  {
    id: "lead-11",
    title: "Describe a time when you had to say 'no' to a feature or request.",
    category: "behavioral-leadership",
    seniorPerspective: "Saying no strategically is a critical skill that protects team focus and quality.",
    listeningPoints: ["How they framed the 'no'", "Alternative solutions offered", "Stakeholder reaction management", "Outcome"],
    tradeoffs: ["Relationship cost vs technical integrity", "Short-term disappointment vs long-term trust"],
    redFlags: ["Never says no", "Says no without explanation or alternatives"],
    followUps: ["How did the stakeholder react?", "Would you handle it differently now?"],
  },
  {
    id: "lead-12",
    title: "How do you stay current with technology? How do you evaluate new tools?",
    category: "behavioral-leadership",
    seniorPerspective: "Technology evaluation skill prevents hype-driven decisions and ensures informed adoption.",
    listeningPoints: ["Learning sources and habits", "Evaluation criteria for new tools", "POC/spike approach", "Team adoption strategy"],
    tradeoffs: ["Cutting edge vs proven stability", "Learning investment vs immediate productivity"],
    redFlags: ["Adopts every new framework", "Hasn't learned anything new recently"],
    followUps: ["What's a technology you evaluated and decided NOT to adopt?", "How do you convince a team to adopt a new tool?"],
  },

  // ── Product Thinking (12) ──────────────────────────────────────────────────
  {
    id: "prod-1",
    title: "How do you decide what to build? Walk me through your product prioritization process.",
    category: "product-thinking",
    seniorPerspective: "Senior engineers should influence what gets built, not just how.",
    listeningPoints: ["Impact vs effort analysis", "User research input", "Data-driven decisions", "Stakeholder alignment"],
    tradeoffs: ["Quick wins vs strategic investments", "User requests vs platform health"],
    redFlags: ["Builds whatever is asked without questioning", "No framework for prioritization"],
    followUps: ["How do you handle competing priorities from different stakeholders?", "Give an example of a feature you advocated against."],
  },
  {
    id: "prod-2",
    title: "How do you measure the success of a feature you shipped?",
    category: "product-thinking",
    seniorPerspective: "Impact measurement closes the feedback loop and drives continuous improvement.",
    listeningPoints: ["Defining success metrics upfront", "A/B testing", "Quantitative vs qualitative signals", "Iteration based on data"],
    tradeoffs: ["Speed to ship vs measurement rigor", "Leading vs lagging indicators"],
    redFlags: ["Ships and forgets", "No metrics for success"],
    followUps: ["What metrics would you track for a search feature?", "How long do you wait before evaluating results?"],
  },
  {
    id: "prod-3",
    title: "How do you balance user experience with technical constraints?",
    category: "product-thinking",
    seniorPerspective: "This tension is constant — senior engineers navigate it skillfully.",
    listeningPoints: ["Understanding UX goals", "Communicating technical limitations", "Creative alternatives", "Progressive enhancement"],
    tradeoffs: ["Perfect UX vs shipping on time", "Technical ideal vs user needs"],
    redFlags: ["Ignores UX concerns", "Doesn't communicate constraints to design"],
    followUps: ["Give me an example of a creative technical solution to a UX problem.", "When did you compromise UX for technical reasons?"],
  },
  {
    id: "prod-4",
    title: "How do you approach building for accessibility (a11y) as a product concern?",
    category: "product-thinking",
    seniorPerspective: "Accessibility is a product quality dimension, not just a technical checkbox.",
    listeningPoints: ["WCAG standards", "User impact", "Automated vs manual testing", "Inclusive design principles"],
    tradeoffs: ["Accessibility investment vs feature development", "WCAG levels (A, AA, AAA)"],
    redFlags: ["Treats a11y as nice-to-have", "No awareness of legal requirements"],
    followUps: ["How would you advocate for accessibility investment?", "What's the business case for a11y?"],
  },
  {
    id: "prod-5",
    title: "How do you handle feature flags and gradual rollouts?",
    category: "product-thinking",
    seniorPerspective: "Feature flags decouple deployment from release — a key operational practice.",
    listeningPoints: ["Flag types (release, experiment, ops)", "Rollout percentages", "Flag lifecycle", "Technical debt of stale flags"],
    tradeoffs: ["Flag complexity vs deployment safety", "Stale flag debt vs rollback capability"],
    redFlags: ["No gradual rollout strategy", "Flags that never get cleaned up"],
    followUps: ["How do you manage feature flag technical debt?", "When would you NOT use a feature flag?"],
  },
  {
    id: "prod-6",
    title: "How do you think about backward compatibility when evolving a product?",
    category: "product-thinking",
    seniorPerspective: "Backward compatibility decisions affect user trust and migration costs.",
    listeningPoints: ["Deprecation policies", "Migration paths", "Versioning strategies", "Communication to users"],
    tradeoffs: ["Innovation speed vs user disruption", "Supporting old versions vs maintenance cost"],
    redFlags: ["Breaks things without notice", "No migration path"],
    followUps: ["How do you communicate breaking changes to users?", "When is it OK to break backward compatibility?"],
  },
  {
    id: "prod-7",
    title: "How do you approach internationalization (i18n) and localization?",
    category: "product-thinking",
    seniorPerspective: "i18n done late is expensive — thinking about it early shows product maturity.",
    listeningPoints: ["String externalization", "Date/number/currency formatting", "RTL support", "Translation workflow", "Pluralization rules"],
    tradeoffs: ["i18n upfront cost vs retrofit cost", "Library choice impact on bundle size"],
    redFlags: ["Hard-codes strings", "No i18n consideration"],
    followUps: ["What are the hardest i18n problems to solve?", "How do you handle RTL layouts?"],
  },
  {
    id: "prod-8",
    title: "How do you design for offline-first or poor network conditions?",
    category: "product-thinking",
    seniorPerspective: "Network resilience is a product quality that affects real users.",
    listeningPoints: ["Service workers", "Optimistic UI updates", "Sync strategies", "Conflict resolution"],
    tradeoffs: ["Offline capability vs implementation complexity", "Optimistic UI risk vs user perceived speed"],
    redFlags: ["Assumes always-online", "No error handling for network failures"],
    followUps: ["How would you handle conflicting edits when back online?", "When is offline support not worth the investment?"],
  },
  {
    id: "prod-9",
    title: "How do you think about data privacy and GDPR compliance as an engineer?",
    category: "product-thinking",
    seniorPerspective: "Privacy-by-design is a legal and ethical requirement — engineers must understand it.",
    listeningPoints: ["Data minimization", "Consent management", "Right to deletion", "Data retention policies", "Privacy by design"],
    tradeoffs: ["Data collection (analytics) vs privacy", "Compliance cost vs risk"],
    redFlags: ["Collects data without considering privacy", "No awareness of GDPR/CCPA"],
    followUps: ["How would you implement 'right to be forgotten'?", "What data would you avoid collecting entirely?"],
  },
  {
    id: "prod-10",
    title: "How do you approach building a design system?",
    category: "product-thinking",
    seniorPerspective: "Design systems scale UI consistency — building one well requires product and technical thinking.",
    listeningPoints: ["Component API design", "Documentation", "Versioning and publishing", "Adoption strategy", "Token system"],
    tradeoffs: ["Flexibility vs consistency", "Build vs adopt existing (Radix, shadcn)", "Maintenance cost vs reuse benefit"],
    redFlags: ["No shared components", "Copy-pastes UI code everywhere"],
    followUps: ["How do you handle component variants?", "When would you use an existing design system vs building your own?"],
  },
  {
    id: "prod-11",
    title: "How do you approach building for scale from a product perspective?",
    category: "product-thinking",
    seniorPerspective: "Scaling isn't just technical — product decisions affect scalability.",
    listeningPoints: ["Incremental complexity", "MVP scoping", "Feature gating by plan/tier", "Data migration planning"],
    tradeoffs: ["Over-engineering for scale vs YAGNI", "Premium features vs free tier"],
    redFlags: ["Builds for 10M users on day 1", "No scalability consideration at all"],
    followUps: ["How do you decide when to invest in scale vs features?", "Give an example of a product decision that improved scalability."],
  },
  {
    id: "prod-12",
    title: "How do you use analytics and monitoring to inform product decisions?",
    category: "product-thinking",
    seniorPerspective: "Data-informed product development separates shipping features from shipping impact.",
    listeningPoints: ["Event tracking design", "Funnel analysis", "Cohort analysis", "A/B testing rigor", "Privacy-conscious analytics"],
    tradeoffs: ["Analytics depth vs user privacy", "Quantitative data vs qualitative feedback"],
    redFlags: ["Ships without any analytics", "Makes decisions on gut feeling only"],
    followUps: ["How do you design an analytics event schema?", "When should you trust qualitative feedback over quantitative data?"],
  },
];

export function getQuestionsForCategory(
  category: QuestionCategory,
  count: number = 5
): TechnicalQuestion[] {
  let pool: TechnicalQuestion[];

  if (category === "mixed") {
    // Shuffle all questions and pick across categories
    pool = [...TECHNICAL_QUESTIONS].sort(() => Math.random() - 0.5);
  } else {
    pool = TECHNICAL_QUESTIONS.filter((q) => q.category === category).sort(
      () => Math.random() - 0.5
    );
  }

  return pool.slice(0, count);
}

// CLI entry point
const args = process.argv.slice(2);

const topic = (args[0] as Topic) || "mixed";
const difficulty = (args[1] as Difficulty) || "medium";

const session = new MockInterviewSession(topic, difficulty);
const problem = session.selectProblem();

console.log(session.formatProblem());
console.log(session.formatPhaseGuide());

console.log("\n─".repeat(60));
console.log("\nSample follow-up questions you might receive:");
console.log(`  • ${session.getRandomFollowUp("scalability")}`);
console.log(`  • ${session.getRandomFollowUp("production")}`);
console.log(`  • ${session.getRandomFollowUp("optimization")}`);

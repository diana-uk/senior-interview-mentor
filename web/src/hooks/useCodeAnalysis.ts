import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface CodeInsight {
  id: string;
  type: 'anti-pattern' | 'optimization' | 'edge-case' | 'complexity';
  severity: 'info' | 'warning' | 'suggestion';
  message: string;
  detail: string;
  line?: number;
  dismissed: boolean;
}

export interface ComplexityEstimate {
  time: string;
  space: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface UseCodeAnalysisReturn {
  insights: CodeInsight[];
  complexity: ComplexityEstimate | null;
  dismissInsight: (id: string) => void;
  clearDismissed: () => void;
  isAnalyzing: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

let insightCounter = 0;

function generateInsightId(): string {
  insightCounter += 1;
  return `insight-${Date.now()}-${insightCounter}`;
}

/**
 * Create a stable fingerprint for an insight so we can detect duplicates
 * across analysis runs without re-reporting identical findings.
 */
function fingerprint(type: string, message: string, line?: number): string {
  return `${type}::${message}::${line ?? 'global'}`;
}

// ── Detection Rules ────────────────────────────────────────────────────────

interface DetectionRule {
  id: string;
  detect: (code: string, lines: string[]) => Omit<CodeInsight, 'id' | 'dismissed'>[];
}

const DETECTION_RULES: DetectionRule[] = [
  // 1. Nested loops → suggest HashMap/Set
  {
    id: 'nested-loops',
    detect: (_code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];
      // Track open for/while scopes with a simple depth counter
      let loopDepth = 0;
      let outerLoopLine = -1;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        const isLoop =
          /^\s*for\s*\(/.test(lines[i]) ||
          /^\s*for\s*\(/.test(trimmed) ||
          /^\s*while\s*\(/.test(lines[i]) ||
          /^\s*while\s*\(/.test(trimmed) ||
          /\.forEach\s*\(/.test(lines[i]) ||
          /\.map\s*\(/.test(lines[i]) ||
          /\.filter\s*\(/.test(lines[i]) ||
          /\.some\s*\(/.test(lines[i]) ||
          /\.every\s*\(/.test(lines[i]) ||
          /\.reduce\s*\(/.test(lines[i]);

        if (isLoop) {
          loopDepth++;
          if (loopDepth === 1) {
            outerLoopLine = i + 1;
          }
          if (loopDepth >= 2) {
            results.push({
              type: 'anti-pattern',
              severity: 'warning',
              message: 'Nested loop detected — consider HashMap or Set',
              detail:
                'Nested loops often indicate an O(n\u00B2) approach. Consider using a HashMap or Set ' +
                'to achieve O(n) by trading space for time. Build a lookup in the first pass, ' +
                'then query it in the second.',
              line: outerLoopLine,
            });
            // Only report once per nesting level found
            break;
          }
        }

        // Rough brace tracking to know when we exit a loop scope
        const opens = (lines[i].match(/\{/g) || []).length;
        const closes = (lines[i].match(/\}/g) || []).length;
        const netClose = closes - opens;
        if (netClose > 0 && loopDepth > 0) {
          loopDepth = Math.max(0, loopDepth - netClose);
        }
      }

      return results;
    },
  },

  // 2. Array.includes in a loop → suggest Set for O(1) lookup
  {
    id: 'includes-in-loop',
    detect: (_code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];
      let insideLoop = false;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        const isLoopStart =
          /^\s*for\s*\(/.test(trimmed) ||
          /^\s*while\s*\(/.test(trimmed) ||
          /\.forEach\s*\(/.test(trimmed) ||
          /\.map\s*\(/.test(trimmed) ||
          /\.filter\s*\(/.test(trimmed);

        if (isLoopStart) insideLoop = true;

        if (insideLoop && /\.includes\s*\(/.test(lines[i])) {
          results.push({
            type: 'optimization',
            severity: 'suggestion',
            message: 'Array.includes inside a loop is O(n) per call',
            detail:
              'Converting the lookup array to a Set before the loop gives O(1) per lookup, ' +
              'reducing overall complexity from O(n\u00B2) to O(n). ' +
              'Example: const seen = new Set(arr); then seen.has(val).',
            line: i + 1,
          });
          break; // one report is enough
        }

        // Reset on closing brace at depth 0 (rough heuristic)
        if (insideLoop && trimmed === '}') {
          insideLoop = false;
        }
      }

      return results;
    },
  },

  // 3. Missing null/undefined checks on function params
  {
    id: 'missing-null-checks',
    detect: (_code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

      for (let i = 0; i < lines.length; i++) {
        // Match function declarations with parameters
        const fnMatch = lines[i].match(
          /function\s+\w+\s*\(([^)]+)\)/,
        );
        const arrowMatch = lines[i].match(
          /(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(([^)]+)\)\s*(?::\s*\w+)?\s*=>/,
        );

        const params = fnMatch?.[1] || arrowMatch?.[1];
        if (!params) continue;

        // Extract parameter names (strip type annotations)
        const paramNames = params
          .split(',')
          .map((p) => p.trim().replace(/\s*[:?].*$/, '').replace(/\.\.\.\s*/, ''))
          .filter(Boolean);

        if (paramNames.length === 0) continue;

        // Scan the next ~15 lines for null/undefined/length checks
        const bodySlice = lines.slice(i + 1, i + 16).join('\n');
        const hasGuard =
          /(?:if\s*\(\s*!?\w+\s*(?:===?\s*(?:null|undefined|void\s+0)|\?\?|!=))|(?:\w+\s*\?\.)/.test(
            bodySlice,
          ) ||
          /\.length\s*(?:===?\s*0|<|<=|!==?\s*0)/.test(bodySlice) ||
          /(?:if\s*\(\s*!\w+)/.test(bodySlice);

        if (!hasGuard && paramNames.length > 0) {
          results.push({
            type: 'edge-case',
            severity: 'warning',
            message: 'No null/undefined guard for function parameters',
            detail:
              `Parameters [${paramNames.join(', ')}] are used without null/undefined checks. ` +
              'Consider adding early guards like: if (!param) return ...; ' +
              'This prevents runtime errors on edge-case inputs.',
            line: i + 1,
          });
          break; // report once
        }
      }

      return results;
    },
  },

  // 4. No early return → suggest guard clauses
  {
    id: 'no-early-return',
    detect: (code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

      for (let i = 0; i < lines.length; i++) {
        const fnMatch =
          /function\s+\w+\s*\([^)]*\)/.test(lines[i]) ||
          /(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/.test(
            lines[i],
          );

        if (!fnMatch) continue;

        // Check first 10 lines of function body for an early return
        const bodySlice = lines.slice(i + 1, i + 11).join('\n');

        // Look for early return before any significant logic
        const hasEarlyReturn = /^\s*(if\s*\([^)]*\)\s*return|return\s)/.test(bodySlice);

        // Only flag if there's array/string processing (common in interview problems)
        const processesCollection =
          /\.(length|forEach|map|filter|reduce|sort|push|pop|shift|unshift|splice)/.test(code);

        if (!hasEarlyReturn && processesCollection) {
          results.push({
            type: 'edge-case',
            severity: 'suggestion',
            message: 'Consider guard clauses with early returns',
            detail:
              'Adding early returns for edge cases (empty array, null input, single element) ' +
              'makes your code more robust and signals awareness to interviewers. ' +
              'Example: if (nums.length === 0) return [];',
            line: i + 1,
          });
          break;
        }
      }

      return results;
    },
  },

  // 5. String concatenation in a loop → suggest array join
  {
    id: 'string-concat-in-loop',
    detect: (_code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];
      let insideLoop = false;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        const isLoopStart =
          /^\s*for\s*\(/.test(trimmed) ||
          /^\s*while\s*\(/.test(trimmed) ||
          /\.forEach\s*\(/.test(trimmed);

        if (isLoopStart) insideLoop = true;

        if (insideLoop) {
          // Detect += with string or template literal usage
          const concatPattern =
            /\w+\s*\+=\s*(?:['"`]|`.*\$\{)/.test(lines[i]) ||
            /\w+\s*=\s*\w+\s*\+\s*['"`]/.test(lines[i]) ||
            /\w+\s*=\s*['"`].*\+\s*\w+/.test(lines[i]) ||
            /\w+\s*\+=\s*\w+/.test(lines[i]) && /(?:str|string|result|output|ans|res)/i.test(lines[i]);

          if (concatPattern) {
            results.push({
              type: 'optimization',
              severity: 'suggestion',
              message: 'String concatenation in a loop — consider array.join()',
              detail:
                'Repeated string concatenation creates new string objects each iteration, ' +
                'resulting in O(n\u00B2) time for string building. ' +
                'Use an array to collect parts and .join("") at the end for O(n).',
              line: i + 1,
            });
            break;
          }
        }

        if (insideLoop && trimmed === '}') {
          insideLoop = false;
        }
      }

      return results;
    },
  },

  // 6. Sorting then searching → suggest binary search or HashMap
  {
    id: 'sort-then-search',
    detect: (code) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

      const hasSort = /\.sort\s*\(/.test(code);
      const hasLinearSearch =
        /\.find\s*\(/.test(code) ||
        /\.indexOf\s*\(/.test(code) ||
        /\.includes\s*\(/.test(code) ||
        /\.findIndex\s*\(/.test(code);

      if (hasSort && hasLinearSearch) {
        results.push({
          type: 'optimization',
          severity: 'suggestion',
          message: 'Sorting then linear search detected',
          detail:
            'If you sort the data (O(n log n)) but then search linearly (O(n)), ' +
            'consider using binary search on the sorted data (O(log n)) or ' +
            'skip sorting entirely and use a HashMap for O(1) lookups.',
        });
      }

      return results;
    },
  },

  // 7. Multiple array passes → suggest single pass with accumulator
  {
    id: 'multiple-passes',
    detect: (code) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

      // Count distinct chained or separate array method calls
      const passMethods = ['.map(', '.filter(', '.forEach(', '.reduce(', '.find(', '.some(', '.every('];
      let passCount = 0;

      for (const method of passMethods) {
        const occurrences = code.split(method).length - 1;
        passCount += occurrences;
      }

      // Also count explicit for loops
      const forLoops = (code.match(/\bfor\s*\(/g) || []).length;
      passCount += forLoops;

      if (passCount >= 3) {
        results.push({
          type: 'optimization',
          severity: 'info',
          message: 'Multiple array passes detected — could a single pass suffice?',
          detail:
            `Found ${passCount} iterations over data. Consider combining operations into ` +
            'a single pass using reduce() or a for loop with an accumulator object. ' +
            'This reduces constant factors and can improve cache performance.',
        });
      }

      return results;
    },
  },

  // 8. Recursive function without memoization → suggest memo
  {
    id: 'recursive-no-memo',
    detect: (code, lines) => {
      const results: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

      // Find function names
      const fnNames: { name: string; line: number }[] = [];
      for (let i = 0; i < lines.length; i++) {
        const fnDecl = lines[i].match(/function\s+(\w+)\s*\(/);
        const arrowDecl = lines[i].match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
        const name = fnDecl?.[1] || arrowDecl?.[1];
        if (name) {
          fnNames.push({ name, line: i + 1 });
        }
      }

      for (const { name, line } of fnNames) {
        // Check if function calls itself (recursion)
        // Build a regex that looks for the function name followed by ( inside the body
        const selfCallPattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
        const matches = code.match(selfCallPattern);

        // More than 1 match means at least one self-call (first is the declaration)
        if (matches && matches.length >= 2) {
          // Check if memoization is present
          const hasMemo =
            /\bmemo\b/i.test(code) ||
            /\bcache\b/i.test(code) ||
            /\bdp\b/.test(code) ||
            /Map\s*\(\s*\)/.test(code) ||
            /\bweakmap\b/i.test(code) ||
            /\{\s*\}/.test(code) && /\bif\s*\(\s*\w+\s*(?:in|\.has)/.test(code);

          if (!hasMemo) {
            results.push({
              type: 'anti-pattern',
              severity: 'warning',
              message: `Recursive function "${name}" without memoization`,
              detail:
                'This function calls itself recursively but has no visible memoization. ' +
                'Without caching, overlapping subproblems lead to exponential time complexity. ' +
                'Consider adding a Map/object cache: if (memo.has(key)) return memo.get(key);',
              line,
            });
          }
        }
      }

      return results;
    },
  },
];

// ── Complexity Estimation ──────────────────────────────────────────────────

function estimateComplexity(code: string, lines: string[]): ComplexityEstimate | null {
  if (code.trim().length < 20) return null;

  const signals: {
    time: string[];
    space: string[];
    confidence: number;
  } = {
    time: [],
    space: [],
    confidence: 0,
  };

  // Count loop nesting depth
  let maxLoopDepth = 0;
  let currentDepth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    const isLoop =
      /^\s*for\s*\(/.test(trimmed) ||
      /^\s*while\s*\(/.test(trimmed) ||
      /\.forEach\s*\(/.test(trimmed) ||
      /\.map\s*\(/.test(trimmed) ||
      /\.filter\s*\(/.test(trimmed) ||
      /\.reduce\s*\(/.test(trimmed);

    if (isLoop) {
      currentDepth++;
      maxLoopDepth = Math.max(maxLoopDepth, currentDepth);
    }
    if (trimmed === '}' && currentDepth > 0) {
      currentDepth--;
    }
  }

  // Check for sort
  const hasSort = /\.sort\s*\(/.test(code);

  // Check for divide pattern (binary search)
  const hasDivide =
    (/while\s*\(/.test(code) &&
      (/Math\.floor\s*\(/.test(code) || />>/.test(code) || /\/\s*2/.test(code))) ||
    (/mid\s*=/.test(code) && (/left|lo|low|start/i.test(code) && /right|hi|high|end/i.test(code)));

  // Check for recursion
  const fnNames: string[] = [];
  for (const line of lines) {
    const fnDecl = line.match(/function\s+(\w+)\s*\(/);
    const arrowDecl = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/);
    const name = fnDecl?.[1] || arrowDecl?.[1];
    if (name) fnNames.push(name);
  }

  let isRecursive = false;
  for (const name of fnNames) {
    const pattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
    const matches = code.match(pattern);
    if (matches && matches.length >= 2) {
      isRecursive = true;
      break;
    }
  }

  const hasMemo =
    /\bmemo\b/i.test(code) ||
    /\bcache\b/i.test(code) ||
    /\bdp\b/.test(code) ||
    (/Map\s*\(\s*\)/.test(code) && /\.has\s*\(/.test(code));

  // Check for data structure allocations (space)
  const allocatesArray = /new\s+Array|(\[\s*\])/.test(code) && /\.push\s*\(/.test(code);
  const allocatesMap =
    /new\s+Map\s*\(/.test(code) || /new\s+Set\s*\(/.test(code) || /\{\s*\}/.test(code);
  const allocatesMatrix =
    /Array\s*\(\s*\w+\s*\)\s*\.fill/.test(code) || /new\s+Array\s*\(\s*\w+\s*\)/.test(code);

  // ── Time complexity estimation ──

  if (hasDivide && !isRecursive) {
    signals.time.push('O(log n)');
    signals.confidence += 3;
  } else if (hasDivide && maxLoopDepth >= 1) {
    signals.time.push('O(n log n)');
    signals.confidence += 2;
  } else if (isRecursive && !hasMemo) {
    // Two recursive calls without memo → likely exponential
    // Check for two self-calls on the same line (like fib(n-1) + fib(n-2))
    let hasTwoRecCalls = false;
    for (const name of fnNames) {
      const pattern = new RegExp(`\\b${name}\\s*\\([^)]*\\).*\\b${name}\\s*\\(`, 'g');
      if (pattern.test(code)) {
        hasTwoRecCalls = true;
        break;
      }
    }
    if (hasTwoRecCalls) {
      signals.time.push('O(2^n)');
      signals.confidence += 2;
    } else {
      signals.time.push('O(n) or worse');
      signals.confidence += 1;
    }
  } else if (isRecursive && hasMemo) {
    signals.time.push('O(n)');
    signals.confidence += 2;
  } else if (hasSort && maxLoopDepth >= 1) {
    signals.time.push('O(n log n)');
    signals.confidence += 3;
  } else if (hasSort) {
    signals.time.push('O(n log n)');
    signals.confidence += 3;
  } else if (maxLoopDepth >= 3) {
    signals.time.push('O(n\u00B3)');
    signals.confidence += 2;
  } else if (maxLoopDepth === 2) {
    signals.time.push('O(n\u00B2)');
    signals.confidence += 3;
  } else if (maxLoopDepth === 1) {
    signals.time.push('O(n)');
    signals.confidence += 3;
  } else {
    signals.time.push('O(1)');
    signals.confidence += 1;
  }

  // ── Space complexity estimation ──

  if (allocatesMatrix) {
    signals.space.push('O(n\u00B2)');
    signals.confidence += 1;
  } else if (allocatesArray || allocatesMap || hasMemo) {
    signals.space.push('O(n)');
    signals.confidence += 2;
  } else if (isRecursive) {
    signals.space.push('O(n)'); // call stack
    signals.confidence += 1;
  } else {
    signals.space.push('O(1)');
    signals.confidence += 2;
  }

  // Normalize confidence
  let confidence: 'low' | 'medium' | 'high';
  if (signals.confidence >= 5) {
    confidence = 'high';
  } else if (signals.confidence >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    time: signals.time[0] || 'unknown',
    space: signals.space[0] || 'unknown',
    confidence,
  };
}

// ── Main Analysis Function ─────────────────────────────────────────────────

function analyzeCode(code: string): {
  insights: Omit<CodeInsight, 'id' | 'dismissed'>[];
  complexity: ComplexityEstimate | null;
} {
  if (!code || code.trim().length < 10) {
    return { insights: [], complexity: null };
  }

  const lines = code.split('\n');
  const insights: Omit<CodeInsight, 'id' | 'dismissed'>[] = [];

  for (const rule of DETECTION_RULES) {
    try {
      const ruleResults = rule.detect(code, lines);
      insights.push(...ruleResults);
    } catch {
      // Silently skip rules that fail on unusual input
    }
  }

  const complexity = estimateComplexity(code, lines);

  return { insights, complexity };
}

// ── Hook ───────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 2000;

export function useCodeAnalysis(
  code: string,
  enabled: boolean,
): UseCodeAnalysisReturn {
  const [insights, setInsights] = useState<CodeInsight[]>([]);
  const [complexity, setComplexity] = useState<ComplexityEstimate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedFingerprintsRef = useRef<Set<string>>(new Set());

  // Run analysis on code changes with debounce
  useEffect(() => {
    if (!enabled) {
      setInsights([]);
      setComplexity(null);
      setIsAnalyzing(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsAnalyzing(true);

    debounceRef.current = setTimeout(() => {
      const result = analyzeCode(code);

      const currentFingerprints = new Set<string>();

      const newInsights: CodeInsight[] = result.insights.map((raw) => {
        const fp = fingerprint(raw.type, raw.message, raw.line);
        currentFingerprints.add(fp);

        return {
          ...raw,
          id: generateInsightId(),
          dismissed: dismissedFingerprintsRef.current.has(fp),
        };
      });

      // Preserve dismissed state: if a dismissed insight is no longer detected
      // (code changed that area), remove it from the dismissed set
      for (const fp of dismissedFingerprintsRef.current) {
        if (!currentFingerprints.has(fp)) {
          dismissedFingerprintsRef.current.delete(fp);
        }
      }

      setInsights(newInsights);
      setComplexity(result.complexity);
      setIsAnalyzing(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, enabled]);

  const dismissInsight = useCallback((id: string) => {
    setInsights((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        const fp = fingerprint(target.type, target.message, target.line);
        dismissedFingerprintsRef.current.add(fp);
      }
      return prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i));
    });
  }, []);

  const clearDismissed = useCallback(() => {
    dismissedFingerprintsRef.current.clear();
    setInsights((prev) => prev.map((i) => ({ ...i, dismissed: false })));
  }, []);

  return {
    insights,
    complexity,
    dismissInsight,
    clearDismissed,
    isAnalyzing,
  };
}

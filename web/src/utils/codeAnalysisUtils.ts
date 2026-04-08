export interface ComplexityEstimate {
  time: string;
  space: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Create a stable fingerprint for an insight so we can detect duplicates
 * across analysis runs without re-reporting identical findings.
 */
export function fingerprint(type: string, message: string, line?: number): string {
  return `${type}::${message}::${line ?? 'global'}`;
}

/**
 * Estimate time and space complexity from code text and its split lines.
 * Returns null when code is too short to analyze (<20 chars trimmed).
 */
export function estimateComplexity(code: string, lines: string[]): ComplexityEstimate | null {
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

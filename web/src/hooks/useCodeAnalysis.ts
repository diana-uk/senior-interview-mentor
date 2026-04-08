import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fingerprint,
  analyzeCode,
  type CodeInsight,
  type ComplexityEstimate,
} from '../utils/codeAnalysisUtils.js';
export type { ComplexityEstimate, CodeInsight } from '../utils/codeAnalysisUtils.js';

// ── Types ──────────────────────────────────────────────────────────────────

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
      // Use timeout to avoid synchronous setState in effect body
      const clearTimer = setTimeout(() => {
        setInsights([]);
        setComplexity(null);
        setIsAnalyzing(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Use microtask to avoid synchronous setState in effect body
    queueMicrotask(() => setIsAnalyzing(true));

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

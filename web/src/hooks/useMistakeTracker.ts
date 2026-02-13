import { useState, useCallback } from 'react';
import type { MistakeEntryFull, PatternName } from '../types';

const STORAGE_KEY = 'sim-mistakes';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/** SM-2 spaced repetition algorithm */
function sm2(
  quality: number, // 0-5 (0-2 = fail, 3-5 = pass)
  repetitions: number,
  easeFactor: number,
  interval: number,
): { repetitions: number; easeFactor: number; interval: number } {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  if (quality < 3) {
    // Failed: reset
    return { repetitions: 0, easeFactor: newEF, interval: 1 };
  }

  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  return { repetitions: repetitions + 1, easeFactor: newEF, interval: newInterval };
}

function loadMistakes(): MistakeEntryFull[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMistakes(mistakes: MistakeEntryFull[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch {
    // quota exceeded — silently ignore
  }
}

export interface UseMistakeTrackerReturn {
  mistakes: MistakeEntryFull[];
  dueForReview: MistakeEntryFull[];
  addMistake: (params: {
    pattern: PatternName;
    problemId: string | null;
    problemTitle: string;
    description: string;
  }) => void;
  reviewMistake: (id: string, quality: number) => void;
  removeMistake: (id: string) => void;
  clearAll: () => void;
  getMistakesByPattern: () => Record<string, MistakeEntryFull[]>;
  getWeakPatterns: () => { pattern: PatternName; count: number; avgStreak: number }[];
}

export function useMistakeTracker(): UseMistakeTrackerReturn {
  const [mistakes, setMistakes] = useState<MistakeEntryFull[]>(loadMistakes);

  const persist = useCallback((updated: MistakeEntryFull[]) => {
    setMistakes(updated);
    saveMistakes(updated);
  }, []);

  const addMistake = useCallback(
    (params: {
      pattern: PatternName;
      problemId: string | null;
      problemTitle: string;
      description: string;
    }) => {
      const now = today();
      const entry: MistakeEntryFull = {
        id: generateId(),
        pattern: params.pattern,
        problemId: params.problemId,
        problemTitle: params.problemTitle,
        description: params.description,
        createdAt: now,
        nextReview: addDays(now, 1),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        streak: 0,
      };
      persist([entry, ...loadMistakes()]);
    },
    [persist],
  );

  const reviewMistake = useCallback(
    (id: string, quality: number) => {
      const current = loadMistakes();
      const updated = current.map((m) => {
        if (m.id !== id) return m;
        const result = sm2(quality, m.repetitions, m.easeFactor, m.interval);
        return {
          ...m,
          ...result,
          nextReview: addDays(today(), result.interval),
          streak: quality >= 3 ? m.streak + 1 : 0,
        };
      });
      persist(updated);
    },
    [persist],
  );

  const removeMistake = useCallback(
    (id: string) => {
      persist(loadMistakes().filter((m) => m.id !== id));
    },
    [persist],
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const dueForReview = mistakes.filter((m) => m.nextReview <= today());

  const getMistakesByPattern = useCallback(() => {
    const grouped: Record<string, MistakeEntryFull[]> = {};
    for (const m of mistakes) {
      if (!grouped[m.pattern]) grouped[m.pattern] = [];
      grouped[m.pattern].push(m);
    }
    return grouped;
  }, [mistakes]);

  const getWeakPatterns = useCallback(() => {
    const byPattern = getMistakesByPattern();
    return Object.entries(byPattern)
      .map(([pattern, entries]) => ({
        pattern: pattern as PatternName,
        count: entries.length,
        avgStreak:
          entries.reduce((sum, e) => sum + e.streak, 0) / entries.length,
      }))
      .sort((a, b) => a.avgStreak - b.avgStreak); // weakest first
  }, [getMistakesByPattern]);

  return {
    mistakes,
    dueForReview,
    addMistake,
    reviewMistake,
    removeMistake,
    clearAll,
    getMistakesByPattern,
    getWeakPatterns,
  };
}

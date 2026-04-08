import { useState, useCallback } from 'react';
import type { MistakeEntryFull, PatternName } from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage.js';
import { sm2, addDays } from '../utils/sm2.js';

const STORAGE_KEY = 'sim-mistakes';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function loadMistakes(): MistakeEntryFull[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMistakes(mistakes: MistakeEntryFull[]): void {
  safeSetItem(STORAGE_KEY, JSON.stringify(mistakes));
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

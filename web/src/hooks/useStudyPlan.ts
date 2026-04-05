import { useState, useCallback } from 'react';
import type { Pace, StudyPlanTemplate } from '../data/studyPlans';
import { PACE_CONFIG } from '../data/studyPlans';
import { allFullProblems } from '../data/problems/index';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage.js';

const STORAGE_KEY = 'sim-study-plan';

export interface ActiveStudyPlan {
  templateId: string;
  name: string;
  startDate: string;   // ISO date (YYYY-MM-DD)
  pace: Pace;
  problemIds: string[];
  completedIds: string[];
  reminderTime: string | null;  // HH:MM or null
}

function load(): ActiveStudyPlan | null {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActiveStudyPlan) : null;
  } catch {
    return null;
  }
}

function save(plan: ActiveStudyPlan | null) {
  if (plan) {
    safeSetItem(STORAGE_KEY, JSON.stringify(plan));
  } else {
    safeRemoveItem(STORAGE_KEY);
  }
}

/** Returns today's date as YYYY-MM-DD */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Pick problem IDs for the given template (stable ordering) */
function resolveProblemIds(template: StudyPlanTemplate): string[] {
  const filtered = template.patterns
    ? allFullProblems.filter((p) => template.patterns!.includes(p.group))
    : allFullProblems;
  // Sort Easy → Medium → Hard for a nice progression
  const order = { Easy: 0, Medium: 1, Hard: 2 } as Record<string, number>;
  return [...filtered]
    .sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1))
    .map((p) => p.id);
}

export function useStudyPlan() {
  const [activePlan, setActivePlan] = useState<ActiveStudyPlan | null>(load);

  const startPlan = useCallback((template: StudyPlanTemplate, pace: Pace) => {
    const plan: ActiveStudyPlan = {
      templateId: template.id,
      name: template.name,
      startDate: today(),
      pace,
      problemIds: resolveProblemIds(template),
      completedIds: [],
      reminderTime: null,
    };
    save(plan);
    setActivePlan(plan);
  }, []);

  const stopPlan = useCallback(() => {
    save(null);
    setActivePlan(null);
  }, []);

  const markComplete = useCallback((problemId: string) => {
    setActivePlan((prev) => {
      if (!prev || prev.completedIds.includes(problemId)) return prev;
      const next = { ...prev, completedIds: [...prev.completedIds, problemId] };
      save(next);
      return next;
    });
  }, []);

  const setReminderTime = useCallback((time: string | null) => {
    setActivePlan((prev) => {
      if (!prev) return prev;
      const next = { ...prev, reminderTime: time };
      save(next);
      return next;
    });
  }, []);

  const getTodayProblems = useCallback((): string[] => {
    if (!activePlan) return [];
    const { problemIds, pace, completedIds } = activePlan;
    const perDay = PACE_CONFIG[pace].problemsPerDay;
    // Return the next N uncompleted problems from the ordered list
    const remaining = problemIds.filter((id) => !completedIds.includes(id));
    return remaining.slice(0, perDay);
  }, [activePlan]);

  const getProgress = useCallback((): { completed: number; total: number; pct: number } => {
    if (!activePlan) return { completed: 0, total: 0, pct: 0 };
    const { problemIds, completedIds } = activePlan;
    const completed = completedIds.length;
    const total = problemIds.length;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [activePlan]);

  return { activePlan, startPlan, stopPlan, markComplete, setReminderTime, getTodayProblems, getProgress };
}

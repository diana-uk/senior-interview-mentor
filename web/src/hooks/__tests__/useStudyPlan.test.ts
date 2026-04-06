import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStudyPlan } from '../useStudyPlan';
import type { StudyPlanTemplate, Pace } from '../../data/studyPlans';

// Mock storage
vi.mock('../../utils/storage', () => {
  let store: Record<string, string> = {};
  return {
    safeGetItem: (key: string) => store[key] ?? null,
    safeSetItem: (key: string, value: string) => { store[key] = value; },
    safeRemoveItem: (key: string) => { delete store[key]; },
    __resetStore: () => { store = {}; },
  };
});

import * as storage from '../../utils/storage';

// Mock allFullProblems to control the problem list
vi.mock('../../data/problems/index', () => ({
  allFullProblems: [
    { id: 'p1', group: 'HashMap', difficulty: 'Easy', title: 'P1', slug: 'p1', description: '', constraints: [], examples: [], starterCode: { typescript: '', python: '' }, testCode: { typescript: '', python: '' }, hints: [], patterns: [], companies: [] },
    { id: 'p2', group: 'HashMap', difficulty: 'Medium', title: 'P2', slug: 'p2', description: '', constraints: [], examples: [], starterCode: { typescript: '', python: '' }, testCode: { typescript: '', python: '' }, hints: [], patterns: [], companies: [] },
    { id: 'p3', group: 'Sliding Window', difficulty: 'Hard', title: 'P3', slug: 'p3', description: '', constraints: [], examples: [], starterCode: { typescript: '', python: '' }, testCode: { typescript: '', python: '' }, hints: [], patterns: [], companies: [] },
    { id: 'p4', group: 'Trees', difficulty: 'Easy', title: 'P4', slug: 'p4', description: '', constraints: [], examples: [], starterCode: { typescript: '', python: '' }, testCode: { typescript: '', python: '' }, hints: [], patterns: [], companies: [] },
    { id: 'p5', group: 'Trees', difficulty: 'Medium', title: 'P5', slug: 'p5', description: '', constraints: [], examples: [], starterCode: { typescript: '', python: '' }, testCode: { typescript: '', python: '' }, hints: [], patterns: [], companies: [] },
  ],
}));

const TEMPLATE_ALL: StudyPlanTemplate = {
  id: 'test-all',
  name: 'Test All',
  description: 'All problems',
  durationDays: 30,
  // no patterns filter → uses all problems
};

const TEMPLATE_FILTERED: StudyPlanTemplate = {
  id: 'test-filtered',
  name: 'Test Filtered',
  description: 'HashMap only',
  durationDays: 7,
  patterns: ['HashMap'],
};

const NORMAL_PACE: Pace = 'normal'; // 2 problems/day
const RELAXED_PACE: Pace = 'relaxed'; // 1 problem/day
const INTENSE_PACE: Pace = 'intense'; // 5 problems/day

beforeEach(() => {
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('useStudyPlan', () => {
  describe('initial state', () => {
    it('activePlan is null when nothing is stored', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(result.current.activePlan).toBeNull();
    });

    it('loads persisted plan from storage on mount', () => {
      const plan = {
        templateId: 'blind75', name: 'Blind 75', startDate: '2026-01-01',
        pace: 'normal', problemIds: ['p1', 'p2'], completedIds: [], reminderTime: null,
      };
      storage.safeSetItem('sim-study-plan', JSON.stringify(plan));
      const { result } = renderHook(() => useStudyPlan());
      expect(result.current.activePlan?.templateId).toBe('blind75');
      expect(result.current.activePlan?.problemIds).toEqual(['p1', 'p2']);
    });

    it('returns null when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-study-plan', 'bad-json');
      const { result } = renderHook(() => useStudyPlan());
      expect(result.current.activePlan).toBeNull();
    });
  });

  describe('startPlan', () => {
    it('sets activePlan with correct templateId and name', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      expect(result.current.activePlan?.templateId).toBe('test-all');
      expect(result.current.activePlan?.name).toBe('Test All');
    });

    it('sets pace on the plan', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, RELAXED_PACE); });
      expect(result.current.activePlan?.pace).toBe('relaxed');
    });

    it('sets startDate to today (YYYY-MM-DD)', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      const todayStr = new Date().toISOString().split('T')[0];
      expect(result.current.activePlan?.startDate).toBe(todayStr);
    });

    it('starts with empty completedIds', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      expect(result.current.activePlan?.completedIds).toEqual([]);
    });

    it('starts with null reminderTime', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      expect(result.current.activePlan?.reminderTime).toBeNull();
    });

    it('populates problemIds for unfiltered template', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      expect(result.current.activePlan?.problemIds.length).toBe(5);
    });

    it('filters problemIds by template.patterns', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); });
      const ids = result.current.activePlan?.problemIds ?? [];
      expect(ids).toContain('p1');
      expect(ids).toContain('p2');
      expect(ids).not.toContain('p3');
      expect(ids).not.toContain('p4');
    });

    it('sorts problem IDs Easy → Medium → Hard', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      const ids = result.current.activePlan?.problemIds ?? [];
      // p1 (Easy), p4 (Easy) come before p2 (Medium), p5 (Medium) before p3 (Hard)
      const p1Idx = ids.indexOf('p1');
      const p2Idx = ids.indexOf('p2');
      const p3Idx = ids.indexOf('p3');
      expect(p1Idx).toBeLessThan(p3Idx);
      expect(p2Idx).toBeLessThan(p3Idx);
    });

    it('persists plan to storage', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      const stored = JSON.parse(storage.safeGetItem('sim-study-plan') ?? 'null');
      expect(stored).not.toBeNull();
      expect(stored.templateId).toBe('test-all');
    });

    it('replaces an existing plan', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, RELAXED_PACE); });
      expect(result.current.activePlan?.templateId).toBe('test-filtered');
      expect(result.current.activePlan?.pace).toBe('relaxed');
    });
  });

  describe('stopPlan', () => {
    it('sets activePlan to null', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.stopPlan(); });
      expect(result.current.activePlan).toBeNull();
    });

    it('removes plan from storage', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.stopPlan(); });
      expect(storage.safeGetItem('sim-study-plan')).toBeNull();
    });

    it('is a no-op when there is no active plan', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(() => act(() => { result.current.stopPlan(); })).not.toThrow();
      expect(result.current.activePlan).toBeNull();
    });
  });

  describe('markComplete', () => {
    it('adds problemId to completedIds', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.markComplete('p1'); });
      expect(result.current.activePlan?.completedIds).toContain('p1');
    });

    it('persists completedIds to storage', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.markComplete('p1'); });
      const stored = JSON.parse(storage.safeGetItem('sim-study-plan') ?? 'null');
      expect(stored.completedIds).toContain('p1');
    });

    it('can mark multiple problems complete', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.markComplete('p1'); });
      act(() => { result.current.markComplete('p2'); });
      expect(result.current.activePlan?.completedIds).toEqual(['p1', 'p2']);
    });

    it('does not duplicate an already-completed problem', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.markComplete('p1'); });
      act(() => { result.current.markComplete('p1'); });
      expect(result.current.activePlan?.completedIds.filter((id) => id === 'p1').length).toBe(1);
    });

    it('is a no-op when there is no active plan', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(() => act(() => { result.current.markComplete('p1'); })).not.toThrow();
    });
  });

  describe('setReminderTime', () => {
    it('sets a reminder time', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.setReminderTime('09:00'); });
      expect(result.current.activePlan?.reminderTime).toBe('09:00');
    });

    it('clears reminder time when set to null', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.setReminderTime('09:00'); });
      act(() => { result.current.setReminderTime(null); });
      expect(result.current.activePlan?.reminderTime).toBeNull();
    });

    it('persists reminder time to storage', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      act(() => { result.current.setReminderTime('18:30'); });
      const stored = JSON.parse(storage.safeGetItem('sim-study-plan') ?? 'null');
      expect(stored.reminderTime).toBe('18:30');
    });

    it('is a no-op when there is no active plan', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(() => act(() => { result.current.setReminderTime('09:00'); })).not.toThrow();
    });
  });

  describe('getTodayProblems', () => {
    it('returns [] when no plan is active', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(result.current.getTodayProblems()).toEqual([]);
    });

    it('returns up to problemsPerDay uncompleted problems (relaxed = 1)', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, RELAXED_PACE); });
      expect(result.current.getTodayProblems().length).toBe(1);
    });

    it('returns up to problemsPerDay uncompleted problems (normal = 2)', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      expect(result.current.getTodayProblems().length).toBe(2);
    });

    it('excludes already-completed problems', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_ALL, NORMAL_PACE); });
      const firstTwo = result.current.getTodayProblems();
      act(() => { result.current.markComplete(firstTwo[0]); });
      act(() => { result.current.markComplete(firstTwo[1]); });
      const next = result.current.getTodayProblems();
      expect(next).not.toContain(firstTwo[0]);
      expect(next).not.toContain(firstTwo[1]);
    });

    it('returns fewer than pace limit when fewer remain', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, INTENSE_PACE); }); // only 2 problems
      expect(result.current.getTodayProblems().length).toBe(2);
    });

    it('returns [] when all problems are completed', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); }); // p1, p2
      act(() => { result.current.markComplete('p1'); });
      act(() => { result.current.markComplete('p2'); });
      expect(result.current.getTodayProblems()).toEqual([]);
    });
  });

  describe('getProgress', () => {
    it('returns 0/0/0 when no plan is active', () => {
      const { result } = renderHook(() => useStudyPlan());
      expect(result.current.getProgress()).toEqual({ completed: 0, total: 0, pct: 0 });
    });

    it('returns correct total (all problems in plan)', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); }); // 2 problems
      expect(result.current.getProgress().total).toBe(2);
    });

    it('returns 0 completed initially', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); });
      expect(result.current.getProgress().completed).toBe(0);
    });

    it('increments completed when markComplete is called', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); });
      act(() => { result.current.markComplete('p1'); });
      expect(result.current.getProgress().completed).toBe(1);
    });

    it('returns 50% progress after completing half', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); }); // 2 problems
      act(() => { result.current.markComplete('p1'); });
      expect(result.current.getProgress().pct).toBe(50);
    });

    it('returns 100% when all problems are completed', () => {
      const { result } = renderHook(() => useStudyPlan());
      act(() => { result.current.startPlan(TEMPLATE_FILTERED, NORMAL_PACE); }); // p1, p2
      act(() => { result.current.markComplete('p1'); });
      act(() => { result.current.markComplete('p2'); });
      expect(result.current.getProgress().pct).toBe(100);
    });
  });

  describe('stable references', () => {
    it('startPlan reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useStudyPlan());
      const ref = result.current.startPlan;
      rerender();
      expect(result.current.startPlan).toBe(ref);
    });

    it('stopPlan reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useStudyPlan());
      const ref = result.current.stopPlan;
      rerender();
      expect(result.current.stopPlan).toBe(ref);
    });

    it('markComplete reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useStudyPlan());
      const ref = result.current.markComplete;
      rerender();
      expect(result.current.markComplete).toBe(ref);
    });
  });
});

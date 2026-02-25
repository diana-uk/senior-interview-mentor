import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { hashDateToIndex, getTodayKey, pickDailyChallenge, useDailyChallenge } from '../useDailyChallenge';
import { allProblemsList, problemPatternMap } from '../../data/problems';
import type { ProblemStatus } from '../../types';

// ── hashDateToIndex ──

describe('hashDateToIndex', () => {
  it('returns a number in [0, max)', () => {
    const idx = hashDateToIndex('2026-02-25', 150);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(150);
  });

  it('is deterministic — same input gives same output', () => {
    const a = hashDateToIndex('2026-01-01', 150);
    const b = hashDateToIndex('2026-01-01', 150);
    expect(a).toBe(b);
  });

  it('returns different indices for different dates', () => {
    const indices = new Set<number>();
    for (let d = 1; d <= 30; d++) {
      indices.add(hashDateToIndex(`2026-02-${String(d).padStart(2, '0')}`, 150));
    }
    // At least 20 of 30 consecutive days should produce different indices
    expect(indices.size).toBeGreaterThanOrEqual(20);
  });

  it('handles max = 1', () => {
    expect(hashDateToIndex('2026-06-15', 1)).toBe(0);
  });

  it('handles empty string', () => {
    const idx = hashDateToIndex('', 100);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(100);
  });

  it('never returns negative', () => {
    for (let i = 0; i < 100; i++) {
      const idx = hashDateToIndex(`date-${i}`, 150);
      expect(idx).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── getTodayKey ──

describe('getTodayKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getTodayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches current local date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayKey()).toBe(expected);
  });
});

// ── pickDailyChallenge ──

describe('pickDailyChallenge', () => {
  it('returns a RecommendedProblemEntry', () => {
    const entry = pickDailyChallenge('2026-02-25');
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('title');
    expect(entry).toHaveProperty('difficulty');
    expect(entry).toHaveProperty('pattern');
    expect(entry).toHaveProperty('reason');
  });

  it('returns a valid problem from the problem list', () => {
    const entry = pickDailyChallenge('2026-03-15');
    const ids = allProblemsList.map(p => p.id);
    expect(ids).toContain(entry.id);
  });

  it('is deterministic for the same date', () => {
    const a = pickDailyChallenge('2026-06-01');
    const b = pickDailyChallenge('2026-06-01');
    expect(a.id).toBe(b.id);
  });

  it('includes "Daily challenge" in reason', () => {
    const entry = pickDailyChallenge('2026-02-25');
    expect(entry.reason).toContain('Daily challenge');
  });

  it('sets pattern from problemPatternMap', () => {
    const entry = pickDailyChallenge('2026-02-25');
    expect(entry.pattern).toBe(problemPatternMap[entry.id] ?? '');
  });

  // ── With getProblemStatus ──

  it('prefers unseen problems', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockImplementation((id: string) => {
      // Mark all problems as solved except two
      const unseen = [allProblemsList[5].id, allProblemsList[10].id];
      return unseen.includes(id) ? 'unseen' : 'solved';
    });

    const entry = pickDailyChallenge('2026-02-25', getProblemStatus);
    expect(getProblemStatus(entry.id)).toBe('unseen');
  });

  it('includes "fresh problem" reason for unseen picks', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const entry = pickDailyChallenge('2026-02-25', getProblemStatus);
    expect(entry.reason).toContain('fresh problem');
  });

  it('falls back to hashed pick when all problems are solved', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('solved');
    const entry = pickDailyChallenge('2026-04-10', getProblemStatus);
    // Should still return a valid problem
    const ids = allProblemsList.map(p => p.id);
    expect(ids).toContain(entry.id);
    expect(entry.reason).toBe('Daily challenge');
  });

  it('uses "Daily challenge" reason (no "fresh") when falling back', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('solved');
    const entry = pickDailyChallenge('2026-04-10', getProblemStatus);
    expect(entry.reason).not.toContain('fresh');
  });

  it('without getProblemStatus, uses hashed pick directly', () => {
    const entry = pickDailyChallenge('2026-02-25');
    const baseIndex = hashDateToIndex('2026-02-25', allProblemsList.length);
    expect(entry.id).toBe(allProblemsList[baseIndex].id);
  });

  it('returns different problems on different days', () => {
    const ids = new Set<string>();
    for (let d = 1; d <= 30; d++) {
      ids.add(pickDailyChallenge(`2026-03-${String(d).padStart(2, '0')}`).id);
    }
    expect(ids.size).toBeGreaterThanOrEqual(15);
  });
});

// ── useDailyChallenge hook ──

describe('useDailyChallenge', () => {
  it('returns a daily challenge entry', () => {
    const { result } = renderHook(() => useDailyChallenge());
    expect(result.current).toHaveProperty('id');
    expect(result.current).toHaveProperty('title');
    expect(result.current).toHaveProperty('difficulty');
    expect(result.current.reason).toContain('Daily challenge');
  });

  it('returns the same entry on re-render', () => {
    const { result, rerender } = renderHook(() => useDailyChallenge());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('accepts getProblemStatus to prefer unseen', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const { result } = renderHook(() => useDailyChallenge(getProblemStatus));
    expect(result.current.reason).toContain('fresh problem');
  });

  it('memoizes when getProblemStatus reference is stable', () => {
    const getProblemStatus = vi.fn<(id: string) => ProblemStatus>().mockReturnValue('unseen');
    const { result, rerender } = renderHook(() => useDailyChallenge(getProblemStatus));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

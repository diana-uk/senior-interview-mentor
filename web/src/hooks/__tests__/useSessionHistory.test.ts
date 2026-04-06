import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionHistory } from '../useSessionHistory';
import type { SessionRecord } from '../../types';

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

let idCounter = 0;
function makeSession(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: `session-${++idCounter}`,
    date: new Date().toISOString(),
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    mode: 'TEACHER',
    duration: 300,
    hintsUsed: 1,
    score: null,
    patterns: [],
    ...overrides,
  };
}

beforeEach(() => {
  idCounter = 0;
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('useSessionHistory', () => {
  describe('initial state', () => {
    it('starts with an empty array when nothing is stored', () => {
      const { result } = renderHook(() => useSessionHistory());
      expect(result.current.sessions).toEqual([]);
    });

    it('loads persisted sessions from storage on mount', () => {
      const session = makeSession({ id: 's1' });
      storage.safeSetItem('sim-session-history', JSON.stringify([session]));
      const { result } = renderHook(() => useSessionHistory());
      expect(result.current.sessions.length).toBe(1);
      expect(result.current.sessions[0].id).toBe('s1');
    });

    it('returns empty array when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-session-history', 'bad-json');
      const { result } = renderHook(() => useSessionHistory());
      expect(result.current.sessions).toEqual([]);
    });
  });

  describe('saveSession', () => {
    it('adds a session to the list', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession()); });
      expect(result.current.sessions.length).toBe(1);
    });

    it('prepends new session (most recent first)', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession({ id: 'first' })); });
      act(() => { result.current.saveSession(makeSession({ id: 'second' })); });
      expect(result.current.sessions[0].id).toBe('second');
      expect(result.current.sessions[1].id).toBe('first');
    });

    it('persists session to storage', () => {
      const { result } = renderHook(() => useSessionHistory());
      const session = makeSession({ id: 'persist-me' });
      act(() => { result.current.saveSession(session); });
      const stored = JSON.parse(storage.safeGetItem('sim-session-history') ?? '[]') as SessionRecord[];
      expect(stored[0].id).toBe('persist-me');
    });

    it('accumulates multiple sessions', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession()); });
      act(() => { result.current.saveSession(makeSession()); });
      act(() => { result.current.saveSession(makeSession()); });
      expect(result.current.sessions.length).toBe(3);
    });

    it('enforces 50-item cap — drops oldest when over limit', () => {
      // Pre-fill storage with 50 items
      const existing = Array.from({ length: 50 }, (_, i) =>
        makeSession({ id: `old-${i}` }),
      );
      storage.safeSetItem('sim-session-history', JSON.stringify(existing));

      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession({ id: 'new-entry' })); });

      expect(result.current.sessions.length).toBe(50);
      expect(result.current.sessions[0].id).toBe('new-entry');
      expect(result.current.sessions.find((s) => s.id === 'old-49')).toBeUndefined();
    });

    it('cap is exactly 50, not 51', () => {
      const existing = Array.from({ length: 49 }, (_, i) => makeSession({ id: `r${i}` }));
      storage.safeSetItem('sim-session-history', JSON.stringify(existing));
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession({ id: 'r49' })); });
      act(() => { result.current.saveSession(makeSession({ id: 'r50' })); });
      expect(result.current.sessions.length).toBe(50);
    });
  });

  describe('getRecentSessions', () => {
    it('returns empty array when no sessions exist', () => {
      const { result } = renderHook(() => useSessionHistory());
      expect(result.current.getRecentSessions(5)).toEqual([]);
    });

    it('returns first N sessions', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession({ id: 's1' })); });
      act(() => { result.current.saveSession(makeSession({ id: 's2' })); });
      act(() => { result.current.saveSession(makeSession({ id: 's3' })); });
      const recent = result.current.getRecentSessions(2);
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe('s3');
      expect(recent[1].id).toBe('s2');
    });

    it('returns all sessions when N exceeds the total count', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession()); });
      act(() => { result.current.saveSession(makeSession()); });
      expect(result.current.getRecentSessions(100).length).toBe(2);
    });

    it('returns 0 sessions for N=0', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession()); });
      expect(result.current.getRecentSessions(0).length).toBe(0);
    });

    it('most recent session is at index 0', () => {
      const { result } = renderHook(() => useSessionHistory());
      act(() => { result.current.saveSession(makeSession({ id: 'older' })); });
      act(() => { result.current.saveSession(makeSession({ id: 'newest' })); });
      expect(result.current.getRecentSessions(1)[0].id).toBe('newest');
    });
  });

  describe('persistence across remounts', () => {
    it('reloads sessions from storage on fresh mount', () => {
      const { result: r1 } = renderHook(() => useSessionHistory());
      act(() => { r1.current.saveSession(makeSession({ id: 'keep-me' })); });

      const { result: r2 } = renderHook(() => useSessionHistory());
      expect(r2.current.sessions[0].id).toBe('keep-me');
    });
  });

  describe('stable references', () => {
    it('saveSession reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useSessionHistory());
      const ref = result.current.saveSession;
      rerender();
      expect(result.current.saveSession).toBe(ref);
    });

    it('getRecentSessions reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useSessionHistory());
      const ref = result.current.getRecentSessions;
      rerender();
      expect(result.current.getRecentSessions).toBe(ref);
    });
  });
});

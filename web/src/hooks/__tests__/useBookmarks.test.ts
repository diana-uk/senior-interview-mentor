import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookmarks } from '../useBookmarks';

// Mock storage utils
vi.mock('../../utils/storage', () => {
  let store: Record<string, string> = {};
  return {
    safeGetItem: (key: string) => store[key] ?? null,
    safeSetItem: (key: string, value: string) => { store[key] = value; },
    safeRemoveItem: (key: string) => { delete store[key]; },
    __resetStore: () => { store = {}; },
  };
});

// Import after mock
import * as storage from '../../utils/storage';

beforeEach(() => {
  // Clear the mock store before each test
  (storage as unknown as { __resetStore: () => void }).__resetStore();
});

describe('useBookmarks', () => {
  describe('initial state', () => {
    it('starts with an empty bookmark set when nothing stored', () => {
      const { result } = renderHook(() => useBookmarks());
      expect(result.current.bookmarks.size).toBe(0);
    });

    it('loads persisted bookmarks from storage on mount', () => {
      storage.safeSetItem('sim-bookmarks', JSON.stringify(['p1', 'p2']));
      const { result } = renderHook(() => useBookmarks());
      expect(result.current.bookmarks.has('p1')).toBe(true);
      expect(result.current.bookmarks.has('p2')).toBe(true);
      expect(result.current.bookmarks.size).toBe(2);
    });

    it('returns empty set when stored value is invalid JSON', () => {
      storage.safeSetItem('sim-bookmarks', 'not-json');
      const { result } = renderHook(() => useBookmarks());
      expect(result.current.bookmarks.size).toBe(0);
    });

    it('returns empty set when stored value is null', () => {
      // nothing stored
      const { result } = renderHook(() => useBookmarks());
      expect(result.current.bookmarks.size).toBe(0);
    });
  });

  describe('toggleBookmark — adding', () => {
    it('adds a problem id to bookmarks', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('two-sum'); });
      expect(result.current.bookmarks.has('two-sum')).toBe(true);
    });

    it('bookmarks size increases by 1 when adding', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('two-sum'); });
      expect(result.current.bookmarks.size).toBe(1);
    });

    it('persists new bookmark to storage', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('two-sum'); });
      const stored = JSON.parse(storage.safeGetItem('sim-bookmarks') ?? '[]') as string[];
      expect(stored).toContain('two-sum');
    });

    it('can add multiple bookmarks', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('p1'); });
      act(() => { result.current.toggleBookmark('p2'); });
      act(() => { result.current.toggleBookmark('p3'); });
      expect(result.current.bookmarks.size).toBe(3);
    });
  });

  describe('toggleBookmark — removing', () => {
    it('removes an already-bookmarked problem', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('two-sum'); });
      act(() => { result.current.toggleBookmark('two-sum'); });
      expect(result.current.bookmarks.has('two-sum')).toBe(false);
    });

    it('bookmarks size decreases by 1 when removing', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('p1'); });
      act(() => { result.current.toggleBookmark('p2'); });
      act(() => { result.current.toggleBookmark('p1'); }); // remove
      expect(result.current.bookmarks.size).toBe(1);
    });

    it('updates storage when removing a bookmark', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('two-sum'); });
      act(() => { result.current.toggleBookmark('two-sum'); }); // remove
      const stored = JSON.parse(storage.safeGetItem('sim-bookmarks') ?? '[]') as string[];
      expect(stored).not.toContain('two-sum');
    });
  });

  describe('isBookmarked behavior via bookmarks Set', () => {
    it('has() returns true for a bookmarked id', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('abc'); });
      expect(result.current.bookmarks.has('abc')).toBe(true);
    });

    it('has() returns false for a non-bookmarked id', () => {
      const { result } = renderHook(() => useBookmarks());
      expect(result.current.bookmarks.has('not-bookmarked')).toBe(false);
    });

    it('has() returns false after toggling off', () => {
      const { result } = renderHook(() => useBookmarks());
      act(() => { result.current.toggleBookmark('abc'); });
      act(() => { result.current.toggleBookmark('abc'); });
      expect(result.current.bookmarks.has('abc')).toBe(false);
    });
  });

  describe('persistence across remounts', () => {
    it('reloads bookmarks from storage on a fresh mount', () => {
      const { result: r1 } = renderHook(() => useBookmarks());
      act(() => { r1.current.toggleBookmark('persist-me'); });

      // Simulate remount
      const { result: r2 } = renderHook(() => useBookmarks());
      expect(r2.current.bookmarks.has('persist-me')).toBe(true);
    });

    it('removed bookmarks are not present after remount', () => {
      const { result: r1 } = renderHook(() => useBookmarks());
      act(() => { r1.current.toggleBookmark('item'); });
      act(() => { r1.current.toggleBookmark('item'); }); // remove

      const { result: r2 } = renderHook(() => useBookmarks());
      expect(r2.current.bookmarks.has('item')).toBe(false);
    });
  });

  describe('toggleBookmark is stable', () => {
    it('returns the same toggleBookmark reference across renders', () => {
      const { result, rerender } = renderHook(() => useBookmarks());
      const first = result.current.toggleBookmark;
      rerender();
      expect(result.current.toggleBookmark).toBe(first);
    });
  });
});

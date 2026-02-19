import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkspaceLayout } from '../useWorkspaceLayout';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const STORAGE_KEY = 'sim-workspace-layout';

describe('useWorkspaceLayout', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ── Initialization ──

  describe('default state', () => {
    it('starts with 40% chat width', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.chatWidthPercent).toBe(40);
    });

    it('starts not swapped', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.isSwapped).toBe(false);
    });

    it('starts with chat expanded', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.isChatCollapsed).toBe(false);
    });

    it('starts with editor expanded', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.isEditorCollapsed).toBe(false);
    });

    it('exposes MIN_PERCENT as 20', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.MIN_PERCENT).toBe(20);
    });

    it('exposes MAX_PERCENT as 80', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.MAX_PERCENT).toBe(80);
    });
  });

  // ── localStorage persistence ──

  describe('localStorage persistence', () => {
    it('loads saved state from localStorage', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({
        chatWidthPercent: 60,
        isSwapped: true,
        isChatCollapsed: false,
        isEditorCollapsed: false,
      }));
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.chatWidthPercent).toBe(60);
      expect(result.current.isSwapped).toBe(true);
    });

    it('falls back to defaults for missing fields', () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({
        chatWidthPercent: 55,
      }));
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.chatWidthPercent).toBe(55);
      expect(result.current.isSwapped).toBe(false);
      expect(result.current.isChatCollapsed).toBe(false);
      expect(result.current.isEditorCollapsed).toBe(false);
    });

    it('handles corrupted JSON gracefully', () => {
      localStorageMock.setItem(STORAGE_KEY, '{broken json!!!');
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.chatWidthPercent).toBe(40);
    });

    it('handles empty localStorage', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      expect(result.current.chatWidthPercent).toBe(40);
    });

    it('persists state changes to localStorage', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(50));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"chatWidthPercent":50'),
      );
    });
  });

  // ── setChatWidth ──

  describe('setChatWidth', () => {
    it('sets chat width to given percent', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(55));
      expect(result.current.chatWidthPercent).toBe(55);
    });

    it('clamps below MIN_PERCENT (20)', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(10));
      expect(result.current.chatWidthPercent).toBe(20);
    });

    it('clamps above MAX_PERCENT (80)', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(95));
      expect(result.current.chatWidthPercent).toBe(80);
    });

    it('clamps exactly at MIN boundary', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(20));
      expect(result.current.chatWidthPercent).toBe(20);
    });

    it('clamps exactly at MAX boundary', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(80));
      expect(result.current.chatWidthPercent).toBe(80);
    });

    it('un-collapses both panels when resizing', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      expect(result.current.isChatCollapsed).toBe(true);
      act(() => result.current.setChatWidth(50));
      expect(result.current.isChatCollapsed).toBe(false);
      expect(result.current.isEditorCollapsed).toBe(false);
    });

    it('persists after setChatWidth', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(65));
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
      expect(stored.chatWidthPercent).toBe(65);
    });
  });

  // ── Collapse / Expand Chat ──

  describe('collapseChat / expandChat', () => {
    it('collapses chat panel', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      expect(result.current.isChatCollapsed).toBe(true);
    });

    it('un-collapses editor when collapsing chat', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseEditor());
      expect(result.current.isEditorCollapsed).toBe(true);
      act(() => result.current.collapseChat());
      expect(result.current.isEditorCollapsed).toBe(false);
      expect(result.current.isChatCollapsed).toBe(true);
    });

    it('expandChat restores chat panel', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      act(() => result.current.expandChat());
      expect(result.current.isChatCollapsed).toBe(false);
    });

    it('expandChat restores previous width', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(60));
      act(() => result.current.collapseChat());
      act(() => result.current.expandChat());
      expect(result.current.chatWidthPercent).toBe(60);
    });

    it('expandChat uses default width when no previous width', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      // Default is 40, collapse then expand without ever setting a custom width
      act(() => result.current.collapseChat());
      act(() => result.current.expandChat());
      expect(result.current.chatWidthPercent).toBe(40);
    });

    it('persists collapse state', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
      expect(stored.isChatCollapsed).toBe(true);
    });
  });

  // ── Collapse / Expand Editor ──

  describe('collapseEditor / expandEditor', () => {
    it('collapses editor panel', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseEditor());
      expect(result.current.isEditorCollapsed).toBe(true);
    });

    it('un-collapses chat when collapsing editor', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      act(() => result.current.collapseEditor());
      expect(result.current.isChatCollapsed).toBe(false);
      expect(result.current.isEditorCollapsed).toBe(true);
    });

    it('expandEditor restores editor panel', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseEditor());
      act(() => result.current.expandEditor());
      expect(result.current.isEditorCollapsed).toBe(false);
    });

    it('persists editor collapse state', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseEditor());
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
      expect(stored.isEditorCollapsed).toBe(true);
    });
  });

  // ── toggleSwap ──

  describe('toggleSwap', () => {
    it('toggles swap from false to true', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.toggleSwap());
      expect(result.current.isSwapped).toBe(true);
    });

    it('toggles swap from true to false', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.toggleSwap());
      act(() => result.current.toggleSwap());
      expect(result.current.isSwapped).toBe(false);
    });

    it('persists swap state', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.toggleSwap());
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
      expect(stored.isSwapped).toBe(true);
    });
  });

  // ── resetLayout ──

  describe('resetLayout', () => {
    it('resets chat width to default 40%', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(70));
      act(() => result.current.resetLayout());
      expect(result.current.chatWidthPercent).toBe(40);
    });

    it('resets swap to false', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.toggleSwap());
      act(() => result.current.resetLayout());
      expect(result.current.isSwapped).toBe(false);
    });

    it('resets collapsed panels', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      act(() => result.current.resetLayout());
      expect(result.current.isChatCollapsed).toBe(false);
      expect(result.current.isEditorCollapsed).toBe(false);
    });

    it('persists reset state', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(70));
      act(() => result.current.resetLayout());
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)![1]);
      expect(stored.chatWidthPercent).toBe(40);
      expect(stored.isSwapped).toBe(false);
    });

    it('subsequent expand after reset uses default width', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.setChatWidth(70));
      act(() => result.current.resetLayout());
      act(() => result.current.collapseChat());
      act(() => result.current.expandChat());
      expect(result.current.chatWidthPercent).toBe(40);
    });
  });

  // ── Mutual exclusivity ──

  describe('collapse mutual exclusivity', () => {
    it('cannot have both panels collapsed simultaneously', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseChat());
      act(() => result.current.collapseEditor());
      // collapseEditor should un-collapse chat
      expect(result.current.isChatCollapsed).toBe(false);
      expect(result.current.isEditorCollapsed).toBe(true);
    });

    it('collapsing chat after editor un-collapses editor', () => {
      const { result } = renderHook(() => useWorkspaceLayout());
      act(() => result.current.collapseEditor());
      act(() => result.current.collapseChat());
      expect(result.current.isEditorCollapsed).toBe(false);
      expect(result.current.isChatCollapsed).toBe(true);
    });
  });
});

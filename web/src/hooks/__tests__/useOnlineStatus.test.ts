import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');

  function setOnLine(value: boolean) {
    Object.defineProperty(navigator, 'onLine', { get: () => value, configurable: true });
  }

  afterEach(() => {
    if (originalOnLine) {
      Object.defineProperty(navigator, 'onLine', originalOnLine);
    }
  });

  describe('initial state', () => {
    it('returns true when navigator.onLine is true', () => {
      setOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(true);
    });

    it('returns false when navigator.onLine is false', () => {
      setOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(false);
    });
  });

  describe('online event', () => {
    it('switches to true when online event fires', () => {
      setOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(false);

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current).toBe(true);
    });

    it('stays true when already online and online event fires', () => {
      setOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current).toBe(true);
    });
  });

  describe('offline event', () => {
    it('switches to false when offline event fires', () => {
      setOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current).toBe(true);

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current).toBe(false);
    });

    it('stays false when already offline and offline event fires', () => {
      setOnLine(false);
      const { result } = renderHook(() => useOnlineStatus());

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('online/offline transitions', () => {
    it('toggles correctly across multiple events', () => {
      setOnLine(true);
      const { result } = renderHook(() => useOnlineStatus());

      act(() => { window.dispatchEvent(new Event('offline')); });
      expect(result.current).toBe(false);

      act(() => { window.dispatchEvent(new Event('online')); });
      expect(result.current).toBe(true);

      act(() => { window.dispatchEvent(new Event('offline')); });
      expect(result.current).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      setOnLine(true);
      const { unmount } = renderHook(() => useOnlineStatus());

      unmount();

      const calls = removeEventListenerSpy.mock.calls;
      expect(calls.some(([event]) => event === 'online')).toBe(true);
      expect(calls.some(([event]) => event === 'offline')).toBe(true);

      removeEventListenerSpy.mockRestore();
    });

    it('does not update state after unmount', () => {
      setOnLine(true);
      const { result, unmount } = renderHook(() => useOnlineStatus());
      unmount();

      // Should not throw or warn
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      // Result should still be what it was at unmount time
      expect(result.current).toBe(true);
    });
  });

  describe('event listener registration', () => {
    it('registers online and offline listeners on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      setOnLine(true);
      renderHook(() => useOnlineStatus());

      const calls = addEventListenerSpy.mock.calls;
      expect(calls.some(([event]) => event === 'online')).toBe(true);
      expect(calls.some(([event]) => event === 'offline')).toBe(true);

      addEventListenerSpy.mockRestore();
    });
  });
});

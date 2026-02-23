import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimerState } from '../useTimerState';

describe('useTimerState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Default initialization ──

  describe('default initialization', () => {
    it('starts with 2700 seconds', () => {
      const { result } = renderHook(() => useTimerState());
      expect(result.current.timerSeconds).toBe(2700);
    });

    it('starts with timerRunning=false', () => {
      const { result } = renderHook(() => useTimerState());
      expect(result.current.timerRunning).toBe(false);
    });

    it('exposes setTimerSeconds function', () => {
      const { result } = renderHook(() => useTimerState());
      expect(typeof result.current.setTimerSeconds).toBe('function');
    });

    it('exposes setTimerRunning function', () => {
      const { result } = renderHook(() => useTimerState());
      expect(typeof result.current.setTimerRunning).toBe('function');
    });
  });

  // ── Custom initialization ──

  describe('custom initialization', () => {
    it('accepts custom timerSeconds', () => {
      const { result } = renderHook(() => useTimerState({ timerSeconds: 600 }));
      expect(result.current.timerSeconds).toBe(600);
    });

    it('accepts custom timerRunning=true', () => {
      const { result } = renderHook(() => useTimerState({ timerRunning: true }));
      expect(result.current.timerRunning).toBe(true);
    });

    it('accepts both custom seconds and running state', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 120, timerRunning: true }),
      );
      expect(result.current.timerSeconds).toBe(120);
      expect(result.current.timerRunning).toBe(true);
    });

    it('uses default seconds when only timerRunning is provided', () => {
      const { result } = renderHook(() => useTimerState({ timerRunning: false }));
      expect(result.current.timerSeconds).toBe(2700);
    });

    it('uses default running state when only timerSeconds is provided', () => {
      const { result } = renderHook(() => useTimerState({ timerSeconds: 500 }));
      expect(result.current.timerRunning).toBe(false);
    });
  });

  // ── Timer countdown ──

  describe('timer countdown', () => {
    it('decrements by 1 after 1000ms when running', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timerSeconds).toBe(99);
    });

    it('decrements by 3 after 3000ms', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(97);
    });

    it('does not decrement before 1000ms', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(result.current.timerSeconds).toBe(100);
    });

    it('counts down continuously over many ticks', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 10, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.timerSeconds).toBe(5);
    });
  });

  // ── Timer stops at 0 ──

  describe('timer stops at zero', () => {
    it('stops at 0 and does not go negative', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 2, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.timerSeconds).toBe(0);
    });

    it('sets timerRunning to false when reaching 0', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 1, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.timerSeconds).toBe(0);
      expect(result.current.timerRunning).toBe(false);
    });
  });

  // ── setTimerRunning start/stop ──

  describe('setTimerRunning start/stop', () => {
    it('starts countdown when setTimerRunning(true)', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 50 }),
      );
      expect(result.current.timerRunning).toBe(false);
      act(() => {
        result.current.setTimerRunning(true);
      });
      expect(result.current.timerRunning).toBe(true);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(47);
    });

    it('stops countdown when setTimerRunning(false)', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 50, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.timerSeconds).toBe(48);
      act(() => {
        result.current.setTimerRunning(false);
      });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      // Should stay at 48 because timer was stopped
      expect(result.current.timerSeconds).toBe(48);
    });
  });

  // ── setTimerSeconds manual override ──

  describe('setTimerSeconds manual override', () => {
    it('sets timer to a new value', () => {
      const { result } = renderHook(() => useTimerState());
      act(() => {
        result.current.setTimerSeconds(1800);
      });
      expect(result.current.timerSeconds).toBe(1800);
    });

    it('allows setting to 0', () => {
      const { result } = renderHook(() => useTimerState());
      act(() => {
        result.current.setTimerSeconds(0);
      });
      expect(result.current.timerSeconds).toBe(0);
    });

    it('allows setting very large values', () => {
      const { result } = renderHook(() => useTimerState());
      act(() => {
        result.current.setTimerSeconds(999999);
      });
      expect(result.current.timerSeconds).toBe(999999);
    });
  });

  // ── No countdown when not running ──

  describe('no countdown when not running', () => {
    it('seconds remain stable when timerRunning is false', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: false }),
      );
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.timerSeconds).toBe(100);
    });

    it('default state does not count down', () => {
      const { result } = renderHook(() => useTimerState());
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(result.current.timerSeconds).toBe(2700);
    });
  });

  // ── Multiple start/stop cycles ──

  describe('multiple start/stop cycles', () => {
    it('resumes counting from where it stopped', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100 }),
      );
      // Start
      act(() => {
        result.current.setTimerRunning(true);
      });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(97);

      // Stop
      act(() => {
        result.current.setTimerRunning(false);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.timerSeconds).toBe(97);

      // Start again
      act(() => {
        result.current.setTimerRunning(true);
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.timerSeconds).toBe(95);
    });

    it('handles rapid toggling without issues', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 50 }),
      );
      act(() => {
        result.current.setTimerRunning(true);
      });
      act(() => {
        result.current.setTimerRunning(false);
      });
      act(() => {
        result.current.setTimerRunning(true);
      });
      act(() => {
        result.current.setTimerRunning(false);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      // Timer should be stopped, seconds unchanged
      expect(result.current.timerSeconds).toBe(50);
    });
  });

  // ── Cleanup on unmount ──

  describe('cleanup on unmount', () => {
    it('clears interval when unmounted while running', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      const { unmount } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('does not tick after unmount', () => {
      const { result, unmount } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timerSeconds).toBe(99);
      unmount();
      // Advancing timers after unmount should not cause errors
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      // result is stale after unmount, but no errors should occur
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('setting seconds to 0 while running stops the timer on next tick', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 50, timerRunning: true }),
      );
      act(() => {
        result.current.setTimerSeconds(0);
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timerSeconds).toBe(0);
      expect(result.current.timerRunning).toBe(false);
    });

    it('countdown works with timerSeconds=1 (boundary)', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 1, timerRunning: true }),
      );
      // After 1 tick: s=1 > 0, so returns 0. timerRunning not yet false.
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timerSeconds).toBe(0);
      // After 2nd tick: s=0 <= 0, so setTimerRunning(false) is called.
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timerSeconds).toBe(0);
      expect(result.current.timerRunning).toBe(false);
    });

    it('manually resetting seconds while running continues countdown from new value', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 100, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(97);
      act(() => {
        result.current.setTimerSeconds(200);
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.timerSeconds).toBe(198);
    });

    it('restarting after reaching 0 works with new seconds', () => {
      const { result } = renderHook(() =>
        useTimerState({ timerSeconds: 2, timerRunning: true }),
      );
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(0);
      expect(result.current.timerRunning).toBe(false);

      // Set new time and restart
      act(() => {
        result.current.setTimerSeconds(10);
      });
      act(() => {
        result.current.setTimerRunning(true);
      });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timerSeconds).toBe(7);
      expect(result.current.timerRunning).toBe(true);
    });
  });
});

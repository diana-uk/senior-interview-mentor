import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMistakeTracker } from '../useMistakeTracker';

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

describe('useMistakeTracker', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('starts with empty mistakes', () => {
    const { result } = renderHook(() => useMistakeTracker());
    expect(result.current.mistakes).toEqual([]);
  });

  it('addMistake creates a new entry', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Two Pointers',
        problemId: 'tp-1',
        problemTitle: 'Two Sum',
        description: 'Forgot to sort first',
      });
    });
    expect(result.current.mistakes).toHaveLength(1);
    expect(result.current.mistakes[0].pattern).toBe('Two Pointers');
    expect(result.current.mistakes[0].problemTitle).toBe('Two Sum');
    expect(result.current.mistakes[0].description).toBe('Forgot to sort first');
    expect(result.current.mistakes[0].interval).toBe(1);
    expect(result.current.mistakes[0].easeFactor).toBe(2.5);
    expect(result.current.mistakes[0].repetitions).toBe(0);
    expect(result.current.mistakes[0].streak).toBe(0);
  });

  it('addMistake persists to localStorage', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'HashMap',
        problemId: null,
        problemTitle: 'General',
        description: 'Need to think about hash collisions',
      });
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored).toHaveLength(1);
    expect(stored[0].pattern).toBe('HashMap');
  });

  it('removeMistake deletes an entry', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'BFS/DFS',
        problemId: null,
        problemTitle: 'Graph Traversal',
        description: 'Forgot visited set',
      });
    });
    const id = result.current.mistakes[0].id;
    act(() => {
      result.current.removeMistake(id);
    });
    expect(result.current.mistakes).toHaveLength(0);
  });

  it('clearAll removes everything', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Sliding Window',
        problemId: null,
        problemTitle: 'P1',
        description: 'D1',
      });
    });
    act(() => {
      result.current.addMistake({
        pattern: 'Two Pointers',
        problemId: null,
        problemTitle: 'P2',
        description: 'D2',
      });
    });
    act(() => {
      result.current.clearAll();
    });
    expect(result.current.mistakes).toHaveLength(0);
  });

  it('reviewMistake with quality >= 3 increases streak', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Binary Search',
        problemId: null,
        problemTitle: 'BS Problem',
        description: 'Off by one',
      });
    });
    const id = result.current.mistakes[0].id;
    act(() => {
      result.current.reviewMistake(id, 4); // good review
    });
    const updated = result.current.mistakes.find(m => m.id === id);
    expect(updated!.streak).toBe(1);
    expect(updated!.repetitions).toBe(1);
  });

  it('reviewMistake with quality < 3 resets streak', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Dynamic Programming',
        problemId: null,
        problemTitle: 'DP Problem',
        description: 'Missed base case',
      });
    });
    const id = result.current.mistakes[0].id;
    // First pass
    act(() => result.current.reviewMistake(id, 4));
    // Then fail
    act(() => result.current.reviewMistake(id, 1));
    const updated = result.current.mistakes.find(m => m.id === id);
    expect(updated!.streak).toBe(0);
    expect(updated!.repetitions).toBe(0);
    expect(updated!.interval).toBe(1);
  });

  it('SM-2: first pass sets interval to 1, second to 6', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Heap',
        problemId: null,
        problemTitle: 'Heap Problem',
        description: 'Wrong comparator',
      });
    });
    const id = result.current.mistakes[0].id;
    // First review (quality 4)
    act(() => result.current.reviewMistake(id, 4));
    let m = result.current.mistakes.find(m => m.id === id)!;
    expect(m.interval).toBe(1);
    expect(m.repetitions).toBe(1);

    // Second review (quality 4)
    act(() => result.current.reviewMistake(id, 4));
    m = result.current.mistakes.find(m => m.id === id)!;
    expect(m.interval).toBe(6);
    expect(m.repetitions).toBe(2);
  });

  it('SM-2: third pass uses interval * easeFactor', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Greedy',
        problemId: null,
        problemTitle: 'Greedy',
        description: 'Wrong greedy choice',
      });
    });
    const id = result.current.mistakes[0].id;
    // 3 consecutive passes at quality 4
    act(() => result.current.reviewMistake(id, 4));
    act(() => result.current.reviewMistake(id, 4));
    act(() => result.current.reviewMistake(id, 4));
    const m = result.current.mistakes.find(m => m.id === id)!;
    expect(m.repetitions).toBe(3);
    // interval = round(6 * EF). After 3 passes at q=4, EF should be around 2.5 + 3*0.0
    // EF change per review: 0.1 - (5-4)*(0.08 + (5-4)*0.02) = 0.1 - 0.1 = 0
    // So EF stays at 2.5, interval = round(6 * 2.5) = 15
    expect(m.interval).toBe(15);
  });

  it('getMistakesByPattern groups correctly', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({ pattern: 'Trees', problemId: null, problemTitle: 'P1', description: 'D1' });
    });
    act(() => {
      result.current.addMistake({ pattern: 'Trees', problemId: null, problemTitle: 'P2', description: 'D2' });
    });
    act(() => {
      result.current.addMistake({ pattern: 'Heap', problemId: null, problemTitle: 'P3', description: 'D3' });
    });
    const grouped = result.current.getMistakesByPattern();
    expect(grouped['Trees']).toHaveLength(2);
    expect(grouped['Heap']).toHaveLength(1);
  });

  it('getWeakPatterns returns sorted by avgStreak ascending', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({ pattern: 'Trees', problemId: null, problemTitle: 'P1', description: 'D1' });
    });
    act(() => {
      result.current.addMistake({ pattern: 'Heap', problemId: null, problemTitle: 'P2', description: 'D2' });
    });
    // Review Trees one (streak=1), leave Heap at streak=0
    const treeId = result.current.mistakes.find(m => m.pattern === 'Trees')!.id;
    act(() => result.current.reviewMistake(treeId, 4));

    const weak = result.current.getWeakPatterns();
    expect(weak[0].pattern).toBe('Heap'); // streak 0
    expect(weak[1].pattern).toBe('Trees'); // streak 1
  });

  it('dueForReview shows entries where nextReview <= today', () => {
    const { result } = renderHook(() => useMistakeTracker());
    act(() => {
      result.current.addMistake({
        pattern: 'Intervals',
        problemId: null,
        problemTitle: 'Intervals',
        description: 'Missed merge',
      });
    });
    // By default, nextReview = tomorrow (addDays(today, 1))
    // So it should NOT be due today
    expect(result.current.dueForReview).toHaveLength(0);
  });
});

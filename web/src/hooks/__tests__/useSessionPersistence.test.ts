import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionPersistence } from '../useSessionPersistence';
import type { PersistedSession } from '../useSessionPersistence';
import type { ChatMessage } from '../../types';

// ── Mock localStorage ──

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

// Suppress logger output
vi.mock('../../utils/logger.js', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const STORAGE_KEY = 'sim-session';

// ── Helpers ──

function makePersistedSession(overrides: Partial<PersistedSession> = {}): PersistedSession {
  return {
    mode: 'TEACHER',
    currentProblem: null,
    editorTab: 'solution',
    hintsUsed: 0,
    timerSeconds: 0,
    timerRunning: false,
    editorCode: '',
    testCode: '',
    notes: '',
    commitmentGate: [],
    hints: [],
    interviewStage: null,
    interviewCategory: null,
    sdTopicId: null,
    sdState: {
      active: false,
      currentPhase: 'requirements',
      phaseStatuses: {
        requirements: 'not-started',
        'api-design': 'not-started',
        'data-model': 'not-started',
        architecture: 'not-started',
        'deep-dive': 'not-started',
        'scaling': 'not-started',
        'wrap-up': 'not-started',
      },
      topicTitle: '',
      topicPrompt: '',
      endpoints: [],
      schema: '',
      dbChoice: 'PostgreSQL',
      dbJustification: '',
      diagramNodes: [],
      diagramEdges: [],
      deepDiveChallenges: [],
      scalingState: {
        capacityEstimates: [],
        sections: {
          caching: { strategy: '', items: [] },
          databases: { strategy: '', items: [] },
          loadBalancing: { strategy: '', items: [] },
          reliability: { strategy: '', items: [] },
          monitoring: { strategy: '', items: [] },
        },
      },
    } as PersistedSession['sdState'],
    messages: [],
    ...overrides,
  };
}

function makeChatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date('2026-02-20T12:00:00Z'),
    ...overrides,
  };
}

/** Write a valid envelope directly into localStorage for the hook to read on mount. */
function seedStorage(data: PersistedSession): void {
  const envelope = { version: 1, savedAt: Date.now(), data };
  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

describe('useSessionPersistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Return shape ──

  describe('return shape', () => {
    it('returns an object with restored, restoreMessages, saveSession, clearSession', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current).toHaveProperty('restored');
      expect(result.current).toHaveProperty('restoreMessages');
      expect(result.current).toHaveProperty('saveSession');
      expect(result.current).toHaveProperty('clearSession');
    });

    it('restoreMessages is a function', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(typeof result.current.restoreMessages).toBe('function');
    });

    it('saveSession is a function', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(typeof result.current.saveSession).toBe('function');
    });

    it('clearSession is a function', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(typeof result.current.clearSession).toBe('function');
    });
  });

  // ── restored ──

  describe('restored', () => {
    it('is null when no saved session exists in localStorage', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current.restored).toBeNull();
    });

    it('returns parsed session when valid data exists in localStorage', () => {
      const session = makePersistedSession({ mode: 'INTERVIEWER', editorCode: 'console.log(1)' });
      seedStorage(session);

      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current.restored).toEqual(session);
      expect(result.current.restored!.mode).toBe('INTERVIEWER');
      expect(result.current.restored!.editorCode).toBe('console.log(1)');
    });

    it('returns null when session has expired (older than 24 hours)', () => {
      // Save at T=0
      const session = makePersistedSession();
      seedStorage(session);

      // Advance time past 24 hours
      vi.setSystemTime(new Date('2026-02-21T13:00:00Z'));

      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current.restored).toBeNull();
    });

    it('returns session when within 24-hour window', () => {
      const session = makePersistedSession({ mode: 'REVIEWER' });
      seedStorage(session);

      // Advance 23 hours — still within window
      vi.setSystemTime(new Date('2026-02-21T11:00:00Z'));

      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current.restored).not.toBeNull();
      expect(result.current.restored!.mode).toBe('REVIEWER');
    });

    it('returns null for corrupt JSON in localStorage', () => {
      localStorageMock.setItem(STORAGE_KEY, 'NOT VALID JSON{{{');

      const { result } = renderHook(() => useSessionPersistence());
      expect(result.current.restored).toBeNull();
    });
  });

  // ── restoreMessages (deserializeMessages) ──

  describe('restoreMessages', () => {
    it('converts ISO timestamp strings to Date objects', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([
        { id: 'a', role: 'user', content: 'hello', timestamp: '2026-02-20T12:00:00.000Z' },
      ]);

      expect(restored).toHaveLength(1);
      expect(restored[0].timestamp).toBeInstanceOf(Date);
      expect(restored[0].timestamp.toISOString()).toBe('2026-02-20T12:00:00.000Z');
    });

    it('preserves id, role, and content fields', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([
        { id: 'msg-42', role: 'mentor', content: 'Nice work!', timestamp: '2026-02-20T10:00:00.000Z' },
      ]);

      expect(restored[0].id).toBe('msg-42');
      expect(restored[0].role).toBe('mentor');
      expect(restored[0].content).toBe('Nice work!');
    });

    it('preserves isError when true', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([
        { id: 'e1', role: 'mentor', content: 'Error occurred', timestamp: '2026-02-20T10:00:00.000Z', isError: true },
      ]);

      expect(restored[0].isError).toBe(true);
    });

    it('omits isError when not present in persisted message', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([
        { id: 'n1', role: 'user', content: 'Normal', timestamp: '2026-02-20T10:00:00.000Z' },
      ]);

      expect(restored[0]).not.toHaveProperty('isError');
    });

    it('handles empty array', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([]);
      expect(restored).toEqual([]);
    });

    it('handles multiple messages in order', () => {
      const { result } = renderHook(() => useSessionPersistence());
      const restored = result.current.restoreMessages([
        { id: '1', role: 'user', content: 'First', timestamp: '2026-02-20T10:00:00.000Z' },
        { id: '2', role: 'mentor', content: 'Second', timestamp: '2026-02-20T10:01:00.000Z' },
        { id: '3', role: 'user', content: 'Third', timestamp: '2026-02-20T10:02:00.000Z' },
      ]);

      expect(restored).toHaveLength(3);
      expect(restored[0].content).toBe('First');
      expect(restored[1].content).toBe('Second');
      expect(restored[2].content).toBe('Third');
    });
  });

  // ── saveSession (serializeMessages + debounced save) ──

  describe('saveSession', () => {
    it('filters out streaming messages', () => {
      const { result } = renderHook(() => useSessionPersistence());

      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'a', content: 'done', isStreaming: false }),
        makeChatMessage({ id: 'b', content: 'still typing...', isStreaming: true }),
      ];

      act(() => {
        result.current.saveSession({ ...makePersistedSession(), messages });
      });

      // Flush debounce
      act(() => { vi.advanceTimersByTime(1000); });

      const raw = localStorageMock.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const envelope = JSON.parse(raw!);
      expect(envelope.data.messages).toHaveLength(1);
      expect(envelope.data.messages[0].id).toBe('a');
    });

    it('converts Date timestamps to ISO strings', () => {
      const { result } = renderHook(() => useSessionPersistence());

      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'x', timestamp: new Date('2026-02-20T15:30:00Z') }),
      ];

      act(() => {
        result.current.saveSession({ ...makePersistedSession(), messages });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data.messages[0].timestamp).toBe('2026-02-20T15:30:00.000Z');
    });

    it('includes isError in serialized message when true', () => {
      const { result } = renderHook(() => useSessionPersistence());

      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'err', isError: true }),
      ];

      act(() => {
        result.current.saveSession({ ...makePersistedSession(), messages });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data.messages[0].isError).toBe(true);
    });

    it('omits isError from serialized message when falsy', () => {
      const { result } = renderHook(() => useSessionPersistence());

      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'ok', isError: false }),
      ];

      act(() => {
        result.current.saveSession({ ...makePersistedSession(), messages });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data.messages[0]).not.toHaveProperty('isError');
    });

    it('persists non-message session fields correctly', () => {
      const { result } = renderHook(() => useSessionPersistence());

      const session = makePersistedSession({
        mode: 'INTERVIEWER',
        editorCode: 'function solve() {}',
        testCode: 'console.log(solve())',
        hintsUsed: 2,
        timerSeconds: 300,
        timerRunning: true,
        interviewStage: 'technical',
      });

      act(() => {
        result.current.saveSession({ ...session, messages: [] });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data.mode).toBe('INTERVIEWER');
      expect(envelope.data.editorCode).toBe('function solve() {}');
      expect(envelope.data.hintsUsed).toBe(2);
      expect(envelope.data.timerRunning).toBe(true);
      expect(envelope.data.interviewStage).toBe('technical');
    });

    it('debounces rapid saves — only last call persists', () => {
      const { result } = renderHook(() => useSessionPersistence());

      act(() => {
        result.current.saveSession({
          ...makePersistedSession({ editorCode: 'v1' }),
          messages: [],
        });
        result.current.saveSession({
          ...makePersistedSession({ editorCode: 'v2' }),
          messages: [],
        });
        result.current.saveSession({
          ...makePersistedSession({ editorCode: 'v3' }),
          messages: [],
        });
      });

      act(() => { vi.advanceTimersByTime(1000); });

      const envelope = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(envelope.data.editorCode).toBe('v3');
    });
  });

  // ── clearSession ──

  describe('clearSession', () => {
    it('removes session data from localStorage', () => {
      const session = makePersistedSession();
      seedStorage(session);

      const { result } = renderHook(() => useSessionPersistence());
      act(() => {
        result.current.clearSession();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('does not throw when no session exists', () => {
      const { result } = renderHook(() => useSessionPersistence());
      expect(() => {
        act(() => { result.current.clearSession(); });
      }).not.toThrow();
    });
  });

  // ── Round-trip ──

  describe('round-trip: save then restore', () => {
    it('restores equivalent data after save and re-mount', () => {
      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'm1', role: 'user', content: 'Two Sum', timestamp: new Date('2026-02-20T14:00:00Z') }),
        makeChatMessage({ id: 'm2', role: 'mentor', content: 'Use a HashMap', timestamp: new Date('2026-02-20T14:01:00Z') }),
      ];

      const session = makePersistedSession({
        mode: 'TEACHER',
        editorCode: 'function twoSum() {}',
        hintsUsed: 1,
      });

      // Save from first hook instance
      const { result: first } = renderHook(() => useSessionPersistence());
      act(() => {
        first.current.saveSession({ ...session, messages });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      // Mount a new hook instance to read from localStorage
      const { result: second } = renderHook(() => useSessionPersistence());
      expect(second.current.restored).not.toBeNull();
      expect(second.current.restored!.mode).toBe('TEACHER');
      expect(second.current.restored!.editorCode).toBe('function twoSum() {}');
      expect(second.current.restored!.hintsUsed).toBe(1);
      expect(second.current.restored!.messages).toHaveLength(2);
      expect(second.current.restored!.messages[0].timestamp).toBe('2026-02-20T14:00:00.000Z');

      // Deserialize messages to get Date objects
      const restoredMsgs = second.current.restoreMessages(second.current.restored!.messages);
      expect(restoredMsgs[0].timestamp).toBeInstanceOf(Date);
      expect(restoredMsgs[0].content).toBe('Two Sum');
      expect(restoredMsgs[1].content).toBe('Use a HashMap');
    });

    it('filters streaming messages through the round-trip', () => {
      const messages: ChatMessage[] = [
        makeChatMessage({ id: 'done1', content: 'Final answer', isStreaming: false }),
        makeChatMessage({ id: 'stream1', content: 'Partial...', isStreaming: true }),
      ];

      const { result: first } = renderHook(() => useSessionPersistence());
      act(() => {
        first.current.saveSession({ ...makePersistedSession(), messages });
      });
      act(() => { vi.advanceTimersByTime(1000); });

      const { result: second } = renderHook(() => useSessionPersistence());
      const restored = second.current.restored!;
      expect(restored.messages).toHaveLength(1);
      expect(restored.messages[0].id).toBe('done1');
    });
  });
});

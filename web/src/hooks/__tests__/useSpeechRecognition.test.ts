import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock SpeechRecognition class
// ---------------------------------------------------------------------------

type ResultEntry = { transcript: string };
type MockResult = ResultEntry[] & { isFinal: boolean };

interface MockSpeechEvent {
  results: MockResult[];
  resultIndex: number;
}

function createMockResult(transcript: string, isFinal: boolean): MockResult {
  const entry: ResultEntry = { transcript };
  const arr = [entry] as MockResult;
  arr.isFinal = isFinal;
  return arr;
}

let mockInstance: {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: MockSpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
} | null = null;

// vi.hoisted runs before any import statements, so window.SpeechRecognition
// is available when the hook module evaluates its module-level constant.
vi.hoisted(() => {
  const MockSpeechRecognition = function (this: Record<string, unknown>) {
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.start = vi.fn();
    this.stop = vi.fn();
    this.abort = vi.fn();

    // Expose instance externally via globalThis
    (globalThis as Record<string, unknown>).__mockSpeechInstance = this;
  } as unknown;

  (globalThis as Record<string, unknown>).SpeechRecognition = MockSpeechRecognition;
});

// Mock logger to suppress output
vi.mock('../../utils/logger.js', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { useSpeechRecognition } from '../useSpeechRecognition';

// Helper to capture mock instance after start()
function getMockInstance() {
  return (globalThis as Record<string, unknown>).__mockSpeechInstance as typeof mockInstance;
}

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    mockInstance = null;
    (globalThis as Record<string, unknown>).__mockSpeechInstance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockInstance = null;
    (globalThis as Record<string, unknown>).__mockSpeechInstance = null;
  });

  /** Helper: start listening and capture mock instance */
  function startAndCapture(result: { current: ReturnType<typeof useSpeechRecognition> }) {
    act(() => {
      result.current.start();
    });
    mockInstance = getMockInstance();
  }

  // ── Initialization ──

  describe('initialization', () => {
    it('reports isSupported=true when SpeechRecognition exists', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.isSupported).toBe(true);
    });

    it('starts with isListening=false', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.isListening).toBe(false);
    });

    it('starts with empty transcript', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.transcript).toBe('');
    });

    it('starts with empty finalTranscript', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(result.current.finalTranscript).toBe('');
    });

    it('exposes start, stop, and reset functions', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ── Start / Stop ──

  describe('start and stop', () => {
    it('sets isListening=true when start is called', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(result.current.isListening).toBe(true);
    });

    it('calls recognition.start() on the underlying instance', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(mockInstance).not.toBeNull();
      expect(mockInstance!.start).toHaveBeenCalled();
    });

    it('sets isListening=false when stop is called', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(result.current.isListening).toBe(true);
      act(() => {
        result.current.stop();
      });
      expect(result.current.isListening).toBe(false);
    });

    it('calls recognition.stop() on the underlying instance', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      act(() => {
        result.current.stop();
      });
      expect(instance.stop).toHaveBeenCalled();
    });

    it('does not start a second time if already listening', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const firstInstance = mockInstance;
      act(() => {
        result.current.start();
      });
      // mockInstance would be replaced if a new instance was created
      // but since start is guarded, no new constructor call happens
      expect(getMockInstance()).toBe(firstInstance);
    });
  });

  // ── Configuration ──

  describe('configuration', () => {
    it('sets continuous=true on the recognition instance', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(mockInstance!.continuous).toBe(true);
    });

    it('sets interimResults=true on the recognition instance', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(mockInstance!.interimResults).toBe(true);
    });

    it('sets lang to en-US on the recognition instance', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(mockInstance!.lang).toBe('en-US');
    });
  });

  // ── Transcript handling ──

  describe('transcript handling', () => {
    it('updates transcript with interim results', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onresult!({
          results: [createMockResult('hello wo', false)],
          resultIndex: 0,
        });
      });
      expect(result.current.transcript).toBe('hello wo');
      expect(result.current.finalTranscript).toBe('');
    });

    it('updates finalTranscript when result isFinal', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onresult!({
          results: [createMockResult('hello world', true)],
          resultIndex: 0,
        });
      });
      expect(result.current.finalTranscript).toBe('hello world');
      expect(result.current.transcript).toBe('hello world');
    });

    it('combines final and interim results in transcript', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onresult!({
          results: [
            createMockResult('hello ', true),
            createMockResult('world is', false),
          ],
          resultIndex: 0,
        });
      });
      expect(result.current.finalTranscript).toBe('hello ');
      expect(result.current.transcript).toBe('hello world is');
    });

    it('concatenates multiple final results', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onresult!({
          results: [
            createMockResult('first. ', true),
            createMockResult('second. ', true),
          ],
          resultIndex: 0,
        });
      });
      expect(result.current.finalTranscript).toBe('first. second. ');
      expect(result.current.transcript).toBe('first. second. ');
    });
  });

  // ── Reset ──

  describe('reset', () => {
    it('clears transcript and finalTranscript', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onresult!({
          results: [createMockResult('some text', true)],
          resultIndex: 0,
        });
      });
      expect(result.current.transcript).toBe('some text');
      act(() => {
        result.current.reset();
      });
      expect(result.current.transcript).toBe('');
      expect(result.current.finalTranscript).toBe('');
    });

    it('does not affect isListening state', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      expect(result.current.isListening).toBe(true);
      act(() => {
        result.current.reset();
      });
      expect(result.current.isListening).toBe(true);
    });
  });

  // ── Error handling ──

  describe('error handling', () => {
    it('silently ignores "aborted" errors', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'aborted' });
      });
      expect(result.current.isListening).toBe(true);
    });

    it('silently ignores "no-speech" errors', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'no-speech' });
      });
      expect(result.current.isListening).toBe(true);
    });

    it('stops listening on "not-allowed" error', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'not-allowed' });
      });
      expect(result.current.isListening).toBe(false);
    });

    it('stops listening on "service-not-allowed" error', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'service-not-allowed' });
      });
      expect(result.current.isListening).toBe(false);
    });

    it('stops listening on "audio-capture" error', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'audio-capture' });
      });
      expect(result.current.isListening).toBe(false);
    });

    it('stops listening on "not-found" error', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        mockInstance!.onerror!({ error: 'not-found' });
      });
      expect(result.current.isListening).toBe(false);
    });
  });

  // ── Auto-restart on end ──

  describe('auto-restart on end', () => {
    it('restarts recognition when onend fires while still listening', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      expect(instance.start).toHaveBeenCalledTimes(1);
      act(() => {
        instance.onend!();
      });
      // Should have called start again (auto-restart)
      expect(instance.start).toHaveBeenCalledTimes(2);
      expect(result.current.isListening).toBe(true);
    });

    it('does not restart if user explicitly stopped', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      act(() => {
        result.current.stop();
      });
      // stop() nullifies onend, so the handler can't fire.
      expect(result.current.isListening).toBe(false);
      expect(instance.start).toHaveBeenCalledTimes(1);
    });

    it('stops listening if auto-restart throws', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      // Make the next start() call throw
      instance.start.mockImplementationOnce(() => {
        throw new Error('restart failed');
      });
      act(() => {
        instance.onend!();
      });
      expect(result.current.isListening).toBe(false);
    });
  });

  // ── Cleanup on unmount ──

  describe('cleanup on unmount', () => {
    it('aborts recognition on unmount', () => {
      const { result, unmount } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      unmount();
      expect(instance.abort).toHaveBeenCalled();
    });

    it('clears callbacks on unmount', () => {
      const { result, unmount } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      expect(instance.onresult).not.toBeNull();
      unmount();
      expect(instance.onresult).toBeNull();
      expect(instance.onerror).toBeNull();
      expect(instance.onend).toBeNull();
    });

    it('does not throw if unmounted without starting', () => {
      const { unmount } = renderHook(() => useSpeechRecognition());
      expect(() => unmount()).not.toThrow();
    });
  });

  // ── Stop clears handlers ──

  describe('stop clears handlers and nullifies ref', () => {
    it('nullifies onresult, onerror, onend on stop', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const instance = mockInstance!;
      expect(instance.onresult).not.toBeNull();
      expect(instance.onerror).not.toBeNull();
      expect(instance.onend).not.toBeNull();
      act(() => {
        result.current.stop();
      });
      expect(instance.onresult).toBeNull();
      expect(instance.onerror).toBeNull();
      expect(instance.onend).toBeNull();
    });

    it('stop is safe to call when not listening', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      expect(() => {
        act(() => {
          result.current.stop();
        });
      }).not.toThrow();
      expect(result.current.isListening).toBe(false);
    });
  });

  // ── Guard checks / restart cycles ──

  describe('guard checks and restart cycles', () => {
    it('start is a no-op when already listening', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      const firstCallCount = mockInstance!.start.mock.calls.length;
      act(() => {
        result.current.start();
      });
      expect(mockInstance!.start.mock.calls.length).toBe(firstCallCount);
    });

    it('can start again after stopping', () => {
      const { result } = renderHook(() => useSpeechRecognition());
      startAndCapture(result);
      act(() => {
        result.current.stop();
      });
      expect(result.current.isListening).toBe(false);
      act(() => {
        result.current.start();
      });
      expect(result.current.isListening).toBe(true);
    });
  });
});

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../useChat';
import type { ChatMessage, ChatContext } from '../../types';

// ── Mocks ──

// Capture the callbacks passed to streamChat so tests can drive the stream
let capturedCallbacks: {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  onEditorUpdate?: (starterCode: string, testCode: string) => void;
  onRateLimit?: (remaining: number, limit: number, plan: string) => void;
};
let capturedPayload: { messages: { role: string; content: string }[]; context?: ChatContext };
let capturedSignal: AbortSignal | undefined;
let capturedOptions: { accessToken?: string } | undefined;

const mockStreamChat = vi.fn();

vi.mock('../../services/api.js', () => ({
  streamChat: (...args: unknown[]) => mockStreamChat(...args),
}));

vi.mock('../../utils/logger.js', () => ({
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ── Helpers ──

function makeMessage(overrides?: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'hello',
    timestamp: new Date(),
    ...overrides,
  };
}

function defaultContext(): ChatContext {
  return {
    mode: 'TEACHER',
    currentProblem: null,
    hintsUsed: 0,
    commitmentGateCompleted: 0,
    interviewStage: null,
  };
}

function setup(overrides?: Partial<Parameters<typeof useChat>[0]>) {
  const getContext = vi.fn(() => defaultContext());
  const onEditorUpdate = vi.fn();
  const onRateLimit = vi.fn();

  const hookResult = renderHook(() =>
    useChat({
      initialMessages: [],
      getContext,
      onEditorUpdate,
      accessToken: undefined,
      onRateLimit,
      ...overrides,
    }),
  );

  return { ...hookResult, getContext, onEditorUpdate, onRateLimit };
}

// ── Setup ──

beforeEach(() => {
  vi.clearAllMocks();
  mockStreamChat.mockImplementation(
    (payload: typeof capturedPayload, callbacks: typeof capturedCallbacks, signal?: AbortSignal, options?: typeof capturedOptions) => {
      capturedPayload = payload;
      capturedCallbacks = callbacks;
      capturedSignal = signal;
      capturedOptions = options;
    },
  );
});

// ── Tests ──

describe('useChat', () => {
  // ── Initialization ──

  describe('initialization', () => {
    it('starts with empty messages when initialMessages is empty', () => {
      const { result } = setup();
      expect(result.current.messages).toEqual([]);
    });

    it('starts with provided initialMessages', () => {
      const initial = [makeMessage({ id: 'init-1', content: 'hi' })];
      const { result } = setup({ initialMessages: initial });
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('hi');
    });

    it('starts with isStreaming = false', () => {
      const { result } = setup();
      expect(result.current.isStreaming).toBe(false);
    });

    it('exposes sendMessage, sendSilentMessage, stopStreaming, setMessages functions', () => {
      const { result } = setup();
      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.sendSilentMessage).toBe('function');
      expect(typeof result.current.stopStreaming).toBe('function');
      expect(typeof result.current.setMessages).toBe('function');
    });
  });

  // ── sendMessage ──

  describe('sendMessage', () => {
    it('appends a user message and a streaming mentor message', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('What is two sum?'));

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('What is two sum?');
      expect(result.current.messages[1].role).toBe('mentor');
      expect(result.current.messages[1].content).toBe('');
      expect(result.current.messages[1].isStreaming).toBe(true);
    });

    it('sets isStreaming to true', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));
      expect(result.current.isStreaming).toBe(true);
    });

    it('calls streamChat with the correct payload', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('solve it'));

      expect(mockStreamChat).toHaveBeenCalledTimes(1);
      expect(capturedPayload.messages).toEqual([
        { role: 'user', content: 'solve it' },
      ]);
    });

    it('includes previous messages in payload (excluding empty content)', () => {
      const initial: ChatMessage[] = [
        makeMessage({ id: 'u1', role: 'user', content: 'first' }),
        makeMessage({ id: 'm1', role: 'mentor', content: 'response' }),
        makeMessage({ id: 'm2', role: 'mentor', content: '' }), // empty, should be filtered
      ];
      const { result } = setup({ initialMessages: initial });
      act(() => result.current.sendMessage('second'));

      // Should include non-empty previous messages + the new user message
      expect(capturedPayload.messages).toEqual([
        { role: 'user', content: 'first' },
        { role: 'mentor', content: 'response' },
        { role: 'user', content: 'second' },
      ]);
    });

    it('passes context from getContext', () => {
      const ctx = defaultContext();
      const { result, getContext } = setup();
      getContext.mockReturnValue(ctx);
      act(() => result.current.sendMessage('hi'));

      expect(capturedPayload.context).toEqual(ctx);
    });

    it('does nothing when already streaming', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('first'));
      act(() => result.current.sendMessage('second'));

      // Only one streamChat call, only 2 messages (from first call)
      expect(mockStreamChat).toHaveBeenCalledTimes(1);
      expect(result.current.messages).toHaveLength(2);
    });

    it('passes includeEditorUpdate=true so onEditorUpdate is forwarded', () => {
      const onEditorUpdate = vi.fn();
      const { result } = setup({ onEditorUpdate });
      act(() => result.current.sendMessage('solve'));

      // Invoke the onEditorUpdate callback from stream
      capturedCallbacks.onEditorUpdate?.('starter', 'test');
      expect(onEditorUpdate).toHaveBeenCalledWith('starter', 'test');
    });

    it('passes accessToken in options', () => {
      const { result } = setup({ accessToken: 'tok-123' });
      act(() => result.current.sendMessage('go'));

      expect(capturedOptions).toEqual({ accessToken: 'tok-123' });
    });

    it('passes an AbortSignal to streamChat', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hi'));
      expect(capturedSignal).toBeInstanceOf(AbortSignal);
      expect(capturedSignal!.aborted).toBe(false);
    });
  });

  // ── Streaming callbacks (onDelta, onDone, onError) ──

  describe('streaming callbacks', () => {
    it('onDelta appends text to the streaming mentor message', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      act(() => capturedCallbacks.onDelta('chunk1'));
      expect(result.current.messages[1].content).toBe('chunk1');

      act(() => capturedCallbacks.onDelta(' chunk2'));
      expect(result.current.messages[1].content).toBe('chunk1 chunk2');
    });

    it('onDone sets isStreaming to false and clears the streaming flag on the message', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      act(() => capturedCallbacks.onDelta('answer'));
      act(() => capturedCallbacks.onDone());

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.messages[1].isStreaming).toBe(false);
      expect(result.current.messages[1].content).toBe('answer');
    });

    it('onError sets error content when mentor message is empty', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      act(() => capturedCallbacks.onError('Server down'));

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.messages[1].content).toBe('**Error:** Server down');
      expect(result.current.messages[1].isError).toBe(true);
      expect(result.current.messages[1].isStreaming).toBe(false);
    });

    it('onError keeps existing content when mentor message has content', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      act(() => capturedCallbacks.onDelta('partial response'));
      act(() => capturedCallbacks.onError('Connection lost'));

      // Content should remain as the partial response (not replaced by error)
      expect(result.current.messages[1].content).toBe('partial response');
      expect(result.current.messages[1].isError).toBe(false);
      expect(result.current.messages[1].isStreaming).toBe(false);
    });
  });

  // ── onRateLimit ──

  describe('onRateLimit callback', () => {
    it('passes onRateLimit to streamChat callbacks', () => {
      const onRateLimit = vi.fn();
      const { result } = setup({ onRateLimit });
      act(() => result.current.sendMessage('test'));

      capturedCallbacks.onRateLimit?.(5, 10, 'free');
      expect(onRateLimit).toHaveBeenCalledWith(5, 10, 'free');
    });

    it('works when onRateLimit is not provided', () => {
      const { result } = setup({ onRateLimit: undefined });
      act(() => result.current.sendMessage('test'));

      // Should not throw
      expect(capturedCallbacks.onRateLimit).toBeUndefined();
    });
  });

  // ── sendSilentMessage ──

  describe('sendSilentMessage', () => {
    it('appends only a mentor message (no user message)', () => {
      const { result } = setup();
      act(() => result.current.sendSilentMessage('/interview phone'));

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('mentor');
      expect(result.current.messages[0].content).toBe('');
      expect(result.current.messages[0].isStreaming).toBe(true);
    });

    it('sets isStreaming to true', () => {
      const { result } = setup();
      act(() => result.current.sendSilentMessage('/interview'));
      expect(result.current.isStreaming).toBe(true);
    });

    it('sends only the silent content as payload (no previous messages)', () => {
      const initial = [makeMessage({ id: 'old', content: 'old msg' })];
      const { result } = setup({ initialMessages: initial });
      act(() => result.current.sendSilentMessage('/interview phone'));

      expect(capturedPayload.messages).toEqual([
        { role: 'user', content: '/interview phone' },
      ]);
    });

    it('does nothing when already streaming', () => {
      const { result } = setup();
      act(() => result.current.sendSilentMessage('first'));
      act(() => result.current.sendSilentMessage('second'));

      expect(mockStreamChat).toHaveBeenCalledTimes(1);
      expect(result.current.messages).toHaveLength(1);
    });

    it('does not pass onEditorUpdate to streamChat', () => {
      const onEditorUpdate = vi.fn();
      const { result } = setup({ onEditorUpdate });
      act(() => result.current.sendSilentMessage('/command'));

      // onEditorUpdate should not be in callbacks since includeEditorUpdate is not set
      expect(capturedCallbacks.onEditorUpdate).toBeUndefined();
    });

    it('streams delta into the mentor message correctly', () => {
      const { result } = setup();
      act(() => result.current.sendSilentMessage('/start'));

      act(() => capturedCallbacks.onDelta('Interview '));
      act(() => capturedCallbacks.onDelta('starting...'));

      expect(result.current.messages[0].content).toBe('Interview starting...');
    });
  });

  // ── stopStreaming ──

  describe('stopStreaming', () => {
    it('aborts the active AbortController', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      const signal = capturedSignal!;
      expect(signal.aborted).toBe(false);

      act(() => result.current.stopStreaming());
      expect(signal.aborted).toBe(true);
    });

    it('sets isStreaming to false', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));
      expect(result.current.isStreaming).toBe(true);

      act(() => result.current.stopStreaming());
      expect(result.current.isStreaming).toBe(false);
    });

    it('marks the streaming message as no longer streaming', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));
      act(() => capturedCallbacks.onDelta('partial'));

      act(() => result.current.stopStreaming());
      expect(result.current.messages[1].isStreaming).toBe(false);
      expect(result.current.messages[1].content).toBe('partial');
    });

    it('is safe to call when not streaming', () => {
      const { result } = setup();
      // Should not throw
      act(() => result.current.stopStreaming());
      expect(result.current.isStreaming).toBe(false);
    });
  });

  // ── setMessages (wrappedSetMessages) ──

  describe('setMessages', () => {
    it('replaces messages with a direct value', () => {
      const { result } = setup();
      const newMsgs = [makeMessage({ id: 'new', content: 'replaced' })];

      act(() => result.current.setMessages(newMsgs));
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('replaced');
    });

    it('accepts a function updater', () => {
      const initial = [makeMessage({ id: 'a', content: 'A' })];
      const { result } = setup({ initialMessages: initial });

      act(() =>
        result.current.setMessages((prev) => [
          ...prev,
          makeMessage({ id: 'b', content: 'B' }),
        ]),
      );

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].content).toBe('B');
    });

    it('clears messages when set to empty array', () => {
      const initial = [makeMessage()];
      const { result } = setup({ initialMessages: initial });

      act(() => result.current.setMessages([]));
      expect(result.current.messages).toHaveLength(0);
    });
  });

  // ── messagesRef sync ──

  describe('messagesRef sync', () => {
    it('keeps messagesRef in sync so subsequent sendMessage uses up-to-date messages', () => {
      const { result } = setup();

      // Send first message, complete streaming
      act(() => result.current.sendMessage('first'));
      act(() => capturedCallbacks.onDelta('answer1'));
      act(() => capturedCallbacks.onDone());

      // Send second message
      act(() => result.current.sendMessage('second'));

      // Payload should include the first user + mentor messages + second user
      expect(capturedPayload.messages).toEqual([
        { role: 'user', content: 'first' },
        { role: 'mentor', content: 'answer1' },
        { role: 'user', content: 'second' },
      ]);
    });

    it('messagesRef stays in sync after setMessages', () => {
      const { result } = setup();

      // Set messages directly
      const msgs: ChatMessage[] = [
        makeMessage({ id: 'x', role: 'user', content: 'preset' }),
      ];
      act(() => result.current.setMessages(msgs));

      // Now send a message - payload should include the preset message
      act(() => result.current.sendMessage('follow up'));

      expect(capturedPayload.messages).toEqual([
        { role: 'user', content: 'preset' },
        { role: 'user', content: 'follow up' },
      ]);
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles rapid send after stream completes', () => {
      const { result } = setup();

      act(() => result.current.sendMessage('msg1'));
      act(() => capturedCallbacks.onDone());

      act(() => result.current.sendMessage('msg2'));
      act(() => capturedCallbacks.onDone());

      // Should have 4 messages: user1, mentor1, user2, mentor2
      expect(result.current.messages).toHaveLength(4);
      expect(result.current.isStreaming).toBe(false);
    });

    it('handles error after partial delta content', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      act(() => capturedCallbacks.onDelta('partial'));
      act(() => capturedCallbacks.onError('timeout'));

      const mentor = result.current.messages[1];
      expect(mentor.content).toBe('partial');
      expect(mentor.isError).toBe(false); // not error because content already present
      expect(mentor.isStreaming).toBe(false);
    });

    it('handles error with empty content (shows error message)', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));
      act(() => capturedCallbacks.onError('fail'));

      const mentor = result.current.messages[1];
      expect(mentor.content).toBe('**Error:** fail');
      expect(mentor.isError).toBe(true);
    });

    it('can send again after stopping streaming', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('first'));
      act(() => result.current.stopStreaming());

      // Should be able to send another message
      act(() => result.current.sendMessage('second'));
      expect(mockStreamChat).toHaveBeenCalledTimes(2);
      expect(result.current.messages).toHaveLength(4); // user1+mentor1+user2+mentor2
    });

    it('can interleave sendMessage and sendSilentMessage', () => {
      const { result } = setup();

      act(() => result.current.sendMessage('visible'));
      act(() => capturedCallbacks.onDone());

      act(() => result.current.sendSilentMessage('/command'));
      act(() => capturedCallbacks.onDelta('silent response'));
      act(() => capturedCallbacks.onDone());

      // 2 from sendMessage (user+mentor) + 1 from silent (mentor only)
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[2].role).toBe('mentor');
      expect(result.current.messages[2].content).toBe('silent response');
    });

    it('each message gets a unique id', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('msg'));

      const ids = result.current.messages.map((m) => m.id);
      expect(new Set(ids).size).toBe(2); // 2 unique ids
    });

    it('messages have timestamps set to Date objects', () => {
      const { result } = setup();
      act(() => result.current.sendMessage('hello'));

      for (const msg of result.current.messages) {
        expect(msg.timestamp).toBeInstanceOf(Date);
      }
    });
  });
});

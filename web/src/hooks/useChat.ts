import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../services/api.js';
import type { ChatMessage, ChatContext } from '../types/index.js';
import { logger } from '../utils/logger.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface UseChatOptions {
  initialMessages: ChatMessage[];
  getContext: () => ChatContext | undefined;
  onEditorUpdate?: (starterCode: string, testCode: string) => void;
  accessToken?: string;
  onRateLimit?: (remaining: number, limit: number, plan: string) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isStreaming: boolean;
  sendMessage: (content: string) => void;
  sendSilentMessage: (content: string) => void;
  stopStreaming: () => void;
}

export function useChat({ initialMessages, getContext, onEditorUpdate, accessToken, onRateLimit }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>(initialMessages);

  // Keep ref in sync with state
  const wrappedSetMessages: typeof setMessages = useCallback((action) => {
    setMessages((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      messagesRef.current = next;
      return next;
    });
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    // Mark the streaming message as done
    wrappedSetMessages((msgs) =>
      msgs.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    );
  }, [wrappedSetMessages]);

  /** Shared streaming logic — sets up abort controller, calls streamChat, handles callbacks. */
  const doStream = useCallback(
    (opts: {
      mentorMsgId: string;
      payload: { role: string; content: string }[];
      includeEditorUpdate?: boolean;
    }) => {
      setIsStreaming(true);
      const abortController = new AbortController();
      abortRef.current = abortController;

      const context = getContext();

      streamChat(
        { messages: opts.payload, context },
        {
          onDelta: (text) => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === opts.mentorMsgId
                  ? { ...m, content: m.content + text }
                  : m,
              ),
            );
          },
          onDone: () => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === opts.mentorMsgId ? { ...m, isStreaming: false } : m,
              ),
            );
            setIsStreaming(false);
            abortRef.current = null;
          },
          onError: (message) => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === opts.mentorMsgId
                  ? {
                      ...m,
                      content: m.content || `**Error:** ${message}`,
                      isStreaming: false,
                      isError: !m.content,
                    }
                  : m,
              ),
            );
            setIsStreaming(false);
            abortRef.current = null;
          },
          ...(opts.includeEditorUpdate ? { onEditorUpdate } : {}),
          onRateLimit,
        },
        abortController.signal,
        { accessToken },
      );
    },
    [getContext, wrappedSetMessages, onEditorUpdate, accessToken, onRateLimit],
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (isStreaming) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      const mentorMsgId = generateId();
      const mentorMsg: ChatMessage = {
        id: mentorMsgId,
        role: 'mentor',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      // Snapshot current messages BEFORE the queued state update
      const currentMessages = messagesRef.current;
      wrappedSetMessages((prev) => [...prev, userMsg, mentorMsg]);

      // Build payload from snapshot + new user message
      // (messagesRef is stale here because React batches the setState updater)
      const payload = [
        ...currentMessages
          .filter((m) => m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMsg.role, content: userMsg.content },
      ];

      doStream({ mentorMsgId, payload, includeEditorUpdate: true });
    },
    [isStreaming, wrappedSetMessages, doStream],
  );

  /**
   * Send a message to Claude without showing the user message in chat.
   * Only the mentor's response will appear - useful for programmatic commands
   * like starting interviews where we don't want "/interview..." visible.
   */
  const sendSilentMessage = useCallback(
    (content: string) => {
      logger.log('[useChat] sendSilentMessage called with:', content);
      if (isStreaming) {
        logger.log('[useChat] Already streaming, skipping');
        return;
      }

      const mentorMsgId = generateId();
      const mentorMsg: ChatMessage = {
        id: mentorMsgId,
        role: 'mentor',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      wrappedSetMessages((prev) => [...prev, mentorMsg]);

      doStream({
        mentorMsgId,
        payload: [{ role: 'user' as const, content }],
      });
    },
    [isStreaming, wrappedSetMessages, doStream],
  );

  return { messages, setMessages: wrappedSetMessages, isStreaming, sendMessage, sendSilentMessage, stopStreaming };
}

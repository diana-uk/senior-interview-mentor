import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../services/api.js';
import type { ChatMessage, ChatContext } from '../types/index.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface UseChatOptions {
  initialMessages: ChatMessage[];
  getContext: () => ChatContext | undefined;
}

interface UseChatReturn {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isStreaming: boolean;
  sendMessage: (content: string) => void;
  stopStreaming: () => void;
}

export function useChat({ initialMessages, getContext }: UseChatOptions): UseChatReturn {
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

      wrappedSetMessages((prev) => [...prev, userMsg, mentorMsg]);

      setIsStreaming(true);
      const abortController = new AbortController();
      abortRef.current = abortController;

      const context = getContext();

      // Build payload from messages ref (includes user msg, excludes empty mentor msg)
      const payload = messagesRef.current
        .filter((m) => m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      streamChat(
        { messages: payload, context },
        {
          onDelta: (text) => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === mentorMsgId
                  ? { ...m, content: m.content + text }
                  : m,
              ),
            );
          },
          onDone: () => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === mentorMsgId ? { ...m, isStreaming: false } : m,
              ),
            );
            setIsStreaming(false);
            abortRef.current = null;
          },
          onError: (message) => {
            wrappedSetMessages((msgs) =>
              msgs.map((m) =>
                m.id === mentorMsgId
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
        },
        abortController.signal,
      );
    },
    [isStreaming, getContext, wrappedSetMessages],
  );

  return { messages, setMessages: wrappedSetMessages, isStreaming, sendMessage, stopStreaming };
}

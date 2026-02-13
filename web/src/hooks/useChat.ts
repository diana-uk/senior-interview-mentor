import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../services/api.js';
import type { ChatMessage, ChatContext } from '../types/index.js';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface UseChatOptions {
  initialMessages: ChatMessage[];
  getContext: () => ChatContext | undefined;
  onEditorUpdate?: (starterCode: string, testCode: string) => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isStreaming: boolean;
  sendMessage: (content: string) => void;
  sendSilentMessage: (content: string) => void;
  stopStreaming: () => void;
}

export function useChat({ initialMessages, getContext, onEditorUpdate }: UseChatOptions): UseChatReturn {
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

      // Snapshot current messages BEFORE the queued state update
      const currentMessages = messagesRef.current;

      wrappedSetMessages((prev) => [...prev, userMsg, mentorMsg]);

      setIsStreaming(true);
      const abortController = new AbortController();
      abortRef.current = abortController;

      const context = getContext();

      // Build payload from snapshot + new user message
      // (messagesRef is stale here because React batches the setState updater)
      const payload = [
        ...currentMessages
          .filter((m) => m.content.length > 0)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMsg.role, content: userMsg.content },
      ];

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
          onEditorUpdate,
        },
        abortController.signal,
      );
    },
    [isStreaming, getContext, wrappedSetMessages, onEditorUpdate],
  );

  /**
   * Send a message to Claude without showing the user message in chat.
   * Only the mentor's response will appear - useful for programmatic commands
   * like starting interviews where we don't want "/interview..." visible.
   */
  const sendSilentMessage = useCallback(
    (content: string) => {
      console.log('[useChat] sendSilentMessage called with:', content);
      if (isStreaming) {
        console.log('[useChat] Already streaming, skipping');
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

      // Only add the mentor message placeholder (no user message)
      wrappedSetMessages((prev) => [...prev, mentorMsg]);

      setIsStreaming(true);
      const abortController = new AbortController();
      abortRef.current = abortController;

      const context = getContext();

      // Build payload - just the silent command (fresh start, no history)
      // The user message won't appear in UI since we didn't add it to state
      const payload: { role: 'mentor' | 'user'; content: string }[] = [
        { role: 'user' as const, content },
      ];

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

  return { messages, setMessages: wrappedSetMessages, isStreaming, sendMessage, sendSilentMessage, stopStreaming };
}

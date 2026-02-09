import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import type { ChatMessage } from '../../types';
import ChatMessageItem from '../chat/ChatMessage';

interface MentorPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
}

export default function MentorPanel({ messages, onSendMessage, isStreaming, onStopStreaming }: MentorPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  }

  return (
    <div className="mentor-panel">
      <div className="mentor-panel__header">
        <span className="mentor-panel__title">Mentor</span>
        <span className="mentor-panel__badge">INTERVIEWER</span>
      </div>

      <div className="mentor-panel__messages">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="streaming-indicator">
            <span className="streaming-dot" />
            <span className="streaming-dot" />
            <span className="streaming-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mentor-panel__input">
        <textarea
          ref={inputRef}
          className="mentor-panel__textarea"
          placeholder={isStreaming ? 'Mentor is responding...' : 'Ask the mentor...'}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button className="mentor-panel__btn mentor-panel__btn--stop" onClick={onStopStreaming}>
            <Square size={14} />
          </button>
        ) : (
          <button className="mentor-panel__btn mentor-panel__btn--send" onClick={handleSubmit} disabled={!input.trim()}>
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

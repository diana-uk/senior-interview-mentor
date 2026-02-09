import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import type { ChatMessage, Mode } from '../../types';
import ChatMessageItem from './ChatMessage';

interface ChatPanelProps {
  mode: Mode;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  hidden?: boolean;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
}

const slashCommands = ['/hint', '/check', '/stuck', '/recap', '/solve', '/review'];

export default function ChatPanel({ mode, messages, onSendMessage, hidden, isStreaming, onStopStreaming }: ChatPanelProps) {
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
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
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  const modeClass = mode.toLowerCase();

  return (
    <div className={`panel-chat ${hidden ? 'panel-hidden' : ''}`}>
      <div className="chat-header">
        <span className={`mode-badge mode-badge--${modeClass}`}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {mode}
        </span>
        {mode === 'INTERVIEWER' && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Interview in progress</span>
        )}
      </div>

      <div className="chat-messages">
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

      <div className="chat-input-area">
        <div className="chat-slash-commands">
          {slashCommands.map((cmd) => (
            <button
              key={cmd}
              className="slash-cmd"
              onClick={() => {
                setInput(cmd + ' ');
                inputRef.current?.focus();
              }}
              disabled={isStreaming}
            >
              {cmd}
            </button>
          ))}
        </div>
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={isStreaming ? 'Mentor is responding...' : 'Type a message or use a /command...'}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              className="chat-stop-btn"
              onClick={onStopStreaming}
              title="Stop generating"
            >
              <Square size={14} />
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

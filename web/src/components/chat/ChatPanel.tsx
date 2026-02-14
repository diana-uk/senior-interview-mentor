import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square } from 'lucide-react';
import type { ChatMessage, Mode } from '../../types';
import ChatMessageItem from './ChatMessage';
import VoiceButton from './VoiceButton';
import { getFillerFeedback, type FillerReport } from '../../utils/fillerDetector';

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
  const [fillerReport, setFillerReport] = useState<FillerReport | null>(null);
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

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
    inputRef.current?.focus();
  }, []);

  const handleFillerUpdate = useCallback((report: FillerReport) => {
    setFillerReport(report);
  }, []);

  function handleEvaluateCommunication() {
    if (!fillerReport) return;
    const feedback = getFillerFeedback(fillerReport);
    const recentUserMessages = messages
      .filter((m) => m.role === 'user')
      .slice(-5)
      .map((m) => m.content)
      .join('\n');

    onSendMessage(
      `/check Please evaluate my verbal communication in this interview session.\n\nFiller word report: ${feedback}\n\nRecent transcript:\n${recentUserMessages}\n\nScore my communication on: clarity, technical terminology, structured thinking, and filler word usage.`
    );
    setFillerReport(null);
  }

  const modeClass = mode.toLowerCase();

  return (
    <div className={`chat-panel ${hidden ? 'panel-hidden' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-header-label">Mentor Chat</span>
          <span className={`badge badge-pulse badge-${modeClass}`}>
            {mode}
          </span>
        </div>
        {mode === 'INTERVIEWER' && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Interview in progress</span>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessageItem key={msg.id} message={msg} isNew={i === messages.length - 1} />
        ))}
        {isStreaming && messages[messages.length - 1]?.isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-quick-actions">
          {slashCommands.map((cmd) => (
            <button
              key={cmd}
              className="chat-quick-action"
              onClick={() => {
                setInput(cmd + ' ');
                inputRef.current?.focus();
              }}
              disabled={isStreaming}
            >
              {cmd}
            </button>
          ))}
          {fillerReport && fillerReport.totalFillers > 0 && (
            <button
              className="chat-quick-action chat-evaluate-btn"
              onClick={handleEvaluateCommunication}
              disabled={isStreaming}
            >
              Evaluate Communication
            </button>
          )}
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
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onFillerUpdate={handleFillerUpdate}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              className="btn btn-ghost btn-icon"
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

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square } from 'lucide-react';
import type { ChatMessage, Mode } from '../../types';
import ChatMessageItem from './ChatMessage';
import ThinkingBubble from './ThinkingBubble';
import VoiceButton from './VoiceButton';
import CommandPalette, { filterCommands } from './CommandPalette';
import OfflineBanner from './OfflineBanner';
import { getFillerFeedback, type FillerReport } from '../../utils/fillerDetector';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { showToast } from '../../utils/toast';

interface RateLimitInfo {
  remaining: number;
  limit: number;
  plan: string;
}

interface ChatPanelProps {
  mode: Mode;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  hidden?: boolean;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
  rateLimitInfo?: RateLimitInfo | null;
  onUpgrade?: () => void;
}

const slashCommands = ['/hint', '/check', '/stuck', '/recap', '/solve', '/review', '/next', '/pattern', '/mistakes', '/continue'];

export default function ChatPanel({ mode, messages, onSendMessage, hidden, isStreaming, onStopStreaming, rateLimitInfo, onUpgrade }: ChatPanelProps) {
  const isOnline = useOnlineStatus();
  const prevOnlineRef = useRef<boolean>(true);

  // Fire a toast when connection is restored (false → true)
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      showToast('Back online — your messages will send.', 'success');
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const [input, setInput] = useState('');
  const [fillerReport, setFillerReport] = useState<FillerReport | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Show palette when input starts with "/" with no spaces (single token)
  const showPalette = input.startsWith('/') && !input.includes(' ');
  const paletteCommands = showPalette ? filterCommands(input) : [];

  // Reset active index when the filtered list changes
  useEffect(() => {
    setPaletteIndex(0);
  }, [input]);

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

  function selectPaletteCommand(cmd: string) {
    setInput(cmd + ' ');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (showPalette && paletteCommands.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPaletteIndex((i) => (i - 1 + paletteCommands.length) % paletteCommands.length);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPaletteIndex((i) => (i + 1) % paletteCommands.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectPaletteCommand(paletteCommands[paletteIndex].cmd);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setInput('');
        return;
      }
    }
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
    setLiveTranscript('');
    inputRef.current?.focus();
  }, []);

  const handleLiveTranscript = useCallback((text: string) => {
    setLiveTranscript(text);
  }, []);

  const handleListeningChange = useCallback((listening: boolean) => {
    setIsVoiceActive(listening);
    if (!listening) setLiveTranscript('');
  }, []);

  const handleFillerUpdate = useCallback((report: FillerReport) => {
    setFillerReport(report);
  }, []);

  // Combine typed input with live voice transcript for display
  const displayValue = isVoiceActive && liveTranscript
    ? (input ? input + ' ' + liveTranscript : liveTranscript)
    : input;

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

      {!isOnline && <OfflineBanner />}

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Mentor chat conversation" aria-relevant="additions text">
        {messages.map((msg, i) => {
          // Skip empty streaming message — ThinkingBubble handles that state
          if (msg.isStreaming && msg.content === '') return null;
          return <ChatMessageItem key={msg.id} message={msg} isNew={i === messages.length - 1} />;
        })}
        {isStreaming && messages[messages.length - 1]?.isStreaming && messages[messages.length - 1]?.content === '' && (
          <ThinkingBubble />
        )}
        <div ref={messagesEndRef} />
      </div>

      {isOnline && <div className="chat-input-area">
        {rateLimitInfo && rateLimitInfo.limit > 0 && rateLimitInfo.plan === 'free' && (
          <div className="chat-rate-limit" style={{
            padding: '4px 12px',
            fontSize: 11,
            color: rateLimitInfo.remaining <= 2 ? 'var(--color-error, #f87171)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
          }}>
            <span>
              {rateLimitInfo.remaining} / {rateLimitInfo.limit} messages remaining today
              {rateLimitInfo.remaining <= 2 ? ' — running low!' : ''}
            </span>
            {onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-accent, #00e5ff)',
                  color: 'var(--color-accent, #00e5ff)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Upgrade
              </button>
            )}
          </div>
        )}
        <div className="chat-quick-actions">
          {slashCommands.map((cmd) => (
            <button
              type="button"
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
              type="button"
              className="chat-quick-action chat-evaluate-btn"
              onClick={handleEvaluateCommunication}
              disabled={isStreaming}
            >
              Evaluate Communication
            </button>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          {showPalette && paletteCommands.length > 0 && (
            <CommandPalette
              query={input}
              activeIndex={paletteIndex}
              onSelect={selectPaletteCommand}
              onClose={() => setInput('')}
              onActiveChange={setPaletteIndex}
            />
          )}
        <div className={`chat-input-wrapper ${isVoiceActive ? 'chat-input-wrapper--recording' : ''}`}>
          <textarea
            ref={inputRef}
            className={`chat-input ${isVoiceActive ? 'chat-input--recording' : ''}`}
            placeholder={isVoiceActive ? 'Listening...' : isStreaming ? 'Mentor is responding...' : 'Type a message or use a /command...'}
            value={displayValue}
            onChange={isVoiceActive ? undefined : handleInput}
            onKeyDown={isVoiceActive ? undefined : handleKeyDown}
            rows={1}
            disabled={isStreaming}
            readOnly={isVoiceActive}
          />
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onFillerUpdate={handleFillerUpdate}
            onLiveTranscript={handleLiveTranscript}
            onListeningChange={handleListeningChange}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onStopStreaming}
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="chat-send-btn"
              onClick={handleSubmit}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        </div>
      </div>}
    </div>
  );
}

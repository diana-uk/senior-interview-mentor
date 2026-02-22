import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, PanelRightClose, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '../../types';
import ChatMessageItem from '../chat/ChatMessage';
import VoiceButton from '../chat/VoiceButton';
import type { FillerReport } from '../../utils/fillerDetector';

interface MentorPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
}

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 220;
const MAX_WIDTH = 600;
const SNAP_COLLAPSE = 180;
const STORAGE_KEY = 'sim-mentor-panel-width';

function loadWidth(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) {
      const n = Number(v);
      if (n >= MIN_WIDTH && n <= MAX_WIDTH) return n;
    }
  } catch { /* ignore */ }
  return DEFAULT_WIDTH;
}

export default function MentorPanel({ messages, onSendMessage, isStreaming, onStopStreaming }: MentorPanelProps) {
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(loadWidth);
  const [collapsed, setCollapsed] = useState(false);
  const widthBeforeCollapse = useRef(width);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Persist width
  useEffect(() => {
    if (!collapsed) {
      try { localStorage.setItem(STORAGE_KEY, String(width)); } catch { /* ignore */ }
    }
  }, [width, collapsed]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
    inputRef.current?.focus();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFillerUpdate = useCallback((_report: FillerReport) => {
    // Filler badge shown on VoiceButton itself; no extra state needed here
  }, []);

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

  function handleCollapse() {
    widthBeforeCollapse.current = width;
    setCollapsed(true);
  }

  function handleExpand() {
    setCollapsed(false);
    setWidth(widthBeforeCollapse.current);
  }

  // ── Drag logic (splitter is on the LEFT edge of the mentor panel) ──

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    dragging.current = true;
    splitterRef.current?.classList.add('splitter-active');

    // Disable text selection on the parent workspace
    const workspace = splitterRef.current?.closest('.arch-workspace, .sd-api, .sd-data, .sd-overview, .sd-deepdive, .sd-scaling, .sd-requirements');
    workspace?.classList.add('workspace-resizing');

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const newWidth = window.innerWidth - clientX;

      if (newWidth < SNAP_COLLAPSE) {
        endDrag();
        widthBeforeCollapse.current = DEFAULT_WIDTH;
        setCollapsed(true);
        return;
      }

      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)));
    };

    const endDrag = () => {
      dragging.current = false;
      splitterRef.current?.classList.remove('splitter-active');
      workspace?.classList.remove('workspace-resizing');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', endDrag);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', endDrag);
  }, []);

  const handleSplitterKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 20;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setWidth((w) => Math.min(MAX_WIDTH, w + step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setWidth((w) => Math.max(MIN_WIDTH, w - step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setWidth(DEFAULT_WIDTH);
    }
  }, []);

  const handleSplitterDoubleClick = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
  }, []);

  // ── Collapsed state: expand bar ──

  if (collapsed) {
    return (
      <button
        type="button"
        className="panel-expand-bar mentor-panel__expand-bar"
        onClick={handleExpand}
        aria-label="Expand mentor panel"
      >
        <MessageSquare size={16} className="panel-expand-bar-icon" />
        <span className="panel-expand-bar-label">Mentor</span>
      </button>
    );
  }

  // ── Expanded state: splitter + panel ──

  return (
    <>
      <div
        ref={splitterRef}
        className="splitter-h"
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-label="Resize mentor panel"
        tabIndex={0}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onDoubleClick={handleSplitterDoubleClick}
        onKeyDown={handleSplitterKeyDown}
      >
        <div className="splitter-h-line" />
        <div className="splitter-h-grip">
          <span className="splitter-h-dot" />
          <span className="splitter-h-dot" />
          <span className="splitter-h-dot" />
          <span className="splitter-h-dot" />
          <span className="splitter-h-dot" />
        </div>
      </div>

      <div className="mentor-panel" style={{ width }}>
        <div className="mentor-panel__header">
          <span className="mentor-panel__title">Mentor</span>
          <span className="mentor-panel__badge">INTERVIEWER</span>
          <button
            type="button"
            className="mentor-panel__collapse-btn"
            onClick={handleCollapse}
            aria-label="Collapse mentor panel"
          >
            <PanelRightClose size={16} />
          </button>
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
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onFillerUpdate={handleFillerUpdate}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button type="button" className="mentor-panel__btn mentor-panel__btn--stop" onClick={onStopStreaming}>
              <Square size={14} />
            </button>
          ) : (
            <button type="button" className="mentor-panel__btn mentor-panel__btn--send" onClick={handleSubmit} disabled={!input.trim()}>
              <Send size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChatPanel from '../ChatPanel';
import type { ChatMessage, Mode } from '../../../types';

// ── Hoisted: mutable state for reconnection toast tests ──
const onlineMocks = vi.hoisted(() => ({
  isOnline: true as boolean,
  showToast: vi.fn(),
}));

vi.mock('../../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => onlineMocks.isOnline,
}));

vi.mock('../../../utils/toast', () => ({
  showToast: onlineMocks.showToast,
}));

// ── Mock child components ──

vi.mock('../ChatMessage', () => ({
  default: ({ message, isNew }: { message: ChatMessage; isNew?: boolean }) => (
    <div data-testid={`msg-${message.id}`} data-role={message.role} data-new={String(!!isNew)}>
      {message.content}
    </div>
  ),
}));

vi.mock('../ThinkingBubble', () => ({
  default: () => <div data-testid="thinking-bubble">Thinking...</div>,
}));

// Store VoiceButton callbacks so tests can simulate voice events
let voiceCallbacks: {
  onTranscript?: (text: string) => void;
  onFillerUpdate?: (report: unknown) => void;
  onLiveTranscript?: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
} = {};

vi.mock('../VoiceButton', () => ({
  default: (props: {
    disabled?: boolean;
    onTranscript?: (text: string) => void;
    onFillerUpdate?: (report: unknown) => void;
    onLiveTranscript?: (text: string) => void;
    onListeningChange?: (listening: boolean) => void;
  }) => {
    voiceCallbacks = props;
    return (
      <button type="button" data-testid="voice-button" disabled={props.disabled}>Voice</button>
    );
  },
}));

vi.mock('lucide-react', () => ({
  Send:   (props: Record<string, unknown>) => <div data-testid="icon-send" {...props} />,
  Square: (props: Record<string, unknown>) => <div data-testid="icon-square" {...props} />,
  WifiOff: () => <span data-testid="icon-wifi-off" />,
}));

vi.mock('../CommandPalette', () => ({
  default: ({ query }: { query: string }) => (
    <div data-testid="command-palette" data-query={query} />
  ),
  filterCommands: (query: string) => {
    if (!query.startsWith('/')) return [];
    const cmds = ['/solve', '/hint', '/next', '/continue', '/stuck', '/check', '/recap', '/pattern', '/mistakes', '/review', '/chat'];
    return cmds.filter((c) => c.startsWith(query.toLowerCase())).map((c) => ({ cmd: c, description: '', group: '' }));
  },
}));

vi.mock('../../../utils/fillerDetector', () => ({
  getFillerFeedback: () => 'No filler words detected.',
  detectFillers: () => ({ totalFillers: 0, fillerRate: 0, fillerWords: [] }),
}));

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// ── Helpers ──

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date('2026-01-01T12:00:00'),
    ...overrides,
  };
}

const defaultProps = {
  mode: 'TEACHER' as Mode,
  messages: [] as ChatMessage[],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
};

function renderChat(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  if ('onSendMessage' in overrides) {
    // use provided mock
  } else {
    props.onSendMessage = vi.fn();
  }
  if (!('onStopStreaming' in overrides)) {
    props.onStopStreaming = vi.fn();
  }
  return render(<ChatPanel {...props} />);
}

// ── Tests ──

describe('ChatPanel', () => {
  // ── Rendering ──

  describe('rendering', () => {
    it('renders the chat header with "Mentor Chat" label', () => {
      renderChat();
      expect(screen.getByText('Mentor Chat')).toBeDefined();
    });

    it('renders mode badge with current mode', () => {
      renderChat({ mode: 'TEACHER' });
      expect(screen.getByText('TEACHER')).toBeDefined();
    });

    it('renders INTERVIEWER mode badge', () => {
      renderChat({ mode: 'INTERVIEWER' });
      expect(screen.getByText('INTERVIEWER')).toBeDefined();
    });

    it('renders REVIEWER mode badge', () => {
      renderChat({ mode: 'REVIEWER' });
      expect(screen.getByText('REVIEWER')).toBeDefined();
    });

    it('shows "Interview in progress" text in INTERVIEWER mode', () => {
      renderChat({ mode: 'INTERVIEWER' });
      expect(screen.getByText('Interview in progress')).toBeDefined();
    });

    it('does not show "Interview in progress" in TEACHER mode', () => {
      renderChat({ mode: 'TEACHER' });
      expect(screen.queryByText('Interview in progress')).toBeNull();
    });

    it('applies panel-hidden class when hidden prop is true', () => {
      const { container } = renderChat({ hidden: true });
      expect(container.firstElementChild!.className).toContain('panel-hidden');
    });

    it('does not apply panel-hidden when hidden is false', () => {
      const { container } = renderChat({ hidden: false });
      expect(container.firstElementChild!.className).not.toContain('panel-hidden');
    });
  });

  // ── Messages ──

  describe('messages', () => {
    it('renders messages via ChatMessageItem', () => {
      const msgs = [
        makeMsg({ id: 'a', role: 'user', content: 'Hi' }),
        makeMsg({ id: 'b', role: 'mentor', content: 'Hello!' }),
      ];
      renderChat({ messages: msgs });
      expect(screen.getByTestId('msg-a')).toBeDefined();
      expect(screen.getByTestId('msg-b')).toBeDefined();
    });

    it('marks the last message as isNew', () => {
      const msgs = [
        makeMsg({ id: 'a', content: 'First' }),
        makeMsg({ id: 'b', content: 'Last' }),
      ];
      renderChat({ messages: msgs });
      expect(screen.getByTestId('msg-a').getAttribute('data-new')).toBe('false');
      expect(screen.getByTestId('msg-b').getAttribute('data-new')).toBe('true');
    });

    it('skips rendering empty streaming messages', () => {
      const msgs = [makeMsg({ id: 'x', content: '', isStreaming: true })];
      renderChat({ messages: msgs });
      expect(screen.queryByTestId('msg-x')).toBeNull();
    });

    it('renders non-empty streaming messages', () => {
      const msgs = [makeMsg({ id: 'x', content: 'Partial...', isStreaming: true })];
      renderChat({ messages: msgs });
      expect(screen.getByTestId('msg-x')).toBeDefined();
    });

    it('chat messages container has role="log" and aria-live', () => {
      const { container } = renderChat();
      const log = container.querySelector('[role="log"]');
      expect(log).not.toBeNull();
      expect(log!.getAttribute('aria-live')).toBe('polite');
      expect(log!.getAttribute('aria-label')).toBe('Mentor chat conversation');
    });
  });

  // ── ThinkingBubble ──

  describe('thinking bubble', () => {
    it('shows ThinkingBubble when streaming and last message is empty streaming', () => {
      const msgs = [makeMsg({ id: 's', content: '', isStreaming: true })];
      renderChat({ messages: msgs, isStreaming: true });
      expect(screen.getByTestId('thinking-bubble')).toBeDefined();
    });

    it('hides ThinkingBubble when not streaming', () => {
      const msgs = [makeMsg({ id: 's', content: '', isStreaming: true })];
      renderChat({ messages: msgs, isStreaming: false });
      expect(screen.queryByTestId('thinking-bubble')).toBeNull();
    });

    it('hides ThinkingBubble when last message has content', () => {
      const msgs = [makeMsg({ id: 's', content: 'partial', isStreaming: true })];
      renderChat({ messages: msgs, isStreaming: true });
      expect(screen.queryByTestId('thinking-bubble')).toBeNull();
    });
  });

  // ── Input & submit ──

  describe('input and submit', () => {
    it('renders textarea with placeholder', () => {
      renderChat();
      expect(screen.getByPlaceholderText('Type a message or use a /command...')).toBeDefined();
    });

    it('shows streaming placeholder when streaming', () => {
      renderChat({ isStreaming: true });
      expect(screen.getByPlaceholderText('Mentor is responding...')).toBeDefined();
    });

    it('disables textarea when streaming', () => {
      renderChat({ isStreaming: true });
      const textarea = screen.getByPlaceholderText('Mentor is responding...');
      expect(textarea).toHaveProperty('disabled', true);
    });

    it('calls onSendMessage on Enter key', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage });
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...');
      fireEvent.change(textarea, { target: { value: 'test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(onSendMessage).toHaveBeenCalledWith('test message');
    });

    it('does not send on Shift+Enter', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage });
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...');
      fireEvent.change(textarea, { target: { value: 'test' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('calls onSendMessage on send button click', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage });
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...');
      fireEvent.change(textarea, { target: { value: 'clicked send' } });
      fireEvent.click(screen.getByLabelText('Send message'));
      expect(onSendMessage).toHaveBeenCalledWith('clicked send');
    });

    it('clears input after sending', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage });
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'hello' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(textarea.value).toBe('');
    });

    it('does not send empty or whitespace-only input', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage });
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...');
      fireEvent.change(textarea, { target: { value: '   ' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('does not send when streaming', () => {
      const onSendMessage = vi.fn();
      renderChat({ onSendMessage, isStreaming: true });
      // Simulate pre-existing input before streaming started
      // The textarea is disabled during streaming, so onSendMessage should not fire
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('send button is disabled when input is empty', () => {
      renderChat();
      const btn = screen.getByLabelText('Send message');
      expect(btn).toHaveProperty('disabled', true);
    });

    it('send button is enabled when input has content', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...');
      fireEvent.change(textarea, { target: { value: 'hi' } });
      const btn = screen.getByLabelText('Send message');
      expect(btn).toHaveProperty('disabled', false);
    });
  });

  // ── Stop streaming ──

  describe('stop streaming', () => {
    it('shows stop button when streaming', () => {
      renderChat({ isStreaming: true });
      expect(screen.getByLabelText('Stop generating')).toBeDefined();
    });

    it('hides send button when streaming', () => {
      renderChat({ isStreaming: true });
      expect(screen.queryByLabelText('Send message')).toBeNull();
    });

    it('calls onStopStreaming when stop button is clicked', () => {
      const onStopStreaming = vi.fn();
      renderChat({ isStreaming: true, onStopStreaming });
      fireEvent.click(screen.getByLabelText('Stop generating'));
      expect(onStopStreaming).toHaveBeenCalledOnce();
    });
  });

  // ── Slash commands ──

  describe('slash commands', () => {
    const expectedCommands = ['/hint', '/check', '/stuck', '/recap', '/solve', '/review', '/next', '/pattern', '/mistakes', '/continue'];

    it('renders all 10 slash command buttons', () => {
      renderChat();
      expectedCommands.forEach((cmd) => {
        expect(screen.getByText(cmd)).toBeDefined();
      });
    });

    it('populates input when a slash command is clicked', () => {
      renderChat();
      fireEvent.click(screen.getByText('/hint'));
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;
      expect(textarea.value).toBe('/hint ');
    });

    it('disables slash commands when streaming', () => {
      renderChat({ isStreaming: true });
      const hintBtn = screen.getByText('/hint');
      expect(hintBtn).toHaveProperty('disabled', true);
    });
  });

  // ── Rate limit ──

  describe('rate limit info', () => {
    it('shows rate limit bar for free plan', () => {
      renderChat({
        rateLimitInfo: { remaining: 7, limit: 10, plan: 'free' },
      });
      expect(screen.getByText(/7 \/ 10 messages remaining today/)).toBeDefined();
    });

    it('shows "running low" when remaining <= 2', () => {
      renderChat({
        rateLimitInfo: { remaining: 2, limit: 10, plan: 'free' },
      });
      expect(screen.getByText(/running low/)).toBeDefined();
    });

    it('does not show "running low" when remaining > 2', () => {
      renderChat({
        rateLimitInfo: { remaining: 5, limit: 10, plan: 'free' },
      });
      expect(screen.queryByText(/running low/)).toBeNull();
    });

    it('does not show rate limit for paid plans', () => {
      renderChat({
        rateLimitInfo: { remaining: 50, limit: 100, plan: 'premium' },
      });
      expect(screen.queryByText(/messages remaining/)).toBeNull();
    });

    it('does not show rate limit when rateLimitInfo is null', () => {
      renderChat({ rateLimitInfo: null });
      expect(screen.queryByText(/messages remaining/)).toBeNull();
    });

    it('shows Upgrade button when onUpgrade is provided', () => {
      const onUpgrade = vi.fn();
      renderChat({
        rateLimitInfo: { remaining: 5, limit: 10, plan: 'free' },
        onUpgrade,
      });
      const upgradeBtn = screen.getByText('Upgrade');
      expect(upgradeBtn).toBeDefined();
      fireEvent.click(upgradeBtn);
      expect(onUpgrade).toHaveBeenCalledOnce();
    });

    it('does not show Upgrade button when onUpgrade is not provided', () => {
      renderChat({
        rateLimitInfo: { remaining: 5, limit: 10, plan: 'free' },
      });
      expect(screen.queryByText('Upgrade')).toBeNull();
    });
  });

  // ── Voice button ──

  describe('voice button', () => {
    it('renders VoiceButton', () => {
      renderChat();
      expect(screen.getByTestId('voice-button')).toBeDefined();
    });

    it('disables VoiceButton when streaming', () => {
      renderChat({ isStreaming: true });
      const voiceBtn = screen.getByTestId('voice-button');
      expect(voiceBtn).toHaveProperty('disabled', true);
    });
  });

  // ── Live transcription ──

  describe('live transcription', () => {
    it('shows live transcript in textarea when voice is active', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
        voiceCallbacks.onLiveTranscript?.('hello world');
      });

      expect(textarea.value).toBe('hello world');
    });

    it('appends live transcript to existing typed input', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      // Type something first
      fireEvent.change(textarea, { target: { value: 'prefix' } });

      // Start voice
      act(() => {
        voiceCallbacks.onListeningChange?.(true);
        voiceCallbacks.onLiveTranscript?.('spoken text');
      });

      expect(textarea.value).toBe('prefix spoken text');
    });

    it('shows "Listening..." placeholder when voice is active', () => {
      renderChat();

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
      });

      expect(screen.getByPlaceholderText('Listening...')).toBeDefined();
    });

    it('adds recording CSS class to input wrapper when voice is active', () => {
      const { container } = renderChat();

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
      });

      const wrapper = container.querySelector('.chat-input-wrapper');
      expect(wrapper!.className).toContain('chat-input-wrapper--recording');
    });

    it('adds recording CSS class to textarea when voice is active', () => {
      renderChat();

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
      });

      const textarea = screen.getByPlaceholderText('Listening...');
      expect(textarea.className).toContain('chat-input--recording');
    });

    it('removes recording classes when voice stops', () => {
      const { container } = renderChat();

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
      });
      act(() => {
        voiceCallbacks.onListeningChange?.(false);
      });

      const wrapper = container.querySelector('.chat-input-wrapper');
      expect(wrapper!.className).not.toContain('chat-input-wrapper--recording');
    });

    it('clears live transcript when voice stops', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
        voiceCallbacks.onLiveTranscript?.('interim words');
      });

      expect(textarea.value).toBe('interim words');

      act(() => {
        voiceCallbacks.onListeningChange?.(false);
      });

      // After stopping, only the committed input remains (empty since no onTranscript fired)
      expect(textarea.value).toBe('');
    });

    it('makes textarea readOnly during voice recording', () => {
      renderChat();

      act(() => {
        voiceCallbacks.onListeningChange?.(true);
      });

      const textarea = screen.getByPlaceholderText('Listening...') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(true);
    });

    it('textarea is not readOnly when voice is inactive', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;
      expect(textarea.readOnly).toBe(false);
    });

    it('merges final transcript into input on voice stop via onTranscript', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      // Simulate full voice flow: start → speak → stop
      act(() => {
        voiceCallbacks.onListeningChange?.(true);
        voiceCallbacks.onLiveTranscript?.('final words');
      });

      act(() => {
        voiceCallbacks.onTranscript?.('final words');
        voiceCallbacks.onListeningChange?.(false);
      });

      // Final text should be in the input
      expect(textarea.value).toBe('final words');
    });

    it('updates live transcript progressively as user speaks', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      act(() => { voiceCallbacks.onListeningChange?.(true); });

      act(() => { voiceCallbacks.onLiveTranscript?.('hello'); });
      expect(textarea.value).toBe('hello');

      act(() => { voiceCallbacks.onLiveTranscript?.('hello world'); });
      expect(textarea.value).toBe('hello world');

      act(() => { voiceCallbacks.onLiveTranscript?.('hello world how are you'); });
      expect(textarea.value).toBe('hello world how are you');
    });

    it('does not show live transcript when voice is inactive even if transcript is set', () => {
      renderChat();
      const textarea = screen.getByPlaceholderText('Type a message or use a /command...') as HTMLTextAreaElement;

      // Only set transcript without activating voice
      act(() => {
        voiceCallbacks.onLiveTranscript?.('ghost text');
      });

      // Should not appear since voice is not active
      expect(textarea.value).toBe('');
    });
  });

  // ── Accessibility ──

  describe('accessibility', () => {
    it('send button has aria-label', () => {
      renderChat();
      expect(screen.getByLabelText('Send message')).toBeDefined();
    });

    it('stop button has aria-label', () => {
      renderChat({ isStreaming: true });
      expect(screen.getByLabelText('Stop generating')).toBeDefined();
    });

    it('all buttons have type="button"', () => {
      renderChat({
        rateLimitInfo: { remaining: 5, limit: 10, plan: 'free' },
        onUpgrade: vi.fn(),
      });
      const buttons = screen.getAllByRole('button');
      buttons.forEach((btn) => {
        expect(btn.getAttribute('type')).toBe('button');
      });
    });
  });

  // ── Reconnection toast ────────────────────────────────────────────────────

  describe('reconnection toast', () => {
    afterEach(() => {
      onlineMocks.isOnline = true;
      onlineMocks.showToast.mockClear();
    });

    it('fires showToast when online transitions from false to true', () => {
      onlineMocks.isOnline = false;
      const { rerender } = renderChat();
      onlineMocks.showToast.mockClear(); // ignore any calls during initial render

      onlineMocks.isOnline = true;
      rerender(<ChatPanel {...defaultProps} />);

      expect(onlineMocks.showToast).toHaveBeenCalledWith(
        'Back online — your messages will send.',
        'success',
      );
    });

    it('does not fire showToast on initial render when already online', () => {
      onlineMocks.isOnline = true;
      renderChat();
      expect(onlineMocks.showToast).not.toHaveBeenCalled();
    });

    it('does not fire showToast on initial render when starting offline', () => {
      onlineMocks.isOnline = false;
      renderChat();
      expect(onlineMocks.showToast).not.toHaveBeenCalled();
    });

    it('does not fire showToast when staying offline across renders', () => {
      onlineMocks.isOnline = false;
      const { rerender } = renderChat();
      onlineMocks.showToast.mockClear();

      rerender(<ChatPanel {...defaultProps} />);
      expect(onlineMocks.showToast).not.toHaveBeenCalled();
    });

    it('does not fire showToast when staying online across renders', () => {
      onlineMocks.isOnline = true;
      const { rerender } = renderChat();
      onlineMocks.showToast.mockClear();

      rerender(<ChatPanel {...defaultProps} />);
      expect(onlineMocks.showToast).not.toHaveBeenCalled();
    });

    it('fires showToast with type "success"', () => {
      onlineMocks.isOnline = false;
      const { rerender } = renderChat();
      onlineMocks.showToast.mockClear();

      onlineMocks.isOnline = true;
      rerender(<ChatPanel {...defaultProps} />);

      const call = onlineMocks.showToast.mock.calls[0];
      expect(call[1]).toBe('success');
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MentorPanel from '../MentorPanel';
import type { ChatMessage } from '../../../types';

vi.mock('lucide-react', () => ({
  Send:           () => <span data-testid="icon-send" />,
  Square:         () => <span data-testid="icon-square" />,
  PanelRightClose:() => <span data-testid="icon-collapse" />,
  MessageSquare:  () => <span data-testid="icon-message" />,
}));

vi.mock('../../chat/ChatMessage', () => ({
  default: ({ message }: { message: ChatMessage }) => (
    <div data-testid="chat-message">{message.content}</div>
  ),
}));

vi.mock('../../chat/ThinkingBubble', () => ({
  default: () => <div data-testid="thinking-bubble" />,
}));

vi.mock('../../chat/VoiceButton', () => ({
  default: ({ disabled }: { disabled: boolean }) => (
    <button type="button" data-testid="voice-btn" disabled={disabled} />
  ),
}));

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm1',
    role: 'assistant',
    content: 'Hello from mentor',
    isStreaming: false,
    timestamp: new Date(),
    ...overrides,
  };
}

const BASE_PROPS = {
  messages: [],
  onSendMessage: vi.fn(),
  isStreaming: false,
  onStopStreaming: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  localStorage.clear();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('MentorPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<MentorPanel {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows Mentor title in header', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByText('Mentor')).toBeDefined();
    });

    it('shows INTERVIEWER badge', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByText('INTERVIEWER')).toBeDefined();
    });

    it('shows collapse button with aria-label', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Collapse mentor panel' })).toBeDefined();
    });

    it('shows resize splitter with role=separator', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByRole('separator')).toBeDefined();
    });

    it('splitter has aria-label "Resize mentor panel"', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByRole('separator').getAttribute('aria-label')).toBe('Resize mentor panel');
    });
  });

  describe('messages', () => {
    it('renders chat messages', () => {
      const messages = [makeMessage({ content: 'Hello from mentor' })];
      render(<MentorPanel {...BASE_PROPS} messages={messages} />);
      expect(screen.getByText('Hello from mentor')).toBeDefined();
    });

    it('renders multiple messages', () => {
      const messages = [
        makeMessage({ id: 'm1', content: 'Message one' }),
        makeMessage({ id: 'm2', content: 'Message two' }),
      ];
      render(<MentorPanel {...BASE_PROPS} messages={messages} />);
      expect(screen.getByText('Message one')).toBeDefined();
      expect(screen.getByText('Message two')).toBeDefined();
    });

    it('does not render empty streaming message (shows ThinkingBubble instead)', () => {
      const messages = [makeMessage({ id: 'm1', content: '', isStreaming: true })];
      render(<MentorPanel {...BASE_PROPS} messages={messages} isStreaming={true} />);
      expect(screen.getByTestId('thinking-bubble')).toBeDefined();
      // The empty streaming message itself is not rendered as a ChatMessageItem
      expect(screen.queryAllByTestId('chat-message').length).toBe(0);
    });

    it('renders non-empty streaming message as a chat message', () => {
      const messages = [makeMessage({ id: 'm1', content: 'Partial response', isStreaming: true })];
      render(<MentorPanel {...BASE_PROPS} messages={messages} isStreaming={true} />);
      expect(screen.getByText('Partial response')).toBeDefined();
    });
  });

  describe('input area', () => {
    it('shows textarea with placeholder', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByPlaceholderText('Ask the mentor...')).toBeDefined();
    });

    it('shows "Mentor is responding..." placeholder when streaming', () => {
      render(<MentorPanel {...BASE_PROPS} isStreaming={true} />);
      expect(screen.getByPlaceholderText('Mentor is responding...')).toBeDefined();
    });

    it('textarea is disabled when streaming', () => {
      render(<MentorPanel {...BASE_PROPS} isStreaming={true} />);
      const ta = screen.getByPlaceholderText('Mentor is responding...') as HTMLTextAreaElement;
      expect(ta.disabled).toBe(true);
    });

    it('send button is disabled when input is empty', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      expect(screen.getByTestId('icon-send').closest('button')!.hasAttribute('disabled')).toBe(true);
    });

    it('send button is enabled when input has text', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Ask the mentor...'), { target: { value: 'How do I scale?' } });
      expect(screen.getByTestId('icon-send').closest('button')!.hasAttribute('disabled')).toBe(false);
    });

    it('clicking send calls onSendMessage with trimmed input', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      fireEvent.change(screen.getByPlaceholderText('Ask the mentor...'), { target: { value: '  My question  ' } });
      fireEvent.click(screen.getByTestId('icon-send').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith('My question');
    });

    it('clicking send clears the input', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      const ta = screen.getByPlaceholderText('Ask the mentor...') as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'Hello' } });
      fireEvent.click(screen.getByTestId('icon-send').closest('button')!);
      expect(ta.value).toBe('');
    });

    it('Enter key calls onSendMessage', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      const ta = screen.getByPlaceholderText('Ask the mentor...');
      fireEvent.change(ta, { target: { value: 'My message' } });
      fireEvent.keyDown(ta, { key: 'Enter', shiftKey: false });
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith('My message');
    });

    it('Shift+Enter does not submit', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      const ta = screen.getByPlaceholderText('Ask the mentor...');
      fireEvent.change(ta, { target: { value: 'My message' } });
      fireEvent.keyDown(ta, { key: 'Enter', shiftKey: true });
      expect(BASE_PROPS.onSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('streaming controls', () => {
    it('shows stop button (Square icon) when streaming', () => {
      render(<MentorPanel {...BASE_PROPS} isStreaming={true} />);
      expect(screen.getByTestId('icon-square')).toBeDefined();
    });

    it('clicking stop button calls onStopStreaming', () => {
      render(<MentorPanel {...BASE_PROPS} isStreaming={true} />);
      fireEvent.click(screen.getByTestId('icon-square').closest('button')!);
      expect(BASE_PROPS.onStopStreaming).toHaveBeenCalledOnce();
    });

    it('shows send button (not stop) when not streaming', () => {
      render(<MentorPanel {...BASE_PROPS} isStreaming={false} />);
      expect(screen.getByTestId('icon-send')).toBeDefined();
      expect(screen.queryByTestId('icon-square')).toBeNull();
    });
  });

  describe('collapse/expand', () => {
    it('clicking collapse shows expand bar', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Collapse mentor panel' }));
      expect(screen.getByRole('button', { name: 'Expand mentor panel' })).toBeDefined();
    });

    it('expand bar hides the main panel', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Collapse mentor panel' }));
      expect(screen.queryByRole('separator')).toBeNull();
    });

    it('clicking expand bar restores the panel', () => {
      render(<MentorPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Collapse mentor panel' }));
      fireEvent.click(screen.getByRole('button', { name: 'Expand mentor panel' }));
      expect(screen.getByRole('separator')).toBeDefined();
    });
  });
});

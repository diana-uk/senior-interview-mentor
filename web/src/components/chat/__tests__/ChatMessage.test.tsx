import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatMessageItem from '../ChatMessage';
import type { ChatMessage } from '../../../types';

// Mock heavy markdown/syntax deps so tests run fast in jsdom
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));
vi.mock('remark-math', () => ({ default: () => {} }));
vi.mock('rehype-katex', () => ({ default: () => {} }));
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre data-testid="syntax">{children}</pre>,
}));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

function makeMsg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'msg-1',
    role: 'mentor',
    content: 'Hello world',
    timestamp: new Date('2026-01-15T10:30:00'),
    ...overrides,
  };
}

describe('ChatMessageItem', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ChatMessageItem message={makeMsg()} />)).not.toThrow();
    });

    it('renders a root message element', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.message')).not.toBeNull();
    });

    it('renders message content via ReactMarkdown', () => {
      render(<ChatMessageItem message={makeMsg({ content: 'Test content' })} />);
      expect(screen.getByTestId('markdown').textContent).toBe('Test content');
    });
  });

  describe('mentor role', () => {
    it('root has message-mentor class', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'mentor' })} />);
      expect(container.querySelector('.message-mentor')).not.toBeNull();
    });

    it('avatar shows "M" for mentor', () => {
      render(<ChatMessageItem message={makeMsg({ role: 'mentor' })} />);
      expect(screen.getByText('M')).toBeDefined();
    });

    it('avatar has avatar-mentor class', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'mentor' })} />);
      expect(container.querySelector('.avatar-mentor')).not.toBeNull();
    });

    it('does not have message-user class for mentor', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'mentor' })} />);
      expect(container.querySelector('.message-user')).toBeNull();
    });
  });

  describe('user role', () => {
    it('root has message-user class', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'user' })} />);
      expect(container.querySelector('.message-user')).not.toBeNull();
    });

    it('avatar shows "Y" for user', () => {
      render(<ChatMessageItem message={makeMsg({ role: 'user' })} />);
      expect(screen.getByText('Y')).toBeDefined();
    });

    it('avatar has avatar-user class', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'user' })} />);
      expect(container.querySelector('.avatar-user')).not.toBeNull();
    });

    it('does not have message-mentor class for user', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ role: 'user' })} />);
      expect(container.querySelector('.message-mentor')).toBeNull();
    });
  });

  describe('error state', () => {
    it('has message-error class when isError is true', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ isError: true })} />);
      expect(container.querySelector('.message-error')).not.toBeNull();
    });

    it('does not have message-error class when isError is false', () => {
      const { container } = render(<ChatMessageItem message={makeMsg({ isError: false })} />);
      expect(container.querySelector('.message-error')).toBeNull();
    });

    it('does not have message-error class when isError is omitted', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.message-error')).toBeNull();
    });
  });

  describe('isNew animation', () => {
    it('has message-enter class when isNew is true', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} isNew={true} />);
      expect(container.firstElementChild?.classList.contains('message-enter')).toBe(true);
    });

    it('does not have message-enter class when isNew is false', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} isNew={false} />);
      expect(container.firstElementChild?.classList.contains('message-enter')).toBe(false);
    });

    it('does not have message-enter class when isNew is omitted', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.firstElementChild?.classList.contains('message-enter')).toBe(false);
    });
  });

  describe('timestamp', () => {
    it('renders a timestamp in the message header', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.message-time')).not.toBeNull();
    });

    it('timestamp element is not empty', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      const timeEl = container.querySelector('.message-time');
      expect((timeEl?.textContent ?? '').length).toBeGreaterThan(0);
    });
  });

  describe('structure', () => {
    it('renders message-header element', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.message-header')).not.toBeNull();
    });

    it('renders message-content element', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.message-content')).not.toBeNull();
    });

    it('avatar has avatar-sm class', () => {
      const { container } = render(<ChatMessageItem message={makeMsg()} />);
      expect(container.querySelector('.avatar-sm')).not.toBeNull();
    });
  });
});

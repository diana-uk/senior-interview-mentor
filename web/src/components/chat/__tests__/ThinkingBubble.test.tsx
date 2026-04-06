import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ThinkingBubble from '../ThinkingBubble';

describe('ThinkingBubble', () => {
  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<ThinkingBubble />);
      expect(screen.getByRole('status')).toBeDefined();
    });

    it('has aria-label "Mentor is thinking"', () => {
      render(<ThinkingBubble />);
      const el = screen.getByRole('status');
      expect(el.getAttribute('aria-label')).toBe('Mentor is thinking');
    });
  });

  describe('CSS classes', () => {
    it('root element has "message" class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.firstElementChild?.classList.contains('message')).toBe(true);
    });

    it('root element has "message-mentor" class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.firstElementChild?.classList.contains('message-mentor')).toBe(true);
    });

    it('root element has "message-enter" class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.firstElementChild?.classList.contains('message-enter')).toBe(true);
    });

    it('message-content has "thinking-bubble" class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.thinking-bubble')).not.toBeNull();
    });
  });

  describe('avatar', () => {
    it('renders avatar element', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.avatar')).not.toBeNull();
    });

    it('avatar shows "M" label', () => {
      render(<ThinkingBubble />);
      expect(screen.getByText('M')).toBeDefined();
    });

    it('avatar has avatar-mentor class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.avatar-mentor')).not.toBeNull();
    });

    it('avatar has avatar-sm class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.avatar-sm')).not.toBeNull();
    });
  });

  describe('typing dots', () => {
    it('renders exactly 3 typing-dot spans', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelectorAll('.typing-dot').length).toBe(3);
    });

    it('typing dots are inside the thinking-bubble element', () => {
      const { container } = render(<ThinkingBubble />);
      const bubble = container.querySelector('.thinking-bubble');
      expect(bubble?.querySelectorAll('.typing-dot').length).toBe(3);
    });
  });

  describe('thinking label', () => {
    it('renders "Thinking..." text', () => {
      render(<ThinkingBubble />);
      expect(screen.getByText('Thinking...')).toBeDefined();
    });

    it('thinking label has thinking-label class', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.thinking-label')).not.toBeNull();
    });
  });

  describe('structure', () => {
    it('renders without crashing', () => {
      expect(() => render(<ThinkingBubble />)).not.toThrow();
    });

    it('renders message-header element', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.message-header')).not.toBeNull();
    });

    it('renders message-content element', () => {
      const { container } = render(<ThinkingBubble />);
      expect(container.querySelector('.message-content')).not.toBeNull();
    });
  });
});

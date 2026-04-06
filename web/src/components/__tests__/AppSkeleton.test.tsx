import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppSkeleton from '../AppSkeleton';

describe('AppSkeleton', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<AppSkeleton />)).not.toThrow();
    });

    it('root element has app-skeleton class', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.firstElementChild?.classList.contains('app-skeleton')).toBe(true);
    });
  });

  describe('layout sections', () => {
    it('renders topnav section', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.querySelector('.app-skeleton__topnav')).toBeDefined();
    });

    it('renders body section', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.querySelector('.app-skeleton__body')).toBeDefined();
    });

    it('renders sidebar section inside body', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.querySelector('.app-skeleton__sidebar')).toBeDefined();
    });

    it('renders chat section inside body', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.querySelector('.app-skeleton__chat')).toBeDefined();
    });

    it('renders editor section inside body', () => {
      const { container } = render(<AppSkeleton />);
      expect(container.querySelector('.app-skeleton__editor')).toBeDefined();
    });
  });

  describe('skeleton blocks', () => {
    it('renders at least one skeleton-block element', () => {
      const { container } = render(<AppSkeleton />);
      const blocks = container.querySelectorAll('.skeleton-block');
      expect(blocks.length).toBeGreaterThan(0);
    });

    it('renders 5 skeleton-block elements in sidebar', () => {
      const { container } = render(<AppSkeleton />);
      const sidebar = container.querySelector('.app-skeleton__sidebar');
      expect(sidebar?.querySelectorAll('.skeleton-block').length).toBe(5);
    });

    it('renders 4 skeleton-block elements in chat', () => {
      const { container } = render(<AppSkeleton />);
      const chat = container.querySelector('.app-skeleton__chat');
      expect(chat?.querySelectorAll('.skeleton-block').length).toBe(4);
    });

    it('renders 2 skeleton-block elements in editor', () => {
      const { container } = render(<AppSkeleton />);
      const editor = container.querySelector('.app-skeleton__editor');
      expect(editor?.querySelectorAll('.skeleton-block').length).toBe(2);
    });

    it('renders 4 skeleton-block elements in topnav', () => {
      const { container } = render(<AppSkeleton />);
      const topnav = container.querySelector('.app-skeleton__topnav');
      expect(topnav?.querySelectorAll('.skeleton-block').length).toBe(4);
    });

    it('renders 15 total skeleton-block elements', () => {
      const { container } = render(<AppSkeleton />);
      // topnav: 4, sidebar: 5, chat: 4, editor: 2
      expect(container.querySelectorAll('.skeleton-block').length).toBe(15);
    });
  });

  describe('structure nesting', () => {
    it('sidebar is inside body', () => {
      const { container } = render(<AppSkeleton />);
      const body = container.querySelector('.app-skeleton__body');
      expect(body?.querySelector('.app-skeleton__sidebar')).toBeDefined();
    });

    it('chat is inside body', () => {
      const { container } = render(<AppSkeleton />);
      const body = container.querySelector('.app-skeleton__body');
      expect(body?.querySelector('.app-skeleton__chat')).toBeDefined();
    });

    it('editor is inside body', () => {
      const { container } = render(<AppSkeleton />);
      const body = container.querySelector('.app-skeleton__body');
      expect(body?.querySelector('.app-skeleton__editor')).toBeDefined();
    });
  });
});

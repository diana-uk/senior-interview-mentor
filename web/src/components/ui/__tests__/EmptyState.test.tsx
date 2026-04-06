import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../EmptyState';
import type { LucideIcon } from 'lucide-react';

// Minimal icon mock that renders an identifiable element
const MockIcon: LucideIcon = ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: boolean | 'true' | 'false' }) => (
  <svg data-testid="mock-icon" aria-hidden={ariaHidden as boolean} />
);

const BASE_PROPS = {
  icon: MockIcon,
  title: 'Nothing here yet',
  description: 'Start by adding your first item.',
};

describe('EmptyState', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<EmptyState {...BASE_PROPS} />)).not.toThrow();
    });

    it('root element has empty-state class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} />);
      expect(container.firstElementChild?.classList.contains('empty-state')).toBe(true);
    });
  });

  describe('icon', () => {
    it('renders the provided icon', () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.getByTestId('mock-icon')).toBeDefined();
    });

    it('icon has aria-hidden="true"', () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.getByTestId('mock-icon').getAttribute('aria-hidden')).toBe('true');
    });

    it('renders a different icon when prop changes', () => {
      const OtherIcon: LucideIcon = () => <svg data-testid="other-icon" />;
      render(<EmptyState {...BASE_PROPS} icon={OtherIcon} />);
      expect(screen.getByTestId('other-icon')).toBeDefined();
    });
  });

  describe('title', () => {
    it('renders the title text', () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.getByText('Nothing here yet')).toBeDefined();
    });

    it('title element has empty-state-title class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} />);
      expect(container.querySelector('.empty-state-title')).not.toBeNull();
    });

    it('title text matches the prop exactly', () => {
      render(<EmptyState {...BASE_PROPS} title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeDefined();
    });
  });

  describe('description', () => {
    it('renders the description text', () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.getByText('Start by adding your first item.')).toBeDefined();
    });

    it('description element has empty-state-description class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} />);
      expect(container.querySelector('.empty-state-description')).not.toBeNull();
    });

    it('description text matches the prop exactly', () => {
      render(<EmptyState {...BASE_PROPS} description="Custom description text." />);
      expect(screen.getByText('Custom description text.')).toBeDefined();
    });
  });

  describe('action button — absent when not provided', () => {
    it('renders no button when action prop is omitted', () => {
      render(<EmptyState {...BASE_PROPS} />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders no button when action is undefined', () => {
      render(<EmptyState {...BASE_PROPS} action={undefined} />);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('action button — present when provided', () => {
    const action = { label: 'Add item', onClick: vi.fn() };

    it('renders a button when action prop is provided', () => {
      render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(screen.getByRole('button')).toBeDefined();
    });

    it('button shows the action label', () => {
      render(<EmptyState {...BASE_PROPS} action={{ label: 'Get started', onClick: vi.fn() }} />);
      expect(screen.getByRole('button', { name: /get started/i })).toBeDefined();
    });

    it('button has btn class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(container.querySelector('button')?.classList.contains('btn')).toBe(true);
    });

    it('button has btn-secondary class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(container.querySelector('button')?.classList.contains('btn-secondary')).toBe(true);
    });

    it('button has btn-sm class', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(container.querySelector('button')?.classList.contains('btn-sm')).toBe(true);
    });

    it('button has type="button"', () => {
      const { container } = render(<EmptyState {...BASE_PROPS} action={action} />);
      expect(container.querySelector('button')?.getAttribute('type')).toBe('button');
    });
  });

  describe('action callback', () => {
    it('calls action.onClick when button is clicked', () => {
      const onClick = vi.fn();
      render(<EmptyState {...BASE_PROPS} action={{ label: 'Click me', onClick }} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it('calls action.onClick exactly once per click', () => {
      const onClick = vi.fn();
      render(<EmptyState {...BASE_PROPS} action={{ label: 'Click me', onClick }} />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });
});

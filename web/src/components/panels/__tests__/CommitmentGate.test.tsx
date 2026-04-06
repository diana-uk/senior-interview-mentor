import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommitmentGate from '../CommitmentGate';
import type { CommitmentGateItem } from '../../../types';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Lock: () => <span data-testid="icon-lock" />,
  Check: () => <span data-testid="icon-check" />,
}));

function makeItem(overrides: Partial<CommitmentGateItem> = {}): CommitmentGateItem {
  return {
    id: 'item-1',
    label: 'Constraints recap',
    description: 'List 1-3 constraints',
    completed: false,
    ...overrides,
  };
}

const FIVE_ITEMS: CommitmentGateItem[] = [
  makeItem({ id: 'i1', label: 'Constraints recap', description: 'List 1-3 constraints' }),
  makeItem({ id: 'i2', label: 'Chosen pattern', description: 'Name the algorithm pattern' }),
  makeItem({ id: 'i3', label: 'Approach plan', description: 'Outline your steps' }),
  makeItem({ id: 'i4', label: 'Complexity estimate', description: 'Time and space complexity' }),
  makeItem({ id: 'i5', label: 'Edge cases', description: 'List 3-6 edge cases' }),
];

describe('CommitmentGate', () => {
  describe('closed state', () => {
    it('renders null when open is false', () => {
      const { container } = render(
        <CommitmentGate open={false} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders nothing visible with zero items and closed', () => {
      const { container } = render(
        <CommitmentGate open={false} onClose={vi.fn()} items={[]} onToggle={vi.fn()} />,
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('open state — structure', () => {
    it('renders commitment-gate root when open', () => {
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />,
      );
      expect(container.querySelector('.commitment-gate')).not.toBeNull();
    });

    it('renders the title "Commitment Gate"', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      expect(screen.getByText('Commitment Gate')).toBeDefined();
    });

    it('renders the subtitle text', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      expect(screen.getByText('Complete all items before viewing the solution')).toBeDefined();
    });

    it('renders a close button with aria-label', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      const btn = screen.getByRole('button', { name: /close commitment gate/i });
      expect(btn).toBeDefined();
    });

    it('renders a progress bar element', () => {
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />,
      );
      expect(container.querySelector('.progress-bar')).not.toBeNull();
      expect(container.querySelector('.progress-bar-fill')).not.toBeNull();
    });
  });

  describe('items rendering', () => {
    it('renders all items', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      FIVE_ITEMS.forEach((item) => {
        expect(screen.getByText(item.label)).toBeDefined();
        expect(screen.getByText(item.description)).toBeDefined();
      });
    });

    it('renders correct number of item elements', () => {
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />,
      );
      expect(container.querySelectorAll('.commitment-gate-item').length).toBe(5);
    });

    it('incomplete item does not have commitment-gate-item-complete class', () => {
      const items = [makeItem({ id: 'x', completed: false })];
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const item = container.querySelector('.commitment-gate-item');
      expect(item?.classList.contains('commitment-gate-item-complete')).toBe(false);
    });

    it('completed item has commitment-gate-item-complete class', () => {
      const items = [makeItem({ id: 'x', completed: true })];
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const item = container.querySelector('.commitment-gate-item');
      expect(item?.classList.contains('commitment-gate-item-complete')).toBe(true);
    });

    it('completed item renders check icon', () => {
      const items = [makeItem({ id: 'x', completed: true })];
      render(<CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />);
      expect(screen.getByTestId('icon-check')).toBeDefined();
    });

    it('incomplete item does not render check icon', () => {
      const items = [makeItem({ id: 'x', completed: false })];
      render(<CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />);
      expect(screen.queryByTestId('icon-check')).toBeNull();
    });
  });

  describe('progress bar', () => {
    it('progress is 0% when no items are complete', () => {
      const items = FIVE_ITEMS.map((i) => ({ ...i, completed: false }));
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const fill = container.querySelector('.progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('progress is 100% when all items are complete', () => {
      const items = FIVE_ITEMS.map((i) => ({ ...i, completed: true }));
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const fill = container.querySelector('.progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('progress is 60% when 3 of 5 items are complete', () => {
      const items = FIVE_ITEMS.map((item, i) => ({ ...item, completed: i < 3 }));
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const fill = container.querySelector('.progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('60%');
    });

    it('progress-bar-fill-success class added when all complete', () => {
      const items = FIVE_ITEMS.map((i) => ({ ...i, completed: true }));
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      expect(container.querySelector('.progress-bar-fill-success')).not.toBeNull();
    });

    it('progress-bar-fill-success class absent when not all complete', () => {
      const items = FIVE_ITEMS.map((i) => ({ ...i, completed: false }));
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      expect(container.querySelector('.progress-bar-fill-success')).toBeNull();
    });
  });

  describe('locked state (not all complete)', () => {
    it('shows lock icon when not all items are complete', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      expect(screen.getByTestId('icon-lock')).toBeDefined();
    });

    it('shows locked message', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      expect(screen.getByText('Complete all items to unlock the solution')).toBeDefined();
    });

    it('does not show unlock button', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      expect(screen.queryByText(/solution unlocked/i)).toBeNull();
    });
  });

  describe('unlocked state (all complete)', () => {
    const allDone = FIVE_ITEMS.map((i) => ({ ...i, completed: true }));

    it('shows "Solution Unlocked" button when all complete', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={allDone} onToggle={vi.fn()} />);
      expect(screen.getByRole('button', { name: /solution unlocked/i })).toBeDefined();
    });

    it('hides lock icon when all complete', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={allDone} onToggle={vi.fn()} />);
      expect(screen.queryByTestId('icon-lock')).toBeNull();
    });

    it('hides locked message when all complete', () => {
      render(<CommitmentGate open={true} onClose={vi.fn()} items={allDone} onToggle={vi.fn()} />);
      expect(screen.queryByText('Complete all items to unlock the solution')).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<CommitmentGate open={true} onClose={onClose} items={FIVE_ITEMS} onToggle={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /close commitment gate/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onToggle with item id when item is clicked', () => {
      const onToggle = vi.fn();
      const items = [makeItem({ id: 'target-id' })];
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={onToggle} />,
      );
      fireEvent.click(container.querySelector('.commitment-gate-item')!);
      expect(onToggle).toHaveBeenCalledWith('target-id');
    });

    it('calls onToggle with correct id for each item', () => {
      const onToggle = vi.fn();
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={FIVE_ITEMS} onToggle={onToggle} />,
      );
      const itemEls = container.querySelectorAll('.commitment-gate-item');
      fireEvent.click(itemEls[2]);
      expect(onToggle).toHaveBeenCalledWith('i3');
    });

    it('onClose is not called when item is clicked', () => {
      const onClose = vi.fn();
      const onToggle = vi.fn();
      const { container } = render(
        <CommitmentGate open={true} onClose={onClose} items={FIVE_ITEMS} onToggle={onToggle} />,
      );
      fireEvent.click(container.querySelector('.commitment-gate-item')!);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('single item edge cases', () => {
    it('progress is 0% for single incomplete item', () => {
      const items = [makeItem({ completed: false })];
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const fill = container.querySelector('.progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('0%');
    });

    it('progress is 100% for single complete item', () => {
      const items = [makeItem({ completed: true })];
      const { container } = render(
        <CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />,
      );
      const fill = container.querySelector('.progress-bar-fill') as HTMLElement;
      expect(fill.style.width).toBe('100%');
    });

    it('single complete item shows unlock button', () => {
      const items = [makeItem({ completed: true })];
      render(<CommitmentGate open={true} onClose={vi.fn()} items={items} onToggle={vi.fn()} />);
      expect(screen.getByRole('button', { name: /solution unlocked/i })).toBeDefined();
    });
  });
});

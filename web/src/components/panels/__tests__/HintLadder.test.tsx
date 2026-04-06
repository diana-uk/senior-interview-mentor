import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HintLadder from '../HintLadder';
import type { HintLevel } from '../../../types';

function makeHint(overrides: Partial<HintLevel> = {}): HintLevel {
  return {
    level: 1,
    label: 'Small nudge',
    description: 'Pattern name or key invariant',
    content: 'Think about using a HashMap',
    unlocked: false,
    color: 'var(--accent-primary)',
    ...overrides,
  };
}

const THREE_HINTS: HintLevel[] = [
  makeHint({ level: 1, label: 'Small nudge', description: 'Pattern name', content: 'Use a HashMap' }),
  makeHint({ level: 2, label: 'Structure', description: 'Data structure steps', content: 'Create a map and iterate' }),
  makeHint({ level: 3, label: 'Pseudocode', description: 'Outline without full code', content: 'for each x, store in map...' }),
];

describe('HintLadder', () => {
  describe('rendering', () => {
    it('renders a hint-ladder root element', () => {
      const { container } = render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      expect(container.querySelector('.hint-ladder')).not.toBeNull();
    });

    it('renders hint-ladder-items container', () => {
      const { container } = render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      expect(container.querySelector('.hint-ladder-items')).not.toBeNull();
    });

    it('renders correct number of hint items', () => {
      const { container } = render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      expect(container.querySelectorAll('.hint-ladder-item').length).toBe(3);
    });

    it('renders zero items when hints array is empty', () => {
      const { container } = render(<HintLadder hints={[]} onRequestHint={vi.fn()} />);
      expect(container.querySelectorAll('.hint-ladder-item').length).toBe(0);
    });

    it('renders single hint item', () => {
      const { container } = render(<HintLadder hints={[makeHint()]} onRequestHint={vi.fn()} />);
      expect(container.querySelectorAll('.hint-ladder-item').length).toBe(1);
    });
  });

  describe('hint item content', () => {
    it('renders level indicator for each hint', () => {
      const { container } = render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      const indicators = container.querySelectorAll('.hint-ladder-indicator');
      expect(indicators[0].textContent).toBe('1');
      expect(indicators[1].textContent).toBe('2');
      expect(indicators[2].textContent).toBe('3');
    });

    it('renders label with level prefix', () => {
      render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      expect(screen.getByText('Level 1: Small nudge')).toBeDefined();
      expect(screen.getByText('Level 2: Structure')).toBeDefined();
      expect(screen.getByText('Level 3: Pseudocode')).toBeDefined();
    });

    it('renders description for each hint', () => {
      render(<HintLadder hints={THREE_HINTS} onRequestHint={vi.fn()} />);
      expect(screen.getByText('Pattern name')).toBeDefined();
      expect(screen.getByText('Data structure steps')).toBeDefined();
      expect(screen.getByText('Outline without full code')).toBeDefined();
    });
  });

  describe('locked hints', () => {
    it('locked hint shows "Request Hint" button', () => {
      render(<HintLadder hints={[makeHint({ unlocked: false })]} onRequestHint={vi.fn()} />);
      expect(screen.getByRole('button', { name: /request hint/i })).toBeDefined();
    });

    it('locked hint does not show hint content', () => {
      const hint = makeHint({ unlocked: false, content: 'Secret content' });
      render(<HintLadder hints={[hint]} onRequestHint={vi.fn()} />);
      expect(screen.queryByText('Secret content')).toBeNull();
    });

    it('locked hint does not have hint-ladder-item-unlocked class', () => {
      const { container } = render(
        <HintLadder hints={[makeHint({ unlocked: false })]} onRequestHint={vi.fn()} />,
      );
      expect(container.querySelector('.hint-ladder-item-unlocked')).toBeNull();
    });

    it('locked hint does not have hint-unlock-animation class', () => {
      const { container } = render(
        <HintLadder hints={[makeHint({ unlocked: false })]} onRequestHint={vi.fn()} />,
      );
      expect(container.querySelector('.hint-unlock-animation')).toBeNull();
    });

    it('all three hints locked — three Request Hint buttons rendered', () => {
      const hints = THREE_HINTS.map((h) => ({ ...h, unlocked: false }));
      render(<HintLadder hints={hints} onRequestHint={vi.fn()} />);
      expect(screen.getAllByRole('button', { name: /request hint/i }).length).toBe(3);
    });
  });

  describe('unlocked hints', () => {
    it('unlocked hint shows content text', () => {
      const hint = makeHint({ unlocked: true, content: 'Use a HashMap here' });
      render(<HintLadder hints={[hint]} onRequestHint={vi.fn()} />);
      expect(screen.getByText('Use a HashMap here')).toBeDefined();
    });

    it('unlocked hint does not show "Request Hint" button', () => {
      render(<HintLadder hints={[makeHint({ unlocked: true })]} onRequestHint={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /request hint/i })).toBeNull();
    });

    it('unlocked hint has hint-ladder-item-unlocked class', () => {
      const { container } = render(
        <HintLadder hints={[makeHint({ unlocked: true })]} onRequestHint={vi.fn()} />,
      );
      expect(container.querySelector('.hint-ladder-item-unlocked')).not.toBeNull();
    });

    it('unlocked hint has hint-unlock-animation class', () => {
      const { container } = render(
        <HintLadder hints={[makeHint({ unlocked: true })]} onRequestHint={vi.fn()} />,
      );
      expect(container.querySelector('.hint-unlock-animation')).not.toBeNull();
    });

    it('unlocked hint content rendered in hint-ladder-text element', () => {
      const { container } = render(
        <HintLadder hints={[makeHint({ unlocked: true, content: 'My hint text' })]} onRequestHint={vi.fn()} />,
      );
      expect(container.querySelector('.hint-ladder-text')?.textContent).toBe('My hint text');
    });
  });

  describe('mixed locked/unlocked', () => {
    it('only unlocked hints show content', () => {
      const hints = [
        makeHint({ level: 1, unlocked: true, content: 'Hint 1 content' }),
        makeHint({ level: 2, unlocked: false, content: 'Hidden content' }),
        makeHint({ level: 3, unlocked: false, content: 'Also hidden' }),
      ];
      render(<HintLadder hints={hints} onRequestHint={vi.fn()} />);
      expect(screen.getByText('Hint 1 content')).toBeDefined();
      expect(screen.queryByText('Hidden content')).toBeNull();
      expect(screen.queryByText('Also hidden')).toBeNull();
    });

    it('only locked hints show Request Hint buttons', () => {
      const hints = [
        makeHint({ level: 1, unlocked: true }),
        makeHint({ level: 2, unlocked: false }),
        makeHint({ level: 3, unlocked: false }),
      ];
      render(<HintLadder hints={hints} onRequestHint={vi.fn()} />);
      expect(screen.getAllByRole('button', { name: /request hint/i }).length).toBe(2);
    });

    it('correct number of unlocked-class items', () => {
      const hints = [
        makeHint({ level: 1, unlocked: true }),
        makeHint({ level: 2, unlocked: true }),
        makeHint({ level: 3, unlocked: false }),
      ];
      const { container } = render(<HintLadder hints={hints} onRequestHint={vi.fn()} />);
      expect(container.querySelectorAll('.hint-ladder-item-unlocked').length).toBe(2);
    });
  });

  describe('onRequestHint callback', () => {
    it('calls onRequestHint with level 1 when first hint button is clicked', () => {
      const onRequestHint = vi.fn();
      render(<HintLadder hints={THREE_HINTS} onRequestHint={onRequestHint} />);
      fireEvent.click(screen.getAllByRole('button', { name: /request hint/i })[0]);
      expect(onRequestHint).toHaveBeenCalledWith(1);
    });

    it('calls onRequestHint with level 2 when second hint button is clicked', () => {
      const onRequestHint = vi.fn();
      render(<HintLadder hints={THREE_HINTS} onRequestHint={onRequestHint} />);
      fireEvent.click(screen.getAllByRole('button', { name: /request hint/i })[1]);
      expect(onRequestHint).toHaveBeenCalledWith(2);
    });

    it('calls onRequestHint with level 3 when third hint button is clicked', () => {
      const onRequestHint = vi.fn();
      render(<HintLadder hints={THREE_HINTS} onRequestHint={onRequestHint} />);
      fireEvent.click(screen.getAllByRole('button', { name: /request hint/i })[2]);
      expect(onRequestHint).toHaveBeenCalledWith(3);
    });

    it('calls onRequestHint exactly once per click', () => {
      const onRequestHint = vi.fn();
      render(<HintLadder hints={[makeHint({ level: 1 })]} onRequestHint={onRequestHint} />);
      fireEvent.click(screen.getByRole('button', { name: /request hint/i }));
      expect(onRequestHint).toHaveBeenCalledOnce();
    });

    it('unlocked hints do not trigger onRequestHint', () => {
      const onRequestHint = vi.fn();
      render(<HintLadder hints={[makeHint({ unlocked: true })]} onRequestHint={onRequestHint} />);
      expect(screen.queryByRole('button', { name: /request hint/i })).toBeNull();
      expect(onRequestHint).not.toHaveBeenCalled();
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import CommandPalette, { filterCommands } from '../CommandPalette';

// jsdom does not implement scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const ALL_CMD_COUNT = 11;

function renderPalette(overrides: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  const onActiveChange = vi.fn();
  const props = {
    query: '/',
    activeIndex: 0,
    onSelect,
    onClose,
    onActiveChange,
    ...overrides,
  };
  const result = render(<CommandPalette {...props} />);
  return { onSelect, onClose, onActiveChange, ...result };
}

describe('filterCommands', () => {
  describe('returns all commands for bare "/"', () => {
    it('returns 11 commands for "/"', () => {
      expect(filterCommands('/').length).toBe(ALL_CMD_COUNT);
    });

    it('returns 11 commands for empty string', () => {
      expect(filterCommands('').length).toBe(ALL_CMD_COUNT);
    });
  });

  describe('prefix filtering', () => {
    it('filters by exact command prefix "/s"', () => {
      const results = filterCommands('/s');
      const cmds = results.map((r) => r.cmd);
      expect(cmds).toContain('/solve');
      expect(cmds).toContain('/stuck');
    });

    it('does not include commands that do not start with query', () => {
      const results = filterCommands('/s');
      const cmds = results.map((r) => r.cmd);
      expect(cmds).not.toContain('/hint');
      expect(cmds).not.toContain('/review');
    });

    it('returns only /solve for "/solve"', () => {
      const results = filterCommands('/solve');
      expect(results.length).toBe(1);
      expect(results[0].cmd).toBe('/solve');
    });

    it('returns only /hint for "/hint"', () => {
      const results = filterCommands('/hint');
      expect(results.length).toBe(1);
      expect(results[0].cmd).toBe('/hint');
    });

    it('returns only /review for "/review"', () => {
      const results = filterCommands('/review');
      expect(results.length).toBe(1);
      expect(results[0].cmd).toBe('/review');
    });

    it('returns /recap and /review for "/re"', () => {
      const results = filterCommands('/re');
      const cmds = results.map((r) => r.cmd);
      expect(cmds).toContain('/recap');
      expect(cmds).toContain('/review');
    });

    it('returns empty array for unknown prefix "/xyz"', () => {
      expect(filterCommands('/xyz').length).toBe(0);
    });

    it('is case-insensitive — "/S" matches /solve and /stuck', () => {
      const results = filterCommands('/S');
      const cmds = results.map((r) => r.cmd);
      expect(cmds).toContain('/solve');
      expect(cmds).toContain('/stuck');
    });

    it('/chat result has group "Review"', () => {
      const results = filterCommands('/chat');
      expect(results[0].group).toBe('Review');
    });

    it('/hint result has group "During Solving"', () => {
      const results = filterCommands('/hint');
      expect(results[0].group).toBe('During Solving');
    });
  });
});

describe('CommandPalette component', () => {
  describe('renders null when no matches', () => {
    it('returns null for query with no matches', () => {
      const { container } = renderPalette({ query: '/xyz' });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('list container', () => {
    it('renders with role="listbox"', () => {
      renderPalette();
      expect(screen.getByRole('listbox')).toBeDefined();
    });

    it('has aria-label="Command palette"', () => {
      renderPalette();
      const listbox = screen.getByRole('listbox');
      expect(listbox.getAttribute('aria-label')).toBe('Command palette');
    });
  });

  describe('command items', () => {
    it('renders all 11 commands for "/" query', () => {
      renderPalette({ query: '/' });
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(ALL_CMD_COUNT);
    });

    it('renders filtered commands for "/s" query', () => {
      renderPalette({ query: '/s' });
      const options = screen.getAllByRole('option');
      const cmds = options.map((o) => o.textContent);
      expect(cmds.some((t) => t?.includes('/solve'))).toBe(true);
      expect(cmds.some((t) => t?.includes('/stuck'))).toBe(true);
    });

    it('each item has role="option"', () => {
      renderPalette({ query: '/hint' });
      expect(screen.getByRole('option')).toBeDefined();
    });

    it('active item has aria-selected="true"', () => {
      renderPalette({ query: '/s', activeIndex: 0 });
      const options = screen.getAllByRole('option');
      expect(options[0].getAttribute('aria-selected')).toBe('true');
    });

    it('non-active items have aria-selected="false"', () => {
      renderPalette({ query: '/s', activeIndex: 0 });
      const options = screen.getAllByRole('option');
      if (options.length > 1) {
        expect(options[1].getAttribute('aria-selected')).toBe('false');
      }
    });

    it('renders command text inside option', () => {
      renderPalette({ query: '/hint' });
      expect(screen.getByText('/hint')).toBeDefined();
    });

    it('renders description text inside option', () => {
      renderPalette({ query: '/hint' });
      expect(screen.getByText('Get next hint')).toBeDefined();
    });
  });

  describe('group headers', () => {
    it('renders "Navigate" group for "/solve"', () => {
      renderPalette({ query: '/s' });
      // /solve is in Navigate group, /stuck is in During Solving
      expect(screen.getByText('Navigate')).toBeDefined();
      expect(screen.getByText('During Solving')).toBeDefined();
    });

    it('renders "Review" group for "/review"', () => {
      renderPalette({ query: '/re' });
      expect(screen.getByText('Review')).toBeDefined();
    });
  });

  describe('keyboard hint footer', () => {
    it('renders navigation hint text', () => {
      renderPalette();
      expect(screen.getByText('↑↓ navigate')).toBeDefined();
    });

    it('renders insert hint text', () => {
      renderPalette();
      expect(screen.getByText('↵ insert')).toBeDefined();
    });

    it('renders close hint text', () => {
      renderPalette();
      expect(screen.getByText('Esc close')).toBeDefined();
    });
  });

  describe('interactions', () => {
    it('mousedown on item calls onSelect with command', () => {
      const { onSelect } = renderPalette({ query: '/hint' });
      const option = screen.getByRole('option');
      fireEvent.mouseDown(option);
      expect(onSelect).toHaveBeenCalledWith('/hint');
    });

    it('mouseenter on item calls onActiveChange with its index', () => {
      const { onActiveChange } = renderPalette({ query: '/s' });
      const options = screen.getAllByRole('option');
      fireEvent.mouseEnter(options[1]);
      expect(onActiveChange).toHaveBeenCalledWith(1);
    });

    it('mouseenter on first item calls onActiveChange with 0', () => {
      const { onActiveChange } = renderPalette({ query: '/s' });
      const options = screen.getAllByRole('option');
      fireEvent.mouseEnter(options[0]);
      expect(onActiveChange).toHaveBeenCalledWith(0);
    });

    it('mousedown calls onSelect, not onClose', () => {
      const { onSelect, onClose } = renderPalette({ query: '/hint' });
      const option = screen.getByRole('option');
      fireEvent.mouseDown(option);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('data-index attributes', () => {
    it('assigns data-index="0" to first option', () => {
      renderPalette({ query: '/hint' });
      const option = screen.getByRole('option');
      expect(option.getAttribute('data-index')).toBe('0');
    });

    it('assigns sequential data-index across groups', () => {
      renderPalette({ query: '/s' });
      const options = screen.getAllByRole('option');
      options.forEach((option, i) => {
        expect(option.getAttribute('data-index')).toBe(String(i));
      });
    });
  });
});

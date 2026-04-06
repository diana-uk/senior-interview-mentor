import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MistakesPanel from '../MistakesPanel';
import type { MistakeEntryFull } from '../../../types';

vi.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="icon-trash" />,
  RotateCcw: () => <span data-testid="icon-rotate" />,
  Plus: () => <span data-testid="icon-plus" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Undo2: () => <span data-testid="icon-undo" />,
  BookOpen: () => <span data-testid="icon-book" />,
  Download: () => <span data-testid="icon-download" />,
}));

vi.mock('../../ui/EmptyState', () => ({
  default: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}));

const mockDownloadAnkiCSV = vi.fn();
vi.mock('../../../utils/ankiExport', () => ({
  downloadAnkiCSV: (...args: unknown[]) => mockDownloadAnkiCSV(...args),
}));

function makeMistake(overrides: Partial<MistakeEntryFull> = {}): MistakeEntryFull {
  return {
    id: 'm1',
    pattern: 'HashMap',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    description: 'Forgot to check for duplicates',
    createdAt: '2026-01-01T00:00:00Z',
    nextReview: '2026-01-02T00:00:00Z',
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    streak: 0,
    ...overrides,
  };
}

const BASE_PROPS = {
  mistakes: [],
  dueForReview: [],
  onReview: vi.fn(),
  onRemove: vi.fn(),
  onAdd: vi.fn(),
};

beforeEach(() => {
  vi.useFakeTimers();
  mockDownloadAnkiCSV.mockClear();
  BASE_PROPS.onReview.mockClear();
  BASE_PROPS.onRemove.mockClear();
  BASE_PROPS.onAdd.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Pattern groups start collapsed. Click the group header button (which contains a
 * .badge-secondary span) to expand it so card content becomes visible.
 */
function expandGroup(patternName: string) {
  const btn = screen.getByRole('button', { name: new RegExp(patternName) });
  fireEvent.click(btn);
}

describe('MistakesPanel', () => {
  describe('empty state', () => {
    it('shows EmptyState when no mistakes', () => {
      render(<MistakesPanel {...BASE_PROPS} />);
      expect(screen.getByTestId('empty-state')).toBeDefined();
    });

    it('does not show EmptyState when mistakes exist', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      expect(screen.queryByTestId('empty-state')).toBeNull();
    });
  });

  describe('mistake list', () => {
    it('renders mistake description after expanding group', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      expandGroup('HashMap');
      expect(screen.getByText('Forgot to check for duplicates')).toBeDefined();
    });

    it('renders multiple mistakes', () => {
      const mistakes = [
        makeMistake({ id: 'm1', description: 'First mistake' }),
        makeMistake({ id: 'm2', description: 'Second mistake' }),
      ];
      render(<MistakesPanel {...BASE_PROPS} mistakes={mistakes} />);
      expandGroup('HashMap');
      expect(screen.getByText('First mistake')).toBeDefined();
      expect(screen.getByText('Second mistake')).toBeDefined();
    });

    it('renders pattern name in the heat map or badge', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake({ pattern: 'Binary Search' })]} />);
      // Pattern appears in heat map cells and/or group badge
      expect(screen.getAllByText('Binary Search').length).toBeGreaterThan(0);
    });
  });

  describe('due for review', () => {
    it('shows Due for Review section when items are due', () => {
      const due = [makeMistake({ id: 'd1' })];
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} dueForReview={due} />);
      expect(screen.getByText(/Due for Review/)).toBeDefined();
    });

    it('renders due mistakes in the due section', () => {
      const due = [makeMistake({ id: 'd1', description: 'Due mistake' })];
      render(<MistakesPanel {...BASE_PROPS} mistakes={due} dueForReview={due} />);
      expect(screen.getByText('Due mistake')).toBeDefined();
    });
  });

  describe('soft delete with undo', () => {
    it('renders a delete button after expanding group', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      expandGroup('HashMap');
      expect(screen.getAllByTestId('icon-trash').length).toBeGreaterThan(0);
    });

    it('clicking delete shows undo option', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      expandGroup('HashMap');
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      expect(screen.getByTestId('icon-undo')).toBeDefined();
    });

    it('onRemove called after 5s timeout', () => {
      const onRemove = vi.fn();
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake({ id: 'm1' })]} onRemove={onRemove} />);
      expandGroup('HashMap');
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(onRemove).toHaveBeenCalledWith('m1');
    });

    it('clicking undo cancels deletion', () => {
      const onRemove = vi.fn();
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake({ id: 'm1' })]} onRemove={onRemove} />);
      expandGroup('HashMap');
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      fireEvent.click(screen.getByTestId('icon-undo').closest('button')!);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('add form', () => {
    it('add form is hidden by default', () => {
      render(<MistakesPanel {...BASE_PROPS} />);
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeNull();
    });

    it('clicking Log Mistake button shows the add form', () => {
      render(<MistakesPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
    });

    it('has a description textarea in add form', () => {
      render(<MistakesPanel {...BASE_PROPS} />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.getByPlaceholderText(/describe the mistake/i)).toBeDefined();
    });
  });

  describe('Anki export', () => {
    it('Anki button is enabled when mistakes exist', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      const btn = screen.getByTitle(/Export 1 card/);
      expect(btn.hasAttribute('disabled')).toBe(false);
    });

    it('clicking Anki button calls downloadAnkiCSV', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[makeMistake()]} />);
      fireEvent.click(screen.getByTitle(/Export 1 card/));
      expect(mockDownloadAnkiCSV).toHaveBeenCalledOnce();
    });

    it('Anki button is disabled when no mistakes', () => {
      render(<MistakesPanel {...BASE_PROPS} mistakes={[]} />);
      const btn = screen.getByTitle('No mistakes to export');
      expect(btn.hasAttribute('disabled')).toBe(true);
    });
  });
});

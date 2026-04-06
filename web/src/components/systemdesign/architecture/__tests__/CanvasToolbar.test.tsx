import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CanvasToolbar from '../CanvasToolbar';

const mockFitView = vi.fn();

vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({ fitView: mockFitView }),
}));

vi.mock('dagre', () => ({
  default: {
    graphlib: { Graph: class { setDefaultEdgeLabel = vi.fn(); setGraph = vi.fn(); setNode = vi.fn(); setEdge = vi.fn(); node = vi.fn(() => ({ x: 0, y: 0 })); } },
    layout: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  Undo2:      () => <span data-testid="icon-undo" />,
  Redo2:      () => <span data-testid="icon-redo" />,
  LayoutGrid: () => <span data-testid="icon-layout-grid" />,
  Grid3X3:    () => <span data-testid="icon-grid" />,
  Trash2:     () => <span data-testid="icon-trash" />,
  Maximize:   () => <span data-testid="icon-maximize" />,
}));

const BASE_PROPS = {
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  canUndo: false,
  canRedo: false,
  snapToGrid: false,
  onToggleSnap: vi.fn(),
  onClear: vi.fn(),
  edgeType: 'solid' as const,
  onEdgeTypeChange: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onUndo.mockClear();
  BASE_PROPS.onRedo.mockClear();
  BASE_PROPS.onToggleSnap.mockClear();
  BASE_PROPS.onClear.mockClear();
  BASE_PROPS.onEdgeTypeChange.mockClear();
  mockFitView.mockClear();
});

describe('CanvasToolbar', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<CanvasToolbar {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows Undo button with title', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeDefined();
    });

    it('shows Redo button with title', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Redo (Ctrl+Shift+Z)')).toBeDefined();
    });

    it('shows Snap to grid button', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Snap to grid')).toBeDefined();
    });

    it('shows Fit view button', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Fit view')).toBeDefined();
    });

    it('shows Auto-layout button', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Auto-layout')).toBeDefined();
    });

    it('shows Clear canvas button', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Clear canvas')).toBeDefined();
    });

    it('shows Edge style label', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByText('Edge')).toBeDefined();
    });

    it('shows 3 edge style buttons', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      expect(screen.getByTitle('Solid (1)')).toBeDefined();
      expect(screen.getByTitle('Dashed (2)')).toBeDefined();
      expect(screen.getByTitle('Dotted (3)')).toBeDefined();
    });
  });

  describe('Undo/Redo buttons', () => {
    it('Undo button is disabled when canUndo=false', () => {
      render(<CanvasToolbar {...BASE_PROPS} canUndo={false} />);
      expect(screen.getByTitle('Undo (Ctrl+Z)').hasAttribute('disabled')).toBe(true);
    });

    it('Undo button is enabled when canUndo=true', () => {
      render(<CanvasToolbar {...BASE_PROPS} canUndo={true} />);
      expect(screen.getByTitle('Undo (Ctrl+Z)').hasAttribute('disabled')).toBe(false);
    });

    it('clicking Undo calls onUndo', () => {
      render(<CanvasToolbar {...BASE_PROPS} canUndo={true} />);
      fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'));
      expect(BASE_PROPS.onUndo).toHaveBeenCalledOnce();
    });

    it('Redo button is disabled when canRedo=false', () => {
      render(<CanvasToolbar {...BASE_PROPS} canRedo={false} />);
      expect(screen.getByTitle('Redo (Ctrl+Shift+Z)').hasAttribute('disabled')).toBe(true);
    });

    it('Redo button is enabled when canRedo=true', () => {
      render(<CanvasToolbar {...BASE_PROPS} canRedo={true} />);
      expect(screen.getByTitle('Redo (Ctrl+Shift+Z)').hasAttribute('disabled')).toBe(false);
    });

    it('clicking Redo calls onRedo', () => {
      render(<CanvasToolbar {...BASE_PROPS} canRedo={true} />);
      fireEvent.click(screen.getByTitle('Redo (Ctrl+Shift+Z)'));
      expect(BASE_PROPS.onRedo).toHaveBeenCalledOnce();
    });
  });

  describe('Snap to grid', () => {
    it('snap button does not have active class when snapToGrid=false', () => {
      render(<CanvasToolbar {...BASE_PROPS} snapToGrid={false} />);
      const btn = screen.getByTitle('Snap to grid');
      expect(btn.classList.contains('canvas-toolbar__btn--active')).toBe(false);
    });

    it('snap button has active class when snapToGrid=true', () => {
      render(<CanvasToolbar {...BASE_PROPS} snapToGrid={true} />);
      const btn = screen.getByTitle('Snap to grid');
      expect(btn.classList.contains('canvas-toolbar__btn--active')).toBe(true);
    });

    it('clicking snap button calls onToggleSnap', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Snap to grid'));
      expect(BASE_PROPS.onToggleSnap).toHaveBeenCalledOnce();
    });
  });

  describe('Fit view', () => {
    it('clicking Fit view calls fitView', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Fit view'));
      expect(mockFitView).toHaveBeenCalledOnce();
    });
  });

  describe('Clear canvas', () => {
    it('clicking Clear canvas calls onClear', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Clear canvas'));
      expect(BASE_PROPS.onClear).toHaveBeenCalledOnce();
    });
  });

  describe('edge style buttons', () => {
    it('active edge style button has active class', () => {
      render(<CanvasToolbar {...BASE_PROPS} edgeType="solid" />);
      const btn = screen.getByTitle('Solid (1)');
      expect(btn.classList.contains('canvas-toolbar__btn--active')).toBe(true);
    });

    it('inactive edge style buttons do not have active class', () => {
      render(<CanvasToolbar {...BASE_PROPS} edgeType="solid" />);
      expect(screen.getByTitle('Dashed (2)').classList.contains('canvas-toolbar__btn--active')).toBe(false);
      expect(screen.getByTitle('Dotted (3)').classList.contains('canvas-toolbar__btn--active')).toBe(false);
    });

    it('clicking Dashed calls onEdgeTypeChange with "dashed"', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Dashed (2)'));
      expect(BASE_PROPS.onEdgeTypeChange).toHaveBeenCalledWith('dashed');
    });

    it('clicking Dotted calls onEdgeTypeChange with "dotted"', () => {
      render(<CanvasToolbar {...BASE_PROPS} />);
      fireEvent.click(screen.getByTitle('Dotted (3)'));
      expect(BASE_PROPS.onEdgeTypeChange).toHaveBeenCalledWith('dotted');
    });

    it('clicking Solid calls onEdgeTypeChange with "solid"', () => {
      render(<CanvasToolbar {...BASE_PROPS} edgeType="dashed" />);
      fireEvent.click(screen.getByTitle('Solid (1)'));
      expect(BASE_PROPS.onEdgeTypeChange).toHaveBeenCalledWith('solid');
    });
  });
});

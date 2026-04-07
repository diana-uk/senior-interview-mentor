import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LabeledEdge from '../LabeledEdge';
import type { Position } from '@xyflow/react';

const mockSetEdges = vi.fn();

vi.mock('@xyflow/react', () => ({
  BaseEdge: ({ path }: { path: string }) => <svg><path data-testid="base-edge" d={path} /></svg>,
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div data-testid="edge-label-renderer">{children}</div>,
  getBezierPath: vi.fn(() => ['M 0 0 L 100 100', 50, 50]),
  useReactFlow: () => ({ setEdges: mockSetEdges }),
}));

import { getBezierPath } from '@xyflow/react';

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'edge-1',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: 'right' as Position,
    targetPosition: 'left' as Position,
    label: '',
    data: { edgeStyle: 'solid' as const },
    style: {},
    markerEnd: undefined,
    selected: false,
    source: 'node-1',
    target: 'node-2',
    sourceHandleId: null,
    targetHandleId: null,
    interactionWidth: 20,
    ...overrides,
  } as never;
}

beforeEach(() => {
  mockSetEdges.mockClear();
  vi.mocked(getBezierPath).mockClear();
});

describe('LabeledEdge', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<LabeledEdge {...makeProps()} />)).not.toThrow();
    });

    it('renders BaseEdge path', () => {
      render(<LabeledEdge {...makeProps()} />);
      expect(screen.getByTestId('base-edge')).toBeDefined();
    });

    it('calls getBezierPath with edge coordinates', () => {
      render(<LabeledEdge {...makeProps({ sourceX: 10, sourceY: 20, targetX: 110, targetY: 120 })} />);
      expect(getBezierPath).toHaveBeenCalledWith(expect.objectContaining({
        sourceX: 10, sourceY: 20, targetX: 110, targetY: 120,
      }));
    });

    it('renders EdgeLabelRenderer', () => {
      render(<LabeledEdge {...makeProps()} />);
      expect(screen.getByTestId('edge-label-renderer')).toBeDefined();
    });
  });

  describe('unselected state without label', () => {
    it('shows + add button when not selected and no label', () => {
      render(<LabeledEdge {...makeProps({ selected: false, label: '' })} />);
      expect(screen.getByText('+')).toBeDefined();
    });

    it('+ button has "Click edge to edit" title', () => {
      render(<LabeledEdge {...makeProps({ selected: false, label: '' })} />);
      expect(screen.getByTitle('Click edge to edit')).toBeDefined();
    });
  });

  describe('unselected state with label', () => {
    it('shows label pill when not selected but has label', () => {
      render(<LabeledEdge {...makeProps({ selected: false, label: 'HTTP/2' })} />);
      expect(screen.getByText('HTTP/2')).toBeDefined();
    });

    it('label pill has edge-label__pill class', () => {
      render(<LabeledEdge {...makeProps({ selected: false, label: 'async' })} />);
      expect(document.querySelector('.edge-label__pill')).not.toBeNull();
    });
  });

  describe('selected state — inline toolbar', () => {
    it('shows inline toolbar when selected', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      expect(document.querySelector('.edge-inline-toolbar')).not.toBeNull();
    });

    it('shows 3 style buttons (Solid, Dashed, Dotted)', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      expect(screen.getByTitle('Solid')).toBeDefined();
      expect(screen.getByTitle('Dashed')).toBeDefined();
      expect(screen.getByTitle('Dotted')).toBeDefined();
    });

    it('active style button has --active class', () => {
      render(<LabeledEdge {...makeProps({ selected: true, data: { edgeStyle: 'solid' } })} />);
      expect(screen.getByTitle('Solid').classList.contains('edge-inline-toolbar__btn--active')).toBe(true);
    });

    it('inactive style buttons do not have --active class', () => {
      render(<LabeledEdge {...makeProps({ selected: true, data: { edgeStyle: 'solid' } })} />);
      expect(screen.getByTitle('Dashed').classList.contains('edge-inline-toolbar__btn--active')).toBe(false);
      expect(screen.getByTitle('Dotted').classList.contains('edge-inline-toolbar__btn--active')).toBe(false);
    });

    it('clicking Dashed style calls setEdges', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      fireEvent.click(screen.getByTitle('Dashed'));
      expect(mockSetEdges).toHaveBeenCalledOnce();
    });

    it('clicking Dotted style calls setEdges', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      fireEvent.click(screen.getByTitle('Dotted'));
      expect(mockSetEdges).toHaveBeenCalledOnce();
    });

    it('shows label input', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      expect(screen.getByPlaceholderText('Label...')).toBeDefined();
    });

    it('shows label input populated with existing label', () => {
      render(<LabeledEdge {...makeProps({ selected: true, label: 'existing' })} />);
      expect((screen.getByPlaceholderText('Label...') as HTMLInputElement).value).toBe('existing');
    });

    it('blurring label input calls setEdges', () => {
      render(<LabeledEdge {...makeProps({ selected: true, label: 'hello' })} />);
      fireEvent.blur(screen.getByPlaceholderText('Label...'));
      expect(mockSetEdges).toHaveBeenCalledOnce();
    });

    it('shows delete edge button', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      expect(screen.getByTitle('Delete edge')).toBeDefined();
    });

    it('clicking delete edge calls setEdges', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      fireEvent.click(screen.getByTitle('Delete edge'));
      expect(mockSetEdges).toHaveBeenCalledOnce();
    });
  });

  describe('label keyboard interactions', () => {
    it('Enter key in label input blurs the input', () => {
      render(<LabeledEdge {...makeProps({ selected: true })} />);
      const input = screen.getByPlaceholderText('Label...');
      const blurSpy = vi.spyOn(input, 'blur');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(blurSpy).toHaveBeenCalledOnce();
    });

    it('Escape key resets label to original value', () => {
      render(<LabeledEdge {...makeProps({ selected: true, label: 'original' })} />);
      const input = screen.getByPlaceholderText('Label...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'changed' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(input.value).toBe('original');
    });
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemNode from '../SystemNode';

const mockSetNodes = vi.fn();

vi.mock('@xyflow/react', () => ({
  Handle: ({ id, className }: { id: string; className: string }) => (
    <div data-testid={`handle-${id}`} className={className} />
  ),
  Position: { Top: 'top', Right: 'right', Bottom: 'bottom', Left: 'left' },
  useReactFlow: () => ({ setNodes: mockSetNodes }),
}));

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'node-1',
    data: { label: 'My Service', componentType: 'service' },
    selected: false,
    type: 'system',
    dragging: false,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    zIndex: 0,
    ...overrides,
  } as never;
}

beforeEach(() => {
  mockSetNodes.mockClear();
});

describe('SystemNode', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<SystemNode {...makeProps()} />)).not.toThrow();
    });

    it('shows the label', () => {
      render(<SystemNode {...makeProps({ data: { label: 'API Gateway', componentType: 'api-gateway' } })} />);
      expect(screen.getByText('API Gateway')).toBeDefined();
    });

    it('shows icon for service componentType', () => {
      render(<SystemNode {...makeProps({ data: { label: 'Svc', componentType: 'service' } })} />);
      expect(screen.getByText('dns')).toBeDefined();
    });

    it('shows icon for database componentType', () => {
      render(<SystemNode {...makeProps({ data: { label: 'DB', componentType: 'database' } })} />);
      expect(screen.getByText('database')).toBeDefined();
    });

    it('shows icon for cache componentType', () => {
      render(<SystemNode {...makeProps({ data: { label: 'Cache', componentType: 'cache' } })} />);
      expect(screen.getByText('bolt')).toBeDefined();
    });

    it('falls back to service icon for unknown componentType', () => {
      render(<SystemNode {...makeProps({ data: { label: 'Unknown', componentType: 'unknown-type' } })} />);
      expect(screen.getByText('dns')).toBeDefined();
    });

    it('has system-node CSS class', () => {
      render(<SystemNode {...makeProps()} />);
      expect(document.querySelector('.system-node')).not.toBeNull();
    });

    it('has data-node-id attribute', () => {
      render(<SystemNode {...makeProps({ id: 'abc123' })} />);
      expect(document.querySelector('[data-node-id="abc123"]')).not.toBeNull();
    });

    it('renders 8 handles (2 per side)', () => {
      render(<SystemNode {...makeProps()} />);
      const handles = ['top-tgt', 'top-src', 'right-tgt', 'right-src', 'bottom-tgt', 'bottom-src', 'left-tgt', 'left-src'];
      handles.forEach(h => expect(screen.getByTestId(`handle-${h}`)).toBeDefined());
    });
  });

  describe('label editing', () => {
    it('input is not shown initially', () => {
      render(<SystemNode {...makeProps()} />);
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('double-click switches to editing mode', () => {
      render(<SystemNode {...makeProps({ data: { label: 'My Service', componentType: 'service' } })} />);
      fireEvent.doubleClick(document.querySelector('.system-node')!);
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('pressing Enter commits label and calls setNodes', () => {
      render(<SystemNode {...makeProps({ data: { label: 'My Service', componentType: 'service' } })} />);
      fireEvent.doubleClick(document.querySelector('.system-node')!);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Auth Service' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockSetNodes).toHaveBeenCalledOnce();
    });

    it('blurring input commits label and calls setNodes', () => {
      render(<SystemNode {...makeProps({ data: { label: 'My Service', componentType: 'service' } })} />);
      fireEvent.doubleClick(document.querySelector('.system-node')!);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Renamed' } });
      fireEvent.blur(input);
      expect(mockSetNodes).toHaveBeenCalledOnce();
    });

    it('after Enter, editing mode is exited', () => {
      render(<SystemNode {...makeProps({ data: { label: 'My Service', componentType: 'service' } })} />);
      fireEvent.doubleClick(document.querySelector('.system-node')!);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(screen.queryByRole('textbox')).toBeNull();
    });
  });
});

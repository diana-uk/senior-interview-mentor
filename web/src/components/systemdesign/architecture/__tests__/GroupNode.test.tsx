import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GroupNode from '../GroupNode';

const mockSetNodes = vi.fn();

vi.mock('@xyflow/react', () => ({
  NodeResizer: () => <div data-testid="node-resizer" />,
  useReactFlow: () => ({ setNodes: mockSetNodes }),
}));

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    id: 'node-1',
    data: { label: 'My Group', zoneStyle: 'vpc', componentType: 'service' },
    selected: false,
    type: 'group',
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

describe('GroupNode', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<GroupNode {...makeProps()} />)).not.toThrow();
    });

    it('shows the label text', () => {
      render(<GroupNode {...makeProps({ data: { label: 'VPC Zone', zoneStyle: 'vpc' } })} />);
      expect(screen.getByText('VPC Zone')).toBeDefined();
    });

    it('shows zone badge with uppercased zone name (vpc)', () => {
      render(<GroupNode {...makeProps({ data: { label: 'Zone', zoneStyle: 'vpc' } })} />);
      expect(screen.getByText('VPC')).toBeDefined();
    });

    it('shows zone badge with uppercased zone name (az)', () => {
      render(<GroupNode {...makeProps({ data: { label: 'Zone', zoneStyle: 'az' } })} />);
      expect(screen.getByText('AZ')).toBeDefined();
    });

    it('shows zone badge with uppercased zone name (cluster)', () => {
      render(<GroupNode {...makeProps({ data: { label: 'Zone', zoneStyle: 'cluster' } })} />);
      expect(screen.getByText('CLUSTER')).toBeDefined();
    });

    it('defaults to vpc when no zoneStyle', () => {
      render(<GroupNode {...makeProps({ data: { label: 'Zone' } })} />);
      expect(screen.getByText('VPC')).toBeDefined();
    });

    it('renders NodeResizer', () => {
      render(<GroupNode {...makeProps()} />);
      expect(screen.getByTestId('node-resizer')).toBeDefined();
    });

    it('has group-node CSS class', () => {
      render(<GroupNode {...makeProps()} />);
      expect(document.querySelector('.group-node')).not.toBeNull();
    });
  });

  describe('label editing', () => {
    it('double-clicking header switches to editing mode', () => {
      render(<GroupNode {...makeProps({ data: { label: 'My Group', zoneStyle: 'vpc' } })} />);
      fireEvent.doubleClick(document.querySelector('.group-node__header')!);
      expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('input is not shown when not editing', () => {
      render(<GroupNode {...makeProps({ data: { label: 'My Group', zoneStyle: 'vpc' } })} />);
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('pressing Enter commits label and calls setNodes', () => {
      render(<GroupNode {...makeProps({ data: { label: 'My Group', zoneStyle: 'vpc' } })} />);
      fireEvent.doubleClick(document.querySelector('.group-node__header')!);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'New Label' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockSetNodes).toHaveBeenCalledOnce();
    });

    it('blurring input commits label and calls setNodes', () => {
      render(<GroupNode {...makeProps({ data: { label: 'My Group', zoneStyle: 'vpc' } })} />);
      fireEvent.doubleClick(document.querySelector('.group-node__header')!);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Updated' } });
      fireEvent.blur(input);
      expect(mockSetNodes).toHaveBeenCalledOnce();
    });

    it('after committing, label input is hidden', () => {
      render(<GroupNode {...makeProps({ data: { label: 'My Group', zoneStyle: 'vpc' } })} />);
      fireEvent.doubleClick(document.querySelector('.group-node__header')!);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(screen.queryByRole('textbox')).toBeNull();
    });
  });
});

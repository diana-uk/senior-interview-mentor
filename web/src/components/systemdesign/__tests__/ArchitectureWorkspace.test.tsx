import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArchitectureWorkspace from '../ArchitectureWorkspace';
import type { SystemDesignPhase, PhaseStatus } from '../../../types';

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  MiniMap:    () => <div data-testid="mini-map" />,
  Controls:   () => <div data-testid="controls" />,
  Background: () => <div data-testid="background" />,
  BackgroundVariant: { Dots: 'dots' },
  addEdge:           vi.fn((_edge, eds) => eds),
  applyNodeChanges:  vi.fn((_changes, nds) => nds),
  applyEdgeChanges:  vi.fn((_changes, eds) => eds),
  useReactFlow: () => ({
    screenToFlowPosition: vi.fn(() => ({ x: 100, y: 100 })),
    fitView: vi.fn(),
  }),
  MarkerType:       { ArrowClosed: 'arrowclosed' },
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('lucide-react', () => ({
  ArrowRight:   () => <span data-testid="icon-arrow-right" />,
  Download:     () => <span data-testid="icon-download" />,
  CheckCircle:  () => <span data-testid="icon-check-circle" />,
  ChevronDown:  () => <span data-testid="icon-chevron-down" />,
  ChevronUp:    () => <span data-testid="icon-chevron-up" />,
}));

vi.mock('../PhaseProgressSidebar', () => ({
  default: () => <div data-testid="phase-progress-sidebar" />,
}));

vi.mock('../MentorPanel', () => ({
  default: () => <div data-testid="mentor-panel" />,
}));

vi.mock('../architecture/ComponentPalette', () => ({
  default: () => <div data-testid="component-palette" />,
}));

vi.mock('../architecture/CanvasToolbar', () => ({
  default: () => <div data-testid="canvas-toolbar" />,
  autoLayout: vi.fn((nds: unknown[]) => nds),
}));

vi.mock('../architecture/SystemNode', () => ({ default: () => <div /> }));
vi.mock('../architecture/GroupNode',  () => ({ default: () => <div /> }));
vi.mock('../architecture/LabeledEdge', () => ({ default: () => <div /> }));

vi.mock('../architecture/diagramSerializer', () => ({
  serializeDiagramToText: vi.fn(() => 'serialized-diagram'),
  exportDiagramAsPng:     vi.fn(() => Promise.resolve(new Blob(['png'], { type: 'image/png' }))),
}));

vi.mock('../../../hooks/useUndoRedo', () => ({
  useUndoRedo: () => ({
    pushState: vi.fn(),
    undo:      vi.fn(),
    redo:      vi.fn(),
    canUndo:   vi.fn(() => false),
    canRedo:   vi.fn(() => false),
  }),
}));

import { serializeDiagramToText, exportDiagramAsPng } from '../architecture/diagramSerializer';

function makeNode(overrides = {}) {
  return {
    id: 'n1',
    type: 'system' as const,
    position: { x: 0, y: 0 },
    data: { label: 'API Server', componentType: 'service' as const },
    ...overrides,
  };
}

function makeStatuses(
  overrides: Partial<Record<SystemDesignPhase, PhaseStatus>> = {},
): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'completed', requirements: 'completed', api: 'completed',
    data: 'completed', architecture: 'in-progress', deepdive: 'locked',
    scaling: 'locked',
    ...overrides,
  };
}

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview', 'requirements', 'api', 'data', 'architecture', 'deepdive', 'scaling',
];

const BASE_PROPS = {
  diagramNodes: [] as ReturnType<typeof makeNode>[],
  diagramEdges: [] as never[],
  onUpdateDiagram: vi.fn(),
  onAdvancePhase:  vi.fn(),
  currentPhase:    'architecture' as SystemDesignPhase,
  phaseStatuses:   makeStatuses(),
  phaseOrder:      PHASE_ORDER,
  onPhaseClick:    vi.fn(),
  timerSeconds:    900,
  messages:        [],
  onSendMessage:   vi.fn(),
  isStreaming:     false,
  onStopStreaming: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onUpdateDiagram.mockClear();
  BASE_PROPS.onAdvancePhase.mockClear();
  BASE_PROPS.onPhaseClick.mockClear();
  BASE_PROPS.onSendMessage.mockClear();
  BASE_PROPS.onStopStreaming.mockClear();
  vi.mocked(serializeDiagramToText).mockClear();
  vi.mocked(exportDiagramAsPng).mockClear();
});

describe('ArchitectureWorkspace', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<ArchitectureWorkspace {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders PhaseProgressSidebar', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('phase-progress-sidebar')).toBeDefined();
    });

    it('renders MentorPanel', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('mentor-panel')).toBeDefined();
    });

    it('renders ComponentPalette', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('component-palette')).toBeDefined();
    });

    it('renders CanvasToolbar', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('canvas-toolbar')).toBeDefined();
    });

    it('renders ReactFlow canvas', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByTestId('react-flow')).toBeDefined();
    });
  });

  describe('Architecture Notes panel', () => {
    it('shows Architecture Notes toggle button', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Architecture Notes')).toBeDefined();
    });

    it('notes textarea is hidden by default', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.queryByPlaceholderText(/Document your architecture/)).toBeNull();
    });

    it('clicking notes toggle shows textarea', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Architecture Notes'));
      expect(screen.getByPlaceholderText(/Document your architecture/)).toBeDefined();
    });

    it('clicking notes toggle again hides textarea', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      const toggle = screen.getByText('Architecture Notes');
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      expect(screen.queryByPlaceholderText(/Document your architecture/)).toBeNull();
    });

    it('typing in notes textarea updates its value', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Architecture Notes'));
      const ta = screen.getByPlaceholderText(/Document your architecture/) as HTMLTextAreaElement;
      fireEvent.change(ta, { target: { value: 'My notes here' } });
      expect(ta.value).toBe('My notes here');
    });

    it('shows ChevronUp icon when notes closed', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getAllByTestId('icon-chevron-up').length).toBeGreaterThan(0);
    });

    it('shows ChevronDown icon when notes open', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Architecture Notes'));
      expect(screen.getAllByTestId('icon-chevron-down').length).toBeGreaterThan(0);
    });
  });

  describe('action buttons', () => {
    it('shows Validate Architecture button', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Validate Architecture')).toBeDefined();
    });

    it('Validate Architecture is disabled when no nodes', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[]} />);
      expect(
        (screen.getByText('Validate Architecture').closest('button') as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it('Validate Architecture is enabled when nodes are provided', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[makeNode()]} />);
      expect(
        (screen.getByText('Validate Architecture').closest('button') as HTMLButtonElement).disabled,
      ).toBe(false);
    });

    it('clicking Validate Architecture calls serializeDiagramToText', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[makeNode()]} />);
      fireEvent.click(screen.getByText('Validate Architecture').closest('button')!);
      expect(serializeDiagramToText).toHaveBeenCalledOnce();
    });

    it('clicking Validate Architecture calls onSendMessage with serialized text', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[makeNode()]} />);
      fireEvent.click(screen.getByText('Validate Architecture').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my architecture:\n\nserialized-diagram',
      );
    });

    it('Validate Architecture appends notes when notes are filled', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[makeNode()]} />);
      fireEvent.click(screen.getByText('Architecture Notes'));
      fireEvent.change(screen.getByPlaceholderText(/Document your architecture/), {
        target: { value: 'My design notes' },
      });
      fireEvent.click(screen.getByText('Validate Architecture').closest('button')!);
      expect(BASE_PROPS.onSendMessage).toHaveBeenCalledWith(
        'Please review my architecture:\n\nserialized-diagram\n\nMy architecture notes:\nMy design notes',
      );
    });

    it('shows Export PNG button', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByText('Export PNG')).toBeDefined();
    });

    it('Export PNG is disabled when no nodes', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[]} />);
      expect(
        (screen.getByText('Export PNG').closest('button') as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it('Export PNG is enabled when nodes are provided', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} diagramNodes={[makeNode()]} />);
      expect(
        (screen.getByText('Export PNG').closest('button') as HTMLButtonElement).disabled,
      ).toBe(false);
    });

    it('shows Next: Deep Dive button', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      expect(screen.getByText(/Next: Deep Dive/)).toBeDefined();
    });

    it('clicking Next: Deep Dive calls onAdvancePhase', () => {
      render(<ArchitectureWorkspace {...BASE_PROPS} />);
      fireEvent.click(screen.getByText(/Next: Deep Dive/).closest('button')!);
      expect(BASE_PROPS.onAdvancePhase).toHaveBeenCalledOnce();
    });
  });
});

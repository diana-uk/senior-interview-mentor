import { useReactFlow } from '@xyflow/react';
import { Undo2, Redo2, LayoutGrid, Grid3X3, Trash2, Maximize } from 'lucide-react';
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export type EdgeStyleType = 'solid' | 'dashed' | 'dotted';

interface CanvasToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  onClear: () => void;
  edgeType: EdgeStyleType;
  onEdgeTypeChange: (type: EdgeStyleType) => void;
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 50;

export function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });

  for (const node of nodes) {
    const w = node.type === 'group' ? (node.width ?? 300) : NODE_WIDTH;
    const h = node.type === 'group' ? (node.height ?? 200) : NODE_HEIGHT;
    g.setNode(node.id, { width: w, height: h });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map(node => {
    const pos = g.node(node.id);
    const w = node.type === 'group' ? (node.width ?? 300) : NODE_WIDTH;
    const h = node.type === 'group' ? (node.height ?? 200) : NODE_HEIGHT;
    return {
      ...node,
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      },
    };
  });
}

const EDGE_STYLES: { value: EdgeStyleType; title: string; key: string }[] = [
  { value: 'solid', title: 'Solid (1)', key: '1' },
  { value: 'dashed', title: 'Dashed (2)', key: '2' },
  { value: 'dotted', title: 'Dotted (3)', key: '3' },
];

export default function CanvasToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  snapToGrid,
  onToggleSnap,
  onClear,
  edgeType,
  onEdgeTypeChange,
}: CanvasToolbarProps) {
  const { fitView } = useReactFlow();

  return (
    <div className="canvas-toolbar">
      <button
        className="canvas-toolbar__btn"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        className="canvas-toolbar__btn"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className={`canvas-toolbar__btn ${snapToGrid ? 'canvas-toolbar__btn--active' : ''}`}
        onClick={onToggleSnap}
        title="Snap to grid"
      >
        <Grid3X3 size={16} />
      </button>
      <button
        className="canvas-toolbar__btn"
        onClick={() => fitView({ padding: 0.2 })}
        title="Fit view"
      >
        <Maximize size={16} />
      </button>

      <div className="canvas-toolbar__divider" />

      <button
        className="canvas-toolbar__btn"
        title="Auto-layout"
        onClick={() => {
          window.dispatchEvent(new CustomEvent('arch-auto-layout'));
        }}
      >
        <LayoutGrid size={16} />
      </button>
      <button
        className="canvas-toolbar__btn canvas-toolbar__btn--danger"
        onClick={onClear}
        title="Clear canvas"
      >
        <Trash2 size={16} />
      </button>

      <div className="canvas-toolbar__divider" />

      <span className="canvas-toolbar__edge-label">Edge</span>
      {EDGE_STYLES.map(s => (
        <button
          key={s.value}
          className={`canvas-toolbar__btn ${edgeType === s.value ? 'canvas-toolbar__btn--active' : ''}`}
          onClick={() => onEdgeTypeChange(s.value)}
          title={s.title}
        >
          <span className={`style-line style-line--${s.value}`} />
        </button>
      ))}
    </div>
  );
}

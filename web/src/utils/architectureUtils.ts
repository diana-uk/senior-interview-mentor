import type { Node, Edge } from '@xyflow/react';
import type { SystemDesignState, DiagramNodeData } from '../types';

/**
 * Serialize React Flow nodes to the plain DiagramNode shape
 * stored in SystemDesignState. Conditionally includes style,
 * width, and height only when present on the source node.
 */
export function serializeNodes(nds: Node[]): SystemDesignState['diagramNodes'] {
  return nds.map(n => ({
    id: n.id,
    type: n.type ?? 'system',
    position: n.position,
    data: n.data as DiagramNodeData,
    ...(n.style ? { style: n.style } : {}),
    ...(n.width != null ? { width: n.width } : {}),
    ...(n.height != null ? { height: n.height } : {}),
  }));
}

/**
 * Serialize React Flow edges to the plain DiagramEdge shape
 * stored in SystemDesignState. Converts null handles to undefined
 * and ignores non-string labels.
 */
export function serializeEdges(eds: Edge[]): SystemDesignState['diagramEdges'] {
  return eds.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    label: typeof e.label === 'string' ? e.label : undefined,
    animated: e.animated,
    type: e.type,
    data: e.data as { edgeStyle?: 'solid' | 'dashed' | 'dotted' } | undefined,
  }));
}

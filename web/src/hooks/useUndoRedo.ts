import { useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const past = useRef<HistoryEntry[]>([]);
  const future = useRef<HistoryEntry[]>([]);

  const pushState = useCallback((nodes: Node[], edges: Edge[]) => {
    past.current = [
      ...past.current.slice(-(MAX_HISTORY - 1)),
      { nodes: structuredClone(nodes), edges: structuredClone(edges) },
    ];
    future.current = [];
  }, []);

  const undo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]): HistoryEntry | null => {
      if (past.current.length === 0) return null;
      const prev = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [
        ...future.current,
        { nodes: structuredClone(currentNodes), edges: structuredClone(currentEdges) },
      ];
      return prev;
    },
    [],
  );

  const redo = useCallback(
    (currentNodes: Node[], currentEdges: Edge[]): HistoryEntry | null => {
      if (future.current.length === 0) return null;
      const next = future.current[future.current.length - 1];
      future.current = future.current.slice(0, -1);
      past.current = [
        ...past.current,
        { nodes: structuredClone(currentNodes), edges: structuredClone(currentEdges) },
      ];
      return next;
    },
    [],
  );

  const canUndo = useCallback(() => past.current.length > 0, []);
  const canRedo = useCallback(() => future.current.length > 0, []);

  return { pushState, undo, redo, canUndo, canRedo };
}

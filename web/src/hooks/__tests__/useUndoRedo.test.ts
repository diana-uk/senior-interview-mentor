import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUndoRedo } from '../useUndoRedo';
import type { Node, Edge } from '@xyflow/react';

// Helper factories for mock nodes/edges
function makeNode(id: string, label = `Node ${id}`): Node {
  return { id, position: { x: 0, y: 0 }, data: { label }, type: 'default' };
}

function makeEdge(id: string, source: string, target: string): Edge {
  return { id, source, target };
}

describe('useUndoRedo', () => {

  // ── Initial state ──

  describe('initial state', () => {
    it('cannot undo initially', () => {
      const { result } = renderHook(() => useUndoRedo());
      expect(result.current.canUndo()).toBe(false);
    });

    it('cannot redo initially', () => {
      const { result } = renderHook(() => useUndoRedo());
      expect(result.current.canRedo()).toBe(false);
    });

    it('undo returns null when no history', () => {
      const { result } = renderHook(() => useUndoRedo());
      const entry = result.current.undo([], []);
      expect(entry).toBeNull();
    });

    it('redo returns null when no future', () => {
      const { result } = renderHook(() => useUndoRedo());
      const entry = result.current.redo([], []);
      expect(entry).toBeNull();
    });
  });

  // ── pushState ──

  describe('pushState', () => {
    it('enables undo after pushing a state', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);
      expect(result.current.canUndo()).toBe(true);
    });

    it('clears redo stack on pushState', () => {
      const { result } = renderHook(() => useUndoRedo());
      const nodes1 = [makeNode('1')];
      const nodes2 = [makeNode('2')];
      const nodes3 = [makeNode('3')];

      result.current.pushState(nodes1, []);
      result.current.pushState(nodes2, []);
      // Undo to create redo history
      result.current.undo(nodes3, []);
      expect(result.current.canRedo()).toBe(true);

      // Push new state clears redo
      result.current.pushState([makeNode('4')], []);
      expect(result.current.canRedo()).toBe(false);
    });

    it('deep-clones nodes (mutations do not affect history)', () => {
      const { result } = renderHook(() => useUndoRedo());
      const node = makeNode('1', 'original');
      result.current.pushState([node], []);

      // Mutate after push
      node.data.label = 'mutated';

      const entry = result.current.undo([], []);
      expect(entry!.nodes[0].data.label).toBe('original');
    });

    it('deep-clones edges (mutations do not affect history)', () => {
      const { result } = renderHook(() => useUndoRedo());
      const edge = makeEdge('e1', 'a', 'b');
      result.current.pushState([], [edge]);

      // Mutate after push
      edge.source = 'mutated';

      const entry = result.current.undo([], []);
      expect(entry!.edges[0].source).toBe('a');
    });

    it('limits history to 50 entries', () => {
      const { result } = renderHook(() => useUndoRedo());

      // Push 55 states
      for (let i = 0; i < 55; i++) {
        result.current.pushState([makeNode(String(i))], []);
      }

      // Should be able to undo 50 times (MAX_HISTORY)
      let undoCount = 0;
      while (result.current.canUndo()) {
        result.current.undo([], []);
        undoCount++;
      }
      expect(undoCount).toBe(50);
    });

    it('keeps the most recent entries when exceeding max', () => {
      const { result } = renderHook(() => useUndoRedo());

      for (let i = 0; i < 55; i++) {
        result.current.pushState([makeNode(String(i), `label-${i}`)], []);
      }

      // Undo all the way — first undo returns the 54th push (latest)
      const first = result.current.undo([], []);
      expect(first!.nodes[0].data.label).toBe('label-54');

      // Undo 49 more to reach the oldest kept entry
      for (let i = 0; i < 48; i++) {
        result.current.undo([], []);
      }
      const oldest = result.current.undo([], []);
      expect(oldest!.nodes[0].data.label).toBe('label-5');
    });
  });

  // ── undo ──

  describe('undo', () => {
    it('returns the previous state', () => {
      const { result } = renderHook(() => useUndoRedo());
      const nodes = [makeNode('1', 'first')];
      result.current.pushState(nodes, []);

      const entry = result.current.undo([makeNode('2', 'current')], []);
      expect(entry!.nodes[0].data.label).toBe('first');
    });

    it('enables redo after undo', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);
      result.current.undo([makeNode('2')], []);
      expect(result.current.canRedo()).toBe(true);
    });

    it('saves current state to redo stack', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 'pushed')], []);

      const current = [makeNode('2', 'current')];
      result.current.undo(current, []);

      const redone = result.current.redo([], []);
      expect(redone!.nodes[0].data.label).toBe('current');
    });

    it('deep-clones current state before saving to redo', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);

      const current = [makeNode('2', 'before-mutate')];
      result.current.undo(current, []);

      // Mutate after undo
      current[0].data.label = 'after-mutate';

      const redone = result.current.redo([], []);
      expect(redone!.nodes[0].data.label).toBe('before-mutate');
    });

    it('multiple undos walk back through history', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 'state-1')], []);
      result.current.pushState([makeNode('2', 'state-2')], []);
      result.current.pushState([makeNode('3', 'state-3')], []);

      const third = result.current.undo([makeNode('4', 'current')], []);
      expect(third!.nodes[0].data.label).toBe('state-3');

      const second = result.current.undo([makeNode('x')], []);
      expect(second!.nodes[0].data.label).toBe('state-2');

      const first = result.current.undo([makeNode('x')], []);
      expect(first!.nodes[0].data.label).toBe('state-1');

      expect(result.current.canUndo()).toBe(false);
    });

    it('returns edges along with nodes', () => {
      const { result } = renderHook(() => useUndoRedo());
      const edges = [makeEdge('e1', 'a', 'b')];
      result.current.pushState([], edges);

      const entry = result.current.undo([], []);
      expect(entry!.edges).toHaveLength(1);
      expect(entry!.edges[0].id).toBe('e1');
    });
  });

  // ── redo ──

  describe('redo', () => {
    it('returns the next future state', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 'pushed')], []);
      result.current.undo([makeNode('2', 'after-undo')], []);

      const redone = result.current.redo([], []);
      expect(redone!.nodes[0].data.label).toBe('after-undo');
    });

    it('enables undo after redo', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);
      result.current.undo([makeNode('2')], []);
      result.current.redo([], []);
      expect(result.current.canUndo()).toBe(true);
    });

    it('saves current state to undo stack on redo', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 'pushed')], []);
      result.current.undo([makeNode('2', 'undone-to')], []);

      const current = [makeNode('3', 'before-redo')];
      result.current.redo(current, []);

      const undone = result.current.undo([], []);
      expect(undone!.nodes[0].data.label).toBe('before-redo');
    });

    it('deep-clones current state before saving to undo', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);
      result.current.undo([makeNode('2')], []);

      const current = [makeNode('3', 'before-mutate')];
      result.current.redo(current, []);

      // Mutate after redo
      current[0].data.label = 'after-mutate';

      const undone = result.current.undo([], []);
      expect(undone!.nodes[0].data.label).toBe('before-mutate');
    });

    it('multiple redos walk forward through future', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 'state-1')], []);
      result.current.pushState([makeNode('2', 'state-2')], []);
      result.current.pushState([makeNode('3', 'state-3')], []);

      // Undo 3 times, passing returned state as "current" to simulate real usage
      const u1 = result.current.undo([makeNode('c', 'current')], []);  // returns state-3
      const u2 = result.current.undo(u1!.nodes, u1!.edges, );          // returns state-2
      const u3 = result.current.undo(u2!.nodes, u2!.edges);            // returns state-1

      // Redo walks forward — returns what was "current" at each undo
      const r1 = result.current.redo(u3!.nodes, u3!.edges);
      expect(r1!.nodes[0].data.label).toBe('state-2');

      const r2 = result.current.redo(r1!.nodes, r1!.edges);
      expect(r2!.nodes[0].data.label).toBe('state-3');

      expect(result.current.canRedo()).toBe(true);
    });

    it('returns null when no future exists', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1')], []);
      const entry = result.current.redo([], []);
      expect(entry).toBeNull();
    });
  });

  // ── undo/redo round-trip ──

  describe('undo/redo round-trip', () => {
    it('undo then redo returns to same state', () => {
      const { result } = renderHook(() => useUndoRedo());
      const original = [makeNode('1', 'original')];
      result.current.pushState(original, []);

      const current = [makeNode('2', 'current')];
      const undone = result.current.undo(current, []);
      expect(undone!.nodes[0].data.label).toBe('original');

      const redone = result.current.redo(undone!.nodes, undone!.edges);
      expect(redone!.nodes[0].data.label).toBe('current');
    });

    it('full undo then full redo cycle', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 's1')], []);
      result.current.pushState([makeNode('2', 's2')], []);

      // Undo all
      result.current.undo([makeNode('c', 'current')], []);
      result.current.undo([makeNode('x')], []);
      expect(result.current.canUndo()).toBe(false);

      // Redo all
      result.current.redo([makeNode('x')], []);
      result.current.redo([makeNode('x')], []);
      result.current.redo([makeNode('x')], []);
      // Third redo should be null (past end of future)
      expect(result.current.canRedo()).toBe(false);
    });
  });

  // ── edge cases ──

  describe('edge cases', () => {
    it('works with empty node and edge arrays', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([], []);
      expect(result.current.canUndo()).toBe(true);

      const entry = result.current.undo([], []);
      expect(entry!.nodes).toEqual([]);
      expect(entry!.edges).toEqual([]);
    });

    it('handles mixed nodes and edges', () => {
      const { result } = renderHook(() => useUndoRedo());
      const nodes = [makeNode('n1'), makeNode('n2')];
      const edges = [makeEdge('e1', 'n1', 'n2')];
      result.current.pushState(nodes, edges);

      const entry = result.current.undo([], []);
      expect(entry!.nodes).toHaveLength(2);
      expect(entry!.edges).toHaveLength(1);
      expect(entry!.edges[0].source).toBe('n1');
      expect(entry!.edges[0].target).toBe('n2');
    });

    it('push after undo discards future (branching)', () => {
      const { result } = renderHook(() => useUndoRedo());
      result.current.pushState([makeNode('1', 's1')], []);
      result.current.pushState([makeNode('2', 's2')], []);
      result.current.pushState([makeNode('3', 's3')], []);

      // Undo twice
      result.current.undo([makeNode('c')], []);
      result.current.undo([makeNode('c')], []);
      expect(result.current.canRedo()).toBe(true);

      // Push new branch
      result.current.pushState([makeNode('4', 'branch')], []);
      expect(result.current.canRedo()).toBe(false);

      // Undo returns the branch state
      const entry = result.current.undo([], []);
      expect(entry!.nodes[0].data.label).toBe('branch');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { serializeNodes, serializeEdges, generateNodeId } from '../architectureUtils';
import type { Node, Edge } from '@xyflow/react';

// ─── serializeNodes ───────────────────────────────────────────────────────────

describe('serializeNodes', () => {
  it('returns an empty array for an empty input', () => {
    expect(serializeNodes([])).toEqual([]);
  });

  it('maps id correctly', () => {
    const node = { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data: { label: 'API', componentType: 'service' } } as Node;
    expect(serializeNodes([node])[0].id).toBe('n1');
  });

  it('maps type when present', () => {
    const node = { id: 'n1', type: 'group', position: { x: 0, y: 0 }, data: { label: 'VPC', componentType: 'service' } } as Node;
    expect(serializeNodes([node])[0].type).toBe('group');
  });

  it('defaults type to "system" when node.type is undefined', () => {
    const node = { id: 'n1', type: undefined, position: { x: 10, y: 20 }, data: { label: 'X', componentType: 'service' } } as unknown as Node;
    expect(serializeNodes([node])[0].type).toBe('system');
  });

  it('maps position correctly', () => {
    const node = { id: 'n1', type: 'system', position: { x: 100, y: 200 }, data: { label: 'DB', componentType: 'database' } } as Node;
    expect(serializeNodes([node])[0].position).toEqual({ x: 100, y: 200 });
  });

  it('maps data through as-is', () => {
    const data = { label: 'Cache', componentType: 'cache' as const };
    const node = { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data } as Node;
    expect(serializeNodes([node])[0].data).toEqual(data);
  });

  it('omits style when node has no style', () => {
    const node = { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data: { label: 'X', componentType: 'service' } } as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect('style' in result).toBe(false);
  });

  it('includes style when node has style', () => {
    const node = { id: 'n1', type: 'group', position: { x: 0, y: 0 }, data: { label: 'VPC', componentType: 'service' }, style: { width: 300, height: 200 } } as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect(result.style).toEqual({ width: 300, height: 200 });
  });

  it('omits width when node.width is null', () => {
    const node = { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data: { label: 'X', componentType: 'service' }, width: null } as unknown as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect('width' in result).toBe(false);
  });

  it('omits width when node.width is undefined', () => {
    const node = { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data: { label: 'X', componentType: 'service' } } as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect('width' in result).toBe(false);
  });

  it('includes width when node.width is a number', () => {
    const node = { id: 'n1', type: 'group', position: { x: 0, y: 0 }, data: { label: 'G', componentType: 'service' }, width: 400 } as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect(result.width).toBe(400);
  });

  it('includes height when node.height is a number', () => {
    const node = { id: 'n1', type: 'group', position: { x: 0, y: 0 }, data: { label: 'G', componentType: 'service' }, height: 250 } as Node;
    const result = serializeNodes([node])[0] as Record<string, unknown>;
    expect(result.height).toBe(250);
  });

  it('serializes multiple nodes', () => {
    const nodes = [
      { id: 'n1', type: 'system', position: { x: 0, y: 0 }, data: { label: 'A', componentType: 'service' } },
      { id: 'n2', type: 'system', position: { x: 100, y: 100 }, data: { label: 'B', componentType: 'cache' } },
    ] as Node[];
    const result = serializeNodes(nodes);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('n1');
    expect(result[1].id).toBe('n2');
  });
});

// ─── serializeEdges ───────────────────────────────────────────────────────────

describe('serializeEdges', () => {
  it('returns an empty array for an empty input', () => {
    expect(serializeEdges([])).toEqual([]);
  });

  it('maps id, source, target correctly', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2' } as Edge;
    const result = serializeEdges([edge])[0];
    expect(result.id).toBe('e1');
    expect(result.source).toBe('n1');
    expect(result.target).toBe('n2');
  });

  it('maps sourceHandle when present', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', sourceHandle: 'right' } as Edge;
    expect(serializeEdges([edge])[0].sourceHandle).toBe('right');
  });

  it('converts null sourceHandle to undefined', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', sourceHandle: null } as unknown as Edge;
    expect(serializeEdges([edge])[0].sourceHandle).toBeUndefined();
  });

  it('converts null targetHandle to undefined', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', targetHandle: null } as unknown as Edge;
    expect(serializeEdges([edge])[0].targetHandle).toBeUndefined();
  });

  it('maps targetHandle when present', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', targetHandle: 'top' } as Edge;
    expect(serializeEdges([edge])[0].targetHandle).toBe('top');
  });

  it('maps string label', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', label: 'HTTP' } as Edge;
    expect(serializeEdges([edge])[0].label).toBe('HTTP');
  });

  it('converts non-string label to undefined', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', label: 42 } as unknown as Edge;
    expect(serializeEdges([edge])[0].label).toBeUndefined();
  });

  it('converts undefined label to undefined', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2' } as Edge;
    expect(serializeEdges([edge])[0].label).toBeUndefined();
  });

  it('maps animated when true', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', animated: true } as Edge;
    expect(serializeEdges([edge])[0].animated).toBe(true);
  });

  it('maps animated when false', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', animated: false } as Edge;
    expect(serializeEdges([edge])[0].animated).toBe(false);
  });

  it('maps type when present', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2', type: 'labeled' } as Edge;
    expect(serializeEdges([edge])[0].type).toBe('labeled');
  });

  it('maps edge data through as-is', () => {
    const data = { edgeStyle: 'dashed' as const };
    const edge = { id: 'e1', source: 'n1', target: 'n2', data } as Edge;
    expect(serializeEdges([edge])[0].data).toEqual(data);
  });

  it('maps edge data as undefined when absent', () => {
    const edge = { id: 'e1', source: 'n1', target: 'n2' } as Edge;
    expect(serializeEdges([edge])[0].data).toBeUndefined();
  });

  it('serializes multiple edges', () => {
    const edges = [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ] as Edge[];
    const result = serializeEdges(edges);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('e1');
    expect(result[1].id).toBe('e2');
  });
});

// ─── generateNodeId ───────────────────────────────────────────────────────────

describe('generateNodeId', () => {
  it('returns a string', () => {
    expect(typeof generateNodeId()).toBe('string');
  });

  it('starts with "node-"', () => {
    expect(generateNodeId()).toMatch(/^node-/);
  });

  it('returns unique ids on successive calls', () => {
    const a = generateNodeId();
    const b = generateNodeId();
    expect(a).not.toBe(b);
  });

  it('contains a timestamp segment and a counter (3 parts)', () => {
    const id = generateNodeId();
    const parts = id.split('-');
    // format: node-<timestamp>-<counter>
    expect(parts.length).toBe(3);
    expect(Number(parts[1])).toBeGreaterThan(0);
    expect(Number(parts[2])).toBeGreaterThan(0);
  });
});

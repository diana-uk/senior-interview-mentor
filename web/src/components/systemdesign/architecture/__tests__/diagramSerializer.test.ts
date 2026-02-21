import { describe, it, expect } from 'vitest';
import { serializeDiagramToText } from '../diagramSerializer';
import type { SystemDesignState } from '../../../../types';

type DiagramNode = SystemDesignState['diagramNodes'][number];
type DiagramEdge = SystemDesignState['diagramEdges'][number];

// ── Helpers ──

function makeNode(
  id: string,
  label: string,
  componentType: DiagramNode['data']['componentType'],
  overrides?: Partial<DiagramNode>,
): DiagramNode {
  return {
    id,
    type: 'system',
    position: { x: 0, y: 0 },
    data: { label, componentType },
    ...overrides,
  };
}

function makeZone(
  id: string,
  label: string,
  zoneStyle?: 'vpc' | 'az' | 'cluster',
): DiagramNode {
  return {
    id,
    type: 'group',
    position: { x: 0, y: 0 },
    data: { label, componentType: 'service', zoneStyle },
  };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  overrides?: Partial<DiagramEdge>,
): DiagramEdge {
  return { id, source, target, ...overrides };
}

// ── Tests ──

describe('serializeDiagramToText', () => {
  // ── Empty diagram ──

  it('returns placeholder for empty node array', () => {
    expect(serializeDiagramToText([], [])).toBe('No components placed yet.');
  });

  it('returns placeholder for empty nodes even with edges', () => {
    const edges = [makeEdge('e1', 'a', 'b')];
    expect(serializeDiagramToText([], edges)).toBe('No components placed yet.');
  });

  // ── Single node, no edges ──

  it('serializes a single node with no edges', () => {
    const nodes = [makeNode('n1', 'My API', 'api-gateway')];
    const result = serializeDiagramToText(nodes, []);
    expect(result).toContain('Architecture Components:');
    expect(result).toContain('- [API Gateway] "My API"');
    expect(result).not.toContain('Connections:');
  });

  // ── Multiple nodes, no edges ──

  it('serializes multiple nodes without edges', () => {
    const nodes = [
      makeNode('n1', 'Web Client', 'client'),
      makeNode('n2', 'Redis', 'cache'),
      makeNode('n3', 'PostgreSQL', 'database'),
    ];
    const result = serializeDiagramToText(nodes, []);
    expect(result).toContain('- [Client] "Web Client"');
    expect(result).toContain('- [Cache] "Redis"');
    expect(result).toContain('- [Database] "PostgreSQL"');
    expect(result).not.toContain('Connections:');
  });

  // ── All component type labels ──

  it('maps all component types to correct labels', () => {
    const typeMap: Record<DiagramNode['data']['componentType'], string> = {
      'client': 'Client',
      'load-balancer': 'Load Balancer',
      'api-gateway': 'API Gateway',
      'service': 'Service',
      'cache': 'Cache',
      'database': 'Database',
      'queue': 'Message Queue',
      'cdn': 'CDN',
      'worker': 'Worker',
      'storage': 'Object Storage',
      'dns': 'DNS',
      'firewall': 'Firewall',
      'container': 'Container',
      'stream': 'Event Stream',
      'third-party': 'Third-Party Service',
      'users': 'Users/Mobile',
    };

    for (const [type, label] of Object.entries(typeMap)) {
      const nodes = [makeNode('n', 'X', type as DiagramNode['data']['componentType'])];
      const result = serializeDiagramToText(nodes, []);
      expect(result).toContain(`[${label}]`);
    }
  });

  // ── Outgoing edges (solid) ──

  it('shows outgoing solid edge with arrow', () => {
    const nodes = [
      makeNode('n1', 'Client', 'client'),
      makeNode('n2', 'Server', 'service'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2')];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('→ "Server"');
  });

  // ── Incoming edges ──

  it('shows incoming edge source', () => {
    const nodes = [
      makeNode('n1', 'Client', 'client'),
      makeNode('n2', 'Server', 'service'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2')];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('← receives from: "Client"');
  });

  // ── Both incoming and outgoing ──

  it('shows both incoming and outgoing on one node', () => {
    const nodes = [
      makeNode('n1', 'Client', 'client'),
      makeNode('n2', 'API', 'api-gateway'),
      makeNode('n3', 'DB', 'database'),
    ];
    const edges = [
      makeEdge('e1', 'n1', 'n2'),
      makeEdge('e2', 'n2', 'n3'),
    ];
    const result = serializeDiagramToText(nodes, edges);
    // API has outgoing to DB and incoming from Client
    expect(result).toMatch(/\[API Gateway\] "API" → "DB" ← receives from: "Client"/);
  });

  // ── Edge styles ──

  it('uses dashed arrow and (async) label for dashed edges', () => {
    const nodes = [
      makeNode('n1', 'Service', 'service'),
      makeNode('n2', 'Queue', 'queue'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { data: { edgeStyle: 'dashed' } })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('⇢ "Queue"');
    expect(result).toContain('(async)');
  });

  it('uses dotted arrow and (optional) label for dotted edges', () => {
    const nodes = [
      makeNode('n1', 'Service', 'service'),
      makeNode('n2', 'Cache', 'cache'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { data: { edgeStyle: 'dotted' } })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('···> "Cache"');
    expect(result).toContain('(optional)');
  });

  it('solid edges have no style label suffix', () => {
    const nodes = [
      makeNode('n1', 'A', 'service'),
      makeNode('n2', 'B', 'service'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { data: { edgeStyle: 'solid' } })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).not.toContain('(async)');
    expect(result).not.toContain('(optional)');
  });

  // ── Edge labels ──

  it('includes edge label in brackets', () => {
    const nodes = [
      makeNode('n1', 'Client', 'client'),
      makeNode('n2', 'API', 'api-gateway'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { label: 'HTTPS' })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('[HTTPS]');
  });

  it('omits label brackets when edge has no label', () => {
    const nodes = [
      makeNode('n1', 'A', 'service'),
      makeNode('n2', 'B', 'service'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2')];
    const result = serializeDiagramToText(nodes, edges);
    // Should not contain empty brackets
    expect(result).not.toMatch(/\[\]/);
  });

  // ── Zones ──

  it('lists zones first with style in uppercase', () => {
    const zones = [makeZone('z1', 'Production VPC', 'vpc')];
    const nodes = [makeNode('n1', 'Server', 'service')];
    const result = serializeDiagramToText([...zones, ...nodes], []);
    const lines = result.split('\n');
    // Zone should appear before regular node
    const zoneIndex = lines.findIndex(l => l.includes('[Zone: VPC]'));
    const nodeIndex = lines.findIndex(l => l.includes('[Service]'));
    expect(zoneIndex).toBeGreaterThan(-1);
    expect(nodeIndex).toBeGreaterThan(zoneIndex);
    expect(result).toContain('- [Zone: VPC] "Production VPC"');
  });

  it('defaults zone style to VPC when zoneStyle is undefined', () => {
    const zones = [makeZone('z1', 'My Zone')];
    const result = serializeDiagramToText(zones, []);
    expect(result).toContain('[Zone: VPC]');
  });

  it('handles az zone style', () => {
    const zones = [makeZone('z1', 'US-East-1a', 'az')];
    const result = serializeDiagramToText(zones, []);
    expect(result).toContain('[Zone: AZ]');
  });

  it('handles cluster zone style', () => {
    const zones = [makeZone('z1', 'K8s Cluster', 'cluster')];
    const result = serializeDiagramToText(zones, []);
    expect(result).toContain('[Zone: CLUSTER]');
  });

  // ── Mixed zones and regular nodes ──

  it('separates zones from regular nodes with blank line', () => {
    const allNodes: DiagramNode[] = [
      makeZone('z1', 'VPC', 'vpc'),
      makeNode('n1', 'Server', 'service'),
    ];
    const result = serializeDiagramToText(allNodes, []);
    const lines = result.split('\n');
    // After zone line, there should be an empty line before regular nodes
    const zoneLineIdx = lines.findIndex(l => l.includes('[Zone:'));
    expect(lines[zoneLineIdx + 1]).toBe('');
  });

  // ── Unknown node references ──

  it('falls back to raw ID for unknown edge target', () => {
    const nodes = [makeNode('n1', 'Client', 'client')];
    const edges = [makeEdge('e1', 'n1', 'unknown-node-99')];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('→ unknown-node-99');
  });

  it('falls back to raw ID for unknown edge source in incoming', () => {
    const nodes = [makeNode('n1', 'Server', 'service')];
    const edges = [makeEdge('e1', 'ghost-42', 'n1')];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('← receives from: ghost-42');
  });

  it('falls back to raw IDs in Connections section', () => {
    const nodes = [makeNode('n1', 'Server', 'service')];
    const edges = [makeEdge('e1', 'missing-src', 'n1')];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('- missing-src → Server');
  });

  // ── Multiple outgoing edges ──

  it('joins multiple outgoing edges with commas', () => {
    const nodes = [
      makeNode('n1', 'Gateway', 'api-gateway'),
      makeNode('n2', 'Service A', 'service'),
      makeNode('n3', 'Service B', 'service'),
    ];
    const edges = [
      makeEdge('e1', 'n1', 'n2'),
      makeEdge('e2', 'n1', 'n3'),
    ];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('→ "Service A", → "Service B"');
  });

  // ── Multiple incoming edges ──

  it('joins multiple incoming edge sources with commas', () => {
    const nodes = [
      makeNode('n1', 'Service A', 'service'),
      makeNode('n2', 'Service B', 'service'),
      makeNode('n3', 'Database', 'database'),
    ];
    const edges = [
      makeEdge('e1', 'n1', 'n3'),
      makeEdge('e2', 'n2', 'n3'),
    ];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('← receives from: "Service A", "Service B"');
  });

  // ── Connections section ──

  it('renders Connections section with all edges', () => {
    const nodes = [
      makeNode('n1', 'Client', 'client'),
      makeNode('n2', 'API', 'api-gateway'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { label: 'REST' })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('Connections:');
    expect(result).toContain('- Client → API [REST]');
  });

  it('Connections section shows edge style labels', () => {
    const nodes = [
      makeNode('n1', 'Svc', 'service'),
      makeNode('n2', 'Queue', 'queue'),
    ];
    const edges = [makeEdge('e1', 'n1', 'n2', { label: 'events', data: { edgeStyle: 'dashed' } })];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('- Svc ⇢ Queue [events] (async)');
  });

  // ── Edge with no data at all ──

  it('defaults to solid arrow when edge has no data property', () => {
    const nodes = [
      makeNode('n1', 'A', 'service'),
      makeNode('n2', 'B', 'service'),
    ];
    const edges: DiagramEdge[] = [{ id: 'e1', source: 'n1', target: 'n2' }];
    const result = serializeDiagramToText(nodes, edges);
    expect(result).toContain('→ "B"');
    expect(result).not.toContain('(async)');
    expect(result).not.toContain('(optional)');
  });

  // ── Full integration ──

  it('produces correct output for a realistic diagram', () => {
    const nodes: DiagramNode[] = [
      makeZone('z1', 'AWS VPC', 'vpc'),
      makeNode('n1', 'Browser', 'client'),
      makeNode('n2', 'Load Balancer', 'load-balancer'),
      makeNode('n3', 'Auth Service', 'service'),
      makeNode('n4', 'Redis', 'cache'),
    ];
    const edges: DiagramEdge[] = [
      makeEdge('e1', 'n1', 'n2', { label: 'HTTPS' }),
      makeEdge('e2', 'n2', 'n3'),
      makeEdge('e3', 'n3', 'n4', { data: { edgeStyle: 'dashed' }, label: 'session' }),
    ];
    const result = serializeDiagramToText(nodes, edges);

    // Zone listed first
    expect(result).toContain('[Zone: VPC] "AWS VPC"');
    // Components section
    expect(result).toContain('[Client] "Browser"');
    expect(result).toContain('[Load Balancer] "Load Balancer"');
    expect(result).toContain('[Service] "Auth Service"');
    expect(result).toContain('[Cache] "Redis"');
    // Connections section
    expect(result).toContain('Connections:');
    expect(result).toContain('Browser → Load Balancer [HTTPS]');
    expect(result).toContain('Load Balancer → Auth Service');
    expect(result).toContain('Auth Service ⇢ Redis [session] (async)');
  });
});

import type { SystemDesignState, SystemComponentType } from '../../../types';

type DiagramNode = SystemDesignState['diagramNodes'][number];
type DiagramEdge = SystemDesignState['diagramEdges'][number];

const TYPE_LABELS: Record<SystemComponentType, string> = {
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

const STYLE_ARROWS: Record<string, { left: string; right: string }> = {
  solid:  { left: '→', right: '→' },
  dashed: { left: '⇢', right: '⇢' },
  dotted: { left: '···>', right: '···>' },
};

export function getEdgeArrow(edge: DiagramEdge): string {
  const style = edge.data?.edgeStyle ?? 'solid';
  return STYLE_ARROWS[style]?.right ?? '→';
}

export function getEdgeStyleLabel(edge: DiagramEdge): string {
  const style = edge.data?.edgeStyle;
  if (!style || style === 'solid') return '';
  if (style === 'dashed') return ' (async)';
  if (style === 'dotted') return ' (optional)';
  return '';
}

export function serializeDiagramToText(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  if (nodes.length === 0) return 'No components placed yet.';

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Separate zones from regular nodes
  const zones = nodes.filter(n => n.type === 'group');
  const regularNodes = nodes.filter(n => n.type !== 'group');

  const lines: string[] = ['Architecture Components:'];

  // List zones first
  if (zones.length > 0) {
    for (const zone of zones) {
      const zoneStyle = zone.data.zoneStyle ?? 'vpc';
      lines.push(`- [Zone: ${zoneStyle.toUpperCase()}] "${zone.data.label}"`);
    }
    lines.push('');
  }

  for (const node of regularNodes) {
    const typeLabel = TYPE_LABELS[node.data.componentType] ?? node.data.componentType;
    const outgoing = edges
      .filter((e) => e.source === node.id)
      .map((e) => {
        const target = nodeMap.get(e.target);
        const targetName = target ? `"${target.data.label}"` : e.target;
        const arrow = getEdgeArrow(e);
        const styleLabel = getEdgeStyleLabel(e);
        const edgeLabel = e.label ? ` [${e.label}]` : '';
        return `${arrow} ${targetName}${edgeLabel}${styleLabel}`;
      });
    const incoming = edges
      .filter((e) => e.target === node.id)
      .map((e) => {
        const source = nodeMap.get(e.source);
        return source ? `"${source.data.label}"` : e.source;
      });

    let line = `- [${typeLabel}] "${node.data.label}"`;
    if (outgoing.length > 0) line += ` ${outgoing.join(', ')}`;
    if (incoming.length > 0) line += ` ← receives from: ${incoming.join(', ')}`;
    lines.push(line);
  }

  if (edges.length > 0) {
    lines.push('');
    lines.push('Connections:');
    for (const edge of edges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      const srcName = src ? src.data.label : edge.source;
      const tgtName = tgt ? tgt.data.label : edge.target;
      const label = edge.label ? ` [${edge.label}]` : '';
      const arrow = getEdgeArrow(edge);
      const styleLabel = getEdgeStyleLabel(edge);
      lines.push(`- ${srcName} ${arrow} ${tgtName}${label}${styleLabel}`);
    }
  }

  return lines.join('\n');
}

export async function exportDiagramAsPng(element: HTMLElement): Promise<Blob> {
  // Find the React Flow viewport SVG/canvas area
  const viewport = element.querySelector('.react-flow__viewport') as HTMLElement | null;
  const target = viewport ?? element;

  // Use the browser's built-in canvas rendering
  const { width, height } = target.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const scale = 2; // retina
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Serialize to SVG foreignObject for rendering
  const svgData = new XMLSerializer().serializeToString(target);
  const svgBlob = new Blob(
    [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${svgData}</div>
      </foreignObject>
    </svg>`],
    { type: 'image/svg+xml;charset=utf-8' },
  );
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG blob'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render diagram'));
    };
    img.src = url;
  });
}

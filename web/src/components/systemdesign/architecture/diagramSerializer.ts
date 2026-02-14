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
};

export function serializeDiagramToText(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  if (nodes.length === 0) return 'No components placed yet.';

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const lines: string[] = ['Architecture Components:'];

  for (const node of nodes) {
    const typeLabel = TYPE_LABELS[node.data.componentType] ?? node.data.componentType;
    const outgoing = edges
      .filter((e) => e.source === node.id)
      .map((e) => {
        const target = nodeMap.get(e.target);
        const targetName = target ? `"${target.data.label}"` : e.target;
        return e.label ? `${targetName} (${e.label})` : targetName;
      });
    const incoming = edges
      .filter((e) => e.target === node.id)
      .map((e) => {
        const source = nodeMap.get(e.source);
        return source ? `"${source.data.label}"` : e.source;
      });

    let line = `- [${typeLabel}] "${node.data.label}"`;
    if (outgoing.length > 0) line += ` → connects to: ${outgoing.join(', ')}`;
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
      lines.push(`- ${srcName} → ${tgtName}${label}`);
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

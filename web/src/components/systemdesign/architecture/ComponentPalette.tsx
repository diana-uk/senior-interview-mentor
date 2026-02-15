import type { SystemComponentType } from '../../../types';

interface PaletteItem {
  type: SystemComponentType;
  label: string;
  icon: string;
}

interface ZoneItem {
  kind: 'zone';
  zoneStyle: 'vpc' | 'az' | 'cluster';
  label: string;
  icon: string;
}

type DragItem = PaletteItem | ZoneItem;

const GROUPS: { title: string; items: DragItem[] }[] = [
  {
    title: 'Networking',
    items: [
      { type: 'client',        label: 'Client',        icon: 'devices' },
      { type: 'load-balancer',  label: 'Load Balancer', icon: 'swap_horiz' },
      { type: 'api-gateway',    label: 'API Gateway',   icon: 'api' },
      { type: 'cdn',            label: 'CDN',           icon: 'public' },
      { type: 'dns',            label: 'DNS',           icon: 'language' },
      { type: 'firewall',       label: 'Firewall',      icon: 'shield' },
    ] as PaletteItem[],
  },
  {
    title: 'Compute',
    items: [
      { type: 'service',   label: 'Service',   icon: 'dns' },
      { type: 'worker',    label: 'Worker',     icon: 'engineering' },
      { type: 'container', label: 'Container',  icon: 'deployed_code' },
    ] as PaletteItem[],
  },
  {
    title: 'Data',
    items: [
      { type: 'database', label: 'Database', icon: 'database' },
      { type: 'cache',    label: 'Cache',    icon: 'bolt' },
      { type: 'queue',    label: 'Queue',    icon: 'queue' },
      { type: 'storage',  label: 'Storage',  icon: 'cloud' },
      { type: 'stream',   label: 'Stream',   icon: 'stream' },
    ] as PaletteItem[],
  },
  {
    title: 'External',
    items: [
      { type: 'third-party', label: 'Third Party', icon: 'cloud_sync' },
      { type: 'users',       label: 'Users/Mobile', icon: 'smartphone' },
    ] as PaletteItem[],
  },
  {
    title: 'Zones',
    items: [
      { kind: 'zone', zoneStyle: 'vpc',     label: 'VPC Zone',     icon: 'security' },
      { kind: 'zone', zoneStyle: 'az',      label: 'Avail. Zone',  icon: 'dns' },
      { kind: 'zone', zoneStyle: 'cluster', label: 'Cluster',      icon: 'hub' },
    ] as ZoneItem[],
  },
];

function isZone(item: DragItem): item is ZoneItem {
  return 'kind' in item && item.kind === 'zone';
}

export default function ComponentPalette() {
  function handleDragStart(e: React.DragEvent, item: DragItem) {
    if (isZone(item)) {
      e.dataTransfer.setData('application/reactflow-type', 'group');
      e.dataTransfer.setData('application/reactflow-label', item.label);
      e.dataTransfer.setData('application/reactflow-zone', item.zoneStyle);
    } else {
      e.dataTransfer.setData('application/reactflow-type', item.type);
      e.dataTransfer.setData('application/reactflow-label', item.label);
    }
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="arch-palette">
      <div className="arch-palette__header">Components</div>
      {GROUPS.map((group) => (
        <div key={group.title} className="arch-palette__group">
          <span className="arch-palette__group-label">{group.title}</span>
          {group.items.map((item) => {
            const key = isZone(item) ? item.zoneStyle : item.type;
            return (
              <div
                key={key}
                className={`arch-palette__item ${isZone(item) ? 'arch-palette__item--zone' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <span className="material-symbols-outlined arch-palette__icon">{item.icon}</span>
                <span className="arch-palette__name">{item.label}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

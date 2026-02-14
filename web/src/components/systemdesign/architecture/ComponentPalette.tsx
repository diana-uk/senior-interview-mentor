import type { SystemComponentType } from '../../../types';

interface PaletteItem {
  type: SystemComponentType;
  label: string;
  icon: string;
}

const GROUPS: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'Networking',
    items: [
      { type: 'client',        label: 'Client',      icon: 'devices' },
      { type: 'load-balancer',  label: 'Load Balancer', icon: 'swap_horiz' },
      { type: 'api-gateway',    label: 'API Gateway', icon: 'api' },
      { type: 'cdn',            label: 'CDN',         icon: 'public' },
    ],
  },
  {
    title: 'Compute',
    items: [
      { type: 'service', label: 'Service', icon: 'dns' },
      { type: 'worker',  label: 'Worker',  icon: 'engineering' },
    ],
  },
  {
    title: 'Data',
    items: [
      { type: 'database', label: 'Database', icon: 'database' },
      { type: 'cache',    label: 'Cache',    icon: 'bolt' },
      { type: 'queue',    label: 'Queue',    icon: 'queue' },
      { type: 'storage',  label: 'Storage',  icon: 'cloud' },
    ],
  },
];

export default function ComponentPalette() {
  function handleDragStart(e: React.DragEvent, item: PaletteItem) {
    e.dataTransfer.setData('application/reactflow-type', item.type);
    e.dataTransfer.setData('application/reactflow-label', item.label);
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div className="arch-palette">
      <div className="arch-palette__header">Components</div>
      {GROUPS.map((group) => (
        <div key={group.title} className="arch-palette__group">
          <span className="arch-palette__group-label">{group.title}</span>
          {group.items.map((item) => (
            <div
              key={item.type}
              className="arch-palette__item"
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <span className="material-symbols-outlined arch-palette__icon">{item.icon}</span>
              <span className="arch-palette__name">{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

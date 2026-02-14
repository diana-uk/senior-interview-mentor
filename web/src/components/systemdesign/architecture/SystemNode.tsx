import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData, SystemComponentType } from '../../../types';

const COMPONENT_META: Record<SystemComponentType, { icon: string; color: string }> = {
  'client':        { icon: 'devices',     color: 'var(--text-secondary)' },
  'load-balancer': { icon: 'swap_horiz',  color: 'var(--neon-cyan)' },
  'api-gateway':   { icon: 'api',         color: 'var(--neon-lime)' },
  'service':       { icon: 'dns',         color: 'var(--neon-purple)' },
  'cache':         { icon: 'bolt',        color: 'var(--neon-amber)' },
  'database':      { icon: 'database',    color: 'var(--neon-cyan)' },
  'queue':         { icon: 'queue',       color: '#f472b6' },
  'cdn':           { icon: 'public',      color: '#facc15' },
  'worker':        { icon: 'engineering', color: 'var(--neon-lime)' },
  'storage':       { icon: 'cloud',       color: 'var(--text-secondary)' },
};

function SystemNode({ data, id }: NodeProps & { data: DiagramNodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const meta = COMPONENT_META[data.componentType] ?? COMPONENT_META['service'];

  function handleDoubleClick() {
    setEditing(true);
  }

  function handleBlur() {
    setEditing(false);
    data.label = label;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      setEditing(false);
      data.label = label;
    }
  }

  return (
    <div
      className="system-node"
      style={{ borderLeftColor: meta.color }}
      onDoubleClick={handleDoubleClick}
      data-node-id={id}
    >
      <Handle type="target" position={Position.Top} className="system-node__handle" />
      <div className="system-node__body">
        <span
          className="material-symbols-outlined system-node__icon"
          style={{ color: meta.color }}
        >
          {meta.icon}
        </span>
        {editing ? (
          <input
            className="system-node__input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="system-node__label">{label}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="system-node__handle" />
    </div>
  );
}

export default memo(SystemNode);
export { COMPONENT_META };

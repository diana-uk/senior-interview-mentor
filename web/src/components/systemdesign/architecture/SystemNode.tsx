import { memo, useState } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData, SystemComponentType } from '../../../types';

const COMPONENT_META: Record<SystemComponentType, { icon: string; color: string }> = {
  'client':        { icon: 'devices',      color: 'var(--text-secondary)' },
  'load-balancer': { icon: 'swap_horiz',   color: 'var(--neon-cyan)' },
  'api-gateway':   { icon: 'api',          color: 'var(--neon-lime)' },
  'service':       { icon: 'dns',          color: 'var(--neon-purple)' },
  'cache':         { icon: 'bolt',         color: 'var(--neon-amber)' },
  'database':      { icon: 'database',     color: 'var(--neon-cyan)' },
  'queue':         { icon: 'queue',        color: '#f472b6' },
  'cdn':           { icon: 'public',       color: '#facc15' },
  'worker':        { icon: 'engineering',  color: 'var(--neon-lime)' },
  'storage':       { icon: 'cloud',        color: 'var(--text-secondary)' },
  'dns':           { icon: 'language',     color: 'var(--text-secondary)' },
  'firewall':      { icon: 'shield',       color: '#ef4444' },
  'container':     { icon: 'deployed_code', color: 'var(--neon-lime)' },
  'stream':        { icon: 'stream',       color: '#f472b6' },
  'third-party':   { icon: 'cloud_sync',   color: '#fb923c' },
  'users':         { icon: 'smartphone',   color: 'var(--text-secondary)' },
};

function SystemNode({ data, id }: NodeProps & { data: DiagramNodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const meta = COMPONENT_META[data.componentType] ?? COMPONENT_META['service'];

  function handleDoubleClick() {
    setEditing(true);
  }

  const { setNodes } = useReactFlow();

  function commitLabel() {
    setEditing(false);
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  }

  function handleBlur() {
    commitLabel();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      commitLabel();
    }
  }

  return (
    <div
      className="system-node"
      style={{ borderLeftColor: meta.color }}
      onDoubleClick={handleDoubleClick}
      data-node-id={id}
    >
      {/* Top — source + target overlapping */}
      <Handle type="target" position={Position.Top} id="top-tgt" className="system-node__handle system-node__handle--target" />
      <Handle type="source" position={Position.Top} id="top-src" className="system-node__handle" />

      {/* Right — source + target overlapping */}
      <Handle type="target" position={Position.Right} id="right-tgt" className="system-node__handle system-node__handle--right system-node__handle--target" />
      <Handle type="source" position={Position.Right} id="right-src" className="system-node__handle system-node__handle--right" />

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

      {/* Bottom — source + target overlapping */}
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="system-node__handle system-node__handle--target" />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className="system-node__handle" />

      {/* Left — source + target overlapping */}
      <Handle type="target" position={Position.Left} id="left-tgt" className="system-node__handle system-node__handle--left system-node__handle--target" />
      <Handle type="source" position={Position.Left} id="left-src" className="system-node__handle system-node__handle--left" />
    </div>
  );
}

export default memo(SystemNode);
export { COMPONENT_META };

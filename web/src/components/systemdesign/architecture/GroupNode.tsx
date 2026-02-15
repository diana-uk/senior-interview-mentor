import { memo, useState } from 'react';
import { NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react';
import type { DiagramNodeData } from '../../../types';

const ZONE_COLORS: Record<string, { border: string; bg: string }> = {
  vpc:     { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.06)' },
  az:      { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.06)' },
  cluster: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.06)' },
};

function GroupNode({ data, id, selected }: NodeProps & { data: DiagramNodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const { setNodes } = useReactFlow();

  const zone = data.zoneStyle ?? 'vpc';
  const colors = ZONE_COLORS[zone] ?? ZONE_COLORS.vpc;

  function commitLabel() {
    setEditing(false);
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label } } : n));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitLabel();
  }

  return (
    <div
      className="group-node"
      style={{
        borderColor: colors.border,
        background: colors.bg,
      }}
    >
      <NodeResizer
        color={colors.border}
        isVisible={selected}
        minWidth={200}
        minHeight={150}
      />
      <div className="group-node__header" onDoubleClick={() => setEditing(true)}>
        <span
          className="group-node__badge"
          style={{ background: colors.border }}
        >
          {zone.toUpperCase()}
        </span>
        {editing ? (
          <input
            className="group-node__input"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="group-node__label">{label}</span>
        )}
      </div>
    </div>
  );
}

export default memo(GroupNode);

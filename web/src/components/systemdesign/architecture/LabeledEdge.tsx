import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';

export interface LabeledEdgeData {
  edgeStyle?: 'solid' | 'dashed' | 'dotted';
  [key: string]: unknown;
}

const STYLE_MAP: Record<string, string> = {
  solid: '0',
  dashed: '8 4',
  dotted: '2 3',
};

const EDGE_STYLES: ('solid' | 'dashed' | 'dotted')[] = ['solid', 'dashed', 'dotted'];

export default function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps<Edge<LabeledEdgeData>>) {
  const [labelValue, setLabelValue] = useState(typeof label === 'string' ? label : '');
  const labelInputRef = useRef<HTMLInputElement>(null);
  const { setEdges } = useReactFlow();

  // Sync external label changes
  useEffect(() => {
    setLabelValue(typeof label === 'string' ? label : '');
  }, [label]);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeStyle = data?.edgeStyle ?? 'solid';
  const dashArray = STYLE_MAP[edgeStyle] ?? '0';

  const commitLabel = useCallback((value: string) => {
    setEdges(eds =>
      eds.map(e =>
        e.id === id ? { ...e, label: value || undefined } : e,
      ),
    );
  }, [id, setEdges]);

  const changeStyle = useCallback((newStyle: 'solid' | 'dashed' | 'dotted') => {
    setEdges(eds =>
      eds.map(e =>
        e.id === id ? { ...e, data: { ...e.data, edgeStyle: newStyle } } : e,
      ),
    );
  }, [id, setEdges]);

  const deleteEdge = useCallback(() => {
    setEdges(eds => eds.filter(e => e.id !== id));
  }, [id, setEdges]);

  function handleLabelKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setLabelValue(typeof label === 'string' ? label : '');
      (e.target as HTMLInputElement).blur();
    }
  }

  // Expose a way for keyboard shortcut 'L' to focus the label input
  useEffect(() => {
    if (!selected) return;
    function handleFocusLabel(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.edgeId === id && labelInputRef.current) {
        labelInputRef.current.focus();
        labelInputRef.current.select();
      }
    }
    window.addEventListener('edge-focus-label', handleFocusLabel);
    return () => window.removeEventListener('edge-focus-label', handleFocusLabel);
  }, [selected, id]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: dashArray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-label-container"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          {selected ? (
            <div className="edge-inline-toolbar" onClick={e => e.stopPropagation()}>
              {EDGE_STYLES.map(s => (
                <button
                  key={s}
                  className={`edge-inline-toolbar__btn ${edgeStyle === s ? 'edge-inline-toolbar__btn--active' : ''}`}
                  onClick={() => changeStyle(s)}
                  title={s.charAt(0).toUpperCase() + s.slice(1)}
                >
                  <span className={`style-line style-line--${s}`} />
                </button>
              ))}
              <input
                ref={labelInputRef}
                className="edge-inline-toolbar__label"
                value={labelValue}
                onChange={e => setLabelValue(e.target.value)}
                onBlur={() => commitLabel(labelValue)}
                onKeyDown={handleLabelKeyDown}
                placeholder="Label..."
              />
              <button
                className="edge-inline-toolbar__btn edge-inline-toolbar__btn--delete"
                onClick={deleteEdge}
                title="Delete edge"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
              </button>
            </div>
          ) : labelValue ? (
            <button
              className="edge-label__pill"
              title="Click edge to edit"
            >
              {labelValue}
            </button>
          ) : (
            <button
              className="edge-label__add"
              title="Click edge to edit"
            >
              +
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

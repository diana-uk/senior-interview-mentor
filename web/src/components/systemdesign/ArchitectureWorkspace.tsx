import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowRight, Download, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { ChatMessage, SystemDesignPhase, PhaseStatus, SystemDesignState, DiagramNodeData } from '../../types';
import PhaseProgressSidebar from './PhaseProgressSidebar';
import MentorPanel from './MentorPanel';
import ComponentPalette from './architecture/ComponentPalette';
import SystemNode from './architecture/SystemNode';
import GroupNode from './architecture/GroupNode';
import LabeledEdge from './architecture/LabeledEdge';
import CanvasToolbar, { autoLayout } from './architecture/CanvasToolbar';
import type { EdgeStyleType } from './architecture/CanvasToolbar';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { serializeDiagramToText, exportDiagramAsPng } from './architecture/diagramSerializer';

interface ArchitectureWorkspaceProps {
  diagramNodes: SystemDesignState['diagramNodes'];
  diagramEdges: SystemDesignState['diagramEdges'];
  onUpdateDiagram: (nodes: SystemDesignState['diagramNodes'], edges: SystemDesignState['diagramEdges']) => void;
  onAdvancePhase: () => void;
  currentPhase: SystemDesignPhase;
  phaseStatuses: Record<SystemDesignPhase, PhaseStatus>;
  phaseOrder: SystemDesignPhase[];
  onPhaseClick: (phase: SystemDesignPhase) => void;
  timerSeconds: number;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
}

const nodeTypes = { system: SystemNode, group: GroupNode };
const edgeTypes = { labeled: LabeledEdge };

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${Date.now()}-${++nodeIdCounter}`;
}

function serializeNodes(nds: Node[]): SystemDesignState['diagramNodes'] {
  return nds.map(n => ({
    id: n.id,
    type: n.type ?? 'system',
    position: n.position,
    data: n.data as DiagramNodeData,
    ...(n.style ? { style: n.style } : {}),
    ...(n.width != null ? { width: n.width } : {}),
    ...(n.height != null ? { height: n.height } : {}),
  }));
}

function serializeEdges(eds: Edge[]): SystemDesignState['diagramEdges'] {
  return eds.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    label: typeof e.label === 'string' ? e.label : undefined,
    animated: e.animated,
    type: e.type,
    data: e.data as { edgeStyle?: 'solid' | 'dashed' | 'dotted' } | undefined,
  }));
}

function ArchitectureWorkspaceInner({
  diagramNodes,
  diagramEdges,
  onUpdateDiagram,
  onAdvancePhase,
  currentPhase,
  phaseStatuses,
  phaseOrder,
  onPhaseClick,
  timerSeconds,
  messages,
  onSendMessage,
  isStreaming,
  onStopStreaming,
}: ArchitectureWorkspaceProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [defaultEdgeType, setDefaultEdgeType] = useState<EdgeStyleType>('solid');

  const reactFlowRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { pushState, undo, redo, canUndo, canRedo } = useUndoRedo();

  // Local React Flow state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Sync parent → local nodes
  const syncedNodes = useMemo(() => {
    return (prev: Node[]) => {
      const prevMap = new Map(prev.map(n => [n.id, n]));
      return diagramNodes.map(n => {
        const existing = prevMap.get(n.id);
        return {
          ...n,
          type: (n.type === 'group' ? 'group' : 'system') as string,
          ...(existing?.measured ? { measured: existing.measured } : {}),
          ...(existing?.width != null ? { width: existing.width, height: existing.height } : {}),
        };
      });
    };
  }, [diagramNodes]);

  useEffect(() => {
    setNodes(syncedNodes);
  }, [syncedNodes]);

  // Sync parent → local edges
  useEffect(() => {
    setEdges(diagramEdges.map(e => ({
      ...e,
      type: 'labeled',
      label: e.label,
      data: e.data,
    } as Edge)));
  }, [diagramEdges]);

  // Push state before mutations for undo
  const saveSnapshot = useCallback(() => {
    setNodes(nds => {
      setEdges(eds => {
        pushState(nds, eds);
        return eds;
      });
      return nds;
    });
  }, [pushState]);

  const syncToParent = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    onUpdateDiagram(serializeNodes(newNodes), serializeEdges(newEdges));
  }, [onUpdateDiagram]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes(nds => {
      const updated = applyNodeChanges(changes, nds);
      if (changes.some(c => c.type === 'remove')) {
        setEdges(eds => {
          syncToParent(updated, eds);
          return eds;
        });
      }
      return updated;
    });
  }, [syncToParent]);

  const onNodeDragStart = useCallback(() => {
    saveSnapshot();
  }, [saveSnapshot]);

  const onNodeDragStop = useCallback(() => {
    setNodes(nds => {
      setEdges(eds => {
        syncToParent(nds, eds);
        return eds;
      });
      return nds;
    });
  }, [syncToParent]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges(eds => {
      const updated = applyEdgeChanges(changes, eds);
      setNodes(nds => {
        syncToParent(nds, updated);
        return nds;
      });
      return updated;
    });
  }, [syncToParent]);

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    saveSnapshot();
    setEdges(eds => {
      const newEdges = addEdge(
        { ...connection, type: 'labeled', animated: false, data: { edgeStyle: defaultEdgeType } },
        eds,
      );
      setNodes(nds => {
        syncToParent(nds, newEdges);
        return nds;
      });
      return newEdges;
    });
  }, [saveSnapshot, syncToParent, defaultEdgeType]);

  // Undo/Redo via refs for reliable access to current state
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const performUndo = useCallback(() => {
    const state = undo(nodesRef.current, edgesRef.current);
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      syncToParent(state.nodes, state.edges);
    }
  }, [undo, syncToParent]);

  const performRedo = useCallback(() => {
    const state = redo(nodesRef.current, edgesRef.current);
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      syncToParent(state.nodes, state.edges);
    }
  }, [redo, syncToParent]);

  // Clear canvas
  function handleClear() {
    if (nodes.length === 0 && edges.length === 0) return;
    if (!confirm('Clear all components and connections?')) return;
    saveSnapshot();
    setNodes([]);
    setEdges([]);
    onUpdateDiagram([], []);
  }

  // Auto-layout listener
  useEffect(() => {
    function handleAutoLayout() {
      saveSnapshot();
      setNodes(nds => {
        setEdges(eds => {
          const laid = autoLayout(nds, eds);
          syncToParent(laid, eds);
          setNodes(laid);
          setTimeout(() => fitView({ padding: 0.2 }), 50);
          return eds;
        });
        return nds;
      });
    }
    window.addEventListener('arch-auto-layout', handleAutoLayout);
    return () => window.removeEventListener('arch-auto-layout', handleAutoLayout);
  }, [saveSnapshot, syncToParent, fitView]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        performRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setNodes(nds => nds.map(n => ({ ...n, selected: true })));
        setEdges(eds => eds.map(e => ({ ...e, selected: true })));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        // Duplicate selected nodes
        setNodes(nds => {
          const selected = nds.filter(n => n.selected);
          if (selected.length === 0) return nds;
          saveSnapshot();
          const newNodes = selected.map(n => ({
            ...n,
            id: generateNodeId(),
            position: { x: n.position.x + 30, y: n.position.y + 30 },
            selected: false,
          }));
          const updated = [...nds.map(n => ({ ...n, selected: false })), ...newNodes];
          setEdges(eds => {
            syncToParent(updated, eds);
            return eds;
          });
          return updated;
        });
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        // Edge style shortcuts: 1/2/3 change selected edges, L focuses label
        const selectedEdgeIds = edgesRef.current
          .filter(edge => edge.selected)
          .map(edge => edge.id);

        if (selectedEdgeIds.length > 0) {
          const styleMap: Record<string, 'solid' | 'dashed' | 'dotted'> = {
            '1': 'solid',
            '2': 'dashed',
            '3': 'dotted',
          };

          if (styleMap[e.key]) {
            e.preventDefault();
            const newStyle = styleMap[e.key];
            setEdges(eds => {
              const updated = eds.map(edge =>
                edge.selected ? { ...edge, data: { ...edge.data, edgeStyle: newStyle } } : edge,
              );
              setNodes(nds => {
                syncToParent(nds, updated);
                return nds;
              });
              return updated;
            });
          } else if (e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            // Focus the label input of the first selected edge
            window.dispatchEvent(new CustomEvent('edge-focus-label', {
              detail: { edgeId: selectedEdgeIds[0] },
            }));
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performUndo, performRedo, saveSnapshot, syncToParent]);

  // Drop handler
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/reactflow-type');
    const label = e.dataTransfer.getData('application/reactflow-label');
    const zoneStyle = e.dataTransfer.getData('application/reactflow-zone');
    if (!componentType) return;

    saveSnapshot();
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

    if (componentType === 'group') {
      const newNode = {
        id: generateNodeId(),
        type: 'group',
        position,
        data: {
          label,
          componentType: 'service' as const,
          zoneStyle: (zoneStyle || 'vpc') as 'vpc' | 'az' | 'cluster',
        },
        style: { width: 300, height: 200 },
      };
      const updatedNodes = [...serializeNodes(nodes), { ...newNode, data: newNode.data }];
      onUpdateDiagram(updatedNodes, serializeEdges(edges));
    } else {
      const newNode = {
        id: generateNodeId(),
        type: 'system',
        position,
        data: { label, componentType } as DiagramNodeData,
      };
      onUpdateDiagram([...serializeNodes(nodes), newNode], serializeEdges(edges));
    }
  }

  // Before node removal, save snapshot
  const onBeforeDelete = useCallback(async () => {
    saveSnapshot();
    return true;
  }, [saveSnapshot]);

  function handleValidate() {
    const text = serializeDiagramToText(serializeNodes(nodes), serializeEdges(edges));
    const notesContext = notes.trim() ? `\n\nMy architecture notes:\n${notes.trim()}` : '';
    onSendMessage(`Please review my architecture:\n\n${text}${notesContext}`);
  }

  async function handleExport() {
    if (!reactFlowRef.current) return;
    try {
      const blob = await exportDiagramAsPng(reactFlowRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'architecture-diagram.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      onSendMessage('/chat Export failed — try taking a screenshot instead.');
    }
  }

  return (
    <div className="arch-workspace">
      <PhaseProgressSidebar
        currentPhase={currentPhase}
        phaseStatuses={phaseStatuses}
        phaseOrder={phaseOrder}
        onPhaseClick={onPhaseClick}
        timerSeconds={timerSeconds}
      />

      <div className="arch-main">
        <div className="arch-canvas-area">
          <ComponentPalette />
          <div
            className="arch-canvas"
            ref={reactFlowRef}
          >
            <CanvasToolbar
              onUndo={performUndo}
              onRedo={performRedo}
              canUndo={canUndo()}
              canRedo={canRedo()}
              snapToGrid={snapToGrid}
              onToggleSnap={() => setSnapToGrid(s => !s)}
              onClear={handleClear}
              edgeType={defaultEdgeType}
              onEdgeTypeChange={setDefaultEdgeType}
            />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onNodeDragStart={onNodeDragStart}
              onNodeDragStop={onNodeDragStop}
              onBeforeDelete={onBeforeDelete}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              snapToGrid={snapToGrid}
              snapGrid={[20, 20]}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: 'labeled',
                animated: false,
                style: { stroke: 'var(--neon-cyan)', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--neon-cyan)' },
              }}
              colorMode="dark"
              deleteKeyCode={['Delete', 'Backspace']}
              multiSelectionKeyCode="Shift"
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--bg-tertiary)" />
              <Controls className="arch-controls" />
              <MiniMap
                className="arch-minimap"
                nodeColor={(n) => n.type === 'group' ? 'var(--neon-purple)' : 'var(--neon-cyan)'}
                maskColor="rgba(10, 10, 15, 0.7)"
              />
            </ReactFlow>
          </div>
        </div>

        <div className={`arch-notes ${notesOpen ? 'arch-notes--open' : ''}`}>
          <button type="button" className="arch-notes__toggle" onClick={() => setNotesOpen(!notesOpen)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
            Architecture Notes
            {notesOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {notesOpen && (
            <textarea
              className="arch-notes__textarea"
              placeholder="Document your architecture reasoning, tradeoffs, and assumptions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              spellCheck={false}
            />
          )}
        </div>

        <div className="arch-actions">
          <button type="button" className="btn btn--outline" onClick={handleValidate} disabled={nodes.length === 0}>
            <CheckCircle size={16} aria-hidden="true" /> Validate Architecture
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={nodes.length === 0}>
            <Download size={16} aria-hidden="true" /> Export PNG
          </button>
          <button type="button" className="btn btn--primary" onClick={onAdvancePhase}>
            Next: Deep Dive <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <MentorPanel
        messages={messages}
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onStopStreaming={onStopStreaming}
      />
    </div>
  );
}

export default function ArchitectureWorkspace(props: ArchitectureWorkspaceProps) {
  return (
    <ReactFlowProvider>
      <ArchitectureWorkspaceInner {...props} />
    </ReactFlowProvider>
  );
}

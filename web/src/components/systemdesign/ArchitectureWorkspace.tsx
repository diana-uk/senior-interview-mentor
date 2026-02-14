import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
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

const nodeTypes = { system: SystemNode };

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${Date.now()}-${++nodeIdCounter}`;
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
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<{ screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } } | null>(null);

  const nodes: Node[] = useMemo(() =>
    diagramNodes.map((n) => ({ ...n, type: 'system' })),
    [diagramNodes],
  );
  const edges: Edge[] = useMemo(() => diagramEdges as Edge[], [diagramEdges]);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    const updated = applyNodeChanges(changes, nodes);
    const serialized = updated.map((n) => ({
      id: n.id,
      type: n.type ?? 'system',
      position: n.position,
      data: n.data as DiagramNodeData,
    }));
    onUpdateDiagram(serialized, diagramEdges);
  }, [nodes, diagramEdges, onUpdateDiagram]);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    const updated = applyEdgeChanges(changes, edges);
    const serialized = updated.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === 'string' ? e.label : undefined,
      animated: e.animated,
    }));
    onUpdateDiagram(diagramNodes, serialized);
  }, [edges, diagramNodes, onUpdateDiagram]);

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const newEdges = addEdge(
      { ...connection, animated: true },
      edges,
    );
    const serialized = newEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === 'string' ? e.label : undefined,
      animated: e.animated,
    }));
    onUpdateDiagram(diagramNodes, serialized);
  }, [edges, diagramNodes, onUpdateDiagram]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/reactflow-type');
    const label = e.dataTransfer.getData('application/reactflow-label');
    if (!componentType) return;

    const position = reactFlowInstance.current
      ? reactFlowInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
      : { x: e.clientX - 300, y: e.clientY - 100 };

    const newNode = {
      id: generateNodeId(),
      type: 'system',
      position,
      data: { label, componentType } as DiagramNodeData,
    };

    onUpdateDiagram([...diagramNodes, newNode], diagramEdges);
  }

  function handleValidate() {
    const text = serializeDiagramToText(diagramNodes, diagramEdges);
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
      // Fallback: just notify user
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
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={(instance) => { reactFlowInstance.current = instance; }}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{ animated: true, style: { stroke: 'var(--neon-cyan)', strokeWidth: 2 } }}
              colorMode="dark"
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--bg-tertiary)" />
              <Controls className="arch-controls" />
              <MiniMap
                className="arch-minimap"
                nodeColor={() => 'var(--neon-cyan)'}
                maskColor="rgba(10, 10, 15, 0.7)"
              />
            </ReactFlow>
          </div>
        </div>

        <div className={`arch-notes ${notesOpen ? 'arch-notes--open' : ''}`}>
          <button className="arch-notes__toggle" onClick={() => setNotesOpen(!notesOpen)}>
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
          <button className="btn btn--outline" onClick={handleValidate} disabled={diagramNodes.length === 0}>
            <CheckCircle size={16} /> Validate Architecture
          </button>
          <button className="btn btn--ghost" onClick={handleExport} disabled={diagramNodes.length === 0}>
            <Download size={16} /> Export PNG
          </button>
          <button className="btn btn--primary" onClick={onAdvancePhase}>
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

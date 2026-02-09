import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Zap } from 'lucide-react';
import type { Endpoint, ChatMessage, SystemDesignPhase, PhaseStatus } from '../../types';
import PhaseProgressSidebar from './PhaseProgressSidebar';
import MentorPanel from './MentorPanel';

interface ApiContractWorkspaceProps {
  endpoints: Endpoint[];
  onUpdateEndpoints: (endpoints: Endpoint[]) => void;
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const QUICK_TEMPLATES = [
  { method: 'POST' as const, path: '/api/v1/resource', desc: 'Create a new resource' },
  { method: 'GET' as const, path: '/api/v1/resource/:id', desc: 'Get resource by ID' },
  { method: 'GET' as const, path: '/api/v1/resources', desc: 'List resources (paginated)' },
];

export default function ApiContractWorkspace({
  endpoints,
  onUpdateEndpoints,
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
}: ApiContractWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(endpoints[0]?.id ?? null);

  const selected = endpoints.find((e) => e.id === selectedId) ?? null;

  function addEndpoint(method: typeof HTTP_METHODS[number] = 'GET', path = '/api/', desc = '') {
    const ep: Endpoint = {
      id: generateId(),
      method,
      path,
      description: desc,
      requestBody: '{\n  \n}',
      responseBody: '{\n  \n}',
    };
    onUpdateEndpoints([...endpoints, ep]);
    setSelectedId(ep.id);
  }

  function handleRemoveEndpoint(id: string) {
    const updated = endpoints.filter((e) => e.id !== id);
    onUpdateEndpoints(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null);
  }

  function handleUpdateField(field: keyof Endpoint, value: string) {
    if (!selectedId) return;
    onUpdateEndpoints(
      endpoints.map((e) => (e.id === selectedId ? { ...e, [field]: value } : e)),
    );
  }

  return (
    <div className="sd-api">
      <PhaseProgressSidebar
        currentPhase={currentPhase}
        phaseStatuses={phaseStatuses}
        phaseOrder={phaseOrder}
        onPhaseClick={onPhaseClick}
        timerSeconds={timerSeconds}
      />

      <div className="sd-api__main">
        {/* Endpoint list */}
        <div className="sd-api__list">
          <div className="sd-api__list-header">
            <span className="sd-api__list-title">Endpoints</span>
            <span className="sd-api__list-count">{endpoints.length}</span>
            <button className="sd-api__add-btn" onClick={() => addEndpoint()}>
              <Plus size={14} /> Add
            </button>
          </div>
          <div className="sd-api__list-items">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                className={`sd-api__list-item ${ep.id === selectedId ? 'sd-api__list-item--active' : ''}`}
                onClick={() => setSelectedId(ep.id)}
              >
                <span className={`sd-api__method sd-api__method--${ep.method.toLowerCase()}`}>
                  {ep.method}
                </span>
                <span className="sd-api__path">{ep.path || '/...'}</span>
                <button
                  className="sd-api__delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleRemoveEndpoint(ep.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="sd-api__editor">
          {selected ? (
            <>
              <div className="sd-api__toolbar">
                <select
                  className="sd-api__method-select"
                  value={selected.method}
                  onChange={(e) => handleUpdateField('method', e.target.value)}
                >
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  className="sd-api__path-input"
                  value={selected.path}
                  onChange={(e) => handleUpdateField('path', e.target.value)}
                  placeholder="/api/v1/endpoint"
                />
              </div>

              <div className="sd-api__field">
                <label className="sd-api__label">Description</label>
                <input
                  className="sd-api__desc-input"
                  value={selected.description}
                  onChange={(e) => handleUpdateField('description', e.target.value)}
                  placeholder="What does this endpoint do?"
                />
              </div>

              <div className="sd-api__bodies">
                <div className="sd-api__body-section">
                  <label className="sd-api__label">Request Body</label>
                  <textarea
                    className="sd-api__body-textarea"
                    value={selected.requestBody}
                    onChange={(e) => handleUpdateField('requestBody', e.target.value)}
                    placeholder='{ "key": "value" }'
                    spellCheck={false}
                  />
                </div>
                <div className="sd-api__body-section">
                  <label className="sd-api__label">Response Body</label>
                  <textarea
                    className="sd-api__body-textarea"
                    value={selected.responseBody}
                    onChange={(e) => handleUpdateField('responseBody', e.target.value)}
                    placeholder='{ "id": "...", "status": "ok" }'
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="sd-api__actions">
                <button className="btn btn--primary" onClick={onAdvancePhase}>
                  Next Step: Data Model <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="sd-api__empty-state">
              <div className="sd-api__empty-icon">
                <span className="material-symbols-outlined">api</span>
              </div>
              <h3 className="sd-api__empty-title">Design Your API</h3>
              <p className="sd-api__empty-desc">
                Define the endpoints your system needs. Start with the core operations.
              </p>
              <div className="sd-api__quick-add">
                <span className="sd-api__quick-label">
                  <Zap size={12} /> Quick add
                </span>
                {QUICK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    className="sd-api__quick-btn"
                    onClick={() => addEndpoint(t.method as typeof HTTP_METHODS[number], t.path, t.desc)}
                  >
                    <span className={`sd-api__method sd-api__method--${t.method.toLowerCase()}`}>{t.method}</span>
                    <span>{t.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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

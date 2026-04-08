import { useState } from 'react';
import { Plus, X, ArrowRight, CheckCircle } from 'lucide-react';
import type { DeepDiveChallenge, DeepDiveApproach, ChatMessage, SystemDesignPhase, PhaseStatus } from '../../types';
import { serializeDeepDivesToText } from './deepdive/deepDiveSerializer';
import PhaseProgressSidebar from './PhaseProgressSidebar';
import MentorPanel from './MentorPanel';
import { generateId } from '../../utils/statsUtils.js';

interface DeepDiveWorkspaceProps {
  challenges: DeepDiveChallenge[];
  onUpdateChallenges: (challenges: DeepDiveChallenge[]) => void;
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

const MAX_CHALLENGES = 3;
const MAX_APPROACHES = 4;
const APPROACH_COLORS = ['cyan', 'magenta', 'amber', 'purple'] as const;

interface Template {
  title: string;
  problem: string;
  approaches: string[];
  icon: string;
}

const TEMPLATES: Record<string, Template> = {
  caching: {
    title: 'Caching Strategy',
    problem: 'How should we cache frequently accessed data to reduce database load and improve read latency?',
    approaches: ['Write-through Cache', 'Write-behind Cache'],
    icon: 'cached',
  },
  consistency: {
    title: 'Consistency Model',
    problem: 'What consistency guarantees should the system provide, and how do we handle eventual consistency scenarios?',
    approaches: ['Strong Consistency', 'Eventual Consistency'],
    icon: 'sync',
  },
  ratelimit: {
    title: 'Rate Limiting',
    problem: 'How do we protect the system from abuse while allowing legitimate high-volume traffic?',
    approaches: ['Token Bucket', 'Sliding Window'],
    icon: 'speed',
  },
  partition: {
    title: 'Data Partitioning',
    problem: 'How should we partition data across multiple nodes to handle growth beyond a single machine?',
    approaches: ['Hash-based Sharding', 'Range-based Sharding'],
    icon: 'grid_view',
  },
  conflict: {
    title: 'Conflict Resolution',
    problem: 'How do we handle conflicting writes in a distributed system with multiple write paths?',
    approaches: ['Last-Writer-Wins', 'CRDTs / Merge Functions'],
    icon: 'merge_type',
  },
};

function createEmptyApproach(): DeepDiveApproach {
  return { name: '', pros: '', cons: '' };
}

export default function DeepDiveWorkspace({
  challenges,
  onUpdateChallenges,
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
}: DeepDiveWorkspaceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = challenges[activeIndex] ?? null;

  function addChallenge(templateKey?: string) {
    if (challenges.length >= MAX_CHALLENGES) return;
    const template = templateKey ? TEMPLATES[templateKey] : undefined;
    const ch: DeepDiveChallenge = {
      id: generateId(),
      title: template?.title ?? '',
      problem: template?.problem ?? '',
      approaches: template
        ? template.approaches.map((name) => ({ name, pros: '', cons: '' }))
        : [createEmptyApproach(), createEmptyApproach()],
      chosenIndex: -1,
      justification: '',
      tradeoffs: '',
    };
    const updated = [...challenges, ch];
    onUpdateChallenges(updated);
    setActiveIndex(updated.length - 1);
  }

  function removeChallenge(idx: number) {
    const updated = challenges.filter((_, i) => i !== idx);
    onUpdateChallenges(updated);
    if (activeIndex >= updated.length) {
      setActiveIndex(Math.max(0, updated.length - 1));
    }
  }

  function updateChallenge(idx: number, patch: Partial<DeepDiveChallenge>) {
    onUpdateChallenges(
      challenges.map((ch, i) => (i === idx ? { ...ch, ...patch } : ch)),
    );
  }

  function updateApproach(approachIdx: number, patch: Partial<DeepDiveApproach>) {
    if (!active) return;
    const approaches = active.approaches.map((a, i) =>
      i === approachIdx ? { ...a, ...patch } : a,
    );
    updateChallenge(activeIndex, { approaches });
  }

  function addApproach() {
    if (!active || active.approaches.length >= MAX_APPROACHES) return;
    updateChallenge(activeIndex, {
      approaches: [...active.approaches, createEmptyApproach()],
    });
  }

  function handleReview() {
    const text = serializeDeepDivesToText(challenges);
    onSendMessage(`Please review my deep dives:\n\n${text}`);
  }

  return (
    <div className="sd-deepdive">
      <PhaseProgressSidebar
        currentPhase={currentPhase}
        phaseStatuses={phaseStatuses}
        phaseOrder={phaseOrder}
        onPhaseClick={onPhaseClick}
        timerSeconds={timerSeconds}
      />

      <div className="sd-deepdive__main">
        {/* Tab Bar */}
        <div className="sd-deepdive__tabs">
          {challenges.map((ch, i) => {
            const title = ch.title || 'Untitled';
            const truncated = title.length > 20 ? title.slice(0, 20) + '\u2026' : title;
            return (
              <button
                type="button"
                key={ch.id}
                className={`sd-deepdive__tab${i === activeIndex ? ' sd-deepdive__tab--active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                <span className="sd-deepdive__tab-badge">{i + 1}</span>
                <span>{truncated}</span>
                <span
                  className="sd-deepdive__tab-close"
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${title}`}
                  onClick={(e) => { e.stopPropagation(); removeChallenge(i); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); removeChallenge(i); } }}
                >
                  <X size={12} />
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="sd-deepdive__add-btn"
            disabled={challenges.length >= MAX_CHALLENGES}
            onClick={() => addChallenge()}
          >
            <Plus size={14} /> Add Deep Dive
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="sd-deepdive__scroll">
          {challenges.length === 0 ? (
            /* Empty State */
            <div className="sd-deepdive__empty">
              <span className="material-symbols-outlined sd-deepdive__empty-icon">search</span>
              <div className="sd-deepdive__empty-title">Pick a Technical Challenge</div>
              <div className="sd-deepdive__empty-desc">
                Deep dives demonstrate your ability to analyze complex tradeoffs.
                Choose a challenge area or create your own.
              </div>
              <div className="sd-deepdive__templates">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button
                    type="button"
                    key={key}
                    className="sd-deepdive__template-btn"
                    onClick={() => addChallenge(key)}
                  >
                    <span className="material-symbols-outlined">{t.icon}</span>
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          ) : active ? (
            /* Challenge Editor */
            <div className="sd-deepdive__editor sd-deepdive__editor--visible">
              {/* Title */}
              <div className="sd-deepdive__section">
                <div className="sd-deepdive__section-header">
                  <span className="material-symbols-outlined">edit_note</span>
                  <h3>Challenge Title</h3>
                </div>
                <input
                  type="text"
                  className="sd-deepdive__input"
                  value={active.title}
                  onChange={(e) => updateChallenge(activeIndex, { title: e.target.value })}
                  placeholder="e.g., Caching strategy for read-heavy timeline feed"
                />
              </div>

              {/* Problem Statement */}
              <div className="sd-deepdive__section">
                <div className="sd-deepdive__section-header">
                  <span className="material-symbols-outlined">description</span>
                  <h3>Problem Statement</h3>
                </div>
                <p className="sd-deepdive__hint">
                  What&apos;s the technical challenge? Why does it matter for this system?
                </p>
                <textarea
                  className="sd-deepdive__textarea"
                  rows={4}
                  value={active.problem}
                  onChange={(e) => updateChallenge(activeIndex, { problem: e.target.value })}
                  placeholder="Describe the specific technical challenge you want to explore..."
                />
              </div>

              {/* Approach Comparison */}
              <div className="sd-deepdive__section">
                <div className="sd-deepdive__section-header">
                  <span className="material-symbols-outlined">compare_arrows</span>
                  <h3>Approach Comparison</h3>
                </div>
                <p className="sd-deepdive__hint">
                  Compare 2-4 approaches side-by-side. Each approach should have clear pros and cons.
                </p>

                <div className="sd-deepdive__approaches">
                  {active.approaches.map((a, i) => (
                    <div
                      key={i}
                      className="sd-deepdive__approach-card"
                      data-color={APPROACH_COLORS[i]}
                    >
                      <input
                        type="text"
                        className="sd-deepdive__approach-name"
                        value={a.name}
                        onChange={(e) => updateApproach(i, { name: e.target.value })}
                        placeholder="Approach name"
                      />
                      <div className="sd-deepdive__approach-field">
                        <label>Pros</label>
                        <textarea
                          className="sd-deepdive__approach-pros"
                          rows={3}
                          value={a.pros}
                          onChange={(e) => updateApproach(i, { pros: e.target.value })}
                          placeholder="What does this approach do well?"
                        />
                      </div>
                      <div className="sd-deepdive__approach-field">
                        <label>Cons</label>
                        <textarea
                          className="sd-deepdive__approach-cons"
                          rows={3}
                          value={a.cons}
                          onChange={(e) => updateApproach(i, { cons: e.target.value })}
                          placeholder="What are the drawbacks?"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="sd-deepdive__add-approach"
                    disabled={active.approaches.length >= MAX_APPROACHES}
                    onClick={addApproach}
                  >
                    <Plus size={18} /> Add Approach
                  </button>
                </div>
              </div>

              {/* Chosen Approach */}
              <div className="sd-deepdive__section">
                <div className="sd-deepdive__section-header">
                  <span className="material-symbols-outlined">check_circle</span>
                  <h3>Chosen Approach</h3>
                </div>
                <p className="sd-deepdive__hint">
                  Select which approach you&apos;d recommend and explain why.
                </p>

                <div className="sd-deepdive__chosen-options">
                  {active.approaches.map((a, i) => {
                    const label = a.name || `Approach ${i + 1}`;
                    const selected = active.chosenIndex === i;
                    return (
                      <label
                        key={i}
                        className={`sd-deepdive__chosen-option${selected ? ' sd-deepdive__chosen-option--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`chosen-${active.id}`}
                          className="sd-deepdive__chosen-radio"
                          checked={selected}
                          onChange={() => updateChallenge(activeIndex, { chosenIndex: i })}
                        />
                        <span className="sd-deepdive__chosen-label">{label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="sd-deepdive__field-group" style={{ marginTop: 'var(--space-3)' }}>
                  <label className="sd-deepdive__label">Justification</label>
                  <textarea
                    className="sd-deepdive__textarea"
                    rows={3}
                    value={active.justification}
                    onChange={(e) => updateChallenge(activeIndex, { justification: e.target.value })}
                    placeholder="Why is this the right choice for this system? What constraints drive this decision?"
                  />
                </div>
              </div>

              {/* Tradeoffs */}
              <div className="sd-deepdive__section">
                <div className="sd-deepdive__section-header">
                  <span className="material-symbols-outlined">balance</span>
                  <h3>Tradeoffs</h3>
                </div>
                <p className="sd-deepdive__hint">
                  What are you sacrificing? Under what conditions would you choose differently?
                </p>
                <textarea
                  className="sd-deepdive__textarea"
                  rows={4}
                  value={active.tradeoffs}
                  onChange={(e) => updateChallenge(activeIndex, { tradeoffs: e.target.value })}
                  placeholder="e.g., We sacrifice strong consistency for availability. If this were a banking system with strict regulatory requirements, we'd choose the write-through approach instead..."
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions Bar */}
        <div className="sd-deepdive__actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={challenges.length === 0}
            onClick={handleReview}
          >
            <CheckCircle size={16} aria-hidden="true" /> Review Deep Dives
          </button>
          <button type="button" className="btn btn-primary" onClick={onAdvancePhase}>
            Next: Scaling <ArrowRight size={16} />
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

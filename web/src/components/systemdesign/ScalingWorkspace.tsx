import { useState, type KeyboardEvent } from 'react';
import { CheckCircle, Flag, X } from 'lucide-react';
import type {
  ScalingState,
  CapacityEstimation,
  ComputeStrategy,
  DbReplication,
  DbSharding,
  CachePattern,
  EvictionPolicy,
  LbAlgorithm,
  ChatMessage,
  SystemDesignPhase,
  PhaseStatus,
} from '../../types';
import { serializeScalingPlanToText } from './scaling/scalingSerializer';
import { isSectionFilled } from '../../utils/scalingUtils.js';
import PhaseProgressSidebar from './PhaseProgressSidebar';
import MentorPanel from './MentorPanel';

interface ScalingWorkspaceProps {
  scaling: ScalingState;
  onUpdateScaling: (scaling: ScalingState) => void;
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

type SectionId = 'capacity' | 'compute' | 'database' | 'caching' | 'loadbalancing' | 'reliability';

const SECTION_META: { id: SectionId; icon: string; title: string }[] = [
  { id: 'capacity', icon: 'calculate', title: 'Capacity Estimation' },
  { id: 'compute', icon: 'memory', title: 'Compute Scaling' },
  { id: 'database', icon: 'storage', title: 'Database Scaling' },
  { id: 'caching', icon: 'cached', title: 'Caching' },
  { id: 'loadbalancing', icon: 'dns', title: 'Load Balancing & CDN' },
  { id: 'reliability', icon: 'shield', title: 'Reliability & Monitoring' },
];

const RELIABILITY_OPTIONS = [
  { value: 'circuit-breakers', label: 'Circuit Breakers' },
  { value: 'retries', label: 'Retries with Exponential Backoff' },
  { value: 'health-checks', label: 'Health Checks' },
  { value: 'graceful-degradation', label: 'Graceful Degradation' },
  { value: 'rate-limiting', label: 'Rate Limiting' },
  { value: 'bulkhead', label: 'Bulkhead Isolation' },
];

const METRIC_SUGGESTIONS = [
  'P99 latency', 'Error rate', 'Cache hit ratio',
  'QPS', 'CPU utilization', 'Memory usage',
];

const CAP_FIELDS: { key: keyof CapacityEstimation; label: string; unit: string; placeholder: string }[] = [
  { key: 'readQps', label: 'Read QPS', unit: 'req/s', placeholder: '10,000' },
  { key: 'writeQps', label: 'Write QPS', unit: 'req/s', placeholder: '1,000' },
  { key: 'storageDayGb', label: 'Storage / Day', unit: 'GB/day', placeholder: '50' },
  { key: 'storageGrowthTbYr', label: 'Storage Growth', unit: 'TB/yr', placeholder: '18' },
  { key: 'bandwidthMbS', label: 'Bandwidth In/Out', unit: 'MB/s', placeholder: '500' },
  { key: 'cacheMemGb', label: 'Cache Memory', unit: 'GB', placeholder: '128' },
];


export default function ScalingWorkspace({
  scaling,
  onUpdateScaling,
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
}: ScalingWorkspaceProps) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(['capacity', 'compute']),
  );
  const [metricInput, setMetricInput] = useState('');

  function patch(update: Partial<ScalingState>) {
    onUpdateScaling({ ...scaling, ...update });
  }

  function patchCapacity(key: keyof CapacityEstimation, value: string) {
    onUpdateScaling({
      ...scaling,
      capacity: { ...scaling.capacity, [key]: value },
    });
  }

  function toggleSection(id: SectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleReliabilityCheck(value: string) {
    const checks = scaling.reliabilityChecks.includes(value)
      ? scaling.reliabilityChecks.filter((c) => c !== value)
      : [...scaling.reliabilityChecks, value];
    patch({ reliabilityChecks: checks });
  }

  function addMetric(name: string) {
    const trimmed = name.trim();
    if (!trimmed || scaling.metrics.includes(trimmed)) return;
    patch({ metrics: [...scaling.metrics, trimmed] });
  }

  function removeMetric(name: string) {
    patch({ metrics: scaling.metrics.filter((m) => m !== name) });
  }

  function handleMetricKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMetric(metricInput);
      setMetricInput('');
    }
  }

  function handleReview() {
    const text = serializeScalingPlanToText(scaling);
    onSendMessage(`Please review my scaling plan:\n\n${text}`);
  }

  function handleFinish() {
    onSendMessage('I have completed all phases. Please provide a final review and scoring of my system design.');
  }

  function renderRadioGroup<T extends string>(
    name: string,
    value: T,
    options: { value: T; label: string }[],
    onChange: (v: T) => void,
  ) {
    return (
      <div className="sd-scaling__radio-group">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`sd-scaling__radio-label${value === opt.value ? ' sd-scaling__radio-label--selected' : ''}`}
          >
            <input
              type="radio"
              name={name}
              className="sd-scaling__radio"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="sd-scaling">
      <PhaseProgressSidebar
        currentPhase={currentPhase}
        phaseStatuses={phaseStatuses}
        phaseOrder={phaseOrder}
        onPhaseClick={onPhaseClick}
        timerSeconds={timerSeconds}
      />

      <div className="sd-scaling__main">
        {/* Header */}
        <div className="sd-scaling__header">
          <span className="material-symbols-outlined">trending_up</span>
          <span className="sd-scaling__header-title">Scaling & Reliability</span>
        </div>

        {/* Scrollable Content */}
        <div className="sd-scaling__scroll">
          {SECTION_META.map(({ id, icon, title }) => {
            const isOpen = openSections.has(id);
            const filled = isSectionFilled(id, scaling);
            return (
              <div
                key={id}
                className={`sd-scaling__section${id === 'capacity' ? ' sd-scaling__capacity' : ` sd-scaling__section--${id}`}${isOpen ? ' sd-scaling__section--open' : ''}`}
              >
                <div
                  className="sd-scaling__section-header"
                  onClick={() => toggleSection(id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(id); } }}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                  <span className="sd-scaling__section-title">{title}</span>
                  <span className={`sd-scaling__section-dot${filled ? ' sd-scaling__section-dot--filled' : ''}`} />
                  <span className="material-symbols-outlined sd-scaling__section-chevron">expand_more</span>
                </div>
                <div className="sd-scaling__section-body">
                  <div className="sd-scaling__section-content">
                    {id === 'capacity' && renderCapacity()}
                    {id === 'compute' && renderCompute()}
                    {id === 'database' && renderDatabase()}
                    {id === 'caching' && renderCaching()}
                    {id === 'loadbalancing' && renderLoadBalancing()}
                    {id === 'reliability' && renderReliability()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="sd-scaling__actions">
          <button type="button" className="btn btn-secondary" onClick={handleReview}>
            <CheckCircle size={16} aria-hidden="true" /> Review Scaling Plan
          </button>
          <button type="button" className="btn btn-primary" onClick={handleFinish}>
            <Flag size={16} aria-hidden="true" /> Finish Interview
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

  /* ── Section Renderers ── */

  function renderCapacity() {
    return (
      <div className="sd-scaling__cap-grid">
        {CAP_FIELDS.map(({ key, label, unit, placeholder }) => (
          <div key={key} className="sd-scaling__cap-field">
            <span className="sd-scaling__cap-label">{label}</span>
            <div className="sd-scaling__cap-input-wrap">
              <input
                type="text"
                className="sd-scaling__cap-input"
                value={scaling.capacity[key]}
                onChange={(e) => patchCapacity(key, e.target.value)}
                placeholder={placeholder}
              />
              <span className="sd-scaling__cap-unit">{unit}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCompute() {
    return (
      <>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Strategy</span>
          {renderRadioGroup<ComputeStrategy>(
            'computeStrategy',
            scaling.computeStrategy,
            [
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
              { value: 'both', label: 'Both' },
            ],
            (v) => patch({ computeStrategy: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Details</span>
          <textarea
            className="sd-scaling__textarea"
            rows={3}
            value={scaling.computeDetails}
            onChange={(e) => patch({ computeDetails: e.target.value })}
            placeholder="How will you scale compute? Auto-scaling policies, container orchestration, serverless considerations..."
          />
        </div>
      </>
    );
  }

  function renderDatabase() {
    return (
      <>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Replication</span>
          {renderRadioGroup<DbReplication>(
            'dbReplication',
            scaling.dbReplication,
            [
              { value: 'primary-replica', label: 'Primary-Replica' },
              { value: 'multi-primary', label: 'Multi-Primary' },
              { value: 'none', label: 'None' },
            ],
            (v) => patch({ dbReplication: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Sharding</span>
          {renderRadioGroup<DbSharding>(
            'dbSharding',
            scaling.dbSharding,
            [
              { value: 'hash', label: 'Hash-based' },
              { value: 'range', label: 'Range-based' },
              { value: 'geo', label: 'Geographic' },
              { value: 'none', label: 'None' },
            ],
            (v) => patch({ dbSharding: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Shard Key</span>
          <input
            type="text"
            className="sd-scaling__input"
            value={scaling.dbShardKey}
            onChange={(e) => patch({ dbShardKey: e.target.value })}
            placeholder="e.g., user_id, region, timestamp"
          />
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Details</span>
          <textarea
            className="sd-scaling__textarea"
            rows={3}
            value={scaling.dbDetails}
            onChange={(e) => patch({ dbDetails: e.target.value })}
            placeholder="Replication lag tolerance, failover strategy, read/write splitting..."
          />
        </div>
      </>
    );
  }

  function renderCaching() {
    return (
      <>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Cache Pattern</span>
          {renderRadioGroup<CachePattern>(
            'cachePattern',
            scaling.cachePattern,
            [
              { value: 'cache-aside', label: 'Cache-Aside' },
              { value: 'write-through', label: 'Write-Through' },
              { value: 'write-behind', label: 'Write-Behind' },
              { value: 'read-through', label: 'Read-Through' },
            ],
            (v) => patch({ cachePattern: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Eviction Policy</span>
          {renderRadioGroup<EvictionPolicy>(
            'eviction',
            scaling.evictionPolicy,
            [
              { value: 'lru', label: 'LRU' },
              { value: 'lfu', label: 'LFU' },
              { value: 'ttl', label: 'TTL-based' },
            ],
            (v) => patch({ evictionPolicy: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">TTL</span>
          <input
            type="text"
            className="sd-scaling__input"
            value={scaling.cacheTtl}
            onChange={(e) => patch({ cacheTtl: e.target.value })}
            placeholder="e.g., 5 minutes, 1 hour, 24 hours"
          />
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Details</span>
          <textarea
            className="sd-scaling__textarea"
            rows={3}
            value={scaling.cacheDetails}
            onChange={(e) => patch({ cacheDetails: e.target.value })}
            placeholder="Cache invalidation strategy, warm-up approach, cache stampede prevention..."
          />
        </div>
      </>
    );
  }

  function renderLoadBalancing() {
    return (
      <>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">LB Algorithm</span>
          {renderRadioGroup<LbAlgorithm>(
            'lbAlgo',
            scaling.lbAlgorithm,
            [
              { value: 'round-robin', label: 'Round Robin' },
              { value: 'least-connections', label: 'Least Connections' },
              { value: 'consistent-hash', label: 'Consistent Hash' },
              { value: 'weighted', label: 'Weighted' },
            ],
            (v) => patch({ lbAlgorithm: v }),
          )}
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">CDN</span>
          <label className={`sd-scaling__cdn-toggle${scaling.useCdn ? ' sd-scaling__cdn-toggle--checked' : ''}`}>
            <input
              type="checkbox"
              className="sd-scaling__cdn-checkbox"
              checked={scaling.useCdn}
              onChange={(e) => patch({ useCdn: e.target.checked })}
            />
            <span>Use CDN for static assets and edge caching</span>
          </label>
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Details</span>
          <textarea
            className="sd-scaling__textarea"
            rows={3}
            value={scaling.lbDetails}
            onChange={(e) => patch({ lbDetails: e.target.value })}
            placeholder="Health check configuration, sticky sessions, L4 vs L7, CDN cache rules..."
          />
        </div>
      </>
    );
  }

  function renderReliability() {
    return (
      <>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Reliability Patterns</span>
          <div className="sd-scaling__checklist">
            {RELIABILITY_OPTIONS.map(({ value, label }) => {
              const checked = scaling.reliabilityChecks.includes(value);
              return (
                <label
                  key={value}
                  className={`sd-scaling__check-label${checked ? ' sd-scaling__check-label--checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="sd-scaling__checkbox"
                    checked={checked}
                    onChange={() => toggleReliabilityCheck(value)}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Key Metrics to Monitor</span>
          <div className="sd-scaling__tags">
            {scaling.metrics.map((m) => (
              <span key={m} className="sd-scaling__tag">
                {m}
                <button
                  type="button"
                  className="sd-scaling__tag-remove"
                  onClick={() => removeMetric(m)}
                  aria-label={`Remove ${m}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="sd-scaling__tag-input-wrap">
            <input
              type="text"
              className="sd-scaling__tag-input"
              value={metricInput}
              onChange={(e) => setMetricInput(e.target.value)}
              onKeyDown={handleMetricKeyDown}
              placeholder="Type a metric and press Enter"
            />
          </div>
          <div className="sd-scaling__tag-suggestions">
            {METRIC_SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                className={`sd-scaling__tag-suggestion${scaling.metrics.includes(s) ? ' sd-scaling__tag-suggestion--used' : ''}`}
                onClick={() => addMetric(s)}
                disabled={scaling.metrics.includes(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="sd-scaling__field-group">
          <span className="sd-scaling__label">Alerting Strategy</span>
          <textarea
            className="sd-scaling__textarea"
            rows={3}
            value={scaling.alertingDetails}
            onChange={(e) => patch({ alertingDetails: e.target.value })}
            placeholder="Alert thresholds, escalation policies, on-call rotation, runbook approach..."
          />
        </div>
      </>
    );
  }
}

import { Check, Lock, ArrowRight, Clock } from 'lucide-react';
import type { SystemDesignPhase, PhaseStatus } from '../../types';

const PHASE_STEPS: {
  phase: SystemDesignPhase;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  accentBg: string;
}[] = [
  {
    phase: 'requirements',
    title: 'Requirements & Scope',
    description: 'Clarify functional and non-functional requirements. Define scope, estimate scale, and identify key constraints.',
    icon: 'checklist',
    accentColor: 'var(--neon-cyan)',
    accentBg: 'rgba(88, 166, 255, 0.10)',
  },
  {
    phase: 'api',
    title: 'API Design',
    description: 'Define REST endpoints, request/response contracts, status codes, and error handling patterns.',
    icon: 'api',
    accentColor: 'var(--neon-lime)',
    accentBg: 'rgba(63, 185, 80, 0.10)',
  },
  {
    phase: 'data',
    title: 'Data Model & Storage',
    description: 'Design schemas, choose databases, plan indexing strategy and data partitioning.',
    icon: 'database',
    accentColor: 'var(--neon-amber)',
    accentBg: 'rgba(210, 153, 34, 0.10)',
  },
  {
    phase: 'architecture',
    title: 'High-Level Architecture',
    description: 'Describe components, services, data flow, and inter-service communication patterns.',
    icon: 'account_tree',
    accentColor: 'var(--neon-purple)',
    accentBg: 'rgba(163, 113, 247, 0.10)',
  },
  {
    phase: 'deepdive',
    title: 'Deep Dives',
    description: 'Pick 2-3 critical components to explore in depth: caching layers, message queues, consistency tradeoffs.',
    icon: 'search',
    accentColor: '#f472b6',
    accentBg: 'rgba(244, 114, 182, 0.10)',
  },
  {
    phase: 'scaling',
    title: 'Scaling & Reliability',
    description: 'Horizontal scaling, load balancing, CDN strategy, monitoring, failure modes, and SLA targets.',
    icon: 'trending_up',
    accentColor: '#facc15',
    accentBg: 'rgba(250, 204, 21, 0.10)',
  },
];

interface SystemDesignPlanOverviewProps {
  topicTitle: string;
  topicPrompt: string;
  phaseStatuses: Record<SystemDesignPhase, PhaseStatus>;
  onStartDesigning: () => void;
  timerSeconds?: number;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function SystemDesignPlanOverview({
  topicTitle,
  topicPrompt,
  phaseStatuses,
  onStartDesigning,
  timerSeconds = 2700,
}: SystemDesignPlanOverviewProps) {
  const completedCount = PHASE_STEPS.filter((c) => phaseStatuses[c.phase] === 'completed').length;

  return (
    <div className="sd-overview">
      <div className="sd-overview__container">
        {/* Hero */}
        <div className="sd-overview__hero">
          <div className="sd-overview__hero-glow" />
          <div className="sd-overview__hero-content">
            <div className="sd-overview__hero-icon">
              <span className="material-symbols-outlined">architecture</span>
            </div>
            <div className="sd-overview__hero-text">
              <h1 className="sd-overview__hero-title">{topicTitle}</h1>
              <p className="sd-overview__hero-subtitle">{topicPrompt}</p>
            </div>
          </div>
          <div className="sd-overview__hero-meta">
            <div className="sd-overview__hero-timer">
              <Clock size={14} />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <div className="sd-overview__hero-progress">
              {completedCount} / {PHASE_STEPS.length} phases
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="sd-overview__roadmap">
          <div className="sd-overview__roadmap-header">
            <h2>Design Roadmap</h2>
            <div className="sd-overview__progress-track">
              <div
                className="sd-overview__progress-fill"
                style={{ width: `${(completedCount / PHASE_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="sd-overview__timeline">
            {PHASE_STEPS.map((step, idx) => {
              const status = phaseStatuses[step.phase];
              const isCompleted = status === 'completed';
              const isLocked = status === 'locked';
              const isPending = status === 'pending';
              const isFirst = idx === 0;
              const isLast = idx === PHASE_STEPS.length - 1;

              return (
                <div
                  key={step.phase}
                  className={`sd-overview__step ${isCompleted ? 'sd-overview__step--completed' : ''} ${isLocked ? 'sd-overview__step--locked' : ''} ${isFirst && isPending ? 'sd-overview__step--start' : ''}`}
                >
                  {/* Timeline track */}
                  <div className="sd-overview__step-track">
                    <div
                      className="sd-overview__step-dot"
                      style={{
                        borderColor: isCompleted ? 'var(--neon-lime)' : isLocked ? 'var(--border-default)' : step.accentColor,
                        background: isCompleted ? 'var(--neon-lime)' : 'var(--bg-surface)',
                      }}
                    >
                      {isCompleted && <Check size={12} color="white" />}
                      {isLocked && <Lock size={10} />}
                      {!isCompleted && !isLocked && <span className="sd-overview__step-dot-num">{idx + 1}</span>}
                    </div>
                    {!isLast && (
                      <div
                        className="sd-overview__step-line"
                        style={{
                          background: isCompleted ? 'var(--neon-lime)' : 'var(--border-default)',
                        }}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div
                    className="sd-overview__step-card"
                    style={{
                      borderLeftColor: isLocked ? 'var(--border-default)' : step.accentColor,
                    }}
                  >
                    <div className="sd-overview__step-header">
                      <div className="sd-overview__step-icon" style={{ background: isLocked ? 'var(--bg-overlay)' : step.accentBg, color: isLocked ? 'var(--text-secondary)' : step.accentColor }}>
                        <span className="material-symbols-outlined">{step.icon}</span>
                      </div>
                      <div className="sd-overview__step-info">
                        <h3 className="sd-overview__step-title">{step.title}</h3>
                        <p className="sd-overview__step-desc">{step.description}</p>
                      </div>
                      <div className="sd-overview__step-status">
                        {isCompleted && <span className="sd-overview__badge sd-overview__badge--done">Done</span>}
                        {status === 'in-progress' && <span className="sd-overview__badge sd-overview__badge--active">Active</span>}
                        {isPending && isFirst && <span className="sd-overview__badge sd-overview__badge--start">Start Here</span>}
                        {isPending && !isFirst && <span className="sd-overview__badge sd-overview__badge--pending">Upcoming</span>}
                        {isLocked && <span className="sd-overview__badge sd-overview__badge--locked">Locked</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button className="sd-overview__cta-btn" onClick={onStartDesigning}>
          <span>Begin Requirements Phase</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

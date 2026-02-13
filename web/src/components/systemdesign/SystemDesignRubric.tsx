import { useState } from 'react';
import { Star, TrendingUp, X } from 'lucide-react';

export type SDRubricDimensionId =
  | 'scalability'
  | 'reliability'
  | 'data-model'
  | 'api-design'
  | 'trade-offs'
  | 'communication';

export interface SDRubricDimension {
  id: SDRubricDimensionId;
  label: string;
  description: string;
  score: number;
  maxScore: 4;
}

export interface SDReviewResult {
  id: string;
  topicTitle: string;
  dimensions: SDRubricDimension[];
  overallScore: number;
  feedback: string;
  improvementPlan: string[];
  createdAt: string;
}

interface SystemDesignRubricProps {
  topicTitle: string;
  onSubmit: (review: SDReviewResult) => void;
  onClose: () => void;
}

const SD_DIMENSIONS: { id: SDRubricDimensionId; label: string; description: string }[] = [
  { id: 'scalability', label: 'Scalability', description: 'Does the design handle growth in users, data, and traffic?' },
  { id: 'reliability', label: 'Reliability', description: 'Does the system handle failures gracefully with redundancy and recovery?' },
  { id: 'data-model', label: 'Data Model', description: 'Is the data schema well-designed with appropriate storage choices?' },
  { id: 'api-design', label: 'API Design', description: 'Are APIs clean, RESTful, and well-documented with proper contracts?' },
  { id: 'trade-offs', label: 'Trade-offs', description: 'Were design trade-offs explicitly identified and justified?' },
  { id: 'communication', label: 'Communication', description: 'Was the design process clearly explained with structured thinking?' },
];

const SCORE_LABELS = ['Missing', 'Weak', 'Adequate', 'Strong', 'Excellent'];
const SCORE_COLORS = [
  'var(--neon-red)',
  'var(--neon-amber)',
  'var(--neon-amber)',
  'var(--neon-lime)',
  'var(--neon-cyan)',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generateSDImprovementPlan(dims: SDRubricDimension[]): string[] {
  const weak = dims.filter((d) => d.score <= 2).sort((a, b) => a.score - b.score);
  const plans: string[] = [];
  for (const d of weak) {
    switch (d.id) {
      case 'scalability':
        plans.push('Practice horizontal scaling patterns: sharding, load balancing, caching layers, and CDN placement.');
        break;
      case 'reliability':
        plans.push('Study fault tolerance: replication, circuit breakers, health checks, graceful degradation, and retry strategies.');
        break;
      case 'data-model':
        plans.push('Practice designing schemas before coding. Compare SQL vs NoSQL trade-offs for each entity. Consider access patterns first.');
        break;
      case 'api-design':
        plans.push('Follow REST best practices: consistent naming, proper HTTP methods, pagination, versioning, and error contracts.');
        break;
      case 'trade-offs':
        plans.push('Always state trade-offs explicitly: "I chose X over Y because..." Practice CAP theorem applications and consistency models.');
        break;
      case 'communication':
        plans.push('Structure your design: requirements → API → data model → high-level → deep-dive → scaling. Narrate as you draw.');
        break;
    }
  }
  if (plans.length === 0) {
    plans.push('Excellent design! Focus on speed — practice completing designs within 35 minutes.');
  }
  return plans;
}

export default function SystemDesignRubric({ topicTitle, onSubmit, onClose }: SystemDesignRubricProps) {
  const [scores, setScores] = useState<Record<SDRubricDimensionId, number>>(
    Object.fromEntries(SD_DIMENSIONS.map((d) => [d.id, -1])) as Record<SDRubricDimensionId, number>,
  );
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState<SDReviewResult | null>(null);

  function handleScoreChange(dimId: SDRubricDimensionId, score: number) {
    setScores((prev) => ({ ...prev, [dimId]: score }));
  }

  const allScored = Object.values(scores).every((s) => s >= 0);
  const overallScore = allScored
    ? Object.values(scores).reduce((sum, s) => sum + s, 0) / SD_DIMENSIONS.length
    : 0;

  function handleSubmit() {
    const dimensions: SDRubricDimension[] = SD_DIMENSIONS.map((d) => ({
      id: d.id,
      label: d.label,
      description: d.description,
      score: scores[d.id],
      maxScore: 4 as const,
    }));

    const review: SDReviewResult = {
      id: generateId(),
      topicTitle,
      dimensions,
      overallScore,
      feedback,
      improvementPlan: generateSDImprovementPlan(dimensions),
      createdAt: new Date().toISOString(),
    };

    setSubmitted(review);
    onSubmit(review);
  }

  if (submitted) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">System Design Review Complete</span>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 80, height: 80, borderRadius: '50%',
                background: `conic-gradient(${SCORE_COLORS[Math.round(submitted.overallScore)]} ${(submitted.overallScore / 4) * 360}deg, var(--bg-overlay) 0deg)`,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-bright)' }}>
                    {submitted.overallScore.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>/4.0</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{submitted.topicTitle}</div>
            </div>

            {submitted.dimensions.map((d) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ flex: '0 0 120px', fontSize: 12, color: 'var(--text-secondary)' }}>{d.label}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{ width: `${(d.score / 4) * 100}%` }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: SCORE_COLORS[d.score], minWidth: 20, textAlign: 'right' }}>
                  {d.score}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TrendingUp size={14} color="var(--neon-cyan)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)' }}>Improvement Plan</span>
              </div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {submitted.improvementPlan.map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">System Design Rubric</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Evaluate your system design for <strong style={{ color: 'var(--text-bright)' }}>{topicTitle}</strong> on each dimension.
          </div>

          {SD_DIMENSIONS.map((dim) => (
            <div key={dim.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</span>
                {scores[dim.id] >= 0 && (
                  <span style={{ fontSize: 11, color: SCORE_COLORS[scores[dim.id]] }}>
                    {SCORE_LABELS[scores[dim.id]]}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{dim.description}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3, 4].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(dim.id, score)}
                    style={{
                      flex: 1,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      background: scores[dim.id] === score ? SCORE_COLORS[score] : 'var(--bg-elevated)',
                      color: scores[dim.id] === score ? 'var(--bg-void)' : 'var(--text-muted)',
                      border: `1px solid ${scores[dim.id] === score ? 'transparent' : 'var(--border-default)'}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Star size={10} fill={scores[dim.id] >= score ? 'currentColor' : 'none'} />
                    {score}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Additional Notes (optional)
            </label>
            <textarea
              className="input textarea"
              placeholder="What went well? What could improve in your design?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ minHeight: 60, fontSize: 12 }}
            />
          </div>

          {allScored && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid var(--border-default)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Overall Score</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: SCORE_COLORS[Math.round(overallScore)], fontFamily: 'var(--font-mono)' }}>
                {overallScore.toFixed(1)} / 4.0
              </span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!allScored}>
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}

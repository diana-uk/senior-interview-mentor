import { useState } from 'react';
import { Star, TrendingUp, X } from 'lucide-react';
import type { RubricDimension, RubricDimensionId, ReviewResult } from '../types';

interface ReviewRubricProps {
  problemTitle: string;
  problemId: string | null;
  onSubmit: (review: ReviewResult) => void;
  onClose: () => void;
}

const DIMENSIONS: { id: RubricDimensionId; label: string; description: string }[] = [
  { id: 'correctness', label: 'Correctness', description: 'Does the solution produce correct output for all cases?' },
  { id: 'time-complexity', label: 'Time Complexity', description: 'Is the time complexity optimal for the problem?' },
  { id: 'space-complexity', label: 'Space Complexity', description: 'Is space usage efficient and justified?' },
  { id: 'code-quality', label: 'Code Quality', description: 'Is the code clean, readable, and well-structured?' },
  { id: 'edge-cases', label: 'Edge Cases', description: 'Are edge cases identified and handled?' },
  { id: 'communication', label: 'Communication', description: 'Was the thought process clearly explained?' },
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

export default function ReviewRubric({ problemTitle, problemId, onSubmit, onClose }: ReviewRubricProps) {
  const [scores, setScores] = useState<Record<RubricDimensionId, number>>(
    Object.fromEntries(DIMENSIONS.map((d) => [d.id, -1])) as Record<RubricDimensionId, number>,
  );
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState<ReviewResult | null>(null);

  function handleScoreChange(dimId: RubricDimensionId, score: number) {
    setScores((prev) => ({ ...prev, [dimId]: score }));
  }

  const allScored = Object.values(scores).every((s) => s >= 0);
  const overallScore = allScored
    ? Object.values(scores).reduce((sum, s) => sum + s, 0) / DIMENSIONS.length
    : 0;

  function generateImprovementPlan(dims: RubricDimension[]): string[] {
    const weak = dims.filter((d) => d.score <= 2).sort((a, b) => a.score - b.score);
    const plans: string[] = [];
    for (const d of weak) {
      switch (d.id) {
        case 'correctness':
          plans.push('Practice writing test cases before coding to catch logic errors early.');
          break;
        case 'time-complexity':
          plans.push('Study pattern-to-complexity mappings. Practice identifying the optimal approach before coding.');
          break;
        case 'space-complexity':
          plans.push('Consider in-place algorithms and whether auxiliary data structures are necessary.');
          break;
        case 'code-quality':
          plans.push('Use descriptive variable names and extract helper functions for repeated logic.');
          break;
        case 'edge-cases':
          plans.push('Build a checklist: empty input, single element, duplicates, negative numbers, overflow.');
          break;
        case 'communication':
          plans.push('Practice thinking aloud: state your approach, trade-offs, and complexity before coding.');
          break;
      }
    }
    if (plans.length === 0) {
      plans.push('Great work! Focus on speed and consistency to maintain this level.');
    }
    return plans;
  }

  function handleSubmit() {
    const dimensions: RubricDimension[] = DIMENSIONS.map((d) => ({
      id: d.id,
      label: d.label,
      description: d.description,
      score: scores[d.id],
      maxScore: 4 as const,
    }));

    const review: ReviewResult = {
      id: generateId(),
      problemId,
      problemTitle,
      dimensions,
      overallScore,
      feedback,
      improvementPlan: generateImprovementPlan(dimensions),
      createdAt: new Date().toISOString(),
    };

    setSubmitted(review);
    onSubmit(review);
  }

  // Show results view after submission
  if (submitted) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">Review Complete</span>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="modal-body">
            {/* Overall score */}
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
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{submitted.problemTitle}</div>
            </div>

            {/* Dimension scores */}
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

            {/* Improvement plan */}
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
          <span className="modal-title">Code Review Rubric</span>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Score your solution for <strong style={{ color: 'var(--text-bright)' }}>{problemTitle}</strong> on each dimension.
          </div>

          {DIMENSIONS.map((dim) => (
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

          {/* Feedback textarea */}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Additional Notes (optional)
            </label>
            <textarea
              className="input textarea"
              placeholder="What went well? What could improve?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ minHeight: 60, fontSize: 12 }}
            />
          </div>

          {/* Overall preview */}
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
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

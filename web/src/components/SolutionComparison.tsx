import { useState } from 'react';
import { GitCompare, Zap, Clock, HardDrive, AlertTriangle, CheckCircle, TrendingUp, X } from 'lucide-react';

export interface SolutionApproach {
  name: string;              // e.g., "Brute Force", "Two Pointer"
  pattern: string;           // e.g., "Nested Loops", "Sliding Window"
  timeComplexity: string;    // e.g., "O(n\u00B2)"
  spaceComplexity: string;   // e.g., "O(1)"
  description: string;       // Brief explanation
  pros: string[];
  cons: string[];
  code?: string;             // Optional code snippet
}

export interface ComparisonResult {
  problemTitle: string;
  userApproach: SolutionApproach;
  optimalApproach: SolutionApproach;
  isOptimal: boolean;
  missedOptimizations: string[];
  missedEdgeCases: string[];
  patternInsight: string;     // "You used brute force; optimal uses Sliding Window"
  improvementTips: string[];
}

interface SolutionComparisonProps {
  comparison: ComparisonResult;
  onClose: () => void;
}

type ActiveTab = 'overview' | 'code';

function getOverallGrade(comparison: ComparisonResult): { label: string; color: string } {
  if (comparison.isOptimal && comparison.missedEdgeCases.length === 0 && comparison.missedOptimizations.length === 0) {
    return { label: 'Optimal', color: 'var(--neon-lime)' };
  }
  if (comparison.isOptimal) {
    return { label: 'Good', color: 'var(--neon-cyan)' };
  }
  if (comparison.missedOptimizations.length <= 1 && comparison.missedEdgeCases.length <= 1) {
    return { label: 'Good', color: 'var(--neon-amber)' };
  }
  return { label: 'Needs Improvement', color: 'var(--neon-red)' };
}

function ComplexityBar({ label, userValue, optimalValue, icon }: {
  label: string;
  userValue: string;
  optimalValue: string;
  icon: React.ReactNode;
}) {
  const isMatch = userValue === optimalValue;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Your Solution</div>
          <div style={{
            padding: '6px 12px',
            background: isMatch ? 'var(--neon-lime-subtle)' : 'var(--neon-amber-subtle)',
            border: `1px solid ${isMatch ? 'rgba(163, 255, 0, 0.2)' : 'rgba(255, 170, 0, 0.2)'}`,
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            color: isMatch ? 'var(--neon-lime)' : 'var(--neon-amber)',
            textAlign: 'center' as const,
          }}>
            {userValue}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Optimal</div>
          <div style={{
            padding: '6px 12px',
            background: 'var(--neon-lime-subtle)',
            border: '1px solid rgba(163, 255, 0, 0.2)',
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--neon-lime)',
            textAlign: 'center' as const,
          }}>
            {optimalValue}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApproachCard({ approach, label, variant }: {
  approach: SolutionApproach;
  label: string;
  variant: 'user' | 'optimal';
}) {
  const accentColor = variant === 'optimal' ? 'var(--neon-lime)' : 'var(--neon-cyan)';
  const accentSubtle = variant === 'optimal' ? 'var(--neon-lime-subtle)' : 'var(--neon-cyan-subtle)';
  const borderAccent = variant === 'optimal' ? 'rgba(163, 255, 0, 0.2)' : 'rgba(0, 240, 255, 0.2)';

  return (
    <div className="card" style={{ flex: 1, minWidth: 0, borderColor: borderAccent }}>
      <div className="card-header" style={{ marginBottom: 12, paddingBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4 }}>
            {label}
          </div>
          <div className="card-title" style={{ fontSize: 15 }}>{approach.name}</div>
        </div>
        <span className="badge" style={{
          background: accentSubtle,
          color: accentColor,
          border: `1px solid ${borderAccent}`,
        }}>
          {approach.pattern}
        </span>
      </div>
      <div className="card-body">
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          {approach.description}
        </div>

        {/* Complexity indicators */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'var(--bg-elevated)',
            borderRadius: 6,
            border: '1px solid var(--border-subtle)',
          }}>
            <Clock size={12} color="var(--neon-cyan)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: accentColor, marginLeft: 'auto' }}>
              {approach.timeComplexity}
            </span>
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'var(--bg-elevated)',
            borderRadius: 6,
            border: '1px solid var(--border-subtle)',
          }}>
            <HardDrive size={12} color="var(--neon-purple)" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Space</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: accentColor, marginLeft: 'auto' }}>
              {approach.spaceComplexity}
            </span>
          </div>
        </div>

        {/* Pros */}
        {approach.pros.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--neon-lime)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={10} /> Pros
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {approach.pros.map((pro, i) => (
                <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, lineHeight: 1.5 }}>{pro}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {approach.cons.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--neon-amber)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={10} /> Cons
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {approach.cons.map((con, i) => (
                <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, lineHeight: 1.5 }}>{con}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SolutionComparison({ comparison, onClose }: SolutionComparisonProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const grade = getOverallGrade(comparison);
  const hasMissedItems = comparison.missedEdgeCases.length > 0 || comparison.missedOptimizations.length > 0;
  const hasCode = comparison.userApproach.code || comparison.optimalApproach.code;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 780, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--neon-cyan-subtle), var(--neon-purple-subtle))',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GitCompare size={18} color="var(--neon-cyan)" />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: 16, display: 'block' }}>Solution Analysis</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{comparison.problemTitle}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {/* Pattern Insight Banner */}
          <div style={{
            padding: '12px 20px',
            background: comparison.isOptimal ? 'var(--neon-lime-subtle)' : 'var(--neon-amber-subtle)',
            borderBottom: `1px solid ${comparison.isOptimal ? 'rgba(163, 255, 0, 0.15)' : 'rgba(255, 170, 0, 0.15)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={16} color={comparison.isOptimal ? 'var(--neon-lime)' : 'var(--neon-amber)'} />
              <span style={{ fontSize: 13, color: comparison.isOptimal ? 'var(--neon-lime)' : 'var(--neon-amber)', fontWeight: 600 }}>
                {comparison.patternInsight}
              </span>
            </div>
            {/* Score badge */}
            <span className="badge" style={{
              background: comparison.isOptimal ? 'var(--neon-lime-subtle)' : grade.color === 'var(--neon-red)' ? 'var(--neon-red-subtle)' : 'var(--neon-amber-subtle)',
              color: grade.color,
              border: `1px solid ${comparison.isOptimal ? 'rgba(163, 255, 0, 0.3)' : grade.color === 'var(--neon-red)' ? 'rgba(255, 51, 102, 0.3)' : 'rgba(255, 170, 0, 0.3)'}`,
              fontSize: 11,
              fontWeight: 700,
            }}>
              {grade.label}
            </span>
          </div>

          {/* Tabs for overview vs code */}
          {hasCode && (
            <div style={{
              display: 'flex',
              gap: 4,
              padding: '8px 20px',
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
            }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeTab === 'overview' ? 'var(--text-bright)' : 'var(--text-muted)',
                  background: activeTab === 'overview' ? 'var(--bg-surface)' : 'transparent',
                  border: `1px solid ${activeTab === 'overview' ? 'var(--border-default)' : 'transparent'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeTab === 'code' ? 'var(--text-bright)' : 'var(--text-muted)',
                  background: activeTab === 'code' ? 'var(--bg-surface)' : 'transparent',
                  border: `1px solid ${activeTab === 'code' ? 'var(--border-default)' : 'transparent'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Code Diff
              </button>
            </div>
          )}

          <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(90vh - 220px)' }}>
            {activeTab === 'overview' ? (
              <>
                {/* Side-by-side Approach Cards */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <ApproachCard
                    approach={comparison.userApproach}
                    label="Your Approach"
                    variant="user"
                  />
                  <ApproachCard
                    approach={comparison.optimalApproach}
                    label="Optimal Approach"
                    variant="optimal"
                  />
                </div>

                {/* Complexity Comparison */}
                <div style={{
                  padding: 16,
                  background: 'var(--bg-elevated)',
                  borderRadius: 10,
                  border: '1px solid var(--border-default)',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
                    Complexity Comparison
                  </div>
                  <ComplexityBar
                    label="Time Complexity"
                    userValue={comparison.userApproach.timeComplexity}
                    optimalValue={comparison.optimalApproach.timeComplexity}
                    icon={<Clock size={13} color="var(--neon-cyan)" />}
                  />
                  <ComplexityBar
                    label="Space Complexity"
                    userValue={comparison.userApproach.spaceComplexity}
                    optimalValue={comparison.optimalApproach.spaceComplexity}
                    icon={<HardDrive size={13} color="var(--neon-purple)" />}
                  />
                </div>

                {/* Missed Items Section */}
                {hasMissedItems && (
                  <div style={{
                    padding: 16,
                    background: 'var(--neon-amber-subtle)',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 170, 0, 0.15)',
                    marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <AlertTriangle size={14} color="var(--neon-amber)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--neon-amber)' }}>What You Missed</span>
                    </div>

                    {comparison.missedEdgeCases.length > 0 && (
                      <div style={{ marginBottom: comparison.missedOptimizations.length > 0 ? 12 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>
                          Edge Cases
                        </div>
                        {comparison.missedEdgeCases.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '6px 10px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 6,
                            marginBottom: 4,
                          }}>
                            <AlertTriangle size={11} color="var(--neon-amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {comparison.missedOptimizations.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 }}>
                          Optimizations
                        </div>
                        {comparison.missedOptimizations.map((item, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            padding: '6px 10px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 6,
                            marginBottom: 4,
                          }}>
                            <Zap size={11} color="var(--neon-amber)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Improvement Tips */}
                {comparison.improvementTips.length > 0 && (
                  <div style={{
                    padding: 16,
                    background: 'var(--bg-elevated)',
                    borderRadius: 10,
                    border: '1px solid var(--border-default)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <TrendingUp size={14} color="var(--neon-cyan)" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>Improvement Tips</span>
                    </div>
                    {comparison.improvementTips.map((tip, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        marginBottom: i < comparison.improvementTips.length - 1 ? 8 : 0,
                      }}>
                        <span style={{
                          flexShrink: 0,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--neon-cyan-subtle)',
                          border: '1px solid rgba(0, 240, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--neon-cyan)',
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Code Diff Tab */
              <div style={{ display: 'flex', gap: 16 }}>
                {comparison.userApproach.code && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>
                      Your Code
                    </div>
                    <div className="code-block">
                      <div className="code-block-header">
                        <span className="code-block-language">TypeScript</span>
                      </div>
                      <pre style={{ margin: 0, padding: 16, overflowX: 'auto' }}>
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: 'var(--text-primary)',
                        }}>
                          {comparison.userApproach.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
                {comparison.optimalApproach.code && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>
                      Optimal Code
                    </div>
                    <div className="code-block" style={{ borderColor: 'rgba(163, 255, 0, 0.2)' }}>
                      <div className="code-block-header">
                        <span className="code-block-language">TypeScript</span>
                        <span style={{ fontSize: 10, color: 'var(--neon-lime)', fontWeight: 600 }}>OPTIMAL</span>
                      </div>
                      <pre style={{ margin: 0, padding: 16, overflowX: 'auto' }}>
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: 'var(--text-primary)',
                        }}>
                          {comparison.optimalApproach.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assessment:</span>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: grade.color,
              fontFamily: 'var(--font-mono)',
            }}>
              {grade.label}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

interface LandingProps {
  onEnterApp: () => void;
}

const FEATURES = [
  {
    icon: 'psychology',
    title: 'AI Senior Engineer Coach',
    desc: 'Real-time Socratic teaching that adapts to your level. Not hints — actual coaching that builds problem-solving instincts.',
    color: 'var(--neon-cyan)',
  },
  {
    icon: 'code',
    title: '77+ Curated Problems',
    desc: 'Blind 75 + NeetCode essentials with pattern tagging, difficulty progression, and starter code.',
    color: 'var(--neon-lime)',
  },
  {
    icon: 'architecture',
    title: '20 System Design Problems',
    desc: 'Structured 7-phase workspace for URL Shortener to Google Maps. API design, data modeling, scaling — all coached.',
    color: 'var(--neon-magenta)',
  },
  {
    icon: 'record_voice_over',
    title: '100+ Behavioral Questions',
    desc: 'STAR method coach with Amazon LP mapping, company-specific prep, and AI-scored responses.',
    color: 'var(--neon-amber)',
  },
  {
    icon: 'trending_up',
    title: 'Adaptive Recommendations',
    desc: 'Spaced repetition for mistakes. Weak pattern detection. Every next problem is the one you need most.',
    color: 'var(--neon-purple)',
  },
  {
    icon: 'timer',
    title: '5-Stage Mock Interviews',
    desc: 'Phone screen, technical coding, system design, behavioral, and technical Q&A — timed and scored.',
    color: 'var(--neon-red)',
  },
];

const COMPARISONS = [
  { platform: 'LeetCode', problems: '2,500+', ai: 'None', coaching: 'None', systemDesign: 'None', behavioral: 'None', price: '$35/mo' },
  { platform: 'AlgoExpert', problems: '200', ai: 'None', coaching: 'Video only', systemDesign: 'Separate $', behavioral: 'Separate $', price: '$99/yr' },
  { platform: 'NeetCode', problems: '150', ai: 'None', coaching: 'Video only', systemDesign: 'Basic', behavioral: 'None', price: 'Free' },
  { platform: 'Interviewing.io', problems: 'N/A', ai: 'None', coaching: 'Human (1hr)', systemDesign: '$225/session', behavioral: '$225/session', price: '$225/hr' },
  { platform: 'Senior Mentor', problems: '77+', ai: 'Real-time AI', coaching: 'Socratic AI', systemDesign: 'Included', behavioral: 'Included', price: 'Free / $19mo' },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: 'var(--text-muted)',
    features: [
      '5 problems per day',
      '3 AI messages per problem',
      'Basic progress tracking',
      'Blind 75 problem list',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$19',
    period: '/month',
    color: 'var(--neon-cyan)',
    features: [
      'Unlimited problems & AI',
      'All learning paths',
      'Unlimited mock interviews',
      'Spaced repetition tracker',
      'System design workspace',
      'Behavioral coach',
      'Priority AI speed',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    color: 'var(--neon-magenta)',
    features: [
      'Everything in Premium',
      'Company-specific prep',
      'Advanced analytics',
      'AI resume review',
      'Weekly progress reports',
      'Early access to features',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
];

export default function Landing({ onEnterApp }: LandingProps) {
  const [activeTab, setActiveTab] = useState<'features' | 'compare' | 'pricing'>('features');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      overflowY: 'auto',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        background: 'var(--glass-surface)',
        backdropFilter: `blur(${('var(--glass-blur)')})`,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--neon-cyan)', fontSize: 24 }}>terminal</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--text-bright)' }}>
            Senior<span style={{ color: 'var(--neon-cyan)' }}>Mentor</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {(['features', 'compare', 'pricing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                textTransform: 'capitalize',
                padding: '4px 0',
                borderBottom: activeTab === tab ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
          <button className="btn btn-primary btn-sm" onClick={onEnterApp}>
            Open App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: '80px 32px 60px',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 20,
          background: 'var(--neon-cyan-subtle)',
          border: '1px solid var(--neon-cyan-dim)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--neon-cyan)',
          marginBottom: 24,
          letterSpacing: '0.05em',
        }}>
          AI-POWERED INTERVIEW COACHING
        </div>
        <h1 style={{
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.1,
          margin: '0 0 20px',
          color: 'var(--text-bright)',
          fontFamily: 'var(--font-sans)',
        }}>
          Stop memorizing.{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Start thinking.
          </span>
        </h1>
        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 36px',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          An AI senior engineer that coaches you through coding interviews in real-time.
          Socratic teaching, pattern recognition, and adaptive practice — not just answer keys.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary btn-glow-pulse"
            onClick={onEnterApp}
            style={{ padding: '12px 32px', fontSize: 16 }}
          >
            Start Practicing Free
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          No signup required. Start solving immediately.
        </div>
      </section>

      {/* Content based on tab */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px' }}>

        {/* Features */}
        {activeTab === 'features' && (
          <section>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}>
              {FEATURES.map((f) => (
                <div key={f.title} className="card" style={{
                  borderColor: 'var(--border-default)',
                  transition: 'border-color 0.2s',
                }}>
                  <div className="card-body" style={{ padding: '24px' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `color-mix(in srgb, ${f.color} 15%, transparent)`,
                      marginBottom: 16,
                    }}>
                      <span className="material-symbols-outlined" style={{ color: f.color, fontSize: 22 }}>{f.icon}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 40 }}>
                How it works
              </h2>
              <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { step: '1', title: 'Pick a problem', desc: 'Or let AI recommend based on your weaknesses' },
                  { step: '2', title: 'Think & code', desc: 'AI coaches you with hints, not answers' },
                  { step: '3', title: 'Get reviewed', desc: '6-dimension rubric scoring with improvement plan' },
                  { step: '4', title: 'Track & repeat', desc: 'Spaced repetition ensures you remember patterns' },
                ].map((s) => (
                  <div key={s.step} style={{ textAlign: 'center', maxWidth: 200 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--neon-cyan)',
                      color: 'var(--bg-void)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 20,
                      margin: '0 auto 12px',
                    }}>{s.step}</div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>{s.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comparison */}
        {activeTab === 'compare' && (
          <section>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)', textAlign: 'center', marginBottom: 32 }}>
              Why Senior Mentor wins
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
              }}>
                <thead>
                  <tr>
                    {['Platform', 'Problems', 'AI Coaching', 'Live Coaching', 'System Design', 'Behavioral', 'Price'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--border-default)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISONS.map((row) => {
                    const isUs = row.platform === 'Senior Mentor';
                    return (
                      <tr key={row.platform} style={{
                        background: isUs ? 'var(--neon-cyan-subtle)' : 'transparent',
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          fontWeight: isUs ? 700 : 500,
                          color: isUs ? 'var(--neon-cyan)' : 'var(--text-primary)',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}>{row.platform}</td>
                        {[row.problems, row.ai, row.coaching, row.systemDesign, row.behavioral, row.price].map((val, i) => (
                          <td key={i} style={{
                            padding: '12px 16px',
                            color: val === 'None' ? 'var(--text-muted)' : isUs ? 'var(--text-bright)' : 'var(--text-secondary)',
                            borderBottom: '1px solid var(--border-subtle)',
                          }}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pricing */}
        {activeTab === 'pricing' && (
          <section>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)', textAlign: 'center', marginBottom: 8 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 40 }}>
              Start free. Upgrade when you're ready to go all-in.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
              maxWidth: 960,
              margin: '0 auto',
            }}>
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="card"
                  style={{
                    borderColor: tier.popular ? tier.color : 'var(--border-default)',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {tier.popular && (
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: tier.color,
                      color: 'var(--bg-void)',
                      padding: '2px 12px',
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div className="card-body" style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: tier.color, marginBottom: 8 }}>{tier.name}</h3>
                    <div style={{ marginBottom: 24 }}>
                      <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--text-bright)' }}>{tier.price}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tier.period}</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' }}>
                      {tier.features.map((f) => (
                        <li key={f} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 0',
                          fontSize: 13,
                          color: 'var(--text-secondary)',
                        }}>
                          <span className="material-symbols-outlined" style={{ color: 'var(--neon-lime)', fontSize: 16 }}>check</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`btn ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={onEnterApp}
                      style={{ width: '100%' }}
                    >
                      {tier.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
              7-day free trial on all paid plans. Cancel anytime. Save 35% with annual billing.
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}>
        Built for engineers who refuse to memorize. Powered by Claude.
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import type {
  Difficulty,
  InterviewStage,
  SystemDesignTopicId,
  TechnicalFormat,
  TechnicalQuestionCategory,
  TopicName,
} from '../../types';

interface InterviewLauncherProps {
  open: boolean;
  onClose: () => void;
  onStart: (config: {
    stage: InterviewStage;
    format?: TechnicalFormat;
    topic?: TopicName;
    difficulty?: Difficulty;
    category?: TechnicalQuestionCategory;
    systemDesignTopic?: SystemDesignTopicId;
    customSystemDesignPrompt?: string;
  }) => void;
}

const stages: {
  id: InterviewStage;
  icon: string;
  title: string;
  desc: string;
}[] = [
  { id: 'technical', icon: 'terminal', title: 'Technical Coding', desc: 'DSA, algorithms, and problem-solving skills.' },
  { id: 'phone', icon: 'call', title: 'Phone Screen', desc: 'Initial vibe check and basic trivia questions.' },
  { id: 'system-design', icon: 'architecture', title: 'System Design', desc: 'High-level architecture and scalability.' },
  { id: 'behavioral', icon: 'person_search', title: 'Behavioral', desc: 'STAR method practice and soft skills.' },
  { id: 'technical-questions', icon: 'menu_book', title: 'Technical Q&A', desc: 'Conceptual & knowledge-based Q&A.' },
];

const formats: { id: TechnicalFormat; icon: string; title: string; desc: string; duration: string }[] = [
  { id: 'leetcode', icon: 'code', title: 'LeetCode Style', desc: 'Standard algorithmic challenges', duration: '15-45 mins' },
  { id: 'project', icon: 'deployed_code', title: 'Project-Based', desc: 'Real-world feature implementation', duration: '45-60 mins' },
];

const questionCategories: { id: TechnicalQuestionCategory; label: string }[] = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'javascript-typescript', label: 'JS / TS Core' },
  { id: 'react-frontend', label: 'React / Frontend' },
  { id: 'web-performance', label: 'Web Performance' },
  { id: 'apis-backend', label: 'APIs & Backend' },
  { id: 'databases', label: 'Databases' },
  { id: 'distributed-systems', label: 'Distributed Systems' },
  { id: 'security', label: 'Security' },
  { id: 'testing-quality', label: 'Testing & Quality' },
  { id: 'behavioral-leadership', label: 'Leadership' },
  { id: 'product-thinking', label: 'Product Thinking' },
];

const systemDesignProblems: { id: SystemDesignTopicId; icon: string; title: string; desc: string }[] = [
  { id: 'url-shortener', icon: 'link', title: 'URL Shortener', desc: 'Design a service like bit.ly — encoding, redirection, analytics.' },
  { id: 'twitter-timeline', icon: 'dynamic_feed', title: 'Social Media Feed', desc: 'Design Twitter\'s home timeline — fan-out, ranking, caching.' },
  { id: 'notification-system', icon: 'notifications', title: 'Notification System', desc: 'Multi-channel notifications — push, email, SMS, prioritization.' },
  { id: 'rate-limiter', icon: 'speed', title: 'Rate Limiter', desc: 'Distributed rate limiting — token bucket, sliding window, Redis.' },
  { id: 'file-storage', icon: 'cloud_upload', title: 'File Storage', desc: 'Design Dropbox/Google Drive — upload, sync, chunking, dedup.' },
  { id: 'chat-application', icon: 'chat', title: 'Real-Time Chat', desc: 'Design WhatsApp/Slack — WebSockets, presence, message delivery.' },
  { id: 'custom', icon: 'edit_note', title: 'Custom Topic', desc: 'Enter your own system design challenge.' },
];

const topics: { id: TopicName; label: string }[] = [
  { id: 'Arrays', label: 'Arrays & Hashing' },
  { id: 'Two Pointers', label: 'Two Pointers' },
  { id: 'Stack/Queue', label: 'Stack / Queue' },
  { id: 'Binary Search', label: 'Binary Search' },
  { id: 'Sliding Window', label: 'Sliding Window' },
  { id: 'Strings', label: 'Strings' },
  { id: 'Trees', label: 'Trees' },
  { id: 'Backtracking', label: 'Backtracking' },
  { id: 'Heap', label: 'Heap' },
  { id: 'Greedy', label: 'Greedy' },
  { id: 'Graphs', label: 'Graphs' },
  { id: 'Dynamic Programming', label: 'Dynamic Programming' },
];

const difficulties: { id: Difficulty; color: string }[] = [
  { id: 'Easy', color: 'var(--neon-lime)' },
  { id: 'Medium', color: 'var(--neon-amber)' },
  { id: 'Hard', color: 'var(--neon-red)' },
];

function getEstimatedDuration(stage: InterviewStage | null, format: TechnicalFormat | null): string {
  if (!stage) return '~45 Minutes';
  if (stage === 'technical') {
    if (format === 'project') return '~60 Minutes';
    return '~45 Minutes';
  }
  if (stage === 'system-design') return '~45 Minutes';
  return '~30 Minutes';
}

export default function InterviewLauncher({ open, onClose, onStart }: InterviewLauncherProps) {
  const [stage, setStage] = useState<InterviewStage | null>(null);
  const [format, setFormat] = useState<TechnicalFormat | null>(null);
  const [topic, setTopic] = useState<TopicName | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [category, setCategory] = useState<TechnicalQuestionCategory | null>(null);
  const [sdTopic, setSdTopic] = useState<SystemDesignTopicId | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  if (!open) return null;

  function reset() {
    setStage(null);
    setFormat(null);
    setTopic(null);
    setDifficulty(null);
    setCategory(null);
    setSdTopic(null);
    setCustomPrompt('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleStageSelect(s: InterviewStage) {
    setStage(s);
    setFormat(null);
    setTopic(null);
    setDifficulty(null);
    setCategory(null);
    setSdTopic(null);
    setCustomPrompt('');
  }

  function handleFormatSelect(f: TechnicalFormat) {
    setFormat(f);
    setTopic(null);
    setDifficulty(null);
  }

  function canStart(): boolean {
    if (!stage) return false;
    if (stage === 'technical-questions') return !!category;
    if (stage === 'system-design') {
      if (!sdTopic) return false;
      if (sdTopic === 'custom') return customPrompt.trim().length > 0;
      return true;
    }
    if (stage !== 'technical') return true;
    if (!format) return false;
    if (format === 'project') return true;
    return !!(topic && difficulty);
  }

  function handleStart() {
    if (!stage || !canStart()) return;
    onStart({
      stage,
      format: format ?? undefined,
      topic: topic ?? undefined,
      difficulty: difficulty ?? undefined,
      category: category ?? undefined,
      systemDesignTopic: sdTopic ?? undefined,
      customSystemDesignPrompt: sdTopic === 'custom' ? customPrompt.trim() : undefined,
    });
    handleClose();
  }

  // Determine which sections are active
  const showFormatSection = stage === 'technical';
  const showCategorySection = stage === 'technical-questions';
  const showSystemDesignSection = stage === 'system-design';
  const showTopicSection = stage === 'technical' && format === 'leetcode';
  const section2Active = stage === 'technical' || stage === 'technical-questions' || stage === 'system-design';
  const section3Active = showTopicSection;

  // Breadcrumb state
  const breadcrumbStep = !stage
    ? 1
    : !section2Active || (section2Active && !format && !category && !sdTopic)
      ? 1
      : !section3Active || (section3Active && !format)
        ? 2
        : 3;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Configure New Session</div>
            <div className="topnav-breadcrumb" style={{ marginTop: 4 }}>
              <span className={`topnav-breadcrumb-item ${breadcrumbStep >= 1 ? 'topnav-breadcrumb-current' : ''}`}>
                Type
              </span>
              <span className="topnav-breadcrumb-sep">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
              </span>
              <span className={`topnav-breadcrumb-item ${breadcrumbStep >= 2 ? 'topnav-breadcrumb-current' : ''}`}>
                {showSystemDesignSection ? 'Problem' : 'Format'}
              </span>
              <span className="topnav-breadcrumb-sep">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
              </span>
              <span className={`topnav-breadcrumb-item ${breadcrumbStep >= 3 ? 'topnav-breadcrumb-current' : ''}`}>
                Settings
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Section 1: Select Interview Stage */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="progress-step-indicator" style={{ background: 'var(--neon-cyan)', color: 'var(--bg-void)' }}>1</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>Select Interview Stage</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {stages.map((s, i) => (
                <div
                  key={s.id}
                  className={`card card-interactive ${stage === s.id ? 'card-hover-lift' : ''} stagger-enter stagger-${i + 1}`}
                  onClick={() => handleStageSelect(s.id)}
                  style={{
                    position: 'relative',
                    borderColor: stage === s.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                    background: stage === s.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                  }}
                >
                  {stage === s.id && (
                    <span className="material-symbols-outlined" style={{ position: 'absolute', top: 8, right: 8, color: 'var(--neon-cyan)', fontSize: 18 }}>check_circle</span>
                  )}
                  <div style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: stage === s.id ? 'var(--neon-cyan)' : 'var(--bg-overlay)',
                    color: stage === s.id ? 'var(--bg-void)' : 'var(--text-muted)',
                    marginBottom: 12,
                  }}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Format / Category / System Design Problem */}
          {(showFormatSection || showCategorySection || showSystemDesignSection) && (
            <>
              <div className="divider" />
              <div style={{ marginBottom: 24, opacity: section2Active ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="progress-step-indicator" style={{ background: section2Active ? 'var(--neon-cyan)' : 'var(--bg-overlay)', color: section2Active ? 'var(--bg-void)' : 'var(--text-muted)' }}>2</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
                    {showCategorySection ? 'Question Category' : showSystemDesignSection ? 'Choose Design Problem' : 'Coding Format'}
                  </div>
                </div>

                {showFormatSection && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {formats.map((f) => (
                      <div
                        key={f.id}
                        className="card card-interactive"
                        onClick={() => handleFormatSelect(f.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          borderColor: format === f.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                          background: format === f.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                        }}
                      >
                        <div style={{
                          width: 44,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          background: format === f.id ? 'var(--neon-cyan)' : 'var(--bg-overlay)',
                          color: format === f.id ? 'var(--bg-void)' : 'var(--text-muted)',
                        }}>
                          <span className="material-symbols-outlined">{f.icon}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 2 }}>{f.title}</h4>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{f.desc} ({f.duration}).</p>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: format === f.id ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
                          {format === f.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {showCategorySection && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {questionCategories.map((c) => (
                      <button
                        key={c.id}
                        className={`btn ${category === c.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setCategory(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {showSystemDesignSection && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                      {systemDesignProblems.map((p) => (
                        <div
                          key={p.id}
                          className="card card-interactive"
                          onClick={() => {
                            setSdTopic(p.id);
                            if (p.id !== 'custom') setCustomPrompt('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            borderColor: sdTopic === p.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                            background: sdTopic === p.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                          }}
                        >
                          <div style={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            background: sdTopic === p.id ? 'var(--neon-cyan)' : 'var(--bg-overlay)',
                            color: sdTopic === p.id ? 'var(--bg-void)' : 'var(--text-muted)',
                            flexShrink: 0,
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{p.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 2 }}>{p.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.desc}</div>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: sdTopic === p.id ? 'var(--neon-cyan)' : 'var(--text-muted)', fontSize: 18 }}>
                            {sdTopic === p.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {sdTopic === 'custom' && (
                      <div style={{ marginTop: 16 }}>
                        <textarea
                          className="input input-mono textarea"
                          placeholder="Describe your system design challenge, e.g. 'Design a ride-sharing service like Uber' or 'Design a video streaming platform like YouTube'..."
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* Section 3: Topic & Difficulty (technical leetcode only) */}
          {showTopicSection && (
            <>
              <div className="divider" />
              <div style={{ marginBottom: 24, opacity: section3Active ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="progress-step-indicator" style={{ background: section3Active ? 'var(--neon-cyan)' : 'var(--bg-overlay)', color: section3Active ? 'var(--bg-void)' : 'var(--text-muted)' }}>3</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>Topic & Difficulty</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Focus Areas</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {topics.map((t) => (
                        <button
                          key={t.id}
                          className={`btn ${topic === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => setTopic(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Target Difficulty</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {difficulties.map((d) => (
                        <button
                          key={d.id}
                          className={`btn ${difficulty === d.id ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setDifficulty(d.id)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                        >
                          <span>{d.id}</span>
                          <span className={`badge badge-${d.id.toLowerCase()}`} style={{ minWidth: 8, height: 8, padding: 0, borderRadius: '50%' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div>
            {stage && (
              <button className="btn btn-ghost" onClick={() => { reset(); }}>
                <ArrowLeft size={14} />
                Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {stage && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated duration</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{getEstimatedDuration(stage, format)}</div>
              </div>
            )}
            <button
              className="btn btn-primary btn-glow-pulse"
              disabled={!canStart()}
              onClick={handleStart}
            >
              Start Interview
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

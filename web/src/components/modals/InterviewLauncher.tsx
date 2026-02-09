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
  { id: 'Easy', color: 'var(--accent-green)' },
  { id: 'Medium', color: '#eab308' },
  { id: 'Hard', color: '#f43f5e' },
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal launcher-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <div>
            <div className="modal__title">Configure New Session</div>
            <div className="modal__breadcrumb">
              <span className={`modal__breadcrumb-item ${breadcrumbStep >= 1 ? 'modal__breadcrumb-item--active' : ''}`}>
                Type
              </span>
              <span className="modal__breadcrumb-sep">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
              </span>
              <span className={`modal__breadcrumb-item ${breadcrumbStep >= 2 ? 'modal__breadcrumb-item--active' : ''}`}>
                {showSystemDesignSection ? 'Problem' : 'Format'}
              </span>
              <span className="modal__breadcrumb-sep">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
              </span>
              <span className={`modal__breadcrumb-item ${breadcrumbStep >= 3 ? 'modal__breadcrumb-item--active' : ''}`}>
                Settings
              </span>
            </div>
          </div>
          <button className="modal__close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Section 1: Select Interview Stage */}
          <div className="modal-section">
            <div className="modal-section__header">
              <div className="modal-section__number modal-section__number--active">1</div>
              <div className="modal-section__title">Select Interview Stage</div>
            </div>
            <div className="stage-grid">
              {stages.map((s) => (
                <div
                  key={s.id}
                  className={`stage-card ${stage === s.id ? 'stage-card--selected' : ''}`}
                  onClick={() => handleStageSelect(s.id)}
                >
                  {stage === s.id && (
                    <span className="stage-card__check material-symbols-outlined">check_circle</span>
                  )}
                  <div className={`stage-card__icon-wrap ${stage === s.id ? 'stage-card__icon-wrap--active' : 'stage-card__icon-wrap--default'}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div className="stage-card__title">{s.title}</div>
                  <div className="stage-card__desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Format / Category / System Design Problem */}
          {(showFormatSection || showCategorySection || showSystemDesignSection) && (
            <>
              <div className="modal-divider" />
              <div className={`modal-section ${section2Active ? '' : 'modal-section--inactive'}`}>
                <div className="modal-section__header">
                  <div className={`modal-section__number ${section2Active ? 'modal-section__number--active' : 'modal-section__number--inactive'}`}>2</div>
                  <div className="modal-section__title">
                    {showCategorySection ? 'Question Category' : showSystemDesignSection ? 'Choose Design Problem' : 'Coding Format'}
                  </div>
                </div>

                {showFormatSection && (
                  <div className="format-grid">
                    {formats.map((f) => (
                      <div
                        key={f.id}
                        className={`format-card ${format === f.id ? 'format-card--selected' : ''}`}
                        onClick={() => handleFormatSelect(f.id)}
                      >
                        <div className={`format-card__icon ${format === f.id ? 'format-card__icon--active' : 'format-card__icon--default'}`}>
                          <span className="material-symbols-outlined">{f.icon}</span>
                        </div>
                        <div className="format-card__text">
                          <h4>{f.title}</h4>
                          <p>{f.desc} ({f.duration}).</p>
                        </div>
                        <div className="format-card__radio">
                          <span className="material-symbols-outlined">
                            {format === f.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showCategorySection && (
                  <div className="topic-grid">
                    {questionCategories.map((c) => (
                      <button
                        key={c.id}
                        className={`topic-chip ${category === c.id ? 'topic-chip--selected' : ''}`}
                        onClick={() => setCategory(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}

                {showSystemDesignSection && (
                  <>
                    <div className="sd-problem-grid">
                      {systemDesignProblems.map((p) => (
                        <div
                          key={p.id}
                          className={`sd-problem-card ${sdTopic === p.id ? 'sd-problem-card--selected' : ''}`}
                          onClick={() => {
                            setSdTopic(p.id);
                            if (p.id !== 'custom') setCustomPrompt('');
                          }}
                        >
                          <div className={`sd-problem-card__icon ${sdTopic === p.id ? 'sd-problem-card__icon--active' : ''}`}>
                            <span className="material-symbols-outlined">{p.icon}</span>
                          </div>
                          <div className="sd-problem-card__text">
                            <div className="sd-problem-card__title">{p.title}</div>
                            <div className="sd-problem-card__desc">{p.desc}</div>
                          </div>
                          <div className="sd-problem-card__radio">
                            <span className="material-symbols-outlined">
                              {sdTopic === p.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {sdTopic === 'custom' && (
                      <div className="sd-custom-input">
                        <textarea
                          className="sd-custom-input__field"
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
              <div className="modal-divider" />
              <div className={`modal-section ${section3Active ? '' : 'modal-section--inactive'}`}>
                <div className="modal-section__header">
                  <div className={`modal-section__number ${section3Active ? 'modal-section__number--active' : 'modal-section__number--inactive'}`}>3</div>
                  <div className="modal-section__title">Topic & Difficulty</div>
                </div>

                <div className="topic-difficulty-grid">
                  <div>
                    <div className="section-label">Focus Areas</div>
                    <div className="topic-grid">
                      {topics.map((t) => (
                        <button
                          key={t.id}
                          className={`topic-chip ${topic === t.id ? 'topic-chip--selected' : ''}`}
                          onClick={() => setTopic(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="section-label">Target Difficulty</div>
                    <div className="difficulty-list">
                      {difficulties.map((d) => (
                        <button
                          key={d.id}
                          className={`diff-item ${difficulty === d.id ? 'diff-item--selected' : ''}`}
                          onClick={() => setDifficulty(d.id)}
                        >
                          <span>{d.id}</span>
                          <span className={`diff-dot diff-dot--${d.id.toLowerCase()}`} />
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
        <div className="modal__footer">
          <div>
            {stage && (
              <button className="btn btn--ghost" onClick={() => { reset(); }}>
                <ArrowLeft size={14} />
                Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {stage && (
              <div className="modal__footer-info">
                <div className="modal__footer-info-label">Estimated duration</div>
                <div className="modal__footer-info-value">{getEstimatedDuration(stage, format)}</div>
              </div>
            )}
            <button
              className="btn btn--primary btn--launch"
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

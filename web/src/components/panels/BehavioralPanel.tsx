import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronRight, Filter, Shuffle, X, Star, AlertTriangle, TrendingUp, Save, BookOpen, Trash2, Edit3 } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import {
  behavioralQuestions,
  getRandomQuestion,
  CATEGORY_META,
  COMPANY_META,
  type BehavioralCategory,
  type CompanyTag,
  type SeniorityLevel,
  type BehavioralQuestion,
} from '../../data/behavioral';
import { safeGetItem, safeSetItem } from '../../utils/storage.js';
import { useStarStories, type StarStory } from '../../hooks/useStarStories';
import StarStoryList from '../behavioral/StarStoryList';
import StarStoryEditor from '../behavioral/StarStoryEditor';
import { detectRedFlags } from '../../utils/behavioralUtils.js';
import { generateId } from '../../utils/statsUtils.js';

interface BehavioralPanelProps {
  onStartQuestion: (question: BehavioralQuestion) => void;
}

type ViewMode = 'browse' | 'practice' | 'scored' | 'stories';

// ── Story Bank types + localStorage helpers ──

interface StoryEntry {
  id: string;
  questionId: string;
  questionText: string;
  category: BehavioralCategory;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: string;
  updatedAt: string;
}

const STORIES_KEY = 'sim-behavioral-stories';

function loadStories(): StoryEntry[] {
  try {
    const raw = safeGetItem(STORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStories(stories: StoryEntry[]): void {
  safeSetItem(STORIES_KEY, JSON.stringify(stories));
}

type CommDimensionId = 'conciseness' | 'impact' | 'technical-depth' | 'self-awareness';

const COMM_DIMENSIONS: { id: CommDimensionId; label: string; description: string }[] = [
  { id: 'conciseness', label: 'Conciseness', description: 'Was the response focused and free of tangents?' },
  { id: 'impact', label: 'Impact', description: 'Were outcomes quantified with concrete metrics?' },
  { id: 'technical-depth', label: 'Technical Depth', description: 'Were technical decisions explained with reasoning?' },
  { id: 'self-awareness', label: 'Self-Awareness', description: 'Were learnings and growth areas acknowledged?' },
];

const COMM_SCORE_LABELS = ['Missing', 'Weak', 'Adequate', 'Strong', 'Excellent'];
const COMM_SCORE_COLORS = ['var(--neon-red)', 'var(--neon-amber)', 'var(--neon-amber)', 'var(--neon-lime)', 'var(--neon-cyan)'];


const LEVEL_LABELS: Record<SeniorityLevel, string> = {
  'new-grad': 'New Grad',
  mid: 'Mid-Level',
  senior: 'Senior',
  staff: 'Staff+',
};

export default function BehavioralPanel({ onStartQuestion }: BehavioralPanelProps) {
  const [view, setView] = useState<ViewMode>('browse');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BehavioralCategory | null>(null);
  const [companyFilter, setCompanyFilter] = useState<CompanyTag | null>(null);
  const [levelFilter, setLevelFilter] = useState<SeniorityLevel | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<BehavioralQuestion | null>(null);

  // STAR form state
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  // Communication scoring state
  const [commScores, setCommScores] = useState<Record<CommDimensionId, number>>(
    Object.fromEntries(COMM_DIMENSIONS.map((d) => [d.id, -1])) as Record<CommDimensionId, number>,
  );

  // Question-tied story bank state
  const [stories, setStories] = useState<StoryEntry[]>(loadStories);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  // Standalone STAR story bank
  const { stories: starStories, addStory, updateStory, deleteStory: deleteStarStory } = useStarStories();
  const [editingStarStory, setEditingStarStory] = useState<StarStory | null | 'new'>(null);

  const categories = useMemo(() => Object.keys(CATEGORY_META) as BehavioralCategory[], []);
  const companies = useMemo(() => Object.keys(COMPANY_META) as CompanyTag[], []);

  const filteredQuestions = useMemo(() => {
    return behavioralQuestions.filter((q) => {
      if (search) {
        const s = search.toLowerCase();
        if (!q.question.toLowerCase().includes(s) && !q.category.includes(s)) return false;
      }
      if (categoryFilter && q.category !== categoryFilter) return false;
      if (companyFilter && !q.companies.includes(companyFilter)) return false;
      if (levelFilter && !q.levels.includes(levelFilter)) return false;
      return true;
    });
  }, [search, categoryFilter, companyFilter, levelFilter]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, BehavioralQuestion[]> = {};
    for (const q of filteredQuestions) {
      const cat = q.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(q);
    }
    return groups;
  }, [filteredQuestions]);

  function resetSTARForm() {
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
    setCommScores(Object.fromEntries(COMM_DIMENSIONS.map((d) => [d.id, -1])) as Record<CommDimensionId, number>);
  }

  const saveStory = useCallback(() => {
    if (!activeQuestion) return;
    if (!situation.trim() && !task.trim() && !action.trim() && !result.trim()) return;

    const now = new Date().toISOString();
    const existing = editingStoryId ? stories.find((s) => s.id === editingStoryId) : null;

    const entry: StoryEntry = {
      id: existing?.id ?? generateId(),
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      category: activeQuestion.category,
      situation: situation.trim(),
      task: task.trim(),
      action: action.trim(),
      result: result.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const updated = existing
      ? stories.map((s) => (s.id === entry.id ? entry : s))
      : [...stories, entry];
    setStories(updated);
    saveStories(updated);
    setEditingStoryId(entry.id);
  }, [activeQuestion, situation, task, action, result, stories, editingStoryId]);

  function deleteStory(id: string) {
    const updated = stories.filter((s) => s.id !== id);
    setStories(updated);
    saveStories(updated);
    if (editingStoryId === id) setEditingStoryId(null);
  }

  function loadStoryIntoForm(story: StoryEntry) {
    const question = behavioralQuestions.find((q) => q.id === story.questionId);
    if (question) setActiveQuestion(question);
    setSituation(story.situation);
    setTask(story.task);
    setAction(story.action);
    setResult(story.result);
    setEditingStoryId(story.id);
    setView('practice');
  }

  function handleRandomPractice() {
    const q = getRandomQuestion({
      category: categoryFilter ?? undefined,
      company: companyFilter ?? undefined,
      level: levelFilter ?? undefined,
    });
    setActiveQuestion(q);
    setView('practice');
    resetSTARForm();
  }

  function handleStartPractice(q: BehavioralQuestion) {
    setActiveQuestion(q);
    setView('practice');
    // Auto-load saved story if one exists for this question
    const existing = stories.find((s) => s.questionId === q.id);
    if (existing) {
      setSituation(existing.situation);
      setTask(existing.task);
      setAction(existing.action);
      setResult(existing.result);
      setEditingStoryId(existing.id);
    } else {
      resetSTARForm();
    }
  }

  function handleSendToMentor() {
    if (!activeQuestion) return;
    const starText = [
      `**Behavioral Question:** ${activeQuestion.question}`,
      '',
      `**Situation:** ${situation || '(not filled)'}`,
      `**Task:** ${task || '(not filled)'}`,
      `**Action:** ${action || '(not filled)'}`,
      `**Result:** ${result || '(not filled)'}`,
      '',
      'Please evaluate my STAR response. Score my answer on: specificity, quantified impact, leadership signals, technical depth, and conciseness. Suggest how I can improve it.',
    ].join('\n');
    onStartQuestion(activeQuestion);
    // Send the STAR text as a chat message (via the existing sendMessage)
    // We pass the question back so the parent can handle it
    window.dispatchEvent(new CustomEvent('behavioral-submit', { detail: starText }));
  }

  const savedQuestionIds = useMemo(() => new Set(stories.map((s) => s.questionId)), [stories]);
  const hasFilters = search || categoryFilter || companyFilter || levelFilter;

  // Practice view — STAR form
  if (view === 'practice' && activeQuestion) {
    const catMeta = CATEGORY_META[activeQuestion.category];
    return (
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setView('browse')}
          style={{ marginBottom: 12, fontSize: 11 }}
        >
          Back to Questions
        </button>

        <div className="card" style={{ marginBottom: 12, borderColor: catMeta.color }}>
          <div className="card-header" style={{ marginBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13 }}>{CATEGORY_META[activeQuestion.category].label}</span>
            {activeQuestion.amazonLP && (
              <span className="badge badge-secondary" style={{ fontSize: 9 }}>
                {activeQuestion.amazonLP}
              </span>
            )}
          </div>
          <div className="card-body">
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', lineHeight: 1.5, margin: '0 0 12px' }}>
              {activeQuestion.question}
            </p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {activeQuestion.levels.map((l) => (
                <span key={l} className="badge badge-secondary" style={{ fontSize: 9 }}>{LEVEL_LABELS[l]}</span>
              ))}
              {activeQuestion.companies.filter((c) => c !== 'general').map((c) => (
                <span key={c} className="badge badge-secondary" style={{ fontSize: 9 }}>{COMPANY_META[c].label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* STAR Form */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--neon-cyan)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star size={14} />
          STAR Method
        </div>

        {[
          { label: 'Situation', hint: 'Set the scene. Where, when, who was involved?', value: situation, onChange: setSituation },
          { label: 'Task', hint: 'What was your specific responsibility or goal?', value: task, onChange: setTask },
          { label: 'Action', hint: 'What steps did YOU take? Be specific about your actions.', value: action, onChange: setAction },
          { label: 'Result', hint: 'What was the outcome? Quantify impact if possible.', value: result, onChange: setResult },
        ].map(({ label, hint, value, onChange }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
              {label}
            </label>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{hint}</div>
            <textarea
              className="input textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              style={{ minHeight: 60, fontSize: 12 }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSendToMentor} style={{ flex: 1 }}>
            Get AI Feedback
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setView('scored')}
            disabled={!situation && !task && !action && !result}
            style={{ flex: 1 }}
          >
            Self-Score
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleRandomPractice} aria-label="Random practice question">
            <Shuffle size={14} aria-hidden="true" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={saveStory}
            disabled={!situation.trim() && !task.trim() && !action.trim() && !result.trim()}
            style={{ flex: 1, gap: 6 }}
          >
            <Save size={14} aria-hidden="true" />
            {editingStoryId ? 'Update Story' : 'Save to Story Bank'}
          </button>
        </div>
        {editingStoryId && (
          <div style={{ fontSize: 10, color: 'var(--neon-lime)', marginBottom: 12 }}>
            Saved — story will be auto-loaded next time you open this question.
          </div>
        )}

        {/* Tips */}
        {activeQuestion.tips.length > 0 && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header" style={{ marginBottom: 6 }}>
              <span className="card-title" style={{ fontSize: 12 }}>Tips</span>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {activeQuestion.tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Follow-up questions */}
        {activeQuestion.followUps.length > 0 && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: 6 }}>
              <span className="card-title" style={{ fontSize: 12 }}>Common Follow-Ups</span>
            </div>
            <div className="card-body">
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {activeQuestion.followUps.map((fu, i) => (
                  <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{fu}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Scored view — Communication scoring rubric
  if (view === 'scored' && activeQuestion) {
    const redFlags = detectRedFlags(situation, task, action, result);
    const allCommScored = Object.values(commScores).every((s) => s >= 0);
    const overallComm = allCommScored
      ? Object.values(commScores).reduce((sum, s) => sum + s, 0) / COMM_DIMENSIONS.length
      : 0;

    // STAR completeness check
    const starFilled = [situation, task, action, result].filter((s) => s.trim().length > 0).length;
    const starComplianceScore = starFilled; // 0-4

    return (
      <div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setView('practice')}
          style={{ marginBottom: 12, fontSize: 11 }}
        >
          Back to Answer
        </button>

        <div className="card" style={{ marginBottom: 12, borderColor: 'var(--neon-purple)' }}>
          <div className="card-header" style={{ marginBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13 }}>Communication Score</span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Rate your response on each communication dimension.
            </div>

            {COMM_DIMENSIONS.map((dim) => (
              <div key={dim.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{dim.label}</span>
                  {commScores[dim.id] >= 0 && (
                    <span style={{ fontSize: 10, color: COMM_SCORE_COLORS[commScores[dim.id]] }}>
                      {COMM_SCORE_LABELS[commScores[dim.id]]}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{dim.description}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2, 3, 4].map((score) => (
                    <button
                      type="button"
                      key={score}
                      aria-label={`${COMM_SCORE_LABELS[score]} (${score})`}
                      aria-pressed={commScores[dim.id] === score}
                      onClick={() => setCommScores((prev) => ({ ...prev, [dim.id]: score }))}
                      style={{
                        flex: 1,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        background: commScores[dim.id] === score ? COMM_SCORE_COLORS[score] : 'var(--bg-elevated)',
                        color: commScores[dim.id] === score ? 'var(--bg-void)' : 'var(--text-muted)',
                        border: `1px solid ${commScores[dim.id] === score ? 'transparent' : 'var(--border-default)'}`,
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* STAR Compliance */}
            <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 12, border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>STAR Compliance</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: starComplianceScore === 4 ? 'var(--neon-lime)' : starComplianceScore >= 2 ? 'var(--neon-amber)' : 'var(--neon-red)' }}>
                  {starComplianceScore}/4 sections
                </span>
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className={`progress-bar-fill ${starComplianceScore === 4 ? 'progress-bar-fill-success' : starComplianceScore >= 2 ? 'progress-bar-fill-warning' : 'progress-bar-fill-danger'}`} style={{ width: `${(starComplianceScore / 4) * 100}%` }} />
              </div>
            </div>

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div style={{ padding: '8px 12px', background: 'var(--neon-red-subtle)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255, 51, 102, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <AlertTriangle size={12} color="var(--neon-red)" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--neon-red)' }}>Red Flags</span>
                </div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {redFlags.map((flag, i) => (
                    <li key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overall Score */}
            {allCommScored && (
              <div style={{
                padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: '1px solid var(--border-default)', marginBottom: 12,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Communication Score</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: COMM_SCORE_COLORS[Math.round(overallComm)], fontFamily: 'var(--font-mono)' }}>
                  {overallComm.toFixed(1)} / 4.0
                </span>
              </div>
            )}

            {/* Improvement Tips */}
            {allCommScored && (
              <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <TrendingUp size={12} color="var(--neon-cyan)" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-bright)' }}>Focus Areas</span>
                </div>
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {COMM_DIMENSIONS.filter((d) => commScores[d.id] <= 2).map((d) => (
                    <li key={d.id} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>
                      <strong>{d.label}:</strong> {d.id === 'conciseness' ? 'Trim tangents. Aim for 90-second answers.' : d.id === 'impact' ? 'Add specific metrics: revenue, time saved, users impacted.' : d.id === 'technical-depth' ? 'Explain WHY you chose that approach, not just WHAT you did.' : 'Acknowledge what you learned or would do differently.'}
                    </li>
                  ))}
                  {COMM_DIMENSIONS.filter((d) => commScores[d.id] <= 2).length === 0 && (
                    <li style={{ fontSize: 11, color: 'var(--neon-lime)' }}>Excellent communication! Keep practicing for consistency.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Stories view — standalone STAR story bank
  if (view === 'stories') {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setView('browse')} style={{ flex: 1 }}>
            Questions
          </button>
          <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, gap: 6 }}>
            <BookOpen size={14} aria-hidden="true" />
            My Stories ({starStories.length})
          </button>
        </div>

        <StarStoryList
          stories={starStories}
          onAdd={() => setEditingStarStory('new')}
          onEdit={(s) => setEditingStarStory(s)}
          onDelete={deleteStarStory}
        />

        {editingStarStory !== null && (
          <StarStoryEditor
            story={editingStarStory === 'new' ? null : editingStarStory}
            onSave={(data) => {
              if (editingStarStory === 'new') {
                addStory(data);
              } else {
                updateStory(editingStarStory.id, data);
              }
              setEditingStarStory(null);
            }}
            onClose={() => setEditingStarStory(null)}
            onReviewWithAI={(text) => {
              window.dispatchEvent(new CustomEvent('behavioral-submit', { detail: text }));
            }}
          />
        )}
      </div>
    );
  }

  // Browse view — question library
  return (
    <div>
      {/* View toggle: Questions vs My Stories */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
          Questions
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setView('stories')}
          style={{ flex: 1, gap: 6 }}
        >
          <BookOpen size={14} aria-hidden="true" />
          My Stories ({starStories.length})
        </button>
      </div>

      {/* Random practice button */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleRandomPractice}
        style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Shuffle size={14} aria-hidden="true" />
        Random Practice Question
      </button>

      {/* Search */}
      <div className="input-wrapper" style={{ marginBottom: 10 }}>
        <Search size={14} className="input-icon input-icon-left-pos" />
        <input
          className="input input-icon-left"
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 10px 8px 32px', fontSize: 12 }}
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
        <Filter size={12} color="var(--text-muted)" />
        <select
          className="input"
          value={categoryFilter ?? ''}
          onChange={(e) => setCategoryFilter((e.target.value || null) as BehavioralCategory | null)}
          style={{ flex: 1, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_META[c].label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <select
          className="input"
          value={companyFilter ?? ''}
          onChange={(e) => setCompanyFilter((e.target.value || null) as CompanyTag | null)}
          style={{ flex: 1, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>{COMPANY_META[c].label}</option>
          ))}
        </select>
        <select
          className="input"
          value={levelFilter ?? ''}
          onChange={(e) => setLevelFilter((e.target.value || null) as SeniorityLevel | null)}
          style={{ flex: 1, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">All Levels</option>
          <option value="new-grad">New Grad</option>
          <option value="mid">Mid-Level</option>
          <option value="senior">Senior</option>
          <option value="staff">Staff+</option>
        </select>
      </div>

      {/* Results count */}
      {hasFilters && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Question groups */}
      {Object.entries(groupedByCategory).map(([cat, questions]) => {
        const catMeta = CATEGORY_META[cat as BehavioralCategory];
        return (
          <div key={cat} className="card" style={{ marginBottom: 12 }}>
            <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
              <span className="card-title" style={{ fontSize: 13, color: catMeta.color }}>
                {catMeta.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{questions.length}</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="card card-interactive"
                  onClick={() => handleStartPractice(q)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                  }}
                >
                  {savedQuestionIds.has(q.id) && (
                    <BookOpen size={12} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    flex: 1, fontSize: 12, color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}>
                    {q.question}
                  </span>
                  <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filteredQuestions.length === 0 && (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-state-title" style={{ fontSize: 14 }}>No questions found</div>
          <div className="empty-state-description" style={{ fontSize: 12 }}>
            Try adjusting your filters.
          </div>
        </div>
      )}
    </div>
  );
}

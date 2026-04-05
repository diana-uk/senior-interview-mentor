import { useState } from 'react';
import { X, Send } from 'lucide-react';
import type { BehavioralCategory } from '../../data/behavioral';
import { CATEGORY_META } from '../../data/behavioral';
import type { StarStory } from '../../hooks/useStarStories';

const WORD_TARGETS: Record<'situation' | 'task' | 'action' | 'result', { min: number; max: number }> = {
  situation: { min: 50,  max: 150 },
  task:      { min: 30,  max: 100 },
  action:    { min: 80,  max: 200 },
  result:    { min: 30,  max: 100 },
};

const SECTION_HINTS: Record<'situation' | 'task' | 'action' | 'result', string> = {
  situation: 'Set the scene — context, timeline, and who was involved.',
  task:      'What was your specific responsibility or goal?',
  action:    'What steps did YOU take? Be specific about your contributions.',
  result:    'What was the outcome? Quantify impact with numbers.',
};

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function getWordCountColor(count: number, min: number, max: number): string {
  if (count === 0) return 'var(--text-muted)';
  if (count < min) return 'var(--neon-red)';
  if (count > max) return 'var(--neon-amber)';
  return 'var(--neon-lime)';
}

interface StarStoryEditorProps {
  story?: StarStory | null;
  onSave: (data: Omit<StarStory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onReviewWithAI: (text: string) => void;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as BehavioralCategory[];

export default function StarStoryEditor({ story, onSave, onClose, onReviewWithAI }: StarStoryEditorProps) {
  const [title, setTitle]       = useState(story?.title ?? '');
  const [situation, setSituation] = useState(story?.situation ?? '');
  const [task, setTask]         = useState(story?.task ?? '');
  const [action, setAction]     = useState(story?.action ?? '');
  const [result, setResult]     = useState(story?.result ?? '');
  const [tags, setTags]         = useState<BehavioralCategory[]>(story?.tags ?? []);

  function toggleTag(cat: BehavioralCategory) {
    setTags((prev) =>
      prev.includes(cat) ? prev.filter((t) => t !== cat) : [...prev, cat],
    );
  }

  function handleSave() {
    onSave({ title: title.trim() || 'Untitled Story', situation, task, action, result, tags });
  }

  function handleAIReview() {
    const text = [
      `**STAR Story: ${title || 'Untitled'}**`,
      '',
      `**Situation (${countWords(situation)} words):** ${situation || '(empty)'}`,
      `**Task (${countWords(task)} words):** ${task || '(empty)'}`,
      `**Action (${countWords(action)} words):** ${action || '(empty)'}`,
      `**Result (${countWords(result)} words):** ${result || '(empty)'}`,
      '',
      'Please review my STAR story. Evaluate: specificity, quantified impact, leadership signals, technical depth, and conciseness. Flag any issues and suggest concrete improvements.',
    ].join('\n');
    onReviewWithAI(text);
    onClose();
  }

  const canSave = situation.trim() || task.trim() || action.trim() || result.trim();

  const sections: { key: 'situation' | 'task' | 'action' | 'result'; label: string; value: string; set: (v: string) => void }[] = [
    { key: 'situation', label: 'Situation', value: situation, set: setSituation },
    { key: 'task',      label: 'Task',      value: task,      set: setTask },
    { key: 'action',    label: 'Action',    value: action,    set: setAction },
    { key: 'result',    label: 'Result',    value: result,    set: setResult },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">{story ? 'Edit Story' : 'New STAR Story'}</span>
          <button type="button" className="modal-close" aria-label="Close editor" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Story Title
            </label>
            <input
              className="input"
              type="text"
              placeholder='e.g. "Led migration to microservices"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* S / T / A / R sections */}
          {sections.map(({ key, label, value, set }) => {
            const { min, max } = WORD_TARGETS[key];
            const wc = countWords(value);
            const color = getWordCountColor(wc, min, max);
            const pct = Math.min(100, (wc / max) * 100);
            return (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {label}
                  </label>
                  <span style={{ fontSize: 10, color, fontFamily: 'var(--font-mono)' }}>
                    {wc} / {min}–{max} words
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {SECTION_HINTS[key]}
                </div>
                <textarea
                  className="input textarea"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}...`}
                  style={{ minHeight: 72, fontSize: 12, marginBottom: 4 }}
                />
                {/* Word count progress bar */}
                <div style={{ height: 2, background: 'var(--bg-overlay)', borderRadius: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 1,
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Tag selector */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Behavioral Categories
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = tags.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      border: `1px solid ${active ? meta.color : 'var(--border-default)'}`,
                      background: active ? `${meta.color}18` : 'var(--bg-elevated)',
                      color: active ? meta.color : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleAIReview}
            disabled={!canSave}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Send size={12} aria-hidden="true" />
            AI Review
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
              {story ? 'Update Story' : 'Save Story'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

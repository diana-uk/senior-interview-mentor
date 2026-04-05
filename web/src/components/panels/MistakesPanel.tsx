import { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, RotateCcw, Plus, ChevronDown, ChevronRight, Undo2, BookOpen, Download } from 'lucide-react';
import type { MistakeEntryFull, PatternName } from '../../types';
import EmptyState from '../ui/EmptyState';
import { downloadAnkiCSV } from '../../utils/ankiExport';

interface MistakesPanelProps {
  mistakes: MistakeEntryFull[];
  dueForReview: MistakeEntryFull[];
  onReview: (id: string, quality: number) => void;
  onRemove: (id: string) => void;
  onAdd: (params: {
    pattern: PatternName;
    problemId: string | null;
    problemTitle: string;
    description: string;
  }) => void;
}

interface PendingDelete {
  id: string;
  description: string;
}

const UNDO_TIMEOUT_MS = 5000;

export default function MistakesPanel({
  mistakes,
  dueForReview,
  onReview,
  onRemove,
  onAdd,
}: MistakesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['due']));
  const [newPattern, setNewPattern] = useState<PatternName>('HashMap');
  const [newDescription, setNewDescription] = useState('');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleSoftDelete = useCallback((id: string, description: string) => {
    // If there's already a pending delete, finalize it first
    if (pendingDelete && undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      onRemove(pendingDelete.id);
    }
    setPendingDelete({ id, description });
    undoTimerRef.current = setTimeout(() => {
      onRemove(id);
      setPendingDelete(null);
      undoTimerRef.current = null;
    }, UNDO_TIMEOUT_MS);
  }, [pendingDelete, onRemove]);

  const handleUndo = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setPendingDelete(null);
  }, []);

  const patterns: PatternName[] = [
    'Sliding Window', 'Two Pointers', 'HashMap', 'Prefix Sum',
    'BFS/DFS', 'Topological Sort', 'Union-Find', 'Binary Search',
    'Heap', 'Intervals', 'Greedy', 'Dynamic Programming',
    'Backtracking', 'Trees',
  ];

  function toggleGroup(group: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function handleAdd() {
    if (!newDescription.trim()) return;
    onAdd({
      pattern: newPattern,
      problemId: null,
      problemTitle: 'Manual entry',
      description: newDescription.trim(),
    });
    setNewDescription('');
    setShowAddForm(false);
  }

  // Filter out pending-delete item, then group by pattern
  const visibleMistakes = pendingDelete
    ? mistakes.filter((m) => m.id !== pendingDelete.id)
    : mistakes;
  const visibleDue = pendingDelete
    ? dueForReview.filter((m) => m.id !== pendingDelete.id)
    : dueForReview;

  const byPattern: Record<string, MistakeEntryFull[]> = {};
  for (const m of visibleMistakes) {
    if (!byPattern[m.pattern]) byPattern[m.pattern] = [];
    byPattern[m.pattern].push(m);
  }

  return (
    <div>
      {/* Due for review section */}
      {visibleDue.length > 0 && (
        <div className="card stagger-enter stagger-1" style={{ marginBottom: 12, borderColor: 'rgba(255, 51, 102, 0.3)' }}>
          <button
            type="button"
            onClick={() => toggleGroup('due')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            {expandedGroups.has('due') ? <ChevronDown size={14} color="var(--neon-red)" /> : <ChevronRight size={14} color="var(--neon-red)" />}
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--neon-red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Due for Review ({visibleDue.length})
            </span>
          </button>
          {expandedGroups.has('due') && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visibleDue.map((m) => (
                <MistakeCard key={m.id} mistake={m} onReview={onReview} onRemove={handleSoftDelete} isDue />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Export buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ flex: 1, gap: 6 }}
        >
          <Plus size={14} />
          Log Mistake
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => downloadAnkiCSV(visibleMistakes)}
          disabled={visibleMistakes.length === 0}
          title={visibleMistakes.length === 0 ? 'No mistakes to export' : `Export ${visibleMistakes.length} card${visibleMistakes.length !== 1 ? 's' : ''} to Anki`}
          style={{ gap: 4 }}
        >
          <Download size={13} />
          Anki
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: 12, padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <select
              className="input"
              style={{ padding: '6px 8px', fontSize: 12, marginBottom: 8 }}
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value as PatternName)}
            >
              {patterns.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea
              className="input textarea"
              placeholder="Describe the mistake..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{ minHeight: 60, fontSize: 12 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>Add</button>
          </div>
        </div>
      )}

      {/* Weakness Heat Map */}
      {mistakes.length > 0 && (
        <>
          <div className="section-label" style={{ marginBottom: 8 }}>Weakness Heat Map</div>
          <div className="card stagger-enter stagger-2" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
              {patterns.map((p) => {
                const count = byPattern[p]?.length ?? 0;
                const maxCount = Math.max(1, ...Object.values(byPattern).map((e) => e.length));
                const intensity = count / maxCount;
                const dueCount = byPattern[p]?.filter((m) => m.nextReview <= new Date().toISOString().split('T')[0]).length ?? 0;
                const bg = count === 0
                  ? 'var(--bg-elevated)'
                  : intensity > 0.6
                    ? `rgba(255, 51, 102, ${0.15 + intensity * 0.25})`
                    : intensity > 0.3
                      ? `rgba(255, 170, 0, ${0.1 + intensity * 0.2})`
                      : `rgba(163, 255, 0, ${0.08 + intensity * 0.15})`;
                const borderColor = count === 0
                  ? 'var(--border-default)'
                  : intensity > 0.6
                    ? 'rgba(255, 51, 102, 0.3)'
                    : intensity > 0.3
                      ? 'rgba(255, 170, 0, 0.25)'
                      : 'rgba(163, 255, 0, 0.2)';
                return (
                  <div
                    key={p}
                    title={`${p}: ${count} mistake${count !== 1 ? 's' : ''}${dueCount > 0 ? `, ${dueCount} due` : ''}`}
                    style={{
                      padding: '8px 6px',
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      textAlign: 'center',
                      cursor: count > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.15s ease',
                    }}
                    onClick={() => count > 0 && toggleGroup(p)}
                  >
                    <div style={{ fontSize: 10, color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: count === 0 ? 'var(--text-disabled)' : intensity > 0.6 ? 'var(--neon-red)' : intensity > 0.3 ? 'var(--neon-amber)' : 'var(--neon-lime)' }}>
                      {count}
                    </div>
                    {dueCount > 0 && (
                      <div style={{ fontSize: 9, color: 'var(--neon-red)', marginTop: 2 }}>{dueCount} due</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Stats summary */}
      <div className="section-label" style={{ marginBottom: 8 }}>
        All Mistakes ({visibleMistakes.length})
      </div>

      {visibleMistakes.length === 0 && !pendingDelete ? (
        <EmptyState
          icon={BookOpen}
          title="No mistakes yet"
          description="Complete a problem and your weak areas appear here. You can also log mistakes manually."
        />
      ) : (
        Object.entries(byPattern).map(([pattern, entries], groupIndex) => (
          <div key={pattern} className={`card stagger-enter stagger-${groupIndex + 2}`} style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => toggleGroup(pattern)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {expandedGroups.has(pattern) ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                <span className="badge badge-secondary">{pattern}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entries.length}</span>
            </button>
            {expandedGroups.has(pattern) && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {entries.map((m) => (
                  <MistakeCard key={m.id} mistake={m} onReview={onReview} onRemove={handleSoftDelete} />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Undo toast */}
      {pendingDelete && (
        <div
          role="alert"
          style={{
            position: 'sticky',
            bottom: 0,
            margin: '12px -12px -12px',
            padding: '10px 14px',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            Mistake deleted
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleUndo}
            style={{ padding: '3px 10px', fontSize: 11, color: 'var(--neon-cyan)', gap: 4, flexShrink: 0 }}
          >
            <Undo2 size={12} />
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

function MistakeCard({
  mistake: m,
  onReview,
  onRemove,
  isDue = false,
}: {
  mistake: MistakeEntryFull;
  onReview: (id: string, quality: number) => void;
  onRemove: (id: string, description: string) => void;
  isDue?: boolean;
}) {
  const isOverdue = m.nextReview <= new Date().toISOString().split('T')[0];

  return (
    <div
      style={{
        padding: '8px 10px',
        background: isDue ? 'var(--neon-red-subtle)' : 'var(--bg-elevated)',
        border: `1px solid ${isDue ? 'rgba(255,51,102,0.2)' : 'var(--border-default)'}`,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.problemTitle}</span>
        <div className="streak-indicator">
          {[0, 1, 2, 3, 4].map((idx) => (
            <span key={idx} className={`streak-dot ${idx < m.streak ? 'streak-dot-filled' : ''}`} />
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6 }}>{m.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: isOverdue ? 'var(--neon-red)' : 'var(--text-muted)' }}>
          {isOverdue ? 'Review due!' : `Next: ${m.nextReview}`}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {isDue && (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onReview(m.id, 2)}
                title="Still struggling"
                style={{ padding: '2px 6px', fontSize: 10, color: 'var(--neon-red)' }}
              >
                Hard
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onReview(m.id, 4)}
                title="Got it with effort"
                style={{ padding: '2px 6px', fontSize: 10, color: 'var(--neon-amber)' }}
              >
                OK
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onReview(m.id, 5)}
                title="Easy recall"
                style={{ padding: '2px 6px', fontSize: 10, color: 'var(--neon-lime)' }}
              >
                Easy
              </button>
            </>
          )}
          {!isDue && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onReview(m.id, 4)}
              title="Review now"
              style={{ padding: '2px 6px' }}
            >
              <RotateCcw size={12} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onRemove(m.id, m.description)}
            title="Remove"
            style={{ padding: '2px 6px', color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

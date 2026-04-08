import { useState } from 'react';
import { ArrowLeft, Clock, Target, Lightbulb } from 'lucide-react';
import type { SessionRecord } from '../../types';
import EmptyState from '../ui/EmptyState';
import { formatDuration, formatDate, formatScore } from '../../utils/formatters';

const MODE_LABEL: Record<string, string> = {
  TEACHER: 'Teacher',
  INTERVIEWER: 'Interview',
  REVIEWER: 'Review',
};

const MODE_COLOR: Record<string, string> = {
  TEACHER: 'var(--neon-cyan)',
  INTERVIEWER: 'var(--neon-amber)',
  REVIEWER: 'var(--neon-lime)',
};

export default function SessionHistoryPanel({ sessions, onResumeSession }: SessionHistoryPanelProps) {
  const [selected, setSelected] = useState<SessionRecord | null>(null);

  if (selected) {
    return (
      <div>
        {/* Back */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setSelected(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, fontSize: 11 }}
        >
          <ArrowLeft size={12} aria-hidden="true" />
          Back
        </button>

        {/* Detail card */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 4 }}>
            {selected.problemTitle}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12 }}>
            {formatDate(selected.date)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="Mode" value={
              <span style={{ color: MODE_COLOR[selected.mode] ?? 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}>
                {MODE_LABEL[selected.mode] ?? selected.mode}
              </span>
            } />
            <Row label="Duration" value={formatDuration(selected.duration)} />
            <Row label="Score" value={formatScore(selected.score)} />
            <Row label="Hints used" value={String(selected.hintsUsed)} />
            {selected.patterns.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 80 }}>Patterns</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                  {selected.patterns.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: 9,
                        padding: '2px 6px',
                        borderRadius: 8,
                        background: 'var(--bg-overlay)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selected.problemId && onResumeSession && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                onResumeSession(selected.problemId!);
                setSelected(null);
              }}
              style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
            >
              Go to Problem
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No sessions yet"
          description="Complete a problem or run tests to record your first session."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="card"
              onClick={() => setSelected(s)}
              style={{ padding: '8px 12px', textAlign: 'left', cursor: 'pointer', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {s.problemTitle}
                </span>
                <span style={{ fontSize: 10, color: MODE_COLOR[s.mode] ?? 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>
                  {MODE_LABEL[s.mode] ?? s.mode}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <StatChip icon={Clock} value={formatDuration(s.duration)} />
                <StatChip icon={Target} value={formatScore(s.score)} />
                {s.hintsUsed > 0 && <StatChip icon={Lightbulb} value={`${s.hintsUsed} hint${s.hintsUsed !== 1 ? 's' : ''}`} />}
                <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {formatDate(s.date)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
    </div>
  );
}

function StatChip({ icon: Icon, value }: { icon: React.ComponentType<{ size?: number }>; value: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)' }}>
      <Icon size={10} />
      {value}
    </span>
  );
}

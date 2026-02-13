import { useState, useMemo } from 'react';
import { Search, CheckCircle, Circle, Clock, X, Sparkles, Zap } from 'lucide-react';
import { problemsByPattern } from '../../data/problems';
import type { Difficulty, ProblemStatus } from '../../types';

export interface RecommendedProblemEntry {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  reason: string;
}

interface ProblemListProps {
  onSelect: (id: string) => void;
  currentId: string | null;
  getProblemStatus?: (id: string) => ProblemStatus;
  recommendations?: RecommendedProblemEntry[];
  dailyChallenge?: RecommendedProblemEntry | null;
}

type SortOption = 'default' | 'difficulty' | 'status';
type DifficultyFilter = Difficulty | 'All';

const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

const STATUS_ICONS: Record<ProblemStatus, { icon: typeof CheckCircle; color: string }> = {
  solved: { icon: CheckCircle, color: 'var(--neon-lime)' },
  attempted: { icon: Clock, color: 'var(--neon-amber)' },
  unseen: { icon: Circle, color: 'var(--text-muted)' },
};

export default function ProblemList({ onSelect, currentId, getProblemStatus, recommendations, dailyChallenge }: ProblemListProps) {
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<DifficultyFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [patternFilter, setPatternFilter] = useState<string | null>(null);

  const allPatterns = useMemo(() => Object.keys(problemsByPattern), []);

  const filteredGroups = useMemo(() => {
    const result: Record<string, typeof problemsByPattern[string]> = {};

    for (const [pattern, problems] of Object.entries(problemsByPattern)) {
      // Pattern filter
      if (patternFilter && pattern !== patternFilter) continue;

      const filtered = problems.filter((p) => {
        // Search filter
        if (search) {
          const q = search.toLowerCase();
          if (
            !p.title.toLowerCase().includes(q) &&
            !pattern.toLowerCase().includes(q) &&
            !p.difficulty.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        // Difficulty filter
        if (diffFilter !== 'All' && p.difficulty !== diffFilter) return false;
        return true;
      });

      if (filtered.length > 0) {
        // Sort within group
        if (sortBy === 'difficulty') {
          filtered.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
        } else if (sortBy === 'status' && getProblemStatus) {
          const statusOrder: Record<ProblemStatus, number> = { unseen: 0, attempted: 1, solved: 2 };
          filtered.sort(
            (a, b) => statusOrder[getProblemStatus(a.id)] - statusOrder[getProblemStatus(b.id)],
          );
        }
        result[pattern] = filtered;
      }
    }
    return result;
  }, [search, diffFilter, sortBy, patternFilter, getProblemStatus]);

  const totalCount = Object.values(filteredGroups).reduce((sum, g) => sum + g.length, 0);
  const hasFilters = search || diffFilter !== 'All' || patternFilter;

  return (
    <div>
      {/* Search bar */}
      <div className="input-wrapper" style={{ marginBottom: 10 }}>
        <Search size={14} className="input-icon input-icon-left-pos" />
        <input
          className="input input-icon-left"
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 10px 8px 32px', fontSize: 12 }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {(['All', 'Easy', 'Medium', 'Hard'] as DifficultyFilter[]).map((d) => (
          <button
            key={d}
            className={`badge ${
              diffFilter === d
                ? d === 'Easy' ? 'badge-easy'
                  : d === 'Medium' ? 'badge-medium'
                  : d === 'Hard' ? 'badge-hard'
                  : 'badge-secondary'
                : 'badge-secondary'
            }`}
            onClick={() => setDiffFilter(d === diffFilter ? 'All' : d)}
            style={{ cursor: 'pointer', fontSize: 10, padding: '3px 8px' }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Pattern filter (dropdown-style) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
        <select
          className="input"
          value={patternFilter ?? ''}
          onChange={(e) => setPatternFilter(e.target.value || null)}
          style={{ flex: 1, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="">All Patterns</option>
          {allPatterns.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          style={{ width: 100, padding: '5px 8px', fontSize: 11 }}
        >
          <option value="default">Default</option>
          <option value="difficulty">Difficulty</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Results count */}
      {hasFilters && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
          {totalCount} problem{totalCount !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Daily Challenge */}
      {!hasFilters && dailyChallenge && (
        <div
          className="card card-interactive"
          onClick={() => onSelect(dailyChallenge.id)}
          style={{
            marginBottom: 12,
            borderColor: 'var(--neon-amber)',
            background: currentId === dailyChallenge.id ? 'var(--neon-cyan-subtle)' : undefined,
          }}
        >
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color="var(--neon-amber)" />
              Daily Challenge
            </span>
            <span className={`badge badge-${dailyChallenge.difficulty.toLowerCase()}`}>
              {dailyChallenge.difficulty}
            </span>
          </div>
          <div className="card-body">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 4 }}>
              {dailyChallenge.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--neon-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, padding: '1px 6px', background: 'var(--difficulty-medium-bg)', borderRadius: 4 }}>
                {dailyChallenge.pattern}
              </span>
              <span>{dailyChallenge.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommended for you */}
      {!hasFilters && recommendations && recommendations.length > 0 && (
        <div className="card stagger-enter stagger-1" style={{ marginBottom: 12, borderColor: 'var(--neon-cyan)' }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="var(--neon-cyan)" />
              Recommended
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`card card-interactive ${currentId === rec.id ? 'card-hover-lift' : ''}`}
                onClick={() => onSelect(rec.id)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: currentId === rec.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                  borderColor: currentId === rec.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: currentId === rec.id ? 'var(--text-bright)' : 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {rec.title}
                  </span>
                  <span className={`badge badge-${rec.difficulty.toLowerCase()}`}>
                    {rec.difficulty}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--neon-cyan)', lineHeight: 1.3 }}>
                  {rec.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem groups */}
      {Object.entries(filteredGroups).map(([pattern, problems], groupIndex) => (
        <div key={pattern} className={`card stagger-enter stagger-${groupIndex + 1}`} style={{ marginBottom: 12 }}>
          <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
            <span className="card-title" style={{ fontSize: 13 }}>{pattern}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{problems.length}</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {problems.map((p) => {
              const status = getProblemStatus?.(p.id) ?? 'unseen';
              const StatusIcon = STATUS_ICONS[status].icon;
              const statusColor = STATUS_ICONS[status].color;

              return (
                <div
                  key={p.id}
                  className={`card card-interactive ${currentId === p.id ? 'card-hover-lift' : ''}`}
                  onClick={() => onSelect(p.id)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: currentId === p.id ? 'var(--neon-cyan-subtle)' : 'var(--bg-elevated)',
                    borderColor: currentId === p.id ? 'var(--neon-cyan)' : 'var(--border-default)',
                  }}
                >
                  <StatusIcon size={14} color={statusColor} style={{ flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: currentId === p.id ? 'var(--text-bright)' : 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {p.title}
                  </span>
                  <span className={`badge badge-${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {totalCount === 0 && (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-state-title" style={{ fontSize: 14 }}>No problems found</div>
          <div className="empty-state-description" style={{ fontSize: 12 }}>
            Try adjusting your filters or search query.
          </div>
        </div>
      )}
    </div>
  );
}

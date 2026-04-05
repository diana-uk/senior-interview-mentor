import { useState } from 'react';
import { Plus, Edit3, Trash2, Tag } from 'lucide-react';
import type { BehavioralCategory } from '../../data/behavioral';
import { CATEGORY_META, behavioralQuestions } from '../../data/behavioral';
import type { StarStory } from '../../hooks/useStarStories';
import EmptyState from '../ui/EmptyState';
import { Star } from 'lucide-react';

interface StarStoryListProps {
  stories: StarStory[];
  onAdd: () => void;
  onEdit: (story: StarStory) => void;
  onDelete: (id: string) => void;
}

function getAnswersCount(tags: BehavioralCategory[]): number {
  if (tags.length === 0) return 0;
  return behavioralQuestions.filter((q) => tags.includes(q.category)).length;
}

export default function StarStoryList({ stories, onAdd, onEdit, onDelete }: StarStoryListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
        >
          <Plus size={12} aria-hidden="true" />
          New Story
        </button>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No stories yet"
          description="Build reusable STAR answers that apply across multiple behavioral questions."
          action={{ label: '+ New Story', onClick: onAdd }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stories.map((story) => {
            const answersCount = getAnswersCount(story.tags);
            const isConfirming = confirmDelete === story.id;
            return (
              <div
                key={story.id}
                className="card"
                style={{ padding: '10px 12px' }}
              >
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {story.title}
                    </div>
                    {answersCount > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        answers {answersCount} question{answersCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => onEdit(story)}
                      aria-label={`Edit story: ${story.title}`}
                      style={{ padding: '3px 6px' }}
                    >
                      <Edit3 size={12} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(story.id)}
                      aria-label={isConfirming ? `Confirm delete: ${story.title}` : `Delete story: ${story.title}`}
                      style={{ padding: '3px 6px', color: isConfirming ? 'var(--neon-red)' : 'var(--text-muted)' }}
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Situation preview */}
                {story.situation && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.4 }}>
                    {story.situation.slice(0, 100)}{story.situation.length > 100 ? '…' : ''}
                  </div>
                )}

                {/* Tags */}
                {story.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                    <Tag size={10} color="var(--text-muted)" />
                    {story.tags.map((cat) => {
                      const meta = CATEGORY_META[cat];
                      return (
                        <span
                          key={cat}
                          style={{
                            fontSize: 9,
                            padding: '2px 7px',
                            borderRadius: 10,
                            border: `1px solid ${meta.color}`,
                            color: meta.color,
                            background: `${meta.color}12`,
                          }}
                        >
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {isConfirming && (
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--neon-red)' }}>
                    Click delete again to confirm.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

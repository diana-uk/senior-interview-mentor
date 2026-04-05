import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="empty-state"
      style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
    >
      <Icon size={40} color="var(--text-muted)" aria-hidden="true" />
      <div className="empty-state-title" style={{ fontSize: 14, marginTop: 4 }}>{title}</div>
      <div className="empty-state-description" style={{ fontSize: 12, textAlign: 'center', maxWidth: 240 }}>
        {description}
      </div>
      {action && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={action.onClick}
          style={{ marginTop: 4 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

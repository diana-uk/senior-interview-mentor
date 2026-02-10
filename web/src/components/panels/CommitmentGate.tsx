import { X, Lock, Check } from 'lucide-react';
import type { CommitmentGateItem } from '../../types';

interface CommitmentGateProps {
  open: boolean;
  onClose: () => void;
  items: CommitmentGateItem[];
  onToggle: (id: string) => void;
}

export default function CommitmentGate({ open, onClose, items, onToggle }: CommitmentGateProps) {
  if (!open) return null;

  const completedCount = items.filter((i) => i.completed).length;
  const allComplete = completedCount === items.length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className="commitment-gate">
      <div className="commitment-gate-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="commitment-gate-title">Commitment Gate</div>
          <button className="sidebar-panel-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="commitment-gate-subtitle">
          Complete all items before viewing the solution
        </div>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div
            className={`progress-bar-fill ${allComplete ? 'progress-bar-fill-success' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="commitment-gate-items">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`commitment-gate-item ${item.completed ? 'commitment-gate-item-complete' : ''} stagger-enter stagger-${i + 1}`}
            onClick={() => onToggle(item.id)}
          >
            <div className="commitment-gate-checkbox">
              {item.completed && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="commitment-gate-item-content">
              <div className="commitment-gate-item-label">{item.label}</div>
              <div className="commitment-gate-item-description">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {!allComplete && (
        <div className="empty-state" style={{ padding: '24px 20px' }}>
          <Lock size={24} className="empty-state-icon" style={{ opacity: 0.5 }} />
          <div className="empty-state-description">Complete all items to unlock the solution</div>
        </div>
      )}

      {allComplete && (
        <div style={{ padding: '16px 20px' }}>
          <button className="btn btn-primary btn-glow-pulse" style={{ width: '100%', justifyContent: 'center' }}>
            Solution Unlocked — View Full Code
          </button>
        </div>
      )}
    </div>
  );
}

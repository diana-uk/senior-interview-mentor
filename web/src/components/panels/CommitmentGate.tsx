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
      <div className="commitment-gate__header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="commitment-gate__title">Commitment Gate</div>
          <button className="sidebar-panel__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="commitment-gate__progress">
          <div
            className="commitment-gate__progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="commitment-gate__items">
        {items.map((item) => (
          <div key={item.id} className="gate-item" onClick={() => onToggle(item.id)}>
            <div className={`gate-checkbox ${item.completed ? 'gate-checkbox--checked' : ''}`}>
              {item.completed && <Check size={12} color="#0d1117" strokeWidth={3} />}
            </div>
            <div>
              <div className="gate-item__label">{item.label}</div>
              <div className="gate-item__desc">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {!allComplete && (
        <div className="gate-locked">
          <div className="gate-locked__icon">
            <Lock size={20} />
          </div>
          Complete all items to unlock the solution
        </div>
      )}

      {allComplete && (
        <div style={{ padding: '16px 20px' }}>
          <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
            Solution Unlocked — View Full Code
          </button>
        </div>
      )}
    </div>
  );
}

import type { HintLevel } from '../../types';

interface HintLadderProps {
  hints: HintLevel[];
  onRequestHint: (level: 1 | 2 | 3) => void;
}

export default function HintLadder({ hints, onRequestHint }: HintLadderProps) {
  return (
    <div className="hint-ladder">
      <div className="hint-ladder-items">
        {hints.map((hint) => {
          const stateClass = hint.unlocked ? 'hint-ladder-item-unlocked' : '';
          const animationClass = hint.unlocked ? 'hint-unlock-animation' : '';

          return (
            <div key={hint.level} className={`hint-ladder-item ${stateClass} ${animationClass}`}>
              <div className="hint-ladder-indicator">
                {hint.level}
              </div>
              <div className="hint-ladder-content">
                <div className="hint-ladder-label">Level {hint.level}: {hint.label}</div>
                <div className="hint-ladder-description">{hint.description}</div>
                {hint.unlocked ? (
                  <div className="hint-ladder-text">{hint.content}</div>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRequestHint(hint.level)}
                    style={{ marginTop: 8 }}
                  >
                    Request Hint
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

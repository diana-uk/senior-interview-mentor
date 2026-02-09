import type { HintLevel } from '../../types';

interface HintLadderProps {
  hints: HintLevel[];
  onRequestHint: (level: 1 | 2 | 3) => void;
}

export default function HintLadder({ hints, onRequestHint }: HintLadderProps) {
  return (
    <div className="hint-ladder">
      {hints.map((hint) => {
        const levelClass = `hint-step--level-${hint.level}`;
        const stateClass = hint.unlocked ? 'hint-step--unlocked' : 'hint-step--locked';

        return (
          <div key={hint.level} className={`hint-step ${levelClass} ${stateClass}`}>
            <div className="hint-step__dot" />
            <div className="hint-step__header">
              <span>Level {hint.level}</span>
              <span className="hint-step__label">{hint.label}</span>
            </div>
            {hint.unlocked ? (
              <div className="hint-step__content">{hint.content}</div>
            ) : (
              <button
                className="btn btn--ghost"
                style={{ marginTop: 6, fontSize: 11, padding: '4px 12px' }}
                onClick={() => onRequestHint(hint.level)}
              >
                Request Hint
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

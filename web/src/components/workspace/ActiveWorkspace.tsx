import { useState } from 'react';
import type { CommitmentGateItem, Difficulty, HintLevel } from '../../types';

interface ActiveWorkspaceProps {
  problemTitle: string;
  difficulty: Difficulty;
  timerDisplay: string;
  commitmentGate: CommitmentGateItem[];
  hints: HintLevel[];
  onToggleGateItem: (id: string) => void;
  onRequestHint: (level: 1 | 2 | 3) => void;
  onSaveDraft: () => void;
  onFinishSession: () => void;
  mentorMessage?: string;
  codeLines?: string[];
  language?: string;
}

export default function ActiveWorkspace({
  problemTitle,
  difficulty,
  timerDisplay,
  commitmentGate,
  hints,
  onToggleGateItem,
  onRequestHint,
  onSaveDraft,
  onFinishSession,
  mentorMessage = 'Think about how the height of bars on the left and right sides limit the water at any given position. Would a two-pointer approach work here?',
  codeLines,
  language = 'Python 3',
}: ActiveWorkspaceProps) {
  const [mentorInput, setMentorInput] = useState('');

  const gateCompleted = commitmentGate.filter((i) => i.completed).length;
  const progressPercent = (gateCompleted / commitmentGate.length) * 100;
  const allGateCompleted = gateCompleted === commitmentGate.length;

  const defaultCode = [
    'class Solution:',
    '    def trap(self, height: List[int]) -> int:',
    '        # Start implementing your solution below',
    '        ',
    '',
    '',
  ];

  const lines = codeLines ?? defaultCode;

  const diffClass = difficulty === 'Easy' ? 'easy' : difficulty === 'Medium' ? 'medium' : 'hard';

  return (
    <div className="aw">
      {/* Header Bar */}
      <div className="aw__header">
        <div className="aw__header-left">
          <div className="aw__logo">
            <span className="aw__logo-icon">S</span>
            <span className="aw__logo-text">Senior Interview Mentor</span>
          </div>
          <span className="aw__header-sep">|</span>
          <span className="aw__header-problem">
            Problem: <strong>{problemTitle}</strong>
          </span>
          <span className={`difficulty-badge difficulty-badge--${diffClass}`}>
            {difficulty}
          </span>
        </div>
        <div className="aw__header-center">
          <span className="material-symbols-outlined aw__timer-icon">timer</span>
          <span className="aw__timer-value">{timerDisplay}</span>
        </div>
        <div className="aw__header-right">
          <button className="btn btn--ghost" onClick={onSaveDraft}>Save Draft</button>
          <button className="btn btn--primary aw__finish-btn" onClick={onFinishSession}>
            Finish Session
          </button>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="aw__panels">
        {/* Left Panel: AI Mentor */}
        <div className="aw__panel aw__panel--mentor">
          <div className="aw__panel-header">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--accent-blue)' }}>psychology</span>
            <span className="aw__panel-title">AI Mentor</span>
          </div>

          <div className="aw__mentor-content">
            {/* Mentor message */}
            <div className="aw__mentor-card">
              <div className="aw__mentor-card-label">Mentor says:</div>
              <p>"{mentorMessage}"</p>
            </div>

            {/* Hint Ladder */}
            <div className="aw__hint-section">
              <div className="aw__hint-title">HINT LADDER</div>
              <div className="aw__hint-list">
                {hints.map((hint) => {
                  const levelColors: Record<number, string> = {
                    1: 'var(--accent-green)',
                    2: 'var(--accent-orange)',
                    3: 'var(--accent-purple)',
                  };
                  const color = levelColors[hint.level];
                  return (
                    <div
                      key={hint.level}
                      className={`aw__hint-step ${hint.unlocked ? 'aw__hint-step--unlocked' : 'aw__hint-step--locked'}`}
                      style={{ borderLeftColor: color }}
                      onClick={() => {
                        if (!hint.unlocked) onRequestHint(hint.level);
                      }}
                    >
                      <div className="aw__hint-step-header">
                        <span className="aw__hint-step-label" style={{ color }}>
                          Level {hint.level}: {hint.label}
                        </span>
                        <span className="material-symbols-outlined aw__hint-step-icon">
                          {hint.unlocked ? 'visibility' : 'lock'}
                        </span>
                      </div>
                      <div className={hint.unlocked ? 'aw__hint-step-content' : 'aw__hint-step-content--locked'}>
                        {hint.unlocked ? hint.content : hint.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="aw__mentor-input">
            <input
              type="text"
              className="aw__mentor-input-field"
              placeholder="Ask for a nudge..."
              value={mentorInput}
              onChange={(e) => setMentorInput(e.target.value)}
            />
            <button className="aw__mentor-send">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>

        {/* Center Panel: Code Editor */}
        <div className="aw__panel aw__panel--editor">
          <div className="aw__editor-tabs">
            <div className="aw__editor-tab aw__editor-tab--active">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>code</span>
              solution.py
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{language}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer' }}>settings</span>
            </div>
          </div>

          <div className="aw__editor-body">
            <div className="aw__editor-lines">
              {lines.map((line, i) => (
                <div className="aw__editor-line" key={i}>
                  <span className="aw__editor-linenum">{i + 1}</span>
                  <pre className="aw__editor-code">
                    <code dangerouslySetInnerHTML={{ __html: highlightPython(line) }} />
                  </pre>
                </div>
              ))}
              {/* Blinking cursor */}
              <div className="aw__editor-cursor" />
            </div>
          </div>

          {/* Console */}
          <div className="aw__console">
            <div className="aw__console-tabs">
              <span className="aw__console-tab aw__console-tab--active">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>terminal</span>
                Console
              </span>
              <span className="aw__console-tab">Test Cases</span>
            </div>
            <div className="aw__console-body">
              <div className="aw__console-line">$ python solution.py --test-all</div>
              <div className="aw__console-line aw__console-line--info">&gt;&gt; Running tests...</div>
              <div className="aw__console-line aw__console-line--pass">&gt;&gt; Test Case 1: PASSED</div>
              <div className="aw__console-line aw__console-line--fail">&gt;&gt; Test Case 2: FAILED (Expected 9, got 0)</div>
            </div>
          </div>
        </div>

        {/* Right Panel: Pre-coding Checklist */}
        <div className="aw__panel aw__panel--checklist">
          <div className="aw__panel-header">
            <span className="aw__panel-title">Pre-coding Checklist</span>
          </div>

          {/* Progress */}
          <div className="aw__checklist-progress">
            <div className="aw__checklist-progress-header">
              <span>COMMITMENT PROGRESS</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="aw__checklist-progress-track">
              <div
                className="aw__checklist-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Gate items */}
          <div className="aw__checklist-items">
            {commitmentGate.map((item) => (
              <div
                key={item.id}
                className={`aw__gate-item ${item.completed ? 'aw__gate-item--completed' : 'aw__gate-item--incomplete'}`}
                onClick={() => onToggleGateItem(item.id)}
              >
                <span className={`material-symbols-outlined aw__gate-check ${item.completed ? 'aw__gate-check--done' : ''}`}>
                  {item.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className="aw__gate-label">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Locked content */}
          <div className="aw__locked-section">
            <span className="material-symbols-outlined aw__locked-icon">lock</span>
            <div className="aw__locked-title">LOCKED CONTENT</div>
            <div className="aw__locked-desc">Complete all items to unlock the solution</div>
            <button className="aw__locked-btn" disabled={!allGateCompleted}>
              View Solution
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="aw__footer">
        <div className="aw__footer-left">
          <span className="aw__footer-dot" />
          <span>System Ready</span>
          <span className="aw__footer-sep">|</span>
          <span>Line 4, Column 12</span>
        </div>
        <div className="aw__footer-right">
          <span>Keyboard Shortcuts</span>
          <span className="aw__footer-sep">|</span>
          <span>Support</span>
        </div>
      </div>
    </div>
  );
}

/** Simple Python syntax highlighter */
function highlightPython(line: string): string {
  if (!line.trim()) return '&nbsp;';

  // Comments
  const commentIdx = line.indexOf('#');
  if (commentIdx !== -1) {
    const before = line.substring(0, commentIdx);
    const comment = line.substring(commentIdx);
    return `${highlightPythonTokens(before)}<span class="aw__syn--comment">${escapeHtml(comment)}</span>`;
  }

  return highlightPythonTokens(line);
}

function highlightPythonTokens(text: string): string {
  const keywords = ['class', 'def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'self'];
  const types = ['int', 'str', 'List', 'Dict', 'bool', 'None', 'True', 'False'];

  let result = escapeHtml(text);

  // Highlight keywords
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    result = result.replace(regex, `<span class="aw__syn--keyword">$1</span>`);
  });

  // Highlight types
  types.forEach((t) => {
    const regex = new RegExp(`\\b(${t})\\b`, 'g');
    result = result.replace(regex, `<span class="aw__syn--type">$1</span>`);
  });

  // Highlight function names (word before open paren)
  result = result.replace(/\b(\w+)(\()/g, (_, name, paren) => {
    if (keywords.includes(name) || types.includes(name)) return `${name}${paren}`;
    return `<span class="aw__syn--func">${name}</span>${paren}`;
  });

  // Highlight strings
  result = result.replace(/(&quot;[^&]*&quot;|&#x27;[^&]*&#x27;)/g, '<span class="aw__syn--string">$1</span>');

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

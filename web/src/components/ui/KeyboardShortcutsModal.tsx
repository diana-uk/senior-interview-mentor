import { X } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Workspace',
    shortcuts: [
      { keys: ['Ctrl', '['], description: 'Toggle chat panel' },
      { keys: ['Ctrl', ']'], description: 'Toggle editor panel' },
      { keys: ['←', '→'], description: 'Resize splitter (when focused)' },
      { keys: ['Home'], description: 'Reset splitter to default' },
      { keys: ['?'], description: 'Open this shortcuts panel' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Esc'], description: 'Close modal / panel' },
      { keys: ['/'], description: 'Open slash command palette in chat' },
    ],
  },
  {
    title: 'System Design Editor',
    shortcuts: [
      { keys: ['1'], description: 'Straight edge' },
      { keys: ['2'], description: 'Bezier edge' },
      { keys: ['3'], description: 'Step edge' },
      { keys: ['L'], description: 'Toggle edge label' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="modal kbd-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">Keyboard Shortcuts</span>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="kbd-shortcuts-body">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="kbd-shortcuts-group">
              <div className="kbd-shortcuts-group-title">{group.title}</div>
              {group.shortcuts.map((s) => (
                <div key={s.description} className="kbd-shortcut-row">
                  <span className="kbd-shortcut-description">{s.description}</span>
                  <span className="kbd-shortcut-keys">
                    {s.keys.map((k, i) => (
                      <span key={k}>
                        <kbd className="kbd">{k}</kbd>
                        {i < s.keys.length - 1 && <span className="kbd-plus">+</span>}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="kbd-shortcuts-footer">
          Press <kbd className="kbd">?</kbd> to toggle this panel
        </div>
      </div>
    </div>
  );
}

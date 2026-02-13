import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sim-settings';

export type HintStyle = 'analogies' | 'pseudocode' | 'visual' | 'direct';
export type DetailLevel = 'brief' | 'balanced' | 'detailed';

export interface UserSettings {
  language: 'typescript' | 'javascript';
  editorFontSize: number;
  timerEnabled: boolean;
  timerDefaultMinutes: number;
  autoSave: boolean;
  soundEnabled: boolean;
  notifyDailyReminder: boolean;
  notifyStreakAlert: boolean;
  reminderTime: string; // HH:MM format
  hintStyle: HintStyle;
  detailLevel: DetailLevel;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'typescript',
  editorFontSize: 14,
  timerEnabled: true,
  timerDefaultMinutes: 45,
  autoSave: true,
  soundEnabled: false,
  notifyDailyReminder: false,
  notifyStreakAlert: false,
  reminderTime: '09:00',
  hintStyle: 'pseudocode',
  detailLevel: 'balanced',
};

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // silently ignore
  }
}

export function getSettings(): UserSettings {
  return loadSettings();
}

interface SettingsPanelProps {
  onSettingsChange?: (settings: UserSettings) => void;
}

export default function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      {/* Language */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Language</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 8 }}>
            {(['typescript', 'javascript'] as const).map((lang) => (
              <button
                key={lang}
                className={`btn ${settings.language === lang ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => update('language', lang)}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {lang === 'typescript' ? 'TypeScript' : 'JavaScript'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            Starter code and type annotations preference.
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Editor</span>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Font Size: {settings.editorFontSize}px
            </label>
            <input
              type="range"
              min={10}
              max={24}
              value={settings.editorFontSize}
              onChange={(e) => update('editorFontSize', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--neon-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Auto-save session</span>
            <button
              className={`btn btn-sm ${settings.autoSave ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('autoSave', !settings.autoSave)}
              style={{ minWidth: 48, fontSize: 10 }}
            >
              {settings.autoSave ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Timer</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Show timer</span>
            <button
              className={`btn btn-sm ${settings.timerEnabled ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('timerEnabled', !settings.timerEnabled)}
              style={{ minWidth: 48, fontSize: 10 }}
            >
              {settings.timerEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Default duration: {settings.timerDefaultMinutes} min
            </label>
            <input
              type="range"
              min={15}
              max={90}
              step={5}
              value={settings.timerDefaultMinutes}
              onChange={(e) => update('timerDefaultMinutes', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--neon-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
              <span>15 min</span>
              <span>90 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sound */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Sound</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sound effects</span>
            <button
              className={`btn btn-sm ${settings.soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('soundEnabled', !settings.soundEnabled)}
              style={{ minWidth: 48, fontSize: 10 }}
            >
              {settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            Timer completion and test result notifications.
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Notifications</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block' }}>Daily reminder</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Remind you to practice each day</span>
            </div>
            <button
              className={`btn btn-sm ${settings.notifyDailyReminder ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('notifyDailyReminder', !settings.notifyDailyReminder)}
              style={{ minWidth: 48, fontSize: 10 }}
            >
              {settings.notifyDailyReminder ? 'ON' : 'OFF'}
            </button>
          </div>

          {settings.notifyDailyReminder && (
            <div style={{ marginBottom: 10, paddingLeft: 8, borderLeft: '2px solid var(--border-default)' }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Reminder time
              </label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => update('reminderTime', e.target.value)}
                className="input"
                style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block' }}>Streak alerts</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Warn when streak is about to break</span>
            </div>
            <button
              className={`btn btn-sm ${settings.notifyStreakAlert ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => update('notifyStreakAlert', !settings.notifyStreakAlert)}
              style={{ minWidth: 48, fontSize: 10 }}
            >
              {settings.notifyStreakAlert ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            Browser notifications require permission. Alerts are local only.
          </div>
        </div>
      </div>

      {/* AI Memory */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>AI Memory</span>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Hint Style
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {([
                { value: 'analogies', label: 'Analogies' },
                { value: 'pseudocode', label: 'Pseudocode' },
                { value: 'visual', label: 'Visual' },
                { value: 'direct', label: 'Direct' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  className={`btn ${settings.hintStyle === value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => update('hintStyle', value)}
                  style={{ flex: 1, minWidth: 70, fontSize: 10 }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
              {settings.hintStyle === 'analogies' && 'Hints use real-world analogies to explain concepts.'}
              {settings.hintStyle === 'pseudocode' && 'Hints use pseudocode outlines and step-by-step logic.'}
              {settings.hintStyle === 'visual' && 'Hints use diagrams, ASCII art, and visual examples.'}
              {settings.hintStyle === 'direct' && 'Hints are concise and to the point — minimal framing.'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Detail Level
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                { value: 'brief', label: 'Brief' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'detailed', label: 'Detailed' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  className={`btn ${settings.detailLevel === value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => update('detailLevel', value)}
                  style={{ flex: 1, fontSize: 10 }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
              {settings.detailLevel === 'brief' && 'Short, focused responses. Just the essentials.'}
              {settings.detailLevel === 'balanced' && 'Standard explanations with context and examples.'}
              {settings.detailLevel === 'detailed' && 'Thorough explanations with deep dives and alternatives.'}
            </div>
          </div>

          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 8, borderTop: '1px solid var(--border-default)', paddingTop: 6 }}>
            The AI remembers your progress, weak patterns, and recent mistakes to personalize coaching across sessions.
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 12 }}>Data</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const data = {
                settings: loadSettings(),
                mistakes: localStorage.getItem('sim-mistakes'),
                stats: localStorage.getItem('sim-stats'),
                session: localStorage.getItem('sim-session'),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `interview-mentor-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ fontSize: 11 }}
          >
            Export All Data
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (confirm('This will clear all progress, mistakes, and session data. This cannot be undone.')) {
                localStorage.removeItem('sim-mistakes');
                localStorage.removeItem('sim-stats');
                localStorage.removeItem('sim-session');
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }
            }}
            style={{ fontSize: 11, color: 'var(--neon-red)' }}
          >
            Reset All Data
          </button>
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
        Senior Interview Mentor v0.1.0
      </div>
    </div>
  );
}

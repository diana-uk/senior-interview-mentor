export type HintStyle = 'analogies' | 'pseudocode' | 'visual' | 'direct';
export type DetailLevel = 'brief' | 'balanced' | 'detailed';

export interface UserSettings {
  language: 'typescript' | 'javascript' | 'python';
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

const STORAGE_KEY = 'sim-settings';

export const DEFAULT_SETTINGS: UserSettings = {
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

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // silently ignore
  }
}

export function getSettings(): UserSettings {
  return loadSettings();
}

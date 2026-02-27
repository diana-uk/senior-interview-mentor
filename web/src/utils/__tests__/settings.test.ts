import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSettings, saveSettings, getSettings, DEFAULT_SETTINGS } from '../settings';
import type { UserSettings, HintStyle, DetailLevel } from '../settings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('settings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ── DEFAULT_SETTINGS ──

  describe('DEFAULT_SETTINGS', () => {
    it('has correct default language', () => {
      expect(DEFAULT_SETTINGS.language).toBe('typescript');
    });

    it('has correct default font size', () => {
      expect(DEFAULT_SETTINGS.editorFontSize).toBe(14);
    });

    it('has timer enabled by default', () => {
      expect(DEFAULT_SETTINGS.timerEnabled).toBe(true);
    });

    it('has 45-minute default timer', () => {
      expect(DEFAULT_SETTINGS.timerDefaultMinutes).toBe(45);
    });

    it('has auto-save enabled by default', () => {
      expect(DEFAULT_SETTINGS.autoSave).toBe(true);
    });

    it('has sound disabled by default', () => {
      expect(DEFAULT_SETTINGS.soundEnabled).toBe(false);
    });

    it('has notifications disabled by default', () => {
      expect(DEFAULT_SETTINGS.notifyDailyReminder).toBe(false);
      expect(DEFAULT_SETTINGS.notifyStreakAlert).toBe(false);
    });

    it('has correct default reminder time', () => {
      expect(DEFAULT_SETTINGS.reminderTime).toBe('09:00');
    });

    it('has pseudocode hint style by default', () => {
      expect(DEFAULT_SETTINGS.hintStyle).toBe('pseudocode');
    });

    it('has balanced detail level by default', () => {
      expect(DEFAULT_SETTINGS.detailLevel).toBe('balanced');
    });

    it('has all expected keys', () => {
      const keys = Object.keys(DEFAULT_SETTINGS).sort();
      expect(keys).toEqual([
        'autoSave',
        'detailLevel',
        'editorFontSize',
        'hintStyle',
        'language',
        'notifyDailyReminder',
        'notifyStreakAlert',
        'reminderTime',
        'soundEnabled',
        'theme',
        'timerDefaultMinutes',
        'timerEnabled',
      ]);
    });
  });

  // ── loadSettings ──

  describe('loadSettings', () => {
    it('returns defaults when localStorage is empty', () => {
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('reads from localStorage', () => {
      localStorageMock.setItem('sim-settings', JSON.stringify({ language: 'python' }));
      const settings = loadSettings();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('sim-settings');
      expect(settings.language).toBe('python');
    });

    it('merges partial saved settings with defaults', () => {
      localStorageMock.setItem('sim-settings', JSON.stringify({
        language: 'javascript',
        editorFontSize: 18,
      }));
      const settings = loadSettings();
      expect(settings.language).toBe('javascript');
      expect(settings.editorFontSize).toBe(18);
      // All other fields should be defaults
      expect(settings.timerEnabled).toBe(DEFAULT_SETTINGS.timerEnabled);
      expect(settings.autoSave).toBe(DEFAULT_SETTINGS.autoSave);
      expect(settings.hintStyle).toBe(DEFAULT_SETTINGS.hintStyle);
      expect(settings.detailLevel).toBe(DEFAULT_SETTINGS.detailLevel);
      expect(settings.reminderTime).toBe(DEFAULT_SETTINGS.reminderTime);
    });

    it('handles corrupted JSON gracefully', () => {
      localStorageMock.setItem('sim-settings', '{not valid json!!!');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('handles empty string in localStorage', () => {
      localStorageMock.setItem('sim-settings', '');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('preserves all overridden fields', () => {
      const custom: UserSettings = {
        language: 'python',
        editorFontSize: 20,
        timerEnabled: false,
        timerDefaultMinutes: 30,
        autoSave: false,
        soundEnabled: true,
        notifyDailyReminder: true,
        notifyStreakAlert: true,
        reminderTime: '08:00',
        hintStyle: 'analogies' as HintStyle,
        detailLevel: 'detailed' as DetailLevel,
        theme: 'warm',
      };
      localStorageMock.setItem('sim-settings', JSON.stringify(custom));
      const settings = loadSettings();
      expect(settings).toEqual(custom);
    });

    it('ignores unknown properties', () => {
      localStorageMock.setItem('sim-settings', JSON.stringify({
        language: 'python',
        unknownField: 'should be ignored',
      }));
      const settings = loadSettings();
      expect(settings.language).toBe('python');
      expect((settings as Record<string, unknown>)['unknownField']).toBe('should be ignored');
    });
  });

  // ── saveSettings ──

  describe('saveSettings', () => {
    it('saves to localStorage', () => {
      const custom: UserSettings = { ...DEFAULT_SETTINGS, language: 'python' };
      saveSettings(custom);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sim-settings',
        JSON.stringify(custom),
      );
    });

    it('round-trips through load', () => {
      const custom: UserSettings = {
        ...DEFAULT_SETTINGS,
        language: 'javascript',
        editorFontSize: 16,
        hintStyle: 'visual' as HintStyle,
        detailLevel: 'brief' as DetailLevel,
      };
      saveSettings(custom);
      const loaded = loadSettings();
      expect(loaded).toEqual(custom);
    });

    it('overwrites previous settings', () => {
      saveSettings({ ...DEFAULT_SETTINGS, language: 'python' });
      saveSettings({ ...DEFAULT_SETTINGS, language: 'javascript' });
      const loaded = loadSettings();
      expect(loaded.language).toBe('javascript');
    });
  });

  // ── getSettings ──

  describe('getSettings', () => {
    it('delegates to loadSettings', () => {
      const settings = getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns current saved settings', () => {
      localStorageMock.setItem('sim-settings', JSON.stringify({ editorFontSize: 22 }));
      const settings = getSettings();
      expect(settings.editorFontSize).toBe(22);
      expect(settings.language).toBe('typescript');
    });
  });
});

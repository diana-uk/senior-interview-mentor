import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPanel from '../SettingsPanel';
import type { UserSettings } from '../../../utils/settings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'midnight',
  language: 'typescript',
  editorFontSize: 14,
  autoSave: true,
  timerEnabled: true,
  timerDefaultMinutes: 45,
  soundEnabled: false,
  notifyDailyReminder: false,
  notifyStreakAlert: false,
  reminderTime: '09:00',
  hintStyle: 'pseudocode',
  detailLevel: 'balanced',
};

const mockLoadSettings = vi.fn(() => ({ ...DEFAULT_SETTINGS }));
const mockSaveSettings = vi.fn();

vi.mock('../../../utils/settings', () => ({
  loadSettings: () => mockLoadSettings(),
  saveSettings: (...args: unknown[]) => mockSaveSettings(...args),
}));

const mockSafeGetItem = vi.fn(() => null);
const mockSafeRemoveItem = vi.fn();

vi.mock('../../../utils/storage.js', () => ({
  safeGetItem: (...args: unknown[]) => mockSafeGetItem(...args),
  safeRemoveItem: (...args: unknown[]) => mockSafeRemoveItem(...args),
}));

const mockShowToast = vi.fn();
vi.mock('../../../utils/toast.js', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

// Stub URL methods for Export All Data button
const mockCreateObjectURL = vi.fn(() => 'blob:mock');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  mockLoadSettings.mockReturnValue({ ...DEFAULT_SETTINGS });
  mockSaveSettings.mockClear();
  mockSafeGetItem.mockReturnValue(null);
  mockSafeRemoveItem.mockClear();
  mockShowToast.mockClear();
  mockCreateObjectURL.mockReturnValue('blob:mock');
  mockRevokeObjectURL.mockClear();
  Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true });
  Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true });
});

describe('SettingsPanel', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<SettingsPanel />)).not.toThrow();
    });

    it('shows Appearance section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Appearance')).toBeDefined();
    });

    it('shows Language section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Language')).toBeDefined();
    });

    it('shows Editor section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Editor')).toBeDefined();
    });

    it('shows Timer section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Timer')).toBeDefined();
    });

    it('shows AI Memory section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('AI Memory')).toBeDefined();
    });

    it('shows Data section label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Data')).toBeDefined();
    });
  });

  describe('theme buttons', () => {
    it('renders all 4 theme buttons', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'Midnight' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Daylight' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'OLED Black' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Warm Night' })).toBeDefined();
    });

    it('active theme button has aria-pressed="true"', () => {
      render(<SettingsPanel />);
      const midnight = screen.getByRole('button', { name: 'Midnight' });
      expect(midnight.getAttribute('aria-pressed')).toBe('true');
    });

    it('inactive theme buttons have aria-pressed="false"', () => {
      render(<SettingsPanel />);
      const daylight = screen.getByRole('button', { name: 'Daylight' });
      expect(daylight.getAttribute('aria-pressed')).toBe('false');
    });

    it('shows description for active midnight theme', () => {
      render(<SettingsPanel />);
      expect(screen.getByText(/Default dark theme with cool neon accents/)).toBeDefined();
    });

    it('clicking Daylight updates aria-pressed', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Daylight' }));
      expect(screen.getByRole('button', { name: 'Daylight' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'Midnight' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('language buttons', () => {
    it('renders TypeScript, JavaScript, Python buttons', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'TypeScript' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'JavaScript' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Python' })).toBeDefined();
    });

    it('active language button has aria-pressed="true"', () => {
      render(<SettingsPanel />);
      const ts = screen.getByRole('button', { name: 'TypeScript' });
      expect(ts.getAttribute('aria-pressed')).toBe('true');
    });

    it('inactive language button has aria-pressed="false"', () => {
      render(<SettingsPanel />);
      const py = screen.getByRole('button', { name: 'Python' });
      expect(py.getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking Python sets it as active', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Python' }));
      expect(screen.getByRole('button', { name: 'Python' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'TypeScript' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('editor settings', () => {
    it('renders font size slider with id', () => {
      render(<SettingsPanel />);
      const slider = document.getElementById('font-size-slider');
      expect(slider).not.toBeNull();
    });

    it('font size slider shows default value 14', () => {
      render(<SettingsPanel />);
      expect(screen.getByText(/Font Size: 14px/)).toBeDefined();
    });

    it('auto-save switch is present', () => {
      render(<SettingsPanel />);
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('auto-save switch shows ON when autoSave is true', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Auto-save session')).toBeDefined();
      // The switch button nearest to auto-save label shows ON
      const switchBtns = screen.getAllByRole('switch');
      // autoSave=true → at least one switch is aria-checked="true" and shows "ON"
      const onSwitch = switchBtns.find((b) => b.getAttribute('aria-checked') === 'true');
      expect(onSwitch).toBeDefined();
    });

    it('clicking auto-save switch toggles it OFF', () => {
      render(<SettingsPanel />);
      // Find the switch for auto-save (aria-checked=true initially, since autoSave=true)
      // It's the first role=switch that is checked true in the editor section
      // We find it by finding the one adjacent to "Auto-save session" text
      const label = screen.getByText('Auto-save session');
      // The switch is sibling of this span — get the parent row's button
      const switchBtn = label.closest('div')!.querySelector('[role="switch"]') as HTMLElement;
      expect(switchBtn.getAttribute('aria-checked')).toBe('true');
      fireEvent.click(switchBtn);
      expect(switchBtn.getAttribute('aria-checked')).toBe('false');
    });
  });

  describe('timer settings', () => {
    it('shows Show timer label', () => {
      render(<SettingsPanel />);
      expect(screen.getByText('Show timer')).toBeDefined();
    });

    it('renders timer duration slider with id', () => {
      render(<SettingsPanel />);
      const slider = document.getElementById('timer-duration-slider');
      expect(slider).not.toBeNull();
    });

    it('timer duration label shows 45 min default', () => {
      render(<SettingsPanel />);
      expect(screen.getByText(/Default duration: 45 min/)).toBeDefined();
    });
  });

  describe('hint style buttons', () => {
    it('renders all 4 hint style buttons', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'Analogies' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Pseudocode' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Visual' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Direct' })).toBeDefined();
    });

    it('active hint style (pseudocode) has aria-pressed="true"', () => {
      render(<SettingsPanel />);
      const pseudocode = screen.getByRole('button', { name: 'Pseudocode' });
      expect(pseudocode.getAttribute('aria-pressed')).toBe('true');
    });

    it('inactive hint style buttons have aria-pressed="false"', () => {
      render(<SettingsPanel />);
      const analogies = screen.getByRole('button', { name: 'Analogies' });
      expect(analogies.getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking Analogies sets it as active', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Analogies' }));
      expect(screen.getByRole('button', { name: 'Analogies' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'Pseudocode' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('detail level buttons', () => {
    it('renders Brief, Balanced, Detailed buttons', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'Brief' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Balanced' })).toBeDefined();
      expect(screen.getByRole('button', { name: 'Detailed' })).toBeDefined();
    });

    it('active detail level (balanced) has aria-pressed="true"', () => {
      render(<SettingsPanel />);
      const balanced = screen.getByRole('button', { name: 'Balanced' });
      expect(balanced.getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking Brief sets it as active', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Brief' }));
      expect(screen.getByRole('button', { name: 'Brief' }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('button', { name: 'Balanced' }).getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Export All Data', () => {
    it('renders Export All Data button', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'Export All Data' })).toBeDefined();
    });

    it('clicking Export All Data calls URL.createObjectURL', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Export All Data' }));
      expect(mockCreateObjectURL).toHaveBeenCalledOnce();
    });

    it('clicking Export All Data calls showToast with success', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Export All Data' }));
      expect(mockShowToast).toHaveBeenCalledWith('Data exported successfully', 'success', 3000);
    });

    it('clicking Export All Data calls URL.revokeObjectURL', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Export All Data' }));
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock');
    });
  });

  describe('Reset All Data modal', () => {
    it('renders Reset All Data button', () => {
      render(<SettingsPanel />);
      expect(screen.getByRole('button', { name: 'Reset All Data' })).toBeDefined();
    });

    it('modal is not shown by default', () => {
      render(<SettingsPanel />);
      expect(screen.queryByText(/This will permanently delete/)).toBeNull();
    });

    it('clicking Reset All Data opens modal', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      expect(screen.getByText(/This will permanently delete/)).toBeDefined();
    });

    it('modal has confirm input with placeholder', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      expect(screen.getByPlaceholderText(/Type "RESET" to confirm/)).toBeDefined();
    });

    it('Delete Everything button is disabled when input is empty', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      const deleteBtn = screen.getByRole('button', { name: 'Delete Everything' });
      expect(deleteBtn.hasAttribute('disabled')).toBe(true);
    });

    it('Delete Everything button is disabled when input is wrong', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      fireEvent.change(screen.getByPlaceholderText(/Type "RESET" to confirm/), { target: { value: 'reset' } });
      const deleteBtn = screen.getByRole('button', { name: 'Delete Everything' });
      expect(deleteBtn.hasAttribute('disabled')).toBe(true);
    });

    it('Delete Everything button is enabled when input is "RESET"', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      fireEvent.change(screen.getByPlaceholderText(/Type "RESET" to confirm/), { target: { value: 'RESET' } });
      const deleteBtn = screen.getByRole('button', { name: 'Delete Everything' });
      expect(deleteBtn.hasAttribute('disabled')).toBe(false);
    });

    it('clicking Cancel closes modal', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByText(/This will permanently delete/)).toBeNull();
    });

    it('clicking Close button closes modal', () => {
      render(<SettingsPanel />);
      fireEvent.click(screen.getByRole('button', { name: 'Reset All Data' }));
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByText(/This will permanently delete/)).toBeNull();
    });
  });

  describe('onSettingsChange callback', () => {
    it('calls onSettingsChange when language changes', () => {
      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Python' }));
      expect(onSettingsChange).toHaveBeenCalled();
      const lastCall = onSettingsChange.mock.calls.at(-1)?.[0] as UserSettings;
      expect(lastCall.language).toBe('python');
    });

    it('calls onSettingsChange when theme changes', () => {
      const onSettingsChange = vi.fn();
      render(<SettingsPanel onSettingsChange={onSettingsChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Daylight' }));
      expect(onSettingsChange).toHaveBeenCalled();
      const lastCall = onSettingsChange.mock.calls.at(-1)?.[0] as UserSettings;
      expect(lastCall.theme).toBe('daylight');
    });
  });
});

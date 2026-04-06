import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VoiceButton from '../VoiceButton';

vi.mock('lucide-react', () => ({
  Mic: () => <span data-testid="icon-mic" />,
  MicOff: () => <span data-testid="icon-mic-off" />,
}));

// Default mock state for useSpeechRecognition
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockReset = vi.fn();

let mockState = {
  isListening: false,
  isSupported: true,
  transcript: '',
  finalTranscript: '',
  start: mockStart,
  stop: mockStop,
  reset: mockReset,
};

vi.mock('../../../hooks/useSpeechRecognition', () => ({
  useSpeechRecognition: () => mockState,
}));

vi.mock('../../../utils/fillerDetector', () => ({
  detectFillers: (text: string) => ({
    totalFillers: text.includes('um') ? 2 : 0,
    rate: 0,
    fillers: [],
  }),
}));

beforeEach(() => {
  mockStart.mockClear();
  mockStop.mockClear();
  mockReset.mockClear();
  mockState = {
    isListening: false,
    isSupported: true,
    transcript: '',
    finalTranscript: '',
    start: mockStart,
    stop: mockStop,
    reset: mockReset,
  };
});

const BASE_PROPS = {
  onTranscript: vi.fn(),
  onFillerUpdate: vi.fn(),
};

describe('VoiceButton', () => {
  describe('unsupported state', () => {
    beforeEach(() => {
      mockState = { ...mockState, isSupported: false };
    });

    it('renders MicOff icon when speech not supported', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByTestId('icon-mic-off')).toBeDefined();
    });

    it('button is disabled when not supported', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      const btn = screen.getByRole('button');
      expect(btn.hasAttribute('disabled')).toBe(true);
    });

    it('button has aria-label "Speech not supported"', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Speech not supported');
    });

    it('button has voice-btn--unsupported class', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').classList.contains('voice-btn--unsupported')).toBe(true);
    });
  });

  describe('idle state (supported, not listening)', () => {
    it('renders Mic icon when idle', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByTestId('icon-mic')).toBeDefined();
    });

    it('button has aria-label "Start voice input"', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Start voice input');
    });

    it('button does not have voice-btn--listening class when idle', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').classList.contains('voice-btn--listening')).toBe(false);
    });

    it('button has voice-btn class', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').classList.contains('voice-btn')).toBe(true);
    });

    it('no filler badge shown when idle', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.queryByText('2')).toBeNull();
    });
  });

  describe('listening state', () => {
    beforeEach(() => {
      mockState = { ...mockState, isListening: true };
    });

    it('button has voice-btn--listening class', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').classList.contains('voice-btn--listening')).toBe(true);
    });

    it('button has aria-label "Stop recording"', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Stop recording');
    });

    it('shows filler badge when listening and fillers detected', () => {
      mockState = { ...mockState, isListening: true, transcript: 'um well um' };
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.getByText('2')).toBeDefined();
    });

    it('filler badge has voice-btn__badge class', () => {
      mockState = { ...mockState, isListening: true, transcript: 'um well um' };
      render(<VoiceButton {...BASE_PROPS} />);
      const badge = screen.getByText('2');
      expect(badge.classList.contains('voice-btn__badge')).toBe(true);
    });

    it('no filler badge when transcript has no fillers', () => {
      mockState = { ...mockState, isListening: true, transcript: 'clean speech' };
      render(<VoiceButton {...BASE_PROPS} />);
      expect(screen.queryByText('0')).toBeNull();
    });
  });

  describe('click handlers', () => {
    it('clicking idle button calls reset then start', () => {
      render(<VoiceButton {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockReset).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
    });

    it('clicking listening button calls stop', () => {
      mockState = { ...mockState, isListening: true, finalTranscript: '' };
      render(<VoiceButton {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockStop).toHaveBeenCalled();
    });

    it('clicking listening button calls reset', () => {
      mockState = { ...mockState, isListening: true, finalTranscript: '' };
      render(<VoiceButton {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockReset).toHaveBeenCalled();
    });

    it('onTranscript called with trimmed finalTranscript when stopping', () => {
      const onTranscript = vi.fn();
      mockState = { ...mockState, isListening: true, finalTranscript: '  my answer  ' };
      render(<VoiceButton {...BASE_PROPS} onTranscript={onTranscript} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onTranscript).toHaveBeenCalledWith('my answer');
    });

    it('onTranscript not called when finalTranscript is empty', () => {
      const onTranscript = vi.fn();
      mockState = { ...mockState, isListening: true, finalTranscript: '' };
      render(<VoiceButton {...BASE_PROPS} onTranscript={onTranscript} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onTranscript).not.toHaveBeenCalled();
    });
  });

  describe('disabled prop', () => {
    it('button is disabled when disabled=true', () => {
      render(<VoiceButton {...BASE_PROPS} disabled={true} />);
      expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    });

    it('button is not disabled when disabled=false', () => {
      render(<VoiceButton {...BASE_PROPS} disabled={false} />);
      expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false);
    });
  });
});

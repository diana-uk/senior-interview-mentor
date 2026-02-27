import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { detectFillers, type FillerReport } from '../../utils/fillerDetector';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onFillerUpdate: (report: FillerReport) => void;
  onLiveTranscript?: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, onFillerUpdate, onLiveTranscript, onListeningChange, disabled }: VoiceButtonProps) {
  const { isListening, isSupported, transcript, finalTranscript, start, stop, reset } =
    useSpeechRecognition();
  const resetCounterRef = useRef(0);

  // Derive filler count from transcript (pure computation)
  const fillerReport = useMemo(() =>
    transcript ? detectFillers(transcript) : null,
    [transcript],
  );
  const fillerCount = fillerReport?.totalFillers ?? 0;

  // Push live transcript to parent for real-time preview
  useEffect(() => {
    onLiveTranscript?.(transcript);
  }, [transcript, onLiveTranscript]);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  // Notify parent of filler updates
  const prevTranscriptRef = useRef(transcript);
  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current && fillerReport) {
      onFillerUpdate(fillerReport);
    }
    prevTranscriptRef.current = transcript;
  }, [transcript, fillerReport, onFillerUpdate]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stop();
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
      reset();
      resetCounterRef.current++;
    } else {
      reset();
      resetCounterRef.current++;
      start();
    }
  }, [isListening, finalTranscript, start, stop, reset, onTranscript]);

  if (!isSupported) {
    return (
      <button type="button" className="voice-btn voice-btn--unsupported" disabled aria-label="Speech not supported" title="Speech not supported in this browser">
        <MicOff size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`voice-btn ${isListening ? 'voice-btn--listening' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      <Mic size={16} aria-hidden="true" />
      {isListening && fillerCount > 0 && (
        <span className="voice-btn__badge">{fillerCount}</span>
      )}
    </button>
  );
}

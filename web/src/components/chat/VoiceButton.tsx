import { useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { detectFillers, type FillerReport } from '../../utils/fillerDetector';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  onFillerUpdate: (report: FillerReport) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, onFillerUpdate, disabled }: VoiceButtonProps) {
  const { isListening, isSupported, transcript, finalTranscript, start, stop, reset } =
    useSpeechRecognition();
  const fillerCountRef = useRef(0);

  // Run filler detection on each transcript update
  useEffect(() => {
    if (!transcript) return;
    const report = detectFillers(transcript);
    fillerCountRef.current = report.totalFillers;
    onFillerUpdate(report);
  }, [transcript, onFillerUpdate]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stop();
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
      reset();
      fillerCountRef.current = 0;
    } else {
      reset();
      fillerCountRef.current = 0;
      start();
    }
  }, [isListening, finalTranscript, start, stop, reset, onTranscript]);

  if (!isSupported) {
    return (
      <button className="voice-btn voice-btn--unsupported" disabled title="Speech not supported in this browser">
        <MicOff size={16} />
      </button>
    );
  }

  return (
    <button
      className={`voice-btn ${isListening ? 'voice-btn--listening' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      <Mic size={16} />
      {isListening && fillerCountRef.current > 0 && (
        <span className="voice-btn__badge">{fillerCountRef.current}</span>
      )}
    </button>
  );
}

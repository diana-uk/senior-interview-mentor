import { useState, useRef, useCallback } from 'react';
import { readSession, clearSession as clearStorage, createDebouncedSave } from './useSessionStorage';
import type {
  ChatMessage,
  CommitmentGateItem,
  EditorTab,
  HintLevel,
  InterviewStage,
  Mode,
  Problem,
  SystemDesignState,
  SystemDesignTopicId,
  TechnicalQuestionCategory,
} from '../types';
import { serializeMessages, deserializeMessages } from '../utils/sessionUtils.js';
import type { PersistedMessage } from '../utils/sessionUtils.js';

export interface PersistedSession {
  mode: Mode;
  currentProblem: Problem | null;
  editorTab: EditorTab;
  hintsUsed: number;
  timerSeconds: number;
  timerRunning: boolean;
  editorCode: string;
  testCode: string;
  notes: string;
  commitmentGate: CommitmentGateItem[];
  hints: HintLevel[];
  interviewStage: InterviewStage | null;
  interviewCategory: TechnicalQuestionCategory | null;
  sdTopicId: SystemDesignTopicId | null;
  sdState: SystemDesignState;
  messages: PersistedMessage[];
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEBOUNCE_MS = 800;

export function useSessionPersistence() {
  // Read once on mount via lazy useState initializer (avoids ref access in render)
  const [restored] = useState<PersistedSession | null>(() =>
    readSession<PersistedSession>(MAX_AGE_MS)
  );

  const debouncedSave = useRef(createDebouncedSave<PersistedSession>(DEBOUNCE_MS)).current;

  const saveSession = useCallback(
    (snapshot: Omit<PersistedSession, 'messages'> & { messages: ChatMessage[] }): void => {
      debouncedSave({
        ...snapshot,
        messages: serializeMessages(snapshot.messages),
      });
    },
    [debouncedSave],
  );

  return {
    restored,
    restoreMessages: deserializeMessages,
    saveSession,
    clearSession: clearStorage,
  };
}

import { useReducer, useCallback } from 'react';
import type { SystemDesignState } from '../types';
import {
  PHASE_ORDER,
  initialSystemDesignState,
  systemDesignReducer,
} from '../utils/systemDesignStateUtils.js';

export function useSystemDesignState(restoredState?: SystemDesignState) {
  const [sdState, sdDispatch] = useReducer(
    systemDesignReducer,
    restoredState ?? initialSystemDesignState,
  );

  const advancePhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(sdState.currentPhase);
    if (idx < PHASE_ORDER.length - 1) {
      sdDispatch({ type: 'SET_PHASE', phase: PHASE_ORDER[idx + 1] });
    }
  }, [sdState.currentPhase]);

  return { sdState, sdDispatch, advancePhase, PHASE_ORDER };
}

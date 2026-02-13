import { useReducer, useCallback } from 'react';
import type {
  SystemDesignState,
  SystemDesignAction,
  SystemDesignPhase,
  PhaseStatus,
} from '../types';

const PHASE_ORDER: SystemDesignPhase[] = [
  'overview',
  'requirements',
  'api',
  'data',
  'architecture',
  'deepdive',
  'scaling',
];

function defaultPhaseStatuses(): Record<SystemDesignPhase, PhaseStatus> {
  return {
    overview: 'pending',
    requirements: 'locked',
    api: 'locked',
    data: 'locked',
    architecture: 'locked',
    deepdive: 'locked',
    scaling: 'locked',
  };
}

const initialState: SystemDesignState = {
  active: false,
  currentPhase: 'overview',
  phaseStatuses: defaultPhaseStatuses(),
  topicTitle: '',
  topicPrompt: '',
  endpoints: [],
  schema: '',
  dbChoice: '',
  dbJustification: '',
};

function reducer(state: SystemDesignState, action: SystemDesignAction): SystemDesignState {
  switch (action.type) {
    case 'INIT':
      return {
        ...initialState,
        active: true,
        currentPhase: 'overview',
        phaseStatuses: {
          overview: 'in-progress',
          requirements: 'pending',
          api: 'pending',
          data: 'pending',
          architecture: 'locked',
          deepdive: 'locked',
          scaling: 'locked',
        },
        topicTitle: action.topicTitle,
        topicPrompt: action.topicPrompt,
      };

    case 'SET_PHASE': {
      const newStatuses = { ...state.phaseStatuses };
      // Mark the current phase as completed if we're moving forward
      const currentIdx = PHASE_ORDER.indexOf(state.currentPhase);
      const nextIdx = PHASE_ORDER.indexOf(action.phase);
      if (nextIdx > currentIdx && state.phaseStatuses[state.currentPhase] === 'in-progress') {
        newStatuses[state.currentPhase] = 'completed';
      }
      // Mark the target phase as in-progress
      if (newStatuses[action.phase] !== 'completed') {
        newStatuses[action.phase] = 'in-progress';
      }
      // Unlock the next phase after the target
      const targetIdx = PHASE_ORDER.indexOf(action.phase);
      if (targetIdx + 1 < PHASE_ORDER.length) {
        const nextPhase = PHASE_ORDER[targetIdx + 1];
        if (newStatuses[nextPhase] === 'locked') {
          newStatuses[nextPhase] = 'pending';
        }
      }
      return {
        ...state,
        currentPhase: action.phase,
        phaseStatuses: newStatuses,
      };
    }

    case 'SET_PHASE_STATUS':
      return {
        ...state,
        phaseStatuses: {
          ...state.phaseStatuses,
          [action.phase]: action.status,
        },
      };

    case 'UPDATE_ENDPOINTS':
      return { ...state, endpoints: action.endpoints };

    case 'UPDATE_SCHEMA':
      return { ...state, schema: action.schema };

    case 'UPDATE_DB_CHOICE':
      return { ...state, dbChoice: action.dbChoice };

    case 'UPDATE_JUSTIFICATION':
      return { ...state, dbJustification: action.justification };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useSystemDesignState(restoredState?: SystemDesignState) {
  const [sdState, sdDispatch] = useReducer(reducer, restoredState ?? initialState);

  const advancePhase = useCallback(() => {
    const idx = PHASE_ORDER.indexOf(sdState.currentPhase);
    if (idx < PHASE_ORDER.length - 1) {
      sdDispatch({ type: 'SET_PHASE', phase: PHASE_ORDER[idx + 1] });
    }
  }, [sdState.currentPhase]);

  return { sdState, sdDispatch, advancePhase, PHASE_ORDER };
}

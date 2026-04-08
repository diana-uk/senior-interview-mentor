import type {
  SystemDesignState,
  SystemDesignAction,
  SystemDesignPhase,
  PhaseStatus,
  ScalingState,
} from '../types';

export const PHASE_ORDER: SystemDesignPhase[] = [
  'overview',
  'requirements',
  'api',
  'data',
  'architecture',
  'deepdive',
  'scaling',
];

export function defaultPhaseStatuses(): Record<SystemDesignPhase, PhaseStatus> {
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

export function defaultScaling(): ScalingState {
  return {
    capacity: {
      readQps: '',
      writeQps: '',
      storageDayGb: '',
      storageGrowthTbYr: '',
      bandwidthMbS: '',
      cacheMemGb: '',
    },
    computeStrategy: '',
    computeDetails: '',
    dbReplication: '',
    dbSharding: '',
    dbShardKey: '',
    dbDetails: '',
    cachePattern: '',
    evictionPolicy: '',
    cacheTtl: '',
    cacheDetails: '',
    lbAlgorithm: '',
    useCdn: false,
    lbDetails: '',
    reliabilityChecks: [],
    metrics: [],
    alertingDetails: '',
  };
}

export const initialSystemDesignState: SystemDesignState = {
  active: false,
  currentPhase: 'overview',
  phaseStatuses: defaultPhaseStatuses(),
  topicTitle: '',
  topicPrompt: '',
  endpoints: [],
  schema: '',
  dbChoice: '',
  dbJustification: '',
  diagramNodes: [],
  diagramEdges: [],
  deepDiveChallenges: [],
  scaling: defaultScaling(),
};

export function systemDesignReducer(
  state: SystemDesignState,
  action: SystemDesignAction,
): SystemDesignState {
  switch (action.type) {
    case 'INIT':
      return {
        ...initialSystemDesignState,
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
        deepDiveChallenges: [],
        scaling: defaultScaling(),
      };

    case 'SET_PHASE': {
      const newStatuses = { ...state.phaseStatuses };
      const currentIdx = PHASE_ORDER.indexOf(state.currentPhase);
      const nextIdx = PHASE_ORDER.indexOf(action.phase);
      if (nextIdx > currentIdx && state.phaseStatuses[state.currentPhase] === 'in-progress') {
        newStatuses[state.currentPhase] = 'completed';
      }
      if (newStatuses[action.phase] !== 'completed') {
        newStatuses[action.phase] = 'in-progress';
      }
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

    case 'UPDATE_DIAGRAM':
      return { ...state, diagramNodes: action.nodes, diagramEdges: action.edges };

    case 'UPDATE_DEEP_DIVES':
      return { ...state, deepDiveChallenges: action.challenges };

    case 'UPDATE_SCALING':
      return { ...state, scaling: action.scaling };

    case 'RESET':
      return initialSystemDesignState;

    default:
      return state;
  }
}

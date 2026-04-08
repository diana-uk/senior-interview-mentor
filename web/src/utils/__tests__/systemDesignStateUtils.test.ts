import { describe, it, expect } from 'vitest';
import {
  PHASE_ORDER,
  defaultPhaseStatuses,
  defaultScaling,
  initialSystemDesignState,
  systemDesignReducer,
} from '../systemDesignStateUtils';

// ─── PHASE_ORDER ──────────────────────────────────────────────────────────────

describe('PHASE_ORDER', () => {
  it('starts with overview', () => {
    expect(PHASE_ORDER[0]).toBe('overview');
  });

  it('ends with scaling', () => {
    expect(PHASE_ORDER[PHASE_ORDER.length - 1]).toBe('scaling');
  });

  it('has 7 phases', () => {
    expect(PHASE_ORDER).toHaveLength(7);
  });
});

// ─── defaultPhaseStatuses ─────────────────────────────────────────────────────

describe('defaultPhaseStatuses', () => {
  it('returns overview as pending', () => {
    expect(defaultPhaseStatuses().overview).toBe('pending');
  });

  it('returns all non-overview phases as locked', () => {
    const s = defaultPhaseStatuses();
    for (const phase of PHASE_ORDER.slice(1)) {
      expect(s[phase]).toBe('locked');
    }
  });

  it('returns a new object on each call', () => {
    expect(defaultPhaseStatuses()).not.toBe(defaultPhaseStatuses());
  });
});

// ─── defaultScaling ───────────────────────────────────────────────────────────

describe('defaultScaling', () => {
  it('has all capacity fields as empty strings', () => {
    const s = defaultScaling();
    const { readQps, writeQps, storageDayGb, storageGrowthTbYr, bandwidthMbS, cacheMemGb } = s.capacity;
    expect([readQps, writeQps, storageDayGb, storageGrowthTbYr, bandwidthMbS, cacheMemGb]).toEqual(
      ['', '', '', '', '', ''],
    );
  });

  it('has useCdn as false', () => {
    expect(defaultScaling().useCdn).toBe(false);
  });

  it('has reliabilityChecks and metrics as empty arrays', () => {
    const s = defaultScaling();
    expect(s.reliabilityChecks).toEqual([]);
    expect(s.metrics).toEqual([]);
  });

  it('returns a new object on each call', () => {
    expect(defaultScaling()).not.toBe(defaultScaling());
  });
});

// ─── initialSystemDesignState ─────────────────────────────────────────────────

describe('initialSystemDesignState', () => {
  it('is inactive', () => {
    expect(initialSystemDesignState.active).toBe(false);
  });

  it('starts at overview phase', () => {
    expect(initialSystemDesignState.currentPhase).toBe('overview');
  });
});

// ─── systemDesignReducer ──────────────────────────────────────────────────────

function makeState(overrides: Partial<typeof initialSystemDesignState> = {}) {
  return { ...initialSystemDesignState, ...overrides };
}

describe('systemDesignReducer — INIT', () => {
  const action = { type: 'INIT' as const, topicTitle: 'Design Twitter', topicPrompt: 'prompt text' };

  it('sets active to true', () => {
    expect(systemDesignReducer(makeState(), action).active).toBe(true);
  });

  it('sets topicTitle', () => {
    expect(systemDesignReducer(makeState(), action).topicTitle).toBe('Design Twitter');
  });

  it('sets topicPrompt', () => {
    expect(systemDesignReducer(makeState(), action).topicPrompt).toBe('prompt text');
  });

  it('sets overview phase to in-progress', () => {
    expect(systemDesignReducer(makeState(), action).phaseStatuses.overview).toBe('in-progress');
  });

  it('sets architecture/deepdive/scaling to locked', () => {
    const s = systemDesignReducer(makeState(), action);
    expect(s.phaseStatuses.architecture).toBe('locked');
    expect(s.phaseStatuses.deepdive).toBe('locked');
    expect(s.phaseStatuses.scaling).toBe('locked');
  });

  it('resets deepDiveChallenges to empty', () => {
    const s = makeState({ deepDiveChallenges: [{ id: 'c1', title: 'c', chosen: true, description: '', approach: '', tradeoffs: '' }] });
    expect(systemDesignReducer(s, action).deepDiveChallenges).toEqual([]);
  });
});

describe('systemDesignReducer — SET_PHASE', () => {
  it('updates currentPhase', () => {
    const s = makeState({ active: true, currentPhase: 'overview' });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'requirements' });
    expect(result.currentPhase).toBe('requirements');
  });

  it('marks current in-progress phase as completed when moving forward', () => {
    const s = makeState({
      active: true,
      currentPhase: 'overview',
      phaseStatuses: { ...defaultPhaseStatuses(), overview: 'in-progress' },
    });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'requirements' });
    expect(result.phaseStatuses.overview).toBe('completed');
  });

  it('does not mark current phase as completed when moving backward', () => {
    const s = makeState({
      active: true,
      currentPhase: 'requirements',
      phaseStatuses: { ...defaultPhaseStatuses(), overview: 'completed', requirements: 'in-progress' },
    });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'overview' });
    expect(result.phaseStatuses.requirements).toBe('in-progress');
  });

  it('marks target phase as in-progress', () => {
    const s = makeState({
      active: true,
      currentPhase: 'overview',
      phaseStatuses: { ...defaultPhaseStatuses(), overview: 'in-progress' },
    });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'requirements' });
    expect(result.phaseStatuses.requirements).toBe('in-progress');
  });

  it('does not overwrite target if already completed', () => {
    const s = makeState({
      active: true,
      currentPhase: 'api',
      phaseStatuses: { ...defaultPhaseStatuses(), overview: 'completed', requirements: 'completed', api: 'in-progress' },
    });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'requirements' });
    expect(result.phaseStatuses.requirements).toBe('completed');
  });

  it('unlocks the phase after the target if it was locked', () => {
    const s = makeState({
      active: true,
      currentPhase: 'overview',
      phaseStatuses: { ...defaultPhaseStatuses(), overview: 'in-progress', requirements: 'locked' },
    });
    const result = systemDesignReducer(s, { type: 'SET_PHASE', phase: 'requirements' });
    expect(result.phaseStatuses.api).toBe('pending');
  });
});

describe('systemDesignReducer — SET_PHASE_STATUS', () => {
  it('updates the specified phase status', () => {
    const s = makeState();
    const result = systemDesignReducer(s, { type: 'SET_PHASE_STATUS', phase: 'api', status: 'completed' });
    expect(result.phaseStatuses.api).toBe('completed');
  });

  it('does not affect other phases', () => {
    const s = makeState();
    const result = systemDesignReducer(s, { type: 'SET_PHASE_STATUS', phase: 'api', status: 'completed' });
    expect(result.phaseStatuses.overview).toBe(s.phaseStatuses.overview);
  });
});

describe('systemDesignReducer — data updates', () => {
  it('UPDATE_ENDPOINTS replaces endpoints', () => {
    const endpoints = [{ id: 'e1', method: 'GET' as const, path: '/users', description: '', request: '', response: '', auth: false }];
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_ENDPOINTS', endpoints });
    expect(result.endpoints).toBe(endpoints);
  });

  it('UPDATE_SCHEMA replaces schema', () => {
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_SCHEMA', schema: 'CREATE TABLE...' });
    expect(result.schema).toBe('CREATE TABLE...');
  });

  it('UPDATE_DB_CHOICE replaces dbChoice', () => {
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_DB_CHOICE', dbChoice: 'PostgreSQL' });
    expect(result.dbChoice).toBe('PostgreSQL');
  });

  it('UPDATE_JUSTIFICATION replaces dbJustification', () => {
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_JUSTIFICATION', justification: 'Because relational' });
    expect(result.dbJustification).toBe('Because relational');
  });

  it('UPDATE_DIAGRAM replaces nodes and edges', () => {
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_DIAGRAM', nodes: [], edges: [] });
    expect(result.diagramNodes).toEqual([]);
    expect(result.diagramEdges).toEqual([]);
  });

  it('UPDATE_DEEP_DIVES replaces challenges', () => {
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_DEEP_DIVES', challenges: [] });
    expect(result.deepDiveChallenges).toEqual([]);
  });

  it('UPDATE_SCALING replaces scaling', () => {
    const scaling = defaultScaling();
    const result = systemDesignReducer(makeState(), { type: 'UPDATE_SCALING', scaling });
    expect(result.scaling).toBe(scaling);
  });
});

describe('systemDesignReducer — RESET', () => {
  it('returns initialSystemDesignState', () => {
    const s = makeState({ active: true, topicTitle: 'Design Twitter', schema: 'some schema' });
    const result = systemDesignReducer(s, { type: 'RESET' });
    expect(result).toBe(initialSystemDesignState);
  });
});

describe('systemDesignReducer — unknown action', () => {
  it('returns state unchanged for unknown action type', () => {
    const s = makeState();
    // @ts-expect-error intentional unknown action
    const result = systemDesignReducer(s, { type: 'UNKNOWN_ACTION' });
    expect(result).toBe(s);
  });
});

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemDesignState } from '../useSystemDesignState';

describe('useSystemDesignState', () => {
  it('starts with inactive initial state', () => {
    const { result } = renderHook(() => useSystemDesignState());
    expect(result.current.sdState.active).toBe(false);
    expect(result.current.sdState.currentPhase).toBe('overview');
    expect(result.current.sdState.topicTitle).toBe('');
  });

  it('INIT sets active state and topic', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'URL Shortener',
        topicPrompt: 'Design a URL shortener',
      });
    });
    expect(result.current.sdState.active).toBe(true);
    expect(result.current.sdState.topicTitle).toBe('URL Shortener');
    expect(result.current.sdState.topicPrompt).toBe('Design a URL shortener');
    expect(result.current.sdState.currentPhase).toBe('overview');
  });

  it('INIT sets overview to in-progress and requirements/api/data to pending', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test prompt',
      });
    });
    const statuses = result.current.sdState.phaseStatuses;
    expect(statuses.overview).toBe('in-progress');
    expect(statuses.requirements).toBe('pending');
    expect(statuses.api).toBe('pending');
    expect(statuses.data).toBe('pending');
    expect(statuses.architecture).toBe('locked');
    expect(statuses.deepdive).toBe('locked');
    expect(statuses.scaling).toBe('locked');
  });

  it('SET_PHASE advances phase and marks previous as completed', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    act(() => {
      result.current.sdDispatch({ type: 'SET_PHASE', phase: 'requirements' });
    });
    expect(result.current.sdState.currentPhase).toBe('requirements');
    expect(result.current.sdState.phaseStatuses.overview).toBe('completed');
    expect(result.current.sdState.phaseStatuses.requirements).toBe('in-progress');
  });

  it('SET_PHASE unlocks next phase', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    act(() => {
      result.current.sdDispatch({ type: 'SET_PHASE', phase: 'data' });
    });
    // 'architecture' (next after data) should be unlocked
    expect(result.current.sdState.phaseStatuses.architecture).toBe('pending');
  });

  it('advancePhase moves to the next phase', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    act(() => {
      result.current.advancePhase();
    });
    expect(result.current.sdState.currentPhase).toBe('requirements');
  });

  it('advancePhase does not go past scaling', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    // Advance through all phases
    for (let i = 0; i < 10; i++) {
      act(() => result.current.advancePhase());
    }
    expect(result.current.sdState.currentPhase).toBe('scaling');
  });

  it('SET_PHASE_STATUS updates a specific phase status', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    act(() => {
      result.current.sdDispatch({
        type: 'SET_PHASE_STATUS',
        phase: 'overview',
        status: 'completed',
      });
    });
    expect(result.current.sdState.phaseStatuses.overview).toBe('completed');
  });

  it('UPDATE_ENDPOINTS stores endpoints', () => {
    const { result } = renderHook(() => useSystemDesignState());
    const endpoints = [
      { id: '1', method: 'POST' as const, path: '/api/shorten', description: 'Shorten URL', requestBody: '{ url }', responseBody: '{ shortUrl }' },
    ];
    act(() => {
      result.current.sdDispatch({ type: 'UPDATE_ENDPOINTS', endpoints });
    });
    expect(result.current.sdState.endpoints).toEqual(endpoints);
  });

  it('UPDATE_SCHEMA stores schema', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({ type: 'UPDATE_SCHEMA', schema: 'CREATE TABLE urls...' });
    });
    expect(result.current.sdState.schema).toBe('CREATE TABLE urls...');
  });

  it('UPDATE_DB_CHOICE stores choice', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({ type: 'UPDATE_DB_CHOICE', dbChoice: 'sql' });
    });
    expect(result.current.sdState.dbChoice).toBe('sql');
  });

  it('RESET returns to initial state', () => {
    const { result } = renderHook(() => useSystemDesignState());
    act(() => {
      result.current.sdDispatch({
        type: 'INIT',
        topicTitle: 'Test',
        topicPrompt: 'Test',
      });
    });
    act(() => {
      result.current.sdDispatch({ type: 'RESET' });
    });
    expect(result.current.sdState.active).toBe(false);
    expect(result.current.sdState.topicTitle).toBe('');
  });

  it('accepts restored state', () => {
    const restored = {
      active: true,
      currentPhase: 'api' as const,
      phaseStatuses: {
        overview: 'completed' as const,
        requirements: 'completed' as const,
        api: 'in-progress' as const,
        data: 'pending' as const,
        architecture: 'locked' as const,
        deepdive: 'locked' as const,
        scaling: 'locked' as const,
      },
      topicTitle: 'Restored Topic',
      topicPrompt: 'Restored prompt',
      endpoints: [],
      schema: '',
      dbChoice: '' as const,
      dbJustification: '',
    };
    const { result } = renderHook(() => useSystemDesignState(restored));
    expect(result.current.sdState.active).toBe(true);
    expect(result.current.sdState.currentPhase).toBe('api');
    expect(result.current.sdState.topicTitle).toBe('Restored Topic');
  });

  it('PHASE_ORDER is exported and has 7 phases', () => {
    const { result } = renderHook(() => useSystemDesignState());
    expect(result.current.PHASE_ORDER).toHaveLength(7);
    expect(result.current.PHASE_ORDER[0]).toBe('overview');
    expect(result.current.PHASE_ORDER[6]).toBe('scaling');
  });
});
